# QCalc 자동 테스트 (e2e)

LLM 없이 한 명령으로 무인 실행한다. 같은 **시나리오**를 웹 빌드·Tauri·Android 에서 돌리는 것이 목표이고,
지금(Phase 1)은 웹 빌드 위의 Playwright 드라이버가 있다.

```bash
yarn test:all                                  # = scripts/test-suite.sh : code + web
scripts/test-suite.sh --setup                  # 처음 한 번: Playwright 브라우저(chromium, webkit) 설치
scripts/test-suite.sh --layer web              # e2e 만
scripts/test-suite.sh --layer web -- --repeat-each=3 --project=webkit-desktop   # -- 뒤는 playwright 인자
scripts/test-suite.sh --rebuild                # dist/spa 강제 재빌드
yarn test:e2e -g "퍼센트"                       # playwright 직접
npx playwright show-trace test-results/e2e-artifacts/<시험>/trace.zip   # 실패 추적 열기
```

결과는 `test-results/summary.md`(20줄 이하) · `summary.json` · `e2e-junit.xml` · 단계별 `*.log`,
HTML 보고서는 `playwright-report/`. 추적(trace)·스크린샷은 **실패한 시험만** 남는다. 실패가 있으면 종료 코드 1.

## 층(layer)

| 층     | 내용                                                                                               |
| ------ | -------------------------------------------------------------------------------------------------- |
| `code` | `yarn lint` · `vue-tsc --noEmit` · `yarn test`(vitest) · `cargo test`(src-tauri, cargo 가 있을 때) |
| `web`  | 운영 웹 빌드(`quasar build -m spa` → `dist/spa`)를 정적 서버로 띄워 Playwright 3개 프로젝트        |
| `app`  | 실제 앱 — 아직 없음 (`--platform linux\|windows\|android` 는 "not implemented yet")                |

웹 프로젝트

| 프로젝트           | 근사 대상                       | 클립보드          | 능력                              |
| ------------------ | ------------------------------- | ----------------- | --------------------------------- |
| `chromium-desktop` | Windows WebView2 (480×756)      | native(권한 부여) | keyboard clipboard netMock reload |
| `webkit-desktop`   | Linux WebKitGTK (480×756)       | stub(메모리)      | keyboard clipboard netMock reload |
| `chromium-mobile`  | Android WebView (Pixel 7, 터치) | native            | + touch (누르기 = tap)            |

빌드 재사용: `e2e/support/serve.mjs` 가 `src/ public/ index.html quasar.config.ts package.json` 중 하나라도
`dist/spa/index.html` 보다 새로우면 다시 빌드한다(로그 `test-results/e2e-build.log`, 약 25초). 아니면 그대로 쓴다.
강제 재빌드는 `--rebuild` 또는 `E2E_REBUILD=1`. 포트는 `E2E_PORT`(기본 4178).

## 구조

```
playwright.config.ts          프로젝트 3개, webServer, 보고서
e2e/
  drivers/CalcApp.ts          드라이버 중립 인터페이스 + Capability (시나리오는 이것만 안다)
  drivers/PlaywrightApp.ts    Playwright Page 구현
  scenarios/kit.ts            시나리오 형식 · 키패드 표(KEY/SHIFT) · tapKeys/typeKeys · eventually/expect*
  scenarios/<그룹>.ts         시나리오 그룹 (basic, keyboard = 참조 구현 / convert formula history i18n = TODO)
  web/<그룹>.spec.ts          3줄짜리 스펙 — runGroup(그룹)
  web/run.ts                  그룹 → Playwright 시험 (needs 검사·skip·fixme·seed)
  fixtures/test.ts            Playwright test 확장: clipboardMode·capabilities 옵션, app 픽스처
  fixtures/seed.ts            localStorage 시드 (buildSeed/applySeed, APP_VERSION, LANGS)
  fixtures/network.ts         환율 API 고정(FIXED_RATES) + 외부 요청 차단
  fixtures/clipboard.ts       native/stub 클립보드, setClipboard/getClipboard
  support/serve.mjs           빌드(필요할 때) + dist/spa 정적 서버
scripts/test-suite.sh         층 실행기,  scripts/test-summary.mjs  요약 작성
```

## 시나리오 쓰는 법 (나머지 4개 그룹도 이 패턴으로)

1. `e2e/scenarios/<그룹>.ts` 에서 `defineGroup('<그룹>', [...])` 을 default export 한다. 시나리오 하나 = 시험 하나.
2. 시나리오는 `{ title, needs?, seed?, run(app) }`. **Playwright 를 import 하지 않는다** — `CalcApp` 메서드와
   `kit.ts` 도구만 쓴다. 그래야 Tauri·Android 드라이버에서 그대로 돈다.
3. `needs` 에 필요한 능력을 적는다(`keyboard`·`clipboard`·`netMock`·`reload`·`touch`). 드라이버에 없으면
   실행기가 건너뛰고 이유를 보고서에 남긴다.
4. 앱은 실행기가 `app.seed(scenario.seed)` 로 띄워 준다. 언어·기록·스토어 값은 `seed` 로 준다:
   `seed: { lang: 'de', stores: { unit: { selectedCategory: 'mass', sourceUnits: { mass: 'kg' }, targetUnits: { mass: 'g' } } } }`.
