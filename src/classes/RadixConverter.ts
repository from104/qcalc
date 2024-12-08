import { create, all, bignumber } from 'mathjs';
import { BigNumber, typeBigNumber } from './CalculatorTypes';
import { match } from 'ts-pattern';

/**
 * BigNumber 설정으로 MathJS 인스턴스 생성
 * - precision: 64비트 정밀도 설정
 */
const MathB = create(all, {
  number: 'BigNumber',
  precision: 128,
});

export enum Radix {
  Binary = 'bin',
  Octal = 'oct',
  Decimal = 'dec',
  Hexadecimal = 'hex',
}

export type RadixType = Radix;

/**
 * 진법 변환 클래스
 * @description
 * 다양한 진법 간의 숫자 변환을 처리하는 클래스
 * 
 * 지원하는 진법:
 * - 2진수 (Binary)
 * - 8진수 (Octal)
 * - 10진수 (Decimal)
 * - 16진수 (Hexadecimal)
 * 
 * 주요 기능:
 * - 진법 간 상호 변환
 * - 유효성 검사
 * - 소수점 이하 자리 처리
 * - 음수 처리
 * 
 * @example
 * const converter = new RadixConverter();
 * const binary = converter.convertDecimalToBinary("42");  // "101010"
 */
export class RadixConverter {
  // 16진수 변환에 사용될 문자 집합
  private readonly hexDigits = '0123456789ABCDEF';
  // 소수점 이하 최대 자릿수
  private readonly maxPrecision = 128;
  // 지원하는 진법 타입
  public readonly radixMap = {
    [Radix.Binary]: 2,
    [Radix.Octal]: 8,
    [Radix.Decimal]: 10,
    [Radix.Hexadecimal]: 16,
  } as const;

  /**
   * 주어진 문자열이 지정된 진법에 유효한지 검사
   * @param value 검사할 문자열
   * @param radix 진법
   * @returns 유효성 여부
   * @throws {Error} 지원하지 않는 진법인 경우
   */
  public isValidRadixNumber(number: string, radix: Radix): boolean {
    const patterns = {
      [Radix.Binary]: /^-?[01]+(\.[01]*)?$/,
      [Radix.Octal]: /^-?[0-7]+(\.[0-7]*)?$/,
      [Radix.Decimal]: /^-?\d+(\.\d*)?$/,
      [Radix.Hexadecimal]: /^-?[0-9A-Fa-f]+(\.[0-9A-Fa-f]*)?$/,
    };

    return patterns[radix].test(number);
  }

  /**
   * 2진수 문자열 유효성 검사
   */
  public isValidBinary(value: string): boolean {
    return this.isValidRadixNumber(value, Radix.Binary);
  }

  /**
   * 8진수 문자열 유효성 검사
   */
  public isValidOctal(value: string): boolean {
    return this.isValidRadixNumber(value, Radix.Octal);
  }

  /**
   * 10진수 문자열 유효성 검사
   */
  public isValidDecimal(value: string): boolean {
    return this.isValidRadixNumber(value, Radix.Decimal);
  }

  /**
   * 16진수 문자열 유효성 검사
   */
  public isValidHexadecimal(value: string): boolean {
    return this.isValidRadixNumber(value, Radix.Hexadecimal);
  }

  /**
   * 10진수 → 2진수 변환
   */
  public convertDecimalToBinary(decimal: string): string {
    return this.convertFromDecimal(decimal, Radix.Binary);
  }

  /**
   * 10진수 → 8진수 변환
   */
  public convertDecimalToOctal(decimal: string): string {
    return this.convertFromDecimal(decimal, Radix.Octal);
  }

  /**
   * 10진수 → 16진수 변환
   */
  public convertDecimalToHexadecimal(decimal: string): string {
    return this.convertFromDecimal(decimal, Radix.Hexadecimal).toUpperCase();
  }

  /**
   * 2진수 → 10진수 변환
   */
  public convertBinaryToDecimal(binary: string): string {
    return this.convertToDecimal(binary, Radix.Binary);
  }

  /**
   * 8진수 → 10진수 변환
   */
  public convertOctalToDecimal(octal: string): string {
    return this.convertToDecimal(octal, Radix.Octal);
  }

