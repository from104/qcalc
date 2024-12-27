// Vue Router에서 RouteRecordRaw 타입을 가져옵니다.
import { RouteRecordRaw } from 'vue-router';

// meta 타입 정의
interface RouteMeta {
  getTransition?: (navigationMethod: string) => string;
  navigationMethod?: string;
}

// 라우트 타입 확장
type AppRouteRecordRaw = RouteRecordRaw & {
  meta?: RouteMeta;
};

// 라우트 설정을 정의합니다.
const getTransition = (navigationMethod: string) => {
  return navigationMethod === 'back' ? 'move-back' : 'move-forward';
};

const routes: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/NarrowLayout.vue'),
    children: [
      {
        path: '',
        name: 'index',
        component: () => import('layouts/NarrowLayout.vue'),
        meta: {
          getTransition,
          navigationMethod: '',
        },
      },
      {
        name: 'help',
        path: '/help',
        component: () => import('layouts/NarrowLayout.vue'),
        meta: {
          getTransition,
          navigationMethod: '',
        },
      },
      {
        name: 'about',
        path: '/about',
        component: () => import('layouts/NarrowLayout.vue'),
        meta: {
          getTransition,
          navigationMethod: '',
        },
      },
      {
        name: 'history',
        path: '/history',
        component: () => import('layouts/NarrowLayout.vue'),
        meta: {
          getTransition,
          navigationMethod: '',
        },
      },
      {
        name: 'settings',
        path: '/settings',
        component: () => import('layouts/NarrowLayout.vue'),
        meta: {
          getTransition,
          navigationMethod: '',
        },
      },
    ],
  },

  // 404 에러 페이지 라우트 (항상 마지막에 위치해야 함)
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

// 정의된 라우트 설정을 내보냅니다.
export default routes;
