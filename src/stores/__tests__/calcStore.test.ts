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

// window mock
vi.stubGlobal('window', {
  electron: {
    setAlwaysOnTop: vi.fn(),
  },
});

// calcStore는 모듈 레벨에서 useSettingsStore(), useRadixStore(), useUIStore()를 호출하므로
// import 전에 Pinia를 활성화해야 한다.
// 매 테스트마다 새 Pinia를 설정하기 위해 dynamic import를 사용한다.
describe('calcStore', () => {
  let useCalcStore: (typeof import('../calcStore'))['useCalcStore'];
  let useUIStore: (typeof import('../uiStore'))['useUIStore'];
  let useSettingsStore: (typeof import('../settingsStore'))['useSettingsStore'];

  beforeEach(async () => {
    // 모듈 캐시를 초기화하여 calcStore의 모듈 레벨 코드가 다시 실행되도록 한다
    vi.resetModules();
    setActivePinia(createPinia());

    const calcMod = await import('../calcStore');
    const uiMod = await import('../uiStore');
    const settingsMod = await import('../settingsStore');

    useCalcStore = calcMod.useCalcStore;
    useUIStore = uiMod.useUIStore;
    useSettingsStore = settingsMod.useSettingsStore;
  });

  describe('초기 상태', () => {
    it('기본 상태값이 올바르게 설정되어야 한다', () => {
      const store = useCalcStore();
      expect(store.calc).toBeDefined();
      expect(store.isMemoryVisible).toBe(false);
      expect(store.isShiftPressed).toBe(false);
      expect(store.isShiftLocked).toBe(false);
      expect(store.needButtonNotification).toBe(false);
    });
  });

  describe('calc 인스턴스', () => {
    it('Calculator 인스턴스가 존재해야 한다', () => {
      const store = useCalcStore();
      expect(store.calc).toBeDefined();
      // Calculator 인스턴스는 Pinia reactivity proxy를 통해 접근됨
      expect(store.calc).not.toBeNull();
    });
  });

  describe('Shift 키 관련', () => {
    it('toggleShift로 isShiftPressed를 토글할 수 있어야 한다', () => {
      const store = useCalcStore();
      expect(store.isShiftPressed).toBe(false);
      store.toggleShift();
      expect(store.isShiftPressed).toBe(true);
      store.toggleShift();
      expect(store.isShiftPressed).toBe(false);
    });

    it('enableShift로 true로 설정할 수 있어야 한다', () => {
      const store = useCalcStore();
      store.enableShift();
      expect(store.isShiftPressed).toBe(true);
    });

    it('disableShift로 false로 설정할 수 있어야 한다', () => {
      const store = useCalcStore();
      store.enableShift();
      store.disableShift();
      expect(store.isShiftPressed).toBe(false);
    });

    it('toggleShiftLock으로 isShiftLocked를 토글할 수 있어야 한다', () => {
      const store = useCalcStore();
      expect(store.isShiftLocked).toBe(false);
      store.toggleShiftLock();
      expect(store.isShiftLocked).toBe(true);
      store.toggleShiftLock();
      expect(store.isShiftLocked).toBe(false);
    });

    it('enableShiftLock으로 true로 설정할 수 있어야 한다', () => {
      const store = useCalcStore();
      store.enableShiftLock();
      expect(store.isShiftLocked).toBe(true);
    });

    it('disableShiftLock으로 false로 설정할 수 있어야 한다', () => {
      const store = useCalcStore();
      store.enableShiftLock();
      store.disableShiftLock();
      expect(store.isShiftLocked).toBe(false);
    });
  });

  describe('메모리 표시 관련', () => {
    it('hideMemory로 isMemoryVisible을 false로 설정해야 한다', () => {
      const store = useCalcStore();
      store.$patch({ isMemoryVisible: true });
      store.hideMemory();
      expect(store.isMemoryVisible).toBe(false);
    });

    it('showMemoryTemporarily로 isMemoryVisible을 true로 설정해야 한다', () => {
      const store = useCalcStore();
      store.showMemoryTemporarily();
      expect(store.isMemoryVisible).toBe(true);
    });

    it('showMemoryTemporarily를 다시 호출하면 isMemoryVisible을 false로 설정해야 한다', () => {
      const store = useCalcStore();
      store.showMemoryTemporarily();
      expect(store.isMemoryVisible).toBe(true);
      store.showMemoryTemporarily();
      expect(store.isMemoryVisible).toBe(false);
    });

    it('showMemoryTemporarily 후 3초 뒤에 자동으로 숨겨져야 한다', () => {
      vi.useFakeTimers();
      const store = useCalcStore();
      store.showMemoryTemporarily();
      expect(store.isMemoryVisible).toBe(true);

      vi.advanceTimersByTime(3000);
      expect(store.isMemoryVisible).toBe(false);
      vi.useRealTimers();
    });
  });

  describe('needButtonNotification', () => {
    it('onNeedButtonNotification으로 true로 설정할 수 있어야 한다', () => {
      const store = useCalcStore();
      store.onNeedButtonNotification();
      expect(store.needButtonNotification).toBe(true);
    });

    it('offNeedButtonNotification으로 false로 설정할 수 있어야 한다', () => {
      const store = useCalcStore();
      store.onNeedButtonNotification();
      store.offNeedButtonNotification();
      expect(store.needButtonNotification).toBe(false);
    });
  });

  describe('toFormattedNumber', () => {
    it('빈 문자열이면 빈 문자열을 반환해야 한다', () => {
      const store = useCalcStore();
      expect(store.toFormattedNumber('')).toBe('');
    });

    it('useGrouping이 true일 때 그룹핑이 적용되어야 한다', () => {
      const store = useCalcStore();
      const settingsStore = useSettingsStore();
      settingsStore.$patch({
        formatSettings: {
          calc: { useGrouping: true, groupingUnit: 3, decimalPlaces: -1 },
          unit: { useGrouping: true, groupingUnit: 3, decimalPlaces: -1 },
          currency: { useGrouping: true, groupingUnit: 3, decimalPlaces: -1 },
          radix: { useGrouping: true, groupingUnit: 3, decimalPlaces: -1 },
        },
      });
      const result = store.toFormattedNumber('1234567');
      expect(result).toBe('1,234,567');
    });

    it('useGrouping이 false일 때 그룹핑 없이 반환해야 한다', () => {
      const store = useCalcStore();
      const settingsStore = useSettingsStore();
      settingsStore.$patch({
        formatSettings: {
          calc: { useGrouping: false, groupingUnit: 3, decimalPlaces: -1 },
          unit: { useGrouping: false, groupingUnit: 3, decimalPlaces: -1 },
          currency: { useGrouping: false, groupingUnit: 3, decimalPlaces: -1 },
          radix: { useGrouping: false, groupingUnit: 3, decimalPlaces: -1 },
        },
      });
      const result = store.toFormattedNumber('1234567');
      expect(result).toBe('1234567');
    });

    it('groupingUnit이 4일 때 4자리 그룹핑이 적용되어야 한다', () => {
      const store = useCalcStore();
      const settingsStore = useSettingsStore();
      settingsStore.$patch({
        formatSettings: {
          calc: { useGrouping: true, groupingUnit: 4, decimalPlaces: -1 },
          unit: { useGrouping: true, groupingUnit: 4, decimalPlaces: -1 },
          currency: { useGrouping: true, groupingUnit: 4, decimalPlaces: -1 },
          radix: { useGrouping: true, groupingUnit: 4, decimalPlaces: -1 },
        },
      });
      const result = store.toFormattedNumber('12345678');
      expect(result).toBe('1234,5678');
    });
  });

  describe('getLeftSideInRecord / getRightSideInRecord', () => {
    it('getRightSideInRecord가 포맷된 결과를 반환해야 한다', () => {
      const store = useCalcStore();
      const uiStore = useUIStore();
      uiStore.setCurrentTab('calc');
      const result: CalculationResult = {
        previousNumber: '10',
        operator: '+',
        argumentNumber: '5',
        resultNumber: '15',
      };
      const formatted = store.getRightSideInRecord(result);
      expect(formatted).toBe('15');
    });

    it('getRightSideInRecord에서 큰 숫자는 그룹핑이 적용되어야 한다', () => {
      const store = useCalcStore();
      const uiStore = useUIStore();
      const settingsStore = useSettingsStore();
      uiStore.setCurrentTab('calc');
      settingsStore.$patch({
        formatSettings: {
          calc: { useGrouping: true, groupingUnit: 3, decimalPlaces: -1 },
          unit: { useGrouping: true, groupingUnit: 3, decimalPlaces: -1 },
          currency: { useGrouping: true, groupingUnit: 3, decimalPlaces: -1 },
          radix: { useGrouping: true, groupingUnit: 3, decimalPlaces: -1 },
        },
      });
      const result: CalculationResult = {
        previousNumber: '500000',
        operator: '+',
        argumentNumber: '500000',
        resultNumber: '1000000',
      };
      const formatted = store.getRightSideInRecord(result);
      expect(formatted).toBe('1,000,000');
    });
  });
});
