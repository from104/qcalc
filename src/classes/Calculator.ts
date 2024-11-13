import { match } from 'ts-pattern';

import { BigNumber, Operator, CalculationResult, constants } from './CalculatorTypes';
import { CalculatorMath } from './CalculatorMath';
import { CalculatorHistory } from './CalculatorHistory';
import { Radix, RadixConverter } from './RadixConverter';

/**
 * 계산기 클래스
 * @class
 * @description
 * 고급 수학 계산 기능을 제공하는 계산기 구현
 */
export class Calculator {
  private math: CalculatorMath = new CalculatorMath();
  private previousNumber!: string; // string -> BigNumber
  private repeatedNumber!: string; // string -> BigNumber
  private operator!: Operator; // 현재 선택된 연산자
  private resultSnapshot!: CalculationResult; // 최근 계산 결과 스냅샷

  public readonly history!: CalculatorHistory; // 계산 히스토리 관리자

  // 진법 변환기를 초기화합니다.
  private radixConverter: RadixConverter = new RadixConverter();

  // 입력 버퍼를 저장하는 변수입니다.
  private _buffer!: string; // 입력 버퍼

  // 입력 버퍼의 값을 가져오는 getter입니다.
  get buffer(): string {
    return this._buffer;
  }

  // 입력 버퍼의 값을 설정하는 setter입니다.
  // 버퍼가 변경되면 현재 숫자도 업데이트합니다.
  set buffer(value: string) {
    this._buffer = value;
    this.setBufferToCurrentNumber();
  }

  private shouldResetBuffer!: boolean; // 다음 입력시 버퍼 리셋 필요 여부

  private setShouldResetBuffer(): void {
    this.shouldResetBuffer = true;
  }

  private setShouldNotResetBuffer(): void {
    this.shouldResetBuffer = false;
  }

  // 현재 숫자를 저장하는 변수입니다.
  private _currentNumber!: string; // string -> BigNumber

  // 현재 숫자의 값을 가져오는 getter입니다.
  get currentNumber(): string {
    return this._currentNumber;
  }

  // 현재 숫자의 값을 설정하는 setter입니다.
  // 현재 숫자가 변경되면 버퍼도 업데이트합니다.
  set currentNumber(value: string) {
    this._currentNumber = value;
    this.setCurrentNumberToBuffer();
  }

  // 메모리에 저장된 숫자를 나타내는 변수입니다.
  private memoryNumber!: string; // string -> BigNumber

  // 메모리가 초기화 상태인지 확인하는 getter입니다.
  get isMemoryReset(): boolean {
    return this.memoryNumber === '';
  }

  // 현재 사용 중인 진법을 저장하는 변수입니다.
  private _radix: Radix = Radix.Decimal; // 현재 사용 중인 진법 (10진수 기본)

  // 현재 진법의 값을 가져오는 getter입니다.
  get radix(): Radix {
    return this._radix;
  }

  // 진법의 값을 설정하는 setter입니다.
  // 진법이 변경되면 현재 숫자도 업데이트합니다.
  set radix(radix: Radix) {
    if (!Object.values(Radix).includes(radix)) {
      throw new Error('Invalid radix value');
    }
    this._radix = radix;
    this.setCurrentNumberToBuffer();
  }

  private _wordSize!: number; // 비트 단위 연산 시 사용할 비트 수

  get wordSize(): number {
    return this._wordSize;
  }

