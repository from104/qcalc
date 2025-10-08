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
  const gatherSettings = (): Record<StoreKeys, unknown> => {
    const settingsToExport: { [K in StoreKeys]?: (state: Record<string, unknown>) => Record<string, unknown> } = {
      settings: (state) => ({ ...state }),
      themes: (state) => ({ ...state }),
      calc: (state) => ({ isMemoryVisible: state.isMemoryVisible, isShiftLocked: state.isShiftLocked }),
      currency: (state) => ({
        sourceCurrency: state.sourceCurrency,
        targetCurrency: state.targetCurrency,
        showSymbol: state.showSymbol,
        favoriteCurrencies: state.favoriteCurrencies,
      }),
      radix: (state) => ({ wordSize: state.wordSize, sourceRadix: state.sourceRadix, targetRadix: state.targetRadix, showRadix: state.showRadix, radixType: state.radixType }),
      unit: (state) => ({ ...state }),
      ui: (state) => ({ showTips: state.showTips, showTipsDialog: state.showTipsDialog, currentTab: state.currentTab }),
    };

    const allSettings = {} as Record<StoreKeys, unknown>;
    for (const key in stores) {
      const storeKey = key as StoreKeys;
      const store = stores[storeKey]();
      if (settingsToExport[storeKey]) {
        allSettings[storeKey] = settingsToExport[storeKey]!(store.$state);
      } else {
        allSettings[storeKey] = store.$state;
      }
    }
    return allSettings;
  };

  const applySettings = (newSettings: Record<string, unknown>): boolean => {
    try {
      for (const key in newSettings) {
        const storeKey = key as StoreKeys;
        if (stores[storeKey]) {
          const store = stores[storeKey]();
          const settingsForStore = newSettings[key];

          if (settingsForStore && typeof settingsForStore === 'object' && !Array.isArray(settingsForStore)) {
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
