# 앱 정보

이 앱은 vue+quasar+tauri를 사용하여 만들어졌습니다.

연락처: 서기현 <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. MIT License.

## Changelog

이 프로젝트에 대한 모든 주목할만한 변경 사항은 이 파일에 기록됩니다.

형식은 [Keep a Changelog (korean)]를 기반으로 하며 이 프로젝트는 [Semantic Versioning (korean)]을 따릅니다.

## [0.13.2] 2026-09-08

### 변경됨

- 좁은 화면에서도 계산기 5개를 모두 탭으로 표시(`▾` 메뉴 제거)

### 수정됨

- Android 15에서 상태 바·내비게이션 바가 키패드와 [기록] 화면을 가리던 문제 수정
- 모니터 정보를 읽지 못할 때 최소 창 크기가 달라지던 문제 수정 (데스크톱)
- Windows에서 창이 엉뚱한 위치에 잠깐 떴다가 저장된 위치로 이동하던 문제 수정

## [0.13.1] 2026-08-18

### 변경됨

- 패키지 이름을 QCalc으로 통일 (Windows는 앱 목록의 이전 "Q Calc" 항목을 먼저 제거)

### 추가됨

- 릴리스마다 Android APK 제공

### 수정됨

- Snap 패키지 실행 문제 수정 ([#117](https://github.com/from104/qcalc/issues/117))
- 0.12.x에서 새 버전 알림이 다시 도착 (Windows, AppImage)
- Windows 설치 프로그램 Electron 잔여 파일 정리
- AppImage가 Wayland에서 실행 즉시 종료되지 않음 (Linux)
- 결과가 잘리지 않았는데도 결과 필드가 강조색으로 바뀌던 문제 수정
- 화면 확대 비율을 창 크기에 반영 (Linux)
- 키패드 레이블 버튼 넘침 방지
- Flatpak 오디오 권한 요구 제거

### 알려진 문제

- Flatpak 빌드에서는 스크린리더가 화면을 인식하지 못함(업스트림 샌드박스 한계). `.deb`, `.rpm`, AppImage 사용 ([#113](https://github.com/from104/qcalc/issues/113))
- Linux에서 클립보드 읽기가 실패할 수 있음

## [0.13.0] 2026-08-09

### 변경됨

- 데스크톱 프로덕션을 Electron에서 Tauri 2로 전환
- Tauri 자동 업데이트 활성화
- 기록 마이그레이션과 온보딩 추가
- 네이티브 Wayland 기본값 ([tauri#13749](https://github.com/tauri-apps/tauri/issues/13749) / [tauri#3117](https://github.com/tauri-apps/tauri/issues/3117))
- 기본 창 크기 확대 (352×604 → 480×756)

### 추가됨

- 2개 신규 언어 (포르투갈어, 러시아어) 총 10개
- Linux 스크린리더 결과 낭독
- 수식 오류 낭독
- 기록 삭제 실행취소
- 키보드 접근성 (탭, 수식 필드, 메모리 토글)
- WCAG AA 대비 테마 색상

### 수정됨

- 스크린리더 지원 개선
- 언어별 숫자 표기 지원
- 수식 계산기 도 단위, 오류 분류기, 플레이스홀더 치환
- 기록을 복원하면 최대 보관 개수를 넘던 문제 수정
- 데스크톱 앱이 시작 직후 멈추던 문제 수정
- Tauri/Linux 창 크기, 글자 표시, 아이콘, Flatpak, Snap 개선
- 포르투갈어·러시아어 도움말이 열리지 않던 문제 수정
- 한국어 라벨 오타 수정

### 알려진 문제

- Snap 패키지가 실행되지 않음 ([#117](https://github.com/from104/qcalc/issues/117))
- Flatpak 빌드의 스크린리더 제한 (업스트림 샌드박스 한계). `.deb`, `.rpm`, AppImage 사용 ([#113](https://github.com/from104/qcalc/issues/113))
- Linux 스크린리더 검증 미완료 (음성, hover, 클립보드, CSP)

이전 버전의 정보는 [이곳](https://github.com/from104/qcalc/blob/main/CHANGELOG-ko.md)에서 확인하세요.
