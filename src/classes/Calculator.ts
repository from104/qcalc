import { create, all, BigNumber } from 'mathjs';
import { CalculatorHistory } from './CalculatorHistory';
import { Radix, RadixConverter } from './RadixConverter';

/**
 * MathJS 라이브러리 설정
 * - BigNumber 타입 사용으로 정밀한 계산 지원
 * - 정밀도 64비트로 설정하여 높은 정확도 보장
 */
const MathB = create(all, {
  number: 'BigNumber',
  precision: 64,
});

/**
 * 계산기에서 사용되는 연산자 열거형
 * @enum {number}
 * @description
 * - None: 연산자 없음 (초기 상태)
 * - Plus: 덧셈 (+)
 * - Minus: 뺄셈 (-)
 * - Mul: 곱셈 (×)
 * - Div: 나눗셈 (÷)
 * - Pct: 퍼센트 (%)
 * - Pow: 거듭제곱 (x^y)
 * - Root: 제곱근 (y√x)
 * - Mod: 나머지 (mod)
 * - Rec: 역수 (1/x)
 * - Sqrt: 제곱근 (√x)
 * - Pow2: 제곱 (x²)
 * - Sin: 사인 함수
 * - Cos: 코사인 함수
 * - Tan: 탄젠트 함수
 * - Fct: 팩토리얼 (x!)
 * - Exp10: 10의 거듭제곱 (10^x)
 * - Int: 정수부 추출
 * - Frac: 소수부 추출
 */
export enum Operator {
  None,
  Plus,
  Minus,
  Mul,
  Div,
  Pct,
  Pow,
  Root,
  Mod,
  Rec,
  Sqrt,
  Pow2,
  Sin,
  Cos,
  Tan,
  Fct,
  Exp10,
  Int,
  Frac,
}

/**
 * 연산자와 문자열 간의 매핑 객체
 * @description
 * 각 연산자에 대한 문자열 표현을 정의
 * 예: '+' -> Operator.Plus, '×' -> Operator.Mul
 */
export const operatorMap: {[key: string]: Operator} = {
  '': Operator.None,
  '+': Operator.Plus,
  '-': Operator.Minus,
  '×': Operator.Mul,
  '÷': Operator.Div,
  '%': Operator.Pct,
  pow: Operator.Pow,
  root: Operator.Root,
  mod: Operator.Mod,
  rec: Operator.Rec,
  sqrt: Operator.Sqrt,
  pow2: Operator.Pow2,
  sin: Operator.Sin,
  cos: Operator.Cos,
  tan: Operator.Tan,
  fct: Operator.Fct,
  exp10: Operator.Exp10,
  int: Operator.Int,
  frac: Operator.Frac,
};

/**
 * 수학 상수 정의 객체
 * @description
 * 자주 사용되는 수학 상수들을 BigNumber 형식으로 저장
 * - pi: 원주율 (π)
 * - pi2: π/2
 * - e: 자연상수
 * - ln2: 2의 자연로그
 * - ln10: 10의 자연로그
 * - phi: 황금비
 */
const constants: {[key: string]: string} = {
  pi: MathB.pi.toString(),
  pi2: MathB.bignumber(MathB.pi).div(2).toString(),
  e: MathB.e.toString(),
  ln2: MathB.log(2).toString(),
  ln10: MathB.log(10).toString(),
  phi: MathB.phi.toString(),
};

/**
 * 계산 결과 스냅샷 인터페이스
 * @interface
 * @description
 * 계산 과정과 결과를 저장하기 위한 데이터 구조
 * @property {BigNumber} previousNumber - 이전 숫자 (피연산자1)
 * @property {string} operator - 수행된 연산자
 * @property {BigNumber} [argumentNumber] - 현재 숫자 (피연산자2, 선택적)
 * @property {BigNumber} resultNumber - 계산 결과
 */
export interface ResultSnapshot {
  previousNumber: string;
  operator: Operator | Operator[];
  argumentNumber?: string;
  resultNumber: string;
}

/**
 * 계산기 클래스
 * @class
 * @description
 * 고급 수학 계산 기능을 제공하는 계산기 구현
 *
 * 주요 기능:
 * - 기본 산술 연산 (덧셈, 뺄셈, 곱셈, 나눗셈)
 * - 고급 수학 함수 (삼각함수, 지수/로그, 팩토리얼 등)
 * - 메모리 기능 (저장, 호출, 더하기, 빼기, 초기화)
 * - 계산 히스토리 관리 (저장, 조회, 삭제)
 * - BigNumber를 사용한 정밀 계산
 *
 * 특징:
 * - 연속 계산 지원 (이전 결과에 이어서 계산)
 * - 자동 소수점 처리 및 정밀도 관리
 * - 오류 처리 및 예외 상황 대응
 * - 메모리 기능을 통한 중간 결과 저장
 * - 계산 히스토리의 영구 저장 및 관리
 *
 * @see {@link CalculatorHistory} 계산 히스토리 관리
 * @see {@link Operator} 지원되는 연산자 목록
 * @see {@link ResultSnapshot} 계산 결과 스냅샷 형식
 */
export class Calculator {
  private _buffer!: string; // 입력 버퍼
  private _currentNumber!: string; // string -> BigNumber
  private previousNumber!: string; // string -> BigNumber
  private repeatedNumber!: string; // string -> BigNumber
  private memoryNumber!: string; // string -> BigNumber
  private isMemoryReset!: boolean; // 메모리 초기화 상태 플래그
  private currentOperator!: Operator; // 현재 선택된 연산자
  private shouldReset!: boolean; // 다음 입력시 화면 리셋 필요 여부
  private resultSnapshot!: ResultSnapshot; // 최근 계산 결과 스냅샷

  public readonly history!: CalculatorHistory; // 계산 히스토리 관리자

  private _radix: Radix = Radix.Decimal; // 현재 사용 중인 진법 (10진수 기본)

  private radixConverter: RadixConverter = new RadixConverter();

  get buffer(): string {
    return this._buffer;
  }

  set buffer(value: string) {
    this._buffer = value;
    this.setBufferToCurrentNumber();
  }

