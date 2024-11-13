import { match } from 'ts-pattern';
import { convertRadix, Radix } from './RadixConverter';
import { BigNumber, MathB, typeBigNumber } from './CalculatorTypes';

/**
 * 계산기의 수학 연산을 담당하는 클래스
 * 기본 산술 연산부터 고급 수학 함수까지 다양한 계산 기능 제공
 */
export class CalculatorMath {
  /**
   * ===== 기본 수학 함수 =====
   */

  /**
   * 절대값을 계산하는 메서드
   * @param a 절대값을 구할 숫자 (문자열)
   * @returns 절대값 결과 (문자열)
   */
  public abs(a: string): string {
    return BigNumber(a).abs().toString();
  }

  /**
   * 정수 부분을 추출하는 메서드
   * @param a 정수 부분을 구할 숫자 (문자열)
   * @returns 정수 부분 (문자열)
   */
  public int(a: string): string {
    return BigNumber(a).floor().toString();
  }

  /**
   * 소수 부분을 추출하는 메서드
   * @param a 소수 부분을 구할 숫자 (문자열)
   * @returns 소수 부분 (문자열)
   */
  public frac(a: string): string {
    return BigNumber(a).mod(1).toString();
  }

  /**
   * 팩토리얼을 계산하는 메서드
   * @param a 팩토리얼을 구할 숫자 (문자열)
   * @returns 팩토리얼 결과 (문자열)
   */
  public fct(a: string): string {
    return MathB.factorial(BigNumber(a)).toString();
  }

  /**
   * 10의 거듭제곱을 계산하는 메서드
   * @param a 지수 (문자열)
   * @returns 10^a 결과 (문자열)
   */
  public exp10(a: string): string {
    return BigNumber(10).pow(BigNumber(a)).toString();
  }

  /**
   * ===== 삼각함수 관련 =====
   */

  /**
   * 각도를 라디안으로 변환하는 내부 메서드
   * @param degrees 변환할 각도 (문자열)
   * @returns 라디안 값 (typeof BigNumber)
   */
  private degreesToRadians(degrees: string): typeBigNumber {
    return BigNumber(degrees).times(MathB.pi).div(180);
  }

  /**
   * 사인 값을 계산하는 메서드
   * @param a 각도 (문자열)
   * @returns sin(a) 결과 (문자열)
   */
  public sin(a: string): string {
    return this.degreesToRadians(a).sin().toString();
  }

  /**
   * 코사인 값을 계산하는 메서드
   * @param a 각도 (문자열)
   * @returns cos(a) 결과 (문자열)
   */
  public cos(a: string): string {
    return this.degreesToRadians(a).cos().toString();
  }

  /**
   * 탄젠트 값을 계산하는 메서드
   * @param a 각도 (문자열)
   * @returns tan(a) 결과 (문자열)
   */
  public tan(a: string): string {
    return this.degreesToRadians(a).tan().toString();
  }

  /**
   * ===== 기본 산술 연산 =====
   */

  /**
   * 덧셈을 수행하는 메서드
   * @param a 첫 번째 숫자 (문자열)
   * @param b 두 번째 숫자 (문자열)
   * @returns a + b 결과 (문자열)
   */
  public add(a: string, b: string): string {
    return BigNumber(a).add(BigNumber(b)).toString();
  }

  /**
   * 뺄셈을 수행하는 메서드
   * @param a 첫 번째 숫자 (문자열)
   * @param b 두 번째 숫자 (문자열)
   * @returns a - b 결과 (문자열)
   */
  public sub(a: string, b: string): string {
    return BigNumber(a).sub(BigNumber(b)).toString();
  }

  /**
   * 곱셈을 수행하는 메서드
   * @param a 첫 번째 숫자 (문자열)
   * @param b 두 번째 숫자 (문자열)
   * @returns a × b 결과 (문자열)
   */
  public mul(a: string, b: string): string {
    return BigNumber(a).mul(BigNumber(b)).toString();
  }

  /**
   * 나눗셈을 수행하는 메서드
   * @param a 분자 (문자열)
   * @param b 분모 (문자열)
   * @returns a ÷ b 결과 (문자열)
   * @throws 0으로 나누려고 할 때 에러 발생
   */
  public div(a: string, b: string): string {
    if (b === '0') throw new Error('Division by zero');
    return BigNumber(a).div(BigNumber(b)).toString();
  }

  /**
   * 나머지를 계산하는 메서드
   * @param a 분자 (문자열)
   * @param b 분모 (문자열)
   * @returns a mod b 결과 (문자열)
   * @throws 0으로 나누려고 할 때 에러 발생
   */
  public mod(a: string, b: string): string {
    if (b === '0') throw new Error('Division by zero');
    return BigNumber(a).mod(BigNumber(b)).toString();
  }

  /**
   * 거듭제곱을 계산하는 메서드
   * @param a 밑 (문자열)
   * @param b 지수 (문자열)
   * @returns a^b 결과 (문자열)
   */
  public pow(a: string, b: string): string {
    return BigNumber(a).pow(BigNumber(b)).toString();
  }

  /**
   * 제곱근을 계산하는 메서드
   * @param a 숫자 (문자열)
   * @param b 제곱근의 차수 (문자열)
   * @returns a의 b제곱근 결과 (문자열)
   * @throws 음수의 제곱근을 계산하려 할 때 에러 발생
   */
  public root(a: string, b: string): string {
    if (BigNumber(b).lt(0) && this.mod(this.int(a), '2') === '0')
      throw new Error('The root of a negative number is not allowed.');
    return BigNumber(a).pow(BigNumber(1).div(b)).toString();
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
    if (values.some((value) => BigNumber(value).isNegative())) {
      throw new Error('Negative numbers are not allowed in bit operations');
    }
  }

