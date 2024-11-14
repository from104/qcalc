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
    mainRadix: Radix.Decimal, // 기본 진법
    subRadix: Radix.Hexadecimal, // 보조 진법
  }),

  // 액션 정의
  actions: {
    // 최근 진법 초기화
    initRecentRadix() {
      if (!Object.values(Radix).includes(this.mainRadix)) {
        this.mainRadix = Radix.Decimal;
      }
      if (!Object.values(Radix).includes(this.subRadix)) {
        this.subRadix = Radix.Hexadecimal;
      }
      if (this.mainRadix === this.subRadix) {
        const currentIndex = this.radixList.indexOf(this.mainRadix);
        const nextIndex = (currentIndex + 1) % this.radixList.length;
        this.subRadix = this.radixList[nextIndex];
      }
    },

    // 진법 교환
    swapRadix() {
      [this.mainRadix, this.subRadix] = [this.subRadix, this.mainRadix];
    },

    // 문자열을 원하는 진법으로 변환
    convertRadix(value: string, fromRadix: RadixType, toRadix: RadixType): string {
      return radixConverter.convertRadix(value, fromRadix, toRadix);
    },

    // 문자열이 유효한 진법 문자열인지 검사
    isValidRadixNumber(value: string, radix: RadixType): boolean {
      return radixConverter.isValidRadixNumber(value, radix);
    },

    // 워드 크기 설정
    setWordSize(value: WordSize) {
      this.wordSize = value;
      const { calc } = useStoreBase(); // 여기서 호출
      calc.wordSize = value;
    },
  },

  // 상태 지속성 설정 (페이지 새로고침 후에도 상태 유지)
  persist: true,
});
