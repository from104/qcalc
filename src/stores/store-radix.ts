import {defineStore} from 'pinia';
import {create, all} from 'mathjs';

// BigNumber 정밀도를 64로 설정한 MathJS 인스턴스 생성
const MathB = create(all, {
  number: 'BigNumber',
  precision: 64,
})

// 유틸리티 관련 상태 및 동작을 관리하는 스토어 정의
export const useStoreRadix = defineStore('radix', {
  // 상태 정의
  state: () => ({
    wordSize: 32, // 비트 크기
    radixList: [2, 8, 10, 16], // 진법 목록
    mainRadix: 10, // 기본 진법
    subRadix: 16, // 보조 진법
  }),

  // 액션 정의
  actions: {
    // 10진수 문자열을 2진수, 8진수, 10진수, 16진수 문자열로 변환
    convertDecimalToRadix(decimal: string, radix: number): string {
      if (decimal === '') {
        return '';
      }

      const bignumber = MathB.bignumber(decimal);
      
      // 진법에 따른 변환 처리
      switch (radix) {
        case 2: // 2진수
          return MathB.format(MathB.floor(bignumber), {notation: 'bin', precision: this.wordSize});
        case 8: // 8진수 
          return MathB.format(MathB.floor(bignumber), {notation: 'oct', precision: this.wordSize});
        case 10: // 10진수
          return MathB.format(bignumber, {notation: 'fixed', precision: this.wordSize});
        case 16: // 16진수
          return MathB.format(MathB.floor(bignumber), {notation: 'hex', precision: this.wordSize});
        default:
          return decimal;
      }
    },
  },

  // 상태 지속성 설정 (페이지 새로고침 후에도 상태 유지)
  persist: true,
});
