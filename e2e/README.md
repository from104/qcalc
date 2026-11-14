# QCalc 자동 테스트 (e2e)

LLM 없이 한 명령으로 무인 실행한다. 같은 **시나리오**를 웹 빌드·Tauri·Android 에서 돌리는 것이 목표이고,
지금은 웹 빌드 위의 Playwright 드라이버(Phase 1)와 실제 Tauri 앱(Linux) 위의 WebdriverIO 드라이버(Phase 2)가 있다.

```bash
yarn test:all                                  # = scripts/test-suite.sh : code + web
scripts/test-suite.sh --setup                  # 처음 한 번: Playwright 브라우저(chromium, webkit) 설치
scripts/test-suite.sh --layer web              # e2e 만
scripts/test-suite.sh --layer web -- --repeat-each=3 --project=webkit-desktop   # -- 뒤는 playwright 인자
scripts/test-suite.sh --rebuild                # dist/spa 강제 재빌드
yarn test:e2e -g "퍼센트"                       # playwright 직접
npx playwright show-trace test-results/e2e-artifacts/<시험>/trace.zip   # 실패 추적 열기
scripts/test-suite.sh --layer app              # 실제 Tauri 앱 (이 기계의 OS — 지금은 Linux 만)
yarn test:e2e:app -g "클립보드"                  # app 층 playwright 직접 (바이너리: node e2e/app/build.mjs)
```

결과는 `test-results/summary.md`(30줄 이하, 실행 시작 때 지우고 끝에 새로 씀 — 돌린 층/안 돌린 층 표시) · `summary.json` · `e2e-junit.xml`(app 층은 `app-junit.xml`) · 단계별 `*.log`,
HTML 보고서는 `playwright-report/`(app 층은 `test-results/app-html-report/`). 추적(trace)·스크린샷은 **실패한 시험만** 남는다. 실패가 있으면 종료 코드 1.

## 층(layer)

