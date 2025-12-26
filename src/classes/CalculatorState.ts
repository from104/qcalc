/**
 * @file CalculatorState.ts
 * @description 계산기의 내부 상태를 관리하는 클래스입니다.
 *              버퍼, 숫자, 연산자, 진법, 워드 사이즈 등의 상태를 중앙에서 관리합니다.
 */

import { Radix } from '../utils/RadixConverter';
import type { WordSize } from '../types/calculator';
import { Operator } from './Calculator';
import type { CalculationResult } from '../types/calculator';

/**
 * 계산기의 내부 상태를 관리하는 클래스
 * @class CalculatorState
 */
export class CalculatorState {
  private _previousNumber: string = '0';
  private _repeatedNumber: string = '0';
  private _currentOperator: Operator = Operator.NONE;
  private _calculationSnapshot: CalculationResult = {
    previousNumber: '',
    operator: Operator.NONE,
    argumentNumber: '',
    resultNumber: '',
  };
  private _bufferReset: boolean = false;
  private _currentNumber: string = '0';
  private _inputBuffer: string = '0';
  private _currentRadix: Radix = Radix.Decimal;
  private _wordSize: WordSize = 8;

  // 게터/세터
  get previousNumber(): string {
    return this._previousNumber;
  }

  set previousNumber(value: string) {
    this._previousNumber = value;
  }

  get repeatedNumber(): string {
    return this._repeatedNumber;
  }

  set repeatedNumber(value: string) {
    this._repeatedNumber = value;
  }

  get currentOperator(): Operator {
    return this._currentOperator;
  }

  set currentOperator(value: Operator) {
    this._currentOperator = value;
  }

  get calculationSnapshot(): CalculationResult {
    return this._calculationSnapshot;
  }

  set calculationSnapshot(value: CalculationResult) {
    this._calculationSnapshot = value;
  }

  get bufferReset(): boolean {
    return this._bufferReset;
  }

  set bufferReset(value: boolean) {
    this._bufferReset = value;
  }

  get currentNumber(): string {
    return this._currentNumber;
  }

  set currentNumber(value: string) {
    this._currentNumber = value;
  }

  get inputBuffer(): string {
    return this._inputBuffer;
  }

  set inputBuffer(value: string) {
    this._inputBuffer = value;
  }

  get currentRadix(): Radix {
    return this._currentRadix;
  }

  set currentRadix(value: Radix) {
    this._currentRadix = value;
  }

  get wordSize(): WordSize {
    return this._wordSize;
  }

  set wordSize(value: WordSize) {
    this._wordSize = value;
  }

  /**
   * 모든 상태를 초기 값으로 재설정합니다.
   */
  public reset(): void {
    this._inputBuffer = '0';
    this._currentNumber = '0';
    this._previousNumber = '0';
    this._repeatedNumber = '0';
    this._currentOperator = Operator.NONE;
    this._bufferReset = false;
    this._calculationSnapshot = {
      previousNumber: '',
      operator: Operator.NONE,
      argumentNumber: '',
      resultNumber: '',
    };
  }

  /**
   * 버퍼 리셋 상태를 활성화합니다.
   */
  public onBufferReset(): void {
    this._bufferReset = true;
  }

  /**
   * 버퍼 리셋 상태를 비활성화합니다.
   */
  public offBufferReset(): void {
    this._bufferReset = false;
  }

  /**
   * 이전 숫자를 현재 숫자로 설정합니다.
   */
  public setCurrentNumberFromPrevious(): void {
    this._currentNumber = this._previousNumber;
  }

  /**
   * 현재 숫자를 이전 숫자로 설정합니다.
   */
  public setPreviousNumberFromCurrent(): void {
    this._previousNumber = this._currentNumber;
  }

  /**
   * 연산자 상태를 초기화합니다.
   */
  public resetOperatorState(): void {
    this._currentOperator = Operator.NONE;
    this._repeatedNumber = '0';
    this.onBufferReset();
  }

  /**
   * 입력 상태를 초기화합니다.
   */
  public resetInputState(): void {
    this._repeatedNumber = '0';
    this.onBufferReset();
  }
}
