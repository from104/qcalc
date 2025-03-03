/**
 * @file CurrencyBaseData.ts
 * @description 이 파일은 통화 정보를 저장하는 상수 파일입니다.
 *              각 통화에 대한 설명과 기호를 포함하는 데이터를 정의하며,
 *              애플리케이션에서 통화 관련 기능을 구현하는 데 사용됩니다.
 *              통화 코드(예: 'USD', 'EUR')를 키로 사용하여 통화 정보를 관리합니다.
 */

/**
 * 통화 정보를 저장하는 인터페이스
 * 
 * @interface Currency
 * @description
 * 이 인터페이스는 각 통화에 대한 정보를 저장합니다.
 * 키는 통화 코드(예: 'USD', 'EUR')이며, 값은 해당 통화의 설명과 기호를 포함하는 객체입니다.
 */
interface Currency {
  [currency: string]: {
    /** 통화의 설명 (예: 'United States Dollar') */
    desc: string;
    /** 통화의 기호 (예: '$') */
    symbol: string;
  };
}

/**
 * 통화 데이터를 저장하는 타입
 * 
 * @type CurrencyData
 * @description
 * 이 타입은 Currency 인터페이스를 기반으로 하며,
 * 애플리케이션 전체에서 통화 정보를 일관되게 관리하는 데 사용됩니다.
 * 이를 통해 환율 변환, 통화 표시 등의 기능을 구현할 때 타입 안정성을 보장할 수 있습니다.
 */
export type CurrencyData = Currency;

