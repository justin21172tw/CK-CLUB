# CK Club

一個基於 Quasar + Vercel + Supabase 的現代化全端應用。

## 技術棧

### 前端
- **Quasar Framework** (Vue 3) - UI 框架
- **Pinia** - 狀態管理
- **Vue Router** - 路由管理
- **Axios** - HTTP 客戶端

### 後端
- **Vercel Serverless Functions** - API 端點
- **Supabase** - 數據庫、認證和存儲
  - PostgreSQL 數據庫
  - Auth (認證系統)
  - Storage (文件存儲)
  - Realtime (實時訂閱)

## 專案結構

```
ck_club/
├── frontend/              # Quasar 前端應用
│   ├── src/
│   │   ├── boot/         # 啟動文件
│   │   │   └── supabase.js
│   │   ├── components/   # Vue 組件
│   │   ├── composables/  # Vue Composables
│   │   │   ├── useAuth.js
│   │   │   ├── useDatabase.js
│   │   │   └── useStorage.js
│   │   ├── layouts/      # 布局組件
│   │   ├── pages/        # 頁面組件
│   │   ├── router/       # 路由配置
│   │   └── stores/       # Pinia stores
│   └── package.json
├── api/                   # Vercel Serverless Functions
│   ├── auth/             # 認證相關 API
│   │   ├── login.js
│   │   └── register.js
│   ├── users/            # 用戶相關 API
│   │   └── index.js
│   └── storage/          # 存儲相關 API
│       └── upload.js
├── shared/               # 前後端共用代碼
│   ├── config/          # 配置文件
│   │   └── supabase.js
│   ├── types/           # 類型定義
│   │   └── index.js
│   └── utils/           # 工具函數
│       └── response.js
├── vercel.json          # Vercel 配置
└── .env.example         # 環境變數範本
```

## 快速開始

### 1. 安裝依賴

```bash
cd frontend
npm install
```

### 2. 環境配置

複製 `.env.example` 到 `.env` 並填入你的 Supabase 配置：

```bash
cp .env.example .env
```

編輯 `.env` 文件：

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. 開發模式

```bash
cd frontend
npm run dev
```

應用將在 `http://localhost:9000` 啟動。

### 4. 構建生產版本

```bash
cd frontend
npm run build
```

## API 端點

### 認證 API
- `POST /api/auth/login` - 用戶登入
- `POST /api/auth/register` - 用戶註冊

### 用戶 API
- `GET /api/users` - 獲取用戶列表

### 存儲 API
- `POST /api/storage/upload` - 上傳文件

## Composables 使用指南

### useAuth - 認證管理

```vue
<script setup>
import { useAuth } from 'src/composables/useAuth'

const { user, signIn, signUp, signOut, isAuthenticated } = useAuth()

// 登入
await signIn('email@example.com', 'password')

// 註冊
await signUp('email@example.com', 'password', { name: 'User Name' })

// 登出
await signOut()
</script>
```

### useDatabase - 數據庫操作

```vue
<script setup>
import { useDatabase } from 'src/composables/useDatabase'

const { query, insert, update, remove, subscribe } = useDatabase()

// 查詢數據
const users = await query('users', {
  filters: { role: 'admin' },
  order: { column: 'created_at', ascending: false }
})

// 插入數據
await insert('users', { name: 'John', email: 'john@example.com' })

// 更新數據
await update('users', userId, { name: 'Jane' })

// 刪除數據
await remove('users', userId)

// 實時訂閱
const unsubscribe = subscribe('users', (payload) => {
  console.log('Change received!', payload)
})
</script>
```

### useStorage - 文件存儲

```vue
<script setup>
import { useStorage } from 'src/composables/useStorage'

const { upload, getPublicUrl, download, remove, list } = useStorage()

// 上傳文件
const file = event.target.files[0]
await upload('avatars', `user-${userId}.png`, file)

// 獲取公開 URL
const url = getPublicUrl('avatars', `user-${userId}.png`)

// 列出文件
const files = await list('avatars')
</script>
```

## 部署到 Vercel

### 1. 安裝 Vercel CLI

```bash
npm install -g vercel
```

### 2. 登入 Vercel

```bash
vercel login
```

### 3. 部署

```bash
vercel
```

### 4. 設置環境變數

在 Vercel Dashboard 中設置以下環境變數：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Supabase 設置

### 1. 創建 Supabase 項目

訪問 [Supabase](https://supabase.com) 並創建新項目。

### 2. 獲取 API 密鑰

在項目設置中找到：
- Project URL
- anon (public) key
- service_role (secret) key

### 3. 創建數據表

根據需求在 Supabase SQL Editor 中創建表結構。

### 4. 設置 Storage Buckets

在 Storage 部分創建需要的存儲桶（如 `avatars`, `documents` 等）。

### 5. 配置 Row Level Security (RLS)

為每個表設置適當的 RLS 策略以確保數據安全。

## 開發建議

1. **環境變數管理**: 使用 `.env` 文件管理本地開發環境變數，生產環境使用 Vercel 環境變數。

2. **API 安全**: 
   - 前端使用 `anon key`
   - 後端 Vercel Functions 使用 `service_role key`
   - 始終在 Supabase 中啟用 RLS

3. **代碼組織**: 
   - 前端邏輯放在 `frontend/src`
   - API 端點放在 `api/`
   - 共用代碼放在 `shared/`

4. **狀態管理**: 使用 Pinia stores 管理全局狀態，composables 處理可復用邏輯。

5. **實時功能**: 使用 Supabase Realtime 訂閱實現實時數據更新。

## 常見問題

### Q: 如何處理 CORS 問題？
A: API 函數中已包含 CORS 頭設置，確保在每個 API 端點中正確配置。

### Q: 如何在 Vercel Functions 中訪問環境變數？
A: 使用 `process.env.VARIABLE_NAME`。

### Q: 前端如何訪問環境變數？
A: 使用 `import.meta.env.VITE_VARIABLE_NAME`（必須以 `VITE_` 開頭）。

## 授權

MIT License

## 作者

Justin Hu
