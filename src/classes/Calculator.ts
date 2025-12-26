/**
 * @file Calculator.ts
 * @description 이 파일은 고급 수학 계산 기능을 제공하는 계산기 클래스를 정의합니다.
 *              다양한 수학 연산자와 기능을 지원하며, 사용자가 입력한 수식을 계산하고
 *              결과를 반환하는 기능을 포함합니다. 이 계산기는 정수, 소수, 진법 변환 등
 *              다양한 수학적 작업을 수행할 수 있도록 설계되었습니다.
 *              단일 책임 원칙에 따라 상태 관리, 입력 처리, 연산 처리, 기록 관리를
 *              각각의 전담 클래스로 분리하여 유지보수성을 향상시켰습니다.
 */

import { Radix } from '../utils/RadixConverter';
import { CalculatorMath } from './CalculatorMath';
import { CalculatorRecord } from './CalculatorRecord';
import { CalculatorMemory } from './CalculatorMemory';
import { CalculatorState } from './CalculatorState';
import { CalculatorInputHandler } from './CalculatorInputHandler';
import { CalculatorOperationHandler } from './CalculatorOperationHandler';
import { CalculatorRadixConverter } from './CalculatorRadixConverter';

import { getErrorMessage } from '../utils/ErrorUtils';

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
 * @description 단일 책임 원칙에 따라 각 기능을 전담 클래스로 분리하여
 *              유지보수성과 테스트 용이성을 향상시켰습니다.
 */
export class Calculator {
  // 핵심 컴포넌트
  private readonly state: CalculatorState;
  private readonly inputHandler: CalculatorInputHandler;
  private readonly operationHandler: CalculatorOperationHandler;
  private readonly radixConverter: CalculatorRadixConverter;

  // 외부 의존성 및 유틸리티 객체
  public readonly record: CalculatorRecord;
  public readonly memory: CalculatorMemory;
  public readonly math: CalculatorMath = new CalculatorMath();

  // 게터/세터

  get previousNumber(): string {
    return this.state.previousNumber;
  }

  get inputBuffer(): string {
    return this.state.inputBuffer;
  }

  set inputBuffer(value: string) {
    this.inputHandler.setInputBuffer(value);
  }

  get currentNumber(): string {
    return this.state.currentNumber;
  }

  set currentNumber(value: string) {
    const filtered = this.radixConverter.filterNumberCharacters(value, Radix.Decimal);
    this.state.currentNumber = filtered;
    this.inputHandler.setCurrentNumberToBuffer();
  }

  get currentRadix(): Radix {
    return this.state.currentRadix;
  }

  set currentRadix(radix: Radix) {
    if (!Object.values(Radix).includes(radix)) {
      throw new Error(getErrorMessage('error.invalid_radix'));
    }
    this.state.currentRadix = radix;
    this.inputHandler.setCurrentNumberToBuffer();
  }

  get wordSize(): WordSize {
    return this.state.wordSize;
  }

  set wordSize(value: WordSize) {
    this.state.wordSize = value;
  }

  get needsBufferReset(): boolean {
    return this.state.bufferReset;
  }

  set needsBufferReset(value: boolean) {
    this.state.bufferReset = value;
  }

  /**
   * 계산기 객체를 초기화하고 기본 상태를 설정합니다.
   */
  constructor() {
    // 핵심 컴포넌트 초기화
    this.state = new CalculatorState();
    this.radixConverter = new CalculatorRadixConverter();
    this.record = new CalculatorRecord();
    this.inputHandler = new CalculatorInputHandler(this.state, this.radixConverter);
    this.operationHandler = new CalculatorOperationHandler(this.state, this.record, this.math);

    // 메모리 초기화 및 콜백 설정
    this.memory = new CalculatorMemory();
    this.memory.setOperationCompleteCallback(() => this.onBufferReset());
    this.memory.setGetCurrentNumberCallback(() => this.currentNumber);
    this.memory.setSetCurrentNumberCallback((number: string) => (this.currentNumber = number));

    // 초기 상태 설정
    this.reset();
  }

  // 상태 관리 메서드
  public onBufferReset(): void {
    this.state.onBufferReset();
  }

  public offBufferReset(): void {
    this.state.offBufferReset();
  }

