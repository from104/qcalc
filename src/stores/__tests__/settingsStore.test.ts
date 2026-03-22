import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// i18n 의존성 mock
vi.mock('src/i18n/initLocale', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

// window mock (vitest node 환경에서는 window가 없으므로 globalThis에 설정)
const mockSetAlwaysOnTop = vi.fn();
vi.stubGlobal('window', {
  electron: {
    setAlwaysOnTop: mockSetAlwaysOnTop,
  },
});

import { useSettingsStore } from '../settingsStore';
import { useUIStore } from '../uiStore';

describe('settingsStore', () => {
  let store: ReturnType<typeof useSettingsStore>;
  let uiStore: ReturnType<typeof useUIStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useSettingsStore();
    uiStore = useUIStore();
  });

  describe('초기 상태', () => {
    it('기본 상태값이 올바르게 설정되어야 한다', () => {
      expect(store.alwaysOnTop).toBe(false);
      expect(store.initPanel).toBe(false);
      expect(store.showButtonAddedLabel).toBe(true);
      expect(store.hapticsMode).toBe(true);
      expect(store.useGrouping).toBe(true);
      expect(store.groupingUnit).toBe(3);
      expect(store.decimalPlaces).toBe(-1);
      expect(store.numberFormatPerCalculator).toBe(false);
      expect(store.useSystemLocale).toBe(true);
      expect(store.locale).toBe('');
      expect(store.userLocale).toBe('');
      expect(store.autoUpdate).toBe(true);
      expect(store.recordFontSize).toBe(1);
    });

    it('각 계산기별 포맷 설정이 기본값으로 초기화되어야 한다', () => {
      const defaultFormat = { useGrouping: true, groupingUnit: 3, decimalPlaces: -1 };
      expect(store.formatSettings.calc).toEqual(defaultFormat);
      expect(store.formatSettings.unit).toEqual(defaultFormat);
      expect(store.formatSettings.currency).toEqual(defaultFormat);
      expect(store.formatSettings.radix).toEqual(defaultFormat);
    });
  });

  describe('locale 관련', () => {
    it('locale을 변경할 수 있어야 한다', () => {
      store.$patch({ locale: 'ko' });
      expect(store.locale).toBe('ko');
    });

    it('userLocale을 변경할 수 있어야 한다', () => {
      store.$patch({ userLocale: 'en' });
      expect(store.userLocale).toBe('en');
    });

    it('useSystemLocale을 변경할 수 있어야 한다', () => {
      store.$patch({ useSystemLocale: false });
      expect(store.useSystemLocale).toBe(false);
    });
  });

  describe('darkMode / alwaysOnTop / initPanel / hapticsMode', () => {
    it('setAlwaysOnTop으로 설정하고 window.electron을 호출해야 한다', () => {
      store.setAlwaysOnTop(true);
      expect(store.alwaysOnTop).toBe(true);
      expect(mockSetAlwaysOnTop).toHaveBeenCalledWith(true);
    });

    it('toggleAlwaysOnTop으로 토글할 수 있어야 한다', () => {
      expect(store.alwaysOnTop).toBe(false);
      store.toggleAlwaysOnTop();
      expect(store.alwaysOnTop).toBe(true);
      store.toggleAlwaysOnTop();
      expect(store.alwaysOnTop).toBe(false);
    });

    it('setInitPanel로 설정할 수 있어야 한다', () => {
      store.setInitPanel(true);
      expect(store.initPanel).toBe(true);
    });

    it('toggleInitPanel로 토글할 수 있어야 한다', () => {
      store.toggleInitPanel();
      expect(store.initPanel).toBe(true);
      store.toggleInitPanel();
      expect(store.initPanel).toBe(false);
    });

    it('setHapticsMode로 설정할 수 있어야 한다', () => {
      store.setHapticsMode(false);
      expect(store.hapticsMode).toBe(false);
    });

    it('toggleHapticsMode로 토글할 수 있어야 한다', () => {
      expect(store.hapticsMode).toBe(true);
      store.toggleHapticsMode();
      expect(store.hapticsMode).toBe(false);
      store.toggleHapticsMode();
      expect(store.hapticsMode).toBe(true);
    });
  });

  describe('numberFormatPerCalculator / getCurrentFormatSettings', () => {
    it('numberFormatPerCalculator가 false일 때 모든 탭에서 calc 설정을 반환해야 한다', () => {
      store.$patch({ numberFormatPerCalculator: false });
      store.$patch({
        formatSettings: {
          calc: { useGrouping: false, groupingUnit: 4, decimalPlaces: 2 },
          unit: { useGrouping: true, groupingUnit: 3, decimalPlaces: -1 },
          currency: { useGrouping: true, groupingUnit: 3, decimalPlaces: -1 },
          radix: { useGrouping: true, groupingUnit: 3, decimalPlaces: -1 },
        },
      });

      uiStore.setCurrentTab('unit');
      expect(store.getCurrentFormatSettings).toEqual({
        useGrouping: false,
        groupingUnit: 4,
        decimalPlaces: 2,
      });
    });

    it('numberFormatPerCalculator가 true일 때 각 탭의 개별 설정을 반환해야 한다', () => {
      store.$patch({ numberFormatPerCalculator: true });
      store.$patch({
        formatSettings: {
          calc: { useGrouping: true, groupingUnit: 3, decimalPlaces: -1 },
          unit: { useGrouping: false, groupingUnit: 4, decimalPlaces: 2 },
          currency: { useGrouping: true, groupingUnit: 3, decimalPlaces: -1 },
          radix: { useGrouping: true, groupingUnit: 3, decimalPlaces: -1 },
        },
      });

      uiStore.setCurrentTab('unit');
      expect(store.getCurrentFormatSettings).toEqual({
        useGrouping: false,
        groupingUnit: 4,
        decimalPlaces: 2,
      });
    });

    it('toggleNumberFormatPerCalculator로 토글할 수 있어야 한다', () => {
      expect(store.numberFormatPerCalculator).toBe(false);
      store.toggleNumberFormatPerCalculator();
      expect(store.numberFormatPerCalculator).toBe(true);
    });

    it('setNumberFormatPerCalculator로 직접 설정할 수 있어야 한다', () => {
      store.setNumberFormatPerCalculator(true);
      expect(store.numberFormatPerCalculator).toBe(true);
    });
  });

  describe('updateCurrentSettings', () => {
    it('공통 모드에서 calc 설정과 레거시 필드를 동시에 업데이트해야 한다', () => {
      store.$patch({ numberFormatPerCalculator: false });
      store.updateCurrentSettings({ useGrouping: false, groupingUnit: 4 });

      expect(store.formatSettings.calc.useGrouping).toBe(false);
      expect(store.formatSettings.calc.groupingUnit).toBe(4);
      // 레거시 필드도 동기화
      expect(store.useGrouping).toBe(false);
      expect(store.groupingUnit).toBe(4);
    });

    it('개별 모드에서 현재 탭의 설정만 업데이트해야 한다', () => {
      store.$patch({ numberFormatPerCalculator: true });
      uiStore.setCurrentTab('unit');
      store.updateCurrentSettings({ useGrouping: false });

      expect(store.formatSettings.unit.useGrouping).toBe(false);
      // calc는 변경되지 않아야 함
      expect(store.formatSettings.calc.useGrouping).toBe(true);
    });

    it('개별 모드에서 calc 탭 업데이트 시 레거시 필드도 동기화해야 한다', () => {
      store.$patch({ numberFormatPerCalculator: true });
      uiStore.setCurrentTab('calc');
      store.updateCurrentSettings({ decimalPlaces: 3 });

      expect(store.formatSettings.calc.decimalPlaces).toBe(3);
      expect(store.decimalPlaces).toBe(3);
    });
  });

  describe('useGrouping / groupingUnit 토글', () => {
    it('toggleUseGrouping으로 현재 계산기의 useGrouping을 토글할 수 있어야 한다', () => {
      expect(store.formatSettings.calc.useGrouping).toBe(true);
      store.toggleUseGrouping();
      expect(store.formatSettings.calc.useGrouping).toBe(false);
    });

    it('toggleGroupingUnit으로 3과 4를 토글할 수 있어야 한다', () => {
      expect(store.formatSettings.calc.groupingUnit).toBe(3);
      store.toggleGroupingUnit();
      expect(store.formatSettings.calc.groupingUnit).toBe(4);
      store.toggleGroupingUnit();
      expect(store.formatSettings.calc.groupingUnit).toBe(3);
    });

    it('setGroupingUnit으로 직접 설정할 수 있어야 한다', () => {
      store.setGroupingUnit(4);
      expect(store.formatSettings.calc.groupingUnit).toBe(4);
    });
  });

  describe('decimalPlaces', () => {
    it('setDecimalPlaces로 소수점 자릿수를 설정할 수 있어야 한다', () => {
      store.setDecimalPlaces(3);
      expect(store.formatSettings.calc.decimalPlaces).toBe(3);
    });

    it('incrementDecimalPlaces로 소수점 자릿수를 증가시킬 수 있어야 한다', () => {
      store.setDecimalPlaces(0);
      store.incrementDecimalPlaces();
      expect(store.formatSettings.calc.decimalPlaces).toBe(1);
    });

    it('decrementDecimalPlaces로 소수점 자릿수를 감소시킬 수 있어야 한다', () => {
      store.setDecimalPlaces(1);
      store.decrementDecimalPlaces();
      expect(store.formatSettings.calc.decimalPlaces).toBe(0);
    });

    it('incrementDecimalPlaces는 최대값을 넘지 않아야 한다', () => {
      store.setDecimalPlaces(5);
      store.incrementDecimalPlaces();
      expect(store.formatSettings.calc.decimalPlaces).toBe(5);
    });

    it('decrementDecimalPlaces는 최소값 아래로 내려가지 않아야 한다', () => {
      store.setDecimalPlaces(-1);
      store.decrementDecimalPlaces();
      expect(store.formatSettings.calc.decimalPlaces).toBe(-1);
    });
  });

  describe('recordFontSize', () => {
    it('기본값이 1이어야 한다', () => {
      expect(store.recordFontSize).toBe(1);
    });

    it('incrementRecordFontSize로 증가시킬 수 있어야 한다', () => {
      store.incrementRecordFontSize();
      expect(store.recordFontSize).toBe(2);
    });

    it('decrementRecordFontSize로 감소시킬 수 있어야 한다', () => {
      store.decrementRecordFontSize();
      expect(store.recordFontSize).toBe(0);
    });

    it('incrementRecordFontSize는 최대값 2를 넘지 않아야 한다', () => {
      store.$patch({ recordFontSize: 2 });
      store.incrementRecordFontSize();
      expect(store.recordFontSize).toBe(2);
    });

    it('decrementRecordFontSize는 최소값 0 아래로 내려가지 않아야 한다', () => {
      store.$patch({ recordFontSize: 0 });
      store.decrementRecordFontSize();
      expect(store.recordFontSize).toBe(0);
    });
  });

  describe('autoUpdate', () => {
    it('setAutoUpdate로 설정할 수 있어야 한다', () => {
      store.setAutoUpdate(false);
      expect(store.autoUpdate).toBe(false);
    });

    it('toggleAutoUpdate로 토글할 수 있어야 한다', () => {
      expect(store.autoUpdate).toBe(true);
      store.toggleAutoUpdate();
      expect(store.autoUpdate).toBe(false);
      store.toggleAutoUpdate();
      expect(store.autoUpdate).toBe(true);
    });
  });

  describe('buttonAddedLabel', () => {
    it('toggleButtonAddedLabel로 토글할 수 있어야 한다', () => {
      expect(store.showButtonAddedLabel).toBe(true);
      store.toggleButtonAddedLabel();
      expect(store.showButtonAddedLabel).toBe(false);
    });
  });

  describe('getters', () => {
    it('getCurrentUseGrouping이 현재 탭의 useGrouping을 반환해야 한다', () => {
      expect(store.getCurrentUseGrouping).toBe(true);
    });

    it('getCurrentGroupingUnit이 현재 탭의 groupingUnit을 반환해야 한다', () => {
      expect(store.getCurrentGroupingUnit).toBe(3);
    });

    it('getCurrentDecimalPlaces가 현재 탭의 decimalPlaces를 반환해야 한다', () => {
      expect(store.getCurrentDecimalPlaces).toBe(-1);
    });

    it('getDecimalPlaces가 DECIMAL_PLACES 매핑 값을 반환해야 한다', () => {
      // decimalPlaces -1 -> DECIMAL_PLACES[-1] = -1
      expect(store.getDecimalPlaces).toBe(-1);

      store.setDecimalPlaces(0);
      // decimalPlaces 0 -> DECIMAL_PLACES[0] = 0
      expect(store.getDecimalPlaces).toBe(0);

      store.setDecimalPlaces(1);
      // decimalPlaces 1 -> DECIMAL_PLACES[1] = 2
      expect(store.getDecimalPlaces).toBe(2);
    });
  });
});
