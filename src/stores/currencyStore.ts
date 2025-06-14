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
  showSymbol: boolean;
  convertedCurrencyNumber: string;
  favoriteCurrencies: string[];
}

export const useCurrencyStore = defineStore('currency', {
  state: (): CurrencyState => ({
    currencyConverter: new CurrencyConverter(),
    sourceCurrency: 'USD',
    targetCurrency: 'KRW',
    showSymbol: true,
    convertedCurrencyNumber: '',
    favoriteCurrencies: [],
  }),

  getters: {
    /**
     * 특정 통화가 즐겨찾기에 포함되어 있는지 확인
     * @param currency - 확인할 통화 코드
     * @returns 즐겨찾기 여부
     */
    isFavorite:
      (state) =>
      (currency: string): boolean => {
        return state.favoriteCurrencies.includes(currency);
      },

    /**
     * 즐겨찾기 통화와 일반 통화를 분리하여 정렬된 목록 반환
     * @returns 정렬된 통화 목록 (즐겨찾기가 상단에 위치, 원래 순서 유지)
     */
    getSortedCurrencies: (state) => (): string[] => {
      const availableCurrencies = state.currencyConverter.getAvailableItems();
      const favorites = availableCurrencies.filter((currency) => state.favoriteCurrencies.includes(currency));
      const nonFavorites = availableCurrencies.filter((currency) => !state.favoriteCurrencies.includes(currency));

      return [...favorites, ...nonFavorites];
    },
  },

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

    toggleShowSymbol(): void {
      this.showSymbol = !this.showSymbol;
    },

    /**
     * 통화를 즐겨찾기에 추가하거나 제거
     * @param currency - 토글할 통화 코드
     */
    toggleFavorite(currency: string): void {
      const index = this.favoriteCurrencies.indexOf(currency);
      if (index > -1) {
        // 이미 즐겨찾기에 있으면 제거
        this.favoriteCurrencies.splice(index, 1);
      } else {
        // 즐겨찾기에 없으면 추가
        this.favoriteCurrencies.push(currency);
      }
    },

    /**
     * 통화를 즐겨찾기에 추가
     * @param currency - 추가할 통화 코드
     */
    addToFavorites(currency: string): void {
      if (!this.favoriteCurrencies.includes(currency)) {
        this.favoriteCurrencies.push(currency);
      }
    },

    /**
     * 통화를 즐겨찾기에서 제거
     * @param currency - 제거할 통화 코드
     */
    removeFromFavorites(currency: string): void {
      const index = this.favoriteCurrencies.indexOf(currency);
      if (index > -1) {
        this.favoriteCurrencies.splice(index, 1);
      }
    },

    /**
     * 모든 즐겨찾기 초기화
     */
    clearFavorites(): void {
      this.favoriteCurrencies = [];
    },
  },

  persist: true,
});
