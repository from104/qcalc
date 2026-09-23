# 킬러앱 도약 — 구현 계획

> 기둥: **극한의 속도 · 동작의 매끄러움 · 레트로 감성**. 원칙: _측정 없이 최적화하지 않는다, 속도가 애니보다 우선, 접근성 회귀 0._
> 요약은 `TODO-ko.md` 「킬러앱 도약 로드맵」. 이 문서는 파일 단위 실행 계획이다.

## 현재 코드에서 확인된 병목 후보 (2026-09-24 실측)

| 위치                                       | 현상                                                           | 영향                                                      |
| ------------------------------------------ | -------------------------------------------------------------- | --------------------------------------------------------- |
| `src/i18n/messages.ts`                     | 10개 언어 YAML(+에러 10개)을 **전부 정적 import**              | 첫 번들에 9개 불필요 언어 포함                            |
| `src/core/calculator/CalculatorMath.ts:10` | `import { all, create } from 'mathjs'` — **mathjs 전체** 로드  | 번들 최대 덩어리로 추정, 파싱·평가 비용                   |
| `quasar.config.ts:34` boot 7개             | `admob`·`android`·`tauri-shim` 등이 데스크톱에서도 부팅 경로에 | 시작 시 불필요 모듈 평가                                  |
| `quasar.config.ts:40` extras               | `mdi-v5` + `material-icons` + `roboto-font` 동시 로드          | 아이콘 폰트 2벌, 폰트 로드 지연                           |
| `src/layouts/NarrowLayout.vue`             | `MenuPanel`·서브페이지를 정적 import                           | 계산기만 보는 첫 화면에 설정 UI 포함                      |
| `src/components/calc/CalcButton.vue:99`    | 입력이 `@click` (손 뗄 때)                                     | 체감 지연 — 길게 누르기 때문에 유지, 시각 피드백으로 보완 |
| `src/css/layout.scss:28` 등                | 0.2~0.3s 전환                                                  | 목표(120~180ms)보다 김                                    |
| `src-tauri/src/lib.rs:290`                 | `visible:false` 선표시 방지는 **Windows만**                    | Linux에서 흰 화면 깜빡임 가능성                           |

---

## Phase 0 — 계측 (0.14 착수 전, 1~2일)

측정이 없으면 이후 모든 작업의 효과를 증명할 수 없다. 가장 먼저 한다.

1. **번들 리포트**: `rollup-plugin-visualizer`를 `quasar.config.ts` `build.extendViteConf`에 옵션(`ANALYZE=1`)으로 추가 → `dist/stats.html`. 기준선 기록.
2. **시작 시간 마커**: `src/boot/perf.ts`(첫 boot) `performance.mark('boot')`, `CalcPage.vue` `onMounted` 후 `requestAnimationFrame`에서 `mark('interactive')`. 개발 모드에서 콘솔 출력, Tauri는 `invoke('log_perf')`로 프로세스 시작 시각(Rust `Instant`)과 합쳐 **진짜 콜드 스타트** 산출.
3. **입력 지연**: `pointerdown` → 결과 DOM 갱신 후 다음 rAF까지를 `PerformanceObserver('event')`(INP 방식)로 수집, 개발 오버레이에 p50/p95 표시.
4. **CI 예산 게이트**: `scripts/perf-budget.mjs` — 번들 gzip 크기(초기 청크) 상한, Playwright로 웹 빌드 로드 → `interactive` 마크 시간 상한. 초과 시 실패. `.github/workflows` 기존 CI 잡에 스텝 추가.

**산출물**: 기준선 표(초기 청크 KB, cold start ms, 입력 p95) → 이 문서에 기록.

### 기준선 — 번들 (2026-09-24, `ANALYZE=1 quasar build -m spa`, gzip)

- JS 합계 2421KB(원본) · CSS 480KB(원본, `index.css` 476KB — 아이콘 폰트 2벌 추정)
- 초기 청크: `index` 299KB + `MainLayout` 246KB + `vite-register` 62KB + vue 40KB ≈ **650KB gz**
- 모듈별 상위: **mathjs 371KB** · quasar 140KB · markdown-it 76KB(+imsize 14KB) · i18n 73KB · content/tips 67KB · content/pages 66KB
- → 우선순위 재조정: mathjs(1-2) > 도움말·팁 markdown 지연 로드(신규 1-9) > i18n(1-1) > 아이콘 CSS(1-5)

