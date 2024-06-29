import {fileURLToPath} from 'url';
import path from 'path';
import os from 'os';
import {app, BrowserWindow, nativeTheme, ipcMain, screen} from 'electron';

const currentDir = fileURLToPath(new URL('.', import.meta.url));

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'));
  }
} catch (_) {
  /* empty */
}

import windowState from 'electron-window-state';
import { c } from 'vite/dist/node/types.d-aGj9QkWt';

let mainWindow: BrowserWindow | undefined;

const iconPath = path.resolve(currentDir, 'icons/icon.png');

const defaultWindowWidth = 352;
const defaultWindowHeight = 604;

// 플랫폼에 따라 창 크기 보정
const adjustedWidth = platform === 'win32' ? -15 : 0;
const adjustedHeight = platform === 'win32' ? -40 : 0;

// 플랫폼에 따라 창 위치 보정
const adjustedY = platform === 'linux' ? -38 : 0;
const adjustedX = platform === 'linux' ? 0 : 0;

// 창 생성
async function createWindow() {
  try {
    // 화면 크기와 방향 확인
    const {width, height} = screen.getPrimaryDisplay().workAreaSize;
    const isLandscape = width > height;

    // 최대 창 크기 설정
    const maxWindowHeight = isLandscape ? Math.floor((height / 3) * 2) : Math.floor(height / 3);
    const maxWindowWidth = isLandscape ? Math.floor(width / 4) : Math.floor(width / 3);

    const mainWindowState = windowState({
      defaultWidth: defaultWindowWidth,
      defaultHeight: defaultWindowHeight,
    });
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
      icon: path.resolve(iconPath), // tray icon
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
        // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
        preload: path.resolve(
          currentDir,
          path.join(
            process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
            'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
          ),
        ),
      },
    });

    mainWindowState.manage(mainWindow);

    mainWindow.removeMenu();

    if (process.env.DEV) {
      mainWindow.loadURL(process.env.APP_URL);
    } else {
      mainWindow.loadFile('index.html');
    }

    if (process.env.DEBUGGING) {
      // if on DEV or Production with debug enabled
      mainWindow.webContents.openDevTools();
    } else {
      // we're on production; no access to devtools pls
      mainWindow.webContents.on('devtools-opened', () => {
        mainWindow?.webContents.closeDevTools();
      });
    }

    mainWindow.on('closed', () => {
      mainWindow = undefined;
    });

    mainWindow.once('ready-to-show', () => {
      mainWindow?.show();
    });
  } catch (error) {
    console.error('Failed to create window:', error);
  }
}

app
  .whenReady()
  .then(() => {
    createWindow().catch((err) => {
      console.error('Failed to create window during app readiness:', err);
    });
    ipcMain.on('toggle-always-on-top', (_event, res) => {
      mainWindow?.setAlwaysOnTop(res);
      // console.log('ipcMain: ' + res);
    });
  })
  .catch((err) => {
    console.error('Failed during app readiness:', err);
  });

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow().catch((err) => {
      console.error('Failed to create window during activation:', err);
    });
  }
});
