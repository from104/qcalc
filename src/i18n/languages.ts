/**
 * @file languages.ts
 * @description 지원 언어 목록을 중앙 관리합니다.
 *              새 언어 추가 시 이 파일에만 항목을 추가하면 됩니다.
 *
 * 새 언어 추가 체크리스트:
 *  1. 이 파일에 { code: 'xx' } 추가
 *  2. src/i18n/messages/xxMessages.yml 생성
 *  3. src/i18n/errors/xxErrors.yml 생성
 *  4. src/i18n/messages.ts 에 import 및 export 추가
 *  5. src/i18n/components/Layout.yml 에 xx: 섹션 추가
 *  6. src/i18n/components/UnitPanel.yml 에 xx: 섹션 추가
 *  7. src/i18n/components/CurrencyPanel.yml 에 xx: 섹션 추가 (tooltipSwap, ariaLabel만)
 *  8. 각 Vue 컴포넌트의 인라인 <i18n> 에 xx: 섹션 추가
 */

export interface LanguageEntry {
  code: string;
}

export const SUPPORTED_LANGUAGES: LanguageEntry[] = [{ code: 'ko' }, { code: 'en' }, { code: 'ja' }];

export type SupportedLocale = string;
