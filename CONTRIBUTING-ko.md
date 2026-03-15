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

## 버그 신고 및 기능 요청

[GitHub Issues](https://github.com/from104/qcalc/issues)를 이용해 주세요.

## 연락처

서기현 <from104@gmail.com>
