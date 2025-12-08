import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// 如果需要使用 Vercel API，可在此設定 baseURL
// 目前專案主要使用 Supabase Client SDK，不依賴 axios
const api = axios.create({ baseURL: '' })

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
