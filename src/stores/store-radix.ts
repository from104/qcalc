import { defineStore } from 'pinia';
import { WordSize } from 'src/classes/CalculatorTypes';
import { RadixConverter, Radix, RadixType } from 'src/classes/RadixConverter';
import { useStoreBase } from './store-base';

const radixConverter = new RadixConverter();
// 유틸리티 관련 상태 및 동작을 관리하는 스토어 정의

export const useStoreRadix = defineStore('radix', {
  // 상태 정의
  state: () => ({
    wordSize: 32 as WordSize, // 비트 크기
    radixList: Object.values(Radix), // 진법 목록
    sourceRadix: Radix.Decimal as RadixType, // 기본 진법
    targetRadix: Radix.Hexadecimal as RadixType, // 보조 진법
  }),

  // 액션 정의
  actions: {
    // 최근 진법 초기화
    initRecentRadix() {
      const availableRadixes = Object.values(Radix);
      const isValidRadixType = (radix: RadixType) => availableRadixes.includes(radix);

      if (!isValidRadixType(this.sourceRadix)) {
        this.sourceRadix = Radix.Decimal;
      }
      if (!isValidRadixType(this.targetRadix)) {
        this.targetRadix = Radix.Hexadecimal;
      }
      if (this.sourceRadix === this.targetRadix) {
        this.targetRadix = this.radixList[(this.radixList.indexOf(this.sourceRadix) + 1) % this.radixList.length];
      }
    },

    // 진법 교환
    swapRadixes() {
      [this.sourceRadix, this.targetRadix] = [this.targetRadix, this.sourceRadix];
    },

    // 문자열을 원하는 진법으로 변환
    convertRadix(value: string, fromRadix: RadixType, toRadix: RadixType): string {
      return radixConverter.convertRadix(value, fromRadix, toRadix);
    },

    // 문자열이 유효한 진법 문자열인지 검사
    validateRadixNumber(value: string, radix: RadixType): boolean {
      return radixConverter.isValidRadixNumber(value, radix);
    },

    // 워드 크기 설정
    updateWordSize(value: WordSize) {
      this.wordSize = value;
      const { calc } = useStoreBase(); // 여기서 호출
      calc.wordSize = value;
    },
  },

  // 상태 지속성 설정 (페이지 새로고침 후에도 상태 유지)
  persist: true,
});