  /**
   * 계산기의 모든 상태를 초기 값으로 재설정합니다.
   */
  public reset(): void {
    this.state.reset();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  // 버퍼 및 숫자 관리 메서드
  public refreshBuffer(): void {
    this.inputHandler.refreshBuffer();
  }

  // 유틸리티 메서드
  public getOperatorString(operator: Operator = this.state.currentOperator): string {
    return operator;
  }

  public getCurrentOperator(): Operator {
    return this.state.currentOperator;
  }

  /**
   * 문자열에서 현재 진법에 맞는 유효한 숫자만 추출합니다.
   * @param originalString - 원본 문자열
   * @param radix - 진법 (기본값: 현재 진법)
   * @returns 필터링된 숫자 문자열
   */
  public filterNumberCharacters(originalString: string, radix: Radix = this.state.currentRadix): string {
    return this.radixConverter.filterNumberCharacters(originalString, radix);
  }

  // 숫자 입력 관련 메서드
  public addDigit(digit: number | string): void {
    this.inputHandler.addDigit(digit);
  }

  public addDot(): void {
    this.inputHandler.addDot();
  }

  public pasteToBuffer(text: string): void {
    this.inputHandler.pasteToBuffer(text);
  }

  public deleteDigitOrDot(): void {
    this.inputHandler.deleteDigitOrDot();
  }

  public changeSign(): void {
    this.inputHandler.changeSign();
  }

  // 단항 연산 메서드
  public rec(): void {
    this.operationHandler.rec();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public sqrt(): void {
    this.operationHandler.sqrt();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public pow2(): void {
    this.operationHandler.pow2();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public fct(): void {
    this.operationHandler.fct();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public exp10(): void {
    this.operationHandler.exp10();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public int(): void {
    this.operationHandler.int();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public frac(): void {
    this.operationHandler.frac();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public sin(): void {
    this.operationHandler.sin();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public cos(): void {
    this.operationHandler.cos();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public tan(): void {
    this.operationHandler.tan();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitNot(): void {
    this.operationHandler.bitNot();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  // 이항 연산 메서드
  public add(): void {
    this.operationHandler.add();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public sub(): void {
    this.operationHandler.sub();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public mul(): void {
    this.operationHandler.mul();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public div(): void {
    this.operationHandler.div();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public pow(): void {
    this.operationHandler.pow();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public root(): void {
    this.operationHandler.root();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public mod(): void {
    this.operationHandler.mod();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitSftL(): void {
    this.operationHandler.bitSftL();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitSftR(): void {
    this.operationHandler.bitSftR();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitAnd(): void {
    this.operationHandler.bitAnd();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitOr(): void {
    this.operationHandler.bitOr();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitXor(): void {
    this.operationHandler.bitXor();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitNand(): void {
    this.operationHandler.bitNand();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitNor(): void {
    this.operationHandler.bitNor();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitXnor(): void {
    this.operationHandler.bitXnor();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  // 숫자를 직접 사용하는 이항 연산 메서드
  public addNumber(n: number): void {
    this.operationHandler.addNumber(n);
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public subNumber(n: number): void {
    this.operationHandler.subNumber(n);
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public mulNumber(n: number): void {
    this.operationHandler.mulNumber(n);
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public divNumber(n: number): void {
    this.operationHandler.divNumber(n);
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public powNumber(n: number): void {
    this.operationHandler.powNumber(n);
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public rootNumber(n: number): void {
    this.operationHandler.rootNumber(n);
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public modNumber(n: number): void {
    this.operationHandler.modNumber(n);
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitSftLNumber(n: number): void {
    this.operationHandler.bitSftLNumber(n);
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitSftRNumber(n: number): void {
    this.operationHandler.bitSftRNumber(n);
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitAndNumber(n: number): void {
    this.operationHandler.bitAndNumber(n);
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitOrNumber(n: number): void {
    this.operationHandler.bitOrNumber(n);
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitXorNumber(n: number): void {
    this.operationHandler.bitXorNumber(n);
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitNandNumber(n: number): void {
    this.operationHandler.bitNandNumber(n);
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitNorNumber(n: number): void {
    this.operationHandler.bitNorNumber(n);
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public bitXnorNumber(n: number): void {
    this.operationHandler.bitXnorNumber(n);
    this.inputHandler.setCurrentNumberToBuffer();
  }

  // 특수 연산 메서드
  /**
   * 등호(=) 버튼을 눌렀을 때의 처리를 수행합니다.
   */
  public equal(): void {
    this.operationHandler.equal();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  /**
   * 퍼센트(%) 연산을 처리합니다.
   */
  public percent(): void {
    this.operationHandler.percent();
    this.inputHandler.setCurrentNumberToBuffer();
  }

  public setConstant(constant: string): void {
    this.state.currentNumber = this.math.getConstant(constant);
    this.state.offBufferReset();
    this.inputHandler.setCurrentNumberToBuffer();
  }
}
