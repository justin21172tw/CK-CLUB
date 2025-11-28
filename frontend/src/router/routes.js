const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Common
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'about', component: () => import('pages/AboutPage.vue') },

      // Student
      { path: 'dashboard', component: () => import('pages/student/dashboard/DashboardPage.vue') },
      {
        path: 'application',
        component: () => import('pages/student/Application/ApplicationPage.vue'),
      },
      {
        path: 'announcement',
        component: () => import('pages/student/Announcement/AnnouncementPage.vue'),
      },
      { path: 'notice', component: () => import('pages/student/notice/NoticePage.vue') },
      { path: 'upload', component: () => import('pages/student/upload/UploadPage.vue') },

      // Admin
      { path: 'admin', component: () => import('pages/admin/AdminPage.vue') },

      // Dev (Inactive)
      { path: 'evaluation', component: () => import('pages/dev/EvaluationPage.vue') },
      { path: 'retakecourses', component: () => import('pages/dev/RetakeCoursesPage.vue') },
      { path: 'official-leave', component: () => import('pages/dev/OfficialLeavePage.vue') },
      { path: 'skip', component: () => import('pages/dev/SkipPage.vue') },
    ],
  },
  /* upload page redirect
  {
    path: '/uploadnew',
    redirect: '/upload',
  },
  */
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
