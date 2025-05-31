/**
 * @file calcStore.ts
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

const settingsStore = useSettingsStore();
const radixStore = useRadixStore();
const uiStore = useUIStore();

interface CalcState {
  calc: Calculator;
  isMemoryVisible: boolean;
  resultPanelPadding: number;
  paddingOnResult: number;
  isShiftPressed: boolean;
  isShiftLocked: boolean;
  needButtonNotification: boolean;
}

export const useCalcStore = defineStore('calc', {
  state: (): CalcState => ({
    calc: new Calculator(),
    isMemoryVisible: false,
    resultPanelPadding: 0,
    paddingOnResult: 20,
    isShiftPressed: false,
    isShiftLocked: false,
    needButtonNotification: false,
  }),

  actions: {
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
      let timer: NodeJS.Timeout | null = null;
      if (this.isMemoryVisible) {
        this.hideMemory();
        if (timer) {
          clearTimeout(timer);
        }
      } else {
        this.isMemoryVisible = true;
        timer = setTimeout(() => {
          this.isMemoryVisible = false;
        }, 3000);
      }
    },

    onNeedButtonNotification(): void {
      this.needButtonNotification = true;
    },

    offNeedButtonNotification(): void {
      this.needButtonNotification = false;
    },

    // 숫자 포맷팅 관련
    toFormattedNumber(value: string, radix: Radix = Radix.Decimal): string {
      if (!value) return '';

      const formattedValue = formatDecimalPlaces(
        value,
        settingsStore.getDecimalPlaces,
        radixStore.radixEnumToNumber(uiStore.currentTab === 'radix' ? radix : Radix.Decimal),
      );

      return settingsStore.useGrouping ? numberGrouping(formattedValue, settingsStore.groupingUnit) : formattedValue;
    },

    // 계산 기록 관련
    getLeftSideInRecord(result: CalculationResult, useLineBreak = false): string {
      const radix = uiStore.currentTab === 'radix' ? radixStore.sourceRadix : Radix.Decimal;
      const radixPrefix =
        uiStore.currentTab === 'radix' && radixStore.showRadix && radixStore.radixType === 'prefix'
          ? radixStore.getRadixPrefix(radix)
          : '';
      const radixSuffix =
        uiStore.currentTab === 'radix' && radixStore.showRadix && radixStore.radixType === 'suffix'
          ? `(${radixStore.getRadixSuffix(radix)})`
          : '';

      const lineBreak = useLineBreak ? '\n' : '';

      const prevValue = radixStore.convertIfRadix(result.previousNumber);
      const argValue = result.argumentNumber ? radixStore.convertIfRadix(result.argumentNumber) : '';
      const formattedPrev = radixPrefix + this.toFormattedNumber(prevValue, radix) + radixSuffix;
      const formattedArg = radixPrefix + this.toFormattedNumber(argValue, radix) + radixSuffix;
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
        .with(Operator.EXP10, () => `${this.toFormattedNumber('10', radixStore.sourceRadix)} ^ ${formattedPrev}`)
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
      const radix = uiStore.currentTab === 'radix' ? radixStore.sourceRadix : Radix.Decimal;
      const radixPrefix =
        uiStore.currentTab === 'radix' && radixStore.showRadix && radixStore.radixType === 'prefix'
          ? radixStore.getRadixPrefix(radix)
          : '';
      const radixSuffix =
        uiStore.currentTab === 'radix' && radixStore.showRadix && radixStore.radixType === 'suffix'
          ? `(${radixStore.getRadixSuffix(radix)})`
          : '';
      return radixPrefix + this.toFormattedNumber(radixStore.convertIfRadix(result.resultNumber), radix) + radixSuffix;
    },
  },

  persist: true,
});
