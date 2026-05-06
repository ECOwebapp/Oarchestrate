import { useAuthStore } from "@/stores/useAuthStore";
import { apiFetch } from "./api";

const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL;

export async function uploadOutputFile({ file, onProgress }) {
  if (!file) throw new Error("No file provided.");

  const authStore = useAuthStore();
  const userName = authStore.fullName || "Unknown User";

  // STEP 1: Handshake (Get the resumable URL)
  const res = await apiFetch(UPLOAD_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      userName: userName,
      mimeType: file.type,
    }),
  });
  const { uploadUrl } = await res.json();

  // STEP 2: The Upload (Using XHR to keep your progress tracking)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PATCH", uploadUrl, true); // Use PUT for resumable uploads

    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhr.setRequestHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    xhr.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && typeof onProgress === "function") {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Google returns JSON metadata of the file
        const data = JSON.parse(xhr.responseText);
        resolve({
          fileUrl: `https://drive.google.com/file/d/${data.id}/view`,
          fileId: data.id,
        });
      } else {
        reject(new Error(`Upload failed (HTTP ${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(file); // Send the raw file, not FormData
  });
}
