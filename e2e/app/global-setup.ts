/**
 * Playwright globalSetup for the app layer — brings up the isolated desktop once per run and hands its
 * coordinates to the workers through E2E_APP_* environment variables. The returned function tears it down.
 * Linux: Xvfb + private D-Bus (env-linux.ts). Windows: the CI runner's desktop (env-windows.ts).
 */
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { missingTools as missingLinux, startLinuxEnv } from './env-linux';
import { missingTools as missingWindows, startWindowsEnv } from './env-windows';
import { DEFAULT_BINARY, isWindows, type AppEnv } from './platform';

export default async function globalSetup(): Promise<() => Promise<void>> {
  if (process.platform !== 'linux' && !isWindows) {
    throw new Error(`the app layer runs on Linux and Windows only for now (host: ${process.platform})`);
  }
  const binary = path.resolve(process.env.E2E_APP_BINARY ?? DEFAULT_BINARY);
  if (!existsSync(binary)) throw new Error(`no app binary at ${binary} — run: node e2e/app/build.mjs`);
  const missing = isWindows ? missingWindows() : missingLinux();
  if (missing.length) throw new Error(`missing for the app layer: ${missing.join(', ')}`);

  const out = path.resolve('test-results');
  const env: AppEnv = isWindows ? await startWindowsEnv({ logDir: out }) : await startLinuxEnv({ logDir: out });
  Object.assign(process.env, {
    E2E_APP_BINARY: binary,
    E2E_APP_DRIVER_PORT: String(env.driverPort),
    E2E_APP_DRIVER_PID: String(env.driverPid),
    E2E_APP_PROFILE: JSON.stringify(env.profile),
    E2E_APP_SESSION_ENV: JSON.stringify(env.env),
  });
  console.log(`[app] ${env.describe}`);

  return async () => {
    const { orphans } = await env.stop();
    writeFileSync(path.join(out, 'app-orphans.json'), JSON.stringify(orphans) + '\n');
    if (orphans.length) console.warn(`[app] killed processes that escaped the process tree: ${orphans.join(', ')}`);
  };
}
