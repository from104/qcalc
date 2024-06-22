import Freecurrencyapi from '@everapi/freecurrencyapi-js';
import {CurrencyExchangeRates, CurrencyData, currencyBaseData} from './CurrencyBaseData';

// 환율 정보를 사용하는 클래스
export class CurrencyConverter {
  // https://app.freecurrencyapi.com/dashboard
  private accessKey = process.env.FREECURRENCY_API_KEY; // API 접근 키

  private intervalToUpdate = 1000 * 60 * 60 * 12; // 환율 정보를 업데이트하는 주기
  private updatedTimeOfCurrencyExchangeRates = 0; // 환율 정보를 업데이트한 시간
  private baseCurrencyExchangeRates: CurrencyExchangeRates = {}; // 기본 환율 정보 (EUR)
  private baseCurrency = 'EUR'; // 환율 정보의 기준 통화
  private rates: CurrencyExchangeRates = {}; // 환율 정보
  private currencies: CurrencyData = currencyBaseData; // 환율 정보를 사용하는 통화 데이터

  // 생성자
  constructor() {
    // 환율 정보를 업데이트합니다.
    this.updateRates();
  }

  // baseRates가 비어있는지 확인하는 메소드
  isRatesEmpty() {
    // baseRates가 비어있다면 true를 반환합니다.
    return Object.keys(this.baseCurrencyExchangeRates).length === 0;
  }

  // 환율 정보를 업데이트하는 메소드
  async updateRates(force = false) {
    // 환율 정보가 없거나, 업데이트 주기가 지났거나, 경과 시간과 무관하게 업데이트를 강제하려는 경우
    try {
      if (
        this.isRatesEmpty() ||
        Date.now() - this.updatedTimeOfCurrencyExchangeRates > this.intervalToUpdate ||
        force
      ) {
        // API로 부터 환율 정보를 가져옵니다.
        const api = new Freecurrencyapi(this.accessKey);
        const data = await api.latest({base_currency: 'EUR'});
        this.baseCurrencyExchangeRates = data.data;
        // 기준 통화에 대한 환율 정보를 설정합니다.
        this.rates = this.getRates(this.baseCurrency);
        // 마지막 업데이트 시간을 현재 시간으로 갱신합니다.
        this.updatedTimeOfCurrencyExchangeRates = Date.now();
        // console.log('환율 정보를 업데이트 했습니다.');
      }
    } catch (error) {
      this.rates = {};
      console.log(error);
    }
  }

  // 통화 목록을 가져오는 메소드
  getCurrencyLists(): string[] {
    if (this.isRatesEmpty()) {
      return [];
    } else {
      return Object.keys(this.baseCurrencyExchangeRates);
    }
  }
  // 기준 통화를 설정하는 메소드
  setBase(baseCurrency: string) {
    // baseRates가 비어있지 않고, baseRates에 baseCurrency 통화가 있는 경우
    if (!this.isRatesEmpty() && this.baseCurrencyExchangeRates.hasOwnProperty(baseCurrency)) {
      this.baseCurrency = baseCurrency; // base를 기준 통화로 설정
      this.rates = this.getRates(baseCurrency); // base에 대한 환율 정보를 가져옵니다.
    }
  }

  // 기준 통화를 반환하는 메소드
  getBase() {
    return this.baseCurrency;
  }

  // 기준 통화에 대한 환율 정보를 가져오는 메소드
  getRates(baseCurrency = 'EUR'): CurrencyExchangeRates {
    // baseRates가 비어있지 않는 경우
    if (!this.isRatesEmpty()) {
      // base가 'EUR'인 경우
      if (baseCurrency === 'EUR') {
        return this.baseCurrencyExchangeRates;
      } else if (this.baseCurrencyExchangeRates.hasOwnProperty(baseCurrency)) {
        const rates: CurrencyExchangeRates = {};
        // baseCurrency 통화에 대한 다른 통화의 환율 정보를 계산합니다.
        for (const currency in this.baseCurrencyExchangeRates) {
          rates[currency] = this.baseCurrencyExchangeRates[currency] / this.baseCurrencyExchangeRates[baseCurrency];
        }
        return rates;
      }
    }
    return {}; // baseRates가 비어있는 경우 빈 객체를 반환
  }

