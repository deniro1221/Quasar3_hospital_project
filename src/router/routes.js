const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'admin', component: () => import('pages/adminPage.vue') },
      { path: 'nurse', component: () => import('pages/nursePage.vue') },
      { path: 'chef', component: () => import('pages/chefPage.vue') },
      { path: 'login_nurse', component: () => import('pages/LoginNursePage.vue') },
      { path: 'nurse_panel', component: () => import('pages/NursePanel.vue') },
      { path: 'login_chef', component: () => import('pages/loginChefPage.vue') },
      { path: 'chef_panel', component: () => import('pages/ChefPanelPage.vue') },
      { path: 'inputMenu_panel', component: () => import('pages/InputMenuPage.vue') },
      { path: 'history_menu', component: () => import('pages/historyMenuPage.vue') },
      { path: 'admin_history_menu', component: () => import('pages/adminHistoryMenuPage.vue') },
      { path: 'menu_page', component: () => import('pages/menuPage.vue') },
      { path: 'inputPatient', component: () => import('pages/InputPatientPage.vue') },
      { path: 'showPatient', component: () => import('pages/showPatientPage.vue') },
      { path: 'showPatientAdmin', component: () => import('pages/AdminShowPatientPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
