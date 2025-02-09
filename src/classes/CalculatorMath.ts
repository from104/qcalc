import { match } from 'ts-pattern';
import { all, create } from 'mathjs';
import { checkError } from './utils/ErrorUtils';

import type { FactoryFunctionMap } from 'mathjs';

import { convertRadix } from './RadixConverter';
import { Radix } from './RadixConverter';

// MathJS 라이브러리 설정
export const MathB = create(all as FactoryFunctionMap, {
  number: 'BigNumber',
  precision: 64,
});

// BigNumber 타입 정의
export const BigNumber = MathB.bignumber;

/**
 * 수학 상수 정의 객체
 */
const CONSTANTS: { [key: string]: string } = {
  pi: MathB.pi.toFixed(), // 원주율
  pi2: MathB.bignumber(MathB.pi).div(2).toFixed(), // 원주율의 절반
  e: MathB.e.toFixed(), // 자연로그의 밑
  ln2: MathB.log(2).toFixed(), // 자연로그 2
  ln10: MathB.log(10).toFixed(), // 자연로그 10
  phi: MathB.phi.toFixed(), // 황금비
};

/**
 * 계산기 수학 연산 클래스
 * @description
 * 계산기에서 사용되는 모든 수학적 연산을 처리하는 클래스
 *
 * 제공하는 주요 기능:
 * 1. 기본 산술 연산
 *    - 덧셈, 뺄셈, 곱셈, 나눗셈
 *    - 나머지, 거듭제곱
 * 2. 고급 수학 함수
 *    - 삼각함수 (sin, cos, tan)
 *    - 지수/로그
 *    - 팩토리얼
 * 3. 비트 연산
 *    - AND, OR, XOR, NOT
 *    - 시프트 연산
 *
 * 특징:
 * - BigNumber 사용으로 높은 정밀도 보장
 * - 문자열 기반 입/출력으로 정확한 값 처리
 */
export class CalculatorMath {
  /**
   * ===== 기본 수학 함수 =====
   */

  /**
   * 절대값을 계산하는 메서드
   * @param value 절대값을 구할 숫자 (문자열)
   * @returns 절대값 결과 (문자열)
   */
  public abs(value: string): string {
    return BigNumber(value).abs().toFixed();
  }

  /**
   * 정수 부분을 추출하는 메서드
   * @param value 정수 부분을 구할 숫자 (문자열)
   * @returns 정수 부분 (문자열)
   */
  public int(value: string): string {
    return BigNumber(value).floor().toFixed();
  }

  /**
   * 소수 부분을 추출하는 메서드
   * @param value 소수 부분을 구할 숫자 (문자열)
   * @returns 소수 부분 (문자열)
   */
  public frac(value: string): string {
    return BigNumber(value).mod(1).toFixed();
  }

  /**
   * 팩토리얼을 계산하는 메서드
   * @param value 팩토리얼을 구할 숫자 (문자열)
   * @returns 팩토리얼 결과 (문자열)
   */
  public fact(value: string): string {
    return MathB.factorial(BigNumber(value)).toFixed();
  }

  /**
   * 10의 거듭제곱을 계산하는 메서드
   * @param exponent 지수 (문자열)
   * @returns 10^exponent 결과 (문자열)
   */
  public exp10(exponent: string): string {
    return BigNumber(10).pow(BigNumber(exponent)).toFixed();
  }

  /**
   * ===== 삼각함수 관련 =====
   */

  /**
   * 각도를 라디안으로 변환하는 내부 메서드
   * @param degrees 변환할 각도 (문자열)
   * @returns 라디안 값 (typeof BigNumber)
   */
  private convertDegreesToRadians(degrees: string): BigNumberType {
    return BigNumber(degrees).times(MathB.pi).div(180);
  }

  /**
   * 사인 값을 계산하는 메서드
   * @param angle 각도 (문자열)
   * @returns sin(angle) 결과 (문자열)
   */
  public sin(angle: string): string {
    return this.convertDegreesToRadians(angle).sin().toFixed();
  }

  /**
   * 코사인 값을 계산하는 메서드
   * @param angle 각도 (문자열)
   * @returns cos(angle) 결과 (문자열)
   */
  public cos(angle: string): string {
    return this.convertDegreesToRadians(angle).cos().toFixed();
  }

  /**
   * 탄젠트 값을 계산하는 메서드
   * @param angle 각도 (문자열)
   * @returns tan(angle) 결과 (문자열)
   */
  public tan(angle: string): string {
    return this.convertDegreesToRadians(angle).tan().toFixed();
  }

  /**
   * ===== 기본 산술 연산 =====
   */

  /**
   * 덧셈을 수행하는 메서드
   * @param augend 첫 번째 숫자 (문자열)
   * @param addend 두 번째 숫자 (문자열)
   * @returns augend + addend 결과 (문자열)
   */
  public add(augend: string, addend: string): string {
    return BigNumber(augend).add(BigNumber(addend)).toFixed();
  }

