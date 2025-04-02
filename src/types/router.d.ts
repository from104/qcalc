 // Start Generation Here
/**
 * @file router.d.ts
 * @description 이 파일은 Vue Router의 라우트 메타 필드에 대한 타입 확장을 정의합니다.
 *              라우트 전환 애니메이션 및 현재 네비게이션 방식과 관련된 타입 정보를 제공합니다.
 */

/**
 * Vue Router의 라우트 메타 필드에 대한 타입 확장
 */
declare interface RouteMeta {
  /**
   * 라우트 전환 애니메이션을 결정하는 함수
   * @param navigationMethod - 네비게이션 방식 (예: 'forward', 'back')
   * @returns 사용할 전환 애니메이션 이름
   */
  getTransition?: (navigationMethod: string) => string;

  // 현재 네비게이션 방식
  navigationMethod?: string;
}

// 라우트 전환 애니메이션 메타 필드
declare interface RouteTransitionMeta {
  getTransition?: (navigationMethod: string) => string;
  navigationMethod?: string;
}
