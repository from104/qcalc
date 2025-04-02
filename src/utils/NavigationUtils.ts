 // Start Generation Here
/**
 * @file NavigationUtils.ts
 * @description 이 파일은 Vue 애플리케이션에서 라우팅을 관리하는 유틸리티 함수들을 정의합니다.
 *              사용자가 특정 경로로 이동할 수 있도록 도와주며, 현재 라우트 정보에 따라
 *              적절한 이동 방식을 선택합니다. 이 유틸리티는 애플리케이션의 내비게이션을
 *              일관되게 관리하고, 사용자 경험을 향상시키는 데 도움을 줍니다.
 */

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
