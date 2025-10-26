// API service layer for backend communication
import axios from 'axios'
import { auth } from 'src/boot/vuefire'
import { ENV } from 'src/config/env'
import { downloadFromResponse } from 'src/utils/fileDownload'

// Create axios instance
const api = axios.create({
  baseURL: ENV.API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: auto-attach Authorization header
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor: unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message
    console.error('API Error:', message)
    return Promise.reject(error)
  },
)

// ==================== Submission API ====================

/**
 * Submit external teacher data (public API, no authentication required)
 * @param {FormData} formData - Contains text fields and files
 */
export async function createSubmission(formData) {
  // Use plain axios instead of api instance to avoid auto-attaching Authorization header
  const response = await axios.post(`${ENV.API_BASE}/submissions`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * Get all submissions (admin only)
 * @param {Object} params - Query params { status, club, limit }
 */
export async function getSubmissions(params = {}) {
  const response = await api.get('/submissions', { params })
  return response.data
}

/**
 * Get single submission
 * @param {string} id - Submission ID
 */
export async function getSubmission(id) {
  const response = await api.get(`/submissions/${id}`)
  return response.data
}

/**
 * Update submission status (admin only)
 * @param {string} id - Submission ID
 * @param {Object} data - { status, reviewNote }
 */
export async function updateSubmissionStatus(id, data) {
  const response = await api.patch(`/submissions/${id}`, data)
  return response.data
}

/**
 * Delete submission (admin only)
 * @param {string} id - Submission ID
 */
export async function deleteSubmission(id) {
  const response = await api.delete(`/submissions/${id}`)
  return response.data
}

/**
 * Batch download all submission files as ZIP
 * @param {string} id - Submission ID
 * @param {string} filename - Filename for ZIP
 */
export async function downloadSubmissionFiles(id, filename = 'submission') {
  const response = await api.get(`/submissions/${id}/download-all`, {
    responseType: 'blob',
  })

  return downloadFromResponse(response, `${filename}.zip`)
}

/**
 * Add message/reply to submission
 * @param {string} id - Submission ID
 * @param {string} content - Message content
 */
export async function addSubmissionMessage(id, content) {
  const response = await api.post(`/submissions/${id}/messages`, { content })
  return response.data
}

/**
 * Get submission messages
 * @param {string} id - Submission ID
 */
export async function getSubmissionMessages(id) {
  const response = await api.get(`/submissions/${id}/messages`)
  return response.data
}

// ==================== Template API ====================

/**
 * Get template list
 */
export async function getTemplates() {
  const response = await api.get('/templates')
  return response.data
}

/**
 * Download template file
 * @param {string} id - Template ID
 */
export async function downloadTemplate(id) {
  const response = await api.get(`/templates/download/${id}`, {
    responseType: 'blob',
  })

  return downloadFromResponse(response, `template-${id}.pdf`)
}

// ==================== User API ====================

/**
 * Get current user info
 */
export async function getCurrentUser() {
  const response = await api.get('/auth/me')
  return response.data
}

export default api
