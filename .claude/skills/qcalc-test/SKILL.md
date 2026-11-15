---
name: qcalc-test
description: QCalc 자동 테스트(code·web E2E·app 층)를 돌리고 결과를 읽고 실패를 분류한다. "테스트 돌려", "전체 테스트", "회귀 테스트", "E2E 돌려", "시나리오 추가", "플레이키 확인", "run the tests", "test suite", "regression test", "playwright", "known-bug" 같은 요청에 사용.
---

# QCalc 테스트 스위트

돌리는 데 LLM이 필요 없다 — 한 명령으로 무인 실행. 자세한 구조·시나리오 작성법은 `e2e/README.md`.

## 명령

| 하고 싶은 것               | 명령                                                                                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 전부(code + web)           | `yarn test:all`                                                                                                                                          |
| 한 층만                    | `scripts/test-suite.sh --layer code` / `--layer web` (`--layer` 여러 번 가능)                                                                            |
| 실제 앱 층 (Tauri Linux)   | `scripts/test-suite.sh --layer app` (이 기계의 OS — linux 만 로컬에서 돈다. `--platform windows` 는 Linux 에서 skip)                                     |
| 실제 앱 층 (Tauri Windows) | **CI 에서만**: nightly 또는 `gh workflow run e2e-app.yml --ref <브랜치>`(워크플로가 main 에 있어야 함) → 잡 `windows`. 결과는 아티팩트 `app-e2e-windows` |
| app 층 한 시험·직접        | `yarn test:e2e:app -g "클립보드"` (바이너리 먼저: `node e2e/app/build.mjs`)                                                                              |
| app 층 강제 재빌드         | `scripts/test-suite.sh --layer app --rebuild`                                                                                                            |
| app 층 프로필 남기기       | `E2E_KEEP_PROFILE=1 scripts/test-suite.sh --layer app` (`/tmp/qcalc-e2e-app-*` 를 지우지 않음)                                                           |
| 처음 한 번 브라우저 설치   | `scripts/test-suite.sh --setup` (chromium·webkit, sudo 없는 WebKit 우회 포함)                                                                            |
| 웹 빌드 강제 재빌드        | `--rebuild` (또는 `E2E_REBUILD=1`) — src 가 바뀌면 자동 재빌드됨                                                                                         |
| 플레이키 확인              | `scripts/test-suite.sh --layer web -- --repeat-each=3` (`--` 뒤는 playwright 인자)                                                                       |
| 한 프로젝트·한 시험        | `scripts/test-suite.sh --layer web -- --project=webkit-desktop -g "퍼센트"` 또는 `yarn test:e2e -g 퍼센트`                                               |
| trace 열기                 | `npx playwright show-trace test-results/e2e-artifacts/<시험>/trace.zip`                                                                                  |
| i18n 기준선 갱신           | `UPDATE_I18N_BASELINE=1 yarn test src/__tests__/i18n-parity.test.ts`                                                                                     |

층: `code` = lint · vue-tsc · vitest(i18n 패리티 포함) · cargo test / `web` = Playwright 3개 프로젝트
(chromium-desktop · webkit-desktop · chromium-mobile) / `app` = 실제 Tauri 앱(프로젝트 tauri-linux: 공유 시나리오 + native 13개,
`yarn test:all` 에는 안 들어간다 — 따로 돌린다). 종료 코드: 실패 층이 있으면 1.

app 층 준비물(Linux): `Xvfb` · `dbus-daemon` · `WebKitWebDriver`(apt webkitgtk-webdriver / 22.04·24.04 는 webkit2gtk-driver) ·
`tauri-driver`(`cargo install tauri-driver --locked`, sudo 불필요) · `python3-gi`(Gtk3·Atk·Atspi) · x11-utils. 없으면 무엇이 없는지 말하고 실패.
첫 빌드는 수 분(Rust 디버그), 그 뒤 바이너리 재사용 — 시험만 약 3분. 사용자 데스크톱·프로필·D-Bus 에 닿지 않는다(Xvfb + 임시 XDG).

## 결과 읽는 순서

1. **`test-results/summary.md` 를 먼저 읽는다**(30줄 이하: 돌린/안 돌린 층, 층·프로젝트별 숫자, 실패 목록).
2. trace·스크린샷·로그는 **실패한 시험만** 연다. 단계별 로그는 `test-results/<층>-<단계>.log`, 전체는 `summary.json`.
3. 통과한 시험의 상세는 읽지 않는다.

## 실패 분류 순서

1. **환경** — 브라우저 미설치(`--setup`), 포트 4178 점유, 빌드 실패(`test-results/e2e-build.log`), cargo 없음. 시험 코드는 보지 않는다.
   app 층: `missing for the app layer: …`(도구 없음), `app build` 실패(`test-results/app-build-tauri.log`), 앱이 안 뜸
   (`test-results/app-driver-stderr.log` — 앱 stderr·GTK 경고, `app-xvfb.log`), `app cleanup` fail(정리 실패 — 남은 프로세스는 이미 끝냈다).
