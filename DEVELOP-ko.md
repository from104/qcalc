# QCalc 개발 가이드

## 기술 스택

### 코어

- **Vue 3** + **TypeScript** (strict 모드)
- **Quasar 2** — UI 프레임워크
- **Tauri 2** — 데스크톱 앱 (0.13.0부터 프로덕션)
- **Electron** — 레거시 데스크톱 타겟, Tauri 전환기 동안 유지
- **Capacitor** — 모바일 앱 (Android)
- **Vite** — 빌드 도구

### 주요 라이브러리

- **mathjs** — 고정밀 BigNumber 수학 연산
- **Frankfurter API + fawazahmed0 currency-api** — 실시간 환율 데이터 (API 키 불필요)
- **tinykeys** — 키보드 단축키 처리
- **markdown-it** — 마크다운 렌더링
- **@tauri-apps/plugin-updater** — 데스크톱 자동 업데이트 (`src/boot/tauri-shim.ts`를 통해 연결되며, 레거시 타겟용으로 electron-updater도 남아 있습니다)

### 개발 도구

- **Node.js** 20+
- **Yarn** 4.x (패키지 매니저)
- **Vitest** — 단위 테스트
- **ESLint 9** — flat config 린팅
- **husky + lint-staged** — 커밋 전 자동 검사
- **GitHub Actions** — CI/CD 파이프라인
- **VSCode** 또는 **Cursor** (권장 IDE)
- **Android Studio** (안드로이드 빌드용)

---

## 시작하기

### 1. 사전 준비

Node.js 20+를 설치한 후 Yarn을 전역 설치합니다:

```bash
npm install -g yarn
```

### 2. 의존성 설치

```bash
yarn install
```

### 3. 환경 변수

프로젝트 루트에 `.env` 파일을 생성합니다:

```plaintext
# 안드로이드 키스토어 (안드로이드 릴리즈 빌드에 필수)
MY_JKS_KEY_FILE=/path/to/keystore.jks
MY_JKS_STORE_PASSWORD=store_password
MY_JKS_KEY_ALIAS=key_alias
MY_JKS_KEY_PASSWORD=key_password
```

> 환율 데이터는 무료 공공 API(Frankfurter + fawazahmed0)에서 가져오며 API 키가 필요 없습니다.

---

## 개발

### 데스크톱 (Tauri, 프로덕션)

사전 준비: Rust stable (`src-tauri/Cargo.toml` 기준 최소 `rust-version = 1.77.2`이며 최신 stable 권장 — `rustup update stable`), Linux 빌드 의존성 (`webkit2gtk-4.1`, `rsvg2`).

```bash
yarn dev:tauri     # 개발 모드 (devtools 자동 오픈)
yarn build:tauri   # 프로덕션 번들 (Linux는 .deb/.rpm/AppImage, Windows는 NSIS .exe)
```

