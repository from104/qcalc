/**
 * i18n — 10개 언어 전환. TODO: 아직 구현하지 않았다 (basic.ts / keyboard.ts 를 본보기로).
 *
 * 다룰 것
 * 1. LANGS(e2e/fixtures/seed.ts, src/i18n/languages.ts 와 같은 순서) 각각에 대해
 *    app.setLang(code) 또는 seed({ lang: code }) 로 띄운 뒤, 모든 탭(calc unit currency radix formula)과
 *    설정·기록·도움말 화면을 차례로 열어 본다.
 * 2. 날 키 / 빈 라벨 탐지 — 화면의 보이는 텍스트와 aria-label 을 모아
 *    - 번역 키처럼 생긴 문자열(/^[a-z]+(\.[a-zA-Z0-9_]+)+$/ 예: 'ariaLabel.mainTabs', 'tooltip.search')
 *    - 비어 있는 aria-label · 툴팁
 *    이 하나도 없어야 한다. 텍스트 수집은 드라이버마다 다르므로 CalcApp 에
 *    `visibleTexts(): Promise<string[]>` 같은 메서드를 더하고 PlaywrightApp 에 구현한다.
 *    (전례: 2026-07 settings·search·file_download·file_upload 동적 키 누락 4건)
 * 3. <html lang> 이 고른 언어와 같다(useHtmlLangSync).
 * 4. 숫자 표기: de·es·fr·pt·ru 처럼 소수점이 ',' 인 언어에서 1.5 + 1 = → 표시 '2,5' 이고,
 *    클립보드 붙여넣기 '1.234,5'(de) 가 1234.5 로 해석되는지(needs: keyboard·clipboard).
 */
import { defineGroup, todo } from './kit';

export default defineGroup('i18n', [
  todo('10개 언어에서 날 키·빈 라벨 없음', '언어 전환·번역 누락 탐지'),
  todo('언어별 소수점·자릿수 표기와 붙여넣기 해석', '로케일 숫자 표기', ['keyboard', 'clipboard']),
]);