  get currentNumber(): string {
    return this._currentNumber;
  }

  set currentNumber(value: string) {
    this._currentNumber = value;
    this.setCurrentNumberToBuffer();
  }

  get radix(): Radix {
    return this._radix;
  }

  set radix(value: Radix) {
    this._radix = value;
    this.setCurrentNumberToBuffer();
  }

  /**
   * 계산기 생성자
   * @description
   * 계산기 객체를 초기화하고 기본 상태를 설정합니다.
   * - 모든 숫자 값을 초기화
   * - 메모리를 초기화
   * - 계산 히스토리 관리 객체 생성
   */
  constructor() {
    // 기본 상태 초기화
    this.clear();
    // 메모리 초기화
    this.memoryClear();
    // 히스토리 관리 객체 생성
    this.history = new CalculatorHistory();
  }

  /**
   * 계산기 상태 초기화
   * @description
   * 계산기의 모든 상태를 초기 값으로 재설정합니다.
   * - previousNumber: 이전 계산에 사용된 숫자를 '0'으로 초기화
   * - repeatedNumber: 연속 계산에 사용되는 반복 숫자를 '0'으로 초기화
   * - currentNumber: 현재 입력/표시 중인 숫자를 '0'으로 초기화
   * - currentOperator: 현재 선택된 연산자를 None으로 초기화
   * - shouldReset: 다음 입력 시 화면 초기화 필요 여부를 false로 설정
   */
  public clear(): void {
    this.buffer = '0';
    this.currentNumber = '0';
    this.previousNumber = '0';
    this.repeatedNumber = '0';
    this.currentOperator = Operator.None;
    this.shouldReset = false;
  }

  public getRadix(): Radix {
    return this.radix;
  }

  public setRadix(radix: Radix | number | string): void {
    if (typeof radix === 'number') {
      switch (radix) {
        case 2:
          this.radix = Radix.Binary;
          break;
        case 8:
          this.radix = Radix.Octal;
          break;
        case 16:
          this.radix = Radix.Hexadecimal;
          break;
        case 10:
          this.radix = Radix.Decimal;
          break;
        default:
          throw new Error('Unsupported radix');
      }
    } else if (typeof radix === 'string') {
      const normalizedRadix = radix.toLowerCase();
      if (normalizedRadix === 'dec' || normalizedRadix === '10') {
        this.radix = Radix.Decimal;
      } else if (Object.values(Radix).includes(normalizedRadix as Radix) || ['2', '8', '16'].includes(normalizedRadix)) {
        this.radix = this.convertToRadixKey(normalizedRadix) as Radix;
      } else {
        throw new Error('Unsupported radix');
      }
    } else {
      this.radix = radix;
    }
  }

  /**
   * 문자열로 입력된 진수값을 RadixConverter에서 사용하는 키값으로 변환하는 메소드
   * @param {string} value - 변환할 진수값 ('2', '8', '16' 또는 'bin', 'oct', 'hex')
   * @returns {keyof typeof RadixConverter.RADIX_MAP | 'dec'} 변환된 진수 키값
   * @throws {Error} 지원하지 않는 진수값이 입력된 경우 에러 발생
   * @description
   * - 입력된 문자열을 소문자로 정규화하여 처리
   * - 숫자형 문자열('2', '8', '16')과 문자형('bin', 'oct', 'hex') 모두 처리 가능
   * - 2진수는 'bin', 8진수는 'oct', 16진수는 'hex'로 변환
   * - 지원하지 않는 진수값이 입력되면 'Unsupported radix' 에러 발생
   */
  private convertToRadixKey(value: string): Radix {
    switch (value.toLowerCase()) {
      case '2':
      case 'bin':
        return Radix.Binary;
      case '8':
      case 'oct':
        return Radix.Octal;
      case '16':
      case 'hex':
        return Radix.Hexadecimal;
      default:
        throw new Error('Unsupported radix');
    }
  }

  /**
   * 계산 결과의 스냅샷을 내부 상태에 저장합니다.
   * @param history - 저장할 계산 결과 스냅샷 객체
   * @description
   * - 계산기의 현재 상태를 스냅샷 형태로 보관
   * - 이전 계산 결과를 추적하고 복원하는데 사용
   * - ResultSnapshot 타입의 객체를 그대로 저장
   */
  private saveResultSnapshot(history: ResultSnapshot): void {
    this.resultSnapshot = history;
  }

  /**
   * 계산 결과를 히스토리에 추가하고 결과값을 반환합니다.
   * @param history - 히스토리에 추가할 계산 결과 스넵샷 객체
   * @returns 계산 결과값을 문자열로 반환
   * @description
   * - 계산 결과를 내부 스냅샷으로 저장
   * - 히스토리 관리자에 결과를 추가하여 기록 유지
   * - 안전한 null 체크 후 히스토리 추가 수행
   * - 계산된 최종 결과값 반환
   */
  private addHistory(history: ResultSnapshot): string {
    this.saveResultSnapshot(history);
    this.history?.addHistory(history);
    return history.resultNumber;
  }

  /**
   * 히스토리 초기화 메서드
   * @description
   * - 가장 오래된 히스토리 항목을 제거
   * - 결과 스냅샷을 기본값으로 초기화
   * - 계산기의 메모리 관리를 위해 사용됨
   */
  private shiftHistory(): void {
    // 결과 스냅샷을 기본 상태로 초기화
    this.resultSnapshot = {
      previousNumber: '', // 이전 숫자를 0으로 설정
      operator: Operator.None, // 연산자를 빈 문자열로 설정
      argumentNumber: '', // 인수 숫자를 0으로 설정
      resultNumber: '', // 결과 숫자를 0으로 설정
    };

    // 히스토리 관리자의 shiftHistory 메서드 호출
    this.history?.shiftHistory();
  }

