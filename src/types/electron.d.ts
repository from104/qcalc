/**
 * Electron 관련 타입 정의
 */

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
  electron: {
    /**
     * 애플리케이션 창을 항상 위에 표시할지 여부를 설정합니다.
     *
     * @param alwaysOnTop - true이면 창을 항상 위에 표시하고, false이면 일반 창으로 표시합니다.
     */
    setAlwaysOnTop: (alwaysOnTop: boolean) => void;

    /**
     * snap 환경인지 확인합니다.
     */
    isSnap: boolean;
  };
}
