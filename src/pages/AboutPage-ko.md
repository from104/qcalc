# 앱 정보

이 앱은 vue+quasar+electron를 사용하여 만들어졌습니다.

연락처: 서기현 <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. MIT License.

## Changelog

이 프로젝트에 대한 모든 주목할만한 변경 사항은 이 파일에 기록됩니다.

형식은 [Keep a Changelog (korean)]를 기반으로 하며 이 프로젝트는 [Semantic Versioning (korean)]을 따릅니다.

## [0.11.2] 2025-02-05

### 추가됨

- 온도 단위 열씨 (°De), 뉴튼 (°N), 로머 (°Rø), 레오미르 (°Ré) 추가
- 적응형 레이아웃 지원: 창 폭이 늘어날 경우 계산 기록 및 서브 패널 표시
- 계산 기록에서 검색 추가
- electron 패키지 형식의 자동 업데이트 추가

### 변경됨

- 통화변환 정밀도를 Number에서 BigNumber로 높임.
- 소수점 표시 제한 최대 16자리까지 확대 및 반올림 적용

### 고쳐짐

- 퍼센트 기능 표시 오류 수정
- 계산 기록에서 서브패널에 불러올 때 비정상 동작 수정

이전 버전의 정보는 [이곳](https://github.com/from104/qcalc/blob/main/CHANGELOG-ko.md)에서 확인하세요.
