/**
 * The Tauri app on Windows — CI only (GitHub's windows-latest runner, an interactive desktop session).
 *
 *  - No Xvfb, no D-Bus: the app opens a real window on the runner's desktop.
 *  - tauri-driver → msedgedriver (--native-driver) → the app (WebView2). msedgedriver must match the runner's
 *    WebView2 runtime; the workflow fetches it (msedgedriver-tool) and passes the path in QCALC_E2E_NATIVE_DRIVER.
 *  - Data isolation is NOT possible: Tauri/WebView2 resolve the app's folders through Known Folder APIs, not env vars
 *    (config + .window-state.json + boot-bg.txt in %APPDATA%\<identifier>, logs + WebView2 storage in
 *    %LOCALAPPDATA%\<identifier>). So this layer refuses to run unless CI=true (or QCALC_E2E_ALLOW_REAL_PROFILE=1)
 *    and deletes exactly those two folders before the run, between fresh launches, and after the run.
 *  - Processes are tracked by PID (procs-win.ts): tauri-driver and its tree are recorded in
 *    test-results/.app-run.json and ended with `taskkill /T /F /PID`.
 */
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';

import { MARKER, describePid, isAlive, terminate } from './procs';
import { listProcesses, treeOf } from './procs-win';
import { IDENTIFIER, type AppEnv, type ProfileDirs } from './platform';
import { freePort, waitHttp, which } from './util';

/** the guard: this layer deletes the app's real per-user folders, so only a throwaway CI machine may run it */
export function assertDisposableMachine(): void {
  if (process.env.CI === 'true' || process.env.QCALC_E2E_ALLOW_REAL_PROFILE === '1') return;
  throw new Error(
    'the Windows app layer wipes %APPDATA%\\' +
      IDENTIFIER +
      ' and %LOCALAPPDATA%\\' +
      IDENTIFIER +
      ' (Tauri/WebView2 cannot be redirected). Run it on CI (CI=true), or set QCALC_E2E_ALLOW_REAL_PROFILE=1 on a machine whose QCalc data you do not need.',
  );
}

function appDataDirs(): { config: string; data: string } {
  const config = process.env.APPDATA;
  const data = process.env.LOCALAPPDATA;
  if (!config || !data) throw new Error('%APPDATA% / %LOCALAPPDATA% are not set');
  return { config, data };
}

export function windowsProfile(): ProfileDirs {
  const { config, data } = appDataDirs();
  return { root: config, home: homedir(), config, data, cache: data, runtime: tmpdir() };
}

/** delete the app's own folders (nothing else in %APPDATA% / %LOCALAPPDATA%). Only while the app is not running. */
export function wipeAppData(profile: ProfileDirs = windowsProfile()): void {
  assertDisposableMachine();
  for (const base of new Set([profile.config, profile.data])) {
    const dir = path.join(base, IDENTIFIER);
    // belt and braces: never anything but the app's identifier folder directly under a per-user app-data folder
    if (path.basename(dir) !== IDENTIFIER || path.dirname(dir) !== base) throw new Error(`refusing to wipe ${dir}`);
    // WebView2 helper processes can outlive the app for a moment and keep files open
    rmSync(dir, { recursive: true, force: true, maxRetries: 20, retryDelay: 250 });
  }
}

export function nativeDriverPath(): string | null {
  const fromEnv = process.env.QCALC_E2E_NATIVE_DRIVER;
  if (fromEnv) return existsSync(fromEnv) ? fromEnv : null;
  return which('msedgedriver');
}

export function tauriDriverPath(): string | null {
  if (process.env.TAURI_DRIVER) return process.env.TAURI_DRIVER;
  const cargoBin = path.join(homedir(), '.cargo', 'bin', 'tauri-driver.exe');
  return which('tauri-driver') ?? (existsSync(cargoBin) ? cargoBin : null);
}

/**
 * tauri-driver starts msedgedriver with stdout → null and no log flags, so a hanging new-session request leaves no
 * trace (first CI run: 65 × "Request timed out" on POST /session, empty driver logs). Hand it a .cmd wrapper that adds
 * `--verbose --log-path` instead — the whole msedgedriver ↔ WebView2 conversation lands in test-results/.
 */
