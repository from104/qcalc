# 앱 정보

이 앱은 vue+quasar+electron를 사용하여 만들어졌습니다.

연락처: 서기현 <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. MIT License.

## Changelog

이 프로젝트에 대한 모든 주목할만한 변경 사항은 이 파일에 기록됩니다.

형식은 [Keep a Changelog (korean)]를 기반으로 하며 이 프로젝트는 [Semantic Versioning (korean)]을 따릅니다.

## [0.12.0] 2026-03-14

### 추가됨

- **수식 계산기 (5번째 계산기)**: 수학 수식을 직접 입력하고 계산 — 사칙연산, 괄호, 함수(`sin`, `cos`, `sqrt`, `log`, `ln`, `abs`, `round`, `nthRoot` 등), 상수(`pi`, `e`, `phi`)를 [mathjs](https://mathjs.org/) 구문으로 지원.
  - Space 키로 인라인 수식 편집기를 열어 수식을 직접 편집 가능.
  - `@`로 현재 값을, `$`로 저장된 메모리 값을 참조 가능.
  - 시프트 기능 버튼으로 메모리 기능(MC, MR, MS, M+, M−, M×, M÷) 모두 지원.
  - 계산 결과가 전체 수식과 함께 계산 기록에 저장됨.
  - 내장 도움말 메뉴에서 사용 가능한 함수, 상수, 플레이스홀더 목록 제공.
- **5개 신규 언어 (총 8개)**: 중국어(간체), 힌디어, 독일어, 스페인어, 프랑스어가 기존 한국어, 영어, 일본어에 추가. 메뉴, 설정, 단위명, 통화명, 도움말, 소개, 팁, 오류 메시지 등 모든 화면 번역 지원.
- **Flatpak 패키징**: Flatpak으로 QCalc을 설치하여 더 넓은 Linux 데스크톱 지원.

### 변경됨

- **부드러운 언어 전환**: 번역이 누락된 경우 원시 키 경로 대신 영어로 자동 대체.

이전 버전의 정보는 [이곳](https://github.com/from104/qcalc/blob/main/CHANGELOG-ko.md)에서 확인하세요.
