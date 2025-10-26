const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'about', component: () => import('pages/AboutPage.vue') },
      { path: 'application', component: () => import('src/pages/ApplicationPage_.vue') },
      { path: 'upload', component: () => import('pages/UploadPageNew.vue') },
      { path: 'retakecourses', component: () => import('pages/RetakeCoursesPage.vue') },
      { path: 'notice', component: () => import('pages/NoticePage.vue') },
      { path: 'evaluation', component: () => import('pages/EvaluationPage.vue') },
      { path: 'official-leave', component: () => import('pages/OfficialLeavePage.vue') },
      { path: 'skip', component: () => import('pages/SkipPage.vue') },
      { path: 'announcement', component: () => import('pages/AnnouncementPage.vue') },
      { path: 'admin', component: () => import('pages/AdminPage.vue') },
    ],
  },
  {
    path: '/uploadnew',
    redirect: '/upload',
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
