/**
 * The Windows system clipboard as another program sees it: PowerShell Set-Clipboard / Get-Clipboard, one short
 * process per call (nothing to track or clean up; a timeout ends a stuck one). Text travels as base64 UTF-8 so
 * quoting, newlines and non-ASCII never meet the command line.
 */
import { spawnSync } from 'node:child_process';

import type { AppClipboard } from './platform';

const run = (script: string, env: Record<string, string> = {}): string => {
  const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-STA', '-Command', script], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
    timeout: 20_000,
    windowsHide: true,
  });
  if (r.status !== 0) throw new Error(`clipboard (PowerShell): ${r.stderr?.trim() || r.error || `exit ${r.status}`}`);
  return r.stdout.trim();
};

export class WindowsClipboard implements AppClipboard {
  static async start(): Promise<WindowsClipboard> {
    const clipboard = new WindowsClipboard();
    // fail early (not in the middle of a scenario) when the session has no usable clipboard
    await clipboard.set('qcalc-e2e-ready');
    if ((await clipboard.get()) !== 'qcalc-e2e-ready') throw new Error('clipboard round trip failed');
    return clipboard;
  }

  async set(text: string): Promise<void> {
    run(
      '$t = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($env:QCALC_E2E_CLIP)); Set-Clipboard -Value $t',
      { QCALC_E2E_CLIP: Buffer.from(text, 'utf8').toString('base64') },
    );
  }

  /** text on the system clipboard; '' when it holds none */
  async get(): Promise<string> {
    const b64 = run(
      '$t = Get-Clipboard -Raw; if ($null -eq $t) { $t = "" }; [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes([string]$t))',
    );
    return Buffer.from(b64, 'base64').toString('utf8');
  }

  async stop(): Promise<void> {}
}
