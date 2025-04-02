/**
 * @file capacitor.d.ts
 * @description 이 파일은 Capacitor와 Android 네이티브 기능과 관련된 타입과 인터페이스를 정의합니다.
 *              네이티브 기능을 JavaScript에서 호출할 수 있도록 디바이스 타입 확인,
 *              클립보드 접근 등의 기능에 대한 타입 정보를 제공합니다.
 */

/**
 * Android 시스템과 상호 작용하기 위한 인터페이스
 */
declare class AndroidInterface {
  /**
   * 디바이스가 태블릿인지 확인합니다.
   * @returns 태블릿 여부
   */
  isTablet(): boolean;

  /**
   * 디바이스가 스마트폰인지 확인합니다.
   * @returns 스마트폰 여부
   */
  isPhone(): boolean;

  /**
   * 디바이스가 폴더블인지 확인합니다.
   * @returns 폴더블 여부
   */
  isFoldable(): boolean;

  /**
   * 현재 텍스트 줌 레벨을 가져옵니다.
   * @returns 텍스트 줌 레벨
   */
  getTextZoom(): number;

  /**
   * 클립보드의 텍스트를 가져옵니다.
   * @returns 클립보드 텍스트
   */
  getFromClipboard(): string;
}

// Android 인터페이스를 전역으로 사용할 수 있도록 Window 인터페이스 확장
declare global {
  interface Window {
    androidInterface?: AndroidInterface;
  }
}
