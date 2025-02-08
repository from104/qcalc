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
   * 메모리에 숫자를 저장하는 메서드
   * @param number - 저장할 숫자 (문자열)
   */
  public save(number: string): void {
    this.number = number;
  }

  /**
   * 메모리에서 숫자를 불러오는 메서드
   * @returns {string} 메모리에 저장된 숫자
   * @throws {Error} 메모리가 비어있을 경우 에러 발생
   */
  public recall(): string {
    checkError(this.isEmpty, 'Memory is empty');
    return this.number;
  }

  /**
   * 메모리를 초기화하는 메서드
   */
  public clear(): void {
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
    if (!this.isEmpty) {
      this.number = operation(this.number, number);
      this.onOperationComplete?.();
    }
  }

  /**
   * 메모리에 숫자를 더하는 메서드
   * @param number - 더할 숫자
   */
  public add(number: string): void {
    this.performMemoryOperation(this.math.add, number);
  }

  /**
   * 메모리에서 숫자를 빼는 메서드
   * @param number - 뺄 숫자
   */
  public sub(number: string): void {
    this.performMemoryOperation(this.math.sub, number);
  }

  /**
   * 메모리의 숫자에 곱하는 메서드
   * @param number - 곱할 숫자
   */
  public mul(number: string): void {
    this.performMemoryOperation(this.math.mul, number);
  }

  /**
   * 메모리의 숫자를 나누는 메서드
   * @param number - 나눌 숫자
   */
  public div(number: string): void {
    this.performMemoryOperation(this.math.div, number);
  }
}
