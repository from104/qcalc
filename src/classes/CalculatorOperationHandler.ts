/**
 * @file CalculatorOperationHandler.ts
 * @description 계산기의 연산 처리를 담당하는 클래스입니다.
 *              단항 연산, 이항 연산, 특수 연산 등의 계산 로직을 처리합니다.
 */

import { match } from 'ts-pattern';

import { Operator } from './Calculator';
import type { CalculatorMath } from './CalculatorMath';
import { toBigNumber } from './CalculatorMath';
import { checkError } from '../utils/ErrorUtils';
import type { CalculatorState } from './CalculatorState';
import type { CalculatorRecord } from './CalculatorRecord';

/**
 * 계산기의 연산 처리를 담당하는 클래스
 * @class CalculatorOperationHandler
 */
export class CalculatorOperationHandler {
  private state: CalculatorState;
  private record: CalculatorRecord;
  private math: CalculatorMath;

  constructor(state: CalculatorState, record: CalculatorRecord, math: CalculatorMath) {
    this.state = state;
    this.record = record;
    this.math = math;
  }

  /**
   * 이항 연산 계산을 수행합니다.
   * @param numberForCalc - 계산에 사용할 숫자
   * @returns 계산 결과 문자열
   */
  public performBinaryOperationCalculation(numberForCalc: string): string {
    const prevValue = this.state.previousNumber;
    const currentValue = numberForCalc;

    return match(this.state.currentOperator)
      .with(Operator.ADD, () => this.math.add(prevValue, currentValue))
      .with(Operator.SUB, () => this.math.sub(prevValue, currentValue))
      .with(Operator.MUL, () => this.math.mul(prevValue, currentValue))
      .with(Operator.DIV, () => this.math.div(prevValue, currentValue))
      .with(Operator.MOD, () => this.math.mod(prevValue, currentValue))
      .with(Operator.POW, () => this.math.pow(prevValue, currentValue))
      .with(Operator.ROOT, () => this.math.root(prevValue, currentValue))
      .with(Operator.BIT_SFT_L, () => this.math.bitwiseLeftShift(prevValue, currentValue, this.state.wordSize))
      .with(Operator.BIT_SFT_R, () => this.math.bitwiseRightShift(prevValue, currentValue, this.state.wordSize))
      .with(Operator.BIT_AND, () => this.math.bitwiseAnd(prevValue, currentValue, this.state.wordSize))
      .with(Operator.BIT_OR, () => this.math.bitwiseOr(prevValue, currentValue, this.state.wordSize))
      .with(Operator.BIT_XOR, () => this.math.bitwiseXor(prevValue, currentValue, this.state.wordSize))
      .with(Operator.BIT_NAND, () => this.math.bitwiseNand(prevValue, currentValue, this.state.wordSize))
      .with(Operator.BIT_NOR, () => this.math.bitwiseNor(prevValue, currentValue, this.state.wordSize))
      .with(Operator.BIT_XNOR, () => this.math.bitwiseXnor(prevValue, currentValue, this.state.wordSize))
      .otherwise(() => this.state.previousNumber);
  }

  /**
   * 이항 연산 전 계산을 수행합니다.
   */
  public performPreCalculation(): void {
    const numberForCalc = this.state.bufferReset ? this.state.repeatedNumber : this.state.currentNumber;

    if (this.state.bufferReset && numberForCalc === '0') {
      return;
    }

    if (!this.state.bufferReset) {
      this.state.repeatedNumber = numberForCalc;
    }

    const result = this.performBinaryOperationCalculation(numberForCalc);
    const calculationResult = {
      previousNumber: this.state.previousNumber.toString(),
      operator: this.state.currentOperator,
      argumentNumber: numberForCalc.toString(),
      resultNumber: result.toString(),
    };
    this.state.calculationSnapshot = calculationResult;
    this.record.addRecord(calculationResult);
    this.state.previousNumber = calculationResult.resultNumber;
  }

  /**
   * 단항 연산을 수행합니다.
   * @param operator - 연산자
   * @param calculation - 계산 함수
   */
  public performUnaryOperation(operator: Operator, calculation: () => string): void {
    this.state.currentNumber = this.calculateAndAddRecord(this.state.currentNumber, operator, calculation);
    this.state.resetInputState();
  }

  /**
   * 계산을 수행하고 기록에 추가합니다.
   * @param number - 계산에 사용할 숫자
   * @param operator - 연산자
   * @param calculation - 계산 함수
   * @returns 결과 숫자 문자열
   */
  private calculateAndAddRecord(number: string, operator: Operator, calculation: () => string): string {
    const calculationResult = {
      previousNumber: number,
      operator: operator,
      resultNumber: calculation(),
    };
    this.state.calculationSnapshot = calculationResult;
    this.record.addRecord(calculationResult);
    return calculationResult.resultNumber;
  }

