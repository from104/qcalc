/**
 * Playwright `test` 확장 — 모든 웹 스펙은 @playwright/test 대신 이걸 쓴다.
 *
 * 프로젝트별 옵션(playwright.config.ts 의 `use`)
 * - clipboardMode : 'native'(Chromium 권한) | 'stub'(WebKit 메모리 대역)
 * - capabilities  : 이 프로젝트 드라이버가 가진 능력 — 시나리오 needs 와 비교해 건너뛴다
 *
 * 픽스처 `app` 은 클립보드·네트워크 고정을 건 PlaywrightApp 이다(앱은 아직 안 띄운 상태 —
 * 실행기가 시나리오의 seed 로 띄운다).
 */
import { test as base } from '@playwright/test';

import type { Capability } from '../drivers/CalcApp';
import { PlaywrightApp } from '../drivers/PlaywrightApp';
import { installClipboard, type ClipboardMode } from './clipboard';
import { mockNetwork } from './network';

export interface E2EOptions {
  clipboardMode: ClipboardMode;
  capabilities: Capability[];
}

export const test = base.extend<E2EOptions & { app: PlaywrightApp }>({
  clipboardMode: ['stub', { option: true }],
  capabilities: [['keyboard', 'clipboard', 'netMock', 'reload'], { option: true }],

  app: async ({ page, context, browserName, clipboardMode, capabilities }, use) => {
    await installClipboard(context, clipboardMode);
    await mockNetwork(context);
    await use(new PlaywrightApp(page, { platform: `web-${browserName}`, capabilities }));
  },
});

export { expect } from '@playwright/test';
