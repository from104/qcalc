/**
 * One WebDriver session = one running app process. Relaunching = a new session (tauri-driver starts the app again).
 *
 * The app's profile (config, WebKit/WebView2 localStorage, cache) lives in the isolated temp dirs set up by
 * env-linux.ts (Windows: the runner's real %APPDATA%/%LOCALAPPDATA% folders of the app, env-windows.ts); every launch
 * of the worker uses the same profile, so "relaunch" really tests persistence. `wipeProfile()` gives a
 * first-install state.
 */
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, readlinkSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { remote } from 'webdriverio';

import { recordPids, webviewDataDir, wipeAppData } from './env-windows';
import { IDENTIFIER, isWindows, type ProfileDirs } from './platform';
import { descendants, isAlive, terminate, waitExit } from './procs';
import { treeOf } from './procs-win';

export interface SessionOptions {
  driverPort: number;
  driverPid: number;
  binary: string;
  profile: ProfileDirs;
}

export class AppSession {
  private current: WebdriverIO.Browser | null = null;
  /** e.g. 'tauri://localhost' — read from the first document of every launch */
  origin = '';
  launches = 0;
  /** Windows: asking for the process list costs ~1s, so remember the app PID while it is alive */
  private cachedPid: number | null = null;

  constructor(readonly options: SessionOptions) {}

  get browser(): WebdriverIO.Browser {
    if (!this.current) throw new Error('the app is not running (no WebDriver session)');
    return this.current;
  }

  async launch(): Promise<void> {
    this.current = await remote({
      hostname: '127.0.0.1',
      port: this.options.driverPort,
      logLevel: 'silent', // failures surface as thrown errors; expected ones (app quitting) would only be noise
      // never resend a command: a retried "actions" would press keys twice
      connectionRetryCount: 0,
      // msedgedriver gives WebView2 60s to come up before it answers the new-session request with its own error;
      // a shorter client timeout only ever shows "Request timed out" and hides that error (first Windows CI run)
      connectionRetryTimeout: isWindows ? 120_000 : 30_000,
      capabilities: {
        'tauri:options': {
          application: this.options.binary,
          // Windows: tauri-driver passes these to msedgedriver (ms:edgeOptions.args); a user-data-dir keeps the same
          // WebView2 profile across relaunches instead of a new temp one per session
          ...(isWindows ? { args: [`--user-data-dir=${webviewDataDir()}`] } : {}),
        },
        // classic WebDriver only — WebKitWebDriver's BiDi support is partial (msedgedriver: not needed either)
        'wdio:enforceWebDriverClassic': true,
      } as WebdriverIO.Capabilities,
    });
    const url = new URL(await this.current.getUrl());
    // URL.origin is 'null' for non-special schemes such as tauri:
    this.origin = `${url.protocol}//${url.host}`;
    this.launches++;
    this.cachedPid = null;
    if (isWindows) {
      const pid = this.appPid();
      this.webviewHelpers = pid ? descendants(pid) : [];
      if (pid) recordPids(path.resolve('test-results'), [pid, ...this.webviewHelpers]);
      logWebviewProfile(this.webviewHelpers);
    }
  }

  /** Windows: the WebView2 browser processes under the app at launch (they hold localStorage until they shut down) */
  private webviewHelpers: number[] = [];

  /** PID of the app process (child of WebKitWebDriver, under our tauri-driver), or null */
  appPid(): number | null {
    const binary = path.resolve(this.options.binary);
    if (isWindows) {
      if (this.cachedPid !== null && isAlive(this.cachedPid)) return this.cachedPid;
      const wanted = binary.toLowerCase();
      const found = treeOf([this.options.driverPid]).find((p) => p.exe?.toLowerCase() === wanted);
      this.cachedPid = found?.pid ?? null;
      return this.cachedPid;
    }
    for (const pid of descendants(this.options.driverPid)) {
      try {
        if (readlinkSync(`/proc/${pid}/exe`).replace(/ \(deleted\)$/, '') === binary) return pid;
      } catch {
        // gone
      }
    }
    return null;
  }

