/**
 * @file Calculator.ts
 * @description 이 파일은 고급 수학 계산 기능을 제공하는 계산기 클래스를 정의합니다.
 *              다양한 수학 연산자와 기능을 지원하며, 사용자가 입력한 수식을 계산하고
 *              결과를 반환하는 기능을 포함합니다. 이 계산기는 정수, 소수, 진법 변환 등
 *              다양한 수학적 작업을 수행할 수 있도록 설계되었습니다.
 */

import { match } from 'ts-pattern';

import { RadixConverter, Radix } from './RadixConverter';
import { CalculatorMath } from './CalculatorMath';
import { CalculatorRecord } from './CalculatorRecord';
import { CalculatorMemory } from './CalculatorMemory';

import { checkError, getErrorMessage } from '../utils/ErrorUtils';

import { toBigNumber } from './CalculatorMath';

/**
 * 계산기에서 사용되는 연산자 열거형
 * @enum {string}
 */
export enum Operator {
  NONE = '',
  ADD = '+',
  SUB = '-',
  MUL = '×',
  DIV = '÷',
  PCT = '%',
  POW = 'pow',
  ROOT = 'root',
  MOD = 'mod',
  BIT_SFT_R = 'bitSftR',
  BIT_SFT_L = 'bitSftL',
  BIT_AND = 'bitAnd',
  BIT_OR = 'bitOr',
  BIT_XOR = 'bitXor',
  BIT_NOT = 'bitNot',
  BIT_NAND = 'bitNand',
  BIT_NOR = 'bitNor',
  BIT_XNOR = 'bitXnor',
  REC = 'rec',
  SQRT = 'sqrt',
  POW2 = 'pow2',
  SIN = 'sin',
  COS = 'cos',
  TAN = 'tan',
  FCT = 'fct',
  EXP10 = 'exp10',
  INT = 'int',
  FRAC = 'frac',
}

/**
 * 고급 수학 계산 기능을 제공하는 계산기 클래스
 * @class Calculator
 */
export class Calculator {
  // 내부 상태 관리 속성
  private _previousNumber!: string;
  private repeatedNumber!: string;
  private currentOperator!: Operator;
  private calculationSnapshot!: CalculationResult;
  private _bufferReset!: boolean;
  private _currentNumber!: string;
  private _inputBuffer!: string;
  private _currentRadix: Radix = Radix.Decimal;
  private _wordSize: WordSize = 8;

  // 외부 의존성 및 유틸리티 객체
  public readonly record!: CalculatorRecord;
  public readonly memory: CalculatorMemory;
  public readonly math: CalculatorMath = new CalculatorMath();
  private radixConverter: RadixConverter = new RadixConverter();

  // 게터/세터

  get previousNumber(): string {
    return this._previousNumber;
  }

  get inputBuffer(): string {
    return this._inputBuffer;
  }

  set inputBuffer(value: string) {
    this._inputBuffer = this.filterNumberCharacters(value);
    this.setBufferToCurrentNumber();
  }

  get currentNumber(): string {
    return this._currentNumber;
  }

  set currentNumber(value: string) {
    this._currentNumber = this.filterNumberCharacters(value, Radix.Decimal);
    this.setCurrentNumberToBuffer();
  }

  get currentRadix(): Radix {
    return this._currentRadix;
  }

  set currentRadix(radix: Radix) {
    if (!Object.values(Radix).includes(radix)) {
      throw new Error(getErrorMessage('error.invalid_radix'));
    }
    this._currentRadix = radix;
    this.setCurrentNumberToBuffer();
  }

  get wordSize(): WordSize {
    return this._wordSize;
  }

  set wordSize(value: WordSize) {
    this._wordSize = value;
  }

  get needsBufferReset(): boolean {
    return this._bufferReset;
  }

  set needsBufferReset(value: boolean) {
    this._bufferReset = value;
  }

  /**
   * 계산기 객체를 초기화하고 기본 상태를 설정합니다.
   */
  constructor() {
    this.reset();
    this.memory = new CalculatorMemory();
    this.memory.setOperationCompleteCallback(() => this.onBufferReset());
    this.memory.setGetCurrentNumberCallback(() => this.currentNumber);
    this.memory.setSetCurrentNumberCallback((number: string) => (this.currentNumber = number));
    this.record = new CalculatorRecord();
    this.offBufferReset();
  }

  // 상태 관리 메서드
  public onBufferReset(): void {
    this._bufferReset = true;
  }

  public offBufferReset(): void {
    this._bufferReset = false;
  }

