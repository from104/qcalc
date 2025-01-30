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
