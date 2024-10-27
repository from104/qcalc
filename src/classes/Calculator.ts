import {create, all, BigNumber} from 'mathjs';
import { CalculatorHistory } from './CalculatorHistory';

// MathJS 라이브러리 설정: BigNumber 사용, 정밀도 64
const MathB = create(all, {
  number: 'BigNumber',
  precision: 64,
});

/**
 * 계산기에서 사용되는 연산자를 나타내는 열거형
 * None: 연산자 없음
 * Plus: 덧셈
 * Minus: 뺄셈
 * Mul: 곱셈
 * Div: 나눗셈
 * Pct: 퍼센트
 * Pow: 거듭제곱
 * Root: 제곱근
 * Mod: 나머지
 * Rec: 역수
 * Sqrt: 제곱근
 * Pow2: 제곱
 * Sin: 사인
 * Cos: 코사인
 * Tan: 탄젠트
 * Fct: 팩토리얼
 * Exp10: 10의 거듭제곱
 * Int: 정수부
 * Frac: 소수부
 */
export enum Operator {
  None, Plus, Minus, Mul, Div, Pct, Pow, Root, Mod,
  Rec, Sqrt, Pow2, Sin, Cos, Tan, Fct, Exp10, Int, Frac
}

// 연산자와 문자열을 매핑하는 객체
// 키: 연산자를 나타내는 문자열, 값: Operator 열거형
const operatorMap: {[key: string]: Operator} = {
  '': Operator.None, '+': Operator.Plus, '-': Operator.Minus,
  '×': Operator.Mul, '÷': Operator.Div, '%': Operator.Pct,
  pow: Operator.Pow, root: Operator.Root, mod: Operator.Mod,
  rec: Operator.Rec, sqrt: Operator.Sqrt, pow2: Operator.Pow2,
  sin: Operator.Sin, cos: Operator.Cos, tan: Operator.Tan,
  fct: Operator.Fct, exp10: Operator.Exp10, int: Operator.Int,
  frac: Operator.Frac,
};

// 수학 상수 정의
// 키: 상수 이름, 값: 상수 값 (문자열로 저장)
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
 * previousNumber: 이전 숫자
 * operator: 연산자
 * argumentNumber: 인수 (선택적)
 * resultNumber: 결과 숫자
 */
export interface ResultSnapshot {
  previousNumber: string;
  operator: string;
  argumentNumber?: string;
  resultNumber: string;
}

/**
 * 계산기 클래스
 * 기본적인 산술 연산과 고급 수학 함수를 제공합니다.
 */
export class Calculator {
  private previousNumber!: string;  // 이전 숫자
  private repeatedNumber!: string;  // 반복 숫자 (연속 계산 시 사용)
  private currentNumber!: string;   // 현재 숫자
  private memoryNumber!: string;    // 메모리에 저장된 숫자
  private isMemoryReset!: boolean;  // 메모리 초기화 여부
  private currentOperator!: Operator;  // 현재 선택된 연산자
  private shouldReset!: boolean;    // 다음 입력 시 리셋 여부
  private resultSnapshot!: ResultSnapshot;  // 계산 결과 스냅샷

  public readonly history!: CalculatorHistory;  // 계산 히스토리

  /**
   * 계산기 생성자
   * 초기 상태를 설정하고 히스토리 객체를 생성합니다.
   */
  constructor() {
    this.clear();
    this.memoryClear();
    this.history = new CalculatorHistory();
  }

  /**
   * 계산기 상태 초기화
   * 모든 숫자와 연산자를 기본값으로 재설정합니다.
   */
  public clear() {
    this.previousNumber = '0';
    this.repeatedNumber = '0';
    this.currentNumber = '0';
    this.currentOperator = Operator.None;
    this.shouldReset = false;
  }

  /**
   * 결과 스냅샷 저장
   * @param history - 저장할 결과 스냅샷
   */
  private saveResultSnapshot(history: ResultSnapshot) {
    this.resultSnapshot = history;
  }

  /**
   * 히스토리에 결과 추가
   * @param history - 추가할 결과 스냅샷
   * @returns 결과 숫자
   */
  private addHistory(history: ResultSnapshot): string {
    this.saveResultSnapshot(history);
    this.history?.addHistory(history);
    return history.resultNumber;
  }

  /**
   * 히스토리 초기화
   * 가장 오래된 히스토리 항목을 제거하고 결과 스냅샷을 초기화합니다.
   */
  private shiftHistory() {
    this.resultSnapshot = {
      previousNumber: '0',
      operator: '',
      argumentNumber: '0',
      resultNumber: '0',
    };
    this.history?.shiftHistory();
  }

