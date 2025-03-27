/**
 * @file env.d.ts
 * @description 이 파일은 외부 모듈에 대한 타입 선언을 포함합니다.
 *              애플리케이션에서 사용하는 외부 라이브러리와 파일 타입에 대한
 *              타입 정의를 제공합니다.
 */

/**
 * freecurrencyapi-js 모듈 선언
 */
declare module '@everapi/freecurrencyapi-js';

/**
 * YAML 파일 모듈 선언
 */
declare module '*.yml' {
  /**
   * YAML 파일의 내용을 나타내는 문자열
   */
  const value: string;

  // YAML 파일의 내용을 기본 내보내기로 설정
  export default value;
}

/**
 * 마크다운 파일 모듈 선언
 */
declare module '*.md' {
  /**
   * 마크다운 파일의 내용을 나타내는 문자열
   */
  const content: string;

  // 마크다운 파일의 내용을 기본 내보내기로 설정
  export default content;
}

/**
 * tinykeys 모듈 선언
 */
declare module 'tinykeys' {
  /**
   * 키 바인딩 맵 타입
   */
  export type KeyBindingMap = Record<string, (event: KeyboardEvent) => void>;

  /**
   * tinykeys 함수
   * @param target 대상 요소
   * @param keyBindingMap 키 바인딩 맵
   * @returns 해제 함수
   */
  export function tinykeys(target: Window | HTMLElement, keyBindingMap: KeyBindingMap): () => void;
}
