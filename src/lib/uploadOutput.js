import { useAuthStore } from '@/stores/useAuthStore'

const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || '/api/upload-to-drive'

export async function uploadOutputFile({ file, onProgress }) {
  if (!file) throw new Error('No file provided.')

  const authStore = useAuthStore()
  const userName = authStore.fullName || 'Unknown User'

  const formData = new FormData()
  formData.append('file', file)
  formData.append('userName', userName)

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

export async function deleteOutputFile(fileUrl) {
  if (!fileUrl) return

  const res = await fetch(UPLOAD_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileUrl }),
  })

  if (!res.ok) {
    let msg = `Delete failed (${res.status})`
    try {
      const data = await res.json()
      if (data.detail) msg += `: ${data.detail}`
    } catch { /* ignore */ }
    throw new Error(msg)
  }

  return res.json()
}