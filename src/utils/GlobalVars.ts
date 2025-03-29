/**
 * @file globalVars.ts
 * @description 전역 변수를 관리하는 유틸리티 파일
 */

import { useCalculatorStore } from './../stores/calculatorStore';
import { useSettingsStore } from './../stores/settingsStore';
import { useUIStore } from './../stores/uiStore';
import { useUnitConverterStore } from '../stores/unitStore';
import { useCurrencyConverterStore } from './../stores/currencyConverterStore';
import { useRadixConverterStore } from '../stores/radixStore';

// 전역 변수 export
export const $g = globalThis.window.globalVars;

// 모든 스토어를 하나의 객체로 통합하여 export
export const $s = {
  ...(useCalculatorStore() ?? {}),
  ...(useSettingsStore() ?? {}),
  ...(useUnitConverterStore() ?? {}),
  ...(useCurrencyConverterStore() ?? {}),
  ...(useRadixConverterStore() ?? {}),
  ...(useUIStore() ?? {}),
};

// 개별 스토어 export - 필요한 경우 직접 접근
export const $calcStore = $g.calculatorStore;
export const $setStore = $g.settingsStore;
export const $unitStore = $g.unitConverterStore;
export const $currStore = $g.currencyConverterStore;
export const $radixStore = $g.radixConverterStore;
export const $uiStore = $g.uiStore;
