/**
 * Isolated desktop for the Tauri app on Linux — nothing touches the user's session or data.
 *
 *  - Xvfb on a free display (`-displayfd`), 2560×1440 so the app's max-size logic (2/3 of the work-area height
 *    on landscape screens, src-tauri/src/lib.rs) does not clamp the 480×756 default window.
 *  - a private D-Bus session bus (a11y bus gets activated on it, never on the user's bus → the user's Orca
 *    never hears the test app).
 *  - throwaway HOME / XDG_CONFIG_HOME / XDG_DATA_HOME / XDG_CACHE_HOME / XDG_RUNTIME_DIR under one temp dir:
 *    window-size.json, .window-state.json, boot-bg.txt and WebKit localStorage all land there.
 *  - WAYLAND_DISPLAY unset + GDK_BACKEND=x11 → GTK can only reach the Xvfb display.
 *  - tauri-driver (→ WebKitWebDriver → the app) on free ports.
 *
 * Every process carries the run marker (procs.ts), so teardown — and scripts/test-suite.sh after a crash —
 * can kill exactly what this run started.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, openSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';

import { MARKER, describePid, descendants, markedPids, terminate } from './procs';

export const SCREEN = { width: 2560, height: 1440 };

export interface ProfileDirs {
  root: string;
  home: string;
  config: string;
  data: string;
  cache: string;
  runtime: string;
}

export interface LinuxEnv {
  token: string;
  display: string;
  dbusAddress: string;
  driverPort: number;
  driverPid: number;
  profile: ProfileDirs;
  /** environment for helper processes that must live in the same isolated session (clipboard, AT-SPI) */
  env: NodeJS.ProcessEnv;
  stop(): Promise<{ orphans: string[] }>;
}

const freePort = () =>
  new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number };
      server.close(() => resolve(port));
    });
  });

function firstLine(stream: NodeJS.ReadableStream, what: string, timeoutMs = 10_000): Promise<string> {
  return new Promise((resolve, reject) => {
    let buf = '';
    const timer = setTimeout(() => reject(new Error(`${what}: no output within ${timeoutMs}ms`)), timeoutMs);
    stream.on('data', (chunk: Buffer) => {
      buf += chunk.toString();
      const nl = buf.indexOf('\n');
      if (nl >= 0) {
        clearTimeout(timer);
        resolve(buf.slice(0, nl).trim());
      }
    });
    stream.on('end', () => {
      clearTimeout(timer);
      reject(new Error(`${what}: exited before printing anything`));
    });
  });
}

