# Student Dashboard

## 結構

```
dashboard/
├── DashboardPage.vue          # 主儀表板頁面
└── components/
    ├── DashboardStatCard.vue  # 統計卡片元件
    └── ActivityCard.vue       # 活動卡片元件
```

## 功能

### DashboardPage.vue

- 顯示使用者歡迎訊息
- 快速操作按鈕（活動申請、查看公告、我的通知）
- 統計資訊（待審核、已通過、未讀公告）
- 最近活動列表

### 元件

#### DashboardStatCard

統計數據展示卡片

- Props: `icon`, `label`, `value`, `color`

#### ActivityCard

活動記錄卡片

- Props: `icon`, `color`, `title`, `description`, `date`

## 使用

在 router 中加入：

```javascript
{ path: 'dashboard', component: () => import('pages/student/dashboard/DashboardPage.vue') }
```