2. **플레이키** — `--repeat-each=3` 으로 재현이 갈리면. 고정 sleep 대신 `eventually` 로 기다리게 고친다(재시도 `retries` 로 덮지 않는다).
3. **진짜 회귀** — 같은 시험이 3번 다 실패. 변경 diff 와 대조해 앱 버그면 앱을 고친다. **시험을 약하게 고치지 않는다.**
4. **known-bug 뒤집힘** — 메시지가 `bug fixed — remove the known-bug mark` 이면 버그가 고쳐진 것: 아래 절차로 표시를 지운다.
   그 밖의 known-bug 는 **summary.md 의 known-bug 줄에서 실제 오류가 그 버그의 증상과 맞는지 확인**한다 — 시나리오의 `symptom` 과
   안 맞는 실패는 `known-bug 의 증상이 아닌 실패` 로 빨갛게 뜬다(다른 원인의 진짜 실패).

## known-bug(알려진 앱 버그)

- 시나리오의 `knownBug: '<설명>'` + `symptom: /오류 모양 정규식/`(필수) 이 표시. 한 플랫폼만의 버그는
  `knownBugOn: { 'tauri-linux': { bug, symptom } }` (다른 플랫폼에서는 통과해야 정상). 시나리오는 그대로 실행되고 **실패하면 통과**(요약 `known-bug` 칸에 따로 집계),
  **통과하면 빨강**(버그가 고쳐짐). `fixme`/`skip` 은 안 돌아서 고쳐도 모르므로 쓰지 않는다.
- 목록: `grep -rn knownBug e2e/scenarios` (사유는 summary.json 의 `knownBugs`).
- **졸업시키기**: 앱을 고침 → 해당 시나리오가 빨개짐 → `knownBug` 줄 삭제 → 다시 돌려 초록 확인.
  i18n 의 빈 이름 버그는 `KNOWN_UNNAMED`(e2e/scenarios/i18n.ts)도 함께 지운다.
- 새 버그 발견 시: 정상 동작을 단언하는 시나리오를 쓰고 `knownBug` 를 단다.

## 시나리오 추가

`e2e/scenarios/<그룹>.ts` 에 `{ title, needs?, seed?, knownBug?+symptom?, run(app) }` 추가 — 드라이버 중립(Playwright import 금지),
화면 단언은 `eventually`/`expectMain` 등 기다리는 것만, 기대값은 코드를 읽고 근거 주석. 자세히는 `e2e/README.md` 「시나리오 쓰는 법」.
새 시나리오는 3개 프로젝트에서 `--repeat-each=3` 으로 안정을 확인한 뒤 커밋.

## 모델 배분

- 돌리기: LLM 불필요(`yarn test:all` 만).
- 실패 분류·원인 분석: **opus**.
- 새 시나리오 작성: **sonnet**, 검토는 **opus**. 계획·어려운 검증은 fable.

## app 층 실패 읽기

- summary.md 의 `app | tauri-linux` 줄 → `test-results/app-html-report/`(실패 시험마다 스크린샷 + `app.log (tail)` 첨부).
- 주석 `app-exited` = 시험이 끝났을 때 앱 프로세스가 없었다(크래시 의심 → `app-driver-stderr.log`).
- 앱 전용 시나리오는 `e2e/app/native.ts`(TauriApp: invoke·X 창·프로필 파일·quit·AT-SPI). 공유 시나리오는 그대로 돈다.
- `netMock`·`touch` 가 필요한 시나리오는 이유를 남기고 skip(정상). `atspi` 는 호스트 ATK 2.46+ 에서만.
- CI: `.github/workflows/e2e-app.yml`(야간·수동, `gh workflow run e2e-app.yml`) — PR 게이트 아님.

## 로드맵

- Windows(Phase 3): e2e-app.yml 의 `windows` 잡 구현됨(첫 CI 실행 전 — 결과를 보고 known-bug·기대값을 다듬는다). 읽는 법: Actions 실행의 Job summary(= summary.md) → 아티팩트 `app-e2e-windows`(test-results/: app-html-report·app-driver\*.log·app-msedgedriver.log·app-build-tauri.log). 세션을 못 열면 globalSetup 스모크 확인이 층 전체를 바로 멈춘다(`smoke check: could not open a WebDriver session`). 로컬에서 못 돌림 — 앱 데이터를 격리할 수 없어 CI=true 가 아니면 거부한다.
- Phase 4 Android: 에뮬레이터 `qcalc35` + Playwright `_android`, `touch` 능력.
- 드라이버만 새로 쓰면 `e2e/scenarios/*` 는 그대로 재사용.
