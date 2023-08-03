import axios from 'axios';

// 환율 정보를 저장하는 인터페이스
interface Currency {
  [currency: string]: {
    desc: string;
    symbol: string;
  };
}

// 환율을 저장하는 인터페이스
interface Rates {
  [key: string]: number;
}

// 환율 정보를 저장하는 타입
type CurrencyData = Currency;

// 환율에 대한 기본 데이터
const currencyBaseData: CurrencyData = {
  EUR: { desc: 'Euro', symbol: '€' },
  USD: { desc: 'United States Dollar', symbol: '$' },
  KRW: { desc: 'South Korean Won', symbol: '₩' },
  GBP: { desc: 'British Pound Sterling', symbol: '£' },
  JPY: { desc: 'Japanese Yen', symbol: '¥' },
  CNY: { desc: 'Chinese Yuan', symbol: '¥' },
  AED: { desc: 'United Arab Emirates Dirham', symbol: 'د.إ' },
  AFN: { desc: 'Afghan Afghani', symbol: '؋' },
  ALL: { desc: 'Albanian Lek', symbol: 'L' },
  AMD: { desc: 'Armenian Dram', symbol: '֏' },
  ANG: { desc: 'Netherlands Antillean Guilder', symbol: 'ƒ' },
  AOA: { desc: 'Angolan Kwanza', symbol: 'Kz' },
  ARS: { desc: 'Argentine Peso', symbol: '$' },
  AUD: { desc: 'Australian Dollar', symbol: 'A$' },
  AWG: { desc: 'Aruban Florin', symbol: 'ƒ' },
  AZN: { desc: 'Azerbaijani Manat', symbol: '₼' },
  BAM: { desc: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM' },
  BBD: { desc: 'Barbadian Dollar', symbol: 'Bds$' },
  BDT: { desc: 'Bangladeshi Taka', symbol: '৳' },
  BGN: { desc: 'Bulgarian Lev', symbol: 'лв' },
  BHD: { desc: 'Bahraini Dinar', symbol: 'ب.د' },
  BIF: { desc: 'Burundian Franc', symbol: 'FBu' },
  BMD: { desc: 'Bermudan Dollar', symbol: 'BD$' },
  BND: { desc: 'Brunei Dollar', symbol: 'B$' },
  BOB: { desc: 'Bolivian Boliviano', symbol: 'Bs' },
  BRL: { desc: 'Brazilian Real', symbol: 'R$' },
  BSD: { desc: 'Bahamian Dollar', symbol: 'B$' },
  BTC: { desc: 'Bitcoin', symbol: '₿' },
  BTN: { desc: 'Bhutanese Ngultrum', symbol: 'Nu.' },
  BWP: { desc: 'Botswanan Pula', symbol: 'P' },
  BYN: { desc: 'New Belarusian Ruble', symbol: 'Br' },
  BYR: { desc: 'Belarusian Ruble', symbol: 'Br' },
  BZD: { desc: 'Belize Dollar', symbol: 'BZ$' },
  CAD: { desc: 'Canadian Dollar', symbol: 'CA$' },
  CDF: { desc: 'Congolese Franc', symbol: 'FC' },
  CHF: { desc: 'Swiss Franc', symbol: 'CHF' },
  CLF: { desc: 'Chilean Unit of Account (UF)', symbol: 'UF' },
  CLP: { desc: 'Chilean Peso', symbol: '$' },
  COP: { desc: 'Colombian Peso', symbol: 'COL$' },
  CRC: { desc: 'Costa Rican Colón', symbol: '₡' },
  CUC: { desc: 'Cuban Convertible Peso', symbol: '$' },
  CUP: { desc: 'Cuban Peso', symbol: '₱' },
  CVE: { desc: 'Cape Verdean Escudo', symbol: 'Esc' },
  CZK: { desc: 'Czech Republic Koruna', symbol: 'Kč' },
  DJF: { desc: 'Djiboutian Franc', symbol: 'Fdj' },
  DKK: { desc: 'Danish Krone', symbol: 'kr' },
  DOP: { desc: 'Dominican Peso', symbol: 'RD$' },
  DZD: { desc: 'Algerian Dinar', symbol: 'د.ج' },
  EGP: { desc: 'Egyptian Pound', symbol: '£' },
  ERN: { desc: 'Eritrean Nakfa', symbol: 'Nfk' },
  ETB: { desc: 'Ethiopian Birr', symbol: 'Br' },
  FJD: { desc: 'Fijian Dollar', symbol: 'FJ$' },
  FKP: { desc: 'Falkland Islands Pound', symbol: '£' },
  GEL: { desc: 'Georgian Lari', symbol: '₾' },
  GGP: { desc: 'Guernsey Pound', symbol: '£' },
  GHS: { desc: 'Ghanaian Cedi', symbol: 'GH₵' },
  GIP: { desc: 'Gibraltar Pound', symbol: '£' },
  GMD: { desc: 'Gambian Dalasi', symbol: 'D' },
  GNF: { desc: 'Guinean Franc', symbol: 'FG' },
  GTQ: { desc: 'Guatemalan Quetzal', symbol: 'Q' },
  GYD: { desc: 'Guyanaese Dollar', symbol: 'GY$' },
  HKD: { desc: 'Hong Kong Dollar', symbol: 'HK$' },
  HNL: { desc: 'Honduran Lempira', symbol: 'L' },
  HRK: { desc: 'Croatian Kuna', symbol: 'kn' },
  HTG: { desc: 'Haitian Gourde', symbol: 'G' },
  HUF: { desc: 'Hungarian Forint', symbol: 'Ft' },
  IDR: { desc: 'Indonesian Rupiah', symbol: 'Rp' },
  ILS: { desc: 'Israeli New Sheqel', symbol: '₪' },
  IMP: { desc: 'Manx Pound', symbol: '£' },
  INR: { desc: 'Indian Rupee', symbol: '₹' },
  IQD: { desc: 'Iraqi Dinar', symbol: 'ع.د' },
  IRR: { desc: 'Iranian Rial', symbol: '﷼' },
  ISK: { desc: 'Icelandic Króna', symbol: 'kr' },
  JEP: { desc: 'Jersey Pound', symbol: '£' },
  JMD: { desc: 'Jamaican Dollar', symbol: 'J$' },
  JOD: { desc: 'Jordanian Dinar', symbol: 'د.ا' },
  KES: { desc: 'Kenyan Shilling', symbol: 'KSh' },
  KGS: { desc: 'Kyrgystani Som', symbol: 'с' },
  KHR: { desc: 'Cambodian Riel', symbol: '៛' },
  KMF: { desc: 'Comorian Franc', symbol: 'CF' },
  KPW: { desc: 'North Korean Won', symbol: '₩' },
  KWD: { desc: 'Kuwaiti Dinar', symbol: 'د.ك' },
  KYD: { desc: 'Cayman Islands Dollar', symbol: 'CI$' },
  KZT: { desc: 'Kazakhstani Tenge', symbol: '₸' },
  LAK: { desc: 'Laotian Kip', symbol: '₭' },
  LBP: { desc: 'Lebanese Pound', symbol: 'ل.ل' },
  LKR: { desc: 'Sri Lankan Rupee', symbol: '₨' },
  LRD: { desc: 'Liberian Dollar', symbol: 'L$' },
  LSL: { desc: 'Lesotho Loti', symbol: 'L' },
  LTL: { desc: 'Lithuanian Litas', symbol: 'Lt' },
  LVL: { desc: 'Latvian Lats', symbol: 'Ls' },
  LYD: { desc: 'Libyan Dinar', symbol: 'ل.د' },
  MAD: { desc: 'Moroccan Dirham', symbol: 'د.م.' },
  MDL: { desc: 'Moldovan Leu', symbol: 'L' },
  MGA: { desc: 'Malagasy Ariary', symbol: 'Ar' },
  MKD: { desc: 'Macedonian Denar', symbol: 'ден' },
  MMK: { desc: 'Myanma Kyat', symbol: 'K' },
  MNT: { desc: 'Mongolian Tugrik', symbol: '₮' },
  MOP: { desc: 'Macanese Pataca', symbol: 'MOP$' },
  MRO: { desc: 'Mauritanian Ouguiya', symbol: 'UM' },
  MUR: { desc: 'Mauritian Rupee', symbol: '₨' },
  MVR: { desc: 'Maldivian Rufiyaa', symbol: 'Rf' },
  MWK: { desc: 'Malawian Kwacha', symbol: 'MK' },
  MXN: { desc: 'Mexican Peso', symbol: 'MX$' },
  MYR: { desc: 'Malaysian Ringgit', symbol: 'RM' },
  MZN: { desc: 'Mozambican Metical', symbol: 'MT' },
  NAD: { desc: 'Namibian Dollar', symbol: 'N$' },
  NGN: { desc: 'Nigerian Naira', symbol: '₦' },
  NIO: { desc: 'Nicaraguan Córdoba', symbol: 'C$' },
  NOK: { desc: 'Norwegian Krone', symbol: 'kr' },
  NPR: { desc: 'Nepalese Rupee', symbol: '₨' },
  NZD: { desc: 'New Zealand Dollar', symbol: 'NZ$' },
  OMR: { desc: 'Omani Rial', symbol: 'ر.ع.' },
  PAB: { desc: 'Panamanian Balboa', symbol: 'B/.' },
  PEN: { desc: 'Peruvian Nuevo Sol', symbol: 'S/.' },
  PGK: { desc: 'Papua New Guinean Kina', symbol: 'K' },
  PHP: { desc: 'Philippine Peso', symbol: '₱' },
  PKR: { desc: 'Pakistani Rupee', symbol: '₨' },
  PLN: { desc: 'Polish Zloty', symbol: 'zł' },
  PYG: { desc: 'Paraguayan Guarani', symbol: '₲' },
  QAR: { desc: 'Qatari Rial', symbol: '﷼' },
  RON: { desc: 'Romanian Leu', symbol: 'lei' },
  RSD: { desc: 'Serbian Dinar', symbol: 'дин.' },
  RUB: { desc: 'Russian Ruble', symbol: '₽' },
  RWF: { desc: 'Rwandan Franc', symbol: 'FRw' },
  SAR: { desc: 'Saudi Riyal', symbol: '﷼' },
  SBD: { desc: 'Solomon Islands Dollar', symbol: 'SI$' },
  SCR: { desc: 'Seychellois Rupee', symbol: '₨' },
  SDG: { desc: 'Sudanese Pound', symbol: 'ج.س.' },
  SEK: { desc: 'Swedish Krona', symbol: 'kr' },
  SGD: { desc: 'Singapore Dollar', symbol: 'S$' },
  SHP: { desc: 'Saint Helena Pound', symbol: '£' },
  SLE: { desc: 'Sierra Leonean Leone', symbol: 'Le' },
  SLL: { desc: 'Sierra Leonean Leone', symbol: 'Le' },
  SOS: { desc: 'Somali Shilling', symbol: 'S' },
  SRD: { desc: 'Surinamese Dollar', symbol: 'SR$' },
  STD: { desc: 'São Tomé and Príncipe Dobra', symbol: 'Db' },
  SVC: { desc: 'Salvadoran Colón', symbol: '$' },
  SYP: { desc: 'Syrian Pound', symbol: '£' },
  SZL: { desc: 'Swazi Lilangeni', symbol: 'E' },
  THB: { desc: 'Thai Baht', symbol: '฿' },
  TJS: { desc: 'Tajikistani Somoni', symbol: 'TJS' },
  TMT: { desc: 'Turkmenistani Manat', symbol: 'TMT' },
  TND: { desc: 'Tunisian Dinar', symbol: 'TND' },
  TOP: { desc: 'Tongan Paʻanga', symbol: 'TOP' },
  TRY: { desc: 'Turkish Lira', symbol: 'TRY' },
  TTD: { desc: 'Trinidad and Tobago Dollar', symbol: 'TT$' },
  TWD: { desc: 'New Taiwan Dollar', symbol: 'NT$' },
  TZS: { desc: 'Tanzanian Shilling', symbol: 'TZS' },
  UAH: { desc: 'Ukrainian Hryvnia', symbol: '₴' },
  UGX: { desc: 'Ugandan Shilling', symbol: 'UGX' },
  UYU: { desc: 'Uruguayan Peso', symbol: 'UY$' },
  UZS: { desc: 'Uzbekistan Som', symbol: 'UZS' },
  VEF: { desc: 'Venezuelan Bolívar Fuerte', symbol: 'VEF' },
  VES: { desc: 'Sovereign Bolivar', symbol: 'VES' },
  VND: { desc: 'Vietnamese Dong', symbol: '₫' },
  VUV: { desc: 'Vanuatu Vatu', symbol: 'Vt' },
  WST: { desc: 'Samoan Tala', symbol: 'WS$' },
  XAF: { desc: 'CFA Franc BEAC', symbol: 'FCFA' },
  XAG: { desc: 'Silver (troy ounce)', symbol: 'XAG' },
  XAU: { desc: 'Gold (troy ounce)', symbol: 'XAU' },
  XCD: { desc: 'East Caribbean Dollar', symbol: 'EC$' },
  XDR: { desc: 'Special Drawing Rights', symbol: 'SDR' },
  XOF: { desc: 'CFA Franc BCEAO', symbol: 'CFA' },
  XPF: { desc: 'CFP Franc', symbol: 'CFPF' },
  YER: { desc: 'Yemeni Rial', symbol: '﷼' },
  ZAR: { desc: 'South African Rand', symbol: 'R' },
  ZMK: { desc: 'Zambian Kwacha (pre-2013)', symbol: 'ZMK' },
  ZMW: { desc: 'Zambian Kwacha', symbol: 'ZMW' },
  ZWL: { desc: 'Zimbabwean Dollar', symbol: 'ZWL' }
};

// 환율 정보를 가져오는 API 클래스
class ExchangeRatesAPI {
  //
  private static API_URL = 'http://api.exchangeratesapi.io/v1';
  private static ACCESS_KEY = 'a761d5c309cf3d8f67106700be92c857';

  // API에서 모든 환율 정보를 가져오는 메소드
  async getRates(base = 'EUR'): Promise<Rates> {
    try {
      // API로부터 환율 정보를 가져옵니다.
      const response = await axios.get(
        `${ExchangeRatesAPI.API_URL}/latest?access_key=${ExchangeRatesAPI.ACCESS_KEY}&base=${base}`
      );
      // 환율 정보를 반환합니다.
      return response.data.rates;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // console.error(error.response.data); // 에러 응답의 내용을 출력합니다.
      return error.response.data;
    }
  }
}

// 환율 정보를 사용하는 클래스
class CurrencyConverter {
  private api = new ExchangeRatesAPI(); // 환율 정보를 가져오는 APIx
  private intervalToUpdate = 1000 * 60 * 60 * 12; // 환율 정보를 업데이트하는 주기
  private updatedTimeOfRates = 0; // 환율 정보를 업데이트한 시간
  private baseRates: Rates = {}; // 기본 환율 정보 (EUR)
  private base = 'EUR'; // 환율 정보의 기준 통화
  private rates: Rates = {}; // 환율 정보
  private currencies: CurrencyData = currencyBaseData; // 환율 정보를 사용하는 통화 데이터

  // 생성자
  constructor() {
    // 환율 정보를 업데이트합니다.
    this.updateRates();
  }

  // baseRates가 비어있는지 확인하는 메소드
  isRatesEmpty() {
    // baseRates가 비어있다면 true를 반환합니다.
    return Object.keys(this.baseRates).length === 0;
  }

  // 환율 정보를 업데이트하는 메소드
  async updateRates(force = false) {
    // 환율 정보가 없거나, 업데이트 주기가 지났거나, 경과 시간과 무관하게 업데이트를 강제하려는 경우
    if (this.isRatesEmpty() || Date.now() - this.updatedTimeOfRates > this.intervalToUpdate || force) {
      try {
        // API로 부터 환율 정보를 가져옵니다.
        this.baseRates = await this.api.getRates();
        // 기준 통화에 대한 환율 정보를 설정합니다.
        this.rates = this.getRates(this.base);
        // 마지막 업데이트 시간을 현재 시간으로 갱신합니다.
        this.updatedTimeOfRates = Date.now();
        // console.log('환율 정보를 업데이트 했습니다.');
      } catch (error) {
        this.rates = {};
        console.error(error);
      }
    }
  }

  // 통화 목록을 가져오는 메소드
  getCurrencyLists(): string[] {
    if (this.isRatesEmpty()) {
      return [];
    } else {
      return Object.keys(this.baseRates);
    }
  }
  // 기준 통화를 설정하는 메소드
  setBase(base: string) {
    // baseRates가 비어있지 않고, baseRates에 base 통화가 있는 경우
    if (!this.isRatesEmpty() && this.baseRates.hasOwnProperty(base)) {
      this.base = base; // base를 기준 통화로 설정
      this.rates = this.getRates(base); // base에 대한 환율 정보를 가져옵니다.
    }
  }

  // 기준 통화를 반환하는 메소드
  getBase() {
    return this.base;
  }

  // 기준 통화에 대한 환율 정보를 가져오는 메소드
  getRates(base = 'EUR'): Rates {
    // baseRates가 비어있지 않는 경우
    if (!this.isRatesEmpty()) {
      // base가 'EUR'인 경우
      if (base === 'EUR') {
        return this.baseRates;
      } else if (this.baseRates.hasOwnProperty(base)) {
        const rates: Rates = {};
        // base 통화에 대한 다른 통화의 환율 정보를 계산합니다.
        for (const currency in this.baseRates) {
          rates[currency] = this.baseRates[currency] / this.baseRates[base];
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
        from = this.base;
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

// export default CurrencyConverter;
export { CurrencyConverter };

// (async () => {
//   // 지연 전에 실행할 코드
//   const converter =  new CurrencyConverter();
//   await converter.updateRates();

//   // 지연 후에 실행할 코드
//   console.log(converter.convert(100, 'USD', 'KRW'));
//   console.log(converter.format(converter.convert(100, 'USD', 'KRW'), 'KRW'));
//   console.log(converter.convert(100, 'USD', 'EUR'));
//   console.log(converter.format(converter.convert(100, 'USD', 'EUR'), 'EUR'));
//   const ratesEUR = converter.getRates('EUR');
//   const ratesUSD = converter.getRates('USD');
//   console.log(ratesEUR['KRW']);
//   console.log(ratesUSD['KRW']);
// })();
