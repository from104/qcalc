import {create, all, BigNumber} from 'mathjs';

/**
 * BigNumber 설정으로 MathJS 인스턴스 생성
 * - precision: 64비트 정밀도 설정
 */
const MathB = create(all, {
  number: 'BigNumber',
  precision: 64,
});

export enum Radix {
  Binary = 'bin',
  Octal = 'oct',
  Decimal = 'dec',
  Hexadecimal = 'hex',
}

/**
 * 진법 변환을 처리하는 클래스
 * 10진수와 2진수, 8진수, 16진수 간의 상호 변환을 지원
 */
export class RadixConverter {
  // 16진수 변환에 사용될 문자 집합
  private static readonly HEX_DIGITS = '0123456789ABCDEF';
  // 소수점 이하 최대 자릿수
  private static readonly MAX_PRECISION = 32;
  // 지원하는 진법 타입
  public static readonly RADIX_MAP = {
    bin: 2,
    oct: 8,
    dec: 10,
    hex: 16,
  } as const;

  private static readonly VALID_PATTERNS = {
    [Radix.Binary]: /^-?[01]+(\.[01]+)?$/,
    [Radix.Octal]: /^-?[0-7]+(\.[0-7]+)?$/,
    [Radix.Decimal]: /^-?\d+(\.\d+)?$/,
    [Radix.Hexadecimal]: /^-?[0-9A-Fa-f]+(\.[0-9A-Fa-f]+)?$/,
  } as const;

  /**
   * 주어진 문자열이 지정된 진법에 유효한지 검사
   * @param value 검사할 문자열
   * @param radix 진법
   * @returns 유효성 여부
   * @throws {Error} 지원하지 않는 진법인 경우
   */
  public static isValidNumber(value: string, radix: Radix): boolean {
    const pattern = this.VALID_PATTERNS[radix];
    if (!pattern) {
      throw new Error('Unsupported radix type');
    }
    return pattern.test(value);
  }

  /**
   * 2진수 문자열 유효성 검사
   */
  public static isValidBinary(value: string): boolean {
    return this.isValidNumber(value, Radix.Binary);
  }

  /**
   * 8진수 문자열 유효성 검사
   */
  public static isValidOctal(value: string): boolean {
    return this.isValidNumber(value, Radix.Octal);
  }

  /**
   * 10진수 문자열 유효성 검사
   */
  public static isValidDecimal(value: string): boolean {
    return this.isValidNumber(value, Radix.Decimal);
  }

  /**
   * 16진수 문자열 유효성 검사
   */
  public static isValidHexadecimal(value: string): boolean {
    return this.isValidNumber(value, Radix.Hexadecimal);
  }

  /**
   * 10진수 → 2진수 변환
   */
  public static convertDecimalToBinary(decimal: string): string {
    return this.convertFromDecimal(decimal, Radix.Binary);
  }

  /**
   * 10진수 → 8진수 변환
   */
  public static convertDecimalToOctal(decimal: string): string {
    return this.convertFromDecimal(decimal, Radix.Octal);
  }

  /**
   * 10진수 → 16진수 변환
   */
  public static convertDecimalToHexadecimal(decimal: string): string {
    return this.convertFromDecimal(decimal, Radix.Hexadecimal).toUpperCase();
  }

  /**
   * 2진수 → 10진수 변환
   */
  public static convertBinaryToDecimal(binary: string): string {
    return this.convertToDecimal(binary, Radix.Binary);
  }

  /**
   * 8진수 → 10진수 변환
   */
  public static convertOctalToDecimal(octal: string): string {
    return this.convertToDecimal(octal, Radix.Octal);
  }

  /**
   * 16진수 → 10진수 변환
   */
  public static convertHexadecimalToDecimal(hex: string): string {
    return this.convertToDecimal(hex, Radix.Hexadecimal);
  }

  /**
   * 10진수를 지정된 진법으로 변환하는 내부 메서드
   * @param decimal 10진수 문자열
   * @param notation 변환할 진법 ('bin' | 'oct' | 'hex')
   * @returns 변환된 진법 문자열
   */
  private static convertDecimalToRadix(
    decimal: string | BigNumber,
    notation: keyof typeof RadixConverter.RADIX_MAP,
  ): string {
    if (!decimal) return '0';

    // 입력값을 BigNumber로 변환하고 정수부와 소수부 분리
    const bignumber = MathB.bignumber(decimal);
    const isNegative = MathB.smaller(bignumber, 0);
    const absoluteValue = MathB.abs(bignumber);
    const integer = MathB.floor(absoluteValue);
    const fraction = MathB.subtract(absoluteValue, integer);

    // 정수부 변환 (MathJS format 함수 사용)
    let integerPart =
      notation === Radix.Decimal
        ? MathB.format(integer, {
            notation: 'fixed',
            precision: this.MAX_PRECISION,
          }).replace(/\.?0+$/, '')
        : MathB.format(integer, {
            notation: notation,
            precision: this.MAX_PRECISION,
          })
            .slice(2)
            .toUpperCase(); // 접두사(0b, 0o, 0x) 제거

    // 소수부가 0이면 정수부만 반환
    if (MathB.equal(fraction, 0)) {
      // 10진수인 경우 소수점 이하 0을 제거
      if (notation === Radix.Decimal) {
        integerPart = integerPart.replace(/\.?0+$/, '');
      }
      return isNegative ? `-${integerPart}` : integerPart;
    }

    // 소수부 변환
    const fractionPart = this.convertFractionToRadix(fraction, notation);

    // 결과 조합 (불필요한 0 제거)
    const result = `${integerPart}.${fractionPart}`;

    return isNegative ? `-${result}` : result;
  }

