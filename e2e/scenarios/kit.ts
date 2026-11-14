/**
 * 시나리오 작성 도구 — 드라이버 중립(Playwright 를 import 하지 않는다).
 *
 * 시나리오 = { title, needs, seed?, run(app) }. 파일 하나가 그룹 하나를 default export 한다:
 *
 *   export default defineGroup('basic', [
 *     { title: '사칙연산', run: async (app) => { await tapKeys(app, '7*6='); await expectMain(app, '42'); } },
 *   ]);
 *
 * 실행기(e2e/web/run.ts 등)가 그룹의 각 시나리오를 시험 하나로 만들고, seed 로 앱을 띄운 뒤 run 을 부른다.
 */
import type { ButtonId, CalcApp, Capability } from '../drivers/CalcApp';
import type { SeedState } from '../fixtures/seed';

export interface Scenario {
  /** 보고서에 나오는 이름 */
  title: string;
  /** 필요한 드라이버 능력 — 하나라도 없으면 건너뛰고 이유를 남긴다 */
  needs?: Capability[];
  /** 앱을 띄울 때의 저장소 상태 (기본: 한국어, 첫 실행 안내 없음) */
  seed?: SeedState;
  /**
   * 알려진 앱 버그 — 이 시나리오는 지금 **실패해야 정상**이다(버그 설명을 적는다. 시험을 약하게 고치지 말 것).
   * 실행기가 시나리오를 그대로 돌려, 실패하면 "known-bug"(기대된 실패)로 보고하고, 통과하면 버그가 고쳐진 것이므로
   * "bug fixed — remove the known-bug mark" 로 빨갛게 만든다. 그때 이 줄(과 관련 예외 처리)을 지운다.
   */
  knownBug?: string;
  /** knownBug 와 함께 필수 — 그 버그로 생기는 오류 메시지의 모양. 메시지가 맞지 않는 실패는 "기대된 실패"가 아니라 진짜 실패다 */
  symptom?: RegExp;
  /** 아직 안 만든 시나리오 — 무엇을 다룰지 적어 두면 실행기가 건너뛰고 보고한다 */
  todo?: string;
  run(app: CalcApp): Promise<void>;
}

export interface ScenarioGroup {
  name: string;
  scenarios: Scenario[];
}

export const defineGroup = (name: string, scenarios: Scenario[]): ScenarioGroup => ({ name, scenarios });

/** 아직 구현하지 않은 시나리오 자리 */
export const todo = (title: string, what: string, needs: Capability[] = []): Scenario => ({
  title,
  needs,
  todo: what,
  run: () => Promise.reject(new Error(`not implemented: ${title}`)),
});

/** 시나리오 needs 중 드라이버에 없는 능력 */
export const missingCapabilities = (scenario: Scenario, app: CalcApp): Capability[] =>
  (scenario.needs ?? []).filter((need) => !app.capabilities.has(need));

// ─── 키패드 ───────────────────────────────────────────────────────────────

/** 기본·단위·환율 계산기 키패드: 글자 → 버튼 id (src/constants/CalcButtonSet.ts standardButtons) */
export const KEY = {
  '0': 'b6',
  '1': 'a5',
  '2': 'b5',
  '3': 'c5',
  '4': 'a4',
  '5': 'b4',
  '6': 'c4',
  '7': 'a3',
  '8': 'b3',
  '9': 'c3',
  '.': 'c6',
  '+': 'd5',
  '-': 'd4',
  '*': 'd3',
  '/': 'd2',
  '=': 'd6',
  '%': 'b2',
  C: 'c1',
  '<': 'd1', // ⌫
  '~': 'a2', // ±
  '^': 'a6', // shift
} as const satisfies Record<string, ButtonId>;

/** shift(⇧) 뒤에 누르는 확장 기능 (standardExtendedFunctions) — 한 번 쓰면 shift 는 풀린다 */
export const SHIFT = {
  MC: 'c1',
  MR: 'd1',
  'M÷': 'd2',
  'M×': 'd3',
  'M-': 'd4',
  'M+': 'd5',
  MS: 'd6',
  'x^y': 'a1',
  'x!': 'c2',
  int: 'b6',
  frac: 'c6',
} as const satisfies Record<string, ButtonId>;

/** 키패드를 글자 하나씩 누른다 — '12+3=' / 'C' 는 리셋, '<' 는 ⌫, '~' 는 ±, '^' 는 shift */
export async function tapKeys(app: CalcApp, sequence: string): Promise<void> {
  for (const ch of sequence) {
    if (ch === ' ') continue;
    const id = (KEY as Record<string, ButtonId | undefined>)[ch];
    if (!id) throw new Error(`tapKeys: '${ch}' 에 해당하는 버튼이 없다 (kit.ts KEY 표)`);
    await app.press(id);
  }
}

/** shift 기능 하나 실행 (예: 'MS', 'M+') */
export async function shifted(app: CalcApp, fn: keyof typeof SHIFT): Promise<void> {
  await app.press(KEY['^']);
  await app.press(SHIFT[fn]);
}

/** 키보드로 글자 하나씩 보낸다 (needs: keyboard) — 한꺼번에 입력하면 앱이 무시한다 */
export async function typeKeys(app: CalcApp, sequence: string): Promise<void> {
  for (const ch of sequence) if (ch !== ' ') await app.key(ch);
}

// ─── 단언 ─────────────────────────────────────────────────────────────────

export interface EventuallyOptions {
  /** 기다릴 최대 시간 (기본 5초) */
  timeout?: number;
}

/**
 * read() 가 expected 가 될 때까지 기다린다. 화면은 비동기로 갱신되므로 모든 화면 단언은 이걸 쓴다.
 * 읽는 중 예외(요소가 잠깐 없음 등)도 기다리는 동안은 다시 시도한다.
 */
export async function eventually<T>(
  label: string,
  read: () => Promise<T>,
  expected: T | ((actual: T) => boolean),
  { timeout = 5000 }: EventuallyOptions = {},
): Promise<T> {
  const ok = typeof expected === 'function' ? (expected as (a: T) => boolean) : (a: T) => a === expected;
  const deadline = Date.now() + timeout;
  let last: T | undefined;
  let lastError: unknown;
  for (;;) {
    try {
      last = await read();
      lastError = undefined;
      if (ok(last)) return last;
    } catch (error) {
      lastError = error;
    }
    if (Date.now() > deadline) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  const want = typeof expected === 'function' ? '(조건)' : JSON.stringify(expected);
  const got = lastError ? `오류: ${String(lastError).split('\n')[0]}` : JSON.stringify(last);
  throw new Error(`${label}: ${timeout}ms 안에 ${want} 이(가) 되지 않음 — 마지막 값 ${got}`);
}

export const expectMain = (app: CalcApp, expected: string, options?: EventuallyOptions) =>
  eventually('메인 결과', () => app.main(), expected, options);

export const expectSub = (app: CalcApp, expected: string, options?: EventuallyOptions) =>
  eventually('보조 결과', () => app.sub(), expected, options);

export const expectClipboard = (app: CalcApp, expected: string, options?: EventuallyOptions) =>
  eventually('클립보드', () => app.getClipboard(), expected, options);

export const expectMemory = (app: CalcApp, present: boolean, options?: EventuallyOptions) =>
  eventually('메모리 표시', () => app.hasMemory(), present, options);
