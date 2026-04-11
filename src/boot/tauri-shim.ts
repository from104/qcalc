/**
 * @file tauri-shim.ts
 * @description Tauri 환경에서 기존 src/가 사용하는 `window.electron` / `window.electronUpdater`
 *              인터페이스를 Tauri API로 매핑해 노출한다. Electron 빌드에서는 아무 동작도 하지 않는다.
 *              이 shim 덕분에 src/ 본체는 Electron/Tauri 분기 없이 동일한 코드를 사용한다.
 */

import { defineBoot } from '#q-app/wrappers';

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

  // tauri-plugin-updater는 endpoints/pubkey 설정이 갖춰진 뒤 활성화한다.
  // 그 전까지는 'not-available'만 보고하는 no-op shim으로 둔다.
  let updateStatusListener: ((status: UpdateStatusInfo['status']) => void) | null = null;

  window.electronUpdater = {
    checkForUpdates: () => {
      updateStatusListener?.('not-available');
    },
    startUpdate: () => {
      /* no-op until tauri-plugin-updater is wired */
    },
    installUpdate: () => {
      /* no-op until tauri-plugin-updater is wired */
    },
    onUpdateStatus: (callback) => {
      updateStatusListener = callback;
    },
    removeUpdateStatusListener: () => {
      updateStatusListener = null;
    },
    testUpdate: () => {
      updateStatusListener?.('not-available');
    },
  };
});