5. 화면 단언은 전부 기다리며 확인한다 — `expectMain(app, '42')`, `expectSub`, `expectClipboard`, `expectMemory`,
   일반형 `eventually(label, read, expected)`. 기대값은 **코드를 읽고 근거를 주석으로** 남긴다(basic.ts 머리말 참고).
6. 입력은 글자 하나씩: 키패드 `tapKeys(app, '12+3=')`(C 리셋, `<` ⌫, `~` ±, `^` shift), shift 기능
   `shifted(app, 'MS')`, 키보드 `typeKeys(app, '12+3')` + `app.key('Enter')`. 문자열을 한 번에 보내면 앱이 무시한다.
7. `app.step('설명', async () => …)` 로 묶으면 보고서·추적에 단계가 보인다.
8. `e2e/web/<그룹>.spec.ts` 는 이미 있다(`runGroup(group)`). 새 그룹이면 같은 3줄로 만든다.
9. 드라이버에 기능이 더 필요하면(예: 요청 한 번 끊기, 보이는 텍스트 모으기) `CalcApp` 에 메서드를 더하고
   `PlaywrightApp` 에 구현한다. 드라이버 고유 기능이면 Capability 를 하나 더 만든다.

**앱 버그로 실패하면 시험을 약하게 고치지 않는다.** 시나리오에 `fixme: '<버그 설명>'` 을 적으면 fixme 로
보고되고, 버그가 고쳐지면 그 줄만 지운다.

## 선택자 규칙

- 키패드: `btn-<열><행>` (CalcButton.vue). 이름 ↔ id 는 `kit.ts` 의 `KEY`/`SHIFT`.
- `data-testid`: `result-main` · `result-sub`(결과 칸의 숫자 부분), `memory-indicator`, `tab-<이름>`,
  `tab-overflow`(▾), `tab-menu-<이름>`(넘친 탭 메뉴 항목). 필요하면 src 에 최소한으로 더한다.
- aria-label·보이는 문구는 번역되므로 선택자로 쓰지 않는다.

## e2e 모드 (`?e2e=1`)

드라이버는 앱을 `/?e2e=1#/` 로 연다(해시 라우터라 쿼리는 앞에 붙는다). `src/boot/global-variables.ts` 가 이를 보고

- `<html>` 에 `motion-reduced e2e` 클래스 → 애니메이션·트랜지션 길이 ≈0 (app.scss 의 기존 저사양 모드 재사용),
- `window.globalVars.isE2E = true` → `AutoUpdate.vue` 가 업데이트 확인을 건너뜀.

AdMob: `src/boot/admob.ts` 가 비어 있어 웹/앱 어디서도 광고를 띄우지 않는다 — 끌 것이 없다. 광고를 다시 붙이면
`$g.isE2E` 일 때 초기화하지 않도록 한다. 플래그가 없으면 위 동작은 하나도 바뀌지 않는다.
Tauri·Android 드라이버도 같은 주소(`…/?e2e=1#/`)로 이동시키면 된다.

## 시드 · 네트워크 · 클립보드

- **시드**(`fixtures/seed.ts`): 같은 출처의 빈 문서(`/__e2e__/blank`)에서 localStorage 를 비우고 채운 뒤 앱을 연다.
  기본값은 팁 다이얼로그·변경 로그(`lastSeenChangelogVersion = package.json version`)·마이그레이션 안내를 끄고,
  언어 `ko`, 단위 길이 m→cm, 통화 USD→KRW. 단위·통화를 비워 두면 첫 실행에 "저장된 설정이 초기화되었습니다"
  토스트가 화면을 가린다(아래 발견 사항).
- **네트워크**(`fixtures/network.ts`): 환율 세 주소를 `FIXED_RATES`(EUR 기준)로 대답, 그 밖의 외부 요청은 끊는다.
  `mockNetwork(page, { failRates: true })` 로 실패 경로.
- **클립보드**(`fixtures/clipboard.ts`): Chromium 은 권한을 주고 진짜 클립보드, WebKit 은 readText 에 제스처가
  필요해 문서 스크립트 전에 메모리 대역으로 바꿔 끼운다. 시험 코드는 둘 다 `app.setClipboard/getClipboard`.

## WebKit 시스템 라이브러리

Ubuntu 에서 Playwright WebKit 은 `libmanette-0.2-0`(+`libhidapi-hidraw0`)이 없으면 뜨지 않는다. 정식 해결은
`sudo npx playwright install-deps webkit`. `--setup` 은 sudo 없이 우회도 한다 — 그 패키지를 `apt-get download`
로 받아 `~/.cache/ms-playwright/webkit-*/minibrowser-*/sys/lib` 에만 풀어 넣는다(시스템 무변경, 브라우저를 다시
설치하면 사라지므로 그때 `--setup` 을 다시).

## 발견 사항 (Phase 1)

- 새로 설치한 첫 실행에서 "앱 업데이트로 인해 일부 저장된 설정이 초기화되었습니다" 토스트가 뜬다 — 빈 스토어를
  App.vue 의 `validateAndCorrect*` 가 "고친" 것으로 셈한다. 시험은 시드로 피하고 있다.

## 로드맵

- Tauri: WebdriverIO + tauri-driver 로 `CalcApp` 구현 (`seed` = execute 로 localStorage 채우고 새로고침).
- Android: Playwright `_android` 로 WebView 에 붙어 `CalcApp` 구현 (`touch` 능력, keyboard 는 기기 따라).
- 두 드라이버 모두 `e2e/scenarios/*` 를 그대로 import 한다.
