import {create, all} from 'mathjs';

/**
 * BigNumber 설정으로 MathJS 인스턴스 생성
 * - precision: 64비트 정밀도 설정
 */
const MathB = create(all, {
  number: 'BigNumber',
  precision: 64,
});

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
  private static readonly RADIX_MAP = {
    bin: 2,
    oct: 8,
    hex: 16,
  } as const;

  /**
   * 10진수 → 2진수 변환
   * @param decimal 10진수 문자열
   * @returns 2진수 문자열
   */
  public static toBinary(decimal: string): string {
    return this.convertDecimalToRadix(decimal, 'bin');
  }

  /**
   * 10진수 → 8진수 변환
   * @param decimal 10진수 문자열
   * @returns 8진수 문자열
   */
  public static toOctal(decimal: string): string {
    return this.convertDecimalToRadix(decimal, 'oct');
  }

  /**
   * 10진수 → 16진수 변환
   * @param decimal 10진수 문자열
   * @returns 대문자 16진수 문자열
   */
  public static toHexadecimal(decimal: string): string {
    return this.convertDecimalToRadix(decimal, 'hex').toUpperCase();
  }

  /**
   * 2진수 → 10진수 변환
   * @param binary 2진수 문자열
   * @returns 10진수 문자열
   */
  public static fromBinary(binary: string): string {
    return this.convertRadixToDecimal(binary, 'bin');
  }

  /**
   * 8진수 → 10진수 변환
   * @param octal 8진수 문자열
   * @returns 10진수 문자열
   */
  public static fromOctal(octal: string): string {
    return this.convertRadixToDecimal(octal, 'oct');
  }

  /**
   * 16진수 → 10진수 변환
   * @param hex 16진수 문자열
   * @returns 10진수 문자열
   */
  public static fromHexadecimal(hex: string): string {
    return this.convertRadixToDecimal(hex, 'hex');
  }

  /**
   * 10진수를 지정된 진법으로 변환하는 내부 메서드
   * @param decimal 10진수 문자열
   * @param notation 변환할 진법 ('bin' | 'oct' | 'hex')
   * @returns 변환된 진법 문자열
   */
  private static convertDecimalToRadix(decimal: string, notation: keyof typeof RadixConverter.RADIX_MAP): string {
    if (!decimal) return '';

    // 입력값을 BigNumber로 변환하고 정수부와 소수부 분리
    const bignumber = MathB.bignumber(decimal);
    const integer = MathB.floor(bignumber);
    const fraction = MathB.subtract(bignumber, integer);

    // 정수부 변환 (MathJS format 함수 사용)
    const integerPart = MathB.format(integer, {
      notation,
      precision: this.MAX_PRECISION,
    }).slice(2); // 접두사(0b, 0o, 0x) 제거

    // 소수부가 0이면 정수부만 반환
    if (MathB.equal(fraction, 0)) {
      return integerPart;
    }

    // 소수부 변환
    const fractionPart = this.convertFractionToRadix(fraction, notation);

    return `${integerPart}.${fractionPart}`;
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
    if (!value) return '';

    const [integerPart, fractionPart = ''] = value.split('.');
    const radix = this.RADIX_MAP[notation];

    // 정수부 변환
    let result = MathB.bignumber(integerPart ? parseInt(integerPart, radix) : 0);

    // 소수부가 있는 경우 변환
    if (fractionPart) {
      result = MathB.add(result, this.convertFractionFromRadix(fractionPart, notation));
    }

    return result.toString();
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
}
// 10진수에서 변환
// console.log(RadixConverter.toBinary('10.75')); // "1010.11"
// console.log(RadixConverter.toOctal('10.5')); // "12.4"
// console.log(RadixConverter.toHexadecimal('10.5')); // "A.8"

// 10진수로 변환
// console.log(RadixConverter.fromBinary('1010.11')); // "10.75"
// console.log(RadixConverter.fromOctal('12.4')); // "10.5"
// console.log(RadixConverter.fromHexadecimal('A.8')); // "10.5"
