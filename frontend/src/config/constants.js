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
export const DOCUMENT_DEFINITIONS = {
  A: { code: 'A', name: '活動登錄表單', optional: false },
  B: { code: 'B', name: '校內場地申請表', optional: false },
  C: { code: 'C', name: '校外活動申請表', optional: false },
  D: { code: 'D', name: '企劃書', optional: false },
  E: { code: 'E', name: '家長同意書', optional: false },
  F: { code: 'F', name: '保險（保單/收據/名冊）', optional: false },
  G: { code: 'G', name: '住宿合格證明', optional: false },
  H: { code: 'H', name: '車輛契約書', optional: false },
}

// Helper function to convert document codes to names
export const getDocumentNames = (codes) => {
  if (!codes || !Array.isArray(codes)) return '無'
  return codes.map(code => DOCUMENT_DEFINITIONS[code]?.name || code).join('、')
}

export default {
  STATUS,
  ROLES,
  FILE_TYPES,
  MAX_FILE_SIZE,
  NOTIFICATION_TIMEOUT,
  ACTIVITY_TYPES,
  DOCUMENT_DEFINITIONS,
}
