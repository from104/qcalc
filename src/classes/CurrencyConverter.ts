import Freecurrencyapi from '@everapi/freecurrencyapi-js';
import { BaseConverter } from './BaseConverter';

import type { CurrencyExchangeRates, CurrencyData } from '../constants/CurrencyBaseData';
import { currencyBaseData } from '../constants/CurrencyBaseData';
import { checkError } from './utils/ErrorUtils';
import { BigNumber } from './CalculatorMath';

/**
 * CurrencyConverter 클래스
 *
 * 이 클래스는 환율 정보를 관리하고 통화 변환 기능을 제공합니다.
 */
export class CurrencyConverter extends BaseConverter {
  protected readonly converterName = 'CurrencyConverter';

  // FreeCurrency API 접근 키
  private accessKey = process.env.FREECURRENCY_API_KEY;

  // 환율 정보 업데이트 주기 (12시간)
  private updateInterval = 1000 * 60 * 60 * 12;

  // 마지막 환율 정보 업데이트 시간
  private lastUpdatedTime = 0;

  // 기본 환율 정보 (EUR 기준)
  private baseExchangeRates: CurrencyExchangeRates = {};

  // 기준 통화 (기본값: EUR)
  private currentBaseCurrency = 'EUR';

  // 현재 사용 중인 환율 정보
  private currentRates: CurrencyExchangeRates = {};

  // 통화 데이터 (심볼, 설명 등)
  private currencyData: CurrencyData = currencyBaseData;

  /**
   * 생성자
   * 인스턴스 생성 시 환율 정보를 업데이트합니다.
   */
  constructor() {
    super();
    this.updateRates();
  }

  /**
   * 환율 정보가 비어있는지 확인하는 메소드
   * @returns {boolean} 환율 정보가 비어있으면 true, 그렇지 않으면 false
   */
  isRatesEmpty(): boolean {
    return !this.baseExchangeRates || Object.keys(this.baseExchangeRates).length === 0;
  }

  /**
   * 환율 정보를 업데이트하는 메소드
   * @param {boolean} force - 강제 업데이트 여부
   */
  async updateRates(force = false) {
    try {
      if (this.isRatesEmpty() || Date.now() - this.lastUpdatedTime > this.updateInterval || force) {
        const api = new Freecurrencyapi(this.accessKey);
        const data = await api.latest({ base_currency: 'EUR' });
        this.baseExchangeRates = data.data;
        this.currentRates = this.getRates(this.currentBaseCurrency);
        this.lastUpdatedTime = Date.now();
      }
    } catch (error) {
      this.currentRates = {};
      console.log(error);
    }
  }

  /**
   * 사용 가능한 통화 목록을 반환하는 메소드
   * @returns {string[]} 통화 코드 배열
   */
  getAvailableItems(): string[] {
    return this.isRatesEmpty() ? [] : Object.keys(this.baseExchangeRates);
  }

  /**
   * 기준 통화를 설정하는 메소드
   * @param {string} baseCurrency - 새로운 기준 통화
   */
  setBase(baseCurrency: string) {
    checkError(this.isRatesEmpty(), 'error.currency.exchange_rates_not_available');
    checkError(!this.baseExchangeRates[baseCurrency], 'error.currency.invalid_base_currency');
    this.currentBaseCurrency = baseCurrency;
    this.currentBaseCurrency = baseCurrency;
    this.currentRates = this.getRates(baseCurrency);
  }

  /**
   * 현재 기준 통화를 반환하는 메소드
   * @returns {string} 현재 기준 통화
   */
  getBase() {
    return this.currentBaseCurrency;
  }