  /**
   * 16진수 → 10진수 변환
   */
  public convertHexadecimalToDecimal(hex: string): string {
    return this.convertToDecimal(hex, Radix.Hexadecimal);
  }

  /**
   * 10진수를 지정된 진법으로 변환하는 내부 메서드
   * @param decimal 10진수 문자열
   * @param radix 변환할 진법 ('bin' | 'oct' | 'hex')
   * @returns 변환된 진법 문자열
   */
  private convertDecimalToRadix(decimal: string | typeBigNumber, radix: Radix): string {
    if (!decimal) return '0';
    if (radix === Radix.Decimal) return decimal.toString();
    // 입력값을 BigNumber로 변환하고 정수부와 소수부 분리
    const bigNumberValue = MathB.bignumber(decimal);
    const isNegative = MathB.smaller(bigNumberValue, 0);
    const absoluteValue = MathB.abs(bigNumberValue);
    const integerPartValue = MathB.floor(absoluteValue);
    const fractionPartValue = MathB.subtract(absoluteValue, integerPartValue);

    // 정수부 변환 (MathJS format 함수 사용)
    const integerPart = BigInt(integerPartValue.toString()).toString(this.radixMap[radix]).toUpperCase();

    // 소수부가 0이면 정수부만 반환
    if (MathB.equal(fractionPartValue, 0)) {
      return isNegative ? `-${integerPart}` : integerPart;
    }

    // 소수부 변환
    const fractionPart = this.convertFractionToRadix(fractionPartValue, radix);

    // 결과 조합 (불필요한 0 제거)
    const result = `${integerPart}.${fractionPart}`;

    return isNegative ? `-${result}` : result;
  }

  /**
   * 소수부를 지정된 진법으로 변환하는 보조 메서드
   *
   * @param fraction 변환할 소수부 (BigNumber 타입)
   * @param radix 변환할 진법 (2진수, 8진수, 16진수)
   * @returns 변환된 소수부 문자열
   *
   * @description
   * 1. 입력받은 소수를 지정된 진법의 기수(2, 8, 16)와 곱하면서 정수부 추출
   * 2. 추출된 정수부를 결과 문자열에 추가 (16진수는 문자로 변환)
   * 3. 남은 소수부에 대해 최대 정밀도까지 반복
   * 4. 소수부가 0이 되면 조기 종료
   */
  private convertFractionToRadix(fraction: math.BigNumber, radix: Radix): string {
    // 진법에 따른 기수값 (2, 8, 16) 가져오기
    const radixValue = this.radixMap[radix];

    // 결과 문자열과 현재 처리중인 소수 초기화
    let result = '';
    let remainingFraction = fraction;

    // 최대 정밀도까지 소수부 변환 반복
    for (let precision = 0; precision < this.maxPrecision && !MathB.equal(remainingFraction, 0); precision++) {
      // 현재 소수에 기수를 곱하여 정수부 추출
      remainingFraction = MathB.multiply(remainingFraction, radixValue) as math.BigNumber;
      const integerPart = MathB.floor(remainingFraction);

      // 16진수면 해당하는 문자(0-F)로, 아니면 숫자 그대로 변환
      const digitStr =
        radix === Radix.Hexadecimal ? this.hexDigits[Number(integerPart.toFixed())] : integerPart.toString();

      // 결과 문자열에 추가
      result += digitStr;

      // 정수부를 제외한 나머지 소수부만 남김
      remainingFraction = MathB.subtract(remainingFraction, integerPart);
    }

    return result;
  }

