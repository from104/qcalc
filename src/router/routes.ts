import { RouteRecordRaw } from 'vue-router';
// import { useCalcStore } from 'src/stores/calc-store';
// const store = useCalcStore();
// const initialPath = store.initPanel ? '/calc' : store.initialPath;
const initialPath = '/calc';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: initialPath },
      { path: '/calc', component: () => import('pages/CalcPage.vue') },
      { path: '/unit', component: () => import('pages/UnitPage.vue') },
      { path: '/currency', component: () => import('pages/CurrencyPage.vue') },
      { path: '/help', component: () => import('pages/HelpPage.vue') },
      { path: '/about', component: () => import('pages/AboutPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
