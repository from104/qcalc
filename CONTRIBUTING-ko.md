# QCalc에 기여하기

QCalc에 관심을 가져주셔서 감사합니다!

## 번역 가이드

한국어, 영어, 일본어를 제외한 번역은 AI로 생성되었습니다. 수정 및 개선을 환영합니다.

### 번역 파일 위치

| 위치                                    | 설명                                 |
| --------------------------------------- | ------------------------------------ |
| `src/i18n/messages/{lang}Messages.yml`  | 글로벌 공통 메시지                   |
| `src/i18n/errors/{lang}Errors.yml`      | 에러 메시지                          |
| `src/i18n/components/*.yml`             | 외부 컴포넌트 메시지 (파일당 다국어) |
| `src/content/pages/AboutPage-{lang}.md` | 소개 페이지 콘텐츠                   |
| `src/content/tips/{lang}/*.md`          | 팁 문서                              |
| `*.vue` 파일의 `<i18n>` 블록            | 컴포넌트 로컬 메시지 (블록당 다국어) |

> `{lang}` = 언어 코드: `ko`, `en`, `ja`, `zh`, `hi`, `de`, `es`, `fr`

### 기존 번역 수정

1. 수정할 텍스트를 찾습니다:

   ```bash
   grep -r "잘못된 텍스트" src/ --include="*.yml" --include="*.vue" --include="*.md"
   ```

2. 파일을 수정하고 PR을 제출합니다.

### 새 언어 추가

개발 환경 설정은 [DEVELOP-ko.md](DEVELOP-ko.md)를 참조하세요.

1. `src/i18n/languages.ts`에 언어 추가
2. `src/i18n/messages/{lang}Messages.yml` 생성 (`enMessages.yml` 복사)
3. `src/i18n/errors/{lang}Errors.yml` 생성 (`enErrors.yml` 복사)
4. `.vue` 파일의 각 `<i18n>` 블록에 언어 섹션 추가
5. `src/i18n/components/` 내 각 `.yml` 파일에 언어 섹션 추가
6. `src/content/pages/AboutPage-{lang}.md` 생성
7. `src/content/tips/{lang}/` 디렉토리 생성 및 팁 파일 작성

## 접근성

QCalc은 모든 사용자가 접근할 수 있도록 노력하고 있습니다. 기여 시 다음 사항을 지켜주세요:

- 모든 상호작용 요소(버튼, 토글, 셀렉트)에 `aria-label` 추가
- 동적으로 변경되는 콘텐츠(계산 결과, 기록 목록)에 `aria-live="polite"` 사용
- 모든 다이얼로그에 `role="dialog"` + `aria-label` 추가
- 확인 다이얼로그에는 `role="alertdialog"` 사용
- 키보드 내비게이션 유지 — 기존 단축키 바인딩을 깨뜨리지 않기
- `prefers-reduced-motion` 존중 — 미디어 쿼리 가드 없이 애니메이션 추가하지 않기

## 버그 신고 및 기능 요청

[GitHub Issues](https://github.com/from104/qcalc/issues)를 이용해 주세요.

## 연락처

서기현 <from104@gmail.com>
