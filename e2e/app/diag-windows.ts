/**
 * Windows diagnostics for the smoke check (global-setup.ts) — only used when the first WebDriver session fails.
 *
 * Second CI run: msedgedriver launched qcalc.exe with WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS (…--remote-debugging-port=0)
 * and gave up after 60s with "DevToolsActivePort file doesn't exist". That alone does not say whether the app ran,
 * whether it created a WebView2 at all, which user data folder that WebView2 used, or whether it opened a port. So:
 *  - `sampleWhile()` records, every few seconds while the session request is pending, our processes with their
 *    command lines (msedgewebview2.exe's shows --user-data-dir and --remote-debugging-port) and every
 *    DevToolsActivePort file under the app's data folders and msedgedriver's temp dirs → test-results/app-diag.log
 *  - `probeApp()` then starts qcalc.exe by itself with its own WEBVIEW2_USER_DATA_FOLDER and asks the port named in
 *    DevToolsActivePort — does the app's WebView2 open a debugging port without msedgedriver in the picture?
 *    Its stdout/stderr (tauri-plugin-log) are kept.
 * CI run 3 answered it: the browser process ran in msedgedriver's folder but without --remote-debugging-port —
 * WebView2 ignores WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS when the app passes its own arguments (wry always does), so
 * the e2e build now carries the switches itself (build.mjs configOverride).
 *  - `keepAppLogs()` copies the app's own logs (%LOCALAPPDATA%\<id>\logs) before the data folders are wiped.
 */
import { execFile, spawn } from 'node:child_process';
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, openSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { IDENTIFIER } from './platform';
import { killTree } from './procs-win';

const ps = (script: string): Promise<string> =>
  new Promise((resolve) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-Command', script],
      { encoding: 'utf8', timeout: 30_000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 },
      (error, stdout, stderr) => resolve(`${stdout}${stderr}${error ? `\n(powershell: ${String(error)})` : ''}`.trim()),
    );
  });

const SNAPSHOT = `
$names = 'qcalc.exe','msedgewebview2.exe','msedgedriver.exe','tauri-driver.exe','cmd.exe'
Get-CimInstance Win32_Process | Where-Object { $names -contains $_.Name } | ForEach-Object {
  '{0} (parent {1}) {2}: {3}' -f $_.ProcessId, $_.ParentProcessId, $_.Name, $_.CommandLine }
$roots = @((Join-Path $env:LOCALAPPDATA '${IDENTIFIER}'), (Join-Path $env:APPDATA '${IDENTIFIER}'))
# msedgedriver's scoped_dir: %TEMP% or, for an elevated runner, %SystemRoot%/SystemTemp (CI run 3)
foreach ($t in @($env:TEMP, (Join-Path $env:SystemRoot 'SystemTemp'))) {
  $roots += @(Get-ChildItem -Path $t -Directory -Filter 'scoped_dir*' -ErrorAction SilentlyContinue | ForEach-Object FullName)
}
foreach ($r in $roots) {
  if (Test-Path $r) {
    Get-ChildItem -Path $r -Recurse -Force -Depth 4 -Include 'DevToolsActivePort','chrome_debug.log' -ErrorAction SilentlyContinue |
      ForEach-Object { $c = ((Get-Content -Raw $_.FullName -ErrorAction SilentlyContinue) + '') -replace '\\s+', ' '
        'file: {0} ({1} bytes) {2}' -f $_.FullName, $_.Length, $c.Substring(0, [Math]::Min(120, $c.Length)) }
  }
}`;

/** snapshots every `everyMs` until `pending` settles (it is never awaited for its value here) */
export async function sampleWhile(pending: Promise<unknown>, logFile: string, everyMs = 8000): Promise<void> {
  let done = false;
  void pending.finally(() => (done = true)).catch(() => undefined);
  const started = Date.now();
  while (!done) {
    const t = Math.round((Date.now() - started) / 1000);
    appendFileSync(logFile, `\n=== +${t}s (session request pending) ===\n${await ps(SNAPSHOT)}\n`);
    for (let waited = 0; waited < everyMs && !done; waited += 250) await new Promise((r) => setTimeout(r, 250));
  }
}

/**
 * Start the app alone, the way msedgedriver does: WEBVIEW2_USER_DATA_FOLDER = a fresh temp dir (WebView2 honours that
 * variable — CI run 3), then read <dir>\EBWebView\DevToolsActivePort and ask /json/version. The e2e build carries
 * --remote-debugging-port=0 in its own browser arguments (build.mjs) — this says whether that reached WebView2.
 */
export async function probeApp(binary: string, env: NodeJS.ProcessEnv, logDir: string, logFile: string): Promise<void> {
  const udf = mkdtempSync(path.join(tmpdir(), 'qcalc-e2e-probe-'));
  const portFile = path.join(udf, 'EBWebView', 'DevToolsActivePort');
  const out = openSync(path.join(logDir, 'app-probe.log'), 'w');
  const child = spawn(binary, [], { env: { ...env, WEBVIEW2_USER_DATA_FOLDER: udf }, stdio: ['ignore', out, out] });
  let exit: string | null = null;
  child.on('exit', (code, signal) => (exit = `exited code=${code} signal=${signal}`));
  child.on('error', (error) => (exit = `spawn error ${String(error)}`));
  const started = Date.now();
  let answer = `no ${portFile} within 30s`;
  while (Date.now() - started < 30_000 && exit === null) {
    try {
      const port = readFileSync(portFile, 'utf8').split(/\r?\n/)[0];
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      answer = `port ${port}, HTTP ${res.status} after ${Math.round((Date.now() - started) / 1000)}s: ${(await res.text()).replace(/\s+/g, ' ').slice(0, 300)}`;
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  appendFileSync(
    logFile,
    `\n=== probe: qcalc.exe alone, WEBVIEW2_USER_DATA_FOLDER=${udf} ===\n` +
      `process: ${exit ?? 'still running'} · DevToolsActivePort → /json/version: ${answer}\n${await ps(SNAPSHOT)}\n`,
  );
  if (child.pid && exit === null) killTree(child.pid);
  rmSync(udf, { recursive: true, force: true, maxRetries: 20, retryDelay: 250 });
}

/** the app's own logs (tauri-plugin-log, debug builds) → test-results/app-diag/, before the data folders are wiped */
export function keepAppLogs(logDir: string): void {
  const dest = path.join(logDir, 'app-diag');
  mkdirSync(dest, { recursive: true });
  for (const base of [process.env.LOCALAPPDATA, process.env.APPDATA]) {
    const logs = base && path.join(base, IDENTIFIER, 'logs');
    if (logs && existsSync(logs)) cpSync(logs, path.join(dest, path.basename(base!) + '-logs'), { recursive: true });
    // WebView2 writes this when started with --enable-logging (msedgedriver passes it)
    const chromeLog = base && path.join(base, IDENTIFIER, 'EBWebView', 'chrome_debug.log');
    if (chromeLog && existsSync(chromeLog)) cpSync(chromeLog, path.join(dest, 'EBWebView-chrome_debug.log'));
  }
}
