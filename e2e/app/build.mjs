#!/usr/bin/env node
/**
 * Build (only when needed) the Tauri debug binary the app layer tests: `src-tauri/target/e2e-app/qcalc`
 * (`qcalc.exe` on Windows).
 *
 * It must embed the production frontend (dist/spa). A plain `cargo build` leaves out the `custom-protocol`
 * feature and loads devUrl (localhost:9000) instead, so this goes through `tauri build --debug --no-bundle`.
 *  1. dist/spa: e2e/support/serve.mjs --build-only (shared with the web layer; rebuilds only when sources changed)
 *  2. tauri build --debug --no-bundle with beforeBuildCommand disabled (step 1 already did it)
 *  3. hard-link target/debug/qcalc → target/e2e-app/qcalc. `yarn dev:tauri` rewrites target/debug/qcalc with a
 *     devUrl binary; the e2e copy keeps the embedded-frontend build (cargo replaces files, so the link survives).
 *
 * Reuse: skipped when the e2e binary is newer than every input. Force: --rebuild or E2E_REBUILD=1.
 * Log: test-results/app-build-tauri.log
 */
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  linkSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const exe = process.platform === 'win32' ? 'qcalc.exe' : 'qcalc';
const built = path.join(root, 'src-tauri/target/debug', exe);
const output = path.join(root, 'src-tauri/target/e2e-app', exe);
const force = process.argv.includes('--rebuild') || process.env.E2E_REBUILD === '1';

// everything that ends up in the binary
const INPUTS = [
  'src',
  'public',
  'index.html',
  'quasar.config.ts',
  'package.json',
  'dist/spa/index.html',
  'src-tauri/src',
  'src-tauri/capabilities',
  'src-tauri/icons',
  'src-tauri/build.rs',
  'src-tauri/Cargo.toml',
  'src-tauri/Cargo.lock',
  'src-tauri/tauri.conf.json',
  'src-tauri/tauri.windows.conf.json',
  'e2e/app/build.mjs', // the config override below is part of the binary
];

function newerThan(target, time) {
  if (!existsSync(target)) return null;
  const st = statSync(target);
  if (!st.isDirectory()) return st.mtimeMs > time ? target : null;
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    if (entry.name === '__tests__' || entry.name.startsWith('.')) continue;
    const hit = newerThan(path.join(target, entry.name), time);
    if (hit) return hit;
  }
  return null;
}

function run(cmd, args, log) {
  // Windows: yarn is yarn.cmd, which only a shell can start (args here are plain words — no JSON on the command line)
  const r = spawnSync(cmd, args, { cwd: root, stdio: ['ignore', log, log], shell: process.platform === 'win32' });
  if (r.status !== 0) {
    console.error(`[app] ${cmd} ${args.join(' ')} failed (exit ${r.status}) — see test-results/app-build-tauri.log`);
    process.exit(1);
  }
}

/**
 * The e2e binary's config override (compiled in; release builds never see it).
 *
 * Windows: msedgedriver starts the app with WEBVIEW2_USER_DATA_FOLDER = its temp dir and
 * WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = "… --remote-debugging-port=0 …", then waits for <UDF>\EBWebView\DevToolsActivePort.
 * The folder override works, the arguments one does not: wry always passes AdditionalBrowserArguments in the
 * environment options (its defaults when the app sets none), and WebView2 then ignores the environment variable.
 * CI run 3 (test-results/app-diag.log): the WebView2 browser process ran in msedgedriver's scoped_dir with exactly
 * wry's "--autoplay-policy=no-user-gesture-required --disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection"
 * and no --remote-debugging-port; qcalc.exe alone with the variable set opened no port either. So the e2e build
 * carries the switches itself: wry's defaults (an explicit value replaces them) + msedgedriver's automation switches.
 * Port 0 → Chromium picks one and writes DevToolsActivePort into the UDF, where msedgedriver looks.
 * JSON merge patch replaces arrays whole, so the window list is tauri.windows.conf.json's, with the switches added.
 */
function configOverride() {
  const override = { build: { beforeBuildCommand: '' } };
  if (process.platform !== 'win32') return override;
  const winConf = JSON.parse(readFileSync(path.join(root, 'src-tauri/tauri.windows.conf.json'), 'utf8'));
  const additionalBrowserArgs = [
    // wry's defaults (wry src/webview2/mod.rs create_environment) — Tauri turns autoplay on
    '--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection',
    '--autoplay-policy=no-user-gesture-required',
    // what msedgedriver would have added (its WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS, CI run 2 app-msedgedriver.log)
    '--remote-debugging-port=0',
    '--enable-automation',
    '--allow-pre-commit-input',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-hang-monitor',
    '--disable-popup-blocking',
    '--disable-prompt-on-repost',
    '--no-first-run',
    '--test-type=webdriver',
  ].join(' ');
  override.app = { windows: winConf.app.windows.map((w) => ({ ...w, additionalBrowserArgs })) };
  return override;
}

// 1. frontend (prints its own reuse/build line)
const spa = spawnSync(process.execPath, [path.join(root, 'e2e/support/serve.mjs'), '--build-only'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});
if (spa.status !== 0) process.exit(1);

// 2. binary
const builtAt = existsSync(output) ? statSync(output).mtimeMs : 0;
const stale = force
  ? 'forced'
  : !builtAt
    ? 'no e2e binary yet'
    : INPUTS.map((i) => newerThan(path.join(root, i), builtAt)).find(Boolean);
if (!stale) {
  console.log(`[app] reusing ${path.relative(root, output)} (force: --rebuild)`);
  process.exit(0);
}
mkdirSync(path.join(root, 'test-results'), { recursive: true });
const log = openSync(path.join(root, 'test-results/app-build-tauri.log'), 'w');
console.log(
  `[app] building the Tauri debug binary (${typeof stale === 'string' && stale.startsWith(root) ? `${path.relative(root, stale)} changed` : stale})`,
);
const started = Date.now();
// the config override goes in as a file: JSON on a Windows command line loses its quotes in cmd.exe
const overrideFile = path.join(root, 'test-results/app-tauri-config.json');
writeFileSync(overrideFile, JSON.stringify(configOverride()));
// (with a shell, node joins the args with plain spaces — quote the path for cmd.exe)
const configArg = process.platform === 'win32' ? `"${overrideFile}"` : overrideFile;
run('yarn', ['tauri', 'build', '--debug', '--no-bundle', '--config', configArg], log);

// 3. keep our own link to it
mkdirSync(path.dirname(output), { recursive: true });
rmSync(output, { force: true });
try {
  linkSync(built, output);
} catch {
  copyFileSync(built, output);
}
// cargo leaves the file alone when nothing in Rust changed — stamp it so a frontend-only change is not rebuilt twice
const now = new Date();
utimesSync(output, now, now);
console.log(`[app] built ${path.relative(root, output)} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
