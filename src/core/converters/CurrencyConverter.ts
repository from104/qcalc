/**
 * @file CurrencyConverter.ts
 * @description 이 파일은 통화 변환 기능을 제공하는 클래스를 정의합니다.
 *              실시간 환율 정보를 관리하고 통화 간 변환을 지원하며,
 *              Frankfurter API(ECB 공식)와 fawazahmed0 currency-api를 통해
 *              최신 환율 데이터를 주기적으로 업데이트합니다.
 *              두 소스를 병합하여 광범위한 통화 커버리지를 제공합니다.
 */

import { BaseConverter } from './BaseConverter';

import type { CurrencyExchangeRates, CurrencyData } from '../../constants/CurrencyBaseData';
import { currencyBaseData } from '../../constants/CurrencyBaseData';
import fallbackSnapshot from '../../constants/CurrencyFallbackRates.json';
import { checkError } from '../../utils/ErrorUtils';
import { toBigNumber } from '../calculator/CalculatorMath';

const FRANKFURTER_URL = 'https://api.frankfurter.dev/v1/latest?base=EUR';
const FAWAZAHMED0_URL = 'https://latest.currency-api.pages.dev/v1/currencies/eur.json';
const FAWAZAHMED0_FALLBACK_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json';

/**
 * Frankfurter API에서 EUR 기준 환율을 가져옵니다.
 * @returns EUR 기준 환율 객체 (통화코드: 환율)
 */
async function fetchFromFrankfurter(): Promise<CurrencyExchangeRates> {
  const response = await fetch(FRANKFURTER_URL);
  if (!response.ok) throw new Error(`Frankfurter API error: ${response.status}`);
  const data = await response.json();
  const rates: CurrencyExchangeRates = {};
  for (const [key, value] of Object.entries(data.rates as Record<string, number>)) {
    rates[key] = String(value);
  }
  return rates;
}

/**
 * fawazahmed0 currency-api에서 EUR 기준 환율을 가져옵니다.
 * 키를 대문자로 매핑하여 반환합니다.
 * @returns EUR 기준 환율 객체 (통화코드: 환율)
 */
async function fetchFromFawazahmed0(): Promise<CurrencyExchangeRates> {
  let response = await fetch(FAWAZAHMED0_URL);
  if (!response.ok) {
    response = await fetch(FAWAZAHMED0_FALLBACK_URL);
    if (!response.ok) throw new Error(`fawazahmed0 API error: ${response.status}`);
  }
  const data = await response.json();
  const eurRates = data.eur as Record<string, number>;
  const rates: CurrencyExchangeRates = {};
  for (const [key, value] of Object.entries(eurRates)) {
    rates[key.toUpperCase()] = String(value);
  }
  return rates;
}

/**
 * CurrencyConverter 클래스
 *
 * 이 클래스는 환율 정보를 관리하고 통화 변환 기능을 제공합니다.
 */
export class CurrencyConverter extends BaseConverter {
  protected readonly converterName = 'CurrencyConverter';

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
   * 빌드 시점에 저장된 스냅샷 환율을 로드합니다.
   * 네트워크 미연결 + 캐시 없음일 때 호출됩니다.
   */
  private loadFallbackRates() {
    const filteredRates: CurrencyExchangeRates = {};
    for (const [key, value] of Object.entries(fallbackSnapshot.rates)) {
      if (this.currencyData[key] && value) {
        filteredRates[key] = value;
      }
    }
    this.baseExchangeRates = filteredRates;
    this.currentRates = this.getRates(this.currentBaseCurrency);
  }

