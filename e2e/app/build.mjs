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
writeFileSync(overrideFile, JSON.stringify({ build: { beforeBuildCommand: '' } }));
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