| 층     | 내용                                                                                               |
| ------ | -------------------------------------------------------------------------------------------------- |
| `code` | `yarn lint` · `vue-tsc --noEmit` · `yarn test`(vitest) · `cargo test`(src-tauri, cargo 가 있을 때) |
| `web`  | 운영 웹 빌드(`quasar build -m spa` → `dist/spa`)를 정적 서버로 띄워 Playwright 3개 프로젝트        |
| `app`  | 실제 앱 — Linux: Tauri 디버그 바이너리를 Xvfb 에서 tauri-driver + WebdriverIO 로 (아래 「app 층」) |

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
  scenarios/<그룹>.ts         시나리오 그룹 (basic keyboard convert formula history i18n)
  web/<그룹>.spec.ts          3줄짜리 스펙 — runGroup(그룹)
  web/run.ts                  그룹 → Playwright 시험 (needs 검사·skip·knownBug·seed)
  fixtures/test.ts            Playwright test 확장: clipboardMode·capabilities 옵션, app 픽스처
  fixtures/seed.ts            localStorage 시드 (buildSeed/applySeed, APP_VERSION, LANGS)
  fixtures/network.ts         환율 API 고정(FIXED_RATES) + 외부 요청 차단
  fixtures/clipboard.ts       native/stub 클립보드, setClipboard/getClipboard
  support/serve.mjs           빌드(필요할 때) + dist/spa 정적 서버 (`--build-only` = 빌드만)
  drivers/WdioApp.ts          WebDriver(WebdriverIO) 구현 — 실제 앱용
  drivers/page-functions.ts   페이지 안에서 도는 함수(snapshotUi 등) — 두 드라이버가 공유
  app/                        app 층 (playwright.app.config.ts 가 러너)
    build.mjs                 디버그 바이너리(웹 빌드 내장)를 필요할 때만 빌드 → src-tauri/target/e2e-app/qcalc
    env-linux.ts              격리 데스크톱: Xvfb · 사설 D-Bus · 임시 HOME/XDG · tauri-driver
    procs.ts                  실행 표지(QCALC_E2E_RUN) 로 우리 프로세스만 찾고 끝낸다
    global-setup.ts           격리 데스크톱을 한 번 띄우고 teardown 에서 정리
    session.ts                WebDriver 세션 = 앱 프로세스 하나 (relaunch · 프로필 초기화)
    tauri-app.ts              TauriApp = WdioApp + invoke · X 창 · 프로필 파일 · 종료 · AT-SPI
    helpers.ts                클립보드 도우미 · AT-SPI 리스너 (support/*.py 를 자식 프로세스로)
    fixtures.ts · run.ts      Playwright 픽스처(앱 하나를 시험끼리 재사용) · 그룹 → 시험
    shared.spec.ts            e2e/scenarios/* 6개 그룹 그대로
    native.ts · native.spec.ts  앱 전용 시나리오 13개
playwright.app.config.ts      app 층 러너 설정 (workers 1, 프로젝트 tauri-linux)
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

**앱 버그로 실패하면 시험을 약하게 고치지 않는다.** 시나리오에 `knownBug: '<버그 설명>'` 과 `symptom: /<오류 메시지 정규식>/` 을 함께 적는다(known-bug 표시). symptom 과 안 맞는 실패는 진짜 실패로 취급된다.
한 플랫폼에서만 나는 버그는 `knownBugOn: { 'tauri-linux': { bug, symptom } }` — 그 플랫폼(`CalcApp.platform`)에서만 기대된 실패이고
다른 플랫폼에서는 평소처럼 통과해야 한다(예: keyboard 의 Control+c 복사).
시나리오는 **그대로 실행**되고 — 실패하면 기대된 실패라 통과(요약에 `known-bug` 로 따로 집계, 사유는 summary.json),
**통과하면 빨갛게** `bug fixed — remove the known-bug mark` 로 알린다. 버그를 고친 사람은 그때 `knownBug` 줄을
지우면 끝이다(`fixme` 처럼 안 돌아서 고쳐도 모르는 일이 없다). `i18n.ts` 의 `KNOWN_UNNAMED`(언어별 점검에서 뺀 두 컨트롤)도
같은 때 함께 지운다. 알려진 버그 목록은 `grep -rn knownBug e2e/scenarios`.

## 앱이 스스로 새로고침할 때

지연 로드(청크)가 실패하면 `router/index.ts` 의 `vite:preloadError` 리스너가 페이지를 한 번 새로 연다(10초 안 재시도 없음).
청크를 끊는 시나리오는 `app.reload()` 뒤에 `app.settleSelfReload()` 로 그 새로고침이 끝나기를 기다린 다음 입력한다.

## 층별 보충

- `code` 층의 vitest 에는 `src/__tests__/i18n-parity.test.ts` 가 있다 — `fallbackLocale: 'en'` 이 가리는 언어별 번역 누락을
  전역 메시지·SFC `<i18n>` 전부에서 ko 기준으로 비교한다. 기존 빈틈은 `i18n-parity-baseline.json`(지금은 0건), 새 빈틈만 실패.
  의도적으로 늘릴 때 `UPDATE_I18N_BASELINE=1 yarn test src/__tests__/i18n-parity.test.ts`.
- CI(`.github/workflows/ci.yml`): PR 게이트 = lint-test(lint·vue-tsc·vitest 커버리지·번들 예산) + cargo-test + web-e2e
  (`scripts/test-suite.sh --layer web`, 요약을 `$GITHUB_STEP_SUMMARY` 에, 실패 시 보고서·trace 업로드).

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
Tauri 드라이버(WdioApp)도 같은 주소(`tauri://localhost/?e2e=1#/`)로 이동시킨다. Android 도 같은 방식.

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
  App.vue 의 `validateAndCorrect*` 가 "고친" 것으로 셈한다. 다른 시험은 시드로 피하고, 이 결함은 basic 의 knownBug
  시나리오(`stores: { unit: null, … }` = 시드 제외)가 따로 지킨다.

## app 층 (실제 Tauri 앱, Linux)

```
scripts/test-suite.sh --layer app        # = --platform <이 기계의 OS>. linux 외에는 "not implemented on this host" 로 skip
  1. app build   node e2e/app/build.mjs  — dist/spa(serve.mjs --build-only) + `tauri build --debug --no-bundle`
                 (beforeBuildCommand 끔). 입력(src·public·src-tauri/src·Cargo.*·tauri.conf.json…)이 바이너리보다
                 새로울 때만. 첫 빌드 수 분, 그 뒤 재사용 0초 · 변경 시 ~20초. 강제: --rebuild. 로그 app-build-tauri.log
  2. app linux   npx playwright test -c playwright.app.config.ts  (-- 뒤 인자 전달)
  3. app cleanup 이번 실행 표지를 가진 프로세스가 남았는지 확인 — 남았으면 끝내고 fail
```

- **바이너리**: `cargo build` 만으로는 `custom-protocol` 기능이 빠져 devUrl(localhost:9000)을 연다 — 그래서 `tauri build`.
  결과는 `src-tauri/target/e2e-app/qcalc` 로 하드링크한다(`yarn dev:tauri` 가 target/debug/qcalc 를 devUrl 판으로 덮어써도 무관).
- **격리**(env-linux.ts): Xvfb(2560×1440, `-displayfd` 로 빈 번호) · 사설 D-Bus 세션 · 임시 `HOME`/`XDG_CONFIG_HOME`/
  `XDG_DATA_HOME`/`XDG_CACHE_HOME`/`XDG_RUNTIME_DIR`(`/tmp/qcalc-e2e-app-*`, 끝나면 삭제 — 남기려면 `E2E_KEEP_PROFILE=1`).
  `WAYLAND_DISPLAY` 를 지우고 `GDK_BACKEND=x11` → 사용자 데스크톱에 아무것도 안 뜨고, 사용자 프로필(`~/.config/io.github.from104.qcalc` 등)·
  사용자 D-Bus(Orca 포함)에 닿지 않는다. `GTK_IM_MODULE=wayland` 같은 Wayland 입력기 설정은 지운다(아래 발견 사항).
  NVIDIA 강제 GPU 경로는 `QCALC_NO_GPU_FORCE=1` 로 끈다(Xvfb 에는 GPU 가 없다).
- **프로세스**: 모두 `QCALC_E2E_RUN=<토큰>` 을 물려받는다. 정리는 이름·패턴이 아니라 이 토큰을 가진 프로세스만(`pkill` 금지).
  러너가 죽어도 다음 실행/같은 실행 끝의 `app cleanup` 이 `test-results/.app-run.json` 의 토큰으로 쓸어 낸다.
- **세션 하나 = 앱 프로세스 하나**를 시험끼리 재사용(workers 1). 시험마다 `seed` 는 같은 출처의 정적 파일
  (`/icons/favicon-16x16.png`)로 가서 localStorage 를 채우고 `tauri://localhost/?e2e=1#/` 로 연다. 시험이 앱을 끄거나 창 크기를
  바꾸면 픽스처가 다음 시험 전에 새 프로필로 다시 띄운다.
- **능력**: `keyboard`(WebDriver 키 동작 — WebKit 이 GTK 이벤트로 합성, Shift 오염 없음) · `clipboard`(진짜 X CLIPBOARD 를
  앱 **밖** 프로세스 `support/clipboard.py` 가 소유·읽기) · `reload` · `atspi`(호스트 ATK 2.46+ 일 때만). `netMock` 없음(요청 가로채기
  불가 → 환율·청크 차단 시나리오는 이유를 남기고 skip), `touch` 없음.
- **앱 종료**: WebDriver 세션 종료는 앱을 죽인다(RunEvent::Exit 없음 → 창 크기 저장 안 됨). 저장을 시험할 때는 `app.quit('key')`(q 키)
  또는 `app.quit('command')`(quit_app) 로 정상 종료한다.
- **실패 읽기**: summary.md → `test-results/app-html-report/`(실패 시험의 스크린샷 + 앱 로그 끝부분 첨부) → 환경 로그
  `test-results/app-{xvfb,dbus,driver,driver-stderr}.log`(앱의 stderr 는 driver-stderr). `app-exited` 주석 = 시험 뒤 앱이 죽어 있었다.
- **필요한 것**: `Xvfb` · `dbus-daemon` · `WebKitWebDriver`(apt `webkitgtk-webdriver`, 22.04/24.04 는 `webkit2gtk-driver`) ·
  `tauri-driver`(`cargo install tauri-driver --locked`) · `python3-gi`(Gtk 3, Atk, Atspi) · `xwininfo`/`xprop`(x11-utils). 없으면 globalSetup 이
  무엇이 없는지 말하고 실패한다.
- **CI**: `.github/workflows/e2e-app.yml` — 야간(03:30 KST)·수동·`workflow_call`, linux 잡(ubuntu-24.04). PR 게이트에는 없다.

## 발견 사항 (Phase 2, 앱 층)

- **Control+c 복사가 클립보드를 비운다(Tauri Linux)** — "복사되었습니다" 알림은 뜨지만 클립보드에 텍스트가 없다. 단축키가 keydown 기본
  동작을 막지 않아 WebKitGTK 의 기본 "복사"(선택 없음)가 앱의 `writeText` 를 덮는다(preventDefault 하면 정상). Shift+Control+c 는 정상.
  known-bug: native 「Control+c」 + keyboard 2개(`knownBugOn['tauri-linux']`).
- **q 로 끝내면 다음 실행에 키패드가 shift 고정** — 'q' 가 앱 종료이면서 shift 기능 `sin` 단축키라 종료 직전 shift 고정이 켜져 저장된다.
  known-bug: native 「'q' 로 끝내고 다시 켜도 키패드는 평상 상태다」.
- (앱 버그 아님) Wayland 세션의 `GTK_IM_MODULE=wayland` 가 X11 디스플레이로 새면 GTK 가 im-wayland.so 를 올려
  `gdk_wayland_display_get_wl_display` 단언 실패 후 웹뷰 생성 중 SIGSEGV. 시험 환경은 이 변수를 지운다. 예전 XWayland 강제(GDK_BACKEND=x11)
  크래시와 같은 함수 이름이라 그 원인 후보이기도 하다.

## 로드맵

- Windows(Phase 3): 같은 WdioApp + tauri-driver(msedgedriver) — e2e-app.yml 에 windows 잡을 더한다. 출처는 `http://tauri.localhost`.
- Android(Phase 4): Playwright `_android` 로 WebView 에 붙어 `CalcApp` 구현 (`touch` 능력, keyboard 는 기기 따라).
- 모든 드라이버가 `e2e/scenarios/*` 를 그대로 import 한다.
