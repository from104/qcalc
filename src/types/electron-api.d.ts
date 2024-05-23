/**
 * 이 파일은 일렉트론 API에 대한 TypeScript 타입을 선언하는 데 사용됩니다.
 * 이 파일은 TypeScript 컴파일러가 해당 타입을 이해하고 일렉트론 관련 코드에 대한
 * 타입 체크와 자동 완성을 제공할 수 있도록 합니다.
 */
export {};

// window.myAPI.setAlwaysOnTop 함수를 전역으로 선언합니다.
declare global {
  interface Window {
    myAPI: {
      setAlwaysOnTop: (alwaysOnTop: boolean) => void;
    };
  }
}
