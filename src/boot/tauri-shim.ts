/**
 * @file tauri-shim.ts
 * @description Tauri 환경에서 기존 src/가 사용하는 `window.electron` / `window.electronUpdater`
 *              인터페이스를 Tauri API로 매핑해 노출한다. Electron 빌드에서는 아무 동작도 하지 않는다.
 *              이 shim 덕분에 src/ 본체는 Electron/Tauri 분기 없이 동일한 코드를 사용한다.
 */

import { defineBoot } from '#q-app/wrappers';
import type { Update } from '@tauri-apps/plugin-updater';
import { computeDownloadPercent } from 'src/utils/TauriUpdaterUtils';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

type PackageEnv = 'snap' | 'flatpak' | 'appimage' | 'native';

export default defineBoot(async () => {
  if (!isTauri) return;

  const [{ invoke }, { getCurrentWindow }] = await Promise.all([
    import('@tauri-apps/api/core'),
    import('@tauri-apps/api/window'),
  ]);

  let packageEnv: PackageEnv = 'native';
  try {
    packageEnv = await invoke<PackageEnv>('get_package_env');
  } catch (err) {
    console.warn('[tauri-shim] get_package_env failed', err);
  }

  const appWindow = getCurrentWindow();

  window.electron = {
    setAlwaysOnTop: (alwaysOnTop: boolean) => {
      void appWindow.setAlwaysOnTop(alwaysOnTop);
    },
    quitApp: () => {
      void invoke('quit_app');
    },
    isSnap: packageEnv === 'snap',
  };

  // Tauri는 document.title 변경이 네이티브 창 제목에 자동 전파되지 않는다.
  // Quasar의 useMeta가 <title>의 textContent(characterData)를 갱신하거나
  // <title> 엘리먼트 자체를 교체할 수 있으므로 <head> 전체를 관찰한다.
  const syncTitle = () => {
    if (document.title) {
      appWindow.setTitle(document.title).catch((e) => {
        console.error('[tauri-shim] setTitle failed', e);
      });
    }
  };
  new MutationObserver(syncTitle).observe(document.head, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  syncTitle();

  // tauri-plugin-updater 브릿지.
  // tauri.conf.json의 plugins.updater(pubkey + endpoints)가 설정되지 않은 상태에서는
  // check() 호출이 에러로 반환되며, 해당 에러는 리스너에 'not-available'로 보고된다
  // (Electron의 "업데이트 없음" 동작과 동일).
  type UpdateCallback = (
    status: UpdateStatusInfo['status'],
    info?: UpdateInfo | UpdateProgressInfo | UpdateError,
  ) => void;
  let updateStatusListener: UpdateCallback | null = null;

  // tauri-plugin-updater의 Update 객체를 캐시하여 startUpdate에서 재사용한다.
  let pendingUpdate: Update | null = null;

  const toUpdateInfo = (u: Update): UpdateInfo => ({
    version: u.version,
    files: [],
    path: '',
    sha512: '',
    releaseDate: u.date ?? '',
    releaseName: u.version,
    releaseNotes: u.body ?? '',
  });

  const loadUpdater = () => import('@tauri-apps/plugin-updater');

  window.electronUpdater = {
    checkForUpdates: () => {
      updateStatusListener?.('checking');
      loadUpdater()
        .then(({ check }) => check())
        .then((update) => {
          if (update) {
            pendingUpdate = update;
            updateStatusListener?.('available', toUpdateInfo(update));
          } else {
            pendingUpdate = null;
            updateStatusListener?.('not-available');
          }
        })
        .catch((err: unknown) => {
          // 설정 미완(pubkey/endpoints 없음) 또는 Snap/Flatpak 등 sandboxed는 여기로 떨어진다.
          // 사용자에겐 "업데이트 없음"과 동일하게 보고한다.
          console.warn('[tauri-shim] updater check failed', err);
          updateStatusListener?.('not-available');
        });
    },
    startUpdate: () => {
      if (!pendingUpdate) {
        updateStatusListener?.('not-available');
        return;
      }
      // Started의 contentLength(전체 크기)와 Progress의 chunkLength(증분)를 누적해 percent를 계산한다.
      let totalBytes = 0;
      let downloadedBytes = 0;
      pendingUpdate
        .downloadAndInstall((event) => {
          switch (event.event) {
            case 'Started': {
              totalBytes = event.data.contentLength ?? 0;
              downloadedBytes = 0;
              updateStatusListener?.('progress', {
                bytesPerSecond: 0,
                percent: 0,
                transferred: 0,
                total: totalBytes,
              });
              break;
            }
            case 'Progress': {
              downloadedBytes += event.data.chunkLength;
              updateStatusListener?.('progress', {
                bytesPerSecond: 0,
                percent: computeDownloadPercent(downloadedBytes, totalBytes),
                transferred: downloadedBytes,
                total: totalBytes,
              });
              break;
            }
            case 'Finished': {
              if (pendingUpdate) updateStatusListener?.('downloaded', toUpdateInfo(pendingUpdate));
              break;
            }
          }
        })
        .catch((err: unknown) => {
          console.error('[tauri-shim] updater download/install failed', err);
          const error: UpdateError = {
            code: 'UPDATER_FAILED',
            message: err instanceof Error ? err.message : String(err),
            ...(err instanceof Error && err.stack ? { stack: err.stack } : {}),
          };
          updateStatusListener?.('error', error);
        });
    },
    installUpdate: () => {
      // Tauri의 downloadAndInstall이 설치+재시작까지 처리하므로 별도 액션 불필요.
      // Electron 호환성을 위한 no-op.
    },
    onUpdateStatus: (callback) => {
      updateStatusListener = callback;
    },
    removeUpdateStatusListener: () => {
      updateStatusListener = null;
    },
    testUpdate: () => {
      updateStatusListener?.('checking');
      updateStatusListener?.('not-available');
    },
  };
});
