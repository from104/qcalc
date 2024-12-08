/**
 * 이 파일은 일렉트론 API에 대한 TypeScript 타입 선언을 포함합니다.
 * TypeScript 컴파일러가 일렉트론 관련 코드의 타입을 이해하고,
 * 정확한 타입 체크와 자동 완성 기능을 제공할 수 있도록 합니다.
 */

// 빈 export 문은 이 파일을 모듈로 취급하도록 합니다.
export {};

/**
 * 전역 Window 인터페이스를 확장하여 일렉트론 특정 API를 선언합니다.
 */
declare global {
  interface Window {
    /**
     * 일렉트론 애플리케이션에서 사용되는 커스텀 API 객체입니다.
     */
    myAPI: {
      /**
       * 애플리케이션 창을 항상 위에 표시할지 여부를 설정합니다.
       * 
       * @param alwaysOnTop - true이면 창을 항상 위에 표시하고, false이면 일반 창으로 표시합니다.
       */
      setAlwaysOnTop: (alwaysOnTop: boolean) => void;
    };
  }
}
