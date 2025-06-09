/**
 * @file settingsStore.ts
 * @description 설정 관련 상태와 액션을 관리하는 스토어입니다.
 */

import { defineStore } from 'pinia';

import type { DecimalPlacesType, GroupingUnitType } from '../types/store';
import { DECIMAL_PLACES } from '../types/store.d';

interface SettingsState {
  alwaysOnTop: boolean;
  initPanel: boolean;
  showButtonAddedLabel: boolean;
  hapticsMode: boolean;
  useGrouping: boolean;
  groupingUnit: GroupingUnitType;
  decimalPlaces: DecimalPlacesType;
  useSystemLocale: boolean;
  locale: string;
  userLocale: string;
  autoUpdate: boolean;
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    alwaysOnTop: false,
    initPanel: false,
    showButtonAddedLabel: true,
    hapticsMode: true,
    useGrouping: true,
    groupingUnit: 3,
    decimalPlaces: -1,
    useSystemLocale: true,
    locale: '',
    userLocale: '',
    autoUpdate: true,
  }),

  getters: {
    getDecimalPlaces: (state: SettingsState) => DECIMAL_PLACES[state.decimalPlaces ?? -1] ?? -1,
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

    toggleUseGrouping(): void {
      this.useGrouping = !this.useGrouping;
    },

    setGroupingUnit(digitCount: GroupingUnitType): void {
      this.groupingUnit = digitCount;
    },

    setDecimalPlaces(places: DecimalPlacesType): void {
      this.decimalPlaces = places;
    },

    incrementDecimalPlaces(): void {
      this.decimalPlaces = Math.min(this.decimalPlaces + 1, Math.max(...Object.keys(DECIMAL_PLACES).map(Number)));
    },

    decrementDecimalPlaces(): void {
      this.decimalPlaces = Math.max(this.decimalPlaces - 1, Math.min(...Object.keys(DECIMAL_PLACES).map(Number)));
    },

    setAutoUpdate(value: boolean): void {
      this.autoUpdate = value;
    },

    toggleAutoUpdate(): void {
      this.setAutoUpdate(!this.autoUpdate);
    },
  },

  persist: true,
});
