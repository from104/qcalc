import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUnitStore } from '../unitStore';
import { useCurrencyStore } from '../currencyStore';
import { useRadixStore } from '../radixStore';
import { UnitConverter } from '../../core/converters/UnitConverter';

describe('validateAndCorrect* (App.vue 의 "설정이 초기화되었습니다" 토스트 판정)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('새로 설치한 빈 상태는 보정한 것이 없다 — 첫 실행에 토스트를 띄우지 않는다', () => {
    const unit = useUnitStore();
    expect(unit.validateAndCorrectUnits()).toBe(false);
    expect(useCurrencyStore().validateAndCorrectCurrencies()).toBe(false);
    expect(useRadixStore().validateAndCorrectRadixSettings()).toBe(false);
    // 기본 카테고리는 그래도 채운다
    expect(unit.selectedCategory).toBe(UnitConverter.getCategories()[0]);
  });

  it('저장된 카테고리가 더는 없으면 보정한 것으로 센다', () => {
    const unit = useUnitStore();
    unit.selectedCategory = 'no-such-category';
    expect(unit.validateAndCorrectUnits()).toBe(true);
    expect(unit.selectedCategory).toBe(UnitConverter.getCategories()[0]);
  });
});
