/**
 * @file settingsStore.ts
 * @description 설정 관련 상태와 액션을 관리하는 스토어입니다.
 */

import { defineStore } from 'pinia';

import type { DecimalPlacesType, GroupingUnitType } from '../types/store';
import { DECIMAL_PLACES } from '../types/store.d';
import { useUIStore } from './uiStore';

/**
 * 계산기별 포맷 설정 인터페이스
 */
interface CalculatorFormatSettings {
  useGrouping: boolean;
  groupingUnit: GroupingUnitType;
  decimalPlaces: DecimalPlacesType;
}

/**
 * 계산기 타입
 */
type CalculatorType = 'calc' | 'unit' | 'currency' | 'radix';

interface SettingsState {
  alwaysOnTop: boolean;
  initPanel: boolean;
  showButtonAddedLabel: boolean;
  hapticsMode: boolean;
  // 기존 호환성을 위한 레거시 필드 (deprecated)
  useGrouping: boolean;
  groupingUnit: GroupingUnitType;
  decimalPlaces: DecimalPlacesType;
  // 새로운 계산기별 설정
  // true일 때 각 계산기별로 개별 설정 사용, false일 때 calc(기본) 계산기 설정을 공통으로 사용
  numberFormatPerCalculator: boolean;
  formatSettings: {
    calc: CalculatorFormatSettings;
    unit: CalculatorFormatSettings;
    currency: CalculatorFormatSettings;
    radix: CalculatorFormatSettings;
  };
  useSystemLocale: boolean;
  locale: string;
  userLocale: string;
  autoUpdate: boolean;
  recordFontSize: number;
}

/**
 * 기본 포맷 설정 생성 함수
 */
