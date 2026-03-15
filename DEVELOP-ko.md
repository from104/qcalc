# QCalc 개발 가이드

## 기술 스택

### 코어

- **Vue 3** + **TypeScript** (strict 모드)
- **Quasar 2** — UI 프레임워크
- **Electron 40** — 데스크톱 앱
- **Capacitor** — 모바일 앱 (Android)
- **Vite 7** — 빌드 도구

### 주요 라이브러리

- **mathjs** — 고정밀 BigNumber 수학 연산
- **freecurrencyapi-js** — 실시간 환율 데이터
- **tinykeys** — 키보드 단축키 처리
- **markdown-it** — 마크다운 렌더링
- **electron-updater** — 데스크톱 자동 업데이트

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
# 통화 환율 API 키 (통화 변환기에 필수)
FREECURRENCY_API_KEY=<your_api_key>

# 안드로이드 키스토어 (안드로이드 릴리즈 빌드에 필수)
MY_JKS_KEY_FILE=/path/to/keystore.jks
MY_JKS_STORE_PASSWORD=store_password
MY_JKS_KEY_ALIAS=key_alias
MY_JKS_KEY_PASSWORD=key_password
```

> [freecurrencyapi.com](https://freecurrencyapi.com/)에서 무료 API 키를 발급받을 수 있습니다 (월 5,000회 무료).

---

## 개발

### 데스크톱 (Electron)

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

### 데스크톱

#### Linux

```bash
quasar build -m electron
```

#### Windows

```bash
quasar build -m electron -T win32
```

> Linux에서 Windows 빌드를 하려면 Wine이 필요합니다.

### 안드로이드

```bash
quasar build -m capacitor -T android
```

### Flatpak

프로젝트의 Flatpak 빌드 설정 파일을 참조하세요.

### 자동화 빌드 스크립트

프로젝트에 포함된 빌드 스크립트는 의존성 확인, 버전 감지, 플랫폼별 빌드를 자동 처리합니다:

```bash
# 모든 플랫폼 빌드
./build.sh all        # Linux
build.bat all         # Windows

# 특정 플랫폼 빌드
./build.sh linux
./build.sh win
./build.sh android
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

- **GitHub Actions** — 모든 푸시에 린트 및 테스트 자동 실행 (`.github/workflows/ci.yml`)
- **husky + lint-staged** — 커밋 전 ESLint 및 포맷팅 검사 자동 실행

---

## 프로젝트 구조

```text
src/
├── boot/             # Quasar 부트 파일 (android, capacitor 등)
├── components/       # Vue 컴포넌트
├── composables/      # Vue 컴포저블 (useCalcButtonActions, useRecordManager 등)
├── constants/        # 버튼 정의, 단위/통화 데이터
├── content/          # 마크다운 콘텐츠 (도움말, 소개, 팁)
├── core/             # 핵심 계산기 클래스 (Calculator, CalculatorMath 등)
├── css/              # 공통 SCSS 스타일
├── i18n/             # 국제화 (8개 언어: ko, en, ja, zh, hi, de, es, fr)
├── layouts/          # 레이아웃 컴포넌트 (Narrow/Wide)
├── pages/            # 페이지 컴포넌트
├── router/           # Vue Router 설정
├── stores/           # Pinia 스토어
├── types/            # TypeScript 타입 정의
└── utils/            # 유틸리티 함수
src-electron/         # Electron main/preload
src-capacitor/        # Capacitor 안드로이드 프로젝트
```

---

## 주의사항

1. **API 키 보안** — `.env` 파일을 절대 커밋하지 마세요. 프로덕션 빌드 전 API 키를 확인하세요.
2. **안드로이드** — `ANDROID_HOME` 환경변수 필수. 릴리즈 빌드에는 키스토어 필요.
3. **자동 업데이트** — Windows 설치파일과 Linux AppImage에서 지원. Snap/Flatpak은 자체 업데이트 메커니즘 사용.

---

## 문의

개발 관련 문의: 서기현 <from104@gmail.com>
