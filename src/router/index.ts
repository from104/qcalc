// Quasar 프레임워크의 route 래퍼 함수 가져오기
import { defineRouter } from '#q-app/wrappers';

// Vue Router에서 필요한 함수들 가져오기
import { createMemoryHistory, createRouter, createWebHashHistory, createWebHistory } from 'vue-router';

// 라우트 설정 가져오기
import routes from './routes';

/**
 * 라우터 인스턴스를 생성하고 반환하는 함수
 *
 * SSR 모드가 아닐 경우 이 함수를 직접 내보낼 수 있습니다.
 * 이 함수는 비동기일 수 있으며, async/await를 사용하거나
 * Router 인스턴스로 해결되는 Promise를 반환할 수 있습니다.
 */
export default defineRouter(function (/* { store, ssrContext } */) {
  // 환경에 따른 적절한 히스토리 생성 함수 선택
  const createHistory = process.env.SERVER
    ? createMemoryHistory // 서버 사이드 렌더링의 경우
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory // HTML5 History 모드
      : createWebHashHistory; // Hash 모드

  // 라우터 인스턴스 생성
  const Router = createRouter({
    // 스크롤 동작 설정: 페이지 이동 시 항상 맨 위로 스크롤
    scrollBehavior: () => ({ left: 0, top: 0 }),

    // 정의된 라우트 설정 사용
    routes,

    // 히스토리 모드 설정
    // 주의: 이 설정은 그대로 두고 quasar.conf.js에서 변경하세요!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // 네비게이션 가드 설정
  Router.beforeEach((to, from, next) => {
    // 경로 깊이 계산 함수

    // '/' == 0, '/a' == 1, '/a/b' == 2, '/a/b/c' == 3
    const getPathDepth = (path: string): number => {
      // 시작과 끝의 '/'를 제거하고 남은 '/'의 수를 계산
      const trimmedPath = path.replace(/^\/+|\/+$/g, '');
      if (trimmedPath === '') {
        return 0;
      }
      return trimmedPath.split('/').length;
    };

    const fromDepth = getPathDepth(from.path);
    const toDepth = getPathDepth(to.path);

    // 깊이 비교하여 네비게이션 방향 결정
    if (toDepth > fromDepth) {
      to.meta.navigationMethod = 'forward';
    } else if (toDepth < fromDepth) {
      to.meta.navigationMethod = 'back';
    } else {
      // 같은 깊이일 경우 이전 경로로 판단
      to.meta.navigationMethod = 'forward';
    }

    next();
  });

  // 생성된 라우터 인스턴스 반환
  return Router;
});