  /**
   * 문자열에서 유효한 숫자만 추출하는 메서드
   * @param originalString - 처리할 원본 문자열
   * @returns 정제된 숫자 문자열
   * @description
   * - 입력된 문자열에서 숫자, 소수점, 음수 부호만 추출
   * - 음수 처리 및 소수점 정규화 수행
   * - BigNumber 형식으로 변환하여 정확한 숫자 표현 보장
   */
  private filterNumberCharacters(originalString: string): string {
    // 숫자, 소수점, 음수 부호만 추출
    let onlyNumber = (() => {
      switch (this.radix) {
        case 'hex':
          return originalString.replace(/[^0-9a-fA-F.\-]/gm, '').toUpperCase();
        case 'oct':
          return originalString.replace(/[^0-7.\-]/gm, '');
        case 'bin':
          return originalString.replace(/[^0-1.\-]/gm, '');
        default:
          return originalString.replace(/[^0-9.\-]/gm, '');
      }
    })();

    // 음수 여부 확인
    const isNegative = onlyNumber.startsWith('-');

    // 모든 음수 부호 거
    onlyNumber = onlyNumber.replace(/-/g, '');

    // 정수부와 소수부 분리
    const [integerPart, ...fractionParts] = onlyNumber.split('.');

    // 기본 결과값 설정 (정수부가 없으면 '0' 사용)
    let result = integerPart || '0';

    // 소수부가 있으면 추가
    if (fractionParts.length > 0) {
      result += '.' + fractionParts.join('');
    }

    // BigNumber로 변환하고 음수 부호 처리
    return (isNegative ? '-' : '') + result;
  }

  public getBuffer(): string {
    return this._buffer;
  }

  /**
   * 현재 숫자를 설정하는 메서드
   * @param s - 설정할 숫자 문자열
   * @description
   * - 입력된 문자열을 최대 64자까지만 처리
   * - extractNumberString을 통해 유효한 숫자로 변환
   * - 초기화 플래그를 false로 설정
   */
  public setCurrentNumber(s: string): void {
    this.buffer = this.filterNumberCharacters(s.substring(0, 64));

    this.shouldReset = false;
  }

  /**
   * 현재 계산기에 표시된 숫자를 문자열 형태로 반환하는 메서드
   * @returns {string} 현재 입력되어 있거나 계산된 숫자 값
   * @description
   * - 계산기의 디스플레이에 표시될 현재 숫자를 반환
   * - 숫자는 문자열 형태로 반환되어 정확한 표현이 가능
   */
  public getCurrentNumber(): string {
    return this.currentNumber.toString();
  }

  /**
   * 이전에 입력되었 숫자를 문자열 형태로 반환하는 메서드
   * @returns {string} 이전 연산에 사용된 숫자 값
   * @description
   * - 연산자 입력 전의 이전 숫자를 저장하고 있는 값을 반환
   * - 연속 계산 시 이전 결과값으로 사용됨
   */
  public getPreviousNumber(): string {
    return this.previousNumber;
  }

  /**
   * 계산기의 숫자 초기화 필요 여부를 반환하는 메서드
   * @returns {boolean} 초기화 필요 여부
   * @description
   * - true: 다음 숫자 입력 시 현재 표시된 숫자를 새로운 숫자로 대체
   * - false: 다음 숫자 입력 시 현재 숫자에 이어서 입력
   * - 주로 연산자 입력 후나 계산 완료 후 새로운 숫자 입력을 위해 사용
   */
  public getShouldReset(): boolean {
    return this.shouldReset;
  }

  private setBufferToCurrentNumber(): void {
    this._currentNumber = this.radixConverter.convertRadix(this.buffer, this.radix as Radix, Radix.Decimal);
  }

  private setCurrentNumberToBuffer(): void {
    this._buffer = this.radixConverter.convertRadix(this.currentNumber.toString(), Radix.Decimal, this.radix as Radix);
  }

  /**
   * 계산기에 숫자를 추가하는 메서드
   * @param digit - 추가할 숫자 (문자열 또는 숫자 타입)
   * @description
   * - 입력된 숫자를 파싱하여 유효성 검사 후 현재 숫자에 추가
   * - 문자열이나 숫자 타입 모두 처리 가능
   * - 유효하지 않은 입력은 무시됨
   */
  public addDigit(digit: number | string): void {
    const parsedDigit = this.parseDigit(digit);
    if (this.isValidDigit(parsedDigit)) {
      this.updateCurrentNumber(parsedDigit);
    }
  }

  /**
   * 입력된 숫자를 파싱하여 정수로 변환하는 private 메서드
   * @param digit - 변환할 숫자 (문자열 또는 숫자 타입)
   * @returns {number} 파싱된 정수값 (0-9)
   * @description
   * - 문자열인 경우: 첫 번째 문자만 추출하여 정수로 변환, 실패 시 0 반환
   * - 숫자인 경우: Math.floor()를 사용하여 소수점 이하 버림
   */
  private parseDigit(digit: number | string): string {
    return typeof digit === 'string' ? digit.charAt(0) : Math.floor(digit).toString();
  }

  /**
   * 숫자의 유효성을 검사하는 private 메서드
   * @param digit - 검사할 숫자
   * @returns {boolean} 유효성 여부
   * @description
   * - 현재 설정된 진법(this.radix)에 맞는 유효한 숫자인지 검사
   * - 2진수: 0-1
   * - 8진수: 0-7
   * - 10진수: 0-9
   * - 16진수: 0-9, A-F
   * - 범위를 벗어나거나 소수점이 있는 경우 false 반환
   */
  private isValidDigit(digit: number | string): boolean {
    switch (this.radix) {
      case 'bin':
        return Number(digit) >= 0 && Number(digit) <= 1;
      case 'oct':
        return Number(digit) >= 0 && Number(digit) <= 7;
      case 'hex':
        return (Number(digit) >= 0 && Number(digit) <= 9) || (typeof digit === 'string' && /^[A-Fa-f]$/.test(digit));
      case 'dec':
      default:
        return Number(digit) >= 0 && Number(digit) <= 9;
    }
  }

  /**
   * 현재 숫자를 업데이트하는 private 메서드
   * @param digitString - 추가할 숫자 문자열
   * @description
   * - 현재 숫자가 '0'이거나 shouldReset이 true인 경우:
   *   - 입력된 숫자로 현재 숫자를 대체
   *   - shouldReset 플래그를 false로 설정
   * - 그 외의 경우:
   *   - 현재 숫자 뒤에 새로운 숫자를 추가
   */
  private updateCurrentNumber(digit: string): void {
    if (this.currentNumber === '0' || this.shouldReset) {
      this.buffer = digit;
      this.shouldReset = false;
    } else {
      this.buffer = this.buffer + digit;
    }
    this.setBufferToCurrentNumber();
  }

