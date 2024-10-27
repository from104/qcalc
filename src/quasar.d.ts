/* eslint-disable */

/**
 * Quasar 프레임워크를 위한 TypeScript 선언 파일
 * 
 * 이 파일은 Quasar 프레임워크와 관련된 TypeScript 타입 정의를 포함합니다.
 * @quasar/app-vite 패키지의 타입 확장을 적용하여 Quasar의 기능을 TypeScript에서 올바르게 사용할 수 있게 합니다.
 */

/**
 * @quasar/app-vite 패키지의 타입 참조
 * 
 * 이 참조는 다음과 같은 중요한 역할을 합니다:
 * 1. TS가 @quasar/app-vite의 quasar 패키지 확장을 적용하도록 강제합니다.
 * 2. quasar/wrappers 임포트의 타입 정의를 제공합니다.
 * 3. @quasar/app-vite가 quasar를 참조하여 확장하므로, quasar 자체의 확장도 적용됩니다.
 *    (예: Vue 컴포넌트 컨텍스트에 $q 추가)
 * 
 * 주의: 이 참조를 제거하면 quasar/wrappers 임포트가 작동하지 않을 수 있습니다.
 */
/// <reference types="@quasar/app-vite" />
