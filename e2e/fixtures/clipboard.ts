/**
 * 클립보드 — 브라우저마다 다르게 준비하되, 시험 코드에서는 같은 방법으로 읽고 쓴다.
 *
 * - native (Chromium): clipboard-read/write 권한을 주고 진짜 navigator.clipboard 를 쓴다.
 * - stub (WebKit): WebKit 은 readText() 에 사용자 제스처·붙여넣기 메뉴를 요구해 자동화가 막힌다.
 *   그래서 문서 스크립트보다 먼저 navigator.clipboard 를 메모리 구현으로 바꿔 끼운다.
 *
 * 어느 쪽이든 page 안의 navigator.clipboard.writeText/readText 로 접근하므로
 * setClipboard/getClipboard 는 모드와 관계없이 같다. 앱의 복사(Quasar copyToClipboard)도
 * navigator.clipboard.writeText 를 쓰므로 stub 에 그대로 기록된다.
 */
import type { BrowserContext, Page } from '@playwright/test';

export type ClipboardMode = 'native' | 'stub';

/** 문서 스크립트보다 먼저 실행 — 메모리 클립보드 */
function installClipboardStub(): void {
  let text = '';
  const clipboard = {
    writeText: (value: string) => {
      text = String(value);
      return Promise.resolve();
    },
    readText: () => Promise.resolve(text),
    write: () => Promise.reject(new Error('e2e clipboard stub: write() not supported')),
    read: () => Promise.reject(new Error('e2e clipboard stub: read() not supported')),
  };
  Object.defineProperty(Navigator.prototype, 'clipboard', { configurable: true, get: () => clipboard });
}

export async function installClipboard(context: BrowserContext, mode: ClipboardMode): Promise<void> {
  if (mode === 'native') {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  } else {
    await context.addInitScript(installClipboardStub);
  }
}

export async function setClipboard(page: Page, text: string): Promise<void> {
  await page.evaluate((value) => navigator.clipboard.writeText(value), text);
}

export async function getClipboard(page: Page): Promise<string> {
  return page.evaluate(() => navigator.clipboard.readText());
}
