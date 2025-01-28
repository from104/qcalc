// 필요한 모듈 가져오기
import { fileURLToPath } from 'url';
import path from 'path';
import os from 'os';
import { app, BrowserWindow, nativeTheme, ipcMain, screen } from 'electron';
import windowState from 'electron-window-state';
import useAutoUpdate from 'electron-updater';

const { autoUpdater } = useAutoUpdate;
// snap 환경인지 확인하는 함수
const isSnap = (): boolean => {
  return process.platform === 'linux' && process.env.SNAP !== undefined;
};

// 현재 디렉토리 경로 설정
const currentDir = fileURLToPath(new URL('.', import.meta.url));

// 플랫폼 확인 (Linux에서 process가 정의되지 않은 경우를 대비)
const platform = process.platform || os.platform();

// Windows에서 다크 모드일 때 DevTools Extensions 제거 시도
try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    const fs = await import('fs');
    const path = await import('path');
    fs.unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'));
  }
} catch (error) {
  // 오류 발생 시 무시
  console.error('Failed to remove DevTools Extensions:', error);
}

// 메인 윈도우 변수 선언
let mainWindow: BrowserWindow | undefined;

// 아이콘 경로 설정
const iconPath = path.resolve(currentDir, 'icons/icon.png');

// 기본 윈도우 크기 설정
const defaultWindowWidth = 352;
const defaultWindowHeight = 604;

// 플랫폼에 따른 윈도우 크기 조정
const adjustedWidth = platform === 'win32' ? -15 : 0;
const adjustedHeight = platform === 'win32' ? -40 : 0;

// 플랫폼에 따른 윈도우 위치 조정
const adjustedY = platform === 'linux' ? -38 : 0;
const adjustedX = platform === 'linux' ? 0 : 0;

// 개발 환경에서도 업데이트 테스트가 가능하도록 수정
const checkForUpdates = async () => {
  if (process.env.DEV) {
    // 개발 환경에서 테스트용 설정
    autoUpdater.updateConfigPath = path.join(currentDir, 'dev-app-update.yml');
  }
  try {
    await autoUpdater.checkForUpdates();
  } catch (err) {
    console.error('Error occurred while checking for updates:', err);
  }
};

// 윈도우 생성 함수
async function createWindow() {
  try {
    // snap이 아닐 경우에만 자동 업데이트 설정
    if (!isSnap()) {
      autoUpdater.autoDownload = false;
      autoUpdater.autoInstallOnAppQuit = true;

      // 업데이트 이벤트 처리
      autoUpdater.on('checking-for-update', () => {
        mainWindow?.webContents.send('update-status', 'checking');
      });

      autoUpdater.on('update-available', (info) => {
        mainWindow?.webContents.send('update-status', 'available', info);
      });

      autoUpdater.on('update-not-available', (info) => {
        mainWindow?.webContents.send('update-status', 'not-available', info);
      });

      autoUpdater.on('error', (err) => {
        mainWindow?.webContents.send('update-status', 'error', err);
      });

      autoUpdater.on('download-progress', (progressObj) => {
        mainWindow?.webContents.send('update-status', 'progress', progressObj);
      });

      autoUpdater.on('update-downloaded', (info) => {
        mainWindow?.webContents.send('update-status', 'downloaded', info);
      });
    }

    // 화면 크기와 방향 확인
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const isLandscape = width > height;

    // 최대 윈도우 크기 설정
    const maxWindowHeight = isLandscape ? Math.floor((height / 3) * 2) : Math.floor(height / 3);
    const maxWindowWidth = isLandscape ? Math.floor(width / 2) : Math.floor((width / 3) * 2);

    // 윈도우 상태 관리 설정
    const mainWindowState = windowState({
      defaultWidth: defaultWindowWidth,
      defaultHeight: defaultWindowHeight,
    });

    // 메인 윈도우 생성
    mainWindow = new BrowserWindow({
      icon: path.resolve(iconPath), // 트레이 아이콘
      x: mainWindowState.x + adjustedX,
      y: mainWindowState.y + adjustedY,
      width: mainWindowState.width + adjustedWidth,
      height: mainWindowState.height + adjustedHeight,
      minWidth: defaultWindowWidth,
      minHeight: defaultWindowHeight,
      maxWidth: Math.max(maxWindowWidth, defaultWindowWidth),
      maxHeight: Math.max(maxWindowHeight, defaultWindowHeight),
      useContentSize: true,
      resizable: true,
      maximizable: false,
      show: false,
      webPreferences: {
        contextIsolation: true,
        // 프리로드 스크립트 설정
        preload: path.resolve(
          currentDir,
          path.join(
            process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
            'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
          ),
        ),
      },
    });

    // 윈도우 상태 관리
    mainWindowState.manage(mainWindow);

    // 메뉴 제거
    mainWindow.removeMenu();

    // 개발 모드와 프로덕션 모드에 따른 로딩 설정
    if (process.env.DEV) {
      mainWindow.loadURL(process.env.APP_URL);
    } else {
      mainWindow.loadFile('index.html');
    }

    // 디버깅 모드 설정
    if (process.env.DEBUGGING) {
      // 개발 모드 또는 디버그가 활성화된 프로덕션 모드
      mainWindow.webContents.openDevTools();
    } else {
      // 프로덕션 모드: 개발자 도구 접근 제한
      mainWindow.webContents.on('devtools-opened', () => {
        mainWindow?.webContents.closeDevTools();
      });
    }

    // 윈도우 닫힘 이벤트 처리
    mainWindow.on('closed', () => {
      mainWindow = undefined;
    });

    // 윈도우가 준비되면 업데이트 확인 시작
    mainWindow.once('ready-to-show', () => {
      mainWindow?.show();
      if (!isSnap()) {
        checkForUpdates();
      }
    });

    // IPC 이벤트 핸들러 추가
    if (!isSnap()) {
      ipcMain.on('start-update', () => {
        autoUpdater.downloadUpdate().catch((err) => {
          console.error('Error occurred during update download:', err);
        });
      });

      ipcMain.on('install-update', () => {
        autoUpdater.quitAndInstall(false, true);
      });

      ipcMain.on('check-for-updates', () => {
        if (!process.env.DEV) {
          autoUpdater.checkForUpdates().catch((err) => {
            console.error('Error occurred during update check:', err);
          });
        }
      });

      ipcMain.on('is-snap', () => {
        return isSnap();
      });
    }

    // 개발 환경에서 자세한 로그 출력
    const electronLog = await import('electron-log');
    autoUpdater.logger = electronLog.default;
    electronLog.default.transports.file.level = 'debug';

    // 개발 환경에서 테스트를 위한 IPC 이벤트 추가
    if (process.env.DEV) {
      ipcMain.on('test-update', async () => {
        try {
          await checkForUpdates();
        } catch (err) {
          console.error('Error occurred during test update check:', err);
        }
      });
    }
  } catch (error) {
    console.error('Failed to create window:', error);
  }
}

// 앱 준비 완료 시 실행
app
  .whenReady()
  .then(() => {
    createWindow().catch((err) => {
      console.error('Failed to create window during app preparation:', err);
    });

    // 항상 위에 표시 토글 이벤트 처리
    ipcMain.on('toggle-always-on-top', (_event, res) => {
      mainWindow?.setAlwaysOnTop(res);
    });
  })
  .catch((err) => {
    console.error('Error occurred during app preparation:', err);
  });

// 모든 윈도우가 닫힐 때 앱 종료 (macOS 제외)
app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

// 앱 활성화 시 윈도우 생성 (macOS)
app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow().catch((err) => {
      console.error('Failed to create window during activation:', err);
    });
  }
});
