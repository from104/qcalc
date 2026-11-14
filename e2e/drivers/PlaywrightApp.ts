/**
 * PlaywrightApp — CalcApp 을 Playwright Page 위에 구현한 드라이버 (웹 빌드용).
 *
 * 앱 주소에는 항상 `?e2e=1` 을 붙인다 → 애니메이션 0, 자동 업데이트 확인 끔 (e2e/README.md).
 * 선택자는 data-testid 와 키패드 id(`btn-<id>`)만 쓴다. aria-label 은 번역되므로 쓰지 않는다.
 */
import { test, type Locator, type Page } from '@playwright/test';

import type { ButtonId, CalcApp, Capability, TabName } from './CalcApp';
import { applySeed, buildSeed, type LangCode, type SeedState } from '../fixtures/seed';
import { getClipboard, setClipboard } from '../fixtures/clipboard';

export const APP_PATH = '/?e2e=1#/';
/** 같은 출처의 빈 문서 — 앱을 띄우기 전에 저장소를 심는 자리 (e2e/support/serve.mjs 가 404 로 내준다) */
const BLANK_PATH = '/__e2e__/blank';

export interface PlaywrightAppOptions {
  platform: string;
  capabilities: Iterable<Capability>;
}

/** 표시 텍스트 정리 — 줄바꿈·NBSP(\\s 에 포함)·연속 공백을 한 칸으로 */
const normalize = (text: string | null) => (text ?? '').replace(/\s+/g, ' ').trim();

export class PlaywrightApp implements CalcApp {
  readonly platform: string;
  readonly capabilities: ReadonlySet<Capability>;

  constructor(
    readonly page: Page,
    options: PlaywrightAppOptions,
  ) {
    this.platform = options.platform;
    this.capabilities = new Set(options.capabilities);
  }

  private get touch(): boolean {
    return this.capabilities.has('touch');
  }

  /** 지금 보이는 요소 하나 — 탭 패널 전환 중 잠깐 겹치는 옛 패널은 제외 */
  private visible(selector: string): Locator {
    return this.page.locator(selector).filter({ visible: true });
  }

  private async activate(target: Locator): Promise<void> {
    if (this.touch) await target.tap();
    else await target.click();
  }

  private async waitReady(): Promise<void> {
    await this.page.waitForFunction(() => document.documentElement.classList.contains('e2e'));
    await this.visible('[data-testid="result-main"]').waitFor();
    await this.visible('#btn-d6').waitFor();
  }

  async seed(state?: SeedState): Promise<void> {
    await this.page.goto(BLANK_PATH);
    await this.page.evaluate(applySeed, buildSeed(state));
    await this.page.goto(APP_PATH);
    await this.waitReady();
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitReady();
  }

  async press(id: ButtonId): Promise<void> {
    await this.activate(this.visible(`[id="btn-${id}"]`));
  }

  async key(chord: string): Promise<void> {
    await this.page.keyboard.press(chord);
  }

  async main(): Promise<string> {
    return normalize(await this.visible('[data-testid="result-main"]').textContent());
  }

  async sub(): Promise<string> {
    return normalize(await this.visible('[data-testid="result-sub"]').textContent());
  }

  async hasMemory(): Promise<boolean> {
    return (await this.visible('[data-testid="memory-indicator"]').count()) > 0;
  }

  async tab(name: TabName): Promise<void> {
    const tab = this.visible(`[data-testid="tab-${name}"]`);
    if ((await tab.count()) > 0) {
      await this.activate(tab);
    } else {
      // 좁은 화면에서 넘치는 탭은 ▾ 메뉴 안에 있다
      await this.activate(this.visible('[data-testid="tab-overflow"]'));
      await this.activate(this.visible(`[data-testid="tab-menu-${name}"]`));
    }
    // 탭 화면은 처음 열 때 따로 불러온다(지연 로딩) — 그 화면의 결과 칸이 보일 때까지 기다린다
    await this.visible(`#panel-${name} [data-testid="result-main"]`).waitFor();
  }

  async setLang(code: LangCode): Promise<void> {
    await this.page.evaluate((lang) => {
      const settings = JSON.parse(localStorage.getItem('settings') ?? '{}') as Record<string, unknown>;
      localStorage.setItem(
        'settings',
        JSON.stringify({ ...settings, useSystemLocale: false, locale: lang, userLocale: lang }),
      );
    }, code);
    await this.reload();
  }

  setClipboard(text: string): Promise<void> {
    return setClipboard(this.page, text);
  }

  getClipboard(): Promise<string> {
    return getClipboard(this.page);
  }

  step<T>(title: string, body: () => Promise<T>): Promise<T> {
    return test.step(title, body);
  }
}
