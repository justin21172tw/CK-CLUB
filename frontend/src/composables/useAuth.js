import { ref, computed } from 'vue'
import { supabase } from 'boot/supabase'

const currentUser = ref(null)
const userRole = ref(null)
const loading = ref(true)
const error = ref(null)

supabase.auth.onAuthStateChange(async (event, session) => {
  loading.value = true

  if (session?.user) {
    currentUser.value = session.user

    // 首次登入時創建 users 表記錄
    if (event === 'SIGNED_IN') {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (!existingUser) {
        await supabase.from('users').insert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || null,
          role: 'student',
        })
        console.log('Created new user record for:', session.user.email)
      }
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role, name, student_id, department')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      userRole.value = profile.role || 'student'
      currentUser.value.displayName = profile.name
      currentUser.value.studentId = profile.student_id
      currentUser.value.department = profile.department
    }
  } else {
    currentUser.value = null
    userRole.value = null
  }

  loading.value = false
})

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value)
  const isAdmin = computed(() => userRole.value === 'admin')
  const isStudent = computed(() => userRole.value === 'student')

  const signInWithGoogle = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          skipBrowserRedirect: false
        }
      })

      if (signInError) throw signInError

      return { success: true, data }
    } catch (err) {
      console.error('Google sign in error:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    try {
      loading.value = true
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      return { success: true }
    } catch (err) {
      console.error('Sign out error:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!currentUser.value) throw new Error('No user logged in')

      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', currentUser.value.id)

      if (updateError) throw updateError

      return { success: true }
    } catch (err) {
      console.error('Update profile error:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    currentUser: computed(() => currentUser.value),
    userRole: computed(() => userRole.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isAuthenticated,
    isAdmin,
    isStudent,
    signInWithGoogle,
    signOut,
    updateProfile
  }
}
