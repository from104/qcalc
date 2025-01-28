/**
 * NodeJS 네임스페이스에 대한 타입 선언
 * 이 선언은 Electron 환경에서 사용되는 프로세스 환경 변수의 타입을 정의합니다.
 */
declare namespace NodeJS {
  /**
   * ProcessEnv 인터페이스 확장
   * Quasar와 Electron 관련 환경 변수들의 타입을 명시합니다.
   */
  interface ProcessEnv {
    /** Quasar 프레임워크의 공개 폴더 경로 */
    QUASAR_PUBLIC_FOLDER: string;

    /** Electron 프리로드 스크립트가 위치한 폴더 경로 */
    QUASAR_ELECTRON_PRELOAD_FOLDER: string;

    /** Electron 프리로드 스크립트 파일의 확장자 */
    QUASAR_ELECTRON_PRELOAD_EXTENSION: string;

    /** 애플리케이션의 URL (개발 또는 프로덕션 환경에 따라 다를 수 있음) */
    APP_URL: string;
  }
}

interface UpdateProgressInfo {
  bytesPerSecond: number;
  percent: number;
  transferred: number;
  total: number;
}

interface UpdateInfo {
  version: string;
  files: Array<{ url: string; sha512: string; size: number }>;
  path: string;
  sha512: string;
  releaseDate: string;
  releaseName?: string;
  releaseNotes?: string;
}

interface UpdateError {
  code: string;
  message: string;
  stack?: string;
}

type UpdateStatusInfo =
  | { status: 'checking' }
  | { status: 'available'; info: UpdateInfo }
  | { status: 'not-available'; info: UpdateInfo }
  | { status: 'error'; error: UpdateError }
  | { status: 'progress'; info: UpdateProgressInfo }
  | { status: 'downloaded'; info: UpdateInfo };

interface Window {
  electronUpdater: {
    checkForUpdates: () => void;
    startUpdate: () => void;
    installUpdate: () => void;
    onUpdateStatus: (
      callback: (status: UpdateStatusInfo['status'], info?: UpdateInfo | UpdateProgressInfo | UpdateError) => void,
    ) => void;
    removeUpdateStatusListener: () => void;
    testUpdate: () => void;
  };
  myAPI: {
    /**
     * 애플리케이션 창을 항상 위에 표시할지 여부를 설정합니다.
     *
     * @param alwaysOnTop - true이면 창을 항상 위에 표시하고, false이면 일반 창으로 표시합니다.
     */
    setAlwaysOnTop: (alwaysOnTop: boolean) => void;
    isSnap: () => boolean;
  };
}
