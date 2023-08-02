import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/calc' },
      { path: '/calc', component: () => import('pages/CalcPage.vue') },
      { path: '/unit', component: () => import('pages/UnitPage.vue') },
      { path: '/currency', component: () => import('pages/CurrencyPage.vue') },
      { path: '/help', component: () => import('pages/HelpPage.vue') },
      { path: '/about', component: () => import('pages/AboutPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;
