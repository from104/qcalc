/**
 * 이 파일은 보안상의 이유로 특별히 사용됩니다.
 * 여기서 Node.js 기능에 접근하고 렌더러 스레드에 기능을 주입할 수 있습니다.
 * (렌더러 스레드에서는 "window" 객체를 통해 접근 가능)
 *
 * 주의!
 * node_modules에서 무언가를 가져오는 경우, 해당 패키지가
 * package.json의 dependencies에 명시되어 있고 devDependencies에는 없는지 확인하세요.
 *
 * 예시 (window.myAPI.doAThing() 함수를 렌더러 스레드에 주입):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 */

// Electron의 contextBridge와 ipcRenderer 모듈 가져오기
import { contextBridge, ipcRenderer } from 'electron';

// 메인 월드에 myAPI 객체 노출
contextBridge.exposeInMainWorld('myAPI', {
  /**
   * 창을 항상 위에 표시할지 여부를 설정하는 함수
   * @param {boolean} alwaysOnTop - true면 항상 위에 표시, false면 일반 표시
   */
  setAlwaysOnTop: (alwaysOnTop: boolean) => {
    // 메인 프로세스에 'toggle-always-on-top' 이벤트 전송
    ipcRenderer.send('toggle-always-on-top', alwaysOnTop);
  },
  isSnap: () => {
    return ipcRenderer.send('is-snap');
  },
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
