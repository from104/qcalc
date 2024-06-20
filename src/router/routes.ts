import {RouteRecordRaw} from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'calc',
    path: '/',
    component: () => import('layouts/CalcLayout.vue'),
    meta: {transition: 'slide-right'},
  },
  {
    name: 'help',
    path: '/help',
    component: () => import('layouts/InfoLayout.vue'),
    meta: {transition: 'slide-left'},
  },
  {
    name: 'about',
    path: '/about',
    component: () => import('layouts/InfoLayout.vue'),
    meta: {transition: 'slide-left'},
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
