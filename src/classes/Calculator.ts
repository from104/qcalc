import {EventEmitter} from 'events';

import {create, all, BigNumber} from 'mathjs';

const MathB = create(all, {
  number: 'BigNumber',
  precision: 64,
});

/**
 * 다양한 연산자를 나타내는 열거형입니다.
 */
export enum Operator {
  None, // 연산자 없음
  Plus, // 덧셈
  Minus, // 뺄셈
  Mul, // 곱셈
  Div, // 나눗셈
  Pct, // 백분율
  Pow, // N제곱
  Root, // N제곱근
  Mod, // 나머지
  Rec, // 역수
  Sqrt, // 제곱근
  Pow2, // 거듭제곱
  Sin, // 사인
  Cos, // 코사인
  Tan, // 탄젠트
  Fct, // 팩토리얼
  Exp10, // 10의 N제곱
  Int, // 정수부
  Frac, // 소수부
}

// 연산자와 문자열을 매핑하는 객체
const operatorMap: {[key: string]: Operator} = {
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

// 상수
const constants: {[key: string]: string} = {
  pi: MathB.pi.toString(),
  pi2: MathB.bignumber(MathB.pi).div(2).toString(),
  e: MathB.e.toString(),
  ln2: MathB.log(2).toString(),
  ln10: MathB.log(10).toString(),
  phi: MathB.phi.toString(),
};

export interface ResultSnapshot {
  previousNumber: string;
  operator: string;
  argumentNumber?: string;
  resultNumber: string;
}

export class Calculator extends EventEmitter {
  // 연산자가 눌렸을 때 임시로 숫자를 저장
  private previousNumber!: string;

  // 연산자를 반복적으로 눌렀을 때 연산되는 숫자
  private repeatedNumber!: string;

  // 계산기에서 실제로 보여지는 숫자
  private currentNumber!: string;

  // 메모리 숫자
  private memoryNumber!: string;

  // 메로리가 리렛되었는지 여부
  private isMemoryReset!: boolean;

  // 연산자 코드 저장
  private currentOperator!: Operator;

  // 표시 숫자가 앞으로 리셋 될지 여부
  private shouldReset!: boolean;

  private resultSnapshot!: ResultSnapshot;

  // 계산 히스토리 저장 배열
  private histories: History[] = [];

  // 생성자
  constructor() {
    super();
    this.clear();
    this.memoryClear();
  }

  // 초기화
  public clear() {
    this.previousNumber = '0';
    this.repeatedNumber = '0';
    this.currentNumber = '0';
    this.currentOperator = Operator.None;
    this.shouldReset = false;
  }

  private saveResultSnapshot(history: ResultSnapshot) {
    this.resultSnapshot = history;
  }

  private addHistory(history: ResultSnapshot): string {
    this.saveResultSnapshot(history);
    this.emit('addHistory', this.resultSnapshot);
    return this.resultSnapshot.resultNumber;
  }

  private unshiftHistory() {
    this.resultSnapshot = {
      previousNumber: '0',
      operator: '', // null을 빈 문자열로 변경
      argumentNumber: '0',
      resultNumber: '0',
    };
    this.emit('unshiftHistory');
  }

  // 문자열에서 숫자 문자열만 추출
  private extractNumberString(originalString: string): string {
    // 숫자, 부호, 소수점만 남기고 제거
    let onlyNumber = originalString.replace(/[^0-9.\-]/gm, '');

    // 음수 여부 확인
    const isNegative = onlyNumber.startsWith('-');

    // 부호 제거
    onlyNumber = onlyNumber.replace(/-/g, '');

    // 소수점을 기준으로 문자열 분리
    const [integerPart, ...decimalParts] = onlyNumber.split('.');

    // 정수 부분과 소수 부분 결합
    let result = integerPart || '0';
    if (decimalParts.length > 0) {
      result += '.' + decimalParts.join('');
    }

    // 음수 부호 추가 및 BigNumber로 변환하여 반환
    return MathB.bignumber((isNegative ? '-' : '') + result).toString();
  }

  // shownNumber를 문자열로 셋팅
  public setCurrentNumber(s: string): void {
    this.currentNumber = this.extractNumberString(
      s.substring(0, s.length < 64 ? s.length : 64), // 최대 표시 숫자 갯수는 64
    );
    this.shouldReset = false; // 초기화 예정 끄기
  }

  // 표시 숫자 얻기
  public getCurrentNumber(): string {
    return this.currentNumber;
  }

  // 백업 숫자 얻기
  public getPreviousNumber(): string {
    return this.previousNumber;
  }

  // 콘솔로 결과 출력
  // public resultToConsole() {
  //   console.log(this.currentNumber);
  // }

  // 초기화 예정 여부 얻기
  public getShouldReset(): boolean {
    return this.shouldReset;
  }

  // 숫자 1개씩 추가
  public addDigit(digit: number | string): void {
    // 입력된 digit을 숫자로 변환
    const parsedDigit = this.parseDigit(digit);

    // 유효한 숫자인 경우에만 처리
    if (this.isValidDigit(parsedDigit)) {
      this.updateCurrentNumber(parsedDigit.toString());
    }
  }

  // 입력된 digit을 숫자로 변환하는 private 메서드
  private parseDigit(digit: number | string): number {
    if (typeof digit === 'string') {
      // 문자열인 경우 첫 번째 문자만 정수로 변환
      return parseInt(digit.charAt(0)) || 0;
    }
    // 이미 숫자인 경우 정수 부분만 반환
    return Math.floor(digit);
  }

  // 유효한 숫자인지 확인하는 private 메서드
  private isValidDigit(digit: number): boolean {
    return digit >= 0 && digit <= 9;
  }

  // 현재 숫자를 업데이트하는 private 메서드
  private updateCurrentNumber(digitString: string): void {
    if (this.currentNumber === '0' || this.shouldReset) {
      // 현재 숫자가 0��거나 초기화 예정인 경우
      this.currentNumber = digitString;
      this.shouldReset = false;
    } else {
      // 기존 숫자에 새로운 숫자 추가
      this.currentNumber += digitString;
    }
  }

  // 소수점 추가
  public addDot() {
    if (this.shouldReset) {
      // 초기화 예정이면 (숫자에 앞서 .만 입력할 시)
      this.currentNumber = '0.';
      this.shouldReset = false;
    } else if (!this.currentNumber.match(/\./))
      // 표시 숫자에 .이 없으면 . 추가
      this.currentNumber += '.';
  }

  // 숫자 또는 소수점 지우기
  public deleteDigitOrDot() {
    // 표시 숫자가 1개이거나, 표시 숫자가 '-'로 시작하고 길이가 2인 경우
    if (this.currentNumber.match(/^-?\d$/)) {
      // 표시 숫자를 '0'으로 설정
      this.currentNumber = '0';
    } else {
      // 그 외의 경우 표시 숫자의 마지막 글자 제거
      this.currentNumber = this.currentNumber.slice(0, -1);
    }
  }

  /**
   * 부동소수점 숫자를 문자열로 변환
   * @param numberForCalc 변환할 숫자 (문자열 형태)
   * @returns 정수 부분과 소수 부분이 포함된 문자열
   */
  private numberToString(numberForCalc: string): string {
    const [integer, decimal] = numberForCalc.split('.');

    // 소수��이 있는 경우 정수 부분과 소수 부분을 결합하여 반환
    // 소수점이 없는 경우 정수 부분만 반환
    return decimal ? `${integer}.${decimal}` : integer;
  }

  // 부호 변환
  public changeSign() {
    this.currentNumber = MathB.bignumber(this.getCurrentNumber()).mul(-1).toString();
  }

  // 임시 숫자를 표시 숫자로
  private setCurrentNumberFromPrevious() {
    this.currentNumber = this.previousNumber;
  }

  // 표시 숫자를 임 숫자로
  private setPreviousNumberFromCurrent() {
    this.previousNumber = this.currentNumber;
  }

  // 사전 계산 함수
  private performPreCalculation() {
    // 계산에 사용할 숫자 결정
    const numberForCalc = this.shouldReset ? this.repeatedNumber : this.currentNumber;

    // 초기화 예정이고 반복 계산 숫자가 0이면 계산 중단
    if (this.shouldReset && numberForCalc === '0') return;

    // 반복 계산을 위해 현재 숫자 저장
    if (!this.shouldReset) {
      this.repeatedNumber = numberForCalc;
    }

    // 연산 수행 및 결과 저장
    const result = this.calculateResult(numberForCalc);
    this.previousNumber = this.addHistory({
      previousNumber: this.previousNumber,
      operator: this.getOperatorString() as string,
      argumentNumber: numberForCalc,
      resultNumber: result,
    });
  }

  // 실제 계산 수행 함수
  private calculateResult(numberForCalc: string): string {
    const prev = MathB.bignumber(this.previousNumber);
    const curr = MathB.bignumber(numberForCalc);

    switch (this.currentOperator) {
      case Operator.Plus:
        return prev.add(curr).toString();
      case Operator.Minus:
        return prev.sub(curr).toString();
      case Operator.Mul:
        return prev.mul(curr).toString();
      case Operator.Div:
        if (curr.isZero()) {
          throw new Error('Cannot divide by zero.');
        }
        return prev.div(curr).toString();
      case Operator.Pow:
        return prev.pow(curr).toString();
      case Operator.Root:
        return prev.pow(MathB.bignumber(1).div(curr)).toString();
      case Operator.Mod:
        return prev.mod(curr).toString();
      default:
        return this.previousNumber;
    }
  }

  // 연산자 공통 처리 함수
  private performOperation(operator: Operator) {
    if (this.currentOperator === Operator.None) {
      // 이전 연산자가 없는 경우, 현재 숫자를 이전 숫자로 설정
      this.setPreviousNumberFromCurrent();
    } else {
      // 이전 연산자가 있는 경우, 계산 수행
      this.performPreCalculation();
      // 계산 결과를 현재 숫자로 설정
      this.setCurrentNumberFromPrevious();
    }

    // 새로운 연산자 설정 및 초기화 플래그 설정
    this.currentOperator = operator;
    this.shouldReset = true;
  }

  // 기본 산술 연산 메서드들
  public plus() {
    this.performOperation(Operator.Plus);
  }
  public minus() {
    this.performOperation(Operator.Minus);
  }
  public mul() {
    this.performOperation(Operator.Mul);
  }
  public div() {
    this.performOperation(Operator.Div);
  }
  public pow() {
    this.performOperation(Operator.Pow);
  }
  public root() {
    this.performOperation(Operator.Root);
  }
  public mod() {
    this.performOperation(Operator.Mod);
  }

  // 등호(=) 버튼 처리
  public equal() {
    if (this.currentOperator === Operator.None) {
      // 이전 연산자가 없는 경우, 현재 숫자를 이전 숫자로 설정
      this.setPreviousNumberFromCurrent();
    } else {
      // 이전 연산자가 있는 경우, 계산 수행 및 결과 처리
      this.performPreCalculation();
      this.setCurrentNumberFromPrevious();

      // 상태 초기화
      this.currentOperator = Operator.None;
      this.shouldReset = true;
      this.repeatedNumber = '0';
    }
  }

  // 연산자 문자열로 얻기
  public getOperatorString(operator: Operator = this.currentOperator): string {
    return Object.keys(operatorMap).find((key) => operatorMap[key] === operator) || '';
  }

  // % 연산 처리
  public percent(): void {
    if (this.currentOperator === Operator.Div || this.currentOperator === Operator.Mul) {
      this.performPreCalculation(); // 사전 계산 수행

      const {previousNumber, argumentNumber} = this.resultSnapshot;
      this.unshiftHistory();
      const operator = this.getOperatorString() + this.getOperatorString(Operator.Pct);

      // 나기면 퍼센트를 구하고, 곱하기면 퍼센트로 곱함
      const resultNumber =
        this.currentOperator === Operator.Div
          ? MathB.bignumber(this.previousNumber).mul(100).toString()
          : MathB.bignumber(this.previousNumber).div(100).toString();

      this.previousNumber = this.addHistory({
        previousNumber,
        operator,
        argumentNumber,
        resultNumber,
      });

      this.setCurrentNumberFromPrevious();
    }

    this.resetOperatorState();
  }

  // 역수 계산
  public rec(): void {
    if (Number(this.currentNumber) !== 0) {
      this.currentNumber = this.calculateAndAddHistory(this.currentNumber, Operator.Rec, () =>
        MathB.bignumber(1).div(this.currentNumber).toString(),
      );
      this.resetInputState();
    }
  }

  // 제곱 계산
  public pow2(): void {
    this.currentNumber = this.calculateAndAddHistory(this.currentNumber, Operator.Pow2, () =>
      MathB.bignumber(this.currentNumber).pow(2).toString(),
    );
    this.resetInputState();
  }

  // 제곱근 계산
  public sqrt(): void {
    if (this.currentNumber.charAt(0) === '-') {
      throw new Error('The square root of a negative number is not allowed.');
    }
    this.currentNumber = this.calculateAndAddHistory(this.currentNumber, Operator.Sqrt, () =>
      MathB.bignumber(this.currentNumber).sqrt().toString(),
    );
    this.resetInputState();
  }

  private degreesToRadians(degrees: BigNumber): BigNumber {
    return degrees.times(MathB.pi).div(180);
  }

  private calculateTrigonometricFunction(operator: Operator, mathFunction: (x: BigNumber) => BigNumber): void {
    this.currentNumber = this.calculateAndAddHistory(this.currentNumber, operator, () => {
      const radians = this.degreesToRadians(MathB.bignumber(this.currentNumber));
      return mathFunction(radians).toString();
    });
    this.resetInputState();
  }

  // 삼각함수 계산 (sin, cos, tan)
  public sin(): void {
    this.calculateTrigonometricFunction(Operator.Sin, MathB.sin);
  }

  public cos(): void {
    this.calculateTrigonometricFunction(Operator.Cos, MathB.cos);
  }

  public tan(): void {
    this.calculateTrigonometricFunction(Operator.Tan, MathB.tan);
  }

  // 공통 계산 함수
  private commonCalculation(operator: Operator, calculation: () => string): void {
    this.currentNumber = this.calculateAndAddHistory(this.currentNumber, operator, calculation);
    this.resetInputState();
  }

  // 팩토리얼 계산
  public fct(): void {
    if (Number(this.currentNumber) < 0) {
      throw new Error('The factorial of a negative number is not allowed.');
    }
    this.commonCalculation(Operator.Fct, () => MathB.factorial(MathB.bignumber(this.currentNumber)).toString());
  }

  // 10의 거듭제곱 계산
  public exp10(): void {
    this.commonCalculation(Operator.Exp10, () => MathB.pow(10, MathB.bignumber(this.currentNumber)).toString());
  }

  // 정수부 계산
  public int(): void {
    this.commonCalculation(Operator.Int, () => MathB.bignumber(this.currentNumber).floor().toString());
  }

  // 소수부 계산
  public frac(): void {
    this.commonCalculation(Operator.Frac, () => MathB.bignumber(this.currentNumber).mod(1).toString());
  }

  // 연산자 상태 초기화
  private resetOperatorState(): void {
    this.currentOperator = Operator.None;
    this.repeatedNumber = '0';
    this.shouldReset = true;
  }

  // 입력 상태 초기화
  private resetInputState(): void {
    this.repeatedNumber = '0';
    this.shouldReset = true;
  }

  // 계산 및 히스토리 추가 헬퍼 함수
  private calculateAndAddHistory(number: string, operator: Operator, calculation: () => string): string {
    return this.numberToString(
      this.addHistory({
        previousNumber: number,
        operator: this.getOperatorString(operator) as string,
        resultNumber: calculation(),
      }),
    );
  }

  // 상수 얻기 (pi, e, phi)
  public getConstant(constant: string): string {
    if (constants[constant]) {
      return constants[constant];
    } else {
      throw new Error('Constant not found');
    }
  }

  // 상수로 설정
  public setConstant(constant: string) {
    this.currentNumber = this.getConstant(constant);
  }

  // 메모리 저장
  public memorySave() {
    this.memoryNumber = this.currentNumber;
    this.isMemoryReset = false;
  }

  // 메모리 불러오기
  public memoryRecall() {
    if (this.isMemoryReset) {
      throw new Error('No memory to recall.');
    } else {
      this.currentNumber = this.memoryNumber;
      this.shouldReset = false; // 숫자 하나로 셋팅하고 초기화 예정 끄기
    }
  }

  // 메모리 클리어
  public memoryClear() {
    this.memoryNumber = '0';
    this.isMemoryReset = true;
  }

  // 메모리 더하기
  public memoryPlus() {
    if (!this.isMemoryReset) {
      this.memoryNumber = MathB.bignumber(this.memoryNumber).add(this.currentNumber).toString();
      this.shouldReset = true;
    }
  }

  // 메모리 마이너스
  public memoryMinus() {
    if (!this.isMemoryReset) {
      this.memoryNumber = MathB.bignumber(this.memoryNumber).sub(this.currentNumber).toString();
      this.shouldReset = true;
    }
  }

  // 메모리 곱하기
  public memoryMul() {
    if (!this.isMemoryReset) {
      this.memoryNumber = MathB.bignumber(this.memoryNumber).mul(this.currentNumber).toString();
      this.shouldReset = true;
    }
  }

  // 메모리 나누기
  public memoryDiv() {
    if (!this.isMemoryReset) {
      if (this.currentNumber === '0') {
        throw new Error('Cannot divide by zero');
      }
      this.memoryNumber = MathB.bignumber(this.memoryNumber).div(this.currentNumber).toString();
      this.shouldReset = true;
    }
  }

  // 메모리 숫자 얻기
  public getMemoryNumber(): string {
    return this.memoryNumber;
  }

  // 메모리가 리셋되었는지 여부
  public getIsMemoryReset(): boolean {
    return this.isMemoryReset;
  }
}