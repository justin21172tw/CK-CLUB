// Dashboard data management with Firestore
import { ref, computed, watch } from 'vue'
import {
  doc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from 'src/boot/vuefire'
import { useAuth } from './useAuth'

export function useDashboard() {
  const { currentUser, isAuthenticated } = useAuth()

  // Dashboard stats
  const stats = ref({
    pending: 0,
    approved: 0,
    unread: 0,
  })

  // Recent activities
  const recentActivities = ref([])

  // Loading states
  const loadingStats = ref(false)
  const loadingActivities = ref(false)
  const error = ref(null)

  // Unsubscribe functions
  let unsubscribeStats = null
  let unsubscribeActivities = null

  /**
   * Initialize dashboard data for current user
   */
  const initializeDashboard = async () => {
    if (!currentUser.value) {
      console.warn('No user logged in')
      return
    }

    const userId = currentUser.value.uid
    const dashboardRef = doc(db, 'dashboards', userId)

    try {
      const dashboardSnap = await getDoc(dashboardRef)

      if (!dashboardSnap.exists()) {
        // Create initial dashboard document
        await setDoc(dashboardRef, {
          userId,
          stats: {
            pending: 0,
            approved: 0,
            unread: 0,
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
        console.log('Dashboard initialized for user:', userId)
      }
    } catch (err) {
      console.error('Failed to initialize dashboard:', err)
      error.value = err.message
    }
  }

  /**
   * Subscribe to dashboard stats updates
   */
  const subscribeToStats = () => {
    if (!currentUser.value) return

    loadingStats.value = true
    const userId = currentUser.value.uid
    const dashboardRef = doc(db, 'dashboards', userId)

    unsubscribeStats = onSnapshot(
      dashboardRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          stats.value = data.stats || { pending: 0, approved: 0, unread: 0 }
        }
        loadingStats.value = false
      },
      (err) => {
        console.error('Error subscribing to stats:', err)
        error.value = err.message
        loadingStats.value = false
      },
    )
  }

  /**
   * Subscribe to recent activities
   */
  const subscribeToActivities = () => {
    if (!currentUser.value) return

    loadingActivities.value = true
    const userId = currentUser.value.uid

    const activitiesQuery = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10),
    )

    unsubscribeActivities = onSnapshot(
      activitiesQuery,
      (snapshot) => {
        recentActivities.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: formatDate(doc.data().createdAt),
        }))
        loadingActivities.value = false
      },
      (err) => {
        console.error('Error subscribing to activities:', err)
        error.value = err.message
        loadingActivities.value = false
      },
    )
  }

  /**
   * Update dashboard stats
   */
  const updateStats = async (newStats) => {
    if (!currentUser.value) return

    const userId = currentUser.value.uid
    const dashboardRef = doc(db, 'dashboards', userId)

    try {
      await updateDoc(dashboardRef, {
        stats: newStats,
        updatedAt: Timestamp.now(),
      })
      console.log('Stats updated successfully')
    } catch (err) {
      console.error('Failed to update stats:', err)
      error.value = err.message
      throw err
    }
  }

  /**
   * Refresh stats from submissions and announcements
   */
  const refreshStats = async () => {
    if (!currentUser.value) return

    loadingStats.value = true
    const userId = currentUser.value.uid

    try {
      // Count pending submissions
      const pendingQuery = query(
        collection(db, 'submissions'),
        where('submittedBy', '==', userId),
        where('status', '==', 'pending'),
      )
      const pendingSnapshot = await getDocs(pendingQuery)
      const pendingCount = pendingSnapshot.size

      // Count approved submissions
      const approvedQuery = query(
        collection(db, 'submissions'),
        where('submittedBy', '==', userId),
        where('status', '==', 'approved'),
      )
      const approvedSnapshot = await getDocs(approvedQuery)
      const approvedCount = approvedSnapshot.size

      // Count unread announcements
      const dashboardRef = doc(db, 'dashboards', userId)
      const dashboardSnap = await getDoc(dashboardRef)
      const readAnnouncements = dashboardSnap.data()?.readAnnouncements || []

      const announcementsQuery = query(collection(db, 'announcements'))
      const announcementsSnapshot = await getDocs(announcementsQuery)
      const unreadCount = announcementsSnapshot.docs.filter(
        (doc) => !readAnnouncements.includes(doc.id),
      ).length

      // Update stats
      const newStats = {
        pending: pendingCount,
        approved: approvedCount,
        unread: unreadCount,
      }

      await updateStats(newStats)
      stats.value = newStats
    } catch (err) {
      console.error('Failed to refresh stats:', err)
      error.value = err.message
    } finally {
      loadingStats.value = false
    }
  }

  /**
   * Create a new activity record
   */
  const createActivity = async (activityData) => {
    if (!currentUser.value) return

    const userId = currentUser.value.uid
    const activitiesRef = collection(db, 'activities')

    try {
      const newActivity = {
        userId,
        ...activityData,
        createdAt: Timestamp.now(),
      }

      await setDoc(doc(activitiesRef), newActivity)
      console.log('Activity created successfully')
    } catch (err) {
      console.error('Failed to create activity:', err)
      error.value = err.message
      throw err
    }
  }

  /**
   * Mark announcement as read
   */
  const markAnnouncementAsRead = async (announcementId) => {
    if (!currentUser.value) return

    const userId = currentUser.value.uid
    const dashboardRef = doc(db, 'dashboards', userId)

    try {
      const dashboardSnap = await getDoc(dashboardRef)
      const readAnnouncements = dashboardSnap.data()?.readAnnouncements || []

      if (!readAnnouncements.includes(announcementId)) {
        readAnnouncements.push(announcementId)

        await updateDoc(dashboardRef, {
          readAnnouncements,
          updatedAt: Timestamp.now(),
        })

        // Update unread count
        stats.value.unread = Math.max(0, stats.value.unread - 1)
      }
    } catch (err) {
      console.error('Failed to mark announcement as read:', err)
      error.value = err.message
    }
  }

  /**
   * Format Firestore timestamp to readable date
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return '未知時間'

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    const diffMonths = Math.floor(diffMs / 2592000000)
    const diffYears = Math.floor(diffMs / 31536000000)

    if (diffMins < 60) return `${diffMins} 分鐘前`
    if (diffHours < 24) return `${diffHours} 小時前`
    if (diffDays < 30) return `${diffDays} 天前`
    if (diffMonths < 12) return `${diffMonths} 個月前`
    return `${diffYears} 年前`
  }

  /**
   * Setup dashboard (initialize and subscribe)
   */
  const setupDashboard = async () => {
    if (!isAuthenticated.value) return

    try {
      await initializeDashboard()
      subscribeToStats()
      subscribeToActivities()
      await refreshStats()
    } catch (err) {
      console.error('Failed to setup dashboard:', err)
      error.value = err.message
    }
  }

  /**
   * Cleanup subscriptions
   */
  const cleanup = () => {
    if (unsubscribeStats) {
      unsubscribeStats()
      unsubscribeStats = null
    }
    if (unsubscribeActivities) {
      unsubscribeActivities()
      unsubscribeActivities = null
    }
  }

  // Watch for auth state changes
  watch(
    () => isAuthenticated.value,
    (authenticated) => {
      if (authenticated) {
        setupDashboard()
      } else {
        cleanup()
        stats.value = { pending: 0, approved: 0, unread: 0 }
        recentActivities.value = []
      }
    },
    { immediate: true },
  )

  // Computed
  const hasActivities = computed(() => recentActivities.value.length > 0)
  const loading = computed(() => loadingStats.value || loadingActivities.value)

  return {
    // State
    stats,
    recentActivities,
    loading,
    loadingStats,
    loadingActivities,
    error,

    // Computed
    hasActivities,

    // Methods
    setupDashboard,
    refreshStats,
    updateStats,
    createActivity,
    markAnnouncementAsRead,
    cleanup,
  }
}
