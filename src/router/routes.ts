import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/CalcLayout.vue'),
    meta: { transition: 'slide-right' }
  },
  {
    path: '/help',
    component: () => import('layouts/HelpLayout.vue'),
    meta: { transition: 'slide-left' }
  },
  {
    path: '/about',
    component: () => import('layouts/AboutLayout.vue'),
    meta: { transition: 'slide-left' }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
