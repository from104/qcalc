/**
 * 저장소 시드 — 앱 스크립트가 돌기 전에 localStorage 를 원하는 상태로 채운다.
 *
 * 모든 Pinia 스토어는 pinia-plugin-persistedstate 로 localStorage 의 `<스토어 id>` 키에 JSON 으로
 * 저장된다(ui, settings, calc, unit, currency, radix, formula, themes). 부팅 때 그 JSON 을 $patch 로
 * 덮어쓰므로 일부 필드만 넣어도 된다.
 *
 * 기본 시드는 첫 실행 화면(팁 다이얼로그·변경 로그·마이그레이션 안내)과
 * "저장된 설정이 초기화되었습니다" 토스트가 뜨지 않게 하고, 언어를 고정한다.
 *
 * 드라이버 중립: buildSeed() 는 { 키: JSON 문자열 } 을 만들고, applySeed() 는 그걸 페이지 안에서
 * 적용하는 순수 함수다 — Playwright(page.evaluate)·WebdriverIO(browser.execute) 어디서든 그대로 쓴다.
 */
import { readFileSync } from 'node:fs';

/** package.json 의 버전 — 변경 로그 다이얼로그는 저장된 버전과 이 값이 다를 때 뜬다 */
export const APP_VERSION: string = (
  JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string }
).version;

/** src/i18n/languages.ts 의 SUPPORTED_LANGUAGES 와 같은 순서 */
export const LANGS = ['ko', 'en', 'ja', 'zh', 'hi', 'de', 'es', 'fr', 'pt', 'ru'] as const;
export type LangCode = (typeof LANGS)[number];

export type StoreKey = 'ui' | 'settings' | 'calc' | 'unit' | 'currency' | 'radix' | 'formula' | 'themes';

/**
 * 계산 기록 한 줄 — calcStore 의 calc.record.records 항목에서 calculationResult 부분.
 * 실제 저장 모양과 대조해 확인했다(history 시나리오): localStorage 'calc' = { calc: { record: { records: [...], MAX_RECORDS } } },
 * 기록 = { id, calculationResult, memo, timestamp, mode } 이고 최신이 앞이다.
 */
export interface HistoryEntry {
  previousNumber: string;
  /** Operator 열거값(src/core/calculator/Calculator.ts) 그대로: '+' '-' '×' '÷' 등 — '*' '/' 가 아니다 */
  operator: string;
  argumentNumber?: string;
  resultNumber: string;
  memo?: string;
}

export interface SeedState {
  /** 화면 언어 (기본 'ko') — settings.locale/userLocale 로 들어간다 */
  lang?: LangCode;
  /** 계산 기록 — 최신 항목이 앞. 형식은 실제 저장·복원과 대조해 검증됨(HistoryEntry 참고) */
  history?: HistoryEntry[];
  /** 스토어별 원시 덮어쓰기 — 기본 시드 위에 얕게 합쳐진다 */
  stores?: Partial<Record<StoreKey, Record<string, unknown>>>;
}

/** 기본 시드 — 첫 실행 방해 요소를 끄고 저장값 검증기가 아무 것도 고치지 않을 값만 넣는다 */
function defaultStores(lang: LangCode): Partial<Record<StoreKey, Record<string, unknown>>> {
  return {
    ui: {
      showTips: false,
      showTipsDialog: false,
      lastSeenChangelogVersion: APP_VERSION,
      snapLastSeenVersion: APP_VERSION,
      isSnapFirstRun: false,
      migrationOnboardingSeen: true,
      currentTab: 'calc',
    },
    settings: { useSystemLocale: false, locale: lang, userLocale: lang, autoUpdate: false },
    // 비어 있으면 App.vue 의 validateAndCorrect* 가 값을 채우며 "설정이 초기화되었습니다" 토스트를 띄운다
    unit: { selectedCategory: 'length', sourceUnits: { length: 'm' }, targetUnits: { length: 'cm' } },
    currency: { sourceCurrency: 'USD', targetCurrency: 'KRW' },
  };
}

/** SeedState → localStorage 에 그대로 넣을 { 키: JSON 문자열 } */
export function buildSeed(state: SeedState = {}): Record<string, string> {
  const lang = state.lang ?? 'ko';
  const stores = defaultStores(lang);
  for (const [key, value] of Object.entries(state.stores ?? {}) as [StoreKey, Record<string, unknown>][]) {
    stores[key] = { ...(stores[key] ?? {}), ...value };
  }
  if (state.history) {
    const now = Date.now();
    const records = state.history.map((h, i) => ({
      id: state.history!.length - i,
      calculationResult: {
        previousNumber: h.previousNumber,
        operator: h.operator,
        argumentNumber: h.argumentNumber ?? '',
        resultNumber: h.resultNumber,
      },
      memo: h.memo ?? '',
      timestamp: now - i * 1000,
      mode: 'calc',
    }));
    stores.calc = { ...(stores.calc ?? {}), calc: { record: { records, MAX_RECORDS: 100 } } };
  }
  return Object.fromEntries(Object.entries(stores).map(([k, v]) => [k, JSON.stringify(v)]));
}

/**
 * 페이지 안에서 실행되는 함수 — localStorage 를 비우고 시드를 넣는다.
 * 직렬화되어 브라우저로 넘어가므로 바깥 변수를 참조하면 안 된다.
 */
export function applySeed(entries: Record<string, string>): void {
  localStorage.clear();
  sessionStorage.clear();
  for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
}
