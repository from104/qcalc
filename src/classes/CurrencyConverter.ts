import axios from 'axios';

// 환율 정보를 저장하는 인터페이스
interface Currency {
  [currency: string]: {
    name: string;
    symbol: string;
    country: string;
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
  USD: { name: 'United States Dollar', symbol: '$', country: 'United States' },
  KRW: { name: 'South Korean Won', symbol: '₩', country: 'South Korea' },
  EUR: { name: 'Euro', symbol: '€', country: 'European Union' },
  GBP: {
    name: 'British Pound Sterling',
    symbol: '£',
    country: 'United Kingdom',
  },
  JPY: { name: 'Japanese Yen', symbol: '¥', country: 'Japan' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', country: 'China' },
  AED: {
    name: 'United Arab Emirates Dirham',
    symbol: 'د.إ',
    country: 'United Arab Emirates',
  },
  AFN: { name: 'Afghan Afghani', symbol: '؋', country: 'Afghanistan' },
  ALL: { name: 'Albanian Lek', symbol: 'L', country: 'Albania' },
  AMD: { name: 'Armenian Dram', symbol: '֏', country: 'Armenia' },
  ANG: {
    name: 'Netherlands Antillean Guilder',
    symbol: 'ƒ',
    country: 'Curaçao and Sint Maarten',
  },
  AOA: { name: 'Angolan Kwanza', symbol: 'Kz', country: 'Angola' },
  ARS: { name: 'Argentine Peso', symbol: '$', country: 'Argentina' },
  AWG: { name: 'Aruban Florin', symbol: 'ƒ', country: 'Aruba' },
  AZN: { name: 'Azerbaijani Manat', symbol: '₼', country: 'Azerbaijan' },
  BAM: {
    name: 'Bosnia-Herzegovina Convertible Mark',
    symbol: 'KM',
    country: 'Bosnia and Herzegovina',
  },
  BBD: { name: 'Barbadian Dollar', symbol: 'Bds$', country: 'Barbados' },
  BDT: { name: 'Bangladeshi Taka', symbol: '৳', country: 'Bangladesh' },
  BGN: { name: 'Bulgarian Lev', symbol: 'лв', country: 'Bulgaria' },
  BHD: { name: 'Bahraini Dinar', symbol: 'ب.د', country: 'Bahrain' },
  BIF: { name: 'Burundian Franc', symbol: 'FBu', country: 'Burundi' },
  BMD: { name: 'Bermudan Dollar', symbol: 'BD$', country: 'Bermuda' },
  BND: { name: 'Brunei Dollar', symbol: 'B$', country: 'Brunei' },
  BOB: { name: 'Bolivian Boliviano', symbol: 'Bs', country: 'Bolivia' },
  BRL: { name: 'Brazilian Real', symbol: 'R$', country: 'Brazil' },
  BSD: { name: 'Bahamian Dollar', symbol: 'B$', country: 'Bahamas' },
  BTC: { name: 'Bitcoin', symbol: '₿', country: 'Virtual Currency' },
  BTN: { name: 'Bhutanese Ngultrum', symbol: 'Nu.', country: 'Bhutan' },
  BWP: { name: 'Botswanan Pula', symbol: 'P', country: 'Botswana' },
  BYN: { name: 'New Belarusian Ruble', symbol: 'Br', country: 'Belarus' },
  BYR: { name: 'Belarusian Ruble', symbol: 'Br', country: 'Belarus' },
  BZD: { name: 'Belize Dollar', symbol: 'BZ$', country: 'Belize' },
  CDF: {
    name: 'Congolese Franc',
    symbol: 'FC',
    country: 'Democratic Republic of the Congo',
  },
  CLF: { name: 'Chilean Unit of Account (UF)', symbol: 'UF', country: 'Chile' },
  CLP: { name: 'Chilean Peso', symbol: '$', country: 'Chile' },
  COP: { name: 'Colombian Peso', symbol: 'COL$', country: 'Colombia' },
  CRC: { name: 'Costa Rican Colón', symbol: '₡', country: 'Costa Rica' },
  CUC: { name: 'Cuban Convertible Peso', symbol: '$', country: 'Cuba' },
  CUP: { name: 'Cuban Peso', symbol: '₱', country: 'Cuba' },
  CVE: { name: 'Cape Verdean Escudo', symbol: 'Esc', country: 'Cape Verde' },
  CZK: {
    name: 'Czech Republic Koruna',
    symbol: 'Kč',
    country: 'Czech Republic',
  },
  DJF: { name: 'Djiboutian Franc', symbol: 'Fdj', country: 'Djibouti' },
  DKK: { name: 'Danish Krone', symbol: 'kr', country: 'Denmark' },
  DOP: { name: 'Dominican Peso', symbol: 'RD$', country: 'Dominican Republic' },
  DZD: { name: 'Algerian Dinar', symbol: 'د.ج', country: 'Algeria' },
  EGP: { name: 'Egyptian Pound', symbol: '£', country: 'Egypt' },
  ERN: { name: 'Eritrean Nakfa', symbol: 'Nfk', country: 'Eritrea' },
  ETB: { name: 'Ethiopian Birr', symbol: 'Br', country: 'Ethiopia' },
  FJD: { name: 'Fijian Dollar', symbol: 'FJ$', country: 'Fiji' },
  FKP: {
    name: 'Falkland Islands Pound',
    symbol: '£',
    country: 'Falkland Islands',
  },
  GEL: { name: 'Georgian Lari', symbol: '₾', country: 'Georgia' },
  GHS: { name: 'Ghanaian Cedi', symbol: 'GH₵', country: 'Ghana' },
  GIP: { name: 'Gibraltar Pound', symbol: '£', country: 'Gibraltar' },
  GMD: { name: 'Gambian Dalasi', symbol: 'D', country: 'Gambia' },
  GNF: { name: 'Guinean Franc', symbol: 'FG', country: 'Guinea' },
  GTQ: { name: 'Guatemalan Quetzal', symbol: 'Q', country: 'Guatemala' },
  GYD: { name: 'Guyanaese Dollar', symbol: 'GY$', country: 'Guyana' },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$', country: 'Hong Kong' },
  HNL: { name: 'Honduran Lempira', symbol: 'L', country: 'Honduras' },
  HRK: { name: 'Croatian Kuna', symbol: 'kn', country: 'Croatia' },
  HTG: { name: 'Haitian Gourde', symbol: 'G', country: 'Haiti' },
  HUF: { name: 'Hungarian Forint', symbol: 'Ft', country: 'Hungary' },
  IDR: { name: 'Indonesian Rupiah', symbol: 'Rp', country: 'Indonesia' },
  ILS: { name: 'Israeli New Sheqel', symbol: '₪', country: 'Israel' },
  IMP: { name: 'Manx Pound', symbol: '£', country: 'Isle of Man' },
  IQD: { name: 'Iraqi Dinar', symbol: 'ع.د', country: 'Iraq' },
  IRR: { name: 'Iranian Rial', symbol: '﷼', country: 'Iran' },
  ISK: { name: 'Icelandic Króna', symbol: 'kr', country: 'Iceland' },
  JEP: { name: 'Jersey Pound', symbol: '£', country: 'Jersey' },
  JMD: { name: 'Jamaican Dollar', symbol: 'J$', country: 'Jamaica' },
  JOD: { name: 'Jordanian Dinar', symbol: 'د.ا', country: 'Jordan' },
  KES: { name: 'Kenyan Shilling', symbol: 'KSh', country: 'Kenya' },
  KGS: { name: 'Kyrgystani Som', symbol: 'с', country: 'Kyrgyzstan' },
  KHR: { name: 'Cambodian Riel', symbol: '៛', country: 'Cambodia' },
  KMF: { name: 'Comorian Franc', symbol: 'CF', country: 'Comoros' },
  KPW: { name: 'North Korean Won', symbol: '₩', country: 'North Korea' },
  KWD: { name: 'Kuwaiti Dinar', symbol: 'د.ك', country: 'Kuwait' },
  KYD: {
    name: 'Cayman Islands Dollar',
    symbol: 'CI$',
    country: 'Cayman Islands',
  },
  KZT: { name: 'Kazakhstani Tenge', symbol: '₸', country: 'Kazakhstan' },
  LAK: { name: 'Laotian Kip', symbol: '₭', country: 'Laos' },
  LBP: { name: 'Lebanese Pound', symbol: 'ل.ل', country: 'Lebanon' },
  LKR: { name: 'Sri Lankan Rupee', symbol: '₨', country: 'Sri Lanka' },
  LRD: { name: 'Liberian Dollar', symbol: 'L$', country: 'Liberia' },
  LSL: { name: 'Lesotho Loti', symbol: 'L', country: 'Lesotho' },
  LTL: { name: 'Lithuanian Litas', symbol: 'Lt', country: 'Lithuania' },
  LVL: { name: 'Latvian Lats', symbol: 'Ls', country: 'Latvia' },
  LYD: { name: 'Libyan Dinar', symbol: 'ل.د', country: 'Libya' },
  MAD: { name: 'Moroccan Dirham', symbol: 'د.م.', country: 'Morocco' },
  MDL: { name: 'Moldovan Leu', symbol: 'L', country: 'Moldova' },
  MGA: { name: 'Malagasy Ariary', symbol: 'Ar', country: 'Madagascar' },
  MKD: { name: 'Macedonian Denar', symbol: 'ден', country: 'North Macedonia' },
  MMK: { name: 'Myanma Kyat', symbol: 'K', country: 'Myanmar' },
  MNT: { name: 'Mongolian Tugrik', symbol: '₮', country: 'Mongolia' },
  MOP: { name: 'Macanese Pataca', symbol: 'MOP$', country: 'Macau' },
  MRO: { name: 'Mauritanian Ouguiya', symbol: 'UM', country: 'Mauritania' },
  MUR: { name: 'Mauritian Rupee', symbol: '₨', country: 'Mauritius' },
  MVR: { name: 'Maldivian Rufiyaa', symbol: 'Rf', country: 'Maldives' },
  MWK: { name: 'Malawian Kwacha', symbol: 'MK', country: 'Malawi' },
  MXN: { name: 'Mexican Peso', symbol: 'MX$', country: 'Mexico' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM', country: 'Malaysia' },
  MZN: { name: 'Mozambican Metical', symbol: 'MT', country: 'Mozambique' },
  NAD: { name: 'Namibian Dollar', symbol: 'N$', country: 'Namibia' },
  NGN: { name: 'Nigerian Naira', symbol: '₦', country: 'Nigeria' },
  NIO: { name: 'Nicaraguan Córdoba', symbol: 'C$', country: 'Nicaragua' },
  NOK: { name: 'Norwegian Krone', symbol: 'kr', country: 'Norway' },
  NPR: { name: 'Nepalese Rupee', symbol: '₨', country: 'Nepal' },
  NZD: { name: 'New Zealand Dollar', symbol: 'NZ$', country: 'New Zealand' },
  OMR: { name: 'Omani Rial', symbol: 'ر.ع.', country: 'Oman' },
  PAB: { name: 'Panamanian Balboa', symbol: 'B/.', country: 'Panama' },
  PEN: { name: 'Peruvian Nuevo Sol', symbol: 'S/.', country: 'Peru' },
  PGK: {
    name: 'Papua New Guinean Kina',
    symbol: 'K',
    country: 'Papua New Guinea',
  },
  PHP: { name: 'Philippine Peso', symbol: '₱', country: 'Philippines' },
  PKR: { name: 'Pakistani Rupee', symbol: '₨', country: 'Pakistan' },
  PLN: { name: 'Polish Zloty', symbol: 'zł', country: 'Poland' },
  PYG: { name: 'Paraguayan Guarani', symbol: '₲', country: 'Paraguay' },
  QAR: { name: 'Qatari Rial', symbol: '﷼', country: 'Qatar' },
  RON: { name: 'Romanian Leu', symbol: 'lei', country: 'Romania' },
  RSD: { name: 'Serbian Dinar', symbol: 'дин.', country: 'Serbia' },
  RUB: { name: 'Russian Ruble', symbol: '₽', country: 'Russia' },
  RWF: { name: 'Rwandan Franc', symbol: 'FRw', country: 'Rwanda' },
  SAR: { name: 'Saudi Riyal', symbol: '﷼', country: 'Saudi Arabia' },
  SBD: {
    name: 'Solomon Islands Dollar',
    symbol: 'SI$',
    country: 'Solomon Islands',
  },
  SCR: { name: 'Seychellois Rupee', symbol: '₨', country: 'Seychelles' },
  SDG: { name: 'Sudanese Pound', symbol: 'ج.س.', country: 'Sudan' },
  SEK: { name: 'Swedish Krona', symbol: 'kr', country: 'Sweden' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$', country: 'Singapore' },
  SHP: { name: 'Saint Helena Pound', symbol: '£', country: 'Saint Helena' },
  SLE: { name: 'Sierra Leonean Leone', symbol: 'Le', country: 'Sierra Leone' },
  SLL: { name: 'Sierra Leonean Leone', symbol: 'Le', country: 'Sierra Leone' },
  SOS: { name: 'Somali Shilling', symbol: 'S', country: 'Somalia' },
  SRD: { name: 'Surinamese Dollar', symbol: 'SR$', country: 'Suriname' },
  STD: {
    name: 'São Tomé and Príncipe Dobra',
    symbol: 'Db',
    country: 'São Tomé and Príncipe',
  },
  SVC: { name: 'Salvadoran Colón', symbol: '$', country: 'El Salvador' },
  SYP: { name: 'Syrian Pound', symbol: '£', country: 'Syria' },
  SZL: { name: 'Swazi Lilangeni', symbol: 'E', country: 'Eswatini' },
  THB: { name: 'Thai Baht', symbol: '฿', country: 'Thailand' },
  TJS: { name: 'Tajikistani Somoni', symbol: 'TJS', country: 'Tajikistan' },
  TMT: { name: 'Turkmenistani Manat', symbol: 'TMT', country: 'Turkmenistan' },
  TND: { name: 'Tunisian Dinar', symbol: 'TND', country: 'Tunisia' },
  TOP: { name: 'Tongan Paʻanga', symbol: 'TOP', country: 'Tonga' },
  TRY: { name: 'Turkish Lira', symbol: 'TRY', country: 'Turkey' },
  TTD: {
    name: 'Trinidad and Tobago Dollar',
    symbol: 'TT$',
    country: 'Trinidad and Tobago',
  },
  TWD: { name: 'New Taiwan Dollar', symbol: 'NT$', country: 'Taiwan' },
  TZS: { name: 'Tanzanian Shilling', symbol: 'TZS', country: 'Tanzania' },
  UAH: { name: 'Ukrainian Hryvnia', symbol: '₴', country: 'Ukraine' },
  UGX: { name: 'Ugandan Shilling', symbol: 'UGX', country: 'Uganda' },
  UYU: { name: 'Uruguayan Peso', symbol: 'UY$', country: 'Uruguay' },
  UZS: { name: 'Uzbekistan Som', symbol: 'UZS', country: 'Uzbekistan' },
  VEF: {
    name: 'Venezuelan Bolívar Fuerte',
    symbol: 'VEF',
    country: 'Venezuela',
  },
  VES: { name: 'Sovereign Bolivar', symbol: 'VES', country: 'Venezuela' },
  VND: { name: 'Vietnamese Dong', symbol: '₫', country: 'Vietnam' },
  VUV: { name: 'Vanuatu Vatu', symbol: 'Vt', country: 'Vanuatu' },
  WST: { name: 'Samoan Tala', symbol: 'WS$', country: 'Samoa' },
  XAF: {
    name: 'CFA Franc BEAC',
    symbol: 'FCFA',
    country: 'Central African CFA',
  },
  XAG: { name: 'Silver (troy ounce)', symbol: 'XAG', country: 'N/A' },
  XAU: { name: 'Gold (troy ounce)', symbol: 'XAU', country: 'N/A' },
  XCD: {
    name: 'East Caribbean Dollar',
    symbol: 'EC$',
    country: 'Eastern Caribbean',
  },
  XDR: {
    name: 'Special Drawing Rights',
    symbol: 'SDR',
    country: 'International Monetary Fund',
  },
  XOF: { name: 'CFA Franc BCEAO', symbol: 'CFA', country: 'West African CFA' },
  XPF: { name: 'CFP Franc', symbol: 'CFPF', country: 'French Polynesia' },
  YER: { name: 'Yemeni Rial', symbol: '﷼', country: 'Yemen' },
  ZAR: { name: 'South African Rand', symbol: 'R', country: 'South Africa' },
  ZMK: { name: 'Zambian Kwacha (pre-2013)', symbol: 'ZMK', country: 'Zambia' },
  ZMW: { name: 'Zambian Kwacha', symbol: 'ZMW', country: 'Zambia' },
  ZWL: { name: 'Zimbabwean Dollar', symbol: 'ZWL', country: 'Zimbabwe' },
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
  private api = new ExchangeRatesAPI(); // 환율 정보를 가져오는 API
  private updatedTimeOfRates = 0; // 환율 정보를 업데이트한 시간
  private baseRates: Rates = {}; // 기본 환율 정보 (EUR)
  private base = 'EUR'; // 환율 정보의 기준 통화
  private rates: Rates = {}; // 환율 정보
  private currencies: CurrencyData = currencyBaseData; // 환율 정보를 사용하는 통화 데이터

  // constructor() {
  //   this.updateRates();
  // }

  // baseRates가 비어있는지 확인하는 메소드
  isRatesEmpty() {
    // baseRates가 비어있다면 true를 반환합니다.
    return Object.keys(this.baseRates).length === 0;
  }

  // 환율 정보를 업데이트하는 메소드
  async updateRates(force = false) {
    // 환율 정보가 없거나, 24시간이 지났거나, 경과 시간과 무관하게 업데이트를 강제하려는 경우
    if (
      this.isRatesEmpty() ||
      Date.now() - this.updatedTimeOfRates > 1000 * 60 * 60 * 24 ||
      force
    ) {
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

  // 두 통화 간의 환율을 가져오는 메소드
  getRate(from: string, to: string): number {
    // 먼저 환율 정보가 있는지 확인합니다. 정보가 없다면 0 반환
    if (!this.isRatesEmpty()) {
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

  getCurrencyInfo(currency: string): object {
    // 이 메서드는 특정 통화에 대한 정보를 가져오는 기능을 합니다.
    // 첫째, 환율 정보가 비어있는지 검사합니다. 'isRatesEmpty' 메서드를 통해 확인합니다.
    // 둘째, 원하는 통화의 정보가 존재하는지 확인합니다. 'hasOwnProperty' 메서드를 통해 통화 데이터에 해당 통화가 있는지 확인할 수 있습니다.
    // 셋째, 원하는 통화의 환율 정보가 존재하는지 확인합니다. 마찬가지로 'hasOwnProperty' 메서드를 통해 환율 정보에 해당 통화가 있는지 확인합니다.
    if (
      !this.isRatesEmpty() &&
      this.currencies.hasOwnProperty(currency) &&
      this.rates.hasOwnProperty(currency)
    ) {
      // 위의 세 조건을 모두 만족하는 경우, 해당 통화 정보를 반환합니다.
      return this.currencies[currency];
    } else {
      // 위의 세 조건 중 하나라도 만족하지 않는 경우, 비어있는 객체를 반환합니다.
      return {};
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
