/**
 * 統一的 API 響應工具函數
 */

export const successResponse = (data, message = 'Success') => {
  return {
    success: true,
    data,
    message
  }
}

export const errorResponse = (error, statusCode = 500) => {
  return {
    success: false,
    error: error.message || error,
    statusCode
  }
}

export const validateRequest = (body, requiredFields) => {
  const missing = requiredFields.filter(field => !body[field])
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
}
