/**
 * CalcApp — 시나리오가 앱을 다루는 유일한 창구(드라이버 중립 인터페이스).
 *
 * 시나리오(e2e/scenarios/*.ts)는 이 인터페이스만 안다. 같은 시나리오를
 *   - 웹 빌드: PlaywrightApp (e2e/drivers/PlaywrightApp.ts)
 *   - Tauri 데스크톱: WebdriverIO 드라이버 (예정)
 *   - Android: Playwright `_android` 드라이버 (예정)
 * 에서 그대로 돌리기 위해서다. 드라이버마다 할 수 있는 일이 달라서, 시나리오는 필요한 능력을
 * `needs` 로 밝히고, 드라이버는 `capabilities` 로 가진 능력을 밝힌다. 모자라면 실행기가 건너뛰고
 * 그 이유를 보고서에 남긴다.
 */
import type { LangCode, SeedState } from '../fixtures/seed';

/**
 * 드라이버 능력
 * - keyboard  : 앱 창에 키 조합(예: 'Control+v')을 보낼 수 있다
 * - clipboard : 시스템(또는 대역) 클립보드를 시험 코드에서 읽고 쓸 수 있다
 * - netMock   : HTTP 요청을 가로채 고정 응답을 주거나 실패시킬 수 있다(환율·수식 엔진 청크)
 * - reload    : 저장소를 유지한 채 앱을 다시 띄울 수 있다(기록 영속성)
 * - touch     : 탭·스와이프 같은 터치 입력을 보낸다
 */
export type Capability = 'keyboard' | 'clipboard' | 'netMock' | 'reload' | 'touch';

export type TabName = 'calc' | 'unit' | 'currency' | 'radix' | 'formula';

/**
 * 키패드 버튼 id — CalcButton.vue 가 `btn-<id>` 로 그린다. 열 a~d × 행 0~6.
 * 이름으로 부를 때는 e2e/scenarios/kit.ts 의 KEY/SHIFT 표를 쓴다.
 */
export type ButtonId = `${'a' | 'b' | 'c' | 'd'}${0 | 1 | 2 | 3 | 4 | 5 | 6}`;

export interface CalcApp {
  /** 보고서용 이름 — 예: 'web-chromium', 'tauri-linux', 'android' */
  readonly platform: string;
  readonly capabilities: ReadonlySet<Capability>;

  /** 저장소를 비우고 state 로 채운 뒤 앱을 (다시) 띄워 첫 화면이 준비될 때까지 기다린다 */
  seed(state?: SeedState): Promise<void>;
  /** 저장소를 유지한 채 앱을 다시 띄운다 (needs: reload) */
  reload(): Promise<void>;

  /** 키패드 버튼 하나를 누른다 (터치 기기는 탭) */
  press(id: ButtonId): Promise<void>;
  /** 키 조합 하나를 보낸다 — tinykeys 표기 그대로: '7', 'Enter', 'Control+v', 'Shift+Control+c' (needs: keyboard) */
  key(chord: string): Promise<void>;

  /** 메인 결과 칸의 숫자 부분 (단위·통화 기호·진법 접두/접미 제외, 공백 정리) */
  main(): Promise<string>;
  /** 보조 결과 칸의 숫자 부분 — 단위·환율·진법 탭에만 있다 */
  sub(): Promise<string>;
  /** 메모리 표시(칩 아이콘)가 보이는가 = 메모리에 값이 있는가 */
  hasMemory(): Promise<boolean>;

  /** 계산기 탭 전환 — 좁은 화면에서 넘치는 탭은 ▾ 메뉴로 연다 */
  tab(name: TabName): Promise<void>;
  /** 화면 언어를 바꾼다 — 저장된 설정을 바꾸고 다시 띄운다 */
  setLang(code: LangCode): Promise<void>;

  /** 클립보드 (needs: clipboard) */
  setClipboard(text: string): Promise<void>;
  getClipboard(): Promise<string>;

  /** 보고서에 단계로 남긴다 — Playwright 는 test.step, 다른 드라이버는 그냥 실행 */
  step<T>(title: string, body: () => Promise<T>): Promise<T>;
}
