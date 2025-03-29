/**
 * @file settingsStore.ts
 * @description 설정 관련 상태와 액션을 관리하는 스토어입니다.
 */

import { defineStore } from 'pinia';
import { Dark } from 'quasar';

import type { DecimalPlacesType, GroupingUnitType } from '../types/store';
import { DECIMAL_PLACES } from '../types/store.d';

type DarkModeType = 'light' | 'dark' | 'system';

interface SettingsState {
  darkMode: DarkModeType;
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
    darkMode: 'system',
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
    getDecimalPlaces: (state) => DECIMAL_PLACES[state.decimalPlaces ?? -1] ?? -1,
  },

  actions: {
    // 테마/디스플레이 설정
    setDarkMode(mode: DarkModeType): void {
      this.darkMode = mode;
      this.updateDarkMode();
    },

    // 다크모드 상태 업데이트
    updateDarkMode(): void {
      if (this.darkMode === 'system') {
        // 시스템 다크모드 상태 감지
        const isDark = this.isDarkMode();
        Dark.set(isDark);
      } else {
        Dark.set(this.darkMode === 'dark');
      }
    },

    toggleDarkMode(): void {
      const modes: DarkModeType[] = ['light', 'dark', 'system'];
      const currentIndex = modes.indexOf(this.darkMode);
      const nextMode = modes[(currentIndex + 1) % modes.length] as DarkModeType;
      this.setDarkMode(nextMode);
    },

    isDarkMode(): boolean {
      if (this.darkMode === 'system') {
        // 시스템 다크모드 상태 감지
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isDark;
      } else {
        return this.darkMode === 'dark';
      }
    },

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

    // 햅틱 피드백 설정
    setHapticsMode(isEnabled: boolean): void {
      this.hapticsMode = isEnabled;
    },

    toggleHapticsMode(): void {
      this.setHapticsMode(!this.hapticsMode);
    },

    // 숫자 표시 설정
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

    // 자동 업데이트 관련
    setAutoUpdate(value: boolean): void {
      this.autoUpdate = value;
    },

    toggleAutoUpdate(): void {
      this.setAutoUpdate(!this.autoUpdate);
    },
  },

  persist: true,
});
