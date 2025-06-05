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

## 광고 기능 설정 (AdMob)

QCalc는 Capacitor 모드에서 AdMob을 사용하여 광고를 표시할 수 있습니다. 다음은 광고 기능을 설정하고 테스트하기 위한 안내입니다.

### 1. AdMob 계정 및 광고 단위 ID

1.  [Google AdMob](https://admob.google.com/)에 가입하고 앱을 등록합니다.
2.  앱에 대한 배너 광고 단위를 생성합니다.
3.  생성된 광고 단위 ID(예: `ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN`)를 기록해둡니다.

### 2. Capacitor AdMob 플러그인 설치 (예시)

Capacitor에서 AdMob을 사용하려면 해당 플러그인을 설치해야 합니다. 예를 들어, 커뮤니티 플러그인 `capacitor-admob` 또는 `cordova-plugin-admob-free`와 같은 Cordova 플러그인을 사용할 수 있습니다. (실제 사용하는 플러그인 이름으로 대체해야 합니다.)

```bash
# 예시: capacitor-admob 플러그인 설치 (실제 플러그인으로 대체)
npm install capacitor-admob
npx cap sync
```

또는 Cordova 플러그인을 사용하는 경우:
```bash
npm install cordova-plugin-admob-free @awesome-cordova-plugins/admob-free
npm install @capacitor/cordova-compatibility --save-dev # 필요한 경우
npx cap sync
```
**참고:** 실제 프로젝트에 통합된 플러그인 이름과 설치 명령으로 위의 예시를 수정해야 합니다.

### 3. Android 플랫폼 설정

1.  `android/app/src/main/AndroidManifest.xml` 파일에 AdMob 앱 ID를 추가합니다.
    ```xml
    <manifest>
        <application>
            <!-- 기존 내용 -->
            <meta-data
                android:name="com.google.android.gms.ads.APPLICATION_ID"
                android:value="ca-app-pub-XXXXXXXXXXXXXXXX~NNNNNNNNNN"/> <!-- 실제 AdMob 앱 ID로 대체 -->
        </application>
    </manifest>
    ```
    AdMob 앱 ID는 광고 단위 ID와 다릅니다. AdMob 콘솔에서 찾을 수 있습니다.

2.  필요한 경우 `android/app/build.gradle` 파일에 AdMob 관련 의존성이 올바르게 추가되었는지 확인합니다. 플러그인 설치 시 자동으로 추가될 수 있습니다.

### 4. 광고 컴포넌트 및 로직 통합

-   광고 배너는 `src/components/AdBanner.vue` 컴포넌트에서 관리합니다.
-   이 `AdBanner.vue` 컴포넌트는 설치된 AdMob 플러그인을 사용하여 배너 광고를 로드하고 표시하도록 구현되어야 합니다. 현재는 플레이스홀더가 표시됩니다.
-   `AdBanner.vue`는 `src/stores/AdmobStore.ts`의 `isAdVisible` 상태와 Quasar의 플랫폼 감지(`$q.platform.is.capacitor`)를 사용하여 광고 표시 여부를 내부적으로 결정합니다.
-   `AdBanner.vue` 컴포넌트는 메인 레이아웃 파일인 `src/layouts/MainLayout.vue`에 통합되어 앱 전체적으로 광고를 표시하거나 숨길 수 있도록 설정됩니다. 개별 페이지 컴포넌트에서 광고 로직을 처리할 필요가 없습니다.

### 5. 인앱 구매 (광고 제거)

-   광고 제거를 위한 인앱 구매 기능은 Google Play Console에서 관련 상품을 설정해야 합니다.
-   Play Billing Library와 통신하기 위한 Capacitor 플러그인(예: `cordova-plugin-purchase`)을 통합해야 합니다.
-   `src/components/SettingCard.vue`에 광고 제거 구매를 시작하는 UI가 있으며, `initiateRemoveAdsPurchase` 메소드에서 실제 구매 로직을 구현해야 합니다.
-   구매 성공 시 `admobStore.hideAds()`를 호출하여 광고를 숨깁니다.

### 6. 테스트

-   실제 기기 또는 에뮬레이터에서 광고가 올바르게 표시되는지 테스트합니다.
-   광고 제거 구매 흐름을 테스트합니다 (테스트 계정 및 라이선스 테스터 설정 필요).
-   광고가 성공적으로 제거되는지 확인합니다.

**주의:**
-   개발 중에는 AdMob 테스트 광고 단위 ID를 사용하십시오.
-   실제 광고 단위 ID는 프로덕션 빌드에만 사용해야 합니다.
-   AdMob 및 Google Play 정책을 준수해야 합니다.

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