  // 두 통화 간의 환율을 가져오는 메소드 오버로딩
  getRate(from: string, to: string): number; // 두 통화 간의 환율을 가져오는 메소드
  getRate(to: string): number; // 통화의 환율을 가져오는 메소드

  // 두 통화 간의 환율을 가져오는 메소드
  getRate(from: string, to?: string): number {
    // 먼저 환율 정보가 있는지 확인합니다. 정보가 없다면 0 반환
    if (!this.isRatesEmpty()) {
      // 'to'가 없는 경우, 'from'을 기준 통화로 설정하고, 'to'를 'from'으로 설정합니다.
      if (to === undefined) {
        to = from;
        from = this.baseCurrency;
      }
      // 'to'와 'from'이 rates 오브젝트에 있는지 확인
      // 둘 다 있다면 'to'를 'from'으로 나눈 값을 반환
      if (this.rates.hasOwnProperty(to) && this.rates.hasOwnProperty(from)) {
        return this.rates[to] / this.rates[from];
      }
    }
    // 환율 정보가 없거나, 'to'와 'from'이 rates 오브젝트에 없는 경우 0 반환
    return 0;
  }

  // 주어진 두 통화에 대한 환율을 사용해서 금액을 변환하는 메소드
  convert(amount: number, from: string, to: string): number {
    return amount * this.getRate(from, to);
  }

  // 통화의 종류에 따라서 금액을 표시하는 방법이 각기 다르므로, 이에 맞게 금액을 서식화하는 메소드
  format(amount: number, currency: string): string {
    return `${this.currencies[currency].symbol}${amount.toFixed(2)}`;
  }

  // 환율 정보가 있는 통화 데이터를 가져오는 메소드
  getCurrenciesInfo(): CurrencyData {
    // 먼저 환율 정보가 비어있는지 검사합니다.
    // 비어있지 않다면 환율 정보를 사용해 통화 데이터를 가져옵니다.
    if (!this.isRatesEmpty()) {
      // 가져올 통화 데이터를 저장할 빈 객체를 생성합니다.
      const currencies: CurrencyData = {};
      // 환율 정보의 각 통화에 대해 반복문을 실행합니다.
      for (const currency in this.rates) {
        // 통화가 현재 통화 목록에 있는지 확인합니다.
        if (this.currencies.hasOwnProperty(currency)) {
          // 해당 통화가 존재한다면 통화 데이터에 추가합니다.
          currencies[currency] = this.currencies[currency];
        }
      }
      // 완성된 통화 데이터를 반환합니다.
      return currencies;
    } else {
      // 환율 정보가 비어있다면 비어있는 객체를 반환합니다.
      return {};
    }
  }

  getSymbol(currency: string): string {
    // 통화 정보가 비어있지 않다면, 통화 기호를 반환합니다.
    if (!this.isRatesEmpty() && this.currencies.hasOwnProperty(currency) && this.rates.hasOwnProperty(currency)) {
      return this.currencies[currency].symbol;
    } else {
      // 통화 정보가 비어있다면, 빈 문자열을 반환합니다.
      return '';
    }
  }

  getDesc(currency: string): string {
    // 통화 정보가 비어있지 않다면, 통화 설명을 반환합니다.
    if (!this.isRatesEmpty() && this.currencies.hasOwnProperty(currency) && this.rates.hasOwnProperty(currency)) {
      return this.currencies[currency].desc;
    } else {
      // 통화 정보가 비어있다면, 빈 문자열을 반환합니다.
      return '';
    }
  }
}

(async () => {
  // 지연 전에 실행할 코드
  const converter =  new CurrencyConverter();
  await converter.updateRates();

  // 지연 후에 실행할 코드
  console.log(converter.convert(100, 'USD', 'KRW'));
  console.log(converter.format(converter.convert(100, 'USD', 'KRW'), 'KRW'));
  console.log(converter.convert(100, 'USD', 'EUR'));
  console.log(converter.format(converter.convert(100, 'USD', 'EUR'), 'EUR'));
  const ratesEUR = converter.getRates('EUR');
  const ratesUSD = converter.getRates('USD');
  console.log(ratesEUR['KRW']);
  console.log(ratesUSD['KRW']);
})();
