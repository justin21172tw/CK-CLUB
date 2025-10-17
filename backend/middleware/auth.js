import { getAuth } from '../config/firebase.js'

// 開發模式設定
const DEV_MODE = process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true'
const DEV_BYPASS_TOKEN = process.env.DEV_BYPASS_TOKEN || 'dev-admin-token-12345'

/**
 * 驗證 Firebase ID Token（支援開發模式）
 */
export async function verifyAuth(request, reply) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: '未提供有效的身份驗證令牌',
      })
    }

    const token = authHeader.split('Bearer ')[1]

    // 🔧 開發模式：允許使用特殊 token 繞過認證
    if (DEV_MODE && token === DEV_BYPASS_TOKEN) {
      console.log('⚠️  [DEV MODE] Bypassing authentication with dev token')
      request.user = {
        uid: 'dev-admin-uid',
        email: 'dev-admin@localhost',
        role: 'admin',
        isDev: true,
      }
      return
    }

    // 正常的 Firebase 認證流程
    const decodedToken = await getAuth().verifyIdToken(token)

    // 將用戶資訊附加到 request
    request.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'teacher', // 從 custom claims 取得角色
      isDev: false,
    }
  } catch (error) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: '身份驗證失敗: ' + error.message,
    })
  }
}

/**
 * 檢查是否為台北市教育帳號
 */
export function checkEducationDomain(email) {
  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'tp.edu.tw'
  return email && email.endsWith(`@${allowedDomain}`)
}

/**
 * 僅允許管理員訪問
 */
export async function requireAdmin(request, reply) {
  await verifyAuth(request, reply)

  if (request.user.role !== 'admin') {
    return reply.status(403).send({
      error: 'Forbidden',
      message: '權限不足,僅限管理員訪問',
    })
  }

  // 開發模式警告
  if (request.user.isDev) {
    console.log('⚠️  [DEV MODE] Admin access granted via dev token')
  }
}