  set wordSize(value: number) {
    if ([4, 8, 16, 32, 64].includes(value)) {
      this._wordSize = value;
    } else {
      throw new Error('Invalid word size');
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
  public getOperatorString(operator: Operator = this.operator): string {
    return operator;
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
    this.operator = Operator.NONE;
    this.repeatedNumber = '0';
    this.setShouldResetBuffer();
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
    this.setShouldResetBuffer();
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
    this.reset();
    // 메모리 초기화
    this.memoryClear();

    // 비트 단위 연산 시 사용할 비트 수 초기화
    this.wordSize = 8;

    // 히스토리 관리 객체 생성
    this.history = new CalculatorHistory();
  }

  /**
   * 계산기 상태 초기화
   * @description
   * 계산기의 모든 상태를 초기 값으로 재설정합니다.
   * - buffer: 입력 버퍼를 '0'으로 초기화
   * - currentNumber: 현재 입력/표시 중인 숫자를 '0'으로 초기화
   * - previousNumber: 이전 계산에 사용된 숫자를 '0'으로 초기화
   * - repeatedNumber: 연속 계산에 사용되는 반복 숫자를 '0'으로 초기화
   * - currentOperator: 현재 선택된 연산자를 None으로 초기화
   * - shouldReset: 다음 입력 시 화면 초기화 필요 여부를 false로 설정
   */
  public reset(): void {
    this.buffer = '0';
    this.currentNumber = '0';
    this.previousNumber = '0';
    this.repeatedNumber = '0';
    this.operator = Operator.NONE;
    this.setShouldNotResetBuffer();
  }

  /**
   * 계산 결과의 스냅샷을 내부 상태에 저장합니다.
   * @param history - 저장할 계산 결과 스냅샷 객체
   * @description
   * - 계산기의 현재 상태를 스냅샷 형태로 보관
   * - 이전 계산 결과를 추적하고 복원하는데 사용
   * - ResultSnapshot 타입의 객체를 그대로 저장
   */
  private saveCalculationResult(history: CalculationResult): void {
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
  private addHistory(history: CalculationResult): string {
    this.saveCalculationResult(history);
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
      operator: Operator.NONE, // 연산자를 빈 문자열로 설정
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
   * @param value - 설정할 숫자 문자열
   * @description
   * - 입력된 문자열을 최대 64자까지만 처리
   * - extractNumberString을 통해 유효한 숫자로 변환
   * - 초기화 플래그를 false로 설정
   */
  public setCurrentNumber(value: string): void {
    this.buffer = this.filterNumberCharacters(value.substring(0, 64));

    this.setShouldNotResetBuffer();
  }

  /**
   * 현재 계산기에 표시된 숫자를 문자열 형태로 반환하는 메서드
   * @returns {string} 현재 입력되어 있거나 계산된 숫자 값
   * @description
   * - 계산기의 디스플레이에 표시될 현재 숫자를 반환
   * - 숫자는 문자열 형태로 반환되어 정확한 표현이 가능
   */
  public getCurrentNumber(): string {
    return this.currentNumber;
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
    return this.shouldResetBuffer;
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
   * @throws {Error} 유효하지 않은 숫자가 입력된 경우 에러 발생
   * @description
   * - 입력된 숫자를 파싱하여 현재 진법에 맞는 유효성 검사 후 현재 숫자에 추가
   * - 문자열이나 숫자 타입 모두 처리 가능
   * - 현재 진법에 따라 유효한 숫자 범위가 다름:
   *   - 2진수: 0-1
   *   - 8진수: 0-7
   *   - 10진수: 0-9
   *   - 16진수: 0-9, A-F
   * - 현재 숫자가 '0'이거나 shouldReset이 true인 경우:
   *   - 입력된 숫자로 현재 숫자를 대체
   *   - shouldReset 플래그를 false로 설정
   * - 그 외의 경우:
   *   - 현재 숫자 뒤에 새로운 숫자를 추가
   */
  public addDigit(digit: number | string): void {
    // 입력된 숫자를 문자열로 파싱
    const digitString = typeof digit === 'string' ? digit.charAt(0) : Math.floor(digit).toString();

    // 유효하지 않은 숫자인 경우 에러 발생
    if (!this.radixConverter.isValidRadixNumber(digitString, this.radix)) {
      throw new Error('Invalid digit for current radix');
    }

    // 현재 숫자 업데이트
    if (this.buffer === '0' || this.shouldResetBuffer) {
      this.buffer = digitString;
      this.setShouldNotResetBuffer();
    } else {
      this.buffer = this.buffer + digitString;
    }
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
    if (this.shouldResetBuffer) {
      this.buffer = '0.';
      this.setShouldNotResetBuffer();
    }
    // 소수점이 없고, 현재 진법에서 유효한 경우에만 추가
    else if (!this.buffer.includes('.') && this.radixConverter.isValidRadixNumber(this.buffer + '.', this.radix)) {
      this.buffer = this.buffer + '.';
    }
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
    if (this.buffer.match(/^-?.$/) || this.buffer === '-0') {
      this.buffer = '0';
    } else {
      this.buffer = this.buffer.slice(0, -1);
    }
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
   * 현재 ��자의 부호를 변환하는 public 메서드
   * @description
   * - 현재 숫자를 BigNumber 객체로 변환
   * - -1을 곱하여 부호를 반전
   * - 결과를 문자열로 변환하여 현재 숫자에 저장
   */
  public changeSign(): void {
    if (this.buffer !== '0') {
      this.buffer = /^-/.test(this.buffer) ? this.buffer.slice(1) : '-' + this.buffer;
    }
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
    const numberForCalc = this.shouldResetBuffer ? this.repeatedNumber : this.currentNumber;

    // 초기 상태면 계산 중단
    if (this.shouldResetBuffer && numberForCalc === '0') {
      return;
    }

    // 반복 계산을 위한 숫자 저장
    if (!this.shouldResetBuffer) {
      this.repeatedNumber = numberForCalc;
    }

    // 계산 수행 및 이력 기록
    const result = this.performBinaryOperationCalculation(numberForCalc);
    this.previousNumber = this.addHistory({
      previousNumber: this.previousNumber.toString(),
      operator: this.operator,
      argumentNumber: numberForCalc.toString(),
      resultNumber: result.toString(),
    });
  }

  /**
   * 실제 이항 연산 계산을 수행하는 메서드
   * @param numberForCalc - 계산에 사용할 숫자 (문자열 형식)
   * @returns 계산 결과 (문자열 형식)
   * @throws 0으로 나누기를 시도할 때 오류 발생
   */
  private performBinaryOperationCalculation(numberForCalc: string): string {
    // 이전 숫자와 현재 숫자를 BigNumber 객체로 변환
    const pv = this.previousNumber;
    const cv = numberForCalc;

    // 현재 연산자에 따라 계산 수행
    return match(this.operator)
      .with(Operator.ADD, () => this.math.add(pv, cv)) // 덧셈 연산
      .with(Operator.SUB, () => this.math.sub(pv, cv)) // 뺄셈 연산
      .with(Operator.MUL, () => this.math.mul(pv, cv)) // 곱셈 연산
      .with(Operator.DIV, () => this.math.div(pv, cv)) // 나눗셈 연산
      .with(Operator.MOD, () => this.math.mod(pv, cv)) // 나머지 연산
      .with(Operator.POW, () => this.math.pow(pv, cv)) // 거듭제곱 연산
      .with(Operator.ROOT, () => this.math.root(pv, cv)) // 루트 연산
      .with(Operator.BIT_SFT_L, () => this.math.bitShiftLeft(pv, cv, this.wordSize)) // 왼쪽 시프트 연산
      .with(Operator.BIT_SFT_R, () => this.math.bitShiftRight(pv, cv, this.wordSize)) // 오른쪽 시프트 연산
      .with(Operator.BIT_AND, () => this.math.bitAnd(pv, cv, this.wordSize))
      .with(Operator.BIT_OR, () => this.math.bitOr(pv, cv, this.wordSize))
      .with(Operator.BIT_XOR, () => this.math.bitXor(pv, cv, this.wordSize))
      .otherwise(() => this.previousNumber); // 기본값으로 이전 숫자 반환
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
    if (this.operator === Operator.NONE) {
      this.setPreviousNumberFromCurrent();
    } else {
      this.performPreCalculation();
      this.setCurrentNumberFromPrevious();
      this.operator = Operator.NONE;
      this.setShouldResetBuffer();
      this.repeatedNumber = '0';
    }
  }

  /**
   * 단항 연산을 수행하는 공통 메서드
   */
  private performUnaryOperation(operator: Operator, calculation: () => string): void {
    this.currentNumber = this.calculateAndAddHistory(this.currentNumber, operator, calculation);
    this.resetInputState();
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
    if (this.operator === Operator.DIV || this.operator === Operator.MUL) {
      // 이전 계산 수행 및 결과 스냅샷 저장
      this.performPreCalculation();
      const { previousNumber, argumentNumber } = this.resultSnapshot;

      // 연산 기록 이동
      this.shiftHistory();

      // 연산자 문자열 생성 (예: ×%, ÷%)
      const operator = [Operator.PCT, this.operator];

      // 현재 연산자에 따른 퍼센트 계산
      const resultNumber =
        this.operator === Operator.DIV
          ? BigNumber(this.previousNumber).mul(100).toString() // 나눗셈: × 100
          : BigNumber(this.previousNumber).div(100).toString(); // 곱셈: ÷ 100

      // 계산 결과를 기록에 추가하고 이전 숫자로 저장
      this.previousNumber = this.addHistory({ previousNumber, operator, argumentNumber, resultNumber });
      this.setCurrentNumberFromPrevious();
    }

    // 연산자 상태 초기화
    this.resetOperatorState();
  }

  // 단항 연산자 메서드들
  // 에러 검사를 위한 헬퍼 메서드
  private checkError(condition: boolean, message: string): void {
    if (condition) {
      throw new Error(message);
    }
  }

  public rec(): void {
    this.checkError(BigNumber(this.currentNumber).eq(0), 'Cannot divide by zero');
    this.performUnaryOperation(Operator.REC, () => this.math.div('1', this.currentNumber));
  }

  public sqrt(): void {
    this.checkError(BigNumber(this.currentNumber).lt(0), 'The square root of a negative number is not allowed');
    this.performUnaryOperation(Operator.SQRT, () => this.math.root(this.currentNumber, '2'));
  }

  public pow2(): void {
    this.performUnaryOperation(Operator.POW2, () => BigNumber(this.currentNumber).pow(2).toString());
  }

  public fct(): void {
    this.checkError(BigNumber(this.currentNumber).lt(0), 'The factorial of a negative number is not allowed');
    this.performUnaryOperation(Operator.FCT, () => this.math.fct(this.currentNumber));
  }

  public exp10(): void {
    this.performUnaryOperation(Operator.EXP10, () => this.math.exp10(this.currentNumber));
  }

  public int(): void {
    this.performUnaryOperation(Operator.INT, () => this.math.int(this.currentNumber));
  }

  public frac(): void {
    this.performUnaryOperation(Operator.FRAC, () => this.math.frac(this.currentNumber));
  }

  // 삼각함수 메서드들
  public sin(): void {
    this.performUnaryOperation(Operator.SIN, () => this.math.sin(this.currentNumber));
  }

  public cos(): void {
    this.performUnaryOperation(Operator.COS, () => this.math.cos(this.currentNumber));
  }

  public tan(): void {
    this.performUnaryOperation(Operator.TAN, () => this.math.tan(this.currentNumber));
  }

  public bitNot(): void {
    this.performUnaryOperation(Operator.BIT_NOT, () => this.math.bitNot(this.currentNumber));
  }

  public bitComp(): void {
    this.performUnaryOperation(Operator.BIT_COMP, () => this.math.bitComp(this.currentNumber));
  }

  /**
   * 이항 연산을 수행하는 공통 메서드
   */
  private performBinaryOperation(operator: Operator): void {
    if (this.operator === Operator.NONE) {
      this.setPreviousNumberFromCurrent();
    } else {
      this.performPreCalculation();
      this.setCurrentNumberFromPrevious();
    }
    this.operator = operator;
    this.setShouldResetBuffer();
  }

  // 이항 연산자 메서드들
  public add(): void { this.performBinaryOperation(Operator.ADD); }
  public sub(): void { this.performBinaryOperation(Operator.SUB); }
  public mul(): void { this.performBinaryOperation(Operator.MUL); }
  public div(): void { this.performBinaryOperation(Operator.DIV); }
  public pow(): void { this.performBinaryOperation(Operator.POW); }
  public root(): void { this.performBinaryOperation(Operator.ROOT); }
  public mod(): void { this.performBinaryOperation(Operator.MOD); }
  public bitSftL(): void { this.performBinaryOperation(Operator.BIT_SFT_L); }
  public bitSftR(): void { this.performBinaryOperation(Operator.BIT_SFT_R); }
  public bitAnd(): void { this.performBinaryOperation(Operator.BIT_AND); }
  public bitOr(): void { this.performBinaryOperation(Operator.BIT_OR); }
  public bitXor(): void { this.performBinaryOperation(Operator.BIT_XOR); }

  /**
   * 계산 결과를 히스토리 추가하고 문자열로 반환하는 헬퍼 함수
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

  // 숫자를 직접 사용하는 이항 연산 메서드들
  public addNumber(n: number): void { this.executeWithNumber(Operator.ADD, n); }
  public subNumber(n: number): void { this.executeWithNumber(Operator.SUB, n); }
  public mulNumber(n: number): void { this.executeWithNumber(Operator.MUL, n); }
  public divNumber(n: number): void { this.executeWithNumber(Operator.DIV, n); }
  public powNumber(n: number): void { this.executeWithNumber(Operator.POW, n); }
  public rootNumber(n: number): void { this.executeWithNumber(Operator.ROOT, n); }
  public modNumber(n: number): void { this.executeWithNumber(Operator.MOD, n); }
  public bitSftLNumber(n: number): void { this.executeWithNumber(Operator.BIT_SFT_L, n); }
  public bitSftRNumber(n: number): void { this.executeWithNumber(Operator.BIT_SFT_R, n); }
  public bitAndNumber(n: number): void { this.executeWithNumber(Operator.BIT_AND, n); }
  public bitOrNumber(n: number): void { this.executeWithNumber(Operator.BIT_OR, n); }
  public bitXorNumber(n: number): void { this.executeWithNumber(Operator.BIT_XOR, n); }
  private executeWithNumber(operator: Operator, n: number): void {
    this.performBinaryOperation(operator);
    this.setCurrentNumber(n.toString());
    this.equal();
  }

  /**
   * 수학 상수 값을 조회하는 메서드
   *
   * @param constant - 조회 상수의 이름 (예: 'PI', 'E' 등)
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
    // 1. 메모리가 비어있으면 (this.isMemoryReset이 true이면)
    // Error가 throw되고 여기서 함수 실행이 중단됨
    this.checkError(this.isMemoryReset, 'Memory is empty');

    // 2. 에러가 발생하지 않은 경우에만 아래 코드가 실행됨
    this.currentNumber = this.memoryNumber;
    this.setShouldNotResetBuffer();
  }

  public memoryClear(): void {
    this.memoryNumber = '';
  }

  private performMemoryOperation(operation: (a: string, b: string) => string): void {
    if (!this.isMemoryReset) {
      this.memoryNumber = operation(this.memoryNumber, this.currentNumber);
      this.setShouldResetBuffer();
    }
  }

  public memoryAdd(): void {
    this.performMemoryOperation(this.math.add);
  }
  public memorySub(): void {
    this.performMemoryOperation(this.math.sub);
  }
  public memoryMul(): void {
    this.performMemoryOperation(this.math.mul);
  }
  public memoryDiv(): void {
    this.performMemoryOperation(this.math.div);
  }

  /**
   * 메모리에 저장된 숫자를 반환하는 메서드
   *
   * @returns {string} 메모리에 저장된 숫자를 문자열 형태로 반환
   */
  public getMemoryNumber(): string {
    return this.memoryNumber;
  }
}