## Phase 1 — 속도 (0.14, 약 1주)

| #   | 작업                            | 파일                                                    | 방법                                                                                                                                                                   | 기대                                 |
| --- | ------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 1-1 | i18n 지연 로드                  | `src/i18n/messages.ts`, `initLocale.ts`, `boot/i18n.ts` | 현재 언어+`en`(fallback)만 동기 로드, 나머지는 `import.meta.glob('./messages/*.yml')`로 언어 변경 시 `setLocaleMessage`                                                | 초기 청크 대폭 축소                  |
| 1-2 | mathjs 슬림화                   | `CalculatorMath.ts`                                     | `all` 대신 실제 쓰는 팩토리만 `create({ addDependencies, bignumberDependencies, ... })`. 사용 함수 목록은 grep+테스트로 확정. 테스트 628개가 안전망                    | mathjs 크기 수십 %↓                  |
| 1-3 | 서브페이지·패널 지연 로드       | `NarrowLayout.vue`, `WideLayout.vue`, `MenuPanel`       | `defineAsyncComponent`, 유휴 시간(`requestIdleCallback`)에 프리페치                                                                                                    | 첫 화면 = 계산기만                   |
| 1-4 | 플랫폼별 boot 분리              | `quasar.config.ts`, `boot/admob.ts`·`android.ts`        | boot를 `{ path, server:false, client:true }` + 모드 조건(`ctx.mode.capacitor`)으로 필터                                                                                | 데스크톱에서 admob·android 코드 제거 |
| 1-5 | 폰트·아이콘 1벌화               | `quasar.config.ts` extras                               | `material-icons` 사용처 조사 후 mdi로 통일 or `@quasar/extras` svg 아이콘(트리셰이킹)으로 전환, 폰트 `font-display: swap`                                              | 폰트 요청·크기↓                      |
| 1-6 | Linux 흰 화면 제거              | `tauri.conf.json`, `lib.rs`                             | 모든 OS `visible:false` → 프런트가 첫 렌더 후 `getCurrentWindow().show()`. 단 Wayland realize 타이밍 이슈(lib.rs:359 주석) 재검증 필수, 실패 시 3초 타임아웃 강제 show | 깜빡임 0                             |
| 1-7 | 영속화 디바운스                 | `stores/*` persist 설정                                 | 기록·설정 저장을 200ms 디바운스 + `beforeunload` 즉시 flush                                                                                                            | 입력 중 I/O 제거                     |
| 1-9 | 도움말·팁·markdown-it 지연 로드 | `content/tips`, `content/pages`, markdown 렌더러        | 도움말·팁 표시 시점에 동적 import (약 220KB gz가 첫 화면에서 빠짐)                                                                                                     | 초기 청크↓                           |
| 1-8 | 반응성 다이어트                 | `calcStore.ts`, `ResultField.vue`(1432줄)               | 큰 기록 배열 `shallowRef`, 상수 데이터 `markRaw`, 무거운 computed 메모화 — Phase 0 프로파일로 대상 확정 후                                                             | 입력 p95↓                            |

**목표**: 데스크톱 cold start < 300ms, 입력→화면 < 16ms, Android 첫 화면 < 500ms.
**검증**: Phase 0 계측 전/후 비교, 전체 테스트, 실기기(gofu Wayland·Windows VM·Android).

## Phase 2 — 매끄러움 (0.14 후반~0.15, 약 4~5일)

1. ~~즉시 입력(pointerdown 처리)~~ — **보류**(길게 누르기 충돌). 입력은 `@click` 유지.
2. **눌림 피드백**: `:active` + `data-pressed` 클래스로 `transform: translateY(1px) scale(.98)`, 60ms. ripple은 스킨이 선택.
3. **모션 토큰**: `src/css/motion.scss` — `--dur-fast:120ms`, `--dur-base:160ms`, `--ease-out: cubic-bezier(.2,.8,.2,1)`. 기존 0.2~0.3s 전환을 토큰으로 치환(`layout.scss:28`, `app.scss:53`, 툴팁 200ms).
4. **결과 표시**: 기본 즉시. 옵션 설정 "숫자 롤링" 추가 시 `transform`만 사용.
5. **제스처(모바일)**: 계산기 탭 좌우 스와이프 — Quasar `v-touch-swipe`, 기록 패널 관성 스크롤은 네이티브에 맡김.
6. **저사양 모드**: `navigator.hardwareConcurrency <= 4` 또는 프레임 드롭 감지 시 모션 축소. 기존 `app.scss:191` reduced-motion 규칙 재사용.

