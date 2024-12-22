// Quasar 프레임워크의 route 래퍼 함수 가져오기
import { route } from 'quasar/wrappers';

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
export default route(function (/* { store, ssrContext } */) {
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

  // 전역 배열(또는 Vuex/Pinia/기타 스토어)에 경로 스택을 하나 관리
  const routeStack = [];

  // 네비게이션 가드 설정
  Router.beforeEach((to, from, next) => {
    // 만약 최초 방문이라면(from이 존재하지 않는다면) 그냥 스택에 추가
    if (!from.name) {
      routeStack.push(to.fullPath);
      return next();
    }

    // 네비게이션 메서드 초기화
    let navigationMethod = 'unknown';
    
    // 스택에서 현재 경로의 위치 확인
    const currentIndex = routeStack.lastIndexOf(to.fullPath);

    // 1. 스택에서 현재 경로의 위치 확인
    if (currentIndex !== -1) {
      // 이미 방문한 경로인 경우
      if (currentIndex === routeStack.length - 2) {
        // 바로 이전 페이지로 돌아가는 경우
        routeStack.pop();
        navigationMethod = 'back';
      } else if (currentIndex < routeStack.length - 2) {
        // 히스토리에서 더 이전 페이지로 돌아가는 경우
        routeStack.splice(currentIndex + 1);
        navigationMethod = 'back_multiple';
      } else {
        // 현재 페이지 재방문 (새로고침 등)
        navigationMethod = 'refresh';
      }
    } else {
      // 새로운 경로 방문
      routeStack.push(to.fullPath);
      navigationMethod = 'forward';
    }

    // 2. 라우트 메타에 네비게이션 메서드 추가
    to.meta.navigationMethod = navigationMethod;
    // 3. 다음 네비게이션 함수 호출
    next();
  });

  // 생성된 라우터 인스턴스 반환
  return Router;
});
