/**
 * Windows side of procs.ts. There is no /proc and no way to read another process's environment, so the run marker
 * does not exist here: the app layer tracks PIDs it started (and their descendants) and ends them with
 * `taskkill /T /F /PID <pid>` — never by image name.
 */
import { spawnSync } from 'node:child_process';

export interface WinProc {
  pid: number;
  ppid: number;
  name: string;
  exe: string | null;
}

/** every running process (one PowerShell/CIM query, ~0.5–1s) */
export function listProcesses(): WinProc[] {
  const r = spawnSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      "Get-CimInstance Win32_Process | ForEach-Object { '{0}|{1}|{2}|{3}' -f $_.ProcessId, $_.ParentProcessId, $_.Name, $_.ExecutablePath }",
    ],
    { encoding: 'utf8', timeout: 30_000, windowsHide: true },
  );
  if (r.status !== 0) throw new Error(`process listing failed: ${r.stderr || r.error}`);
  const out: WinProc[] = [];
  for (const line of r.stdout.split(/\r?\n/)) {
    const [pid, ppid, name, ...exe] = line.split('|');
    if (!/^\d+$/.test(pid ?? '')) continue;
    out.push({ pid: Number(pid), ppid: Number(ppid), name: name ?? '', exe: exe.join('|').trim() || null });
  }
  return out;
}

/** `root` and everything below it (by parent PID), from one listing */
export function treeOf(roots: number[], procs: WinProc[] = listProcesses()): WinProc[] {
  const byParent = new Map<number, WinProc[]>();
  for (const p of procs) (byParent.get(p.ppid) ?? byParent.set(p.ppid, []).get(p.ppid)!).push(p);
  const seen = new Set<number>();
  const out: WinProc[] = [];
  const queue = procs.filter((p) => roots.includes(p.pid));
  while (queue.length) {
    const p = queue.shift()!;
    if (seen.has(p.pid) || p.pid === process.pid) continue;
    seen.add(p.pid);
    out.push(p);
    queue.push(...(byParent.get(p.pid) ?? []));
  }
  return out;
}

export function isAliveWin(pid: number): boolean {
  try {
    process.kill(pid, 0); // libuv checks the exit code: a finished process is ESRCH
    return true;
  } catch {
    return false;
  }
}

/** `taskkill /T /F /PID` — the process and the processes it started */
export function killTree(pid: number): void {
  spawnSync('taskkill.exe', ['/T', '/F', '/PID', String(pid)], { stdio: 'ignore', timeout: 15_000, windowsHide: true });
}
