/**
 * TauriApp — WdioApp plus what only the real desktop app has: IPC commands, the native window, the app process,
 * the on-disk profile, the system clipboard and the accessibility bus. Native scenarios (native.ts) use these;
 * shared scenarios only see the CalcApp part.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { WdioApp, type WdioAppOptions } from '../drivers/WdioApp';
import { AnnouncementListener } from './helpers';
import { IDENTIFIER, type AppClipboard, type ProfileDirs } from './platform';
import type { AppSession } from './session';

export { IDENTIFIER };
/** default window (tauri.conf.json width/height) and the content minimum at UI scale 1.0 (lib.rs BASE_MIN_*) */
export const DEFAULT_SIZE = { width: 480, height: 756 };
export const MIN_SIZE = { width: 384, height: 604 };

export interface NativeWindow {
  id: string;
  title: string;
  width: number;
  height: number;
}

export interface TauriAppOptions extends Omit<WdioAppOptions, 'browser' | 'origin'> {
  session: AppSession;
  clipboardHelper: AppClipboard;
  profile: ProfileDirs;
  /** environment of the isolated session (Linux: DISPLAY, private bus) for outside tools */
  sessionEnv: NodeJS.ProcessEnv;
}

export class TauriApp extends WdioApp {
  readonly session: AppSession;
  readonly profile: ProfileDirs;
  readonly sessionEnv: NodeJS.ProcessEnv;

  constructor(options: TauriAppOptions) {
    super({
      ...options,
      clipboard: options.clipboardHelper,
      browser: () => options.session.browser,
      origin: () => options.session.origin,
    });
    this.session = options.session;
    this.profile = options.profile;
    this.sessionEnv = options.sessionEnv;
  }