  /**
   * 소수점을 추가하는 public 메서드
   * @description
   * - shouldReset이 true인 경우:
   *   - 현재 숫자를 '0.'으로 초기화
   *   - shouldReset 플래그를 false로 설정
   * - 현재 숫자에 소수점이 없고, 현재 진법에서 유효한 경우에만 추가
   * - 이미 소수점이 있는 경우:
   *   - 아무 동작도 하지 않음 (중복 소수점 방지)
   */
  public addDot(): void {
    // 초기화가 필요한 경우
    if (this.shouldReset) {
      this.buffer = '0.';
      this.shouldReset = false;
    }
    // 소수점이 없고, 현재 진법에서 유효한 경우에만 추가
    else if (!this.buffer.includes('.') && 
             this.radixConverter.isValidRadixNumber(this.buffer + '.', this.radix)) {
      this.buffer = this.buffer + '.';
    }

    this.setBufferToCurrentNumber();
  }

  /**
   * 숫자 또는 소수점을 삭제하는 public 메서드
   * @description
   * - 현재 숫자가 한 자리 숫자이거나 음수 한 자리 숫자인 경우:
   *   - 현재 숫자를 '0'으로 초기화
   * - 현재 숫자가 '-0'인 경우:
   *   - 현재 숫자를 '0'으로 초기화
   * - 그 외의 경우:
   *   - 현재 숫자의 마지막 문자를 제거
   */
  public deleteDigitOrDot(): void {
    if (this.buffer.match(/^-?\d$/) || this.buffer === '-0') {
      this.buffer = '0';
    } else {
      this.buffer = this.buffer.slice(0, -1);
    }
    this.setBufferToCurrentNumber();
  }

  /**
   * 부동소수점 숫자를 문자열로 변환하는 private 메서드
   * @param numberForCalc - 변환할 숫자 문자열
   * @returns 정수부와 소수부가 포함된 문자열
   * @description
   * - 입력된 숫자를 소수점을 기준으로 정수부와 소수부로 분리
   * - 소수부가 있는 경우: 정수부와 소수부를 소수점으로 연결
   * - 소수부가 없는 경우: 정수부만 반환
   */
  // private numberToString(numberForCalc: string): string {
  //   const [integer, decimal] = numberForCalc.split('.');
  //   return decimal ? `${integer}.${decimal}` : integer;
  // }

  /**
   * 현재 숫자의 부호를 변환하는 public 메서드
   * @description
   * - 현재 숫자를 BigNumber 객체로 변환
   * - -1을 곱하여 부호를 반전
   * - 결과를 문자열로 변환하여 현재 숫자에 저장
   */
  public changeSign(): void {
    this.buffer = /^-/.test(this.buffer) ? this.buffer.slice(1) : '-' + this.buffer;
    this.setBufferToCurrentNumber();
  }

  /**
   * 이전 숫자를 현재 숫자로 설정하는 private 메서드
   * @description
   * - 이전에 저장된 숫자(previousNumber)를 현재 숫자(currentNumber)로 복사
   * - 계산 과정에서 이전 결과를 현재 입력으로 가져올 때 사용
   */
  private setCurrentNumberFromPrevious(): void {
    this.currentNumber = this.previousNumber;
    this.setCurrentNumberToBuffer();
  }

  /**
   * 현재 숫자를 이전 숫자로 설정하는 private 메서드
   * @description
   * - 현재 입력된 숫자(currentNumber)를 이전 숫자(previousNumber)로 저장
   * - 연속 계산 시 현재 입력을 이전 값으로 보존하기 위해 사용
   */
  private setPreviousNumberFromCurrent(): void {
    this.previousNumber = this.currentNumber;
  }

  /**
   * 사전 계산을 수행하는 private 메서드
   * @description
   * - 계산에 사용할 숫자 결정:
   *   - shouldReset이 true면 repeatedNumber 사용
   *   - shouldReset이 false면 currentNumber 사용
   * - 초기 상태(shouldReset=true, numberForCalc='0')면 계산 중단
   * - shouldReset이 false일 때 현재 숫자를 반복 숫자로 저장
   * - calculateResult()로 실제 계산 수행
   * - 계산 이력에 기록하고 결과를 이전 숫자로 저장
   */
  private performPreCalculation(): void {
    // 계산에 사용할 숫자 결정
    const numberForCalc = this.shouldReset ? this.repeatedNumber : this.currentNumber;

    // 초기 상태면 계산 중단
    if (this.shouldReset && numberForCalc === '0') {
      return;
    }

    // 반복 계산을 위한 숫자 저장
    if (!this.shouldReset) {
      this.repeatedNumber = numberForCalc;
    }

    // 계산 수행 및 이력 기록
    const result = this.calculateResult(numberForCalc);
    this.previousNumber = this.addHistory({
      previousNumber: this.previousNumber.toString(),
      operator: this.currentOperator,
      argumentNumber: numberForCalc.toString(),
      resultNumber: result.toString(),
    });
  }

  /**
   * 실제 계산을 수행하는 메서드
   * @param numberForCalc - 계산에 사용할 숫자 (문자열 형식)
   * @returns 계산 결과 (문자열 형식)
   * @throws 0으로 나누기를 시도할 때 오류 발생
   */
  private calculateResult(numberForCalc: string): string {
    // 이전 숫자와 현재 숫자를 BigNumber 객체로 변환
    const prev = this.previousNumber;
    const curr = numberForCalc;

    // 현재 연산자에 따라 계산 수행
    switch (this.currentOperator) {
      case Operator.Plus:
        return MathB.bignumber(prev).add(curr).toString(); // 덧셈 연산
      case Operator.Minus:
        return MathB.bignumber(prev).sub(curr).toString(); // 뺄셈 연산
      case Operator.Mul:
        return MathB.bignumber(prev).mul(curr).toString(); // 곱셈 연산
      case Operator.Div:
        if (curr === '0') throw new Error('Cannot divide by zero.'); // 0으로 나누기 방지
        return MathB.bignumber(prev).div(curr).toString(); // 나눗셈 연산
      case Operator.Pow:
        return MathB.bignumber(prev).pow(curr).toString(); // 거듭제곱 연산
      case Operator.Root:
        return MathB.bignumber(prev).pow(MathB.bignumber(1).div(curr)).toString(); // 루트 연산
      case Operator.Mod:
        return MathB.bignumber(prev).mod(curr).toString(); // 나머지 연산
      default:
        return this.previousNumber; // 기본값으로 이전 숫자 반환
    }
  }

