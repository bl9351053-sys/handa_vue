import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/choose-role'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegistrationView.vue')
  },
  {
    path: '/',
    component: () => import('../layouts/LayoutMain.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('../pages/DashboardPage.vue') },
      { path: 'predictions', name: 'Predictions', component: () => import('../pages/PredictionsList.vue') },
      { path: 'predictions/create', name: 'PredictionCreate', component: () => import('../pages/PredictionCreate.vue') },
      { path: 'predictions/:id', name: 'PredictionShow', component: () => import('../pages/PredictionShow.vue') },
      { path: 'predictions/:id/edit', name: 'PredictionEdit', component: () => import('../pages/PredictionEdit.vue') },
      { path: 'evacuation-areas', name: 'EvacuationAreas', component: () => import('../pages/EvacuationAreaList.vue') },
      { path: 'evacuation-areas/create', name: 'EvacuationAreaCreate', component: () => import('../pages/EvacuationAreaCreate.vue') },
      { path: 'evacuation-areas/:id', name: 'EvacuationAreaShow', component: () => import('../pages/EvacuationAreaView.vue') },
      { path: 'evacuation-areas/:id/edit', name: 'EvacuationAreaEdit', component: () => import('../pages/EvacuationAreaEdit.vue') },
      { path: 'facilities', name: 'Facilities', component: () => import('../pages/FacilitiesList.vue') },
      { path: 'facilities/create', name: 'FacilityCreate', component: () => import('../pages/FacilityCreate.vue') },
      { path: 'facilities/:id', name: 'FacilityShow', component: () => import('../pages/FacilityShow.vue') },
      { path: 'facilities/:id/edit', name: 'FacilityEdit', component: () => import('../pages/FacilityEdit.vue') },
      { path: 'families', name: 'Families', component: () => import('../pages/FamiliesList.vue') },
      { path: 'families/create', name: 'FamilyCreate', component: () => import('../pages/FamilyCreate.vue') },
      { path: 'families/:id', name: 'FamilyShow', component: () => import('../pages/FamilyShow.vue') },
      { path: 'families/:id/edit', name: 'FamilyEdit', component: () => import('../pages/FamilyEdit.vue') },
      { path: 'updates', name: 'Updates', component: () => import('../pages/updates/UpdatesList.vue') },
      { path: 'updates/create', name: 'UpdateCreate', component: () => import('../pages/updates/UpdateCreate.vue') },
      { path: 'updates/:id', name: 'UpdateShow', component: () => import('../pages/updates/UpdateShow.vue') },
      { path: 'updates/:id/edit', name: 'UpdateEdit', component: () => import('../pages/updates/UpdateEdit.vue') },
      { path: 'emergency-alerts', name: 'EmergencyAlerts', component: () => import('../pages/EmergencyAlertsList.vue') },
      { path: 'emergency-alerts/create', name: 'EmergencyAlertCreate', component: () => import('../pages/EmergencyAlertCreate.vue') },
      { path: 'emergency-alerts/:id', name: 'EmergencyAlertShow', component: () => import('../pages/EmergencyAlertShow.vue') },
      { path: 'emergency-alerts/:id/edit', name: 'EmergencyAlertEdit', component: () => import('../pages/EmergencyAlertEdit.vue') },
      {
  path: 'reports',
  component: () => import('../pages/ReportPage.vue'),
  children: [
    { path: '', redirect: { name: 'ReportEvacuation' } },
    { path: 'evacuation', name: 'ReportEvacuation', component: () => import('../pages/ReportEvacuation.vue') },
    { path: 'facility', name: 'ReportFacility', component: () => import('../pages/ReportFacility.vue') },
    { path: 'prediction', name: 'ReportPrediction', component: () => import('../pages/ReportPrediction.vue') },
  ]
},
      { path: 'settings', name: 'Settings', component: () => import('../pages/SettingsPage.vue') },
      { path: 'login-history', name: 'LoginHistory', component: () => import('../pages/LoginHistoryPage.vue') },
      

    ]
  }
]

routes.push({
  path: '/resident_pages',
  component: () => import('../layouts/ResidentLayout.vue'),
  children: [
    { path: '', redirect: 'dashboard' },
    { path: 'dashboard', name: 'ResidentDashboard', component: () => import('../pages/resident_pages/ResidentDashboardPage.vue') },
    { path: 'evacuation-areas', name: 'ResidentEvacuationList', component: () => import('../pages/resident_pages/EvacuationAreaList.vue') },
    { path: 'evacuation-areas/recommend', name: 'ResidentRecommendArea', component: () => import('../pages/resident_pages/RecommendArea.vue') },
    { path: 'evacuation-areas/:id/register-family', name: 'ResidentRegisterFamily', component: () => import('../pages/resident_pages/RegisterFamily.vue') },
    { path: 'evacuation-areas/:id', name: 'ResidentEvacuationDetail', component: () => import('../pages/resident_pages/EvacuationAreaDetail.vue') },
    { path: 'families', name: 'ResidentFamilies', component: () => import('../pages/resident_pages/FamiliesList.vue') },
    { path: 'disaster-updates', name: 'ResidentDisasterUpdates', component: () => import('../pages/resident_pages/DisasterUpdatesList.vue') },
    { path: 'disaster-updates/:id', name: 'ResidentDisasterUpdateDetail', component: () => import('../pages/resident_pages/DisasterUpdateDetail.vue') },
    { path: 'disaster-predictions', name: 'ResidentDisasterPredictions', component: () => import('../pages/resident_pages/DisasterPredictionsList.vue') },
    { path: 'disaster-predictions/:id', name: 'ResidentDisasterPredictionDetail', component: () => import('../pages/resident_pages/DisasterPredictionDetail.vue') },
    { path: 'hotlines', name: 'ResidentHotlines', component: () => import('../pages/resident_pages/Hotlines.vue') }
  ]
});

routes.push({
  path: '/choose-role',
  name: 'ChooseRole',
  component: () => import('../views/RoleSelect.vue')
});

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  console.debug('[Router.beforeEach]', {
    toPath: to.path,
    toName: to.name,
    toParams: to.params,
    matched: to.matched.map(r => ({ path: r.path, name: r.name }))
  });
  
  const token = localStorage.getItem('token');
  if (to.meta && to.meta.requiresAuth && !token) {
    next({ name: 'Login' });
  } else if ((to.name === 'Login' || to.name === 'Register') && token) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

router.onError((err) => {
  console.error('[Router error]', err);
  try { window && window.alert && window.alert('Navigation error: see console for details'); } catch (e) { /* ignore */ }
});

export default router
