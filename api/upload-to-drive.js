// api/upload-to-drive.js
// Vercel serverless function — deploy by pushing to your Vercel project

import { IncomingForm } from 'formidable'
import fs from 'fs'
import { google } from 'googleapis'

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
}

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID

function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
  return auth
}

async function getOrCreateUserFolder(drive, userName) {
  const search = await drive.files.list({
    q: `name='${userName}' and mimeType='application/vnd.google-apps.folder' and '${ROOT_FOLDER_ID}' in parents and trashed=false`,
    fields: 'files(id, name)',
  })

  if (search.data.files.length > 0) {
    return search.data.files[0].id
  }

  const folder = await drive.files.create({
    resource: {
      name: userName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [ROOT_FOLDER_ID],
    },
    fields: 'id',
  })

  return folder.data.id
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // Parse the incoming multipart form
    const form = new IncomingForm({ keepExtensions: true })
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    })

    const file     = Array.isArray(files.file) ? files.file[0] : files.file
    const userName = Array.isArray(fields.userName) ? fields.userName[0] : (fields.userName || 'Unknown User')

    if (!file) return res.status(400).json({ error: 'No file provided' })

    // Auth + Drive client
    const auth  = getAuthClient()
    const drive = google.drive({ version: 'v3', auth })

    // Get or create user's sub-folder
    const userFolderId = await getOrCreateUserFolder(drive, userName)

    // Upload file to Drive
    const driveFile = await drive.files.create({
      resource: {
        name   : file.originalFilename || file.newFilename,
        parents: [userFolderId],
      },
      media: {
        mimeType: file.mimetype || 'application/octet-stream',
        body    : fs.createReadStream(file.filepath),
      },
      fields: 'id',
    })

    const fileId = driveFile.data.id

    // Make file publicly readable
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    })

    // Clean up temp file
    fs.unlink(file.filepath, () => {})

    const fileUrl = `https://drive.google.com/file/d/${fileId}/view`
    return res.status(200).json({ fileId, fileUrl })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Upload failed', detail: err.message })
  }
}
