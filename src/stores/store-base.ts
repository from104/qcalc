import {defineStore} from 'pinia';
import {Calculator} from 'classes/Calculator';
import {CalculatorHistory} from 'classes/CalculatorHistory';
import {CurrencyConverter} from 'classes/CurrencyConverter';

export const useStoreBase = defineStore('base', {
  state: () => ({
    calc: null as unknown as Calculator,
    calcHistory: null as unknown as CalculatorHistory,
    cTab: 'calc',
    isHistoryDialogOpen: false,
    isSettingDialogOpen: false,
    buttonShift: false,
    buttonShiftLock: false,
    showMemory: false,
    // 패널 숫자 위 여백
    paddingOnResult: 0,
  }),
  actions: {
    setCTab(tab: string): void {
      if (['calc', 'unit', 'currency'].includes(tab)) {
        this.cTab = tab;
      } else if (tab === '' || this.cTab === '') {
        this.cTab = 'calc';
      }
    },
    toggleButtonShift(): void {
      this.buttonShift = !this.buttonShift;
    },
    onButtonShift(): void {
      this.buttonShift = true;
    },
    offButtonShift(): void {
      this.buttonShift = false;
    },
    toggleButtonShiftLock(): void {
      this.buttonShiftLock = !this.buttonShiftLock;
    },
    onButtonShiftLock(): void {
      this.buttonShiftLock = true;
    },
    offButtonShiftLock(): void {
      this.buttonShiftLock = false;
    },
    showMemoryOff(): void {
      this.showMemory = false;
    },
    showMemoryOnWithTimer(): void {
      this.showMemory = true;
      setTimeout(() => {
        this.showMemory = false;
      }, 2000);
    },
  },
  persist: true,
});
