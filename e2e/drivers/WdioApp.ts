/**
 * WdioApp — CalcApp over a W3C WebDriver session (WebdriverIO), for the real desktop app:
 * tauri-driver → WebKitWebDriver (Linux) / msedgedriver (Windows) → the Tauri webview.
 *
 * Same selectors and the same waiting rules as PlaywrightApp (data-testid, keypad ids, "first *visible* match"),
 * so the shared scenarios in e2e/scenarios run unchanged. Differences from the web driver:
 *  - no request interception → no `netMock` capability
 *  - the clipboard is the real system clipboard, reached through an outside process (injected `clipboard`)
 *  - seeding needs a same-origin document that is not the app: `blankPath` (a static asset of the build)
 *
 * The session can be replaced (app relaunch), so the browser and origin are read through getters.
 */
import type { ButtonId, CalcApp, Capability, ScreenName, SelectField, TabName, UiSnapshot } from './CalcApp';
import { findVisibleInPage, snapshotUiInPage, visibleTextsInPage } from './page-functions';
import { applySeed, buildSeed, type LangCode, type SeedState } from '../fixtures/seed';

export const APP_PATH = '/?e2e=1#/';

export interface ClipboardAccess {
  set(text: string): Promise<void>;
  get(): Promise<string>;
}

export interface WdioAppOptions {
  platform: string;
  capabilities: Iterable<Capability>;
  /** current WebDriver session — changes when the app is relaunched */
  browser: () => WebdriverIO.Browser;
  /** origin of the app document, e.g. 'tauri://localhost' (Linux) or 'http://tauri.localhost' (Windows) */
  origin: () => string;
  /** same-origin path that is not the app (no app script runs there) — where localStorage gets seeded */
  blankPath: string;
  clipboard?: ClipboardAccess;
  /** report step — Playwright's test.step when run under @playwright/test */
  step?: <T>(title: string, body: () => Promise<T>) => Promise<T>;
}

/** WebDriver key codes (W3C "Keyboard actions") for tinykeys-style names */
const KEYS: Record<string, string> = {
  Control: '',
  Shift: '',
  Alt: '',
  Meta: '',
  Enter: '',
  Backspace: '',
  Delete: '',
  Escape: '',
  Tab: '',
  Space: ' ',
  Home: '',
  End: '',
  PageUp: '',
  PageDown: '',
  ArrowLeft: '',
  ArrowUp: '',
  ArrowRight: '',
  ArrowDown: '',
  ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`F${i + 1}`, String.fromCharCode(0xe031 + i)])),
};
const MODIFIERS = new Set(['Control', 'Shift', 'Alt', 'Meta']);

