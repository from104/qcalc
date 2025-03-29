/**
 * @file currencyConverterStore.ts
 * @description 통화 변환 관련 상태와 액션을 관리하는 스토어입니다.
 */

import { defineStore } from 'pinia';
import { CurrencyConverter } from 'classes/CurrencyConverter';

interface CurrencyState {
  currencyConverter: CurrencyConverter;
  sourceCurrency: string;
  targetCurrency: string;
  convertedCurrencyNumber: string;
}

export const useCurrencyStore = defineStore('currency', {
  state: (): CurrencyState => ({
    currencyConverter: new CurrencyConverter(),
    sourceCurrency: 'USD',
    targetCurrency: 'KRW',
    convertedCurrencyNumber: '',
  }),

  actions: {
    // 통화 변환 관련
    initRecentCurrencies(): void {
      const availableCurrencies = this.currencyConverter.getAvailableItems();
      // 출발 통화 초기화
      this.sourceCurrency =
        this.sourceCurrency !== '' && availableCurrencies.includes(this.sourceCurrency)
          ? this.sourceCurrency // 유효한 경우 기존 값 유지
          : 'USD'; // 유효하지 않은 경우 기본값 'USD'로 설정
      // 도착 통화 초기화
      this.targetCurrency =
        this.targetCurrency !== '' && availableCurrencies.includes(this.targetCurrency)
          ? this.targetCurrency // 유효한 경우 기존 값 유지
          : 'KRW'; // 유효하지 않은 경우 기본값 'KRW'로 설정
    },

    swapCurrencies(): void {
      [this.sourceCurrency, this.targetCurrency] = [this.targetCurrency, this.sourceCurrency];
    },
  },

  persist: true,
});