function loggedNativeDriver(nativeDriver: string, logDir: string): string {
  const wrapper = path.join(logDir, 'msedgedriver-logged.cmd');
  const log = path.join(logDir, 'app-msedgedriver.log');
  writeFileSync(wrapper, `@"${nativeDriver}" %* --verbose "--log-path=${log}"\r\n`);
  return wrapper;
}

export function missingTools(): string[] {
  const missing: string[] = [];
  if (!tauriDriverPath()) missing.push('tauri-driver (cargo install tauri-driver --locked)');
  if (!nativeDriverPath())
    missing.push('msedgedriver matching the WebView2 runtime (QCALC_E2E_NATIVE_DRIVER=<path to msedgedriver.exe>)');
  return missing;
}

const RUN_FILE = '.app-run.json';

/** pids test-suite.sh may end after a crash (it only ever touches these exact PIDs, and only for known image names) */
export function recordPids(logDir: string, pids: number[]): void {
  const file = path.join(logDir, RUN_FILE);
  try {
    const run = JSON.parse(readFileSync(file, 'utf8')) as { pids?: number[] };
    run.pids = [...new Set([...(run.pids ?? []), ...pids])];
    writeFileSync(file, JSON.stringify(run) + '\n');
  } catch {
    // the run file is only a crash-recovery aid
  }
}

export async function startWindowsEnv({ logDir }: { logDir: string }): Promise<AppEnv> {
  assertDisposableMachine();
  const driverBin = tauriDriverPath();
  const nativeDriver = nativeDriverPath();
  if (!driverBin || !nativeDriver) throw new Error(`missing: ${missingTools().join(', ')}`);

  const token = randomUUID();
  const profile = windowsProfile();
  mkdirSync(logDir, { recursive: true });
  writeFileSync(path.join(logDir, RUN_FILE), JSON.stringify({ token, profile: null, pids: [] }) + '\n');
  wipeAppData(profile);

  const env: NodeJS.ProcessEnv = { ...process.env, [MARKER]: token };
  for (const key of ['QCALC_DEVTOOLS']) delete env[key];

  const log = (name: string) => openSync(path.join(logDir, `app-${name}.log`), 'w');
  const stop = async () => {
    // one snapshot of the whole tree under tauri-driver (msedgedriver, the app, WebView2 helpers), then end it
    const tree = driver.pid ? treeOf([driver.pid]).map((p) => p.pid) : [];
    const described = new Map(listProcesses().map((p) => [p.pid, `${p.pid} ${p.name}`]));
    await terminate([...tree].reverse());
    const orphans = tree.filter(isAlive).map((pid) => described.get(pid) ?? describePid(pid));
    if (process.env.E2E_KEEP_PROFILE !== '1') {
      try {
        wipeAppData(profile);
      } catch (error) {
        console.warn(`[app] could not clean the app data folders: ${String(error)}`);
      }
    }
    return { orphans };
  };

  const [driverPort, nativePort] = [await freePort(), await freePort()];
  const driver = spawn(
    driverBin,
    [
      '--port',
      String(driverPort),
      '--native-port',
      String(nativePort),
      '--native-driver',
      loggedNativeDriver(nativeDriver, logDir),
    ],
    { env, stdio: ['ignore', log('driver'), log('driver-stderr')], windowsHide: true },
  );
  if (!driver.pid) throw new Error('tauri-driver did not start');
  recordPids(logDir, [driver.pid]);
  try {
    await waitHttp(`http://127.0.0.1:${driverPort}/status`, 30_000);
    recordPids(
      logDir,
      treeOf([driver.pid]).map((p) => p.pid),
    ); // msedgedriver, if tauri-driver already started it
  } catch (error) {
    await stop();
    throw error;
  }

  return {
    token,
    driverPort,
    driverPid: driver.pid,
    profile,
    env,
    describe: `Windows desktop session, app data ${path.join(profile.config, IDENTIFIER)}`,
    stop,
  };
}
