# 퀘이사를 이용해 만든 간단한 계산기 (v0.10.0)

MIT License

예전에 졸업과제로 만들었던 안드로이드용 계산기의 소스를 활용해 만든 간단한 계산기입니다. Vue3(Quasar v2), TypeScript, Electron 등 최신 웹 기술을 이용해 데스크톱과 모바일 환경에서 모두 사용 가능하도록 만들었습니다.

## 스크린샷

![Screenshot](https://github.com/from104/qcalc/raw/main/assets/screenshot_v0.9.0-ko.png)

## 특징

- 간단한 산술 연산, 비트 연산 (AND, OR, XOR, NOT 등), 메모리 기능 (MS, MR, MC, M+ ...등)
- 단위 변환 기능, 통화 변환 기능, 진법(2진수, 8진수, 10진수, 16진수) 변환 기능
- 계산 결과 등 복사와 붙혀넣기
- 계산 결과 기록 (최대 100개) 및 편집, 계산기로 불러오기, 메모 추가 등
- 다크 모드
- 영어, 한국어 지원
- 데스크탑, 모바일 대응 (electron, capacitor, etc...)
- 모바일에서 스와이프 기능 지원. (계산기 전환, 설정 및 기록 열고 닫기)

## 바로가기 키 (S: Shift, C: Control, A: Alt)

### 계산기 (\*: 이항 연산자)

#### 기본 모드 및 공통

- [0-9\.]: 숫자와 점
- +, -, \*, / (\*): 각각 더하기, 빼기, 곱하기, 나누기
- Enter, =: 마지막 계산 결과 출력
- Backspace: 한글자씩 지우기
- C-e, Escape, Delete: 계산기 리셋
- C-a: 부호 바꾸기
- C-s: 퍼센트 계산 (숫자, /(또는 \*), 숫자, 해당 키 순으로 입력)
- C-{q,w,d}: 제곱, 제곱근, 역수(1/x) 계산
- CS-{q,w,a,s,d}: N제곱(\*), N제곱근(\*), 10의 N제곱, 나머지(\*), 팩토리얼 계산
- S-[789]: 사인, 코사인, 탄젠트 계산
- S-[123456]: Pi, phi(황금율), e(Log 밑), Pi/2, log 10, log 2 상수 입력
- S-[0\.]: 정수, 소수 부분 추출
- S-=, S-Enter: 메모리에 저장
- CS-r: 메모리를 호출
- CS-e, S-Delete, S-Escape: 메모리 클리어
- S-{+,-,*,/}: 메모리에 더하기, 빼기, 곱하기, 나누기
- A-w: 단위, 통화 기호, 진법 뒤바꾸기.
- A-y: 단위, 통화 기호, 진법 표시 토글
- A-h: 계산 결과 기록 열기 (최대 100개)
- d: 계산 결과 기록을 지우기

#### 단위, 통화 모드 공통

- SC-a: ×2 또는 +5
- SC-s: ×3 또는 +10
- SC-d: ×5 또는 +100
- S-7, S-Numpad7: ÷2 또는 -5
- S-8, S-Numpad8: ÷3 또는 -10
- S-9, S-Numpad9: ÷5 또는 -100
- S-4, S-Numpad4: ×10
- S-5, S-Numpad5: ×100
- S-6, S-Numpad6: ×1000
- S-1, S-Numpad1: ÷10
- S-2, S-Numpad2: ÷100
- S-3, S-Numpad3: ÷1000

#### 진법 모드

- C-a: x&y (AND)
- C-s: x|y (OR)
- C-d: x^y (XOR)
- SC-d: !x (NOT)
- S-7, S-Numpad7: !(x&y) (NAND)
- S-8, S-Numpad8: !(x|y) (NOR)
- S-9, S-Numpad9: !(x^y) (XNOR)
- C-q: x<<y (y만큼 오른쪽 시프트)
- C-w: x>>y (y만큼 왼쪽 시프트)
- SC-q: x<<1 (1만큼 오른쪽 시프트)
- SC-w: x>>1 (1만큼 왼쪽 시프트)
- SC-a: x<<4 (4만큼 오른쪽 시프트)
- SC-s: x>>4 (4만큼 왼쪽 시프트)
- A-u: 진법 표시 형식 전환 (앞에 또는 뒤에)

### 그 외 기능

- C-1: 기본 계산기로 이동
- C-2: 단위 변환기로 이동
- C-3: 통화 환전기로 이동
- C-4: 진법 변환기로 이동
- C-Tab,  ->: 오른쪽 계산기 탭으로 이동.
- CS-Tab, <-: 왼쪽 계산기 탭으로 이동.
- A-t: 항상 위 기능 토글
- A-i: 시작 시 패널 초기화 토글
- A-d: 다크 모드 토글
- A-p: 햅틱 모드 토글
- ;: 버튼의 추가 기능 표시
- ,: 숫자 묶음 (,) 표시
- A-,: 숫자 묶음 단위 (3 또는 4) 변경
- [, ]: 소수점 고정 조정 (제한없음~6자리)
- "'": 버튼 추가 기능 활성화

### 클립보드

- C-c, C-Insert: 계산 결과 또는 선택한 내용을 클립보드로 복사
- C-v, S-Insert: 클립보드로부터 앱에 붙혀넣기

## 기술과 정보

### 사용된 기술, 프래임워크, 프로그램

- typescript
- nodeJS
- electron
- vue 3
- quasar 2
- q-markdown
- tinykeys
- MathJS
- freecurrencyapi-js

### 패키지 설치 방법

- 릴리즈 페이지에서 해당 플랫폼에 맞는 파일을 받아서 설치하면 됩니다.
- 리눅스는 appimage파일을 단독으로 쓰거나 snap파일을 --dangerous 옵션을 사용하여 설치하세요.
- 안드로이드는 해당 apk를 받아 설치하세요. 곧 플레이스토어에 올라갑니다.
- 맥OS, IOS는 사용하지 않고 테스트할 방법이 없어서 패키지가 없습니다.

### 앱 테스트 및 빌드 방법

기본적으로 nodeJS, vscode 환경에서 yarn을 아래와 같이 설치해줍니다.

```bash
npm install -g yarn
```

#### 필요한 모듈 설치

```bash
yarn install
```

#### 개발 모드로 실행하기 (실시간 리로딩, 에러 체크 등)

```bash
quasar dev -m electron
```

또는

```bash
quasar dev -m capacitor -T android
```

#### 설치 패키지 빌드 {리눅스,윈도우,안드로이드}

```bash
quasar build -m electron -T {linux|win32}
```

또는

```bash
quasar build -m capacitor -T android
```

#### 빌드 시 유의사항

릴리즈 페이지의 설치파일을 사용할 때 통화환전기능은 잘 작동할 것입니다. 하지만 직접 빌드할 경우에는 그 기능이 동작하지 않을 수 있습니다. 이는 통화환전 데이터를 [외부 사이트(https://freecurrencyapi.com/)](https://freecurrencyapi.com/)에서 가져오기 때문입니다. 이 사이트에서 무료 API key를 발급받아 프로젝트 폴더의 '.env' 파일에 다음과 같이 넣고 빌드하세요. 월 5000회 데이터를 무료로 갱신할 수 있습니다.

```plaintext
FREECURRENCY_API_KEY=<당신의_키>
```

### Android Studio에서의 추가적인 개발, 빌드 절차

#### Android Studio 설치 및 설정

1. [Android Studio](https://developer.android.com/studio) 최신 버전을 설치합니다.
2. Android Studio를 열고, 기본적인 설정을 완료합니다 (SDK 설정 등).

#### Quasar 프로젝트 Android Studio로 가져오기

1. Quasar 프로젝트 디렉토리에서 `quasar build -m capacitor -T android` 명령어를 실행하여 안드로이드 빌드를 생성합니다.
2. `src-capacitor` 디렉토리 안에 `capacitor.config.json` 파일이 생성됩니다.
3. Android Studio에서 `Open an existing Android Studio project`를 선택하고, `src-capacitor` 디렉토리를 엽니다.

#### Android 프로젝트 설정

1. Android Studio에서 프로젝트가 열리면, `Sync Project with Gradle Files`를 클릭하여 프로젝트를 동기화합니다.
2. `MainActivity.java` 또는 `MainActivity.kt` 파일을 열고, 필요한 패키지 및 설정을 확인합니다.

#### Android 키스토어 설정

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

#### 빌드 및 실행

1. Android 기기를 USB 디버깅 모드로 연결하거나 Android 에뮬레이터를 실행합니다.
2. Android Studio에서 `Run` 버튼을 클릭하여 앱을 빌드하고 실행합니다.

이 과정을 통해 Android Studio에서 추가적인 개발 및 빌드를 수행할 수 있습니다.

#### 빌드 스크립트 사용하기

프로젝트 루트에는 빌드 자동화를 위한 스크립트가 포함되어 있습니다:

##### Linux 사용자 (build.sh)

```bash
# 스크립트에 실행 권한 부여
chmod +x build.sh

# 스크립트 실행
./build.sh
```

##### Windows 사용자 (build.bat)

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

주의사항:

- Android 빌드를 위해서는 ANDROID_HOME 환경변수가 올바르게 설정되어 있어야 합니다.
- 키스토어 설정이 필요한 경우 .env 파일이 올바르게 구성되어 있어야 합니다.
- 빌드 스크립트는 현재 설치된 Node.js 버전과 호환되는지 자동으로 확인합니다.

### 개발 환경 요구사항

- Node.js 20.0 이상
- Yarn 패키지 매니저
- VSCode(Feat. Copilot) 또는 Cursor AI (권장)
- Android Studio (안드로이드 빌드 시)