  /**
   * 주어진 숫자를 지정된 비트 크기로 자르는 메서드
   * @param a 자를 숫자 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns 비트 크기로 자른 결과 (문자열)
   */
  public truncateToBitSize(a: string, wordSize: number = 8): string {
    this.validateNonNegativeNumbers(a);
    return BigNumber(a).mod(BigNumber(2).pow(wordSize)).toString();
  }

  /**
   * 비트 왼쪽 시프트 연산을 수행하는 메서드
   * @param a 시프트할 숫자 (문자열)
   * @param b 시프트할 비트 수 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns 시프트 연산 결과 (문자열)
   */
  public bitShiftLeft(a: string, b: string, wordSize: number = 8): string {
    this.validateNonNegativeNumbers(a, b);
    return this.truncateToBitSize(
      BigNumber(a)
        .abs()
        .floor()
        .mul(BigNumber(2).pow(BigNumber(b).abs().floor()))
        .toString(),
      wordSize,
    );
  }

  /**
   * 비트 오른쪽 시프트 연산을 수행하는 메서드
   * @param a 시프트할 숫자 (문자열)
   * @param b 시프트할 비트 수 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns 시프트 연산 결과 (문자열)
   */
  public bitShiftRight(a: string, b: string, wordSize: number = 8): string {
    this.validateNonNegativeNumbers(a, b);
    return this.truncateToBitSize(
      BigNumber(a)
        .abs()
        .floor()
        .div(BigNumber(2).pow(BigNumber(b).abs().floor()))
        .toString(),
      wordSize,
    );
  }

  /**
   * AND, OR, XOR 비트 연산을 수행하는 내부 메서드
   * @param a 첫 번째 숫자 (문자열)
   * @param b 두 번째 숫자 (문자열)
   * @param operator 수행할 연산자 ('and' | 'or' | 'xor')
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns 비트 연산 결과 (문자열)
   */
  private bitAndOrXor(a: string, b: string, operator: 'and' | 'or' | 'xor', wordSize: number = 8): string {
    this.validateNonNegativeNumbers(a, b);
    const [aBin, bBin] = [a, b].map(
      (n) => convertRadix(
        this.int(this.abs(n)),
        Radix.Decimal,
        Radix.Binary,
      ),
    ) as string[];
    const maxLength = Math.max(aBin.length, bBin.length);
    const [aPadded, bPadded] = [aBin, bBin].map((bin) => (bin as string).padStart(maxLength, '0'));

    const resultBin = [...aPadded]
      .map((_, i) => {
        const [aBit, bBit] = [aPadded[i] === '1', bPadded[i] === '1'];
        return match(operator)
          .with('and', () => aBit && bBit)
          .with('or', () => aBit || bBit)
          .with('xor', () => aBit !== bBit)
          .run()
          ? '1'
          : '0';
      })
      .join('');

    return this.truncateToBitSize(
      convertRadix(resultBin, Radix.Binary, Radix.Decimal),
      wordSize,
    );
  }

  /**
   * AND 비트 연산을 수행하는 메서드
   * @param a 첫 번째 숫자 (문자열)
   * @param b 두 번째 숫자 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns AND 연산 결과 (문자열)
   */
  public bitAnd(a: string, b: string, wordSize: number = 8): string {
    return this.bitAndOrXor(a, b, 'and', wordSize);
  }

  /**
   * OR 비트 연산을 수행하는 메서드
   * @param a 첫 번째 숫자 (문자열)
   * @param b 두 번째 숫자 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns OR 연산 결과 (문자열)
   */
  public bitOr(a: string, b: string, wordSize: number = 8): string {
    return this.bitAndOrXor(a, b, 'or', wordSize);
  }

  /**
   * XOR 비트 연산을 수행하는 메서드
   * @param a 첫 번째 숫자 (문자열)
   * @param b 두 번째 숫자 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns XOR 연산 결과 (문자열)
   */
  public bitXor(a: string, b: string, wordSize: number = 8): string {
    return this.bitAndOrXor(a, b, 'xor', wordSize);
  }

  /**
   * NOT 비트 연산을 수행하는 메서드
   * @param a 비트 반전할 숫자 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns NOT 연산 결과 (문자열)
   */
  public bitNot(a: string, wordSize: number = 8): string {
    this.validateNonNegativeNumbers(a);
    const binary = convertRadix(
      this.int(this.abs(a)),
      Radix.Decimal,
      Radix.Binary,
    );
    // 워드 사이즈에 맞게 이진수 패딩
    const paddedBinary = binary.padStart(wordSize, '0');

    const invertedBinary = [...paddedBinary]
      .map(bit => bit === '1' ? '0' : '1')
      .join('');
    
    return convertRadix(invertedBinary, Radix.Binary, Radix.Decimal);
  }

  /**
   * 2의 보수 연산을 수행하는 메서드
   * @param a 2의 보수를 구할 숫자 (문자열)
   * @param wordSize 비트 크기 (기본값: 8)
   * @returns 2의 보수 연산 결과 (문자열)
   */
  public bitComp(a: string, wordSize: number = 8): string {
    this.validateNonNegativeNumbers(a);
    return this.truncateToBitSize(
      this.add(this.bitNot(a, wordSize), '1'),
      wordSize,
    );
  }
}
