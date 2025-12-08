/**
 * 共用類型定義
 * 可以在前端和後端共用
 */

/**
 * @typedef {Object} User
 * @property {string} id - 用戶 ID
 * @property {string} email - 用戶郵箱
 * @property {string} [name] - 用戶名稱
 * @property {string} [avatar] - 頭像 URL
 * @property {Date} created_at - 創建時間
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 是否成功
 * @property {*} [data] - 響應數據
 * @property {string} [error] - 錯誤信息
 * @property {string} [message] - 提示信息
 */

export {}
