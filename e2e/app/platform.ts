/**
 * What the app layer shares across host OSes: the profile shape, the environment contract, the app identifier.
 * Linux (env-linux.ts): Xvfb + private D-Bus + temp profile. Windows (env-windows.ts): the runner's own desktop and
 * its real per-user app-data folders (CI only).
 */
import type { ClipboardAccess } from '../drivers/WdioApp';

export const IDENTIFIER = 'io.github.from104.qcalc'; // src-tauri/tauri.conf.json
export const isWindows = process.platform === 'win32';
/** Playwright project / CalcApp.platform of the real-app drivers */
export const APP_PLATFORM = isWindows ? 'tauri-windows' : 'tauri-linux';
/** the e2e binary (build.mjs output) */
export const DEFAULT_BINARY = `src-tauri/target/e2e-app/${isWindows ? 'qcalc.exe' : 'qcalc'}`;

/**
 * Where the app keeps its files. The app's own subfolder is `<dir>/<IDENTIFIER>` in `config` (window-size.json,
 * boot-bg.txt, .window-state.json) and `data` (logs, WebView/WebKit storage).
 * Linux: temp dirs standing in for XDG_*. Windows: %APPDATA% (config) and %LOCALAPPDATA% (data).
 */
export interface ProfileDirs {
  root: string;
  home: string;
  config: string;
  data: string;
  cache: string;
  runtime: string;
}

/** a running isolated environment: tauri-driver is up, `env` is for helper processes that must live in the same session */
export interface AppEnv {
  token: string;
  driverPort: number;
  driverPid: number;
  profile: ProfileDirs;
  env: NodeJS.ProcessEnv;
  /** one line for the log */
  describe: string;
  stop(): Promise<{ orphans: string[] }>;
}

/** system clipboard as another program sees it, plus its lifecycle */
export interface AppClipboard extends ClipboardAccess {
  stop(): Promise<void>;
}
