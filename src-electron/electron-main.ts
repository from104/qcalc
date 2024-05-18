import { fileURLToPath } from 'url';
import path from 'path';
import os from 'os';
import {
  app, BrowserWindow, nativeTheme, ipcMain,
} from 'electron';

const currentDir = fileURLToPath(new URL('.', import.meta.url))

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(
      path.join(app.getPath('userData'), 'DevTools Extensions'),
    );
  }
} catch (_) { /* empty */ }

import windowState from 'electron-window-state';

let mainWindow: BrowserWindow | undefined;

async function createWindow() {
  try {
    const mainWindowState = windowState({
      defaultWidth: 352,
      defaultHeight: 505,
    });
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
      icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 352,
      minHeight: 505,
      useContentSize: true,
      resizable: true,
      webPreferences: {
        contextIsolation: true,
        // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
        preload: path.resolve(
          currentDir,
          path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER, 'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION)
        ),
      }
    });

    mainWindowState.manage(mainWindow);

    mainWindow.removeMenu();
    mainWindow.loadURL(process.env.APP_URL);

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
  } catch (error) {
    console.error('Failed to create window:', error);
  }
}

app.whenReady().then(() => {
  createWindow().catch(err => {
    console.error('Failed to create window during app readiness:', err);
  });
  ipcMain.on('toggle-always-on-top', (_event, res) => {
    mainWindow?.setAlwaysOnTop(res);
    // console.log('ipcMain: ' + res);
  });
}).catch(err => {
  console.error('Failed during app readiness:', err);
});

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow().catch(err => {
      console.error('Failed to create window during activation:', err);
    });
  }
});
