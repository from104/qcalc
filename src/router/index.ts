/**
 * @file index.ts
 * @description 이 파일은 Vue Router를 설정하고 라우터 인스턴스를 생성하는 기능을 제공합니다.
 *              Quasar 프레임워크와 통합되어 있으며, 다양한 라우트 설정을 포함합니다.
 *              이 파일은 서버 사이드 렌더링(SSR) 및 클라이언트 사이드 렌더링(CSR) 모두를 지원합니다.
 *              또한, 페이지 이동 시 스크롤 동작을 설정하고, 네비게이션 가드를 통해 경로 변경을 관리합니다.
 */

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
  Router.beforeEach((to, from) => {
    // 경로 깊이 계산 함수

    // '/' == 0, '/a' == 1, '/a/b' == 2, '/a/b/c' == 3
    const getPathDepth = (path: string): number => {
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
      to.meta.navigationMethod = 'forward';
    }
  });

  // 생성된 라우터 인스턴스 반환
  // 지연 로드 모듈(라우트 청크)을 못 받으면 페이지를 한 번만 새로 연다. 그대로 두면 라우터가 시작되지
  // 않아 부팅 스플래시에서 멈춘다. dev 에서는 Vite 가 시작 직후 의존성을 다시 묶는 사이 옛 해시로
  // 요청하면(WebKit: "Importing a module script failed"), 배포본에서는 업데이트 뒤 사라진 청크를
  // 요청하면 생긴다. sessionStorage 로 연속 새로고침을 막는다.
  const RELOAD_KEY = 'qcalc-chunk-reload-at';
  const isChunkLoadError = (err: unknown) =>
    /Importing a module script failed|Failed to fetch dynamically imported module|error loading dynamically imported module/i.test(
      String((err as Error)?.message ?? err),
    );
  /** @returns 새로고침을 시작했으면 true */
  const reloadOnce = (): boolean => {
    try {
      const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
      // 이 문서가 바로 그 새로고침으로 열린 문서면 다시 열지 않는다 — 새 index 로도 못 받았으니 또 열어도 소용없고,
      // 수식 '=' 재시도처럼 사용자가 건 재시도가 실패 안내를 띄운 화면을 통째로 날린다(10초 규칙만으로는 10초 뒤 '=' 에 새로고침됐다)
      if (last && performance.timeOrigin >= last) return false;
      if (Date.now() - last < 10_000) return false;
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    } catch {
      /* 저장소를 못 쓰면 새로고침하지 않는다 (무한 루프 방지) */
      return false;
    }
    window.location.reload();
    return true;
  };
  Router.onError((err) => {
    if (isChunkLoadError(err)) reloadOnce();
  });
  if (typeof window !== 'undefined') {
    // 새로고침할 때만 오류를 삼킨다. 새로고침하지 않으면(10초 안에 이미 했으면) 오류를 그대로 흘려
    // 부른 쪽이 실패를 알고 다시 시도하게 한다 — 삼키면 import() 가 undefined 로 끝나 성공처럼 보인다
    window.addEventListener('vite:preloadError', (event) => {
      if (reloadOnce()) event.preventDefault();
    });
  }

  return Router;
});