function createDefaultFormatSettings(): CalculatorFormatSettings {
  return {
    useGrouping: true,
    groupingUnit: 3,
    decimalPlaces: -1,
  };
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => {
    const defaultFormat = createDefaultFormatSettings();
    return {
      alwaysOnTop: false,
      initPanel: false,
      showButtonAddedLabel: true,
      hapticsMode: true,
      // 레거시 필드 (호환성 유지)
      useGrouping: defaultFormat.useGrouping,
      groupingUnit: defaultFormat.groupingUnit,
      decimalPlaces: defaultFormat.decimalPlaces,
      // 새로운 계산기별 설정
      // 기본값은 false: calc(기본) 계산기 설정을 모든 계산기에 공통으로 사용
      numberFormatPerCalculator: false,
      formatSettings: {
        calc: { ...defaultFormat },
        unit: { ...defaultFormat },
        currency: { ...defaultFormat },
        radix: { ...defaultFormat },
      },
      useSystemLocale: true,
      locale: '',
      userLocale: '',
      autoUpdate: true,
      recordFontSize: 1,
    };
  },

  getters: {
    getDecimalPlaces: (state: SettingsState) => {
      const uiStore = useUIStore();
      // numberFormatPerCalculator가 true이면 현재 탭의 설정 사용, false이면 calc(기본) 설정 사용
      const currentSettings = state.numberFormatPerCalculator
        ? state.formatSettings[uiStore.currentTab as CalculatorType]
        : state.formatSettings.calc;
      return DECIMAL_PLACES[currentSettings.decimalPlaces ?? -1] ?? -1;
    },

    /**
     * 현재 계산기에 대한 포맷 설정을 반환합니다.
     */
    getCurrentFormatSettings: (state: SettingsState) => {
      const uiStore = useUIStore();
      const currentTab = uiStore.currentTab as CalculatorType;
      // numberFormatPerCalculator가 true이면 현재 탭의 설정 사용, false이면 calc(기본) 설정 사용
      return state.numberFormatPerCalculator
        ? state.formatSettings[currentTab] || state.formatSettings.calc
        : state.formatSettings.calc;
    },

    /**
     * 현재 계산기의 useGrouping 설정을 반환합니다.
     */
    getCurrentUseGrouping: (state: SettingsState) => {
      const uiStore = useUIStore();
      const currentTab = uiStore.currentTab as CalculatorType;
      const currentSettings = state.numberFormatPerCalculator
        ? state.formatSettings[currentTab] || state.formatSettings.calc
        : state.formatSettings.calc;
      return currentSettings.useGrouping;
    },

    /**
     * 현재 계산기의 groupingUnit 설정을 반환합니다.
     */
    getCurrentGroupingUnit: (state: SettingsState) => {
      const uiStore = useUIStore();
      const currentTab = uiStore.currentTab as CalculatorType;
      const currentSettings = state.numberFormatPerCalculator
        ? state.formatSettings[currentTab] || state.formatSettings.calc
        : state.formatSettings.calc;
      return currentSettings.groupingUnit;
    },

    /**
     * 현재 계산기의 decimalPlaces 설정을 반환합니다.
     */
    getCurrentDecimalPlaces: (state: SettingsState) => {
      const uiStore = useUIStore();
      const currentTab = uiStore.currentTab as CalculatorType;
      const currentSettings = state.numberFormatPerCalculator
        ? state.formatSettings[currentTab] || state.formatSettings.calc
        : state.formatSettings.calc;
      return currentSettings.decimalPlaces;
    },
  },

  actions: {
    setAlwaysOnTop(isAlwaysOnTop: boolean): void {
      this.alwaysOnTop = isAlwaysOnTop;
      window.electron.setAlwaysOnTop(this.alwaysOnTop);
    },

    toggleAlwaysOnTop(): void {
      this.setAlwaysOnTop(!this.alwaysOnTop);
    },

    setInitPanel(isInitPanel: boolean): void {
      this.initPanel = isInitPanel;
    },

    toggleInitPanel(): void {
      this.setInitPanel(!this.initPanel);
    },

    toggleButtonAddedLabel(): void {
      this.showButtonAddedLabel = !this.showButtonAddedLabel;
    },

    setHapticsMode(isEnabled: boolean): void {
      this.hapticsMode = isEnabled;
    },

    toggleHapticsMode(): void {
      this.setHapticsMode(!this.hapticsMode);
    },

    /**
     * 현재 계산기의 설정을 가져옵니다.
     */
    getCurrentSettings(): CalculatorFormatSettings {
      const uiStore = useUIStore();
      const currentTab = uiStore.currentTab as CalculatorType;
      // numberFormatPerCalculator가 true이면 현재 탭의 설정 사용, false이면 calc(기본) 설정 사용
      return this.numberFormatPerCalculator
        ? this.formatSettings[currentTab] || this.formatSettings.calc
        : this.formatSettings.calc;
    },

    /**
     * 현재 계산기의 설정을 업데이트합니다.
     */
    updateCurrentSettings(updates: Partial<CalculatorFormatSettings>): void {
      const uiStore = useUIStore();
      const currentTab = uiStore.currentTab as CalculatorType;

      if (this.numberFormatPerCalculator) {
        // 개별 적용 모드: 현재 탭의 설정만 업데이트
        Object.assign(this.formatSettings[currentTab], updates);
        // calc 탭의 설정을 레거시 필드에 동기화 (호환성 유지)
        if (currentTab === 'calc') {
          if (updates.useGrouping !== undefined) this.useGrouping = updates.useGrouping;
          if (updates.groupingUnit !== undefined) this.groupingUnit = updates.groupingUnit;
          if (updates.decimalPlaces !== undefined) this.decimalPlaces = updates.decimalPlaces;
        }
      } else {
        // 공통 적용 모드: calc(기본) 계산기 설정만 업데이트
        // 다른 계산기 설정은 동기화하지 않음 (getter에서 calc 설정을 반환하므로)
        Object.assign(this.formatSettings.calc, updates);
        // 레거시 필드도 업데이트 (호환성 유지)
        if (updates.useGrouping !== undefined) this.useGrouping = updates.useGrouping;
        if (updates.groupingUnit !== undefined) this.groupingUnit = updates.groupingUnit;
        if (updates.decimalPlaces !== undefined) this.decimalPlaces = updates.decimalPlaces;
      }
    },

    /**
     * 숫자 형식 계산기별 적용 여부를 토글합니다.
     */
    toggleNumberFormatPerCalculator(): void {
      this.numberFormatPerCalculator = !this.numberFormatPerCalculator;
    },

    /**
     * 숫자 형식 계산기별 적용 여부를 설정합니다.
     */
    setNumberFormatPerCalculator(value: boolean): void {
      this.numberFormatPerCalculator = value;
    },

    toggleUseGrouping(): void {
      const current = this.getCurrentSettings();
      this.updateCurrentSettings({ useGrouping: !current.useGrouping });
    },

    setGroupingUnit(digitCount: GroupingUnitType): void {
      this.updateCurrentSettings({ groupingUnit: digitCount });
    },

    /**
     * 현재 계산기의 groupingUnit을 토글합니다 (3 <-> 4)
     */
    toggleGroupingUnit(): void {
      const current = this.getCurrentSettings();
      const newValue = current.groupingUnit === 3 ? 4 : 3;
      this.updateCurrentSettings({ groupingUnit: newValue });
    },

    setDecimalPlaces(places: DecimalPlacesType): void {
      this.updateCurrentSettings({ decimalPlaces: places });
    },

    incrementDecimalPlaces(): void {
      const current = this.getCurrentSettings();
      const maxDecimalPlaces = Math.max(...Object.keys(DECIMAL_PLACES).map(Number));
      const newValue = Math.min(Number(current.decimalPlaces) + 1, maxDecimalPlaces) as DecimalPlacesType;
      this.updateCurrentSettings({ decimalPlaces: newValue });
    },

    decrementDecimalPlaces(): void {
      const current = this.getCurrentSettings();
      const minDecimalPlaces = Math.min(...Object.keys(DECIMAL_PLACES).map(Number));
      const newValue = Math.max(Number(current.decimalPlaces) - 1, minDecimalPlaces) as DecimalPlacesType;
      this.updateCurrentSettings({ decimalPlaces: newValue });
    },

    setAutoUpdate(value: boolean): void {
      this.autoUpdate = value;
    },

    toggleAutoUpdate(): void {
      this.setAutoUpdate(!this.autoUpdate);
    },

    incrementRecordFontSize(): void {
      this.recordFontSize = Math.min(this.recordFontSize + 1, 2);
    },

    decrementRecordFontSize(): void {
      this.recordFontSize = Math.max(this.recordFontSize - 1, 0);
    },
  },

  persist: true,
});