  /**
   * 계산기의 모든 상태를 초기 값으로 재설정합니다.
   */
  public reset(): void {
    this.inputBuffer = '0';
    this.currentNumber = '0';
    this._previousNumber = '0';
    this.repeatedNumber = '0';
    this.currentOperator = Operator.NONE;
    this.offBufferReset();
  }

  // 버퍼 및 숫자 관리 메서드
  private setBufferToCurrentNumber(): void {
    this._currentNumber = this.radixConverter.convertRadix(this.inputBuffer, this.currentRadix as Radix, Radix.Decimal);
  }

  private setCurrentNumberToBuffer(): void {
    this._inputBuffer = this.radixConverter.convertRadix(
      this.currentNumber.toString(),
      Radix.Decimal,
      this.currentRadix as Radix,
    );
  }

  public refreshBuffer(): void {
    const tmp = this.inputBuffer;
    this.inputBuffer = '';
    this.inputBuffer = tmp;
  }

  private setCurrentNumberFromPrevious(): void {
    this.currentNumber = this._previousNumber;
  }

  private setPreviousNumberFromCurrent(): void {
    this._previousNumber = this.currentNumber;
  }

  // 유틸리티 메서드
  public getOperatorString(operator: Operator = this.currentOperator): string {
    return operator;
  }

  public getCurrentOperator(): Operator {
    return this.currentOperator;
  }

  /**
   * 문자열에서 현재 진법에 맞는 유효한 숫자만 추출합니다.
   */
  private filterNumberCharacters(originalString: string, radix: Radix = this.currentRadix): string {
    // 진법에 따라 적절한 정규식 패턴 선택
    let onlyNumber = (() => {
      switch (radix) {
        case 'hex':
          return originalString.replace(/[^0-9a-fA-F.-]/gm, '').toUpperCase();
        case 'oct':
          return originalString.replace(/[^0-7.-]/gm, '');
        case 'bin':
          return originalString.replace(/[^0-1.-]/gm, '');
        default:
          return originalString.replace(/[^0-9.-]/gm, '');
      }
    })();

    const isNegative = onlyNumber.startsWith('-');
    onlyNumber = onlyNumber.replace(/-/g, '');
    const [integerPart, ...fractionParts] = onlyNumber.split('.');
    let result = integerPart || '0';

    if (fractionParts.length > 0) {
      result += '.' + fractionParts.join('');
    }

    return (isNegative ? '-' : '') + result;
  }

  // 기록 관리 메서드
  private saveCalculationResult(record: CalculationResult): void {
    this.calculationSnapshot = record;
  }

  private addRecord(record: CalculationResult): string {
    this.saveCalculationResult(record);
    this.record?.addRecord(record);
    return record.resultNumber;
  }

  private removeFirstRecord(): void {
    this.calculationSnapshot = {
      previousNumber: '',
      operator: Operator.NONE,
      argumentNumber: '',
      resultNumber: '',
    };
    this.record?.removeFirst();
  }

  // 연산자 상태 관리 메서드
  private resetOperatorState(): void {
    this.currentOperator = Operator.NONE;
    this.repeatedNumber = '0';
    this.onBufferReset();
  }

  private resetInputState(): void {
    this.repeatedNumber = '0';
    this.onBufferReset();
  }

  // 핵심 계산 메서드
  /**
   * 이항 연산 계산을 수행합니다.
   */
  private performBinaryOperationCalculation(numberForCalc: string): string {
    const prevValue = this._previousNumber;
    const currentValue = numberForCalc;

    return match(this.currentOperator)
      .with(Operator.ADD, () => this.math.add(prevValue, currentValue))
      .with(Operator.SUB, () => this.math.sub(prevValue, currentValue))
      .with(Operator.MUL, () => this.math.mul(prevValue, currentValue))
      .with(Operator.DIV, () => this.math.div(prevValue, currentValue))
      .with(Operator.MOD, () => this.math.mod(prevValue, currentValue))
      .with(Operator.POW, () => this.math.pow(prevValue, currentValue))
      .with(Operator.ROOT, () => this.math.root(prevValue, currentValue))
      .with(Operator.BIT_SFT_L, () => this.math.bitwiseLeftShift(prevValue, currentValue, this.wordSize))
      .with(Operator.BIT_SFT_R, () => this.math.bitwiseRightShift(prevValue, currentValue, this.wordSize))
      .with(Operator.BIT_AND, () => this.math.bitwiseAnd(prevValue, currentValue, this.wordSize))
      .with(Operator.BIT_OR, () => this.math.bitwiseOr(prevValue, currentValue, this.wordSize))
      .with(Operator.BIT_XOR, () => this.math.bitwiseXor(prevValue, currentValue, this.wordSize))
      .with(Operator.BIT_NAND, () => this.math.bitwiseNand(prevValue, currentValue, this.wordSize))
      .with(Operator.BIT_NOR, () => this.math.bitwiseNor(prevValue, currentValue, this.wordSize))
      .with(Operator.BIT_XNOR, () => this.math.bitwiseXnor(prevValue, currentValue, this.wordSize))
      .otherwise(() => this._previousNumber);
  }