  /**
   * 연산자를 적용하고 계산을 수행하는 메서드
   * @param operator - 수행할 연산자 (Plus, Minus, Mul 등)
   * @description
   * 1. 현재 연산자가 없는 경우:
   *    - 현재 입력된 숫자를 이전 숫자로 저장
   * 2. 현재 연산자가 있는 경우:
   *    - 이전 계산을 수행하고 결과를 현재 숫자로 설정
   * 3. 새로운 연산자를 설정하고 다음 입력을 위해 초기화
   */
  private performOperation(operator: Operator) {
    if (this.currentOperator === Operator.None) {
      // 첫 번째 연산인 경우
      this.setPreviousNumberFromCurrent();
    } else {
      // 연속된 연산인 경우
      this.performPreCalculation();
      this.setCurrentNumberFromPrevious();
    }
    // 새로운 연산자 설정 및 초기화
    this.currentOperator = operator;
    this.shouldReset = true;
  }

  /**
   * 기본 산술 연산을 위한 공개 메서드들
   * 각 메서드는 해당하는 연산자로 performOperation을 호출
   */
  public plus(): void {
    this.performOperation(Operator.Plus); // 덧셈 연산 수행
  }

  public minus(): void {
    this.performOperation(Operator.Minus); // 뺄셈 연산 수행
  }

  public mul(): void {
    this.performOperation(Operator.Mul); // 곱셈 연산 수행
  }

  public div(): void {
    this.performOperation(Operator.Div); // 나눗셈 연산 수행
  }

  public pow(): void {
    this.performOperation(Operator.Pow); // 거듭제곱 연산 수행
  }

  public root(): void {
    this.performOperation(Operator.Root); // 제곱근 연산 수행
  }

  public mod(): void {
    this.performOperation(Operator.Mod); // 나머지 연산 수행
  }

  /**
   * 등호(=) 버튼을 눌렀을 때의 처리를 수행하는 메서드
   *
   * 동작 방식:
   * 1. 현재 연산자가 없는 경우:
   *    - 현재 숫자를 이전 숫자로 저장
   * 2. 현재 연산자가 있는 경우:
   *    - 이전 계산을 수행
   *    - 계산 결과를 현재 숫자로 설정
   *    - 연산자 상태 초기화
   *    - 다음 입력을 위한 초기화 수행
   *    - 반복 계산용 숫자 초기화
   */
  public equal(): void {
    if (this.currentOperator === Operator.None) {
      this.setPreviousNumberFromCurrent();
    } else {
      this.performPreCalculation();
      this.setCurrentNumberFromPrevious();
      this.currentOperator = Operator.None;
      this.shouldReset = true;
      this.repeatedNumber = '0';
    }
  }

  /**
   * 연산자를 문자열 형태로 변환하여 반환하는 메서드
   *
   * @param operator - 문자열로 변환할 연산자 객체
   *                  (매개변수가 없을 경우 현재 연산자를 사용)
   * @returns 연산자에 해당하는 문자열
   *          (해당하는 연산자가 없을 경우 빈 문자열 반환)
   *
   * @example
   * getOperatorString(Operator.Plus) // returns '+'
   * getOperatorString(Operator.Minus) // returns '-'
   */
  public getOperatorString(operator: Operator = this.currentOperator): string {
    return Object.keys(operatorMap).find((key) => operatorMap[key] === operator) || '';
  }

  /**
   * 퍼센트(%) 연산을 처리하는 메서드
   *
   * 동작 방식:
   * 1. 현재 연산자가 나눗셈(÷)이나 곱셈(×)인 경우에만 처리
   * 2. 이전 계산을 수행하고 결과를 스냅샷으로 저장
   * 3. 연산 기록을 한 단계 이동
   * 4. 연산자에 따른 퍼센트 계산 수행:
   *    - 나눗셈: (이전 숫자 × 100)
   *    - 곱셈: (이전 숫자 ÷ 100)
   * 5. 계산 결과를 기록에 추가하고 현재 숫자로 설정
   *
   * 예시:
   * - 50 × 20% = 10 (50 × 0.2)
   * - 50 ÷ 20% = 250 (50 ÷ 0.2)
   */
  public percent(): void {
    if (this.currentOperator === Operator.Div || this.currentOperator === Operator.Mul) {
      // 이전 계산 수행 및 결과 스냅샷 저장
      this.performPreCalculation();
      const {previousNumber, argumentNumber} = this.resultSnapshot;

      // 연산 기록 이동
      this.shiftHistory();

      // 연산자 문자열 생성 (예: ×%, ÷%)
      const operator = [Operator.Pct, this.currentOperator];

      // 현재 연산자에 따른 퍼센트 계산
      const resultNumber =
        this.currentOperator === Operator.Div
          ? MathB.bignumber(this.previousNumber).mul(100).toString() // 나눗셈: × 100
          : MathB.bignumber(this.previousNumber).div(100).toString(); // 곱셈: ÷ 100

      // 계산 결과를 기록에 추가하고 이전 숫자로 저장
      this.previousNumber = this.addHistory({previousNumber, operator, argumentNumber, resultNumber});
      this.setCurrentNumberFromPrevious();
    }

    // 연산자 상태 초기화
    this.resetOperatorState();
  }

