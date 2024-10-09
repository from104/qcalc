import {defineStore} from 'pinia';
import {CurrencyConverter} from 'classes/CurrencyConverter';

export const useStoreCurrency = defineStore('currency', {
  state: () => ({
    currencyConverter: new CurrencyConverter(),
    recentCurrencyFrom: '',
    recentCurrencyTo: '',
  }),
  actions: {
    initRecentCurrency(): void {
      const currencyList = this.currencyConverter.getCurrencyLists();
      this.recentCurrencyFrom =
        this.recentCurrencyFrom !== '' && currencyList.includes(this.recentCurrencyFrom)
          ? this.recentCurrencyFrom
          : 'USD';
      this.recentCurrencyTo =
        this.recentCurrencyTo !== '' && currencyList.includes(this.recentCurrencyTo)
          ? this.recentCurrencyTo
          : 'KRW';
    },
    swapCurrencyValue(): void {
      const temp = this.recentCurrencyFrom;
      this.recentCurrencyFrom = this.recentCurrencyTo;
      this.recentCurrencyTo = temp;
    },
  },
  persist: true,
});
