/**
 * @file CalculatorInputHandler.ts
 * @description 계산기의 숫자 입력 처리를 담당하는 클래스입니다.
 *              숫자 입력, 소수점 추가, 삭제, 부호 변경 등의 입력 관련 기능을 제공합니다.
 */

import type { CalculatorRadixConverter } from './CalculatorRadixConverter';
import type { CalculatorState } from './CalculatorState';

/**
 * 계산기의 숫자 입력 처리를 담당하는 클래스
 * @class CalculatorInputHandler
 */
export class CalculatorInputHandler {
  private state: CalculatorState;
  private radixConverter: CalculatorRadixConverter;

  constructor(state: CalculatorState, radixConverter: CalculatorRadixConverter) {
    this.state = state;
    this.radixConverter = radixConverter;
  }

  /**
   * 입력 버퍼에 숫자를 추가합니다.
   * @param digit - 추가할 숫자 (문자열 또는 숫자)
   */
  public addDigit(digit: number | string): void {
    const digitString = typeof digit === 'string' ? digit.charAt(0) : Math.floor(digit).toString();
    this.radixConverter.validateRadixNumber(digitString, this.state.currentRadix);

    if (this.state.inputBuffer === '0' || this.state.bufferReset) {
      this.state.inputBuffer = digitString;
      this.state.offBufferReset();
    } else {
      this.state.inputBuffer = this.state.inputBuffer + digitString;
    }

    this.updateCurrentNumberFromBuffer();
  }

  /**
   * 입력 버퍼에 소수점을 추가합니다.
   */
  public addDot(): void {
    if (this.state.bufferReset) {
      this.state.inputBuffer = '0.';
      this.state.offBufferReset();
    } else if (!this.state.inputBuffer.includes('.')) {
      this.state.inputBuffer = this.state.inputBuffer + '.';
    }
  }

  /**
   * 입력 버퍼에 텍스트를 붙여넣습니다.
   * @param text - 붙여넣을 텍스트
   */
  public pasteToBuffer(text: string): void {
    const filteredText = this.radixConverter.filterNumberCharacters(text, this.state.currentRadix);
    this.state.inputBuffer = filteredText;
    this.state.offBufferReset();
    this.updateCurrentNumberFromBuffer();
  }

  /**
   * 입력 버퍼에서 마지막 숫자나 소수점을 삭제합니다.
   */
  public deleteDigitOrDot(): void {
    if (this.state.inputBuffer.match(/^-?.$/) || this.state.inputBuffer === '-0') {
      this.state.inputBuffer = '0';
    } else {
      this.state.inputBuffer = this.state.inputBuffer.slice(0, -1);
    }
    this.updateCurrentNumberFromBuffer();
  }

  /**
   * 입력 버퍼의 부호를 변경합니다.
   */
  public changeSign(): void {
    if (this.state.inputBuffer !== '0') {
      this.state.inputBuffer = /^-/.test(this.state.inputBuffer)
        ? this.state.inputBuffer.slice(1)
        : '-' + this.state.inputBuffer;
    }
    this.updateCurrentNumberFromBuffer();
  }

  /**
   * 입력 버퍼를 새로고침합니다.
   */
  public refreshBuffer(): void {
    const tmp = this.state.inputBuffer;
    this.state.inputBuffer = '';
    this.state.inputBuffer = tmp;
    this.updateCurrentNumberFromBuffer();
  }

  /**
   * 입력 버퍼를 필터링하여 설정합니다.
   * @param value - 설정할 값
   */
  public setInputBuffer(value: string): void {
    const filtered = this.radixConverter.filterNumberCharacters(value, this.state.currentRadix);
    this.state.inputBuffer = filtered;
    this.updateCurrentNumberFromBuffer();
  }

  /**
   * 현재 숫자를 입력 버퍼로 변환하여 설정합니다.
   */
  public setCurrentNumberToBuffer(): void {
    this.state.inputBuffer = this.radixConverter.convertCurrentNumberToBuffer(
      this.state.currentNumber,
      this.state.currentRadix,
    );
  }

  /**
   * 입력 버퍼를 현재 숫자로 변환하여 업데이트합니다.
   */
  private updateCurrentNumberFromBuffer(): void {
    this.state.currentNumber = this.radixConverter.convertBufferToCurrentNumber(
      this.state.inputBuffer,
      this.state.currentRadix,
    );
  }
}
