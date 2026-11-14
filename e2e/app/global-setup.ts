/**
 * Playwright globalSetup for the app layer — brings up the isolated desktop once per run and hands its
 * coordinates to the workers through E2E_APP_* environment variables. The returned function tears it down.
 */
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { missingTools, startLinuxEnv } from './env-linux';

export const DEFAULT_BINARY = 'src-tauri/target/e2e-app/qcalc';

export default async function globalSetup(): Promise<() => Promise<void>> {
  if (process.platform !== 'linux') {
    throw new Error(`the app layer runs on Linux only for now (host: ${process.platform})`);
  }
  const binary = path.resolve(process.env.E2E_APP_BINARY ?? DEFAULT_BINARY);
  if (!existsSync(binary)) throw new Error(`no app binary at ${binary} — run: node e2e/app/build.mjs`);
  const missing = missingTools();
  if (missing.length) throw new Error(`missing for the app layer: ${missing.join(', ')}`);

  const out = path.resolve('test-results');
  const env = await startLinuxEnv({ logDir: out });
  Object.assign(process.env, {
    E2E_APP_BINARY: binary,
    E2E_APP_DRIVER_PORT: String(env.driverPort),
    E2E_APP_DRIVER_PID: String(env.driverPid),
    E2E_APP_PROFILE: JSON.stringify(env.profile),
    E2E_APP_SESSION_ENV: JSON.stringify(env.env),
  });
  console.log(`[app] isolated session: DISPLAY=${env.display}, profile ${env.profile.root}`);

  return async () => {
    const { orphans } = await env.stop();
    writeFileSync(path.join(out, 'app-orphans.json'), JSON.stringify(orphans) + '\n');
    if (orphans.length) console.warn(`[app] killed processes that escaped the process tree: ${orphans.join(', ')}`);
  };
}