  isRunning(): boolean {
    return this.current !== null && this.appPid() !== null;
  }

  /** end the session — WebKitWebDriver kills the app (not a graceful exit: nothing is saved on the way out) */
  async close(): Promise<void> {
    const pid = this.appPid();
    // WebKit's network/web processes: they outlive the app for a moment and keep writing to the profile
    const helpers = pid ? descendants(pid) : [];
    try {
      await this.current?.deleteSession();
    } catch {
      // the app may already be gone
    }
    this.current = null;
    this.cachedPid = null;
    if (pid && !(await waitExit(pid, 5000))) await terminate([pid]);
    const deadline = Date.now() + 2000;
    while (helpers.some(isAlive) && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 50));
    await terminate(helpers);
  }

  /** the app quit by itself (q key, quit_app): wait for the process to end and drop the dead session */
  async awaitExit(timeoutMs = 10_000): Promise<boolean> {
    const pid = this.appPid();
    const exited = pid === null || (await waitExit(pid, timeoutMs));
    if (exited && isWindows) {
      // WebView2 writes localStorage to disk on its own shutdown, after the app process is gone; ending the
      // session first can take those processes down before they flush (second Windows CI run: the next launch
      // came back as a first run). Let them finish by themselves.
      const started = Date.now();
      while (this.webviewHelpers.some(isAlive) && Date.now() - started < 15_000) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      const left = this.webviewHelpers.filter(isAlive);
      process.stderr.write(
        `[e2e] WebView2 after app exit: ${left.length ? `${left.length} still running` : 'all exited'} after ${Date.now() - started}ms\n`,
      );
    }
    if (!exited) return false;
    // Windows: msedgedriver's Quit takes the WebView2 profile with it, so a relaunch came back as a first run
    // (the profile folder was gone after the session). Keep a copy across the session end.
    const saved = isWindows ? saveWebviewData() : null;
    if (isWindows) {
      windowsStorageDiag('after app exit (session still open)', this.options.profile);
      findLocalStorage([tmpdir(), path.dirname(path.resolve(this.options.binary))]);
    }
    await this.close();
    if (isWindows) windowsStorageDiag('after session end', this.options.profile);
    if (saved) restoreWebviewData(saved);
    return true;
  }

  async relaunch({ fresh = false } = {}): Promise<void> {
    await this.close();
    if (fresh) this.wipeProfile();
    else if (isWindows) windowsStorageDiag('after quit', this.options.profile);
    await this.launch();
    if (!fresh && isWindows) {
      const seen = await this.current!.execute(
        () => `${location.origin} · ${localStorage.length} keys: ${Object.keys(localStorage).join(',').slice(0, 200)}`,
      );
      process.stderr.write(`[e2e] storage after relaunch: ${seen}\n`);
    }
  }

  /** first-install state: empty config, data (WebKit storage) and cache. Only while the app is not running. */
  wipeProfile(): void {
    if (isWindows) return wipeAppData(this.options.profile);
    const { root } = this.options.profile;
    // belt and braces: only ever delete inside our own temp profile
    if (!path.resolve(root).startsWith(path.join(tmpdir(), 'qcalc-e2e-app-'))) {
      throw new Error(`refusing to wipe ${root}: not an e2e temp profile`);
    }
    for (const dir of [this.options.profile.config, this.options.profile.data, this.options.profile.cache]) {
      // WebKit's helper processes can outlive the app by a moment and still write storage files (ENOTEMPTY)
      for (const entry of readdirSync(dir)) {
        rmSync(path.join(dir, entry), { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
      }
    }
  }
}

/**
 * Windows relaunch diagnostics (the relaunched app came back as a first run): where WebView2 keeps Local Storage
 * under the app's data folder, how big and how fresh the files are, and whether the e2e seed ("showTips") is in them.
 */
function windowsStorageDiag(label: string, profile: ProfileDirs): void {
  const root = path.join(profile.data, IDENTIFIER);
  const lines: string[] = [];
  const walk = (dir: string, depth: number): void => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full);
      if (entry.isDirectory()) {
        if (depth < 3) lines.push(`${rel}\\`);
        if (depth < 8) walk(full, depth + 1);
      } else if (/Local Storage/i.test(rel)) {
        try {
          const stat = statSync(full);
          const seeded = readFileSync(full).includes('showTips') ? ' [has showTips]' : '';
          lines.push(`${rel} ${stat.size}B ${stat.mtime.toISOString()}${seeded}`);
        } catch (error) {
          lines.push(`${rel} (unreadable: ${String(error).slice(0, 80)})`);
        }
      }
    }
  };
  walk(root, 0);
  process.stderr.write(`[e2e] storage ${label} (${root}):\n  ${lines.join('\n  ') || '(empty)'}\n`);
}