  /**
   * 지정된 진법을 10진수로 변환하는 내부 메서드
   *
   * @param value 변환할 진법 문자열 (예: "1010", "FF", "777" 등)
   * @param radix 입력 진법 (2진수, 8진수, 16진수)
   * @returns 10진수 문자열
   *
   * @description
   * 1. 입력값 검증
   *    - 빈 문자열이나 0인 경우 "0" 반환
   *    - 10진수인 경우 그대로 반환
   *
   * 2. 음수 처리
   *    - 음수 부호("-") 확인 및 제거하여 절대값 계산
   *
   * 3. 정수부/소수부 분리
   *    - "." 기준으로 정수부와 소수부 분리
   *    - 소수부가 없는 경우 빈 문자열로 초기화
   *
   * 4. 진법 변환
   *    - 정수부: parseInt() 사용하여 10진수로 변환 후 BigNumber 생성
   *    - 소수부: convertFractionFromRadix() 메서드로 변환하여 정수부에 더함
   *
   * 5. 결과 반환
   *    - 음수였던 경우 "-" 부호 다시 붙여서 반환
   */
  private convertRadixToDecimal(value: string, radix: Radix): string {
    // 입력값이 없거나 0인 경우 처리
    if (!value || value === '0' || value === '-0') {
      return '0';
    }

    // 이미 10진수인 경우 그대로 반환
    if (radix === Radix.Decimal) {
      return value;
    }

    // 숫자 끝에 소수점만 있는 경우 기억
    const isOnlyFraction = value.endsWith('.');

    // 음수 부호 확인 및 절대값 추출
    const isNegative = value.startsWith('-');
    const absValue = isNegative ? value.slice(1) : value;

    // 정수부와 소수부 분리 ("." 기준)
    const [integerPart, fractionPart = ''] = absValue.split('.');

    // 진법에 따른 기수값 (2, 8, 16) 가져오기
    const radixPrefix = match(radix)
      .with(Radix.Binary, () => '0b')
      .with(Radix.Octal, () => '0o')
      .with(Radix.Hexadecimal, () => '0x')
      .exhaustive();
    // 정수부 변환 (빈 문자열이면 0으로 처리)
    let result = MathB.bignumber(integerPart ? BigInt(radixPrefix + integerPart).toString() : '0');

    // 소수부가 존재하면 변환하여 더하기
    if (fractionPart) {
      result = MathB.add(result, this.convertFractionFromRadix(fractionPart, radix));
    }

    // 최종 결과 반환 (음수면 부호 추가)
    return (isNegative ? '-' : '') + result.toString() + (isOnlyFraction ? '.' : '');
  }

  /**
   * 소수부를 10진수로 변환하는 보조 메서드
   *
   * @param fractionPart 소수부 문자열 (예: "5A3"와 같은 16진수 소수부)
   * @param radix 입력 진법 (2진수, 8진수, 16진수 등)
   * @returns 변환된 소수부의 BigNumber 값
   * @description
   * 1. 입력된 진법에 따른 기수값(radix) 가져오기
   * 2. 16진수인 경우 대문자로 통일하여 처리
   * 3. 각 자릿수를 순회하며:
   *    - 현재 자릿수를 10진수로 변환
   *    - (자릿수값) / (진법 ^ 자릿수위치)를 계산하여 누적
   * 4. 최종 계산된 소수값 반환
   */
  private convertFractionFromRadix(fractionPart: string, radix: Radix): math.BigNumber {
    // 진법에 따른 기수값 (2, 8, 16) 가져오기
    const radixValue = this.radixMap[radix];

    // 16진수의 경우 대문자로 통일 (예: 'a' -> 'A')
    const digits = radix === Radix.Hexadecimal ? fractionPart.toUpperCase() : fractionPart;
    // 각 자릿수별로 계산하여 합산
    return digits
      .split('')
      .reduce<typeBigNumber>((accumulator: typeBigNumber, currentDigit: string, position: number): typeBigNumber => {
        // 현재 자릿수를 10진수로 변환
        const digitValue = parseInt(currentDigit, radixValue);

        // 현재 자릿수의 가중치 계산: value / (radix^position)
        const weightedValue = MathB.divide(
          BigNumber(digitValue),
          MathB.pow(BigNumber(radixValue), position + 1),
        ) as typeBigNumber;

        // 누적값에 현재 자릿수의 가중치를 더함
        return MathB.add(accumulator, weightedValue);
      }, BigNumber(0));
  }