  /**
   * 특정 기준 통화에 대한 환율 정보를 계산하는 메소드
   * @param {string} baseCurrency - 기준 통화 (기본값: 'EUR')
   * @returns {CurrencyExchangeRates} 계산된 환율 정보
   * @throws {Error} 환율 정보가 비어있거나 유효하지 않은 기준 통화인 경우
   */
  getRates(baseCurrency = 'EUR'): CurrencyExchangeRates {
    if (this.isRatesEmpty()) {
      return {};
    }

    if (baseCurrency === 'EUR') {
      return this.baseExchangeRates;
    }

    checkError(!Object.prototype.hasOwnProperty.call(this.baseExchangeRates, baseCurrency), 'error.currency.invalid_base_currency');

    const baseRate = this.baseExchangeRates[baseCurrency];
    return Object.fromEntries(
      Object.entries(this.baseExchangeRates).map(([currency, rate]) => [currency, rate / (baseRate ?? 1)]),
    );
  }

  /**
   * 두 통화 간의 환율을 가져오는 메소드
   * @param {string} from - 출발 통화
   * @param {string} to - 도착 통화 (선택적)
   * @returns {number} 계산된 환율
   */
  getRate(from: string, to?: string): number {
    checkError(this.isRatesEmpty(), 'error.currency.exchange_rates_not_available');

    const actualTo = to ?? from;
    const actualFrom = to ? from : this.currentBaseCurrency;

    checkError(!this.currentRates[actualTo] || !this.currentRates[actualFrom], 'error.currency.invalid_currency');

    return this.currentRates[actualTo]! / this.currentRates[actualFrom]!;
  }

  /**
   * 주어진 금액을 한 통화에서 다른 통화로 변환하는 메소드
   * @param {BigNumberType} amount - 변환할 금액
   * @param {string} from - 출발 통화
   * @param {string} to - 도착 통화
   * @returns {number} 변환된 금액
   */
  convert(amount: BigNumberType, from: string, to: string): string {
    return BigNumber(amount).times(this.getRate(from, to)).toFixed();
  }

  /**
   * 금액을 특정 통화 형식으로 포맷팅하는 메소드
   * @param {number} amount - 포맷팅할 금액
   * @param {string} currency - 통화 코드
   * @returns {string} 포맷팅된 금액 문자열
   */
  format(amount: BigNumberType, currency: string): string {
    return `${this.currencyData[currency]?.symbol ?? ''}${amount.toFixed(2)}`;
  }

  /**
   * 현재 사용 가능한 통화 정보를 반환하는 메소드
   * @returns {CurrencyData} 통화 정보 객체
   */
  getCurrenciesInfo(): CurrencyData {
    if (this.isRatesEmpty()) {
      return {};
    }

    return Object.keys(this.currentRates).reduce((currencies, currency) => {
      const currencyInfo = this.currencyData[currency];
      if (currencyInfo) {
        currencies[currency] = currencyInfo;
      }
      return currencies;
    }, {} as CurrencyData);
  }

  /**
   * 특정 통화의 심볼을 반환하는 메소드
   * @param {string} currency - 통화 코드
   * @returns {string} 통화 심볼
   */
  getSymbol(currency: string): string {
    checkError(this.isRatesEmpty(), 'error.currency.exchange_rates_not_available');
    checkError(!this.currencyData[currency] || !this.currentRates[currency], `error.currency.invalid_currency: ${currency}`);
    return this.currencyData[currency]!.symbol;
  }

  /**
   * 특정 통화의 설명을 반환하는 메소드
   * @param {string} currency - 통화 코드
   * @returns {string} 통화 설명
   */
  getItemDescription(currency: string): string {
    checkError(!this.currencyData[currency], `error.currency.invalid_currency: ${currency}`);
    return this.currencyData[currency]!.desc;
  }

  /**
   * 입력값이 유효한 통화인지 검사합니다.
   * @param {string} value - 검사할 값
   * @param {string} format - 검사할 통화 코드
   * @returns {boolean} 유효성 여부
   */
  isValid(value: string, format: string): boolean {
    return !this.isRatesEmpty() && !!this.currentRates[format];
  }
}