  /**
   * 문자열에서 유효한 숫자만 추출
   * @param originalString - 원본 문자열
   * @returns 추출된 유효한 숫자 문자열
   */
  private extractNumberString(originalString: string): string {
    let onlyNumber = originalString.replace(/[^0-9.\-]/gm, '');
    const isNegative = onlyNumber.startsWith('-');
    onlyNumber = onlyNumber.replace(/-/g, '');
    const [integerPart, ...decimalParts] = onlyNumber.split('.');
    let result = integerPart || '0';
    if (decimalParts.length > 0) {
      result += '.' + decimalParts.join('');
    }
    return MathB.bignumber((isNegative ? '-' : '') + result).toString();
  }

  /**
   * 현재 숫자 설정
   * @param s - 설정할 숫자 문자열
   */
  public setCurrentNumber(s: string): void {
    this.currentNumber = this.extractNumberString(s.substring(0, 64));
    this.shouldReset = false;
  }

  /**
   * 현재 숫자 반환
   * @returns 현재 숫자
   */
  public getCurrentNumber(): string {
    return this.currentNumber;
  }

  /**
   * 이전 숫자 반환
   * @returns 이전 숫자
   */
  public getPreviousNumber(): string {
    return this.previousNumber;
  }

  /**
   * 초기화 예정 여부 반환
   * @returns 초기화 예정 여부
   */
  public getShouldReset(): boolean {
    return this.shouldReset;
  }

  /**
   * 숫자 추가
   * @param digit - 추가할 숫자 (문자열 또는 숫자)
   */
  public addDigit(digit: number | string): void {
    const parsedDigit = this.parseDigit(digit);
    if (this.isValidDigit(parsedDigit)) {
      this.updateCurrentNumber(parsedDigit.toString());
    }
  }

  /**
   * 입력된 digit을 숫자로 변환
   * @param digit - 변환할 숫자 (문자열 또는 숫자)
   * @returns 변환된 숫자
   */
  private parseDigit(digit: number | string): number {
    return typeof digit === 'string' ? parseInt(digit.charAt(0)) || 0 : Math.floor(digit);
  }

  /**
   * 유효한 숫자인지 확인
   * @param digit - 확인할 숫자
   * @returns 유효성 여부
   */
  private isValidDigit(digit: number): boolean {
    return digit >= 0 && digit <= 9;
  }

  /**
   * 현재 숫자 업데이트
   * @param digitString - 추가할 숫자 문자열
   */
  private updateCurrentNumber(digitString: string): void {
    if (this.currentNumber === '0' || this.shouldReset) {
      this.currentNumber = digitString;
      this.shouldReset = false;
    } else {
      this.currentNumber += digitString;
    }
  }

  /**
   * 소수점 추가
   */
  public addDot() {
    if (this.shouldReset) {
      this.currentNumber = '0.';
      this.shouldReset = false;
    } else if (!this.currentNumber.includes('.')) {
      this.currentNumber += '.';
    }
  }

  /**
   * 숫자 또는 소수점 삭제
   */
  public deleteDigitOrDot() {
    if (this.currentNumber.match(/^-?\d$/) || this.currentNumber === '-0') {
      this.currentNumber = '0';
    } else {
      this.currentNumber = this.currentNumber.slice(0, -1);
    }
  }

  /**
   * 부동소수점 숫자를 문자열로 변환
   * @param numberForCalc - 변환할 숫자
   * @returns 변환된 문자열
   */
  private numberToString(numberForCalc: string): string {
    const [integer, decimal] = numberForCalc.split('.');
    return decimal ? `${integer}.${decimal}` : integer;
  }

  /**
   * 부호 변환
   */
  public changeSign() {
    this.currentNumber = MathB.bignumber(this.getCurrentNumber()).mul(-1).toString();
  }

  /**
   * 이전 숫자를 현재 숫자로 설정
   */
  private setCurrentNumberFromPrevious() {
    this.currentNumber = this.previousNumber;
  }

  /**
   * 현재 숫자를 이전 숫자로 설정
   */
  private setPreviousNumberFromCurrent() {
    this.previousNumber = this.currentNumber;
  }

  /**
   * 사전 계산 수행
   */
  private performPreCalculation() {
    const numberForCalc = this.shouldReset ? this.repeatedNumber : this.currentNumber;
    if (this.shouldReset && numberForCalc === '0') return;
    if (!this.shouldReset) {
      this.repeatedNumber = numberForCalc;
    }
    const result = this.calculateResult(numberForCalc);
    this.previousNumber = this.addHistory({
      previousNumber: this.previousNumber,
      operator: this.getOperatorString() as string,
      argumentNumber: numberForCalc,
      resultNumber: result,
    });
  }

