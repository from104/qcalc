/**
 * @file calculatorStore.ts
 * @description 계산기 관련 상태와 액션을 관리하는 스토어입니다.
 */

import { defineStore } from 'pinia';
import { Calculator } from 'classes/Calculator';
import { match } from 'ts-pattern';
import { Operator } from 'classes/Calculator';
import { Radix } from 'classes/RadixConverter';
import { numberGrouping, formatDecimalPlaces } from '../utils/NumberUtils';
import { useSettingsStore } from './settingsStore';
import { useRadixStore } from './radixStore';
import { useUIStore } from './uiStore';

interface CalculatorState {
  calc: Calculator;
  isMemoryVisible: boolean;
  resultPanelPadding: number;
  paddingOnResult: number;
  isShiftPressed: boolean;
  isShiftLocked: boolean;
}

export const useCalculatorStore = defineStore('calculator', {
  state: (): CalculatorState => ({
    calc: new Calculator(),
    isMemoryVisible: false,
    resultPanelPadding: 0,
    paddingOnResult: 20,
    isShiftPressed: false,
    isShiftLocked: false,
  }),

  actions: {
    // 숫자 포맷팅 관련
    toFormattedNumber(value: string): string {
      if (!value) return '';

      const settingsStore = useSettingsStore();
      const radixStore = useRadixStore();
      const uiStore = useUIStore();

      const formattedValue = formatDecimalPlaces(
        value,
        settingsStore.getDecimalPlaces,
        radixStore.radixEnumToNumber(
          uiStore.currentTab === 'radix' ? radixStore.sourceRadix : Radix.Decimal,
        ),
      );

      return settingsStore.useGrouping ? numberGrouping(formattedValue, settingsStore.groupingUnit) : formattedValue;
    },

    // Shift 키 관련
    toggleShift(): void {
      this.isShiftPressed = !this.isShiftPressed;
    },

    enableShift(): void {
      this.isShiftPressed = true;
    },

    disableShift(): void {
      this.isShiftPressed = false;
    },

    toggleShiftLock(): void {
      this.isShiftLocked = !this.isShiftLocked;
    },

    enableShiftLock(): void {
      this.isShiftLocked = true;
    },

    disableShiftLock(): void {
      this.isShiftLocked = false;
    },

    // 메모리 표시 관련
    hideMemory(): void {
      this.isMemoryVisible = false;
    },

    showMemoryTemporarily(): void {
      this.isMemoryVisible = true;
      setTimeout(() => {
        this.isMemoryVisible = false;
      }, 2000);
    },

    // 계산 기록 관련
    getLeftSideInRecord(result: CalculationResult, useLineBreak = false): string {
      const lineBreak = useLineBreak ? '\n' : '';
      const formattedPrev = this.toFormattedNumber(result.previousNumber);
      const formattedArg = result.argumentNumber ? this.toFormattedNumber(result.argumentNumber) : '';
      const operator = Array.isArray(result.operator) ? result.operator[0] : result.operator || '';

      return match(operator)
        .with(
          Operator.ADD,
          Operator.SUB,
          Operator.MUL,
          Operator.DIV,
          Operator.MOD,
          (op) => `${formattedPrev}${lineBreak} ${op} ${formattedArg}`,
        )
        .with(Operator.BIT_NOT, () => `! ${formattedPrev}`)
        .with(Operator.BIT_AND, () => `${formattedPrev}${lineBreak} & ${formattedArg}`)
        .with(Operator.BIT_OR, () => `${formattedPrev}${lineBreak} | ${formattedArg}`)
        .with(Operator.BIT_XOR, () => `${formattedPrev}${lineBreak} ^ ${formattedArg}`)
        .with(Operator.BIT_NAND, () => `! (${formattedPrev}${lineBreak} & ${formattedArg})`)
        .with(Operator.BIT_NOR, () => `! (${formattedPrev}${lineBreak} | ${formattedArg})`)
        .with(Operator.BIT_XNOR, () => `! (${formattedPrev}${lineBreak} ^ ${formattedArg})`)
        .with(Operator.BIT_SFT_R, () => `${formattedPrev}${lineBreak} >> ${formattedArg}`)
        .with(Operator.BIT_SFT_L, () => `${formattedPrev}${lineBreak} << ${formattedArg}`)
        .with(Operator.POW, () => `${formattedPrev}${lineBreak} ^ ${formattedArg}`)
        .with(Operator.ROOT, () => `${formattedPrev}${lineBreak} ^ (1/${formattedArg})`)
        .with(Operator.PCT, () => {
          if (Array.isArray(result.operator) && result.operator[1] === Operator.DIV) {
            return `${formattedPrev}${lineBreak} / ${formattedArg}${lineBreak} × 100`;
          } else {
            return `${formattedPrev}${lineBreak} × ${formattedArg}%`;
          }
        })
        .with(Operator.REC, () => `1${lineBreak} ÷ ${formattedPrev}`)
        .with(Operator.POW2, () => `${formattedPrev} ^ 2`)
        .with(Operator.EXP10, () => `${this.toFormattedNumber('10')} ^ ${formattedPrev}`)
        .with(
          Operator.SQRT,
          Operator.SIN,
          Operator.COS,
          Operator.TAN,
          Operator.FCT,
          Operator.INT,
          Operator.FRAC,
          () => `${operator} ( ${formattedPrev} )`,
        )
        .otherwise(() => formattedPrev);
    },

    getRightSideInRecord(result: CalculationResult): string {
      return this.toFormattedNumber(result.resultNumber);
    },
  },

  persist: true,
});
