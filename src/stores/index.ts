/**
 * @file index.ts
 * @description 이 파일은 Pinia 스토어를 설정하고 관리하는 기능을 제공합니다.
 *              Quasar 프레임워크와 통합되어 있으며, 다양한 스토어 플러그인을 포함합니다.
 *              이 파일은 애플리케이션의 상태 관리를 위한 기본 설정을 제공합니다.
 */

// Quasar의 store 래퍼 함수 가져오기
import { defineStore } from '#q-app/wrappers';

// Pinia 상태 관리 라이브러리에서 createPinia 함수 가져오기
import { createPinia } from 'pinia';

// Pinia 상태 지속성 플러그인 가져오기
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

/**
 * Pinia 스토어 인스턴스를 생성하고 반환하는 함수
 * 
 * SSR(서버 사이드 렌더링) 모드가 아닐 경우 이 함수를 직접 내보낼 수 있습니다.
 * 이 함수는 비동기일 수 있으며, async/await를 사용하거나
 * Store 인스턴스로 해결되는 Promise를 반환할 수 있습니다.
 */
export default defineStore((/* { ssrContext } */) => {
  // Pinia 인스턴스 생성
  const pinia = createPinia();

  // Pinia 플러그인 추가
  // 예: pinia.use(SomePiniaPlugin)
  
  // 상태 지속성 플러그인 추가
  pinia.use(piniaPluginPersistedstate);

  // 구성된 Pinia 인스턴스 반환
  return pinia;
});

/*
 * When adding new properties to stores, you should also
 * extend the `PiniaCustomProperties` interface.
 * @see https://pinia.vuejs.org/core-concepts/plugins.html#Typing-new-store-properties
 */
declare module 'pinia' {
  export interface PiniaCustomProperties {
    // 사용자 정의 속성을 여기에 추가하세요.
    // 예: myCustomProperty: string;
    myCustomProperty?: unknown; // 예시로 추가된 사용자 정의 속성
  }
}