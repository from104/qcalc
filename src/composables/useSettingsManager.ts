/**
 * @file useSettingsManager.ts
 * @description 여러 Pinia 스토어에 분산된 설정을 중앙에서 관리하는 Composable입니다.
 *              설정의 취합, 적용, 초기화 로직을 담당합니다.
 */

import { useSettingsStore } from 'src/stores/settingsStore';
import { useThemesStore } from 'src/stores/themesStore';
import { useCalcStore } from 'src/stores/calcStore';
import { useCurrencyStore } from 'src/stores/currencyStore';
import { useRadixStore } from 'src/stores/radixStore';
import { useUnitStore } from 'src/stores/unitStore';
import { useUIStore } from 'src/stores/uiStore';

// 설정에 포함할 스토어 목록
const stores = {
  settings: useSettingsStore,
  themes: useThemesStore,
  calc: useCalcStore,
  currency: useCurrencyStore,
  radix: useRadixStore,
  unit: useUnitStore,
  ui: useUIStore,
};

type StoreKeys = keyof typeof stores;

export function useSettingsManager() {
  /**
   * 모든 관련 스토어의 상태를 하나의 객체로 취합합니다.
   * @returns {Record<string, unknown>} 모든 설정 데이터가 포함된 객체
   */
  const gatherSettings = (): Record<StoreKeys, unknown> => {
    const allSettings = {} as Record<StoreKeys, unknown>;
    for (const key in stores) {
      const storeKey = key as StoreKeys;
      const store = stores[storeKey]();
      allSettings[storeKey] = store.$state;
    }
    return allSettings;
  };

  /**
   * 제공된 설정 객체를 각 스토어에 적용합니다.
   * @param {Record<string, unknown>} newSettings - 적용할 설정 데이터 객체
   * @returns {boolean} 적용 성공 여부
   */
  const applySettings = (newSettings: Record<string, unknown>): boolean => {
    try {
      for (const key in newSettings) {
        const storeKey = key as StoreKeys;
        if (stores[storeKey]) {
          const store = stores[storeKey]();
          const settingsForStore = newSettings[key];

          // 타입 가드: 객체인지 확인
          if (settingsForStore && typeof settingsForStore === 'object' && !Array.isArray(settingsForStore)) {
            // 단순 상태 덮어쓰기. 더 정교한 마이그레이션 로직이 필요할 수 있음.
            (store.$patch as (partialState: Record<string, unknown>) => void)(
              settingsForStore as Record<string, unknown>,
            );
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to apply settings:', error);
      return false;
    }
  };

  /**
   * 모든 관련 스토어의 상태를 초기값으로 리셋합니다.
   */
  const resetSettings = () => {
    for (const key in stores) {
      const storeKey = key as StoreKeys;
      const store = stores[storeKey]();
      store.$reset();
    }
  };

  return {
    gatherSettings,
    applySettings,
    resetSettings,
  };
}
