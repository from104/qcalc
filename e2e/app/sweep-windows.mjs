#!/usr/bin/env node
/**
 * Windows leftover sweep for scripts/test-suite.sh — the counterpart of its /proc-marker sweep on Linux.
 *
 * Windows processes carry no readable run marker, so env-windows.ts records the PIDs it started (tauri-driver,
 * msedgedriver, the app and their children) in test-results/.app-run.json. This ends exactly those PIDs
 * (`taskkill /T /F /PID`) — and only when the PID is still alive AND its image name is one of ours, so a PID that
 * Windows has since handed to an unrelated program is left alone. Never by image name alone.
 *
 * Prints the number of processes it had to end.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const OURS = new Set(['tauri-driver.exe', 'msedgedriver.exe', 'qcalc.exe', 'msedgewebview2.exe']);
const file = process.argv[2] ?? 'test-results/.app-run.json';

let run;
try {
  run = JSON.parse(readFileSync(file, 'utf8'));
} catch {
  console.log(0);
  process.exit(0);
}

const imageOf = (pid) => {
  const r = spawnSync('tasklist.exe', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'], {
    encoding: 'utf8',
    windowsHide: true,
  });
  const m = /^"([^"]+)","(\d+)"/m.exec(r.stdout ?? '');
  return m && Number(m[2]) === pid ? m[1].toLowerCase() : null;
};

let ended = 0;
for (const pid of run.pids ?? []) {
  if (!Number.isInteger(pid) || pid <= 4) continue;
  const image = imageOf(pid);
  if (!image || !OURS.has(image)) continue;
  spawnSync('taskkill.exe', ['/T', '/F', '/PID', String(pid)], { stdio: 'ignore', windowsHide: true });
  ended++;
}
if (ended) {
  run.pids = [];
  writeFileSync(file, JSON.stringify(run) + '\n');
}
console.log(ended);
