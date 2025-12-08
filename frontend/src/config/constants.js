// Application-wide constants

// API Status values
export const STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  UNDER_REVIEW: 'under_review',
}

// User roles
export const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  TEACHER: 'teacher',
}

// File types
export const FILE_TYPES = {
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  IMAGE: 'image/*',
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

// Activity types
export const ACTIVITY_TYPES = {
  INTERNAL: 'internal',
  EXTERNAL: 'external'
}

// Required documents based on activity options
export const DOCUMENT_CODES = {
  A: '活動登錄表單',
  B: '校內場地申請表',
  C: '校外活動申請表',
  D: '企劃書',
  E: '家長同意書',
  F: '保險證明',
  G: '住宿合格證明',
  H: '車輛契約書'
}

export default {
  STATUS,
  ROLES,
  FILE_TYPES,
  MAX_FILE_SIZE,
  NOTIFICATION_TIMEOUT,
  ACTIVITY_TYPES,
  DOCUMENT_CODES,
}