  /**
   * 역수(reciprocal) 계산을 수행하는 메서드
   * 현재 숫자의 역수(1/x)를 계산합니다.
   *
   * 동작 방식:
   * 1. 현재 숫자가 0이 아닌지 확인 (0으로 나눌 수 없음)
   * 2. 1을 현재 숫자로 나누어 역수 계산
   * 3. 계산 결과를 기록에 추가하고 현재 숫자로 설정
   * 4. 입력 상태 초기화
   *
   * @example
   * 현재 숫자가 2일 때: 1/2 = 0.5
   * 현재 숫자가 4일 때: 1/4 = 0.25
   */
  public rec(): void {
    if (Number(this.currentNumber) !== 0) {
      this.currentNumber = this.calculateAndAddHistory(this.currentNumber, Operator.Rec, () =>
        MathB.bignumber(1).div(this.currentNumber).toString(),
      );
      this.resetInputState();
    }
  }

  /**
   * 제곱(square) 계산을 수행하는 메서드
   * 현재 숫자를 2제곱(x²)합니다.
   *
   * 동작 방식:
   * 1. 현재 숫자를 2번 곱하여 제곱 계산
   * 2. 계산 결과를 기록에 추가하고 현재 숫자로 설정
   * 3. 입력 상태 초기화
   *
   * @example
   * 현재 숫자가 3일 때: 3² = 9
   * 현재 숫자가 4일 때: 4² = 16
   */
  public pow2(): void {
    this.currentNumber = this.calculateAndAddHistory(this.currentNumber, Operator.Pow2, () =>
      MathB.bignumber(this.currentNumber).pow(2).toString(),
    );
    this.resetInputState();
  }

  /**
   * 제곱근(square root) 계산을 수행하는 메서드
   * 현재 숫자의 제곱근(√x)을 계산합니다.
   *
   * 동작 방식:
   * 1. 현재 숫자가 음수가 아닌지 확인 (음수의 제곱근은 허수)
   * 2. 현재 숫자의 제곱근을 계산
   * 3. 계산 결과를 기록에 추가하고 현재 숫자로 설정
   * 4. 입력 상태 초기화
   *
   * @throws {Error} 음수의 제곱근을 계산하려 할 때 에러 발생
   *
   * @example
   * 현재 숫자가 9일 때: √9 = 3
   * 현재 숫자가 16일 때: √16 = 4
   */
  public sqrt(): void {
    if (MathB.bignumber(this.currentNumber).lt(0)) {
      throw new Error('The square root of a negative number is not allowed.');
    }
    this.currentNumber = this.calculateAndAddHistory(this.currentNumber, Operator.Sqrt, () =>
      MathB.bignumber(this.currentNumber).sqrt().toString(),
    );
    this.resetInputState();
  }

  /**
   * 각도를 라디안으로 변환하는 헬퍼 메서드
   * 삼각수 계산에 사용됩니다.
   *
   * 변환 공식: radians = degrees × π ÷ 180
   *
   * @param degrees - 변환할 각도 (BigNumber)
   * @returns 변환된 라디안 값 (BigNumber)
   */
  private degreesToRadians(degrees: BigNumber): BigNumber {
    return degrees.times(MathB.pi).div(180);
  }

  /**
   * 삼각함수 계산을 수행하는 공통 메서드
   * sin, cos, tan 등의 삼각함수 계산에 사용됩니다.
   *
   * 동작 방식:
   * 1. 현재 각도를 라디안으로 변환
   * 2. 지정된 삼각함수를 사용하여 계산
   * 3. 계산 결과를 기록에 추가하고 현재 숫자로 설정
   * 4. 입력 상태 초기화
   *
   * @param operator - 수행할 삼각함수 연산자
   * @param mathFunction - 사용할 수학 함수 (MathB의 삼각함수)
   */
  private calculateTrigonometricFunction(operator: Operator, mathFunction: (x: BigNumber) => BigNumber): void {
    this.currentNumber = this.calculateAndAddHistory(this.currentNumber, operator, () => {
      const radians = this.degreesToRadians(MathB.bignumber(this.currentNumber));
      return mathFunction(radians).toString();
    });
    this.resetInputState();
  }

  /**
   * 삼각함수 계산 메서드들
   * 각 메서드는 해당하는 삼각함수 계산을 수행합니다.
   * 입력된 각도는 도(degree) 단위로 처리됩니다.
   */
  public sin(): void {
    this.calculateTrigonometricFunction(Operator.Sin, MathB.sin);
  }
  public cos(): void {
    this.calculateTrigonometricFunction(Operator.Cos, MathB.cos);
  }
  public tan(): void {
    this.calculateTrigonometricFunction(Operator.Tan, MathB.tan);
  }

  /**
   * 공통 계산 함수
   * 다양한 수학 연산에 사용되는 공통 계산 로직을 처리합니다.
   *
   * 동작 방식:
   * 1. 지정된 계산 수행
   * 2. 계산 결과를 기록에 추가하고 현재 숫자로 설정
   * 3. 입력 상태 초기화
   *
   * @param operator - 수행할 연산자
   * @param calculation - 실제 계산을 수행할 함수
   */
  private commonCalculation(operator: Operator, calculation: () => string): void {
    this.currentNumber = this.calculateAndAddHistory(this.currentNumber, operator, calculation);
    this.resetInputState();
  }

  /**
   * 팩토리얼 계산을 수행하는 메서드
   *
   * 동작 방식:
   * 1. 현재 숫자가 음수인지 확인
   * 2. 음수일 경우 에러 발생
   * 3. 팩토리얼 계산 수행 (n!)
   * 4. 계산 결과를 기록에 추가하고 현재 숫자로 설정
   *
   * @throws {Error} 음수에 대한 팩토리얼 계산 시도 시 에러 발생
   */
  public fct(): void {
    if (Number(this.currentNumber) < 0) {
      throw new Error('The factorial of a negative number is not allowed.');
    }
    this.commonCalculation(Operator.Fct, () => MathB.factorial(MathB.bignumber(this.currentNumber)).toString());
  }

  /**
   * 10의 거듭제곱 계산을 수행하는 메서드
   *
   * 동작 방식:
   * 1. 현재 숫자를 지수로 사용하여 10^x 계산
   * 2. 계산 결과를 기록에 추가하고 현재 숫자로 설정
   *
   * 예시:
   * - 입력값이 2일 경우 10² = 100
   * - 입력값이 -1일 경우 10⁻¹ = 0.1
   */
  public exp10(): void {
    this.commonCalculation(Operator.Exp10, () => MathB.bignumber(10).pow(this.currentNumber).toString());
  }