  /**
   * 소수부를 지정된 진법으로 변환하는 보조 메서드
   * @param fraction 소수부 BigNumber
   * @param notation 변환할 진법
   * @returns 변환된 소수부 문자열
   */
  private static convertFractionToRadix(
    fraction: math.BigNumber,
    notation: keyof typeof RadixConverter.RADIX_MAP,
  ): string {
    const radix = this.RADIX_MAP[notation];
    let result = '';
    let currentFraction = fraction;

    // 최대 자릿수까지 소수부 계산
    for (let i = 0; i < this.MAX_PRECISION && !MathB.equal(currentFraction, 0); i++) {
      currentFraction = MathB.multiply(currentFraction, radix) as math.BigNumber;
      const digit = MathB.floor(currentFraction);

      // 16진수의 경우 문자로 변환, 그 외는 숫자 그대로 사용
      result += notation === 'hex' ? this.HEX_DIGITS[Number(digit.toFixed())] : digit.toString();

      currentFraction = MathB.subtract(currentFraction, digit);
    }

    return result;
  }

  /**
   * 지정된 진법을 10진수로 변환하는 내부 메서드
   * @param value 변환할 진법 문자열
   * @param notation 입력 진법
   * @returns 10진수 문자열
   */
  private static convertRadixToDecimal(value: string, notation: keyof typeof RadixConverter.RADIX_MAP): string {
    if (!value || value === '0' || value === '-0') return '0';

    // 음수 부호 확인
    const isNegative = value.startsWith('-');
    const absValue = isNegative ? value.slice(1) : value;

    const [integerPart, fractionPart = ''] = absValue.split('.');
    const radix = this.RADIX_MAP[notation];

    // 정수부 변환
    let result = MathB.bignumber(integerPart ? parseInt(integerPart, radix) : 0);

    // 소수부가 있는 경우 변환
    if (fractionPart) {
      result = MathB.add(result, this.convertFractionFromRadix(fractionPart, notation));
    }

    // 음수인 경우 부호 적용
    return isNegative ? `-${result.toString()}` : result.toString();
  }

  /**
   * 소수부를 10진수로 변환하는 보조 메서드
   * @param fractionPart 소수부 문자열
   * @param notation 입력 진법
   * @returns 변환된 소수부 BigNumber
   */
  private static convertFractionFromRadix(
    fractionPart: string,
    notation: keyof typeof RadixConverter.RADIX_MAP,
  ): math.BigNumber {
    const radix = this.RADIX_MAP[notation];
    const digits = notation === 'hex' ? fractionPart.toUpperCase() : fractionPart;

    return digits.split('').reduce((acc, digit, index) => {
      const value = parseInt(digit, radix);
      return MathB.add(acc, MathB.divide(value, MathB.pow(radix, index + 1)) as math.BigNumber);
    }, MathB.bignumber(0));
  }

  /**
   * 10진수에서 다른 진법으로 변환하는 공통 메서드
   */
  private static convertFromDecimal(decimal: string, toRadix: Radix): string {
    if (!this.isValidDecimal(decimal)) {
      throw new Error('Invalid decimal number format');
    }
    return this.convertDecimalToRadix(decimal, toRadix);
  }

  /**
   * 다른 진법에서 10진수로 변환하는 공통 메서드
   */
  private static convertToDecimal(value: string, fromRadix: Radix): string {
    if (!this.isValidNumber(value, fromRadix)) {
      throw new Error(`Invalid ${fromRadix} number format`);
    }
    return this.convertRadixToDecimal(value, fromRadix);
  }

  /**
   * 임의의 진법 간 변환
   */
  public static convertRadix(
    value: string,
    fromRadix: keyof typeof RadixConverter.RADIX_MAP,
    toRadix: keyof typeof RadixConverter.RADIX_MAP,
  ): string {
    if (toRadix === fromRadix) return value;

    const decimal = this.convertToDecimal(value, fromRadix as Radix);
    return this.convertFromDecimal(decimal, toRadix as Radix);
  }
}
