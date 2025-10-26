// Environment configuration and constants

export const ENV = {
  // Backend API configuration
  API_BASE: import.meta.env.VITE_API_BASE || 'http://localhost:3000/api',
  USE_CLOUD_FUNCTIONS: import.meta.env.VITE_USE_CLOUD_FUNCTIONS === 'true',

  // Development mode
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV,
  DEV_BYPASS_TOKEN: import.meta.env.VITE_DEV_BYPASS_TOKEN || 'dev-admin-token-12345',

  // Environment flags
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
}

/**
 * Get API endpoint based on Cloud Functions configuration
 * @param {string} path - API path (e.g., '/auth/verify')
 * @returns {string} Full API endpoint URL
 */
export function getApiEndpoint(path) {
  if (ENV.USE_CLOUD_FUNCTIONS) {
    // Cloud Functions format: http://host:port/project-id/region/functionName
    const functionName = path
      .replace('/auth/', 'auth')
      .replace('verify', 'Verify')
      .replace('me', 'GetMe')
    return `${ENV.API_BASE}/${functionName}`
  } else {
    // Traditional Backend API format: http://host:port/api/path
    return `${ENV.API_BASE}${path}`
  }
}

export default ENV
