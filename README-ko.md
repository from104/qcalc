# 퀘이사를 이용해 만든 간단한 계산기

예전에 졸업과제로 만들었던 안드로이드용 계산기의 소스를 활용해 만든 간단한 계산기 입니다. vue3(quasar v2), typescript, electron 등을 이용해 만들었습니다.

## 스크린샷

![Screenshot](https://github.com/from104/qcalc/raw/main/assets/screenshot_v0.8.0-ko.png)

## 특징

- 간단한 산술 연산, 메모리 기능 (MS, MR, MC, M+ ...등)
- 단위 변환 기능, 통화 변환 기능
- 계산 결과 등 복사와 붙혀넣기
- 계산 결과 기록 (최대 100개) 및 편집, 계산기로 불러오기, 메모 추가 등
- 다크 모드
- 영어, 한국어 지원
- 데스크탑, 모바일 대응 (electron, capacitor, etc...)
- 모바일에서 스와이프 기능 지원. (계산기 전환, 설정 및 기록 열고 닫기)

## 바로가기 키 (S: Shift, C: Control)

### 계산기 (\*: 이항 연산자))

- [0-9\.]: 숫자와 점
- +, -, \*, / (\*): 각각 더하기, 빼기, 곱하기, 나누기
- Enter, =: 마지막 계산 결과 출력
- Backspace: 한글자씩 지우기
- C-e, Escape, Delete: 계산기 리셋
- C-a: 부호 바꾸기
- C-s: 퍼센트 계산 (숫자, /(또는 \*), 숫자, 해당 키 순으로 입력)
- C-{q,w,d}: 제곱, 제곱근, 역수(1/x) 계산
- SC-{q,w,a,s,d}: N제곱(\*), N제곱근(\*), 10의 N제곱, 나머지(\*), 팩토리얼 계산
- S-[789]: 사인, 코사인, 탄젠트 계산
- S-[123456]: Pi, phi(황금율), e(Log 밑), Pi/2, log 10, log 2 상수 입력
- S-[0\.]: 정수, 소수 부분 추출
- S-=, S-Enter: 메모리에 저장
- SC-r: 메모리를 호출
- SC-e, S-Delete, S-Escape: 메모리 클리어
- S-{+,-,*,/}: 메모리에 더하기, 빼기, 곱하기, 나누기
- w: 단위 또는 통화 기호 뒤바꾸기.
- o: 단위 또는 통화 기호 표시 토글
- h: 계산 결과 기록 열기 (최대 20개)
- d: 계산 결과 기록을 지우기

### 그 외 기능

- Control-1: 계산기로 이동
- Control-2: 단위 변환기로 이동
- Control-3: 통화 환전기로 이동
- Control-Tab, ->: 오른쪽 계산기 탭으로 이동.
- Control-Shift-Tab, <-:왼쪽 계산기 탭으로 이동.
- t: 항상 위 기능 토글
- n: 시작 시 패널 초기화 토글
- k: 다크 모드 토글
- ,: 천단위 , 표시
- [, ]: 소수점 고정 조정 (제한없음~6자리)

### 클립보드

- Control-c, Control-Insert: 계산 결과 또는 선택한 내용을 클립보드로 복사
- Control-v, Shift-Insert: 클립보드로부터 앱에 붙혀넣기

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

#### 빌드 및 실행

1. Android 기기를 USB 디버깅 모드로 연결하거나 Android 에뮬레이터를 실행합니다.
2. Android Studio에서 `Run` 버튼을 클릭하여 앱을 빌드하고 실행합니다.

이 과정을 통해 Android Studio에서 추가적인 개발 및 빌드를 수행할 수 있습니다.