  /**
   * 실제 계산 수행
   * @param numberForCalc - 계산에 사용할 숫자
   * @returns 계산 결과
   */
  private calculateResult(numberForCalc: string): string {
    const prev = MathB.bignumber(this.previousNumber);
    const curr = MathB.bignumber(numberForCalc);

    switch (this.currentOperator) {
      case Operator.Plus: return prev.add(curr).toString();
      case Operator.Minus: return prev.sub(curr).toString();
      case Operator.Mul: return prev.mul(curr).toString();
      case Operator.Div:
        if (curr.isZero()) throw new Error('Cannot divide by zero.');
        return prev.div(curr).toString();
      case Operator.Pow: return prev.pow(curr).toString();
      case Operator.Root: return prev.pow(MathB.bignumber(1).div(curr)).toString();
      case Operator.Mod: return prev.mod(curr).toString();
      default: return this.previousNumber;
    }
  }

  /**
   * 연산 수행
   * @param operator - 수행할 연산자
   */
  private performOperation(operator: Operator) {
    if (this.currentOperator === Operator.None) {
      this.setPreviousNumberFromCurrent();
    } else {
      this.performPreCalculation();
      this.setCurrentNumberFromPrevious();
    }
    this.currentOperator = operator;
    this.shouldReset = true;
  }

  // 기본 산술 연산 메서드들
  public plus() { this.performOperation(Operator.Plus); }
  public minus() { this.performOperation(Operator.Minus); }
  public mul() { this.performOperation(Operator.Mul); }
  public div() { this.performOperation(Operator.Div); }
  public pow() { this.performOperation(Operator.Pow); }
  public root() { this.performOperation(Operator.Root); }
  public mod() { this.performOperation(Operator.Mod); }

