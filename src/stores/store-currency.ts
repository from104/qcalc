import { defineStore } from 'pinia';
import { CurrencyConverter } from 'classes/CurrencyConverter';

// 통화 관련 상태 및 동작을 관리하는 스토어 정의
export const useStoreCurrency = defineStore('currency', {
  // 상태 정의
  state: () => ({
    converter: new CurrencyConverter(), // 통화 변환기 인스턴스
    sourceCurrency: 'USD', // 최근 사용한 출발 통화
    targetCurrency: 'KRW', // 최근 사용한 도착 통화
  }),

  // 액션 정의
  actions: {
    // 최근 사용한 통화 초기화
    initRecentCurrencies(): void {
      const availableCurrencies = this.converter.getCurrencyLists();
      // 출발 통화 초기화
      this.sourceCurrency = this.sourceCurrency !== '' && availableCurrencies.includes(this.sourceCurrency)
        ? this.sourceCurrency // 유효한 경우 기존 값 유지
        : 'USD';             // 유효하지 않은 경우 기본값 'USD'로 설정
      // 도착 통화 초기화  
      this.targetCurrency = this.targetCurrency !== '' && availableCurrencies.includes(this.targetCurrency)
        ? this.targetCurrency // 유효한 경우 기존 값 유지
        : 'KRW';             // 유효하지 않은 경우 기본값 'KRW'로 설정
    },

    // 출발 통화와 도착 통화 교환
    swapCurrencies(): void {
      [this.sourceCurrency, this.targetCurrency] = [this.targetCurrency, this.sourceCurrency];
    },
  },

  // 상태 지속성 설정 (페이지 새로고침 후에도 상태 유지)
  persist: true,
});