  /**
   * 현재 숫자의 정수부를 계산하는 메서드
   *
   * 동작 방식:
   * 1. 현재 숫자의 소수점 이하를 버림하여 정수부만 추출
   * 2. 계산 결과를 기록에 추가하고 현재 숫자로 설정
   *
   * 예시:
   * - 3.14 → 3
   * - -3.14 → -3
   */
  public int(): void {
    this.commonCalculation(Operator.Int, () => MathB.bignumber(this.currentNumber).floor().toString());
  }

  /**
   * 현재 숫자의 소수부를 계산하는 메서드
   *
   * 동작 방식:
   * 1. 현재 숫자를 1로 나눈 나머지를 계산하여 소수부 추출
   * 2. 계산 결과를 기록에 추가하고 현재 숫자로 설정
   *
   * 예시:
   * - 3.14 → 0.14
   * - -3.14 → -0.14
   */
  public frac(): void {
    this.commonCalculation(Operator.Frac, () => MathB.bignumber(this.currentNumber).mod(1).toString());
  }

  /**
   * 연산자 관련 상태를 초기화하는 메서드
   *
   * 초기화되는 항목:
   * 1. currentOperator: 현재 연산자를 None으로 설정
   * 2. repeatedNumber: 반복 계산에 사용되는 숫자를 '0'으로 초기화
   * 3. shouldReset: 다음 입력 시 현재 숫자를 리셋해야 함을 표시
   *
   * 주로 새로운 계산을 시작하거나 에러 발생 시 호출됨
   */
  private resetOperatorState(): void {
    this.currentOperator = Operator.None;
    this.repeatedNumber = '0';
    this.shouldReset = true;
  }

  /**
   * 숫자 입력 관련 상태를 초기화하는 메서드
   *
   * 초기화되는 항목:
   * 1. repeatedNumber: 반복 계산에 사용되는 숫자를 '0'으로 초기화
   * 2. shouldReset: 다음 입력 시 현재 숫자를 리셋해야 함을 표시
   *
   * 주로 새로운 숫자 입력을 시작하기 전에 호출됨
   * 연산자 상태는 유지한 채 입력 상태만 초기화할 때 사용
   */
  private resetInputState(): void {
    this.repeatedNumber = '0';
    this.shouldReset = true;
  }

  /**
   * 계산 결과를 히스토리에 추가하고 문자열로 반환하는 헬퍼 함수
   *
   * @param number 계산에 사용될 입력 숫자
   * @param operator 수행할 연산자 (예: 더하기, 빼기 등)
   * @param calculation 실제 계산을 수행하는 콜백 함수
   * @returns 계산 결과를 문자열로 변환한 값
   *
   * 동작 과정:
   * 1. calculation() 함수를 호출하여 계산 수행
   * 2. 계산 결과와 함께 입력 숫자, 연산자를 히스토리에 기록
   * 3. 결과값을 문자열로 변환하여 반환
   *
   * 예시:
   * calculateAndAddHistory("5", Operator.Add, () => "8")
   * => 히스토리에 {이전값: "5", 연산자: "+", 결과값: "8"} 추가
   * => "8" 반환
   */
  private calculateAndAddHistory(number: string, operator: Operator, calculation: () => string): string {
    return this.addHistory({
      previousNumber: number,
      operator: operator,
      resultNumber: calculation(),
    });
  }

  /**
   * 이항 연산을 간단하게 수행하는 공통 메서드
   * @param operator 수행할 연산자
   * @param n 연산에 사용할 숫자
   */
  private performBinaryOperation(operator: Operator, n: number): void {
    switch (operator) {
      case Operator.Plus:
        this.plus();
        break;
      case Operator.Minus:
        this.minus();
        break;
      case Operator.Mul:
        this.mul();
        break;
      case Operator.Div:
        this.div();
        break;
      case Operator.Pow:
        this.pow();
        break;
      case Operator.Root:
        this.root();
        break;
      case Operator.Mod:
        this.mod();
        break;
      default:
        throw new Error('Invalid operator');
    }
    this.setCurrentNumber(n.toString()); // 숫자를 현재 숫자로 설정
    this.equal(); // 계산 수행 및 결과 설정
  }

  /**
   * 숫자를 더하는 메서드
   * @param n 더할 숫자
   */
  public plusN(n: number): void {
    this.performBinaryOperation(Operator.Plus, n);
  }

  /**
   * 숫자를 뺄하는 메서드
   * @param n 뺄 숫자
   */
  public minusN(n: number): void {
    this.performBinaryOperation(Operator.Minus, n);
  }

  /**
   * 숫자를 곱하는 메서드
   * @param n 곱할 숫자
   */
  public mulN(n: number): void {
    this.performBinaryOperation(Operator.Mul, n);
  }

  /**
   * 숫자를 나누는 메서드
   * @param n 나눌 숫자
   */
  public divN(n: number): void {
    this.performBinaryOperation(Operator.Div, n);
  }

  /**
   * 숫자를 거듭제곱하는 메서드
   * @param n 거듭제곱할 숫자
   */
  public powN(n: number): void {
    this.performBinaryOperation(Operator.Pow, n);
  }

  /**
   * 숫자의 제곱근을 계산하는 메서드
   * @param n 제곱근을 계산할 숫자
   */
  public rootN(n: number): void {
    this.performBinaryOperation(Operator.Root, n);
  }

  /**
   * 숫자의 나머지를 계산하는 메서드
   * @param n 나머지를 계산할 숫자
   */
  public modN(n: number): void {
    this.performBinaryOperation(Operator.Mod, n);
  }

