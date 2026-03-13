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
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Missing Google Drive environment variables")
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  })
}

async function getOrCreateUserFolder(drive, userName) {
  const safeName = userName.replace(/[^\w\s-]/g, "")

  const search = await drive.files.list({
    q: `name='${safeName}' and mimeType='application/vnd.google-apps.folder' and '${ROOT_FOLDER_ID}' in parents and trashed=false`,
    fields: "files(id,name)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })

  if (search.data.files.length > 0) {
    return search.data.files[0].id
  }

  const folder = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name: safeName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [ROOT_FOLDER_ID],
    },
    fields: "id",
  })

  return folder.data.id
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

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

    console.log("Uploading file:", file.originalFilename)

    const auth = getAuthClient()
    const drive = google.drive({ version: "v3", auth })

    const userFolderId = await getOrCreateUserFolder(drive, userName)

    const response = await drive.files.create({
      supportsAllDrives: true,
      requestBody: {
        name: file.originalFilename || file.newFilename,
        parents: [userFolderId],
      },
      media: {
        mimeType: file.mimetype || "application/octet-stream",
        body: fs.createReadStream(file.filepath),
      },
      fields: "id",
    })

    const fileId = response.data.id

    await drive.permissions.create({
      fileId,
      supportsAllDrives: true,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    })

    fs.unlink(file.filepath, () => {})

    const fileUrl = `https://drive.google.com/file/d/${fileId}/view`

    return res.status(200).json({
      success: true,
      fileId,
      fileUrl,
    })
  } catch (error) {
    console.error("UPLOAD ERROR:", error)

    return res.status(500).json({
      error: "Upload failed",
      detail: error.message,
    })
  }
}