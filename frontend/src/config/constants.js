// Application-wide constants

// API Status values
export const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  UNDER_REVIEW: 'under_review',
}

// User roles
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  USER: 'user',
}

// File types
export const FILE_TYPES = {
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ZIP: 'application/zip',
}

// Max file sizes (in bytes)
export const MAX_FILE_SIZE = {
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  IMAGE: 5 * 1024 * 1024, // 5MB
  ZIP: 50 * 1024 * 1024, // 50MB
}

// Notification timeout (in milliseconds)
export const NOTIFICATION_TIMEOUT = 3000

export default {
  STATUS,
  ROLES,
  FILE_TYPES,
  MAX_FILE_SIZE,
  NOTIFICATION_TIMEOUT,
}