  private performPreCalculation(): void {
    const numberForCalc = this._bufferReset ? this.repeatedNumber : this.currentNumber;

    if (this._bufferReset && numberForCalc === '0') {
      return;
    }

    if (!this._bufferReset) {
      this.repeatedNumber = numberForCalc;
    }

    const result = this.performBinaryOperationCalculation(numberForCalc);
    this._previousNumber = this.addRecord({
      previousNumber: this._previousNumber.toString(),
      operator: this.currentOperator,
      argumentNumber: numberForCalc.toString(),
      resultNumber: result.toString(),
    });
  }

  private calculateAndAddRecord(number: string, operator: Operator, calculation: () => string): string {
    return this.addRecord({
      previousNumber: number,
      operator: operator,
      resultNumber: calculation(),
    });
  }

  // 숫자 입력 관련 메서드
  public addDigit(digit: number | string): void {
    const digitString = typeof digit === 'string' ? digit.charAt(0) : Math.floor(digit).toString();
    checkError(!this.radixConverter.isValidRadixNumber(digitString, this.currentRadix), 'error.invalid_digit');

    if (this.inputBuffer === '0' || this._bufferReset) {
      this.inputBuffer = digitString;
      this.offBufferReset();
    } else {
      this.inputBuffer = this.inputBuffer + digitString;
    }
  }

  public addDot(): void {
    if (this._bufferReset) {
      this.inputBuffer = '0.';
      this.offBufferReset();
    } else if (!this.inputBuffer.includes('.')) {
      this.inputBuffer = this.inputBuffer + '.';
    }
  }

  public pasteToBuffer(text: string): void {
    this.inputBuffer = text;
    this.offBufferReset();
  }

  public deleteDigitOrDot(): void {
    if (this.inputBuffer.match(/^-?.$/) || this.inputBuffer === '-0') {
      this.inputBuffer = '0';
    } else {
      this.inputBuffer = this.inputBuffer.slice(0, -1);
    }
  }

  public changeSign(): void {
    if (this.inputBuffer !== '0') {
      this.inputBuffer = /^-/.test(this.inputBuffer) ? this.inputBuffer.slice(1) : '-' + this.inputBuffer;
    }
  }

  // 단항 연산 메서드
  private performUnaryOperation(operator: Operator, calculation: () => string): void {
    this.currentNumber = this.calculateAndAddRecord(this.currentNumber, operator, calculation);
    this.resetInputState();
  }

  public rec(): void {
    checkError(toBigNumber(this.currentNumber).eq(0), 'error.divide_by_zero');
    this.performUnaryOperation(Operator.REC, () => this.math.div('1', this.currentNumber));
  }

  public sqrt(): void {
    checkError(toBigNumber(this.currentNumber).lt(0), 'error.math.negative_root');
    this.performUnaryOperation(Operator.SQRT, () => this.math.root(this.currentNumber, '2'));
  }

  public pow2(): void {
    this.performUnaryOperation(Operator.POW2, () => this.math.pow(this.currentNumber, '2'));
  }

  public fct(): void {
    checkError(toBigNumber(this.currentNumber).lt(0), 'error.math.negative_factorial');
    this.performUnaryOperation(Operator.FCT, () => this.math.fact(this.currentNumber));
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
    this.performUnaryOperation(Operator.BIT_NOT, () => this.math.bitwiseNot(this.currentNumber, this.wordSize));
  }

  // 이항 연산 메서드
  private performBinaryOperation(operator: Operator): void {
    if (this.currentOperator === Operator.NONE) {
      this.setPreviousNumberFromCurrent();
    } else {
      this.performPreCalculation();
      this.setCurrentNumberFromPrevious();
    }
    this.currentOperator = operator;
    this.onBufferReset();
  }

  public add(): void {
    this.performBinaryOperation(Operator.ADD);
  }

  public sub(): void {
    this.performBinaryOperation(Operator.SUB);
  }

  public mul(): void {
    this.performBinaryOperation(Operator.MUL);
  }

  public div(): void {
    this.performBinaryOperation(Operator.DIV);
  }

