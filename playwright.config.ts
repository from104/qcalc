/**
 * Playwright — 운영 웹 빌드(dist/spa)를 정적으로 띄워 시나리오를 돌린다. 안내: e2e/README.md
 *
 *   yarn test:e2e                         # 3개 프로젝트 전부
 *   yarn test:e2e --project=webkit-desktop
 *   E2E_REBUILD=1 yarn test:e2e           # dist/spa 강제 재빌드
 */
import { defineConfig, devices } from '@playwright/test';

import type { E2EOptions } from './e2e/fixtures/test';

const PORT = Number(process.env.E2E_PORT || 4178);
const DESKTOP_VIEWPORT = { width: 480, height: 756 }; // Tauri 기본 창 크기(src-tauri/tauri.conf.json)

export default defineConfig<E2EOptions>({
  testDir: './e2e/web',
  testMatch: '**/*.spec.ts',
  outputDir: 'test-results/e2e-artifacts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // 흔들리는 시험은 숨기지 않고 드러낸다
  ...(process.env.CI ? { workers: 2 } : {}),
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-results/e2e-junit.xml' }],
    ['json', { outputFile: 'test-results/e2e-report.json' }],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },
  webServer: {
    command: 'node e2e/support/serve.mjs',
    url: `http://127.0.0.1:${PORT}/index.html`,
    env: { E2E_PORT: String(PORT) },
    timeout: 300_000, // 빌드가 필요하면 그 시간까지
    reuseExistingServer: false, // 낡은 빌드를 내주는 서버를 재사용하지 않는다
    stdout: 'ignore',
    stderr: 'pipe',
  },
  projects: [
    {
      // Windows WebView2 근사
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: DESKTOP_VIEWPORT,
        clipboardMode: 'native',
        capabilities: ['keyboard', 'clipboard', 'netMock', 'reload'],
      },
    },
    {
      // Linux WebKitGTK 근사
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: DESKTOP_VIEWPORT,
        clipboardMode: 'stub',
        capabilities: ['keyboard', 'clipboard', 'netMock', 'reload'],
      },
    },
    {
      // Android WebView 근사 (터치)
      name: 'chromium-mobile',
      use: {
        ...devices['Pixel 7'],
        clipboardMode: 'native',
        capabilities: ['keyboard', 'clipboard', 'netMock', 'reload', 'touch'],
      },
    },
  ],
});