  /**
   * 수학 상수 값을 조회하는 메서드
   *
   * @param constant - 조회할 상수의 이름 (예: 'PI', 'E' 등)
   * @returns 요청한 상수의 문자열 값
   * @throws {Error} 존재하지 않는 상수를 요청할 경우 에러 발생
   *
   * 동작 과정:
   * 1. constants 객체에서 주어진 이름의 상수를 검색
   * 2. 상수가 존재하면 해당 값을 반환
   * 3. 상수가 존재하지 않으면 에러 발생
   */
  public getConstant(constant: string): string {
    if (constants[constant]) {
      return constants[constant];
    }
    throw new Error('The requested mathematical constant was not found');
  }

  /**
   * 현재 계산기의 값을 특정 수학 상수로 설정하는 메서드
   *
   * @param constant - 설정할 상수의 이름 (예: 'PI', 'E' 등)
   * @throws {Error} 존재하지 않는 상수를 설정하려 할 경우 에러 발생
   *
   * 동작 과정:
   * 1. getConstant()를 호출하여 상수 값을 가져옴
   * 2. 현재 계산기의 값(currentNumber)을 해당 상수 값으로 업데이트
   */
  public setConstant(constant: string): void {
    this.setCurrentNumber(this.getConstant(constant));
  }

  // 메모리 관련 메서드들

  /**
   * 현재 계산기에 표시된 숫자를 메모리에 저장하는 메서드
   *
   * 동작 과정:
   * 1. 현재 숫자(currentNumber)를 메모리(memoryNumber)에 저장
   * 2. 메모리 초기화 상태(isMemoryReset)를 false로 설정하여 메모리 사용 가능 상태로 변경
   */
  public memorySave(): void {
    this.memoryNumber = this.currentNumber;
    this.isMemoryReset = false;
  }

  /**
   * 메모리에 저장된 숫자를 현재 계산기에 불러오는 메서드
   *
   * 동작 과정:
   * 1. 메모리가 초기화 상태인지 확인
   * 2. 초기화 상태면 에러 발생
   * 3. 아니면 메모리의 숫자를 현재 숫자로 설정하고 리셋 플래그 해제
   *
   * @throws {Error} 메모리가 초기화 상태일 때 호출하면 'Memory is empty' 에러 발생
   */
  public memoryRecall(): void {
    if (this.isMemoryReset) {
      throw new Error('Memory is empty');
    } else {
      this.currentNumber = this.memoryNumber;
      this.shouldReset = false;
    }
  }

  /**
   * 계산기의 메모리를 초기화하는 메서드
   *
   * 동작 과정:
   * 1. 메모리 값을 '0'으로 초기화
   * 2. 메모리 초기화 상태를 true로 설정하여 메모리가 비어있음을 표시
   */
  public memoryClear(): void {
    this.memoryNumber = '0';
    this.isMemoryReset = true;
  }

  /**
   * 메모리에 현재 표시된 숫자를 더하는 메서드
   *
   * 동작 과정:
   * 1. 메모리가 초기화 상태가 아닌 경우에만 실행
   * 2. 메모리의 숫자와 현재 숫자를 BigNumber로 변환하여 덧셈 수행
   * 3. 계산 결과를 문자열로 변환하여 메모리에 저장
   * 4. 다음 입력을 위해 리셋 플래그 설정
   */
  public memoryPlus(): void {
    if (!this.isMemoryReset) {
      this.memoryNumber = MathB.bignumber(this.memoryNumber).add(this.currentNumber).toString();
      this.shouldReset = true;
    }
  }

  /**
   * 메모리에서 현재 표시된 숫자를 빼는 메서드
   *
   * 동작 과정:
   * 1. 메모리가 초기화 상태가 아닌 경우에만 실행
   * 2. 메모리의 숫자와 현재 숫자를 BigNumber로 변환하여 뺄셈 수행
   * 3. 계산 결과를 문자열로 변환하여 메모리에 저장
   * 4. 다음 입력을 위해 리셋 플래그 설정
   */
  public memoryMinus(): void {
    if (!this.isMemoryReset) {
      this.memoryNumber = MathB.bignumber(this.memoryNumber).sub(this.currentNumber).toString();
      this.shouldReset = true;
    }
  }

  /**
   * 메모리의 숫자와 현재 표시된 숫자를 곱하는 메서드
   *
   * 동작 과정:
   * 1. 메모리가 초기화 상태가 아닌 경우에만 실행
   * 2. 메모리의 숫자와 현재 숫자를 BigNumber로 변환하여 곱셈 수행
   * 3. 계산 결���를 문자열로 변환하여 메모리에 저장
   * 4. 다음 입력을 위해 리셋 플래그 설정
   */
  public memoryMul(): void {
    if (!this.isMemoryReset) {
      this.memoryNumber = MathB.bignumber(this.memoryNumber).mul(this.currentNumber).toString();
      this.shouldReset = true;
    }
  }

  /**
   * 메모리의 숫자를 현재 표시된 숫자로 나누는 메서드
   *
   * 동작 과정:
   * 1. 메모리가 초기화 상태가 아닌 경우에만 실행
   * 2. 현재 숫자가 0인지 확인하여 0으로 나누기 방지
   * 3. 메모리의 숫자와 현재 숫자를 BigNumber로 변환하여 나눗셈 수행
   * 4. 계산 결과를 문자열로 변환하여 메모리에 저장
   * 5. 다음 입력을 위해 리셋 플래그 설정
   *
   * @throws {Error} 현재 숫자가 0일 경우 'Cannot divide by zero' 에러 발생
   */
  public memoryDiv(): void {
    if (!this.isMemoryReset) {
      if (this.currentNumber === '0') {
        throw new Error('Cannot divide by zero');
      }
      this.memoryNumber = MathB.bignumber(this.memoryNumber).div(this.currentNumber).toString();
      this.shouldReset = true;
    }
  }

  /**
   * 메모리에 저장된 숫자를 반환하는 메서드
   *
   * @returns {string} 메모리에 저장된 숫자를 문자열 형태로 반환
   */
  public getMemoryNumber(): string {
    return this.memoryNumber.toString();
  }

  /**
   * 메모리의 초기화 상태를 반환하는 메서드
   *
   * @returns {boolean} true: 메모리가 초기화된 상태, false: 메모리에 값이 있는 상태
   */
  public getIsMemoryReset(): boolean {
    return this.isMemoryReset;
  }
}
