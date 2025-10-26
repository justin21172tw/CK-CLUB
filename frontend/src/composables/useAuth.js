// Authentication composable with Firebase and dev mode support
import { ref, computed } from 'vue'
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from 'src/boot/vuefire'
import axios from 'axios'
import { ENV, getApiEndpoint } from 'src/config/env'

// Global state
const currentUser = ref(null)
const userRole = ref(null)
const loading = ref(true)
const error = ref(null)
const isDevMode = ref(false)

// Initialize auth state listener
onAuthStateChanged(auth, async (user) => {
  loading.value = true

  if (user) {
    try {
      const idToken = await user.getIdToken()

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
      console.error('Authentication failed:', err)
      error.value = err.response?.data?.message || 'Authentication failed'
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
  // Dev mode: sign in as local admin
  const signInAsDev = () => {
    if (!ENV.DEV_MODE) {
      console.error('Dev mode not enabled')
      return { success: false, error: 'Dev mode not enabled' }
    }

    console.log('[DEV MODE] Signing in as local admin')

    currentUser.value = {
      uid: 'dev-admin-uid',
      email: 'dev-admin@localhost',
      displayName: 'Local Admin (DEV)',
      photoURL: null,
      getIdToken: async () => ENV.DEV_BYPASS_TOKEN,
    }

    userRole.value = 'admin'
    isDevMode.value = true
    error.value = null

    return { success: true, user: currentUser.value }
  }

  // Sign in with Google
  const signIn = async () => {
    try {
      loading.value = true
      error.value = null

      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()

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
      console.error('Sign in failed:', err)
      error.value = err.response?.data?.message || err.message || 'Sign in failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      loading.value = true
      await firebaseSignOut(auth)
      currentUser.value = null
      userRole.value = null
      error.value = null
      return { success: true }
    } catch (err) {
      console.error('Sign out failed:', err)
      error.value = err.message
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Get current ID token for API requests
  const getIdToken = async () => {
    if (!currentUser.value) return null

    // Dev mode: return bypass token directly
    if (isDevMode.value) {
      return ENV.DEV_BYPASS_TOKEN
    }

    return await currentUser.value.getIdToken()
  }

  // Get current user info from backend
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
      console.error('Failed to get user info:', err)
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
    signInAsDev,
    signOut,
    getIdToken,
    getCurrentUser,

    // Computed
    isAuthenticated,
    isAdmin,
    isTeacher,

    // Config flags (deprecated, use ENV directly)
    DEV_MODE: ENV.DEV_MODE,
    USE_CLOUD_FUNCTIONS: ENV.USE_CLOUD_FUNCTIONS,
  }
}