**Wayland 사용자 주의사항**: GNOME/KDE Wayland 세션에서 `setTitle` CSD 헤더바 repaint와 `setAlwaysOnTop`이 작동하지 않는 업스트림 버그([tauri#13749](https://github.com/tauri-apps/tauri/issues/13749), [tauri#3117](https://github.com/tauri-apps/tauri/issues/3117))가 있습니다. `src-tauri/src/lib.rs`의 `force_xwayland_if_needed()`로 `GDK_BACKEND=x11`을 강제하면 두 문제가 해결되지만, 실기기 Wayland에서 간헐적 WebKitGTK 크래시를 유발하는 것이 확인돼 기본값은 강제하지 않음(네이티브 Wayland)입니다. 두 기능이 필요하고 크래시 위험을 감수할 경우 `QCALC_FORCE_XWAYLAND=1 yarn dev:tauri`로 옵트인하세요.

### 데스크톱 (Electron, 레거시)

```bash
quasar dev -m electron
```

### 안드로이드 (Capacitor)

```bash
quasar dev -m capacitor -T android
```

### 테스트 실행

```bash
yarn test
```

### 린트

```bash
yarn lint
```

---

## 빌드

### 데스크톱 (Tauri, 프로덕션)

```bash
yarn build:tauri
```

Linux에서는 `.deb` / `.rpm` / AppImage를, Windows에서는 NSIS 설치파일을 생성합니다 (`src-tauri/target/release/bundle/`). Flatpak과 Snap을 포함한 6종 데스크톱 패키지의 공식 릴리즈 산출물은 `v*` 태그가 붙을 때 `.github/workflows/release.yml`이 빌드합니다. Flatpak 잡은 CI가 빌드한 `.deb`를 `flatpak/io.github.from104.qcalc.yml`에, Snap 잡은 `snap/snapcraft.yaml`에 투입합니다.

### 데스크톱 (Electron, 레거시)

```bash
quasar build -m electron           # Linux
quasar build -m electron -T win32  # Windows (Linux에서 빌드하려면 Wine 필요)
```

### 안드로이드

```bash
quasar build -m capacitor -T android
```

### 자동화 빌드 스크립트 (레거시 / 안드로이드)

`build.sh` / `build.bat`은 **Electron** 데스크톱 빌드와 안드로이드 빌드를 처리합니다. 0.13.0부터 배포되는 Tauri 패키지는 생성하지 않습니다:

```bash
./build.sh linux      # Electron Linux (레거시)
./build.sh win        # Electron Windows (레거시)
./build.sh android    # 안드로이드 APK
```

> Linux에서는 먼저 `chmod +x build.sh`를 실행하세요.

---

## Android Studio 설정

1. 안드로이드 타겟 빌드: `quasar build -m capacitor -T android`
2. Android Studio에서 `src-capacitor` 디렉토리 열기
3. **Sync Project with Gradle Files** 클릭
4. 기기 연결 (USB 디버깅) 또는 에뮬레이터 시작
5. **Run** 클릭

### 키스토어 설정

릴리즈 빌드에는 서명된 키스토어가 필요합니다. `.env` 파일에 `MY_JKS_*` 변수를 설정하세요 (위 참조).

> `.env` 파일이나 키스토어 파일을 버전 관리에 절대 커밋하지 마세요.

---

## CI/CD

- **`ci.yml`** — 모든 푸시마다 린트 → 타입 체크(`vue-tsc`) → 커버리지 임계값을 적용한 테스트를 실행하고, Electron 빌드 잡도 수행합니다
- **`release.yml`** — `v*` 태그에서 6종 데스크톱 패키지(Linux의 deb/rpm/AppImage/Flatpak/Snap, Windows의 NSIS)와 안드로이드 APK를 빌드·서명해 초안 GitHub 릴리즈에 업로드합니다. 안드로이드 잡은 `MY_JKS_BASE64`·`MY_JKS_STORE_PASSWORD`·`MY_JKS_KEY_ALIAS`·`MY_JKS_KEY_PASSWORD` 시크릿이 필요하며, 하나라도 없으면 서명 안 된 APK를 내보내는 대신 어떤 것이 비었는지 찍고 실패합니다
- **`tauri-updater-promote.yml`** — 릴리즈 게시 후 수동으로 실행하며, `latest.json`을 고정된 `tauri-updater` 롤링 릴리즈로 승격합니다. **자동 업데이트 클라이언트는 이 단계를 거쳐야 새 버전을 인식합니다.**
- **husky + lint-staged** — 커밋 전 ESLint 및 포맷팅 검사 자동 실행

---

## 프로젝트 구조

```text
src/
├── boot/             # Quasar 부트 파일 (android, capacitor 등)
├── components/       # Vue 컴포넌트
├── composables/      # Vue 컴포저블 (useCalcButtonActions, useRecordManager 등)
├── constants/        # 버튼 정의, 단위/통화 데이터, 환율 스냅샷
├── content/          # 마크다운 콘텐츠 (도움말, 소개, 팁)
├── core/             # 핵심 계산기 클래스 (Calculator, CalculatorMath 등)
├── css/              # 공통 SCSS 스타일
├── i18n/             # 국제화 (10개 언어: ko, en, ja, zh, hi, de, es, fr, pt, ru)
├── layouts/          # 레이아웃 컴포넌트 (Narrow/Wide)
├── pages/            # 페이지 컴포넌트
├── router/           # Vue Router 설정
├── stores/           # Pinia 스토어
├── types/            # TypeScript 타입 정의
└── utils/            # 유틸리티 함수
src-tauri/            # Tauri 데스크톱 (프로덕션) — src/lib.rs, tauri.conf.json,
                      #   capabilities/, icons/, UPDATER.md
src-electron/         # Electron main/preload (레거시 데스크톱 타겟)
src-capacitor/        # Capacitor 안드로이드 프로젝트
flatpak/              # Flatpak 매니페스트 + metainfo (CI가 빌드한 Tauri .deb 사용)
snap/                 # Snapcraft 설정 (CI가 빌드한 Tauri .deb 사용)
scripts/              # 빌드 시점 스크립트 (fetch-fallback-rates.ts 등)
```

Electron→Tauri 런타임 브리지는 `src/boot/tauri-shim.ts`에 있습니다 — `window.electron` / `window.electronUpdater`를 Tauri API로 매핑하므로 `src/` 코드는 두 타겟에서 수정 없이 동작합니다.

---

## 주의사항

1. **환경 보안** — 인증 정보가 포함된 `.env` 파일을 절대 커밋하지 마세요.
2. **환율 데이터** — `yarn fetch-rates`로 빌드 시점 환율 스냅샷을 갱신할 수 있습니다. 빌드 스크립트(`build.sh` / `build.bat`)가 빌드 전에 자동으로 실행합니다.
3. **안드로이드** — `ANDROID_HOME` 환경변수 필수. 릴리즈 빌드에는 키스토어 필요.
4. **자동 업데이트** — Windows 설치파일과 Linux AppImage에서 지원. `.deb`/`.rpm` 설치본은 수동으로 업데이트하며, Snap/Flatpak은 각 스토어의 업데이트 메커니즘 사용 (런타임에 업데이터 플러그인을 건너뜁니다). 릴리즈 게시 후에는 `tauri-updater-promote` 워크플로를 반드시 실행해야 하며, 그 전까지 클라이언트는 계속 "업데이트 없음"으로 보고합니다.

---

## 문의

개발 관련 문의: 서기현 <from104@gmail.com>
