/**
 * Process bookkeeping for the app layer — we never kill by name or pattern.
 *
 * (Windows: procs-win.ts — tracked PIDs + taskkill, no marker.)
 *
 * Every process the app layer starts (Xvfb, dbus-daemon, tauri-driver, the clipboard helper) gets a unique
 * environment marker `QCALC_E2E_RUN=<token>`. Environment variables are inherited, so the marker also lands on
 * everything *they* start: WebKitWebDriver, the app, WebKit's helper processes, D-Bus-activated a11y daemons —
 * even ones that double-fork and get re-parented to init. Cleanup reads `/proc/<pid>/environ` (only our own
 * processes are readable) and kills exactly the processes carrying this run's token, nothing else.
 */
import { readdirSync, readFileSync, readlinkSync } from 'node:fs';

import { isAliveWin, killTree, listProcesses, treeOf } from './procs-win';

const win = process.platform === 'win32';

export const MARKER = 'QCALC_E2E_RUN';

const pidsInProc = (): number[] =>
  readdirSync('/proc')
    .filter((name) => /^\d+$/.test(name))
    .map(Number);

/** PIDs whose environment carries `QCALC_E2E_RUN=<token>` (excluding the calling process) */
export function markedPids(token: string): number[] {
  if (win) return []; // no readable environments on Windows — env-windows.ts tracks PIDs instead
  const needle = `${MARKER}=${token}`;
  const found: number[] = [];
  for (const pid of pidsInProc()) {
    if (pid === process.pid) continue;
    try {
      const environ = readFileSync(`/proc/${pid}/environ`, 'latin1');
      if (environ.split('\0').includes(needle)) found.push(pid);
    } catch {
      // not ours, or already gone
    }
  }
  return found;
}

/** short description for reports: `1234 Xvfb` */
export function describePid(pid: number): string {
  if (win) {
    const p = listProcesses().find((x) => x.pid === pid);
    return p ? `${pid} ${p.name}` : `${pid} (gone)`;
  }
  try {
    const exe = readlinkSync(`/proc/${pid}/exe`).split('/').pop();
    return `${pid} ${exe}`;
  } catch {
    try {
      return `${pid} ${readFileSync(`/proc/${pid}/comm`, 'utf8').trim()}`;
    } catch {
      return `${pid} (gone)`;
    }
  }
}

export function isAlive(pid: number): boolean {
  if (win) return isAliveWin(pid);
  try {
    // a zombie still answers kill(0); treat it as gone
    const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
    return !/^\d+ \(.*\) Z /.test(stat);
  } catch {
    return false;
  }
}

/** direct and indirect children of `root` that are still alive */
export function descendants(root: number): number[] {
  if (win)
    return treeOf([root])
      .filter((p) => p.pid !== root)
      .map((p) => p.pid);
  const children = new Map<number, number[]>();
  for (const pid of pidsInProc()) {
    try {
      const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
      // "pid (comm) state ppid …" — comm may contain spaces/parentheses, so split after the last ')'
      const ppid = Number(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[1]);
      (children.get(ppid) ?? children.set(ppid, []).get(ppid)!).push(pid);
    } catch {
      // gone
    }
  }
  const out: number[] = [];
  const queue = [...(children.get(root) ?? [])];
  while (queue.length) {
    const pid = queue.shift()!;
    out.push(pid);
    queue.push(...(children.get(pid) ?? []));
  }
  return out.filter(isAlive);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** SIGTERM the given PIDs, wait up to `graceMs`, SIGKILL whatever is left. Returns the PIDs that needed SIGKILL. */
export async function terminate(pids: number[], graceMs = 3000): Promise<number[]> {
  const targets = pids.filter(isAlive);
  if (win) {
    // no SIGTERM on Windows: end each tree outright (children first is the caller's order, /T covers the rest)
    for (const pid of targets) killTree(pid);
    const until = Date.now() + graceMs;
    while (Date.now() < until && targets.some(isAlive)) await sleep(50);
    return targets.filter(isAlive);
  }
  for (const pid of targets) {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // already gone
    }
  }
  const deadline = Date.now() + graceMs;
  while (Date.now() < deadline && targets.some(isAlive)) await sleep(50);
  const stubborn = targets.filter(isAlive);
  for (const pid of stubborn) {
    try {
      process.kill(pid, 'SIGKILL');
    } catch {
      // already gone
    }
  }
  return stubborn;
}

/** wait until `pid` exits (or the timeout passes). true = exited */
export async function waitExit(pid: number, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!isAlive(pid)) return true;
    await sleep(50);
  }
  return !isAlive(pid);
}
