 // Start Generation Here
/**
 * @file routes.ts
 * @description 이 파일은 Vue Router의 라우트 설정을 정의합니다.
 *              각 라우트는 페이지 컴포넌트와 경로를 매핑하며,
 *              네비게이션 메타 정보를 포함할 수 있습니다.
 *              이 파일은 애플리케이션의 다양한 페이지 간의 전환을 관리합니다.
 */

// Vue Router에서 RouteRecordRaw 타입을 가져옵니다.
import type { RouteRecordRaw } from 'vue-router';

// meta 타입 정의
interface RouteMeta {
  navigationMethod?: string;
}

// 라우트 타입 확장
type AppRouteRecordRaw = RouteRecordRaw & {
  meta?: RouteMeta;
};

const routes: AppRouteRecordRaw[] = [
  {
    name: 'calc', // 계산기 페이지의 라우트 이름
    path: '/', // 루트 경로
    component: () => import('layouts/MainLayout.vue'), // 동적 임포트를 사용하여 컴포넌트 로드
    meta: {
      navigationMethod: '',
    }, // 페이지 전환 효과 설정
  },
  {
    name: 'help', // 도움말 페이지의 라우트 이름
    path: '/help', // '/help' 경로
    component: () => import('layouts/MainLayout.vue'), // 정보 레이아웃 컴포넌트 사용
    meta: {
      navigationMethod: '',
    }, // 왼쪽으로 슬라이드 전환 효과
  },
  {
    name: 'about', // 소개 페이지의 라우트 이름
    path: '/about', // '/about' 경로
    component: () => import('layouts/MainLayout.vue'), // 정보 레이아웃 컴포넌트 재사용
    meta: {
      navigationMethod: '',
    }, // 왼쪽으로 슬라이드 전환 효과
  },
  {
    name: 'record',
    path: '/record',
    component: () => import('layouts/MainLayout.vue'),
    meta: {
      navigationMethod: '',
    },
  },
  {
    name: 'settings',
    path: '/settings',
    component: () => import('layouts/MainLayout.vue'),
    meta: {
      navigationMethod: '',
    },
  },

  // 404 에러 페이지 라우트 (항상 마지막에 위치해야 함)
  {
    path: '/:catchAll(.*)*', // 모든 일치하지 않는 경로를 캐치
    component: () => import('pages/ErrorNotFound.vue'), // 404 에러 페이지 컴포넌트
  },
];

// 정의된 라우트 설정을 내보냅니다.
export default routes;
