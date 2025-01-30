# QCalc 개발 가이드

이 문서는 QCalc의 개발 및 빌드 프로세스에 대한 상세한 가이드를 제공합니다.

## 기술 스택

### 핵심 프레임워크

- Vue 3 + TypeScript
- Quasar 2 (UI 프레임워크)
- Electron (데스크톱 앱)
- Capacitor (모바일 앱)

### 주요 라이브러리

- MathJS (고정밀 수학 연산)
- freecurrencyapi-js (실시간 환율 데이터)
- tinykeys (키보드 단축키)
- markdown-it (마크다운 렌더링)
- electron-updater (자동 업데이트)

### 개발 도구

- Node.js 20.0 이상
- Yarn 패키지 매니저
- VSCode + Copilot 또는 Cursor AI
- Android Studio (안드로이드 빌드용)

## 개발 시작하기

### 1. 기본 설정

플랫폼(리눅스,윈도우 등)에 따라 node.js를 설치합니다.

#### yarn 전역 설치

```bash
npm install -g yarn
```

#### 프로젝트 의존성 설치

```bash
yarn install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```plaintext
# 통화 환율 API 키 (필수)
FREECURRENCY_API_KEY=<your_api_key>
# 안드로이드 키스토어 설정 (안드로이드 빌드 시 필수)
MY_JKS_KEY_FILE=/path/to/keystore.jks
MY_JKS_STORE_PASSWORD=store_password
MY_JKS_KEY_ALIAS=key_alias
MY_JKS_KEY_PASSWORD=key_password
```

## 개발 모드 실행

### 데스크톱 앱 개발

```bash
quasar dev -m electron
```

### 안드로이드 앱 개발

```bash
quasar dev -m capacitor -T android
```

## 빌드 프로세스

### 데스크톱 앱 빌드

#### Windows

```bash
quasar build -m electron -T win32
```

#### Linux

```bash
quasar build -m electron -T win32
```

### 안드로이드 앱 빌드

```bash
quasar build -m capacitor -T android
```

## 빌드 시 유의사항

릴리즈 페이지의 설치파일을 사용할 때 통화환전기능은 잘 작동할 것입니다. 하지만 직접 빌드할 경우에는 그 기능이 동작하지 않을 수 있습니다. 이는 통화환전 데이터를 [외부 사이트(https://freecurrencyapi.com/)](https://freecurrencyapi.com/)에서 가져오기 때문입니다. 이 사이트에서 무료 API key를 발급받아 프로젝트 폴더의 '.env' 파일에 다음과 같이 넣고 빌드하세요. 월 5000회 데이터를 무료로 갱신할 수 있습니다.

```plaintext
FREECURRENCY_API_KEY=<당신의_키>
```

## Android Studio에서의 개발

### Android Studio 설치 및 설정

1. [Android Studio](https://developer.android.com/studio) 최신 버전을 설치합니다.
2. Android Studio를 열고, 기본적인 설정을 완료합니다 (SDK 설정 등).

### Quasar 프로젝트 Android Studio로 가져오기

1. Quasar 프로젝트 디렉토리에서 `quasar build -m capacitor -T android` 명령어를 실행하여 안드로이드 빌드를 생성합니다.
2. `src-capacitor` 디렉토리 안에 `capacitor.config.json` 파일이 생성됩니다.
3. Android Studio에서 `Open an existing Android Studio project`를 선택하고, `src-capacitor` 디렉토리를 엽니다.

### Android 프로젝트 설정

1. Android Studio에서 프로젝트가 열리면, `Sync Project with Gradle Files`를 클릭하여 프로젝트를 동기화합니다.
2. `MainActivity.java` 또는 `MainActivity.kt` 파일을 열고, 필요한 패키지 및 설정을 확인합니다.

### Android 키스토어 설정

릴리스 빌드를 위해서는 키스토어 설정이 필요합니다. 프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 추가하세요:

```plaintext
MY_JKS_KEY_FILE=/path/to/your/keystore.jks
MY_JKS_STORE_PASSWORD=your_store_password
MY_JKS_KEY_ALIAS=your_key_alias
MY_JKS_KEY_PASSWORD=your_key_password
```

이러한 환경 변수들은 릴리스 APK에 서명하는 빌드 과정에서 사용됩니다. 다음 사항들을 반드시 지켜주세요:

- `.env` 파일을 버전 관리에 절대 커밋하지 마세요
- 키스토어 파일을 안전하게 보관하세요
- 키스토어 비밀번호를 잘 기억해두세요

### 빌드 및 실행

1. Android 기기를 USB 디버깅 모드로 연결하거나 Android 에뮬레이터를 실행합니다.
2. Android Studio에서 `Run` 버튼을 클릭하여 앱을 빌드하고 실행합니다.

## 자동화된 빌드 스크립트

프로젝트 루트에는 빌드 자동화를 위한 스크립트가 포함되어 있습니다:

### Linux 사용자 (build.sh)

```bash
# 스크립트에 실행 권한 부여
chmod +x build.sh

# 스크립트 실행
./build.sh
```

### Windows 사용자 (build.bat, 미완성)

```batch
# 명령 프롬프트에서 실행
build.bat
```

빌드 스크립트는 다음과 같은 작업을 자동으로 수행합니다:

- 프로젝트 버전 확인
- 필요한 의존성 설치
- Android 개발 환경 확인 (안드로이드 빌드 시)
- 빌드 디렉토리 생성 및 정리
- 플랫폼별 빌드 수행

## 주의사항

1. **API 키 보안**
   - `.env` 파일을 절대 Git에 커밋하지 마세요
   - 프로덕션 빌드 전 API 키 설정을 확인하세요

2. **안드로이드 개발**
   - ANDROID_HOME 환경변수 설정 필수
   - 키스토어 설정 필수 (릴리즈 빌드)
   - USB 디버깅 모드 활성화 (실제 기기 테스트)

3. **자동 업데이트**
   - Linux Snap 패키지에서는 자동 업데이트 비활성화
   - 개발 모드에서는 업데이트 시뮬레이션만 가능

## 접근성 가이드라인

현재 구현된 접근성 기능:

- ARIA 레이블
- 햅틱 피드백 (모바일)

개발 중인 기능:

- 결과 음성 출력
- 음성 명령
- 고대비 모드

## 지원 및 문의

개발 관련 문의: 서기현 <from104@gmail.com>