  /**
   * 등호(=) 버튼 처리
   */
  public equal() {
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
   * 연산자 문자열로 얻기
   * @param operator - 변환할 연산자 (기본값: 현재 연산자)
   * @returns 연산자 문자열
   */
  public getOperatorString(operator: Operator = this.currentOperator): string {
    return Object.keys(operatorMap).find((key) => operatorMap[key] === operator) || '';
  }

  /**
   * % 연산 처리
   */
  public percent(): void {
    if (this.currentOperator === Operator.Div || this.currentOperator === Operator.Mul) {
      this.performPreCalculation();
      const {previousNumber, argumentNumber} = this.resultSnapshot;
      this.shiftHistory();
      const operator = this.getOperatorString() + this.getOperatorString(Operator.Pct);
      const resultNumber = this.currentOperator === Operator.Div
        ? MathB.bignumber(this.previousNumber).mul(100).toString()
        : MathB.bignumber(this.previousNumber).div(100).toString();
      this.previousNumber = this.addHistory({previousNumber, operator, argumentNumber, resultNumber});
      this.setCurrentNumberFromPrevious();
    }
    this.resetOperatorState();
  }

  /**
   * 역수 계산
   */
  public rec(): void {
    if (Number(this.currentNumber) !== 0) {
      this.currentNumber = this.calculateAndAddHistory(this.currentNumber, Operator.Rec, () =>
        MathB.bignumber(1).div(this.currentNumber).toString()
      );
      this.resetInputState();
    }
  }

  /**
   * 제곱 계산
   */
  public pow2(): void {
    this.currentNumber = this.calculateAndAddHistory(this.currentNumber, Operator.Pow2, () =>
      MathB.bignumber(this.currentNumber).pow(2).toString()
    );
    this.resetInputState();
  }

  /**
   * 제곱근 계산
   */
  public sqrt(): void {
    if (this.currentNumber.charAt(0) === '-') {
      throw new Error('The square root of a negative number is not allowed.');
    }
    this.currentNumber = this.calculateAndAddHistory(this.currentNumber, Operator.Sqrt, () =>
      MathB.bignumber(this.currentNumber).sqrt().toString()
    );
    this.resetInputState();
  }

  /**
   * 각도를 라디안으로 변환
   * @param degrees - 변환할 각도
   * @returns 변환된 라디안 값
   */
  private degreesToRadians(degrees: BigNumber): BigNumber {
    return degrees.times(MathB.pi).div(180);
  }

  /**
   * 삼각함수 계산
   * @param operator - 수행할 연산자
   * @param mathFunction - 사용할 수학 함수
   */
  private calculateTrigonometricFunction(operator: Operator, mathFunction: (x: BigNumber) => BigNumber): void {
    this.currentNumber = this.calculateAndAddHistory(this.currentNumber, operator, () => {
      const radians = this.degreesToRadians(MathB.bignumber(this.currentNumber));
      return mathFunction(radians).toString();
    });
    this.resetInputState();
  }

  // 삼각함수 메서드들
  public sin(): void { this.calculateTrigonometricFunction(Operator.Sin, MathB.sin); }
  public cos(): void { this.calculateTrigonometricFunction(Operator.Cos, MathB.cos); }
  public tan(): void { this.calculateTrigonometricFunction(Operator.Tan, MathB.tan); }

  /**
   * 공통 계산 함수
   * @param operator - 수행할 연산자
   * @param calculation - 계산 함수
   */
  private commonCalculation(operator: Operator, calculation: () => string): void {
    this.currentNumber = this.calculateAndAddHistory(this.currentNumber, operator, calculation);
    this.resetInputState();
  }

  /**
   * 팩토리얼 계산
   */
  public fct(): void {
    if (Number(this.currentNumber) < 0) {
      throw new Error('The factorial of a negative number is not allowed.');
    }
    this.commonCalculation(Operator.Fct, () => MathB.factorial(MathB.bignumber(this.currentNumber)).toString());
  }

  /**
   * 10의 거듭제곱 계산
   */
  public exp10(): void {
    this.commonCalculation(Operator.Exp10, () => MathB.pow(10, MathB.bignumber(this.currentNumber)).toString());
  }

  /**
   * 정수부 계산
   */
  public int(): void {
    this.commonCalculation(Operator.Int, () => MathB.bignumber(this.currentNumber).floor().toString());
  }

  /**
   * 소수부 계산
   */
  public frac(): void {
    this.commonCalculation(Operator.Frac, () => MathB.bignumber(this.currentNumber).mod(1).toString());
  }

  /**
   * 연산자 상태 초기화
   */
  private resetOperatorState(): void {
    this.currentOperator = Operator.None;
    this.repeatedNumber = '0';
    this.shouldReset = true;
  }

  /**
   * 입력 상태 초기화
   */
  private resetInputState(): void {
    this.repeatedNumber = '0';
    this.shouldReset = true;
  }

  /**
   * 계산 및 히스토리 추가 헬퍼 함수
   * @param number - 계산에 사용할 숫자
   * @param operator - 수행할 연산자
   * @param calculation - 계산 함수
   * @returns 계산 결과
   */
  private calculateAndAddHistory(number: string, operator: Operator, calculation: () => string): string {
    return this.numberToString(
      this.addHistory({
        previousNumber: number,
        operator: this.getOperatorString(operator) as string,
        resultNumber: calculation(),
      })
    );
  }

  /**
   * 상수 얻기
   * @param constant - 얻고자 하는 상수 이름
   * @returns 상수 값
   */
  public getConstant(constant: string): string {
    if (constants[constant]) {
      return constants[constant];
    } else {
      throw new Error('Constant not found');
    }
  }

  /**
   * 상수로 설정
   * @param constant - 설정할 상수 이름
   */
  public setConstant(constant: string) {
    this.currentNumber = this.getConstant(constant);
  }

  // 메모리 관련 메서드들
  /**
   * 메모리에 현재 숫자 저장
   */
  public memorySave() {
    this.memoryNumber = this.currentNumber;
    this.isMemoryReset = false;
  }

  /**
   * 메모리에서 숫자 불러오기
   */
  public memoryRecall() {
    if (this.isMemoryReset) {
      throw new Error('No memory to recall.');
    } else {
      this.currentNumber = this.memoryNumber;
      this.shouldReset = false;
    }
  }

  /**
   * 메모리 초기화
   */
  public memoryClear() {
    this.memoryNumber = '0';
    this.isMemoryReset = true;
  }

  /**
   * 메모리에 현재 숫자 더하기
   */
  public memoryPlus() {
    if (!this.isMemoryReset) {
      this.memoryNumber = MathB.bignumber(this.memoryNumber).add(this.currentNumber).toString();
      this.shouldReset = true;
    }
  }

  /**
   * 메모리에서 현재 숫자 빼기
   */
  public memoryMinus() {
    if (!this.isMemoryReset) {
      this.memoryNumber = MathB.bignumber(this.memoryNumber).sub(this.currentNumber).toString();
      this.shouldReset = true;
    }
  }

  /**
   * 메모리 숫자와 현재 숫자 곱하기
   */
  public memoryMul() {
    if (!this.isMemoryReset) {
      this.memoryNumber = MathB.bignumber(this.memoryNumber).mul(this.currentNumber).toString();
      this.shouldReset = true;
    }
  }

  /**
   * 메모리 숫자를 현재 숫자로 나누기
   */
  public memoryDiv() {
    if (!this.isMemoryReset) {
      if (this.currentNumber === '0') {
        throw new Error('Cannot divide by zero');
      }
      this.memoryNumber = MathB.bignumber(this.memoryNumber).div(this.currentNumber).toString();
      this.shouldReset = true;
    }
  }

  /**
   * 메모리에 저장된 숫자 반환
   * @returns 메모리에 저장된 숫자
   */
  public getMemoryNumber(): string {
    return this.memoryNumber;
  }

  /**
   * 메모리 초기화 상태 반환
   * @returns 메모리 초기화 상태
   */
  public getIsMemoryReset(): boolean {
    return this.isMemoryReset;
  }
}