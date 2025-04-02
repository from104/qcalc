// Start Generation Here
/**
 * @file electron-preload.ts
 * @description 이 파일은 Electron 애플리케이션의 프리로드 스크립트를 정의합니다.
 *              메인 프로세스와 렌더러 프로세스 간의 안전한 상호작용을 가능하게 하며,
 *              전역 객체에 API를 노출하여 애플리케이션의 기능을 확장합니다.
 *              또한, 자동 업데이트 기능과 관련된 이벤트를 처리하는 메서드를 포함하고 있습니다.
 */

import { contextBridge, ipcRenderer } from 'electron';

const isSnap = process.platform === 'linux' && !!process.env.SNAP;

// 메인 월드에 myAPI 객체 노출
contextBridge.exposeInMainWorld('electron', {
  /**
   * 창을 항상 위에 표시할지 여부를 설정하는 함수
   * @param {boolean} alwaysOnTop - true면 항상 위에 표시, false면 일반 표시
   */
  setAlwaysOnTop: (alwaysOnTop: boolean) => {
    // 메인 프로세스에 'toggle-always-on-top' 이벤트 전송
    ipcRenderer.send('toggle-always-on-top', alwaysOnTop);
  },
  /**
   * 앱을 종료하는 함수
   */
  quitApp: () => {
    ipcRenderer.send('quit-app');
  },
  isSnap: isSnap,
});

contextBridge.exposeInMainWorld('electronUpdater', {
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  startUpdate: () => ipcRenderer.send('start-update'),
  installUpdate: () => ipcRenderer.send('install-update'),
  onUpdateStatus: (
    callback: (status: UpdateStatusInfo['status'], info?: UpdateInfo | UpdateProgressInfo | UpdateError) => void,
  ) => {
    ipcRenderer.on('update-status', (_event, status, info) => callback(status, info));
  },
  removeUpdateStatusListener: () => {
    ipcRenderer.removeAllListeners('update-status');
  },
  testUpdate: () => ipcRenderer.send('test-update'),
});
