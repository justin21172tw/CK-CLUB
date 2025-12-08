import { boot } from 'quasar/wrappers'
import { getSupabaseClient } from '../../../shared/config/supabase.js'

// Supabase 客戶端實例
let supabase = null

export default boot(({ app }) => {
  // 初始化 Supabase 客戶端
  supabase = getSupabaseClient()

  // 將 supabase 實例注入到 Vue app
  app.config.globalProperties.$supabase = supabase

  // 監聽認證狀態變化
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session)
  })
})

export { supabase }