  /**
   * 뺄셈을 수행하는 메서드
   * @param minuend 첫 번째 숫자 (문자열)
   * @param subtrahend 두 번째 숫자 (문자열)
   * @returns minuend - subtrahend 결과 (문자열)
   */
  public sub(minuend: string, subtrahend: string): string {
    return BigNumber(minuend).sub(BigNumber(subtrahend)).toFixed();
  }

  /**
   * 곱셈을 수행하는 메서드
   * @param multiplicand 첫 번째 숫자 (문자열)
   * @param multiplier 두 번째 숫자 (문자열)
   * @returns multiplicand × multiplier 결과 (문자열)
   */
  public mul(multiplicand: string, multiplier: string): string {
    return BigNumber(multiplicand).mul(BigNumber(multiplier)).toFixed();
  }

  /**
   * 나눗셈을 수행하는 메서드
   * @param dividend 분자 (문자열)
   * @param divisor 분모 (문자열)
   * @returns dividend ÷ divisor 결과 (문자열)
   * @throws 0으로 나누려고 할 때 에러 발생
   */
  public div(dividend: string, divisor: string): string {
    checkError(BigNumber(divisor).eq(0), 'error.math.divide_by_zero');

    const result = BigNumber(dividend).div(divisor);
    checkError(!result.isFinite(), 'error.math.division_error');

    return result.toFixed();
  }

  /**
   * 나머지를 계산하는 메서드
   * @param dividend 분자 (문자열)
   * @param divisor 분모 (문자열)
   * @returns dividend mod divisor 결과 (문자열)
   * @throws 0으로 나누려고 할 때 에러 발생
   */
  public mod(dividend: string, divisor: string): string {
    checkError(BigNumber(divisor).eq(0), 'error.math.divide_by_zero');
    return BigNumber(dividend).mod(BigNumber(divisor)).toFixed();
  }

  /**
   * 거듭제곱을 계산하는 메서드
   * @param base 밑 (문자열)
   * @param exponent 지수 (문자열)
   * @returns base^exponent 결과 (문자열)
   */
  public pow(base: string, exponent: string): string {
    return BigNumber(base).pow(BigNumber(exponent)).toFixed();
  }

  /**
   * 제곱근을 계산하는 메서드
   * @param radicand 숫자 (문자열)
   * @param index 제곱근의 차수 (문자열)
   * @returns radicand의 index제곱근 결과 (문자열)
   * @throws 음수의 제곱근을 계산하려 할 때 에러 발생
   */
  public root(radicand: string, index: string): string {
    const bnRadicand = BigNumber(radicand);
    const bnIndex = BigNumber(index);

    checkError(bnIndex.lt(0), 'error.math.negative_root_index');

    const isEvenRoot = this.mod(this.int(index), '2') === '0';
    checkError(bnRadicand.isNegative() && isEvenRoot, 'error.math.negative_root');

    const result = bnRadicand.pow(MathB.bignumber(1).div(bnIndex));
    return result.toFixed();
  }

  /**
   * ===== 비트 연산 =====
   */

  /**
   * 비트 연산에서 음수 입력 여부를 검사하는 내부 메서드
   * @param values 검사할 숫자들 (문자열 배열)
   * @throws 음수가 입력되면 에러 발생
   */
  private validateNonNegativeNumbers(...values: string[]): void {
    checkError(
      values.some((value) => BigNumber(value).isNegative()),
      'error.math.negative_bit_operation',
    );
  }

  /**
   * 주어진 숫자를 지정된 비트 크기로 자르는 메서드
   * @param value 자를 숫자 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns 비트 크기로 자른 결과 (문자열)
   */
  public truncateToBitSize(value: string, wordSize: number = 8): string {
    this.validateNonNegativeNumbers(value);
    return wordSize === 0
      ? BigNumber(value).floor().toFixed()
      : BigNumber(value).mod(BigNumber(2).pow(wordSize)).floor().toFixed();
  }

  /**
   * 비트 왼쪽 시프트 연산을 수행하는 메서드
   * @param value 시프트할 숫자 (문자열)
   * @param shiftAmount 시프트할 비트 수 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns 시프트 연산 결과 (문자열)
   */
  public bitwiseLeftShift(value: string, shiftAmount: string, wordSize: number = 8): string {
    this.validateNonNegativeNumbers(value, shiftAmount);
    return this.truncateToBitSize(
      BigNumber(value)
        .abs()
        .floor()
        .mul(BigNumber(2).pow(BigNumber(shiftAmount).abs().floor()))
        .toFixed(),
      wordSize,
    );
  }

  /**
   * 비트 오른쪽 시프트 연산을 수행하는 메서드
   * @param value 시프트할 숫자 (문자열)
   * @param shiftAmount 시프트할 비트 수 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns 시프트 연산 결과 (문자열)
   */
  public bitwiseRightShift(value: string, shiftAmount: string, wordSize: number = 8): string {
    this.validateNonNegativeNumbers(value, shiftAmount);
    return this.truncateToBitSize(
      BigNumber(value)
        .abs()
        .floor()
        .div(BigNumber(2).pow(BigNumber(shiftAmount).abs().floor()))
        .toFixed(),
      wordSize,
    );
  }