// 환율에 대한 기본 데이터
export const currencyBaseData: CurrencyData = {
  EUR: {desc: 'Euro', symbol: '€'},
  USD: {desc: 'United States Dollar', symbol: '$'},
  KRW: {desc: 'South Korean Won', symbol: '₩'},
  GBP: {desc: 'British Pound Sterling', symbol: '£'},
  JPY: {desc: 'Japanese Yen', symbol: '¥'},
  CNY: {desc: 'Chinese Yuan', symbol: '¥'},
  AED: {desc: 'United Arab Emirates Dirham', symbol: 'د.إ'},
  AFN: {desc: 'Afghan Afghani', symbol: '؋'},
  ALL: {desc: 'Albanian Lek', symbol: 'L'},
  AMD: {desc: 'Armenian Dram', symbol: '֏'},
  ANG: {desc: 'Netherlands Antillean Guilder', symbol: 'ƒ'},
  AOA: {desc: 'Angolan Kwanza', symbol: 'Kz'},
  ARS: {desc: 'Argentine Peso', symbol: '$'},
  AUD: {desc: 'Australian Dollar', symbol: 'A$'},
  AWG: {desc: 'Aruban Florin', symbol: 'ƒ'},
  AZN: {desc: 'Azerbaijani Manat', symbol: '₼'},
  BAM: {desc: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM'},
  BBD: {desc: 'Barbadian Dollar', symbol: 'Bds$'},
  BDT: {desc: 'Bangladeshi Taka', symbol: '৳'},
  BGN: {desc: 'Bulgarian Lev', symbol: 'лв'},
  BHD: {desc: 'Bahraini Dinar', symbol: 'ب.د'},
  BIF: {desc: 'Burundian Franc', symbol: 'FBu'},
  BMD: {desc: 'Bermudan Dollar', symbol: 'BD$'},
  BND: {desc: 'Brunei Dollar', symbol: 'B$'},
  BOB: {desc: 'Bolivian Boliviano', symbol: 'Bs'},
  BRL: {desc: 'Brazilian Real', symbol: 'R$'},
  BSD: {desc: 'Bahamian Dollar', symbol: 'B$'},
  BTC: {desc: 'Bitcoin', symbol: '₿'},
  BTN: {desc: 'Bhutanese Ngultrum', symbol: 'Nu.'},
  BWP: {desc: 'Botswanan Pula', symbol: 'P'},
  BYN: {desc: 'New Belarusian Ruble', symbol: 'Br'},
  BYR: {desc: 'Belarusian Ruble', symbol: 'Br'},
  BZD: {desc: 'Belize Dollar', symbol: 'BZ$'},
  CAD: {desc: 'Canadian Dollar', symbol: 'CA$'},
  CDF: {desc: 'Congolese Franc', symbol: 'FC'},
  CHF: {desc: 'Swiss Franc', symbol: 'CHF'},
  CLF: {desc: 'Chilean Unit of Account (UF)', symbol: 'UF'},
  CLP: {desc: 'Chilean Peso', symbol: '$'},
  COP: {desc: 'Colombian Peso', symbol: 'COL$'},
  CRC: {desc: 'Costa Rican Colón', symbol: '₡'},
  CUC: {desc: 'Cuban Convertible Peso', symbol: '$'},
  CUP: {desc: 'Cuban Peso', symbol: '₱'},
  CVE: {desc: 'Cape Verdean Escudo', symbol: 'Esc'},
  CZK: {desc: 'Czech Republic Koruna', symbol: 'Kč'},
  DJF: {desc: 'Djiboutian Franc', symbol: 'Fdj'},
  DKK: {desc: 'Danish Krone', symbol: 'kr'},
  DOP: {desc: 'Dominican Peso', symbol: 'RD$'},
  DZD: {desc: 'Algerian Dinar', symbol: 'د.ج'},
  EGP: {desc: 'Egyptian Pound', symbol: '£'},
  ERN: {desc: 'Eritrean Nakfa', symbol: 'Nfk'},
  ETB: {desc: 'Ethiopian Birr', symbol: 'Br'},
  FJD: {desc: 'Fijian Dollar', symbol: 'FJ$'},
  FKP: {desc: 'Falkland Islands Pound', symbol: '£'},
  GEL: {desc: 'Georgian Lari', symbol: '₾'},
  GGP: {desc: 'Guernsey Pound', symbol: '£'},
  GHS: {desc: 'Ghanaian Cedi', symbol: 'GH₵'},
  GIP: {desc: 'Gibraltar Pound', symbol: '£'},
  GMD: {desc: 'Gambian Dalasi', symbol: 'D'},
  GNF: {desc: 'Guinean Franc', symbol: 'FG'},
  GTQ: {desc: 'Guatemalan Quetzal', symbol: 'Q'},
  GYD: {desc: 'Guyanaese Dollar', symbol: 'GY$'},
  HKD: {desc: 'Hong Kong Dollar', symbol: 'HK$'},
  HNL: {desc: 'Honduran Lempira', symbol: 'L'},
  HRK: {desc: 'Croatian Kuna', symbol: 'kn'},
  HTG: {desc: 'Haitian Gourde', symbol: 'G'},
  HUF: {desc: 'Hungarian Forint', symbol: 'Ft'},
  IDR: {desc: 'Indonesian Rupiah', symbol: 'Rp'},
  ILS: {desc: 'Israeli New Sheqel', symbol: '₪'},
  IMP: {desc: 'Manx Pound', symbol: '£'},
  INR: {desc: 'Indian Rupee', symbol: '₹'},
  IQD: {desc: 'Iraqi Dinar', symbol: 'ع.د'},
  IRR: {desc: 'Iranian Rial', symbol: '﷼'},
  ISK: {desc: 'Icelandic Króna', symbol: 'kr'},
  JEP: {desc: 'Jersey Pound', symbol: '£'},
  JMD: {desc: 'Jamaican Dollar', symbol: 'J$'},
  JOD: {desc: 'Jordanian Dinar', symbol: 'د.ا'},
  KES: {desc: 'Kenyan Shilling', symbol: 'KSh'},
  KGS: {desc: 'Kyrgystani Som', symbol: 'с'},
  KHR: {desc: 'Cambodian Riel', symbol: '៛'},
  KMF: {desc: 'Comorian Franc', symbol: 'CF'},
  KPW: {desc: 'North Korean Won', symbol: '₩'},
  KWD: {desc: 'Kuwaiti Dinar', symbol: 'د.ك'},
  KYD: {desc: 'Cayman Islands Dollar', symbol: 'CI$'},
  KZT: {desc: 'Kazakhstani Tenge', symbol: '₸'},
  LAK: {desc: 'Laotian Kip', symbol: '₭'},
  LBP: {desc: 'Lebanese Pound', symbol: 'ل.ل'},
  LKR: {desc: 'Sri Lankan Rupee', symbol: '₨'},
  LRD: {desc: 'Liberian Dollar', symbol: 'L$'},
  LSL: {desc: 'Lesotho Loti', symbol: 'L'},
  LTL: {desc: 'Lithuanian Litas', symbol: 'Lt'},
  LVL: {desc: 'Latvian Lats', symbol: 'Ls'},
  LYD: {desc: 'Libyan Dinar', symbol: 'ل.د'},
  MAD: {desc: 'Moroccan Dirham', symbol: 'د.م.'},
  MDL: {desc: 'Moldovan Leu', symbol: 'L'},
  MGA: {desc: 'Malagasy Ariary', symbol: 'Ar'},
  MKD: {desc: 'Macedonian Denar', symbol: 'ден'},
  MMK: {desc: 'Myanma Kyat', symbol: 'K'},
  MNT: {desc: 'Mongolian Tugrik', symbol: '₮'},
  MOP: {desc: 'Macanese Pataca', symbol: 'MOP$'},
  MRO: {desc: 'Mauritanian Ouguiya', symbol: 'UM'},
  MUR: {desc: 'Mauritian Rupee', symbol: '₨'},
  MVR: {desc: 'Maldivian Rufiyaa', symbol: 'Rf'},
  MWK: {desc: 'Malawian Kwacha', symbol: 'MK'},
  MXN: {desc: 'Mexican Peso', symbol: 'MX$'},
  MYR: {desc: 'Malaysian Ringgit', symbol: 'RM'},
  MZN: {desc: 'Mozambican Metical', symbol: 'MT'},
  NAD: {desc: 'Namibian Dollar', symbol: 'N$'},
  NGN: {desc: 'Nigerian Naira', symbol: '₦'},
  NIO: {desc: 'Nicaraguan Córdoba', symbol: 'C$'},
  NOK: {desc: 'Norwegian Krone', symbol: 'kr'},
  NPR: {desc: 'Nepalese Rupee', symbol: '₨'},
  NZD: {desc: 'New Zealand Dollar', symbol: 'NZ$'},
  OMR: {desc: 'Omani Rial', symbol: 'ر.ع.'},
  PAB: {desc: 'Panamanian Balboa', symbol: 'B/.'},
  PEN: {desc: 'Peruvian Nuevo Sol', symbol: 'S/.'},
  PGK: {desc: 'Papua New Guinean Kina', symbol: 'K'},
  PHP: {desc: 'Philippine Peso', symbol: '₱'},
  PKR: {desc: 'Pakistani Rupee', symbol: '₨'},
  PLN: {desc: 'Polish Zloty', symbol: 'zł'},
  PYG: {desc: 'Paraguayan Guarani', symbol: '₲'},
  QAR: {desc: 'Qatari Rial', symbol: '﷼'},
  RON: {desc: 'Romanian Leu', symbol: 'lei'},
  RSD: {desc: 'Serbian Dinar', symbol: 'дин.'},
  RUB: {desc: 'Russian Ruble', symbol: '₽'},
  RWF: {desc: 'Rwandan Franc', symbol: 'FRw'},
  SAR: {desc: 'Saudi Riyal', symbol: '﷼'},
  SBD: {desc: 'Solomon Islands Dollar', symbol: 'SI$'},
  SCR: {desc: 'Seychellois Rupee', symbol: '₨'},
  SDG: {desc: 'Sudanese Pound', symbol: 'ج.س.'},
  SEK: {desc: 'Swedish Krona', symbol: 'kr'},
  SGD: {desc: 'Singapore Dollar', symbol: 'S$'},
  SHP: {desc: 'Saint Helena Pound', symbol: '£'},
  SLE: {desc: 'Sierra Leonean Leone', symbol: 'Le'},
  SLL: {desc: 'Sierra Leonean Leone', symbol: 'Le'},
  SOS: {desc: 'Somali Shilling', symbol: 'S'},
  SRD: {desc: 'Surinamese Dollar', symbol: 'SR$'},
  STD: {desc: 'São Tomé and Príncipe Dobra', symbol: 'Db'},
  SVC: {desc: 'Salvadoran Colón', symbol: '$'},
  SYP: {desc: 'Syrian Pound', symbol: '£'},
  SZL: {desc: 'Swazi Lilangeni', symbol: 'E'},
  THB: {desc: 'Thai Baht', symbol: '฿'},
  TJS: {desc: 'Tajikistani Somoni', symbol: 'TJS'},
  TMT: {desc: 'Turkmenistani Manat', symbol: 'TMT'},
  TND: {desc: 'Tunisian Dinar', symbol: 'TND'},
  TOP: {desc: 'Tongan Paʻanga', symbol: 'TOP'},
  TRY: {desc: 'Turkish Lira', symbol: 'TRY'},
  TTD: {desc: 'Trinidad and Tobago Dollar', symbol: 'TT$'},
  TWD: {desc: 'New Taiwan Dollar', symbol: 'NT$'},
  TZS: {desc: 'Tanzanian Shilling', symbol: 'TZS'},
  UAH: {desc: 'Ukrainian Hryvnia', symbol: '₴'},
  UGX: {desc: 'Ugandan Shilling', symbol: 'UGX'},
  UYU: {desc: 'Uruguayan Peso', symbol: 'UY$'},
  UZS: {desc: 'Uzbekistan Som', symbol: 'UZS'},
  VEF: {desc: 'Venezuelan Bolívar Fuerte', symbol: 'VEF'},
  VES: {desc: 'Sovereign Bolivar', symbol: 'VES'},
  VND: {desc: 'Vietnamese Dong', symbol: '₫'},
  VUV: {desc: 'Vanuatu Vatu', symbol: 'Vt'},
  WST: {desc: 'Samoan Tala', symbol: 'WS$'},
  XAF: {desc: 'CFA Franc BEAC', symbol: 'FCFA'},
  XAG: {desc: 'Silver (troy ounce)', symbol: 'XAG'},
  XAU: {desc: 'Gold (troy ounce)', symbol: 'XAU'},
  XCD: {desc: 'East Caribbean Dollar', symbol: 'EC$'},
  XDR: {desc: 'Special Drawing Rights', symbol: 'SDR'},
  XOF: {desc: 'CFA Franc BCEAO', symbol: 'CFA'},
  XPF: {desc: 'CFP Franc', symbol: 'CFPF'},
  YER: {desc: 'Yemeni Rial', symbol: '﷼'},
  ZAR: {desc: 'South African Rand', symbol: 'R'},
  ZMK: {desc: 'Zambian Kwacha (pre-2013)', symbol: 'ZMK'},
  ZMW: {desc: 'Zambian Kwacha', symbol: 'ZMW'},
  ZWL: {desc: 'Zimbabwean Dollar', symbol: 'ZWL'},
};

// 환율을 저장하는 인터페이스
export interface CurrencyExchangeRates {
  [key: string]: number;
}