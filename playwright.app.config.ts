/**
 * Playwright as the test runner for the *app* layer — the real Tauri desktop app driven over WebDriver
 * (tauri-driver + WebdriverIO, e2e/drivers/WdioApp.ts). No browser is launched by Playwright itself.
 * Guide: e2e/README.md «app 층».
 *
 *   scripts/test-suite.sh --layer app                 # build (if needed) + run on this OS
 *   yarn test:e2e:app -g "클립보드"                    # run only (binary must exist: node e2e/app/build.mjs)
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/app',
  testMatch: '**/*.spec.ts',
  outputDir: 'test-results/app-artifacts',
  globalSetup: './e2e/app/global-setup.ts',
  // one app window, one display: tests run one after another
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0, // flaky tests must show, not be retried away
  timeout: 60_000,
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-results/app-junit.xml' }],
    ['json', { outputFile: 'test-results/app-report.json' }],
    ['html', { outputFolder: 'test-results/app-html-report', open: 'never' }],
  ],
  // the project name is the driver platform of the host (e2e/app/platform.ts APP_PLATFORM)
  projects: [{ name: process.platform === 'win32' ? 'tauri-windows' : 'tauri-linux' }],
});
