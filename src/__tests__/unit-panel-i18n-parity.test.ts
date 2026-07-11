/**
 * @file unit-panel-i18n-parity.test.ts
 * @description UnitPanel의 unitDesc 번역 키가 UnitBaseData의 런타임 카테고리 id ×
 *              단위 키와 10개 지원 언어 전부에서 일치하는지 검증합니다.
 *              UnitPanel.vue는 t(`unitDesc.${selectedCategory}.${unit}`)로 조회하므로,
 *              카테고리/단위 이름이 UnitPanel.yml의 unitDesc 네임스페이스와 정확히
 *              일치하지 않으면(예: 'storage' vs 'data') fallback('en')에도 걸리지 않고
 *              원시 키가 그대로 노출된다.
 */

import { describe, it, expect } from 'vitest';
import { unitBaseData } from 'constants/UnitBaseData';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import unitPanelYaml from '../i18n/components/UnitPanel.yml';

// env.d.ts는 '*.yml'을 string으로 선언하지만, 실제 런타임 값(및 이 테스트가 필요로 하는
// 값)은 @modyfi/vite-plugin-yaml이 파싱한 로케일별 메시지 객체입니다.
type UnitDescMessages = Record<string, Record<string, string>>;
interface LocaleMessages {
  unitDesc?: UnitDescMessages;
}
const unitPanelMessages = unitPanelYaml as unknown as Record<string, LocaleMessages>;

describe('UnitPanel unitDesc i18n 키 패리티', () => {
  const categories = Object.keys(unitBaseData);

  it('UnitBaseData에 정의된 모든 카테고리가 존재한다', () => {
    expect(categories.length).toBeGreaterThan(0);
  });

  for (const langEntry of SUPPORTED_LANGUAGES) {
    const lang = langEntry.code;

    it(`${lang}: 모든 카테고리 × 단위에 대한 unitDesc 번역이 존재한다`, () => {
      const localeUnitDesc = unitPanelMessages[lang]?.unitDesc;
      expect(localeUnitDesc, `unitDesc.${lang} 로케일 자체가 없습니다`).toBeDefined();

      const missing: string[] = [];
      for (const category of categories) {
        const categoryDesc = localeUnitDesc?.[category];
        if (!categoryDesc) {
          missing.push(`unitDesc.${category} (카테고리 전체 누락)`);
          continue;
        }
        for (const unitKey of Object.keys(unitBaseData[category] ?? {})) {
          const translated = categoryDesc[unitKey];
          if (typeof translated !== 'string' || translated.trim() === '') {
            missing.push(`unitDesc.${category}.${unitKey}`);
          }
        }
      }

      expect(missing, `${lang}에 누락된 unitDesc 키:\n${missing.join('\n')}`).toEqual([]);
    });
  }
});
