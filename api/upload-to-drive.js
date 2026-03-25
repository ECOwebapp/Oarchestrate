import { IncomingForm } from "formidable"
import fs from "fs"
import { google } from "googleapis"

export const config = {
  api: {
    bodyParser: false,
  },
}

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID

function getAuthClient() {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_REFRESH_TOKEN
  ) {
    throw new Error("Missing Google OAuth environment variables")
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  )

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  })

  return oauth2Client
}

async function getOrCreateUserFolder(drive, userName) {
  const safeName = userName.replace(/[^\w\s.\-]/g, "").trim() || "Unknown User"

  const search = await drive.files.list({
    q: `name='${safeName}' and mimeType='application/vnd.google-apps.folder' and '${ROOT_FOLDER_ID}' in parents and trashed=false`,
    fields: "files(id,name)",
  })

  if (search.data.files.length > 0) {
    return search.data.files[0].id
  }

  const folder = await drive.files.create({
    requestBody: {
      name: safeName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [ROOT_FOLDER_ID],
    },
    fields: "id",
  })

  return folder.data.id
}

async function findExistingFile(drive, folderId, fileName) {
  const search = await drive.files.list({
    q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
    fields: "files(id,name)",
  })

  return search.data.files.length > 0 ? search.data.files[0].id : null
}

// ── Extract a Drive file ID from a view URL ──────────────────────────────────
// Handles:
//   https://drive.google.com/file/d/FILE_ID/view
//   https://drive.google.com/open?id=FILE_ID
function extractFileId(url) {
  if (!url) return null
  // /file/d/FILE_ID/...
  const matchPath = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (matchPath) return matchPath[1]
  // ?id=FILE_ID
  const matchQuery = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (matchQuery) return matchQuery[1]
  return null
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()

  // ── DELETE: remove a file from Drive by its view URL ──────────────────────
  if (req.method === "DELETE") {
    try {
      // bodyParser is disabled, so read the raw body manually
      const raw = await new Promise((resolve, reject) => {
        let data = ""
        req.on("data", (chunk) => (data += chunk))
        req.on("end", () => resolve(data))
        req.on("error", reject)
      })

      const { fileUrl } = JSON.parse(raw || "{}")
      const fileId = extractFileId(fileUrl)

      if (!fileId) {
        return res.status(400).json({ error: "Invalid or missing fileUrl" })
      }

      const auth = getAuthClient()
      const drive = google.drive({ version: "v3", auth })

      // Permanently delete — use trash: true if you'd rather soft-delete
      await drive.files.delete({ fileId })

      return res.status(200).json({ success: true, deleted: fileId })
    } catch (error) {
      // 404 from Drive means the file was already gone — treat as success
      if (error?.code === 404 || error?.status === 404) {
        return res.status(200).json({ success: true, alreadyGone: true })
      }
      console.error("DELETE ERROR:", error)
      return res.status(500).json({ error: "Delete failed", detail: error.message })
    }
  }

  // ── POST: upload / replace a file ─────────────────────────────────────────
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  let filePath = null

  try {
    const form = new IncomingForm({
      keepExtensions: true,
      multiples: false,
      uploadDir: "/tmp",
    })

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    })

    const file = Array.isArray(files.file) ? files.file[0] : files.file
    const userName = Array.isArray(fields.userName)
      ? fields.userName[0]
      : fields.userName || "Unknown User"

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    // Keep the path so we can clean it up in finally
    filePath = file.filepath

    // Verify the temp file actually landed before streaming it
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: "Temp file missing after upload" })
    }

    const fileName = file.originalFilename || file.newFilename
    console.log(`Uploading file: ${fileName} for user: ${userName}`)

    const auth = getAuthClient()
    const drive = google.drive({ version: "v3", auth })

    const userFolderId = await getOrCreateUserFolder(drive, userName)
    const existingFileId = await findExistingFile(drive, userFolderId, fileName)

    let fileId

    if (existingFileId) {
      // ── REPLACE: update content in-place, permissions already exist ────────
      console.log(`File "${fileName}" exists (${existingFileId}), replacing...`)
      const updated = await drive.files.update({
        fileId: existingFileId,
        media: {
          mimeType: file.mimetype || "application/octet-stream",
          // Create a fresh stream — never reuse a stream reference
          body: fs.createReadStream(filePath),
        },
        fields: "id",
      })
      fileId = updated.data.id
    } else {
      // ── CREATE: new file + set public read permission ───────────────────────
      const created = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [userFolderId],
        },
        media: {
          mimeType: file.mimetype || "application/octet-stream",
          body: fs.createReadStream(filePath),
        },
        fields: "id",
      })
      fileId = created.data.id

      await drive.permissions.create({
        fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      })
    }

    return res.status(200).json({
      success: true,
      fileId,
      fileUrl: `https://drive.google.com/file/d/${fileId}/view`,
      replaced: !!existingFileId,
    })
  } catch (error) {
    console.error("UPLOAD ERROR:", error)
    return res.status(500).json({
      error: "Upload failed",
      detail: error.message,
    })
  } finally {
    // Always clean up the temp file, even on error
    if (filePath) {
      fs.unlink(filePath, (err) => {
        if (err) console.warn("Failed to clean up temp file:", err.message)
      })
    }
  }
}