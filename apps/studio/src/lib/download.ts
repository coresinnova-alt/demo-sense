/** Triggers a client-side file download from an in-memory string. */
export const downloadBlob = (contents: string, filename: string, mime: string) => {
  const blob = new Blob(['﻿', contents], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoke on the next tick rather than immediately; Safari needs the URL to
  // still be live when the click is processed.
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}
