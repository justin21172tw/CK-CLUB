// File download utility functions

/**
 * Trigger browser file download from blob data
 * @param {Blob} blob - File blob data
 * @param {string} filename - Filename for download
 */
export function triggerDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)

  setTimeout(() => {
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }, 100)
  }, 0)
}

/**
 * Extract filename from Content-Disposition header
 * @param {string} contentDisposition - Content-Disposition header value
 * @param {string} fallbackFilename - Fallback filename if not found in header
 * @returns {string} Extracted or fallback filename
 */
export function extractFilename(contentDisposition, fallbackFilename) {
  if (!contentDisposition) {
    return fallbackFilename
  }

  const match = contentDisposition.match(/filename="(.+)"/)
  if (match) {
    return decodeURIComponent(match[1])
  }

  return fallbackFilename
}

/**
 * Download file from API response
 * @param {Object} response - Axios response with blob data
 * @param {string} defaultFilename - Default filename if not in headers
 * @returns {Object} { success: boolean, filename: string }
 */
export function downloadFromResponse(response, defaultFilename) {
  const contentDisposition = response.headers['content-disposition']
  const filename = extractFilename(contentDisposition, defaultFilename)
  const mimeType = response.headers['content-type'] || 'application/octet-stream'

  const blob = new Blob([response.data], { type: mimeType })
  triggerDownload(blob, filename)

  return { success: true, filename }
}