/** copy the app's WebView2 profile aside (null when there is none) */
function saveWebviewData(): string | null {
  const source = webviewDataDir();
  if (!existsSync(source)) return null;
  const copy = path.join(tmpdir(), `qcalc-e2e-webview-${process.pid}`);
  rmSync(copy, { recursive: true, force: true });
  // lock files of a profile that is still being closed are skipped, the data files are what matters
  cpSync(source, copy, { recursive: true, force: true, filter: (from) => !/[\\/](lockfile|LOCK)$/i.test(from) });
  return copy;
}

/** put a saved WebView2 profile back where the next launch will look for it */
function restoreWebviewData(copy: string): void {
  const target = webviewDataDir();
  rmSync(target, { recursive: true, force: true, maxRetries: 20, retryDelay: 250 });
  cpSync(copy, target, { recursive: true });
  rmSync(copy, { recursive: true, force: true });
}

/** diagnostics: every "Local Storage" folder a few levels under these roots (where WebView2 really keeps its profile) */
function findLocalStorage(roots: string[]): void {
  const found: string[] = [];
  const walk = (dir: string, depth: number): void => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const full = path.join(dir, entry.name);
      if (entry.name === 'Local Storage') {
        let seeded = false;
        try {
          const leveldb = path.join(full, 'leveldb');
          seeded = readdirSync(leveldb).some((name) => readFileSync(path.join(leveldb, name)).includes('showTips'));
        } catch {
          // unreadable or still locked
        }
        found.push(`${full}${seeded ? ' [has showTips]' : ''}`);
      } else if (depth < 5) walk(full, depth + 1);
    }
  };
  for (const root of roots) walk(root, 0);
  process.stderr.write(
    `[e2e] Local Storage folders under ${roots.join(' | ')}:\n  ${found.join('\n  ') || '(none)'}\n`,
  );
}

/** diagnostics: the profile folder the WebView2 browser processes really run with (their --user-data-dir) */
function logWebviewProfile(pids: number[]): void {
  if (!pids.length) return;
  const filter = pids.map((pid) => `ProcessId=${pid}`).join(' OR ');
  const r = spawnSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      `Get-CimInstance Win32_Process -Filter "${filter}" | ForEach-Object { $_.CommandLine }`,
    ],
    { encoding: 'utf8', timeout: 20_000, windowsHide: true },
  );
  const out = `${r.stdout ?? ''}`;
  const dirs = [...new Set(out.match(/--user-data-dir=("[^"]+"|\S+)/g) ?? [])];
  const browser =
    out.split(/\r?\n/).find((line) => line.includes('--user-data-dir') && !line.includes('--type=')) ?? '';
  process.stderr.write(
    `[e2e] WebView2 profile: ${dirs.join(' | ') || '(no --user-data-dir)'}\n[e2e] WebView2 browser command line: ${browser.slice(0, 700) || (r.stderr ?? '').slice(0, 300)}\n`,
  );
}
