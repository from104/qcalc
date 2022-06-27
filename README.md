# com.electron.qcalc (qcalc)

## 퀘이사를 이용해 만든 간단한 계산기

예전에 졸업과제로 만들었던 안드로이드용
계산기의 소스를 활용해 만든 간단한 계산기 입니다.
사칙연산과 퍼센트 계산을 할 수 있습니다.
사칙연산 버튼(키)를 연속해서 누르면
마지막 숫자로 반복 계산 합니다.
마우스와 키보드로 모든 입력을 할 수 있습니다.
복사와 붙혀넣기도 가능합니다.

## 주요 키

[0-9\.]: 숫자와 점
+, -, *, /: 각각 더하기, 빼기, 곱하기, 나누기
Enter, =: 마지막 계산 결과 출력
s, _: 부호 바꾸기
p, %: 퍼센트 계산 (숫자, /, 숫자, p(또는 %) 순으로 입력)
Backspace: 한글자씩 지우기
Escape, Delete, c: 계산기 리셋

Control-c, Control-Insert: 결과를 클립보드로 복사
Control-v, Shift-Insert: 클립보드로부터 앱에 붙혀넣기

## 필요한 node.js 모듈 설치

기본적으로 필요한 모듈 설치법은 다음과 같습니다.

```bash
yarn
# or
npm install
```

### 개발 모드로 실행하기 (실시간 리로딩, 에러 체크 등)

```bash
quasar dev -m electron
```

### 배포 패키지 빌드 (윈도우용)

```bash
quasar build -m electron [-T win32]
```
