---
name: qcalc-test
description: QCalc 자동 테스트(code·web E2E·app 층)를 돌리고 결과를 읽고 실패를 분류한다. "테스트 돌려", "전체 테스트", "회귀 테스트", "E2E 돌려", "시나리오 추가", "플레이키 확인", "run the tests", "test suite", "regression test", "playwright", "known-bug" 같은 요청에 사용.
---

# QCalc 테스트 스위트

돌리는 데 LLM이 필요 없다 — 한 명령으로 무인 실행. 자세한 구조·시나리오 작성법은 `e2e/README.md`.

## 명령

| 하고 싶은 것             | 명령                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------- |
| 전부(code + web)         | `yarn test:all`                                                                    |
| 한 층만                  | `scripts/test-suite.sh --layer code` / `--layer web` (`--layer` 여러 번 가능)      |
| 실제 앱 층 (미구현)      | `--layer app --platform linux\|windows\|android`                                   |
| 처음 한 번 브라우저 설치 | `scripts/test-suite.sh --setup` (chromium·webkit, sudo 없는 WebKit 우회 포함)      |
| 웹 빌드 강제 재빌드      | `--rebuild` (또는 `E2E_REBUILD=1`) — src 가 바뀌면 자동 재빌드됨                   |
| 플레이키 확인            | `scripts/test-suite.sh --layer web -- --repeat-each=3` (`--` 뒤는 playwright 인자) |
| 한 프로젝트·한 시험      | `-- --project=webkit-desktop -g "퍼센트"` 또는 `yarn test:e2e -g …`                |
| trace 열기               | `npx playwright show-trace test-results/e2e-artifacts/<시험>/trace.zip`            |
| i18n 기준선 갱신         | `UPDATE_I18N_BASELINE=1 yarn test src/__tests__/i18n-parity.test.ts`               |

층: `code` = lint · vue-tsc · vitest(i18n 패리티 포함) · cargo test / `web` = Playwright 3개 프로젝트
(chromium-desktop · webkit-desktop · chromium-mobile). 종료 코드: 실패 층이 있으면 1.

## 결과 읽는 순서

1. **`test-results/summary.md` 를 먼저 읽는다**(20줄 이하: 돌린/안 돌린 층, 층·프로젝트별 숫자, 실패 목록).
2. trace·스크린샷·로그는 **실패한 시험만** 연다. 단계별 로그는 `test-results/<층>-<단계>.log`, 전체는 `summary.json`.
3. 통과한 시험의 상세는 읽지 않는다.

## 실패 분류 순서

1. **환경** — 브라우저 미설치(`--setup`), 포트 4178 점유, 빌드 실패(`test-results/e2e-build.log`), cargo 없음. 시험 코드는 보지 않는다.
2. **플레이키** — `--repeat-each=3` 으로 재현이 갈리면. 고정 sleep 대신 `eventually` 로 기다리게 고친다(재시도 `retries` 로 덮지 않는다).
3. **진짜 회귀** — 같은 시험이 3번 다 실패. 변경 diff 와 대조해 앱 버그면 앱을 고친다. **시험을 약하게 고치지 않는다.**
4. **known-bug 뒤집힘** — 메시지가 `bug fixed — remove the known-bug mark` 이면 버그가 고쳐진 것: 아래 절차로 표시를 지운다.

## known-bug(알려진 앱 버그)

- 시나리오의 `knownBug: '<설명>'` 이 표시. 시나리오는 그대로 실행되고 **실패하면 통과**(요약 `known-bug` 칸에 따로 집계),
  **통과하면 빨강**(버그가 고쳐짐). `fixme`/`skip` 은 안 돌아서 고쳐도 모르므로 쓰지 않는다.
- 목록: `grep -rn knownBug e2e/scenarios` (사유는 summary.json 의 `knownBugs`).
- **졸업시키기**: 앱을 고침 → 해당 시나리오가 빨개짐 → `knownBug` 줄 삭제 → 다시 돌려 초록 확인.
  i18n 의 빈 이름 버그는 `KNOWN_UNNAMED`(e2e/scenarios/i18n.ts)도 함께 지운다.
- 새 버그 발견 시: 정상 동작을 단언하는 시나리오를 쓰고 `knownBug` 를 단다.

## 시나리오 추가

`e2e/scenarios/<그룹>.ts` 에 `{ title, needs?, seed?, knownBug?, run(app) }` 추가 — 드라이버 중립(Playwright import 금지),
화면 단언은 `eventually`/`expectMain` 등 기다리는 것만, 기대값은 코드를 읽고 근거 주석. 자세히는 `e2e/README.md` 「시나리오 쓰는 법」.
새 시나리오는 3개 프로젝트에서 `--repeat-each=3` 으로 안정을 확인한 뒤 커밋.

## 모델 배분

- 돌리기: LLM 불필요(`yarn test:all` 만).
- 실패 분류·원인 분석: **opus**.
- 새 시나리오 작성: **sonnet**, 검토는 **opus**. 계획·어려운 검증은 fable.

## 로드맵 (자리표시 — 아직 없음)

- Phase 2 Tauri Linux: xvfb + tauri-driver(WebdriverIO)로 `CalcApp` 구현, `--layer app --platform linux`.
- Phase 3 Windows: `gh workflow run` 으로 windows 러너에서 실행(로컬에서 못 돌림).
- Phase 4 Android: 에뮬레이터 `qcalc35` + Playwright `_android`, `touch` 능력.
- 드라이버만 새로 쓰면 `e2e/scenarios/*` 는 그대로 재사용.
