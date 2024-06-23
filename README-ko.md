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
또는
quasar dev -m capacitor -T android
```

#### 설치 패키지 빌드 [윈도우]

```bash
quasar build -m electron -T {linux|win32}
or
quasar build -m capacitor -T android
```

#### 빌드 시 유의사항

릴리즈 페이지의 설치파일을 사용할 때 봉화기능을 사용시에 잘 작동할테지만 직접 빌드할 경우에는 그 기능은 아마도 동작하지 않을텐데요. 왜자하면 통화변환 데이터를 ![외부 사이트](https://freecurrencyapi.com/)에서 기져오기 때문입니다. 이 사이트에서 무료 API key를 발급받아 .env 파일에 다음과 같이 넣어주세요.

```plaintext
FREECURRENCY_API_KEY=<당신의_키>
```
