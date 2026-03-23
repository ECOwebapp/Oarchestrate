const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || '/api/upload-to-drive'

export async function uploadOutputFile({ file, userName, onProgress }) {
  if (!file) throw new Error('No file provided.')

  const formData = new FormData()
  formData.append('file', file)
  formData.append('userName', userName || 'Unknown User')

  const xhr = new XMLHttpRequest()

  return new Promise((resolve, reject) => {
    xhr.open('POST', UPLOAD_URL, true)

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && typeof onProgress === 'function') {
        const percent = Math.round((e.loaded / e.total) * 100)
        onProgress(percent)
      }
    })

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText)
          resolve({ fileUrl: res.fileUrl, fileId: res.fileId })
        } catch {
          reject(new Error('Invalid server response'))
        }
      } else {
        reject(new Error(`Upload failed (HTTP ${xhr.status})`))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(formData)
  })
}