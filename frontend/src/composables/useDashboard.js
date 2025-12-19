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

  const subscribeToStats = async () => {
    if (!currentUser.value) return

    loadingStats.value = true
    const userId = currentUser.value.id

    // 先獲取初始數據
    try {
      const { data, error: fetchError } = await supabase
        .from('dashboards')
        .select('stats')
        .eq('user_id', userId)
        .single()

      if (fetchError) throw fetchError

      stats.value = data?.stats || { pending: 0, approved: 0, unread: 0 }
    } catch (err) {
      console.error('Error fetching stats:', err)
      stats.value = { pending: 0, approved: 0, unread: 0 }
    } finally {
      loadingStats.value = false
    }

    // 然後訂閱實時更新
    statsSubscription = supabase
      .channel('dashboard_' + userId)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'dashboards', filter: 'user_id=eq.' + userId },
        (payload) => {
          if (payload.new) {
            stats.value = payload.new.stats || { pending: 0, approved: 0, unread: 0 }
          }
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

  const createActivity = async (activityData) => {
    console.log('[useDashboard] createActivity called with:', activityData)

    if (!currentUser.value) {
      console.error('[useDashboard] User not logged in')
      throw new Error('User not logged in')
    }

    console.log('[useDashboard] Current user:', currentUser.value.id)
    console.log('[useDashboard] Supabase client:', supabase)

    const insertData = {
      user_id: currentUser.value.id,
      ...activityData,
      status: 'registered',
      // created_at 和 updated_at 由資料庫自動產生，不需手動設定
    }

    console.log('[useDashboard] Inserting data:', JSON.stringify(insertData, null, 2))
    console.log('[useDashboard] About to call supabase.from("activities").insert()...')

    try {
      const { data, error: createError } = await supabase
        .from('activities')
        .insert([insertData])
        .select()
        .single()

      console.log('[useDashboard] Supabase response received')
      console.log('[useDashboard] Data:', data)
      console.log('[useDashboard] Error:', createError)

      if (createError) {
        console.error('[useDashboard] Insert error:', createError)
        throw createError
      }

      console.log('[useDashboard] Insert successful:', data)

      // Refresh activities list
      console.log('[useDashboard] Refreshing activities list...')
      await fetchRecentActivities()
      console.log('[useDashboard] Activities list refreshed')

      return data
    } catch (err) {
      console.error('[useDashboard] Unexpected error in createActivity:', err)
      console.error('[useDashboard] Error type:', err.constructor.name)
      console.error('[useDashboard] Error message:', err.message)
      console.error('[useDashboard] Error stack:', err.stack)
      throw err
    }
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
    createActivity,
    unsubscribe
  }
}
