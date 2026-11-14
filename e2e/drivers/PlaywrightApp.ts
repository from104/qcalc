/**
 * PlaywrightApp — CalcApp 을 Playwright Page 위에 구현한 드라이버 (웹 빌드용).
 *
 * 앱 주소에는 항상 `?e2e=1` 을 붙인다 → 애니메이션 0, 자동 업데이트 확인 끔 (e2e/README.md).
 * 선택자는 data-testid 와 키패드 id(`btn-<id>`)만 쓴다. aria-label 은 번역되므로 쓰지 않는다.
 */
import { test, type Locator, type Page, type Route } from '@playwright/test';

import type { ButtonId, CalcApp, Capability, ScreenName, SelectField, TabName, UiSnapshot } from './CalcApp';
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

  async choose(field: SelectField, option: string): Promise<void> {
    await this.activate(this.visible(`[data-testid="${field}"]`));
    const menu = this.page.locator('.q-menu').filter({ visible: true });
    await menu.waitFor();
    // 입력으로 거르는 선택 상자(통화)는 목록이 길어 가상 스크롤이므로 이름을 쳐서 좁힌다
    const field_ = this.visible(`[data-testid="${field}"]`);
    if ((await field_.evaluate((el) => el.tagName)) === 'INPUT') await field_.fill(option);
    // 항목은 설명(caption)과 이름 두 줄 — 이름 줄만 맞춘다. 통화 이름 줄은 'JPY, 160.0000' 처럼 환율이 붙는다
    const escaped = option.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const label = menu
      .locator('.q-item__label:not(.q-item__label--caption)')
      .filter({ hasText: new RegExp(`^${escaped}(,|$)`) });
    await this.activate(label.first());
    await menu.waitFor({ state: 'hidden' });
  }

  async swap(panel: 'unit' | 'radix' | 'currency'): Promise<void> {
    await this.activate(this.visible(`#btn-swap-${panel}`));
  }

  async openScreen(screen: ScreenName): Promise<void> {
    const hash = screen === 'calc' ? '#/' : `#/${screen}`;
    await this.page.evaluate((h) => {
      location.hash = h;
    }, hash);
    if (screen === 'calc') await this.visible('[data-testid="result-main"]').waitFor();
    else await this.visible('.sub-page').waitFor();
  }

  async notices(): Promise<string[]> {
    const texts = await this.visible('.q-notification').allTextContents();
    return texts.map((text) => normalize(text));
  }

  snapshotUi(): Promise<UiSnapshot> {
    return this.page.evaluate(() => {
      const isVisible = (el: Element): boolean => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        const style = getComputedStyle(el);
        return style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) > 0;
      };
      const clean = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim();
      const nameOf = (el: Element): string => {
        const label = clean(el.getAttribute('aria-label'));
        if (label) return label;
        const by = el.getAttribute('aria-labelledby');
        if (by) {
          const text = clean(
            by
              .split(/\s+/)
              .map((id) => document.getElementById(id)?.textContent ?? '')
              .join(' '),
          );
          if (text) return text;
        }
        // 아이콘 글리프(.q-icon)는 글자가 아니라 그림이다 — 이름에 세지 않는다
        const clone = el.cloneNode(true) as Element;
        clone.querySelectorAll('.q-icon, .q-focus-helper, .q-ripple, .q-tooltip').forEach((n) => n.remove());
        const text = clean(clone.textContent);
        if (text) return text;
        return clean(el.getAttribute('title'));
      };
      const whereOf = (el: Element): string => {
        const icon = el.querySelector('.q-icon')?.textContent?.trim() || el.querySelector('.q-icon')?.className || '';
        return [
          el.id && `#${el.id}`,
          el.getAttribute('data-testid') && `[${el.getAttribute('data-testid')}]`,
          icon && `icon:${String(icon).slice(0, 40)}`,
        ]
          .filter(Boolean)
          .join(' ');
      };
      const kinds: [string, string][] = [
        ['button', 'button, [role="button"]'],
        ['tab', '[role="tab"]'],
        ['heading', 'h1, h2, h3, h4, h5, h6, [role="heading"]'],
        ['combobox', '[role="combobox"]'],
        ['menuitem', '[role="menuitem"]'],
        ['link', 'a[href]'],
        ['textbox', 'input:not([type="hidden"]):not([type="file"]), textarea, [role="textbox"], [role="searchbox"]'],
      ];
      const seen = new Set<Element>();
      const controls: { kind: string; name: string; where: string }[] = [];
      for (const [kind, selector] of kinds) {
        for (const el of document.querySelectorAll(selector)) {
          if (seen.has(el) || !isVisible(el)) continue;
          seen.add(el);
          // 보조기기에서 숨긴 것(aria-hidden)과 파일 선택용 숨김 입력은 제외
          if (el.closest('[aria-hidden="true"]')) continue;
          // 입력칸은 이름 대신 placeholder 도 인정한다
          const name = nameOf(el) || (kind === 'textbox' ? clean(el.getAttribute('placeholder')) : '');
          controls.push({ kind, name, where: whereOf(el) });
        }
      }
      const texts: string[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const value = clean(node.textContent);
        const parent = node.parentElement;
        if (!value || !parent) continue;
        if (parent.closest('script, style, noscript, .q-icon, [aria-hidden="true"]')) continue;
        if (!isVisible(parent)) continue;
        texts.push(value);
      }
      // aria-label·title·placeholder 도 사용자에게 읽히는 글이다
      for (const el of document.querySelectorAll('[aria-label], [title], [placeholder]')) {
        if (!isVisible(el)) continue;
        for (const attr of ['aria-label', 'title', 'placeholder']) {
          const value = clean(el.getAttribute(attr));
          if (value) texts.push(value);
        }
      }
      return { controls, texts } as UiSnapshot;
    });
  }

  async recordTexts(): Promise<string[]> {
    const items = this.visible('[data-testid="record-text"]');
    const texts = await items.allTextContents();
    return texts.map((text) => normalize(text));
  }

  async restoreRecord(index: number): Promise<void> {
    await this.openRecordMenu(index);
    await this.activate(this.visible('[data-testid="record-load-main"]'));
    // 좁은 화면은 불러온 뒤 계산기 화면으로 돌아간다
    await this.visible('[data-testid="result-main"]').waitFor();
  }

  async deleteRecord(index: number): Promise<void> {
    if (this.touch) {
      // 터치 기기에는 메뉴 항목이 없고 항목을 왼쪽에서 오른쪽으로 밀어 지운다 (q-slide-item @left)
      const box = await this.visible('[data-testid="record-item"]').nth(index).boundingBox();
      if (!box) throw new Error(`기록 ${index} 이(가) 보이지 않는다`);
      const y = box.y + box.height / 2;
      await this.page.mouse.move(box.x + 10, y);
      await this.page.mouse.down();
      await this.page.mouse.move(box.x + box.width * 0.6, y, { steps: 8 });
      await this.page.mouse.move(box.x + box.width - 4, y, { steps: 8 });
      await this.page.mouse.up();
      return;
    }
    await this.openRecordMenu(index);
    await this.activate(this.visible('[data-testid="record-delete"]'));
  }

  async deleteAllRecords(): Promise<void> {
    await this.activate(this.visible('[data-testid="subpage-delete_outline"]'));
    // 확인 다이얼로그(Quasar $q.dialog) — 두 번째 버튼이 '예'(ok) 이다
    const dialog = this.page.locator('.q-dialog').filter({ visible: true });
    await dialog.waitFor();
    await this.activate(dialog.locator('.q-card__actions .q-btn').last());
    await dialog.waitFor({ state: 'hidden' });
  }

  /** 기록 한 건의 메뉴를 연다 — 데스크톱은 ⋮ 버튼, 터치 기기는 항목 길게 누르기(touch-hold) */
  private async openRecordMenu(index: number): Promise<void> {
    if (this.touch) {
      const box = await this.visible('[data-testid="record-item"]').nth(index).boundingBox();
      if (!box) throw new Error(`기록 ${index} 이(가) 보이지 않는다`);
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.mouse.down();
      await this.page.waitForTimeout(900);
      await this.page.mouse.up();
    } else {
      await this.visible('[data-testid="record-menu-btn"]').nth(index).click();
    }
    await this.visible('.q-menu [role="menuitem"]').first().waitFor();
  }

  private blocker: { matches: (url: URL) => boolean; handler: (route: Route) => Promise<void> } | null = null;

  async blockRequests(match: string | null): Promise<void> {
    if (this.blocker) await this.page.unroute(this.blocker.matches, this.blocker.handler);
    this.blocker = null;
    if (match === null) return;
    this.blocker = {
      matches: (url) => url.pathname.includes(match),
      handler: (route) => route.abort('connectionrefused'),
    };
    await this.page.route(this.blocker.matches, this.blocker.handler);
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
