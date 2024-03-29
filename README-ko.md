# 퀘이사를 이용해 만든 간단한 계산기

예전에 졸업과제로 만들었던 안드로이드용 계산기의 소스를 활용해 만든 간단한 계산기 입니다. vue3(quasar v2), typescript, electron 등을 이용해 만들었습니다.

## 스크린샷

![Screenshot](https://github.com/from104/qcalc/raw/main/assets/screenshot_v0.7.2.png)

## 특징

- 간단한 산술 연산
- 단위 변환 기능
- 통화 변환 기능
- 계산 결과 등 복사와 붙혀넣기
- 계산 결과 기록 (최대 20개)
- 다크 모드
- 영어, 한국어 지원

## 바로가기 키

### 계산기

- [0-9\.]: 숫자와 점
- +, -, \*, /: 각각 더하기, 빼기, 곱하기, 나누기
- Enter, =: 마지막 계산 결과 출력
- s, \_: 부호 바꾸기
- p, %: 퍼센트 계산 (숫자, /(또는 \*), 숫자, p(또는 %) 순으로 입력)
- u: 제곱 계산
- r: 제곱근 계산
- i: 역수(1/x) 계산
- Backspace: 한글자씩 지우기
- Escape, Delete, c: 계산기 리셋
- v: 단위 또는 통화 기호 뒤바꾸기.
- b: 단위 또는 통화 기호 표시 토글
- h: 계산 결과 기록 열기 (최대 20개)
- d: 계산 결과 기록을 지우기

### 그 외 기능

- m: 왼쪽 메뉴 열고 닫기
- e: 오른쪽 설정 열고 닫기
- F1: 도움말 열기
- F2: 계산기 열기
- F3: 단위 변환기 열기
- F4: 통화 환전기 열기
- F5: 앱 정보 열기
- t: 항상 위 기능 토글
- n: 시작 시 패널 초기화 토글
- k: 다크 모드 토글
- ,: 천단위 , 표시
- [, ]: 소수점 고정 조정 (제한없음~6자리)

### 클립보드

- Control-c, Control-Insert: 계산 결과 또는 선택한 내용을 클립보드로 복사
- Control-v, Shift-Insert: 클립보드로부터 앱에 붙혀넣기

# 기술과 정보

## 사용된 기술, 프래임워크, 프로그램

- typescript
- nodeJS
- electron
- vue 3
- quasar 2
- q-markdown
- tinykeys
- MathJS

## 패키지 설치 방법

- 릴리즈 페이지에서 해당 플랫폼에 맞는 파일을 받아서 설치하면 됩니다.
- 리눅스는 appimage파일을 단독으로 쓰거나 snap파일을 --dangerous 옵션을 사용하여 설치하세요.
- 맥OS는 사용하지 않고 테스트할 방법이 없어서 패키지가 없습니다.

## 앱 테스트 및 빌드 방법

기본적으로 nodeJS, vscode 환경에서 yarn을 아래와 같이 설치해줍니다.

```bash
npm install -g yarn
```

### 필요한 모듈 설치

```bash
yarn install
```

### 개발 모드로 실행하기 (실시간 리로딩, 에러 체크 등)

```bash
quasar dev -m electron
```

### 설치 패키지 빌드 [윈도우]

```bash
quasar build -m electron [-T win32]
```
