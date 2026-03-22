/**
 * @file radixConverterStore.ts
 * @description 진법 변환 관련 상태와 액션을 관리하는 스토어입니다.
 */

import { defineStore } from 'pinia';
import { Radix, convertRadix, isValidRadixNumber } from '../core/converters/RadixConverter';
import { useUIStore } from './uiStore';

// const uiStore = useUIStore();

type WordSize = 8 | 16 | 32 | 64;

interface RadixState {
  wordSize: WordSize;
  radixList: Radix[];
  sourceRadix: Radix;
  targetRadix: Radix;
  showRadix: boolean;
  radixType: 'prefix' | 'suffix';
}

const RADIX_PREFIXES = ['0b', '0o', '0x', ''] as const;
const RADIX_SUFFIXES = ['2', '8', '10', '16'] as const;

type RadixPrefix = (typeof RADIX_PREFIXES)[number];
type RadixSuffix = (typeof RADIX_SUFFIXES)[number];

export const useRadixStore = defineStore('radix', {
  state: (): RadixState => ({
    wordSize: 32,
    radixList: Object.values(Radix),
    sourceRadix: Radix.Decimal,
    targetRadix: Radix.Hexadecimal,
    showRadix: true,
    radixType: 'suffix',
  }),

  actions: {
    validateAndCorrectRadixSettings(): boolean {
      let wasMutated = false;
      const availableRadixes = Object.values(Radix);
      const availableWordSizes: WordSize[] = [8, 16, 32, 64];
      const availableRadixTypes = ['prefix', 'suffix'];

      // sourceRadix 유효성 검사
      if (!this.sourceRadix || !availableRadixes.includes(this.sourceRadix)) {
        this.sourceRadix = Radix.Decimal;
        wasMutated = true;
      }
      // targetRadix 유효성 검사
      if (!this.targetRadix || !availableRadixes.includes(this.targetRadix)) {
        this.targetRadix = Radix.Hexadecimal;
        wasMutated = true;
      }
      // wordSize 유효성 검사
      if (!this.wordSize || !availableWordSizes.includes(this.wordSize)) {
        this.wordSize = 32;
        wasMutated = true;
      }
      // radixType 유효성 검사
      if (!this.radixType || !availableRadixTypes.includes(this.radixType)) {
        this.radixType = 'suffix';
        wasMutated = true;
      }
      return wasMutated;
    },

    // 진법 변환 관련
    convertIfRadix(value: string): string {
      const uiStore = useUIStore();
      return this.convertRadix(value, Radix.Decimal, uiStore.currentTab === 'radix' ? this.sourceRadix : Radix.Decimal);
    },

    convertRadix(value: string, fromRadix: Radix, toRadix: Radix): string {
      return convertRadix(value, fromRadix, toRadix);
    },

    validateRadixNumber(value: string, radix: Radix): boolean {
      return isValidRadixNumber(value, radix);
    },

    radixEnumToNumber(radix: Radix): number {
      return {
        [Radix.Binary]: 2,
        [Radix.Octal]: 8,
        [Radix.Decimal]: 10,
        [Radix.Hexadecimal]: 16,
      }[radix];
    },

    getRadixNumberToOrder(number: number): number {
      return { [2]: 0, [8]: 1, [10]: 2, [16]: 3 }[number] ?? -1;
    },

    getRadixPrefix(radix: Radix): RadixPrefix {
      const index = this.getRadixNumberToOrder(this.radixEnumToNumber(radix));
      const safeIndex = Math.min(Math.max(0, index), RADIX_PREFIXES.length - 1);
      return RADIX_PREFIXES[safeIndex] as RadixPrefix;
    },

    getRadixSuffix(radix: Radix): RadixSuffix {
      const index = this.getRadixNumberToOrder(this.radixEnumToNumber(radix));
      const safeIndex = Math.min(Math.max(0, index), RADIX_SUFFIXES.length - 1);
      return RADIX_SUFFIXES[safeIndex] as RadixSuffix;
    },

    initRecentRadix(): void {
      const availableRadixes = Object.values(Radix);
      const isValidRadixType = (radix: Radix) => availableRadixes.includes(radix);

      if (!isValidRadixType(this.sourceRadix)) {
        this.sourceRadix = Radix.Decimal;
      }
      if (!isValidRadixType(this.targetRadix)) {
        this.targetRadix = Radix.Hexadecimal;
      }
    },

    swapRadixes(): void {
      [this.sourceRadix, this.targetRadix] = [this.targetRadix, this.sourceRadix];
    },

    updateWordSize(value: WordSize): void {
      this.wordSize = value;
    },

    // UI 표시 설정
    toggleShowRadix(): void {
      this.showRadix = !this.showRadix;
    },

    setRadixType(displayType: 'prefix' | 'suffix'): void {
      this.radixType = displayType;
    },
  },

  persist: true,
});