  /**
   * 환율 정보를 업데이트하는 메소드
   * Frankfurter API(ECB 공식)와 fawazahmed0 API를 병렬 호출하여
   * Frankfurter 결과를 우선 적용하고 fawazahmed0 결과로 나머지를 보충합니다.
   * @param {boolean} force - 강제 업데이트 여부
   */
  async updateRates(force = false) {
    try {
      if (this.isRatesEmpty() || Date.now() - this.lastUpdatedTime > this.updateInterval || force) {
        const [frankfurterResult, fawazahmedResult] = await Promise.allSettled([
          fetchFromFrankfurter(),
          fetchFromFawazahmed0(),
        ]);

        const frankfurterRates = frankfurterResult.status === 'fulfilled' ? frankfurterResult.value : null;
        const fawazahmedRates = fawazahmedResult.status === 'fulfilled' ? fawazahmedResult.value : null;

        if (!frankfurterRates && !fawazahmedRates) {
          if (this.isRatesEmpty()) {
            // 캐시도 없으면 빌드 시점 스냅샷을 사용
            console.warn('CurrencyConverter: Both API sources failed, using build-time fallback rates');
            this.loadFallbackRates();
          } else {
            console.warn('CurrencyConverter: Both API sources failed, keeping cached rates');
          }
          return;
        }

        // fawazahmed0 결과를 기본으로 깔고, Frankfurter 결과로 덮어쓰기 (우선)
        const mergedRates: CurrencyExchangeRates = {
          ...(fawazahmedRates ?? {}),
          ...(frankfurterRates ?? {}),
        };

        // EUR 자체는 API에 포함되지 않으므로 명시적으로 추가
        mergedRates['EUR'] = '1';

        // currencyBaseData에 정의된 통화만 필터링
        const filteredRates: CurrencyExchangeRates = {};
        for (const [key, value] of Object.entries(mergedRates)) {
          if (this.currencyData[key] && value) {
            filteredRates[key] = value;
          }
        }

        this.baseExchangeRates = filteredRates;
        this.currentRates = this.getRates(this.currentBaseCurrency);
        this.lastUpdatedTime = Date.now();
      }
    } catch (error) {
      // 예상치 못한 에러 시에도 기존 캐시 유지
      if (this.isRatesEmpty()) {
        this.currentRates = {};
      }
      console.error('CurrencyConverter: Unexpected error during rate update', error);
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

    checkError(
      !Object.prototype.hasOwnProperty.call(this.baseExchangeRates, baseCurrency),
      'error.currency.invalid_base_currency',
    );

    const baseRate = this.baseExchangeRates[baseCurrency];
    return Object.fromEntries(
      Object.entries(this.baseExchangeRates).map(([currency, rate]) => [
        currency,
        toBigNumber(rate).div(toBigNumber(baseRate)).toFixed(),
      ]),
    );
  }

  /**
   * 두 통화 간의 환율을 가져오는 메소드
   * @param {string} from - 출발 통화
   * @param {string} to - 도착 통화 (선택적)
   * @returns {number} 계산된 환율
   */
  getRate(from: string, to?: string): BigNumber {
    checkError(this.isRatesEmpty(), 'error.currency.exchange_rates_not_available');

    const actualTo = to ?? from;
    const actualFrom = to ? from : this.currentBaseCurrency;

    checkError(!this.currentRates[actualTo] || !this.currentRates[actualFrom], 'error.currency.invalid_currency');

    const toRate = this.currentRates[actualTo] ?? 0;
    const fromRate = this.currentRates[actualFrom] ?? 1;

    return toBigNumber(toRate).div(toBigNumber(fromRate));
  }

  /**
   * 주어진 금액을 한 통화에서 다른 통화로 변환하는 메소드
   * @param {BigNumber} amount - 변환할 금액
   * @param {string} from - 출발 통화
   * @param {string} to - 도착 통화
   * @returns {string} 변환된 금액
   */
  convert(amount: BigNumber, from: string, to: string): BigNumber {
    const rate = this.getRate(from, to);
    return toBigNumber(amount.toString()).times(rate);
  }

  /**
   * 금액을 특정 통화 형식으로 포맷팅하는 메소드
   * @param {number} amount - 포맷팅할 금액
   * @param {string} currency - 통화 코드
   * @returns {string} 포맷팅된 금액 문자열
   */
  format(amount: BigNumber, currency: string): string {
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
    checkError(
      !this.currencyData[currency] || !this.currentRates[currency],
      `error.currency.invalid_currency: ${currency}`,
    );
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
