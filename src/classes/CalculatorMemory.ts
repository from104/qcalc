import { CalculatorMath } from './CalculatorMath';
import { checkError } from './utils/ErrorUtils';

/**
 * 계산기의 메모리 기능을 관리하는 클래스
 * @class
 * @description
 * 계산기의 메모리 저장, 불러오기, 연산 등의 기능을 제공합니다.
 */
export class CalculatorMemory {
  private math: CalculatorMath = new CalculatorMath();
  private number: string = '';
  private onOperationComplete?: () => void;
  private getCurrentNumberCallback?: () => string;
  private setCurrentNumberCallback?: (value: string) => void;

  /**
   * 메모리가 비어있는지 확인하는 getter
   * @returns {boolean} 메모리가 비어있으면 true, 아니면 false
   */
  get isEmpty(): boolean {
    return this.number === '';
  }

  /**
   * 메모리 연산 완료 후 실행될 콜백을 설정합니다.
   * @param callback - 연산 완료 후 실행될 콜백 함수
   */
  public setOperationCompleteCallback(callback: () => void): void {
    this.onOperationComplete = callback;
  }

  /**
   * 계산기의 현재 숫자를 가져오는 콜백을 설정합니다.
   * @param callback - 계산기의 현재 숫자를 반환하는 콜백 함수
   */
  public setGetCurrentNumberCallback(callback: () => string): void {
    this.getCurrentNumberCallback = callback;
  }

  /**
   * 계산기의 현재 숫자를 설정하는 콜백을 등록합니다.
   * @param callback - 계산기의 현재 숫자를 설정하는 콜백 함수
   */
  public setSetCurrentNumberCallback(callback: (number: string) => void): void {
    this.setCurrentNumberCallback = callback;
  }

  /**
   * 계산기의 현재 숫자를 가져옵니다.
   * @returns {string} 계산기의 현재 숫자
   */
  public getCurrentNumber(): string {
    if (!this.getCurrentNumberCallback) {
      return '';
    }
    return this.getCurrentNumberCallback();
  }

  public setCurrentNumber(number: string): void {
    if (this.setCurrentNumberCallback) {
      this.setCurrentNumberCallback(number);
    }
  }

  /**
   * 계산기의 현재 숫자를 메모리에 저장합니다.
   */
  public save(): void {
    const currentNumber = this.getCurrentNumber();
    if (currentNumber) {
      this.number = currentNumber;
    }
  }

  /**
   * 메모리에서 숫자를 불러와 계산기의 현재 숫자로 설정합니다.
   * @returns {string} 메모리에 저장된 숫자
   * @throws {Error} 메모리가 비어있을 경우 에러 발생
   */
  public recall(): string {
    checkError(this.isEmpty, 'error.calc.no_memory');
    if (this.setCurrentNumberCallback) {
      this.setCurrentNumber(this.number);
      this.onOperationComplete?.();
    }
    return this.number;
  }

  /**
   * 메모리를 초기화하는 메서드
   */
  public clear(): void {
    checkError(this.isEmpty, 'error.calc.no_memory');
    this.number = '';
  }

  /**
   * 메모리에 저장된 숫자를 반환하는 메서드
   * @returns {string} 메모리에 저장된 숫자
   */
  public getNumber(): string {
    return this.number;
  }

  /**
   * 메모리 연산을 수행하는 private 메서드
   * @param operation - 수행할 연산 함수
   * @param number - 연산에 사용할 숫자
   */
  private performMemoryOperation(operation: (a: string, b: string) => string, number: string): void {
    checkError(this.isEmpty, 'error.calc.no_memory');
    this.number = operation(this.number, number);
    this.onOperationComplete?.();
  }

  /**
   * 계산기의 현재 숫자를 메모리에 더합니다.
   */
  public add(): void {
    const currentNumber = this.getCurrentNumber();
    if (currentNumber) {
      this.performMemoryOperation(this.math.add, currentNumber);
    }
  }

  /**
   * 메모리에서 숫자를 빼는 메서드
   */
  public sub(): void {
    const currentNumber = this.getCurrentNumber();
    if (currentNumber) {
      this.performMemoryOperation(this.math.sub, currentNumber);
    }
  }

  /**
   * 메모리의 숫자에 곱하는 메서드
   */
  public mul(): void {
    const currentNumber = this.getCurrentNumber();
    if (currentNumber) {
      this.performMemoryOperation(this.math.mul, currentNumber);
    }
  }

  /**
   * 메모리의 숫자를 나누는 메서드
   */
  public div(): void {
    const currentNumber = this.getCurrentNumber();
    if (currentNumber) {
      this.performMemoryOperation(this.math.div, currentNumber);
    }
  }
}
