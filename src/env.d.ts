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
  /**
   * Android 기기의 클립보드에서 내용을 가져옵니다.
   * @returns 클립보드에서 가져온 텍스트 내용
   */
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
