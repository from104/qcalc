/**
 * @file env.d.ts
 * @description 이 파일은 TypeScript 환경 설정을 위한 타입 선언을 포함합니다.
 *              다양한 모듈과 인터페이스를 정의하여 애플리케이션의 타입 안전성을 높이고,
 *              외부 라이브러리와의 상호작용을 원활하게 합니다.
 *              또한, Android 시스템과의 상호작용을 위한 인터페이스를 정의합니다.
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
 * Android 시스템과 상호 작용하기 위한 인터페이스
 */
declare class AndroidInterface {
  // phone 여부 확인
  static isPhone(): boolean;

  // tablet 여부 확인
  static isTablet(): boolean;

  // foldable 여부 확인
  static isFoldable(): boolean;

  // 텍스트 줌 레벨 가져오기
  static getTextZoom(): number;

  // 클립보드에서 텍스트 가져오기
  static getFromClipboard(): string;
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
