# Student Pages

學生/教師相關頁面的組織結構說明。

## 📁 資料夾結構

```
student/
├── Announcement/              # 公告頁面
│   ├── AnnouncementPage.vue  # 主頁面
│   └── components/           # 公告相關組件
│       ├── Btn-L1.vue
│       └── Btn-L2.vue
│
├── Application/              # 活動申請頁面
│   ├── ApplicationPage.vue  # 主頁面
│   └── components/          # 申請相關組件
│       ├── Btn-A.vue
│       ├── Btn-B.vue
│       ├── Btn-C.vue
│       ├── Btn-D.vue
│       ├── Btn-E.vue
│       ├── Btn-F.vue
│       ├── Btn-G.vue
│       ├── Btn-H.vue
│       ├── Btn-others.vue
│       └── ProposalPage.vue
│
├── dashboard/               # 儀表板
│   ├── DashboardPage.vue   # 主頁面
│   ├── components/         # 儀表板組件
│   │   ├── ActivityCard.vue
│   │   └── DashboardStats.vue
│   └── README.md
│
├── notice/                  # 通知頁面
│   └── NoticePage.vue
│
└── upload/                  # 外聘教師資料上傳
    └── UploadPage.vue
```

## 📋 組織規範

### 單一頁面

如果頁面功能簡單，不需要額外組件，直接放在獨立資料夾內：

```
notice/
└── NoticePage.vue
```

### 複雜頁面

如果頁面有多個子組件，使用以下結構：

```
dashboard/
├── DashboardPage.vue    # 主頁面
└── components/          # 頁面專屬組件
    ├── Component1.vue
    └── Component2.vue
```

## 🔗 路由配置

```javascript
// router/routes.js
{
  path: 'dashboard',
  component: () => import('pages/student/dashboard/DashboardPage.vue')
}
```

## 📝 命名規範

- **資料夾名稱**：小寫（dashboard, notice, upload）或 PascalCase（Announcement, Application）
- **頁面組件**：`PageName` + `Page.vue`（例如：`DashboardPage.vue`）
- **子組件**：有意義的描述性名稱（例如：`ActivityCard.vue`, `Btn-A.vue`）

## ⚠️ 注意事項

1. **不要**在頂層和資料夾內同時放置同名檔案
2. **子組件**應放在 `components/` 子資料夾中
3. **頁面專屬樣式**可放在同名 `.scss` 檔案中
4. 修改路由時記得更新 `router/routes.js`

## 🚀 最近更新

- **2025-11-13**: 重組資料夾結構，統一為資料夾式組織
  - 移動 `AnnouncementPage.vue` → `Announcement/AnnouncementPage.vue`
  - 移動 `ApplicationPage.vue` → `Application/ApplicationPage.vue`
  - 移動 `NoticePage.vue` → `notice/NoticePage.vue`
  - 重命名 `UploadPageNew.vue` → `upload/UploadPage.vue`
  - 移除冗餘路由 `/uploadnew`