**리스크**: 눌림 피드백·제스처가 스크린리더 조작에 영향 없는지 Orca·TalkBack 수동 확인.

## Phase 3 — 레트로 스킨 (0.15~0.16, 약 2주)

### 3-1. 스킨 엔진 (기존 `themesStore` 확장)

- 현재 `ThemeColors`(색만) → **`Skin` 타입**으로 확장: `colors` + `display`(배경·글자색·폰트·glow·ghost) + `button`(모양·그림자·눌림·radius) + `sound?` + `effects`(scanline 등).
- 적용 방식: CSS 변수 + `<html data-skin="lcd">` 속성. 스킨별 CSS는 `src/css/skins/<name>.scss`로 **지연 로드**(Phase 1 원칙 유지).
- `ThemesData.ts`의 기존 테마는 "모던" 스킨군으로 흡수, 마이그레이션(schemaVersion 3).

### 3-2. 디스플레이 렌더링

- 7세그먼트: 웹폰트(DSEG7 Classic, OFL 라이선스)를 `public/fonts`에 self-host, `ResultField.vue`에 스킨 활성 시만 적용.
- **ghost segment**: 같은 자리수만큼 `8`을 겹친 레이어(opacity .08). 스크린리더는 `aria-hidden`.
- VFD glow: `text-shadow` 2겹, LED: 도트 매트릭스는 `radial-gradient` 배경 마스크.
- 단위/통화 기호·한글처럼 세그먼트 폰트에 없는 문자는 보조 폰트 fallback.

### 3-3. 버튼

- `CalcButton.vue`에 스킨 클래스 주입, 역할별(숫자/연산/기능/클리어) 색은 이미 있는 `ButtonType` 활용.
- 입체감: `box-shadow` 하단 두께 + 눌림 시 제거.

### 3-4. 사운드

- `src/composables/useClickSound.ts` — Web Audio로 짧은 샘플(`public/sounds/*.ogg`, 5KB 이하) 프리디코드, pointerdown에서 재생. 기본 OFF, 설정에서 켬.

### 3-5. 스킨 출시 순서

| 버전 | 스킨                                   |
| ---- | -------------------------------------- |
| 0.15 | LCD, VFD                               |
| 0.16 | LED, 태양전지 포켓, CRT(스캔라인 옵션) |

### 3-6. 접근성 게이트 (모든 스킨)

- 텍스트 대비 AA(4.5:1) 자동 검사 스크립트(`scripts/check-skin-contrast.mjs`) CI 포함.
- 결과 낭독(`announce_a11y`) 경로는 표시 레이어와 분리돼 있으므로 불변 — 스킨별 스냅샷 테스트로 확인.

## 일정·관리

| 버전 | 범위                                          | 완료 조건                               |
| ---- | --------------------------------------------- | --------------------------------------- |
| 0.14 | Phase 0 + 1 + 2-1~3                           | 성능 목표 3종 달성, CI 예산 게이트 그린 |
| 0.15 | Phase 2 나머지 + 스킨 엔진 + LCD·VFD + 사운드 | 대비 검사·스크린리더 수동 확인          |
| 0.16 | 나머지 스킨, 제스처, 저사양 모드              | 전 플랫폼 실기기 확인                   |
| 1.0  | 스토어 스크린샷·소개 리뉴얼                   | —                                       |

- 브랜치: `feature/perf-0.14`, `feature/skins`(develop에서 분기).
- 각 Phase는 GitHub 이슈로 쪼개 `TODO-ko.md`에 링크.

## 결정 사항 (기현님, 2026-09-24)

1. **mathjs 슬림화**로 간다 (엔진 교체 안 함).
2. **pointerdown 입력 전환 보류** — 길게 누르기 기능과 충돌. 입력은 `@click` 유지, 눌림 _시각_ 피드백만 pointerdown에서 즉시 준다.
3. **스킨 전부 무료.**
