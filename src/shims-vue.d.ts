/* eslint-disable */

// Vite 클라이언트 타입 참조
/// <reference types="vite/client" />

// Vue 3 반응형 매크로 타입 참조
/// <reference types="@vue/runtime-core" />

/**
 * .vue 확장자를 가진 모든 파일에 대한 타입 선언
 * 이를 통해 TypeScript가 .vue 파일을 Vue 컴포넌트로 인식할 수 있습니다.
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  /**
   * Vue 컴포넌트 타입 정의
   * props, events, slots 등의 타입을 더 구체적으로 지정할 수 있습니다.
   * 현재는 간단한 예시로, 모든 타입을 허용하는 any를 사용합니다.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;

  export default component;
}

interface RouteTransitionMeta {
  getTransition?: (navigationMethod: string) => string;
  navigationMethod?: string;
}