  public pow(): void {
    this.performBinaryOperation(Operator.POW);
  }

  public root(): void {
    this.performBinaryOperation(Operator.ROOT);
  }

  public mod(): void {
    this.performBinaryOperation(Operator.MOD);
  }

  public bitSftL(): void {
    this.performBinaryOperation(Operator.BIT_SFT_L);
  }

  public bitSftR(): void {
    this.performBinaryOperation(Operator.BIT_SFT_R);
  }

  public bitAnd(): void {
    this.performBinaryOperation(Operator.BIT_AND);
  }

  public bitOr(): void {
    this.performBinaryOperation(Operator.BIT_OR);
  }

  public bitXor(): void {
    this.performBinaryOperation(Operator.BIT_XOR);
  }

  public bitNand(): void {
    this.performBinaryOperation(Operator.BIT_NAND);
  }

  public bitNor(): void {
    this.performBinaryOperation(Operator.BIT_NOR);
  }

  public bitXnor(): void {
    this.performBinaryOperation(Operator.BIT_XNOR);
  }

  // 숫자를 직접 사용하는 이항 연산 메서드
  private executeWithNumber(operator: Operator, n: number): void {
    // 연산자 설정 및 이전 숫자 설정
    this.performBinaryOperation(operator);

    // 현재 숫자를 n으로 설정하고 반복 숫자로도 설정
    this.currentNumber = n.toString();
    this.repeatedNumber = n.toString();

    // 계산 수행 및 결과 설정 (equal 메서드 활용)
    this.equal();
  }

  public addNumber(n: number): void {
    this.executeWithNumber(Operator.ADD, n);
  }

  public subNumber(n: number): void {
    this.executeWithNumber(Operator.SUB, n);
  }

  public mulNumber(n: number): void {
    this.executeWithNumber(Operator.MUL, n);
  }

  public divNumber(n: number): void {
    this.executeWithNumber(Operator.DIV, n);
  }

  public powNumber(n: number): void {
    this.executeWithNumber(Operator.POW, n);
  }

  public rootNumber(n: number): void {
    this.executeWithNumber(Operator.ROOT, n);
  }

  public modNumber(n: number): void {
    this.executeWithNumber(Operator.MOD, n);
  }

  public bitSftLNumber(n: number): void {
    this.executeWithNumber(Operator.BIT_SFT_L, n);
  }

  public bitSftRNumber(n: number): void {
    this.executeWithNumber(Operator.BIT_SFT_R, n);
  }

  public bitAndNumber(n: number): void {
    this.executeWithNumber(Operator.BIT_AND, n);
  }

  public bitOrNumber(n: number): void {
    this.executeWithNumber(Operator.BIT_OR, n);
  }

  public bitXorNumber(n: number): void {
    this.executeWithNumber(Operator.BIT_XOR, n);
  }

  public bitNandNumber(n: number): void {
    this.executeWithNumber(Operator.BIT_NAND, n);
  }

  public bitNorNumber(n: number): void {
    this.executeWithNumber(Operator.BIT_NOR, n);
  }

  public bitXnorNumber(n: number): void {
    this.executeWithNumber(Operator.BIT_XNOR, n);
  }

  // 특수 연산 메서드
  /**
   * 등호(=) 버튼을 눌렀을 때의 처리를 수행합니다.
   */
  public equal(): void {
    if (this.currentOperator === Operator.NONE) {
      this.setPreviousNumberFromCurrent();
    } else {
      this.performPreCalculation();
      this.setCurrentNumberFromPrevious();
      this.currentOperator = Operator.NONE;
      this.onBufferReset();
      this.repeatedNumber = '0';
    }
  }

  /**
   * 퍼센트(%) 연산을 처리합니다.
   */
  public percent(): void {
    if (this.currentOperator === Operator.DIV || this.currentOperator === Operator.MUL) {
      this.performPreCalculation();
      const { previousNumber, argumentNumber } = this.calculationSnapshot;
      this.removeFirstRecord();

      const operator = [Operator.PCT, this.currentOperator];
      const resultNumber =
        this.currentOperator === Operator.DIV
          ? toBigNumber(this._previousNumber).mul(100).toString()
          : toBigNumber(this._previousNumber).div(100).toString();

      this._previousNumber = this.addRecord({
        previousNumber,
        operator,
        argumentNumber: argumentNumber ?? '',
        resultNumber,
      });
      this.setCurrentNumberFromPrevious();
      this.resetOperatorState();
    }
  }

  public setConstant(constant: string): void {
    this.currentNumber = this.math.getConstant(constant);
    this.offBufferReset();
  }
}