async function waitHttp(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not listening yet
    }
    if (Date.now() > deadline) throw new Error(`${url} did not come up within ${timeoutMs}ms`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

function which(name: string): string | null {
  for (const dir of (process.env.PATH ?? '').split(':')) {
    if (dir && existsSync(path.join(dir, name))) return path.join(dir, name);
  }
  return null;
}

export function tauriDriverPath(): string | null {
  if (process.env.TAURI_DRIVER) return process.env.TAURI_DRIVER;
  return (
    which('tauri-driver') ??
    (existsSync(path.join(homedir(), '.cargo/bin/tauri-driver'))
      ? path.join(homedir(), '.cargo/bin/tauri-driver')
      : null)
  );
}

/** Missing host tools, as install hints — empty when the layer can run */
export function missingTools(): string[] {
  const missing: string[] = [];
  if (!which('Xvfb')) missing.push('Xvfb (apt: xvfb)');
  if (!which('dbus-daemon')) missing.push('dbus-daemon (apt: dbus)');
  if (!which('WebKitWebDriver'))
    missing.push('WebKitWebDriver (apt: webkitgtk-webdriver / webkit2gtk-driver on 22.04)');
  if (!tauriDriverPath()) missing.push('tauri-driver (cargo install tauri-driver --locked)');
  return missing;
}

export function makeProfile(root: string): ProfileDirs {
  const dirs: ProfileDirs = {
    root,
    home: path.join(root, 'home'),
    config: path.join(root, 'config'),
    data: path.join(root, 'data'),
    cache: path.join(root, 'cache'),
    runtime: path.join(root, 'runtime'),
  };
  for (const dir of Object.values(dirs)) mkdirSync(dir, { recursive: true });
  chmodSync(dirs.runtime, 0o700); // XDG_RUNTIME_DIR must be private
  return dirs;
}

export interface StartOptions {
  /** directory for Xvfb / dbus / driver logs */
  logDir: string;
}

export async function startLinuxEnv({ logDir }: StartOptions): Promise<LinuxEnv> {
  const token = randomUUID();
  const profile = makeProfile(mkdtempSync(path.join(tmpdir(), 'qcalc-e2e-app-')));
  mkdirSync(logDir, { recursive: true });
  // test-suite.sh reads this after the run to sweep anything a crashed runner left behind
  writeFileSync(path.join(logDir, '.app-run.json'), JSON.stringify({ token, profile: profile.root }) + '\n');

  const env: NodeJS.ProcessEnv = { ...process.env };
  for (const key of [
    'WAYLAND_DISPLAY',
    'WAYLAND_SOCKET',
    'DISPLAY',
    'XAUTHORITY',
    'DBUS_SESSION_BUS_ADDRESS',
    'AT_SPI_BUS_ADDRESS',
    'QCALC_FORCE_XWAYLAND',
    'QCALC_DEVTOOLS',
    // package detection (get_package_env) must see a plain native install
    'SNAP',
    'SNAP_NAME',
    'FLATPAK_ID',
    'APPIMAGE',
    'APPDIR',
    'SESSION_MANAGER',
    // a Wayland desktop's input-method setup does not belong on an X display: GTK_IM_MODULE=wayland loads
    // im-wayland.so, which calls gdk_wayland_display_get_wl_display() on the X11 display and the app segfaults
    // while creating the webview (reproduced on gofu, 2026-11-15)
    'XMODIFIERS',
    'QT_IM_MODULE',
    'QT_IM_MODULES',
    'GTK_MODULES',
  ])
    delete env[key];
  Object.assign(env, {
    [MARKER]: token,
    HOME: profile.home,
    XDG_CONFIG_HOME: profile.config,
    XDG_DATA_HOME: profile.data,
    XDG_CACHE_HOME: profile.cache,
    XDG_RUNTIME_DIR: profile.runtime,
    XDG_SESSION_TYPE: 'x11',
    GDK_BACKEND: 'x11',
    GTK_IM_MODULE: 'gtk-im-context-simple',
    // the app forces WebKit's DMA-BUF renderer on NVIDIA hosts; inside Xvfb there is no GPU to share buffers with
    QCALC_NO_GPU_FORCE: '1',
  });

  const started: ChildProcess[] = [];
  const log = (name: string) => openSync(path.join(logDir, `app-${name}.log`), 'w');
  const stop = async () => {
    // children first: the app and WebKitWebDriver hang below tauri-driver, a11y daemons below dbus-daemon
    const tree = started.flatMap((child) => (child.pid ? [...descendants(child.pid), child.pid] : []));
    await terminate(tree.reverse());
    // anything that escaped the tree (double-forked) still carries the marker
    const orphans = markedPids(token);
    const described = orphans.map(describePid);
    await terminate(orphans);
    if (process.env.E2E_KEEP_PROFILE !== '1') rmSync(profile.root, { recursive: true, force: true });
    return { orphans: described };
  };

  try {
    // ── Xvfb ──
    const xvfb = spawn(
      'Xvfb',
      ['-displayfd', '3', '-screen', '0', `${SCREEN.width}x${SCREEN.height}x24`, '-nolisten', 'tcp', '-noreset'],
      { env, stdio: ['ignore', 'ignore', log('xvfb'), 'pipe'] },
    );
    started.push(xvfb);
    const displayNumber = await firstLine(xvfb.stdio[3] as NodeJS.ReadableStream, 'Xvfb');
    const display = `:${displayNumber}`;
    env.DISPLAY = display;

    // ── private session bus ──
    const dbus = spawn('dbus-daemon', ['--session', '--nofork', '--nopidfile', '--print-address=1'], {
      env,
      stdio: ['ignore', 'pipe', log('dbus')],
    });
    started.push(dbus);
    const dbusAddress = await firstLine(dbus.stdout!, 'dbus-daemon');
    env.DBUS_SESSION_BUS_ADDRESS = dbusAddress;

    // ── tauri-driver → WebKitWebDriver ──
    const driverBin = tauriDriverPath();
    if (!driverBin) throw new Error('tauri-driver not found (cargo install tauri-driver --locked)');
    const [driverPort, nativePort] = [await freePort(), await freePort()];
    const driver = spawn(driverBin, ['--port', String(driverPort), '--native-port', String(nativePort)], {
      env,
      stdio: ['ignore', log('driver'), log('driver-stderr')],
    });
    started.push(driver);
    await waitHttp(`http://127.0.0.1:${driverPort}/status`, 15_000);

    return { token, display, dbusAddress, driverPort, driverPid: driver.pid!, profile, env, stop };
  } catch (error) {
    await stop();
    throw error;
  }
}
