# QCalc - 현대적 생산성을 위한 다목적 계산기

QCalc은 단순한 계산기를 넘어, 현대적인 생산성 도구로 진화시키려 합니다. Vue3(Quasar v2), TypeScript, Electron 등 최신 웹 기술을 활용하여 제작된 이 다목적 계산기는, 실제 업무, 작업, 학습 등의 상황에서 유용하게 활용할 수 있는 앱으로 발전시키고 있습니다. 또한 장애를 가진 사용자도 직관적으로 활용할 수 있도록 접근성에 집중하고 있으며, 심플하면서도 세련된 UI로 데스크톱과 모바일 환경 모두에서 유용한 사용자 경험을 제공할 수 있도록 고민하고 있습니다. 😊

## 스크린샷

창의 폭을 줄이면 계산기만 나타납니다.

![Screenshot](https://github.com/from104/qcalc/raw/main/assets/screenshot_v0.11.3-ko.png)

## 주요 기능

### **4가지 전문 계산기를 하나로**

- 고급 수학 함수를 갖춘 표준 계산기
- 15개 이상의 카테고리를 지원하는 종합 단위 변환기
- 실시간 환율을 반영하는 통화 변환기
- 이진 연산이 가능한 프로그래머용 계산기

### **생산성 향상 기능**

- 검색과 주석이 가능한 계산 기록
- 사용자 지정 숫자 서식(3자리 또는 4자리 구분)
- 빠른 데이터 입력을 위한 다양한 키보드 단축키
- 빠른 복사 및 붙혀넣기 (패널 클릭 또는 길게 누르기)

### **전문가용 도구:**

- 고급 수학 연산(삼각함수, 로그)
- 메모리 연산(MS, MR, M+, M-, M×, M÷)
- 비트 연산(AND, OR, XOR, NOT, 시프트)
- 포괄적인 단위 변환 시스템

### **현대적인 사용자 경험**

- 큰 화면에서 사이드 패널을 활용하는 적응형 레이아웃
- 눈의 피로를 줄이는 다크 모드 지원
- 제스처를 지원하는 깔끔하고 직관적인 인터페이스
- 정확한 입력을 위한 햅틱 피드백

## 전문가를 위한 최적의 도구

- **엔지니어:** 고정밀 복잡 계산
- **개발자:** 2진수, 8진수, 16진수 변환
- **재무 분석가:** 통화 변환 및 백분율 계산
- **과학자:** 고급 수학 함수와 단위 변환
- **학생:** 학습을 위한 포괄적인 계산 기록

## 기술적 특징

Vue 3, Quasar, Electron으로 제작된 QCalc은 현대적 웹 기술의 안정성과 함께 네이티브 수준의 성능을 제공합니다. 효율적인 작업을 위한 광범위한 키보드 단축키를 지원하며, 멀티태스킹을 위한 항상 위 모드와 같은 기능을 포함합니다.

## 바로가기 키 (S: Shift, C: Control, A: Alt)

### 기본 계산기 및 공통 기능

| 단축키      | 기능               |
| ----------- | ------------------ |
| 0-9\.       | 숫자와 소수점 입력 |
| +, -, \*, / | 기본 사칙연산      |
| Enter, =    | 계산 결과 출력     |
| Backspace   | 한 글자 지우기     |
| Delete      | 계산기 초기화      |
| u           | 제곱 (x²)          |
| i           | 제곱근 (√x)        |
| j           | 부호 변경 (±)      |
| k           | 퍼센트 계산 (%)    |
| l           | 역수 계산 (1/x)    |
| '           | 시프트 모드 활성화 |

### 고급 수학 기능 (시프트 모드)

| 단축키 | 기능                     |
| ------ | ------------------------ |
| r      | N제곱 (xⁿ)               |
| t      | N제곱근 (ⁿ√x)            |
| f      | 10의 N제곱 (10ⁿ)         |
| g      | 나머지 계산 (x%y)        |
| h      | 팩토리얼 (x!)            |
| q,w,e  | 삼각함수 (sin, cos, tan) |
| a,s,d  | 상수 (Pi/2, ln10, ln2)   |
| z,x,c  | 상수 (Pi, phi, e)        |
| v      | 정수 부분 추출           |
| b      | 소수 부분 추출           |

### 메모리 조작

| 단축키            | 기능               |
| ----------------- | ------------------ |
| C-Delete          | 메모리 초기화 (MC) |
| C-Backspace       | 메모리 호출 (MR)   |
| C-Enter, C-=      | 메모리 저장 (MS)   |
| C-+, C-Numpad +   | 메모리 더하기 (M+) |
| C--, C-Numpad -   | 메모리 빼기 (M-)   |
| C-\*, C-Numpad \* | 메모리 곱하기 (M×) |
| C-/, C-Numpad /   | 메모리 나누기 (M÷) |

### 단위/통화 변환 모드 (시프트 모드)

| 단축키 | 기능                      |
| ------ | ------------------------- |
| f,g,h  | ×2/×3/×5 또는 +5/+10/+100 |
| q,w,e  | ÷2/÷3/÷5 또는 -5/-10/-100 |
| a,s,d  | ×10/×100/×1000            |
| z,x,c  | ÷10/÷100/÷1000            |

### 진법 변환기 모드

| 단축키 | 기능                            |
| ------ | ------------------------------- |
| r,t    | 1비트 시프트 (x<<1, x>>1)       |
| u,i    | 왼쪽/오른쪽 시프트 (x<<y, x>>y) |
| f,g    | 4비트 시프트 (x<<4, x>>4)       |
| h      | NOT 연산                        |
| j,k,l  | 비트 연산 (AND, OR, XOR)        |
| q,w,e  | NAND, NOR, XNOR                 |
| z,x,c  | 16진수 입력 (A, B, C)           |
| a,s,d  | 16진수 입력 (D, E, F)           |

### 화면 이동 및 탐색

| 단축키    | 기능                        |
| --------- | --------------------------- |
| F1        | 도움말                      |
| F2        | 정보                        |
| F3        | 설정                        |
| F4        | 기록                        |
| F5        | 팁                          |
| C-[1234]  | 기본/단위/통화/진법 탭 전환 |
| C-Tab, →  | 오른쪽 탭으로 이동          |
| CS-Tab, ← | 왼쪽 탭으로 이동            |
| Escape    | 현재 화면 닫기              |

### UI 설정

| 단축키 | 기능                           |
| ------ | ------------------------------ |
| A-t    | 항상 위 토글                   |
| A-i    | 시작 시 패널 초기화 토글       |
| A-d    | 다크 모드 토글                 |
| A-p    | 햅틱 모드 토글                 |
| ;      | 버튼 추가 기능 표시 토글       |
| ,      | 숫자 묶음 표시 토글            |
| A-,    | 숫자 묶음 단위 변경 (3/4)      |
| [, ]   | 소수점 자릿수 조정 (무제한~16) |
| q      | 앱 종료                        |

### 클립보드 조작

| 단축키          | 기능                 |
| --------------- | -------------------- |
| C-c, C-Insert   | 메인 패널 결과 복사  |
| SC-c, AC-Insert | 보조 패널 결과 복사  |
| C-v, S-Insert   | 메인 패널에 붙여넣기 |
| SC-v, AS-Insert | 보조 패널에 붙여넣기 |

### 기록 탐색

| 단축키          | 기능                 |
| --------------- | -------------------- |
| ↑/↓             | 50px 위/아래 스크롤  |
| PageUp/PageDown | 400px 위/아래 스크롤 |
| Home/End        | 맨 위/아래로 스크롤  |
| C-f             | 기록 검색            |
| C-d             | 기록 삭제            |

## 설치 방법

- 릴리즈 페이지에서 해당 플랫폼에 맞는 파일을 받아서 설치하면 됩니다.
- 윈도우 설치 파일과 리눅스 AppImage 파일은 자동 업데이트가 지원됩니다.
- 리눅스는 AppImage 파일을 단독으로 쓰거나 `sudo snap install --beta qcalc` 명령어로 설치하세요.
- 안드로이드는 해당 apk를 받아 설치하세요. 곧 플레이스토어에 올라갑니다.
- 맥OS, IOS는 사용하지 않고 테스트할 방법이 없어서 패키지가 없습니다.

## 개발자를 위한 정보

개발 및 빌드 방법에 대한 자세한 내용은 [DEVELOP-ko.md](DEVELOP-ko.md)를 참조하세요.
