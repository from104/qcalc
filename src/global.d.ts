/**
 * @file global.d.ts
 * @description 이 파일은 전역 타입 선언을 포함하며, 애플리케이션의 다양한 환경에 대한 정보를 제공합니다.
 *              이 파일은 Window 인터페이스에 애플리케이션의 상태 및 환경 정보를 추가하여,
 *              개발 및 배포 환경에서의 조건부 로직을 구현하는 데 도움을 줍니다.
 */

// 빈 모듈을 생성하여 전역 타입 선언을 위한 공간을 확보합니다.
export {};

// 전역 변수 선언
declare global {
  interface Window {
    readonly isDev: boolean;
    readonly isDesktop: boolean;
    readonly isMobile: boolean;
    readonly isWindows: boolean;
    readonly isLinux: boolean;
    readonly isAndroid: boolean;
    readonly isElectron: boolean;
    readonly isCapacitor: boolean;
    readonly isSnap: boolean;

    // Store는 필요에 따라 수정 가능하게 유지
    readonly store: ReturnType<typeof useStore>;

    // textZoomLevel 값을 저장할 변수
    readonly textZoomLevel: number;
  }
}