  /**
   * AND, OR, XOR 비트 연산을 수행하는 내부 메서드
   * @param firstValue 첫 번째 숫자 (문자열)
   * @param secondValue 두 번째 숫자 (문자열)
   * @param operation 수행할 연산자 ('and' | 'or' | 'xor')
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns 비트 연산 결과 (문자열)
   */
  private performBitOperation(
    firstValue: string,
    secondValue: string,
    operation: 'and' | 'or' | 'xor',
    wordSize: number = 8,
  ): string {
    this.validateNonNegativeNumbers(firstValue, secondValue);
    const [firstBinary, secondBinary] = [firstValue, secondValue].map((n) =>
      convertRadix(this.int(this.abs(n)), Radix.Decimal, Radix.Binary),
    ) as string[];
    const maxLength = Math.max(firstBinary?.length ?? 0, secondBinary?.length ?? 0);
    const [firstPadded, secondPadded] = [firstBinary, secondBinary].map((binary) =>
      (binary as string).padStart(maxLength, '0'),
    );

    const resultBinary = [...(firstPadded ?? '')]
      .map((_, index) => {
        const [firstBit, secondBit] = [firstPadded?.[index] === '1', secondPadded?.[index] === '1'];
        return match(operation)
          .with('and', () => firstBit && secondBit)
          .with('or', () => firstBit || secondBit)
          .with('xor', () => firstBit !== secondBit)
          .run()
          ? '1'
          : '0';
      })
      .join('');

    return this.truncateToBitSize(convertRadix(resultBinary, Radix.Binary, Radix.Decimal), wordSize);
  }

  /**
   * AND 비트 연산을 수행하는 메서드
   * @param firstValue 첫 번째 숫자 (문자열)
   * @param secondValue 두 번째 숫자 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns AND 연산 결과 (문자열)
   */
  public bitwiseAnd(firstValue: string, secondValue: string, wordSize: number = 8): string {
    return this.performBitOperation(firstValue, secondValue, 'and', wordSize);
  }

  /**
   * OR 비트 연산을 수행하는 메서드
   * @param firstValue 첫 번째 숫자 (문자열)
   * @param secondValue 두 번째 숫자 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns OR 연산 결과 (문자열)
   */
  public bitwiseOr(firstValue: string, secondValue: string, wordSize: number = 8): string {
    return this.performBitOperation(firstValue, secondValue, 'or', wordSize);
  }

  /**
   * XOR 비트 연산을 수행하는 메서드
   * @param firstValue 첫 번째 숫자 (문자열)
   * @param secondValue 두 번째 숫자 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns XOR 연산 결과 (문자열)
   */
  public bitwiseXor(firstValue: string, secondValue: string, wordSize: number = 8): string {
    return this.performBitOperation(firstValue, secondValue, 'xor', wordSize);
  }

  /**
   * NOT 비트 연산을 수행하는 메서드
   * @param value 비트 반전할 숫자 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns NOT 연산 결과 (문자열)
   */
  public bitwiseNot(value: string, wordSize: number = 8): string {
    this.validateNonNegativeNumbers(value);
    const binary = convertRadix(this.int(this.abs(value)), Radix.Decimal, Radix.Binary);
    const paddedBinary = binary.padStart(Math.max(binary.length, wordSize), '0');

    const invertedBinary = [...paddedBinary].map((bit) => (bit === '1' ? '0' : '1')).join('');

    return this.truncateToBitSize(convertRadix(invertedBinary, Radix.Binary, Radix.Decimal), wordSize);
  }

  /**
   * NAND, NOR, NXOR 비트 연산을 수행하는 메서드
   * @param firstValue 첫 번째 숫자 (문자열)
   * @param secondValue 두 번째 숫자 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns 비트 연산 결과 (문자열)
   */

  public bitwiseNand(firstValue: string, secondValue: string, wordSize: number = 8): string {
    return this.bitwiseNot(this.bitwiseAnd(firstValue, secondValue, wordSize), wordSize);
  }

  public bitwiseNor(firstValue: string, secondValue: string, wordSize: number = 8): string {
    return this.bitwiseNot(this.bitwiseOr(firstValue, secondValue, wordSize), wordSize);
  }

  public bitwiseXnor(firstValue: string, secondValue: string, wordSize: number = 8): string {
    return this.bitwiseNot(this.bitwiseXor(firstValue, secondValue, wordSize), wordSize);
  }

  /**
   * 수학 상수 값을 조회하는 메서드
   * @param constant - 조회 상수의 이름 (예: 'PI', 'E' 등)
   * @returns 요청한 상수의 문자열 값
   * @throws {Error} 존재하지 않는 상수를 요청할 경우 에러 발생
   */
  public getConstant(constant: keyof typeof CONSTANTS): string {
    const value = CONSTANTS[constant];
    checkError(!value, 'error.calc.constant_not_found');
    return value as string;
  }
}
