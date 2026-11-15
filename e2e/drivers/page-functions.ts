/**
 * Functions that run *inside* the app page — shared by every driver (Playwright page.evaluate, WebdriverIO
 * browser.execute). They are serialised with Function.prototype.toString(), so each one must be self-contained:
 * no imports, no closures over module variables.
 */
import type { UiSnapshot } from './CalcApp';

/** 지금 화면의 조작 요소와 보이는 글자 — 번역 누락 탐지용 (CalcApp.snapshotUi) */
export function snapshotUiInPage(): UiSnapshot {
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
}

/**
 * The `index`-th *visible* element matching `selector` (Playwright's `locator(sel).filter({ visible: true }).nth(i)`),
 * or null. Visible = non-empty box and not visibility:hidden — the same rule Playwright uses.
 */
export function findVisibleInPage(selector: string, index: number): Element | null {
  const visible = [...document.querySelectorAll(selector)].filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden';
  });
  return visible[index] ?? null;
}

/** text of every visible element matching `selector`, whitespace collapsed */
export function visibleTextsInPage(selector: string): string[] {
  return [...document.querySelectorAll(selector)]
    .filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden';
    })
    .map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim());
}

/**
 * Vue/Quasar transitions still running in the app tree (#q-app — portals such as tooltips and toasts live outside it).
 * While a tab panel or a page slides, the leaving one is still in the DOM and visible, with the same button ids
 * (`btn-c1` exists in every calculator panel) — a click aimed at "the first visible #btn-c1" can land on it.
 */
export function transitionsInPage(): number {
  return document.querySelectorAll('#q-app [class*="-enter-active"], #q-app [class*="-leave-active"]').length;
}
