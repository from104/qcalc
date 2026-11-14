/**
 * One WebDriver session = one running app process. Relaunching = a new session (tauri-driver starts the app again).
 *
 * The app's profile (config, WebKit localStorage, cache) lives in the isolated temp dirs set up by env-linux.ts;
 * every launch of the worker uses the same profile, so "relaunch" really tests persistence. `wipeProfile()` gives
 * a first-install state.
 */
import { readlinkSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { remote } from 'webdriverio';

import type { ProfileDirs } from './env-linux';
import { descendants, isAlive, terminate, waitExit } from './procs';

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
      connectionRetryTimeout: 30_000,
      capabilities: {
        'tauri:options': { application: this.options.binary },
        // classic WebDriver only — WebKitWebDriver's BiDi support is partial
        'wdio:enforceWebDriverClassic': true,
      } as WebdriverIO.Capabilities,
    });
    const url = new URL(await this.current.getUrl());
    // URL.origin is 'null' for non-special schemes such as tauri:
    this.origin = `${url.protocol}//${url.host}`;
    this.launches++;
  }

  /** PID of the app process (child of WebKitWebDriver, under our tauri-driver), or null */
  appPid(): number | null {
    const binary = path.resolve(this.options.binary);
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
    if (pid && !(await waitExit(pid, 5000))) await terminate([pid]);
    const deadline = Date.now() + 2000;
    while (helpers.some(isAlive) && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 50));
    await terminate(helpers);
  }

  /** the app quit by itself (q key, quit_app): wait for the process to end and drop the dead session */
  async awaitExit(timeoutMs = 10_000): Promise<boolean> {
    const pid = this.appPid();
    const exited = pid === null || (await waitExit(pid, timeoutMs));
    if (exited) await this.close();
    return exited;
  }

  async relaunch({ fresh = false } = {}): Promise<void> {
    await this.close();
    if (fresh) this.wipeProfile();
    await this.launch();
  }

  /** first-install state: empty config, data (WebKit storage) and cache. Only while the app is not running. */
  wipeProfile(): void {
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
