// 전역 변수 선언
export {};

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
  }
}
