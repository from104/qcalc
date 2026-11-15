/**
 * Playwright `test` for the app layer. One app process per worker (workers: 1), reused across tests like a
 * browser; each test seeds storage through navigation (WdioApp.seed). A test may quit, crash or resize the app:
 * after every test the fixture makes sure the next one starts from a running app with the default window.
 */
import { spawnSync } from 'node:child_process';

import { test as base } from '@playwright/test';

import type { Capability } from '../drivers/CalcApp';
import { WindowsClipboard } from './clipboard-windows';
import { ClipboardHelper } from './helpers';
import { APP_PLATFORM, isWindows, type AppClipboard, type ProfileDirs } from './platform';
import { AppSession } from './session';
import { DEFAULT_SIZE, TauriApp } from './tauri-app';

/**
 * keyboard: WebDriver key actions · clipboard: the real system clipboard via an outside process (Linux: X CLIPBOARD
 * owner script, Windows: PowerShell) · reload: refresh within the session · relaunch: storage survives a new app
 * process (Linux only — on Windows msedgedriver points WebView2 at a fresh %SystemTemp%\scoped_dir…\EBWebView for every
 * session and deletes it on quit, whatever --user-data-dir says) · xwindow: Xvfb's X windows (Linux only — the
 * Windows runner's screen size and DPI are not ours to set, so exact window sizes are not asserted there)
 */
export const TAURI_CAPABILITIES: Capability[] = isWindows
  ? ['keyboard', 'clipboard', 'reload']
  : ['keyboard', 'clipboard', 'reload', 'relaunch', 'xwindow'];

/**
 * 'atspi' only where the app can actually announce: announce_a11y emits ATK's `announcement` signal, which exists
 * from ATK 2.46 (Ubuntu 22.04 ships 2.36 → the app skips the announcement by design), and the listener needs Atspi.
 */
function hostCapabilities(env: NodeJS.ProcessEnv): Capability[] {
  if (isWindows) return []; // no AT-SPI — the app's announce_a11y is a no-op there (lib.rs)
  const probe = spawnSync(
    'python3',
    [
      '-I',
      '-c',
      "import gi; gi.require_version('Atk', '1.0'); gi.require_version('Atspi', '2.0'); " +
        'from gi.repository import Atk, Atspi, GObject; Atk.Object(); ' + // class init registers the signals
        "print(GObject.signal_lookup('announcement', Atk.Object))",
    ],
    { env, encoding: 'utf8', timeout: 10_000 },
  );
  return Number(probe.stdout?.trim()) > 0 ? ['atspi'] : [];
}

/** a static file of the build — same origin as the app, but no app script runs there (seed target) */
export const BLANK_PATH = '/icons/favicon-16x16.png';

interface Worker {
  tauri: {
    session: AppSession;
    clipboard: AppClipboard;
    /** the window the app opens with on a fresh profile — Linux: tauri.conf.json (Xvfb is big enough); Windows: measured */
    baseline: { width: number; height: number };
    profile: ProfileDirs;
    sessionEnv: NodeJS.ProcessEnv;
    capabilities: Capability[];
  };
}

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} missing — run the app layer through playwright.app.config.ts (globalSetup)`);
  return value;
};

export const test = base.extend<{ app: TauriApp }, Worker>({
  tauri: [
    // eslint-disable-next-line no-empty-pattern -- worker fixture without dependencies
    async ({}, use) => {
      const profile = JSON.parse(required('E2E_APP_PROFILE')) as ProfileDirs;
      const sessionEnv = JSON.parse(required('E2E_APP_SESSION_ENV')) as NodeJS.ProcessEnv;
      const clipboard = isWindows ? await WindowsClipboard.start() : await ClipboardHelper.start(sessionEnv);
      const session = new AppSession({
        driverPort: Number(required('E2E_APP_DRIVER_PORT')),
        driverPid: Number(required('E2E_APP_DRIVER_PID')),
        binary: required('E2E_APP_BINARY'),
        profile,
      });
      await session.launch();
      const measured = isWindows
        ? await session.browser.execute(() => ({ width: window.innerWidth, height: window.innerHeight }))
        : DEFAULT_SIZE;
      const capabilities = [...TAURI_CAPABILITIES, ...hostCapabilities(sessionEnv)];
      await use({ session, clipboard, profile, sessionEnv, capabilities, baseline: measured });
      await session.close();
      await clipboard.stop();
    },
    { scope: 'worker' },
  ],

  app: async ({ tauri }, use, testInfo) => {
    if (!tauri.session.isRunning()) await tauri.session.relaunch();
    const app = new TauriApp({
      platform: APP_PLATFORM,
      capabilities: tauri.capabilities,
      blankPath: BLANK_PATH,
      session: tauri.session,
      clipboardHelper: tauri.clipboard,
      profile: tauri.profile,
      sessionEnv: tauri.sessionEnv,
      step: (title, body) => test.step(title, body),
    });
    await use(app);

    const failed = testInfo.status !== testInfo.expectedStatus;
    if (failed) {
      if (tauri.session.isRunning()) {
        const png = await app.browser.takeScreenshot().catch(() => null);
        if (png) await testInfo.attach('screenshot', { body: Buffer.from(png, 'base64'), contentType: 'image/png' });
      } else {
        testInfo.annotations.push({
          type: 'app-exited',
          description: 'the app process was not running after the test',
        });
      }
      await testInfo.attach('app.log (tail)', { body: app.appLog(), contentType: 'text/plain' });
    }
    // leave a running app with the default window for the next test
    let reset = !tauri.session.isRunning();
    if (!reset) {
      const size = await app.innerSize().catch(() => null);
      reset = !size || size.width !== tauri.baseline.width || size.height !== tauri.baseline.height;
    }
    if (reset) await tauri.session.relaunch({ fresh: true });
  },
});
