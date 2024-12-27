import { RouteRecordRaw } from 'vue-router';
import MainLayout from 'layouts/MainLayout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
  },
  {
    path: '/help',
    component: MainLayout,
    name: 'help',
  },
  {
    path: '/about',
    component: MainLayout,
    name: 'about',
  },
  {
    path: '/history',
    component: MainLayout,
    name: 'history',
  },
  {
    path: '/settings',
    component: MainLayout,
    name: 'settings',
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/',
  },
];

export default routes;