  /**
   * 이항 연산을 설정합니다.
   * @param operator - 설정할 연산자
   */
  public performBinaryOperation(operator: Operator): void {
    if (this.state.currentOperator === Operator.NONE) {
      this.state.setPreviousNumberFromCurrent();
    } else {
      this.performPreCalculation();
      this.state.setCurrentNumberFromPrevious();
    }
    this.state.currentOperator = operator;
    this.state.onBufferReset();
  }

  /**
   * 숫자를 직접 사용하는 이항 연산을 실행합니다.
   * @param operator - 연산자
   * @param n - 사용할 숫자
   */
  public executeWithNumber(operator: Operator, n: number): void {
    // 연산자 설정 및 이전 숫자 설정
    this.performBinaryOperation(operator);

    // 현재 숫자를 n으로 설정하고 반복 숫자로도 설정
    this.state.currentNumber = n.toString();
    this.state.repeatedNumber = n.toString();

    // 계산 수행 및 결과 설정 (equal 메서드 활용)
    this.equal();
  }

  /**
   * 등호(=) 버튼을 눌렀을 때의 처리를 수행합니다.
   */
  public equal(): void {
    if (this.state.currentOperator === Operator.NONE) {
      this.state.setPreviousNumberFromCurrent();
    } else {
      this.performPreCalculation();
      this.state.setCurrentNumberFromPrevious();
      this.state.currentOperator = Operator.NONE;
      this.state.onBufferReset();
      this.state.repeatedNumber = '0';
    }
  }

  /**
   * 퍼센트(%) 연산을 처리합니다.
   */
  public percent(): void {
    if (this.state.currentOperator === Operator.DIV || this.state.currentOperator === Operator.MUL) {
      this.performPreCalculation();
      const { previousNumber, argumentNumber } = this.state.calculationSnapshot;
      this.record.removeFirst();
      this.state.calculationSnapshot = {
        previousNumber: '',
        operator: Operator.NONE,
        argumentNumber: '',
        resultNumber: '',
      };

      const operator = [Operator.PCT, this.state.currentOperator];
      const resultNumber =
        this.state.currentOperator === Operator.DIV
          ? toBigNumber(this.state.previousNumber).mul(100).toString()
          : toBigNumber(this.state.previousNumber).div(100).toString();

      const calculationResult = {
        previousNumber,
        operator,
        argumentNumber: argumentNumber ?? '',
        resultNumber,
      };
      this.state.calculationSnapshot = calculationResult;
      this.record.addRecord(calculationResult);
      this.state.previousNumber = calculationResult.resultNumber;
      this.state.setCurrentNumberFromPrevious();
      this.state.resetOperatorState();
    }
  }

  /**
   * 단항 연산을 연산자로 디스패치합니다.
   * @param operator - 단항 연산자
   */
  public executeUnary(operator: Operator): void {
    match(operator)
      .with(Operator.REC, () => {
        checkError(toBigNumber(this.state.currentNumber).eq(0), 'error.divide_by_zero');
        this.performUnaryOperation(Operator.REC, () => this.math.div('1', this.state.currentNumber));
      })
      .with(Operator.SQRT, () => {
        checkError(toBigNumber(this.state.currentNumber).lt(0), 'error.math.negative_root');
        this.performUnaryOperation(Operator.SQRT, () => this.math.root(this.state.currentNumber, '2'));
      })
      .with(Operator.POW2, () => {
        this.performUnaryOperation(Operator.POW2, () => this.math.pow(this.state.currentNumber, '2'));
      })
      .with(Operator.FCT, () => {
        checkError(toBigNumber(this.state.currentNumber).lt(0), 'error.math.negative_factorial');
        this.performUnaryOperation(Operator.FCT, () => this.math.fact(this.state.currentNumber));
      })
      .with(Operator.EXP10, () => {
        this.performUnaryOperation(Operator.EXP10, () => this.math.exp10(this.state.currentNumber));
      })
      .with(Operator.INT, () => {
        this.performUnaryOperation(Operator.INT, () => this.math.int(this.state.currentNumber));
      })
      .with(Operator.FRAC, () => {
        this.performUnaryOperation(Operator.FRAC, () => this.math.frac(this.state.currentNumber));
      })
      .with(Operator.SIN, () => {
        this.performUnaryOperation(Operator.SIN, () => this.math.sin(this.state.currentNumber));
      })
      .with(Operator.COS, () => {
        this.performUnaryOperation(Operator.COS, () => this.math.cos(this.state.currentNumber));
      })
      .with(Operator.TAN, () => {
        this.performUnaryOperation(Operator.TAN, () => this.math.tan(this.state.currentNumber));
      })
      .with(Operator.BIT_NOT, () => {
        this.performUnaryOperation(Operator.BIT_NOT, () =>
          this.math.bitwiseNot(this.state.currentNumber, this.state.wordSize),
        );
      })
      .otherwise(() => {});
  }
}
