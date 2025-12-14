const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },

      { path: 'dashboard', component: () => import('pages/student/dashboard/DashboardPage.vue') },
      { path: 'application', component: () => import('pages/student/application/ApplicationPage.vue') },
      { path: 'upload', component: () => import('pages/student/upload/UploadPage.vue') },
      { path: 'announcement', component: () => import('pages/student/announcement/AnnouncementPage.vue') },
      { path: 'notice', component: () => import('pages/student/notice/NoticePage.vue') },

      // { path: 'admin', component: () => import('pages/admin/AdminPage.vue') },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