const normalize = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class WdioApp implements CalcApp {
  readonly platform: string;
  readonly capabilities: ReadonlySet<Capability>;
  protected readonly options: WdioAppOptions;

  constructor(options: WdioAppOptions) {
    this.options = options;
    this.platform = options.platform;
    this.capabilities = new Set(options.capabilities);
  }

  get browser(): WebdriverIO.Browser {
    return this.options.browser();
  }

  protected url(pathAndQuery: string): string {
    return `${this.options.origin()}${pathAndQuery}`;
  }

  /** wait for the index-th visible match of `selector` and return it as a WebdriverIO element */
  protected async visible(selector: string, { index = 0, timeout = 5000 } = {}): Promise<WebdriverIO.Element> {
    let found: unknown = null;
    await this.browser.waitUntil(
      async () => {
        found = await this.browser.execute(findVisibleInPage, selector, index);
        return !!found;
      },
      { timeout, interval: 50, timeoutMsg: `no visible element ${selector} [${index}] within ${timeout}ms` },
    );
    return this.browser.$(found as never) as unknown as WebdriverIO.Element;
  }

  /**
   * Click the index-th visible match like a user would (real pointer events), waiting while something covers it —
   * a toast over the tab bar answers "element click intercepted". Playwright's click() waits the same way.
   */
  protected async click(selector: string, { index = 0, timeout = 10_000 } = {}): Promise<void> {
    const deadline = Date.now() + timeout;
    for (;;) {
      const element = await this.visible(selector, { index, timeout: Math.max(1000, deadline - Date.now()) });
      try {
        await element.click();
        return;
      } catch (error) {
        const retryable = /intercepted|not interactable|stale element|no such element/i.test(String(error));
        if (!retryable || Date.now() > deadline) throw error;
        await sleep(100);
      }
    }
  }

  protected async visibleCount(selector: string): Promise<number> {
    return (await this.browser.execute(visibleTextsInPage, selector)).length;
  }

  protected async waitGone(selector: string, timeout = 5000): Promise<void> {
    await this.browser.waitUntil(async () => (await this.visibleCount(selector)) === 0, {
      timeout,
      interval: 50,
      timeoutMsg: `${selector} still visible after ${timeout}ms`,
    });
  }

  protected async waitReady(timeout = 15_000): Promise<void> {
    await this.browser.waitUntil(
      async () => {
        try {
          return await this.browser.execute(() => {
            const shown = (sel: string) =>
              [...document.querySelectorAll(sel)].some((el) => {
                const r = el.getBoundingClientRect();
                return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
              });
            return (
              document.documentElement.classList.contains('e2e') &&
              shown('[data-testid="result-main"]') &&
              shown('#btn-d6')
            );
          });
        } catch {
          return false; // navigating — the execution context is gone for a moment
        }
      },
      { timeout, interval: 50, timeoutMsg: `app did not become ready within ${timeout}ms` },
    );
  }

  async seed(state?: SeedState): Promise<void> {
    await this.browser.url(this.url(this.options.blankPath));
    await this.browser.execute(applySeed, buildSeed(state));
    await this.browser.url(this.url(APP_PATH));
    await this.waitReady();
  }

  async reload(): Promise<void> {
    try {
      await this.browser.refresh();
    } catch (error) {
      // the app may reload itself in the middle (router/index.ts reloadOnce)
      if (!/navigat|interrupt|context/i.test(String(error))) throw error;
    }
    await this.waitReady();
  }

  async settleSelfReload(): Promise<void> {
    // see PlaywrightApp.settleSelfReload — router/index.ts writes this key right before location.reload()
    const key = 'qcalc-chunk-reload-at';
    const fired = await this.browser
      .waitUntil(
        async () => {
          try {
            return await this.browser.execute((k) => sessionStorage.getItem(k) !== null, key);
          } catch {
            return false;
          }
        },
        { timeout: 5000, interval: 100 },
      )
      .then(() => true)
      .catch(() => false);
    if (!fired) return;
    await sleep(500);
    await this.waitReady();
  }

  async press(id: ButtonId): Promise<void> {
    await this.click(`[id="btn-${id}"]`);
  }

  async key(chord: string): Promise<void> {
    // '+' alone or 'Control++' → the key is '+'
    const plusKey = chord === '+' || chord.endsWith('++');
    const parts = (plusKey ? chord.slice(0, -1) : chord).split('+').filter(Boolean);
    const last = plusKey ? '+' : parts.pop()!;
    const mods = parts;
    for (const mod of mods) if (!MODIFIERS.has(mod)) throw new Error(`key(): unknown modifier ${mod} in ${chord}`);
    const code = KEYS[last] ?? (last.length === 1 ? last : undefined);
    if (!code) throw new Error(`key(): unknown key ${last} in ${chord}`);
    let action = this.browser.action('key');
    for (const mod of mods) action = action.down(KEYS[mod]!);
    action = action.down(code).up(code);
    for (const mod of [...mods].reverse()) action = action.up(KEYS[mod]!);
    await action.perform();
  }

  private async firstText(selector: string): Promise<string> {
    const texts = await this.browser.execute(visibleTextsInPage, selector);
    if (!texts.length) throw new Error(`no visible ${selector}`);
    return texts[0]!;
  }

  main(): Promise<string> {
    return this.firstText('[data-testid="result-main"]');
  }

  formulaExpression(): Promise<string> {
    return this.firstText('[data-testid="formula-expression"]');
  }

  sub(): Promise<string> {
    return this.firstText('[data-testid="result-sub"]');
  }

  async hasMemory(): Promise<boolean> {
    return (await this.visibleCount('[data-testid="memory-indicator"]')) > 0;
  }

  async tab(name: TabName): Promise<void> {
    if ((await this.visibleCount(`[data-testid="tab-${name}"]`)) > 0) {
      await this.click(`[data-testid="tab-${name}"]`);
    } else {
      // narrow window: the tab is in the ▾ overflow menu
      await this.click('[data-testid="tab-overflow"]');
      await this.click(`[data-testid="tab-menu-${name}"]`);
    }
    // tab panels are lazy-loaded the first time
    await this.visible(`#panel-${name} [data-testid="result-main"]`, { timeout: 10_000 });
  }

  async setLang(code: LangCode): Promise<void> {
    await this.browser.execute((lang) => {
      const settings = JSON.parse(localStorage.getItem('settings') ?? '{}') as Record<string, unknown>;
      localStorage.setItem(
        'settings',
        JSON.stringify({ ...settings, useSystemLocale: false, locale: lang, userLocale: lang }),
      );
    }, code);
    await this.reload();
  }

  async choose(field: SelectField, option: string): Promise<void> {
    await this.click(`[data-testid="${field}"]`);
    const control = await this.visible(`[data-testid="${field}"]`);
    const menu = '.q-menu, .q-select__dialog';
    await this.visible(menu);
    // the currency select filters by typing (virtual-scrolled list)
    if ((await control.getTagName()).toUpperCase() === 'INPUT') await control.setValue(option);
    // item = caption + name lines; match the name line only. Currency names read like 'JPY, 160.0000'
    const ref = await this.browser.waitUntil(
      async () =>
        this.browser.execute(
          (menuSel, wanted) => {
            for (const menuEl of document.querySelectorAll(menuSel)) {
              const r = menuEl.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) continue;
              for (const label of menuEl.querySelectorAll('.q-item__label:not(.q-item__label--caption)')) {
                const text = (label.textContent ?? '').trim();
                if (text === wanted || text.startsWith(`${wanted},`)) return label;
              }
            }
            return null;
          },
          menu,
          option,
        ),
      { timeout: 5000, interval: 50, timeoutMsg: `option ${option} not found in ${field}` },
    );
    await (this.browser.$(ref as never) as unknown as WebdriverIO.Element).click();
    await this.waitGone(menu);
  }

  async swap(panel: 'unit' | 'radix' | 'currency'): Promise<void> {
    await this.click(`#btn-swap-${panel}`);
  }

  async openScreen(screen: ScreenName): Promise<void> {
    const hash = screen === 'calc' ? '#/' : `#/${screen}`;
    await this.browser.execute((h) => {
      location.hash = h;
    }, hash);
    if (screen === 'calc') await this.visible('[data-testid="result-main"]');
    else await this.visible('.sub-page');
  }

  documentLang(): Promise<string> {
    return this.browser.execute(() => document.documentElement.lang);
  }

  async notices(): Promise<string[]> {
    return this.browser.execute(visibleTextsInPage, '.q-notification');
  }

  snapshotUi(): Promise<UiSnapshot> {
    return this.browser.execute(snapshotUiInPage);
  }

  async recordTexts(): Promise<string[]> {
    return (await this.browser.execute(visibleTextsInPage, '[data-testid="record-text"]')).map(normalize);
  }

  async restoreRecord(index: number): Promise<void> {
    await this.openRecordMenu(index);
    await this.click('[data-testid="record-load-main"]');
    await this.visible('[data-testid="result-main"]');
  }

  async deleteRecord(index: number): Promise<void> {
    await this.openRecordMenu(index);
    await this.click('[data-testid="record-delete"]');
  }

  async deleteAllRecords(): Promise<void> {
    await this.click('[data-testid="subpage-delete_outline"]');
    // Quasar $q.dialog — the last action button is OK (wait for the buttons, not just the dialog shell)
    const buttons = '.q-dialog .q-card__actions .q-btn';
    await this.browser.waitUntil(async () => (await this.visibleCount(buttons)) >= 2, {
      timeout: 5000,
      interval: 50,
      timeoutMsg: 'confirm dialog buttons did not appear',
    });
    await this.click(buttons, { index: (await this.visibleCount(buttons)) - 1 });
    await this.waitGone('.q-dialog');
  }

  /** the ⋮ button only shows while the record is hovered (visibility: hidden → hover) */
  private async openRecordMenu(index: number): Promise<void> {
    await (await this.visible('[data-testid="record-item"]', { index })).moveTo();
    const buttons = await this.browser.$$('[data-testid="record-menu-btn"]');
    const button = buttons[index];
    if (!button) throw new Error(`record ${index} has no menu button`);
    await button.waitForDisplayed({ timeout: 3000 });
    await button.click();
    await this.visible('.q-menu [role="menuitem"]');
  }

  async blockRequests(match: string | null): Promise<void> {
    if (match === null) return;
    throw new Error(`blockRequests: ${this.platform} cannot intercept requests (no netMock capability)`);
  }

  async setClipboard(text: string): Promise<void> {
    if (!this.options.clipboard) throw new Error(`${this.platform}: no clipboard access`);
    await this.options.clipboard.set(text);
  }

  async getClipboard(): Promise<string> {
    if (!this.options.clipboard) throw new Error(`${this.platform}: no clipboard access`);
    return this.options.clipboard.get();
  }

  step<T>(title: string, body: () => Promise<T>): Promise<T> {
    return this.options.step ? this.options.step(title, body) : body();
  }
}
