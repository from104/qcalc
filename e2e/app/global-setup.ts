/**
 * Playwright globalSetup for the app layer — brings up the isolated desktop once per run and hands its
 * coordinates to the workers through E2E_APP_* environment variables. The returned function tears it down.
 * Linux: Xvfb + private D-Bus (env-linux.ts). Windows: the CI runner's desktop (env-windows.ts).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { missingTools as missingLinux, startLinuxEnv } from './env-linux';
import { missingTools as missingWindows, startWindowsEnv } from './env-windows';
import { DEFAULT_BINARY, isWindows, type AppEnv } from './platform';
import { AppSession } from './session';

/** last lines of a log in test-results/, for the error message */
function tail(file: string, lines = 15): string {
  try {
    const text = readFileSync(file, 'utf8').trimEnd();
    return text ? text.split(/\r?\n/).slice(-lines).join('\n') : '(empty)';
  } catch {
    return '(missing)';
  }
}

/**
 * Smoke check: open one WebDriver session (= launch the app once) before any test. If that fails, every test would
 * fail the same way after its own timeout (first Windows CI run: 65 × 30s "Request timed out" on POST /session,
 * 34 minutes) — stop the whole layer now and point at the driver logs instead.
 */
async function smokeSession(env: AppEnv, binary: string, out: string): Promise<void> {
  const session = new AppSession({
    driverPort: env.driverPort,
    driverPid: env.driverPid,
    binary,
    profile: env.profile,
  });
  const started = Date.now();
  try {
    await session.launch();
  } catch (error) {
    const logs = isWindows
      ? ['app-driver.log', 'app-driver-stderr.log', 'app-msedgedriver.log']
      : ['app-driver.log', 'app-driver-stderr.log'];
    await session.close().catch(() => undefined);
    await env.stop().catch(() => undefined);
    throw new Error(
      `[app] smoke check: could not open a WebDriver session (launch the app) in ${Math.round((Date.now() - started) / 1000)}s — ` +
        `the app layer stops here instead of failing every test the same way.\n${String(error).split('\n')[0]}\n` +
        logs.map((log) => `--- test-results/${log} (tail) ---\n${tail(path.join(out, log))}`).join('\n'),
      { cause: error },
    );
  }
  console.log(`[app] smoke check: WebDriver session opened in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  await session.close();
  // the tests expect a first-install profile (the smoke launch already wrote window state, WebKit storage)
  session.wipeProfile();
}

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
  await smokeSession(env, binary, out);

  return async () => {
    const { orphans } = await env.stop();
    writeFileSync(path.join(out, 'app-orphans.json'), JSON.stringify(orphans) + '\n');
    if (orphans.length) console.warn(`[app] killed processes that escaped the process tree: ${orphans.join(', ')}`);
  };
}
