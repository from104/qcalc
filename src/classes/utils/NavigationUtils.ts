import { type Router, type RouteLocationNormalizedLoaded } from 'vue-router';

/**
 * 특정 경로로 이동합니다.
 * @param path - 이동할 경로
 * @param route - 현재 라우트 정보
 * @param router - Vue Router 인스턴스
 */
export function navigateToPath(path: string, route: RouteLocationNormalizedLoaded, router: Router): void {
  if (route.path === path) {
    return;
  } else if (/help|about|settings|record/.test(route.path)) {
    router.replace(path);
  } else {
    router.push(path);
  }
}
