/**
 * @file global.d.ts
 * @description 이 파일은 전역 타입 선언을 포함하며, 애플리케이션의 다양한 환경에 대한 정보를 제공합니다.
 *              Window 인터페이스를 확장하여 애플리케이션의 상태 및 환경 정보를 추가합니다.
 */

// 전역 타입 선언을 위한 모듈 선언
export {};

declare global {
  interface Window {
    /**
     * 전역 변수 네임스페이스
     * 애플리케이션의 모든 전역 상태와 환경 정보를 포함합니다.
     */
    readonly globalVars: {
      /**
       * 환경 관련 플래그
       */
      readonly isDev: boolean; // 개발 환경 여부
      readonly isDesktop: boolean; // 데스크톱 환경 여부
      readonly isMobile: boolean; // 모바일 환경 여부
      readonly isWindows: boolean; // Windows OS 여부
      readonly isLinux: boolean; // Linux OS 여부
      readonly isAndroid: boolean; // Android OS 여부
      readonly isElectron: boolean; // Electron 환경 여부
      readonly isCapacitor: boolean; // Capacitor 환경 여부
      readonly isSnap: boolean; // Snap 패키지 여부

      /**
       * 디바이스 타입 정보
       */
      readonly isTablet: boolean; // 태블릿 디바이스 여부
      readonly isPhone: boolean; // 스마트폰 디바이스 여부
      readonly isFoldable: boolean; // 폴더블 디바이스 여부
      readonly textZoom: number; // 텍스트 줌 레벨

      /**
       * 안드로이드 시스템 정보
       */
      readonly apiLevel: number; // 안드로이드 API 레벨
      readonly navigationBarHeight: number; // 네비게이션바 높이(픽셀)
      readonly isGestureNavigation: boolean; // 제스처 네비게이션 사용 여부

      /**
       * 버전 정보
       */
      readonly version: string;

      /**
       * 클립보드 기능
       * @returns 클립보드의 텍스트 내용
       */
      readonly getFromClipboard: () => string;
    };

    /**
     * Capacitor 네이티브 기능
     */
    androidInterface?: AndroidInterface;

    /**
     * Electron 업데이트 기능
     */
    electronUpdater?: ElectronUpdater;

    /**
     * Electron 기능
     */
    electron?: Electron;
  }
}
