// src/composables/useAuth.js
import { ref, computed } from 'vue'
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from 'src/boot/vuefire'
import axios from 'axios'

// API 配置
const USE_CLOUD_FUNCTIONS = import.meta.env.VITE_USE_CLOUD_FUNCTIONS === 'true'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'

// 根據是否使用 Cloud Functions 決定 API 端點
const getApiEndpoint = (path) => {
  if (USE_CLOUD_FUNCTIONS) {
    // Cloud Functions 格式: http://host:port/project-id/region/functionName
    // 例如: http://127.0.0.1:5001/ck-cl-24edb/us-central1/authVerify
    const functionName = path.replace('/auth/', 'auth')
      .replace('verify', 'Verify')
      .replace('me', 'GetMe')
    return `${API_BASE}/${functionName}`
  } else {
    // 傳統 Backend API 格式: http://host:port/api/path
    return `${API_BASE}${path}`
  }
}

// 開發模式設定
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV
const DEV_BYPASS_TOKEN = import.meta.env.VITE_DEV_BYPASS_TOKEN || 'dev-admin-token-12345'

// 全局狀態
const currentUser = ref(null)
const userRole = ref(null)
const loading = ref(true)
const error = ref(null)
const isDevMode = ref(false)

// 初始化認證狀態監聽
onAuthStateChanged(auth, async (user) => {
  loading.value = true

  if (user) {
    try {
      // 獲取 ID Token
      const idToken = await user.getIdToken()

      // 向 Cloud Functions 驗證並獲取角色
      const endpoint = getApiEndpoint('/auth/verify')
      const response = await axios.post(
        endpoint,
        { idToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      currentUser.value = user
      userRole.value = response.data.user.role
      error.value = null
    } catch (err) {
      console.error('認證失敗:', err)
      error.value = err.response?.data?.message || '認證失敗'
      currentUser.value = null
      userRole.value = null
    }
  } else {
    currentUser.value = null
    userRole.value = null
  }

  loading.value = false
})

export function useAuth() {
  // 🔧 開發模式：使用本地 admin 帳號
  const signInAsDev = () => {
    if (!DEV_MODE) {
      console.error('開發模式未啟用')
      return { success: false, error: '開發模式未啟用' }
    }

    console.log('🔧 [DEV MODE] Signing in as local admin')

    currentUser.value = {
      uid: 'dev-admin-uid',
      email: 'dev-admin@localhost',
      displayName: '本地管理員 (DEV)',
      photoURL: null,
      getIdToken: async () => DEV_BYPASS_TOKEN,
    }

    userRole.value = 'admin'
    isDevMode.value = true
    error.value = null

    return { success: true, user: currentUser.value }
  }
  // 使用 Google 登入
  const signIn = async () => {
    try {
      loading.value = true
      error.value = null

      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()

      // 向 Cloud Functions 驗證
      const endpoint = getApiEndpoint('/auth/verify')
      const response = await axios.post(
        endpoint,
        { idToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      currentUser.value = result.user
      userRole.value = response.data.user.role

      return { success: true, user: result.user }
    } catch (err) {
      console.error('登入失敗:', err)
      error.value = err.response?.data?.message || err.message || '登入失敗'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 登出
  const signOut = async () => {
    try {
      loading.value = true
      await firebaseSignOut(auth)
      currentUser.value = null
      userRole.value = null
      error.value = null
      return { success: true }
    } catch (err) {
      console.error('登出失敗:', err)
      error.value = err.message
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 獲取當前 ID Token (用於 API 請求)
  const getIdToken = async () => {
    if (!currentUser.value) return null

    // 開發模式直接返回 bypass token
    if (isDevMode.value) {
      return DEV_BYPASS_TOKEN
    }

    return await currentUser.value.getIdToken()
  }

  // 獲取當前用戶資訊（從 Cloud Functions）
  const getCurrentUser = async () => {
    try {
      const token = await getIdToken()
      if (!token) return null

      const endpoint = getApiEndpoint('/auth/me')
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data.user
    } catch (err) {
      console.error('獲取用戶資訊失敗:', err)
      return null
    }
  }

  // Computed properties
  const isAuthenticated = computed(() => !!currentUser.value)
  const isAdmin = computed(() => userRole.value === 'admin')
  const isTeacher = computed(() => userRole.value === 'teacher')

  return {
    // State
    currentUser,
    userRole,
    loading,
    error,
    isDevMode,

    // Methods
    signIn,
    signInAsDev, // 開發模式登入
    signOut,
    getIdToken,
    getCurrentUser, // 獲取當前用戶資訊

    // Computed
    isAuthenticated,
    isAdmin,
    isTeacher,

    // Dev mode flag
    DEV_MODE,
    USE_CLOUD_FUNCTIONS, // 是否使用 Cloud Functions
  }
}