  /** call a Tauri command through the page's IPC bridge (what @tauri-apps/api invoke() does) */
  async invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
    const result = await this.browser.executeAsync(
      (
        cmd: string,
        cmdArgs: Record<string, unknown> | undefined,
        done: (r: { ok: boolean; value?: unknown; error?: string }) => void,
      ) => {
        const internals = (
          window as unknown as { __TAURI_INTERNALS__?: { invoke: (c: string, a?: unknown) => Promise<unknown> } }
        ).__TAURI_INTERNALS__;
        if (!internals) return done({ ok: false, error: 'no __TAURI_INTERNALS__ in this page' });
        internals.invoke(cmd, cmdArgs).then(
          (value) => done({ ok: true, value }),
          (error: unknown) => done({ ok: false, error: String(error) }),
        );
      },
      command,
      args,
    );
    if (!result.ok) throw new Error(`invoke ${command} failed: ${result.error}`);
    return result.value as T;
  }

  /** CSS viewport = webview content size (the app cancels the desktop text scale, so CSS px = logical px) */
  innerSize(): Promise<{ width: number; height: number }> {
    return this.browser.execute(() => ({ width: window.innerWidth, height: window.innerHeight }));
  }

  /** ask for a window size through WebDriver — GTK applies the app's min/max size hints to the request */
  async requestWindowSize(width: number, height: number): Promise<void> {
    await this.browser.setWindowRect(null, null, width, height);
  }

  /** environment for X tools: the test display, UTF-8 output */
  private get xEnv(): NodeJS.ProcessEnv {
    return { ...this.sessionEnv, LC_ALL: 'C.UTF-8' };
  }

  /**
   * top-level X windows of the Xvfb display with WM_CLASS qcalc — the native view, not the DOM's.
   * GTK's 10×10 client-leader window has the same class and is left out.
   */
  nativeWindows(): NativeWindow[] {
    const tree = execFileSync('xwininfo', ['-root', '-tree'], { env: this.xEnv, encoding: 'utf8' });
    // '     0x200004 "QCalc": ("qcalc" "Qcalc")  480x756+0+0  +0+0' (the name may be escaped or missing)
    return [
      ...tree.matchAll(/^\s+(0x[0-9a-f]+) (?:"(.*?)"|\(has no name\)): \("([^"]*)" "([^"]*)"\)\s+(\d+)x(\d+)[+-]/gm),
    ]
      .filter((m) => /qcalc/i.test(`${m[3]} ${m[4]}`) && Number(m[5]) > 50)
      .map((m) => ({ id: m[1]!, title: m[2] ?? '', width: Number(m[5]), height: Number(m[6]) }));
  }

  /** `_NET_WM_NAME` (UTF-8 title) of an X window */
  nativeTitle(windowId: string): string {
    const out = execFileSync('xprop', ['-id', windowId, '_NET_WM_NAME'], { env: this.xEnv, encoding: 'utf8' });
    return /= "(.*)"$/m.exec(out)?.[1] ?? '';
  }

  appPid(): number | null {
    return this.session.appPid();
  }

  /** a file in the app's config dir ($XDG_CONFIG_HOME/<identifier>, Windows %APPDATA%\<identifier>), or null */
  configFile(name: string): string | null {
    const file = path.join(this.profile.config, IDENTIFIER, name);
    return existsSync(file) ? readFileSync(file, 'utf8') : null;
  }

  /** last lines of the app's own log (tauri-plugin-log, debug builds) */
  appLog(lines = 60): string {
    const dir = path.join(this.profile.data, IDENTIFIER, 'logs');
    if (!existsSync(dir)) return '(no app log)';
    return readdirSync(dir)
      .map((name) => readFileSync(path.join(dir, name), 'utf8'))
      .join('\n')
      .split('\n')
      .slice(-lines)
      .join('\n');
  }

  /**
   * Quit gracefully (RunEvent::Exit runs → window size saved, WebKit flushes storage) and wait for the process to end.
   * - 'key': the user's way — App.vue binds 'q' → quit_app
   * - 'command': invoke quit_app directly
   */
  async quit(via: 'key' | 'command'): Promise<void> {
    try {
      if (via === 'key') await this.key('q');
      else await this.invoke('quit_app');
    } catch (error) {
      // the session dies with the app, sometimes before the call returns
      if (
        !/invalid session|session terminated|session.*(deleted|not.*found)|ECONNREFUSED|socket hang up/i.test(
          String(error),
        )
      )
        throw error;
    }
    if (!(await this.session.awaitExit())) throw new Error(`the app did not exit (quit via ${via})`);
  }

  /** launch again with the same profile (fresh = first-install profile) and wait for the e2e page */
  async relaunch({ fresh = false } = {}): Promise<void> {
    await this.session.relaunch({ fresh });
  }

  /** open the e2e URL on the current launch without touching storage */
  async openE2E(): Promise<void> {
    // right after a launch the first document is still booting — navigate() keeps it from reloading over us
    await this.navigate('/?e2e=1#/');
    await this.waitReady();
    // the stamp travelled to the new document; drop it so the app's reload guard works as usual from here
    await this.browser.execute(() => sessionStorage.removeItem('qcalc-chunk-reload-at'));
  }

  startAnnouncementListener(): Promise<AnnouncementListener> {
    return AnnouncementListener.start(this.sessionEnv);
  }

  /**
   * Start recording uncaught errors, unhandled rejections and console.error in the current document.
   * (WebDriver classic cannot read the console, and a hook cannot be installed before the first document runs.)
   */
  async recordErrors(): Promise<void> {
    await this.browser.execute(() => {
      const w = window as unknown as { __e2eErrors?: string[] };
      if (w.__e2eErrors) return;
      const errors: string[] = (w.__e2eErrors = []);
      window.addEventListener('error', (e) => errors.push(`error: ${e.message}`));
      window.addEventListener('unhandledrejection', (e) => errors.push(`unhandledrejection: ${String(e.reason)}`));
      const original = console.error.bind(console);
      console.error = (...args: unknown[]) => {
        errors.push(`console.error: ${args.map(String).join(' ')}`);
        original(...args);
      };
    });
  }

  recordedErrors(): Promise<string[]> {
    return this.browser.execute(() => (window as unknown as { __e2eErrors?: string[] }).__e2eErrors ?? []);
  }
}
