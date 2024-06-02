import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/CalcLayout.vue'),
  },
  {
    path: '/help',
    component: () => import('layouts/HelpLayout.vue'),
  },
  {
    path: '/about',
    component: () => import('layouts/AboutLayout.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
