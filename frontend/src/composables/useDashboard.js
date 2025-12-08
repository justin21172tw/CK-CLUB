import { ref, computed } from 'vue'
import { supabase } from 'boot/supabase'
import { useAuth } from './useAuth'

export function useDashboard() {
  const { currentUser } = useAuth()

  const stats = ref({
    pending: 0,
    approved: 0,
    unread: 0,
  })

  const recentActivities = ref([])
  const loadingStats = ref(false)
  const loadingActivities = ref(false)
  const error = ref(null)

  let statsSubscription = null
  let activitiesSubscription = null

  const initializeDashboard = async () => {
    if (!currentUser.value) {
      console.warn('No user logged in')
      return
    }

    const userId = currentUser.value.id

    const { data: existing } = await supabase
      .from('dashboards')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!existing) {
      await supabase.from('dashboards').insert({
        user_id: userId,
        stats: { pending: 0, approved: 0, unread: 0 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      console.log('Dashboard initialized for user:', userId)
    }
  }

  const subscribeToStats = () => {
    if (!currentUser.value) return

    loadingStats.value = true
    const userId = currentUser.value.id

    statsSubscription = supabase
      .channel('dashboard_' + userId)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'dashboards', filter: 'user_id=eq.' + userId },
        (payload) => {
          if (payload.new) {
            stats.value = payload.new.stats || { pending: 0, approved: 0, unread: 0 }
          }
          loadingStats.value = false
        }
      )
      .subscribe()
  }

  const subscribeToActivities = () => {
    if (!currentUser.value) return

    loadingActivities.value = true
    const userId = currentUser.value.id

    activitiesSubscription = supabase
      .channel('activities_' + userId)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'activities', filter: 'user_id=eq.' + userId },
        async () => {
          await fetchRecentActivities()
        }
      )
      .subscribe()

    fetchRecentActivities()
  }

  const fetchRecentActivities = async () => {
    if (!currentUser.value) return

    try {
      const { data, error: fetchError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', currentUser.value.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (fetchError) throw fetchError

      recentActivities.value = data || []
    } catch (err) {
      console.error('Error fetching activities:', err)
      error.value = err.message
    } finally {
      loadingActivities.value = false
    }
  }

  const refreshDashboard = async () => {
    await fetchRecentActivities()
  }

  const unsubscribe = () => {
    if (statsSubscription) {
      supabase.removeChannel(statsSubscription)
      statsSubscription = null
    }
    if (activitiesSubscription) {
      supabase.removeChannel(activitiesSubscription)
      activitiesSubscription = null
    }
  }

  return {
    stats: computed(() => stats.value),
    recentActivities: computed(() => recentActivities.value),
    loadingStats: computed(() => loadingStats.value),
    loadingActivities: computed(() => loadingActivities.value),
    error: computed(() => error.value),
    initializeDashboard,
    subscribeToStats,
    subscribeToActivities,
    refreshDashboard,
    unsubscribe
  }
}