  /**
   * 10진수를 다른 진법으로 변환하는 공통 메서드
   *
   * @param decimal 변환할 10진수 문자열 (예: "123.45")
   * @param toRadix 변환하고자 하는 목표 진법 (2진수, 8진수, 16진수)
   * @returns 변환된 진법 문자열
   * @throws {Error} 유효하지 않은 10진수 형식일 경우 에러 발생
   *
   * 동작 방식:
   * 1. 입력된 10진수 문자열의 유효성을 검사
   * 2. 유효하지 않은 경우 에러를 발생시킴
   * 3. 유효한 경우 convertDecimalToRadix 메서드를 호출하여 실제 변환 수행
   *
   * 예시:
   * - convertFromDecimal("123", Radix.Binary) => "1111011"
   * - convertFromDecimal("123.45", Radix.Hexadecimal) => "7B.73"
   */
  private convertFromDecimal(decimal: string, toRadix: Radix): string {
    // 입력된 10진수의 유효성 검사
    // isValidDecimal 메서드를 통해 올바른 10진수 형식인지 확인
    if (!this.isValidDecimal(decimal)) {
      throw new Error('Invalid decimal number format');
    }

    // 유효성 검사를 통과한 경우 실제 진법 변환을 수행
    // convertDecimalToRadix 메서드에 decimal과 목표 진법을 전달
    return this.convertDecimalToRadix(decimal, toRadix);
  }

  /**
   * 임의의 진법에서 10진수로 변환하는 공통 메서드
   *
   * @param value 변환할 숫자 문자열
   * @param fromRadix 입력값의 현재 진법
   * @returns 변환된 10진수 문자열
   * @throws 입력된 진법에 맞지 않는 형식일 경우 에러 발생
   */
  private convertToDecimal(value: string, fromRadix: Radix): string {
    // 입력값이 해당 진법에 유효한지 검사
    if (!this.isValidRadixNumber(value, fromRadix)) {
      throw new Error(`Invalid ${fromRadix} number format`);
    }

    // 실제 10진수 변환 수행
    return this.convertRadixToDecimal(value, fromRadix);
  }

  /**
   * 임의의 진법 간 변환을 수행하는 메서드
   *
   * @param value 변환할 숫자 문자열 (예: "1010", "7B", "123")
   * @param fromRadix 입력값의 현재 진법 (Binary, Octal, Decimal, Hexadecimal)
   * @param toRadix 변환하고자 하는 목표 진법
   * @returns 변환된 진법 문자열
   * @throws {Error} 입력값이 현재 진법에 맞지 않는 형식일 경우 에러 발생
   *
   * 동작 방식:
   * 1. 현재 진법과 목표 진법이 같으면 입력값을 그대로 반환
   * 2. 다른 경우, 현재 진법에서 10진수로 먼저 변환 (convertToDecimal)
   * 3. 변환된 10진수를 목표 진법으로 다시 변환 (convertFromDecimal)
   *
   * 예시:
   * - convertRadix("1010", Radix.Binary, Radix.Decimal) => "10"
   * - convertRadix("7B", Radix.Hexadecimal, Radix.Binary) => "1111011"
   * - convertRadix("123", Radix.Decimal, Radix.Octal) => "173"
   */
  public convertRadix(value: string, fromRadix: Radix, toRadix: Radix): string {
    // 동일한 진법 간 변환 시 추가 연산 없이 반환
    if (toRadix === fromRadix) {
      return value;
    }

    // 2단계 변환 수행:
    // 1. 현재 진법 -> 10진수
    const decimal = this.convertToDecimal(value, fromRadix);
    // 2. 10진수 -> 목표 진법
    return this.convertFromDecimal(decimal, toRadix);
  }
}

export const converter = new RadixConverter();
export const convertRadix = converter.convertRadix.bind(converter);
export const isValidRadixNumber = converter.isValidRadixNumber.bind(converter);
export const isValidBinary = converter.isValidBinary.bind(converter);
export const isValidOctal = converter.isValidOctal.bind(converter);
export const isValidDecimal = converter.isValidDecimal.bind(converter);
export const isValidHexadecimal = converter.isValidHexadecimal.bind(converter);

// console.log(
//   converter.convertRadix(
//     '1111111111111111111111111111111111111111111111111111111111111100',
//     Radix.Binary,
//     Radix.Decimal,
//   ),
// );
// console.log(converter.convertRadix('18446744073709551612', Radix.Decimal, Radix.Binary));

// console.log(BigInt('0b1111111111111111111111111111111111111111111111111111111111111100').toString(10));
