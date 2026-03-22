import { describe, it, expect, vi, beforeEach } from 'vitest';

// i18n 의존성 mock
vi.mock('src/i18n/initLocale', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

import { CalculatorOperationHandler } from '../calculator/CalculatorOperationHandler';
import { CalculatorState } from '../calculator/CalculatorState';
import { CalculatorRecord } from '../calculator/CalculatorRecord';
import { CalculatorMath } from '../calculator/CalculatorMath';
import { Operator } from '../calculator/Calculator';

describe('CalculatorOperationHandler', () => {
  let state: CalculatorState;
  let record: CalculatorRecord;
  let math: CalculatorMath;
  let handler: CalculatorOperationHandler;

  beforeEach(() => {
    state = new CalculatorState();
    record = new CalculatorRecord();
    math = new CalculatorMath();
    handler = new CalculatorOperationHandler(state, record, math);
  });

  describe('performBinaryOperationCalculation', () => {
    it('덧셈', () => {
      state.previousNumber = '10';
      state.currentOperator = Operator.ADD;
      expect(handler.performBinaryOperationCalculation('5')).toBe('15');
    });

    it('뺄셈', () => {
      state.previousNumber = '10';
      state.currentOperator = Operator.SUB;
      expect(handler.performBinaryOperationCalculation('3')).toBe('7');
    });

    it('곱셈', () => {
      state.previousNumber = '6';
      state.currentOperator = Operator.MUL;
      expect(handler.performBinaryOperationCalculation('7')).toBe('42');
    });

    it('나눗셈', () => {
      state.previousNumber = '20';
      state.currentOperator = Operator.DIV;
      expect(handler.performBinaryOperationCalculation('4')).toBe('5');
    });

    it('나머지', () => {
      state.previousNumber = '10';
      state.currentOperator = Operator.MOD;
      expect(handler.performBinaryOperationCalculation('3')).toBe('1');
    });

    it('거듭제곱', () => {
      state.previousNumber = '2';
      state.currentOperator = Operator.POW;
      expect(handler.performBinaryOperationCalculation('10')).toBe('1024');
    });

    it('제곱근', () => {
      state.previousNumber = '27';
      state.currentOperator = Operator.ROOT;
      expect(handler.performBinaryOperationCalculation('3')).toBe('3');
    });

    it('0으로 나누면 에러', () => {
      state.previousNumber = '10';
      state.currentOperator = Operator.DIV;
      expect(() => handler.performBinaryOperationCalculation('0')).toThrow();
    });

    it('NONE 연산자는 previousNumber 반환', () => {
      state.previousNumber = '42';
      state.currentOperator = Operator.NONE;
      expect(handler.performBinaryOperationCalculation('5')).toBe('42');
    });
  });

  describe('performBinaryOperation', () => {
    it('첫 번째 이항 연산 설정 (NONE 상태)', () => {
      state.currentNumber = '10';
      handler.performBinaryOperation(Operator.ADD);
      expect(state.currentOperator).toBe(Operator.ADD);
      expect(state.previousNumber).toBe('10');
      expect(state.bufferReset).toBe(true);
    });

    it('연속 이항 연산 시 이전 결과 계산', () => {
      state.currentNumber = '10';
      handler.performBinaryOperation(Operator.ADD);
      state.currentNumber = '5';
      state.offBufferReset();
      handler.performBinaryOperation(Operator.MUL);

      expect(state.currentOperator).toBe(Operator.MUL);
      expect(state.previousNumber).toBe('15');
      expect(state.currentNumber).toBe('15');
    });
  });

  describe('equal', () => {
    it('연산자가 NONE일 때 현재 숫자를 이전 숫자로 설정', () => {
      state.currentNumber = '42';
      handler.equal();
      expect(state.previousNumber).toBe('42');
    });

    it('덧셈 후 등호: 결과 계산', () => {
      state.currentNumber = '10';
      handler.performBinaryOperation(Operator.ADD);
      state.currentNumber = '5';
      state.offBufferReset();
      handler.equal();

      expect(state.currentNumber).toBe('15');
      expect(state.currentOperator).toBe(Operator.NONE);
      expect(state.bufferReset).toBe(true);
    });

    it('곱셈 후 등호', () => {
      state.currentNumber = '6';
      handler.performBinaryOperation(Operator.MUL);
      state.currentNumber = '7';
      state.offBufferReset();
      handler.equal();

      expect(state.currentNumber).toBe('42');
    });

    it('등호 후 기록에 추가됨', () => {
      state.currentNumber = '3';
      handler.performBinaryOperation(Operator.ADD);
      state.currentNumber = '4';
      state.offBufferReset();
      handler.equal();

      expect(record.getCount()).toBe(1);
      const allRecords = record.getAllRecords();
      expect(allRecords[0]!.calculationResult.resultNumber).toBe('7');
    });
  });

  describe('executeUnary', () => {
    it('역수 (REC)', () => {
      state.currentNumber = '4';
      handler.executeUnary(Operator.REC);
      expect(state.currentNumber).toBe('0.25');
    });

    it('0의 역수는 에러', () => {
      state.currentNumber = '0';
      expect(() => handler.executeUnary(Operator.REC)).toThrow();
    });

    it('제곱근 (SQRT)', () => {
      state.currentNumber = '16';
      handler.executeUnary(Operator.SQRT);
      expect(state.currentNumber).toBe('4');
    });

    it('음수의 제곱근은 에러', () => {
      state.currentNumber = '-4';
      expect(() => handler.executeUnary(Operator.SQRT)).toThrow();
    });

    it('제곱 (POW2)', () => {
      state.currentNumber = '5';
      handler.executeUnary(Operator.POW2);
      expect(state.currentNumber).toBe('25');
    });

    it('팩토리얼 (FCT)', () => {
      state.currentNumber = '5';
      handler.executeUnary(Operator.FCT);
      expect(state.currentNumber).toBe('120');
    });

    it('음수의 팩토리얼은 에러', () => {
      state.currentNumber = '-3';
      expect(() => handler.executeUnary(Operator.FCT)).toThrow();
    });

    it('10의 거듭제곱 (EXP10)', () => {
      state.currentNumber = '3';
      handler.executeUnary(Operator.EXP10);
      expect(state.currentNumber).toBe('1000');
    });

    it('정수 부분 (INT)', () => {
      state.currentNumber = '3.7';
      handler.executeUnary(Operator.INT);
      expect(state.currentNumber).toBe('3');
    });

    it('소수 부분 (FRAC)', () => {
      state.currentNumber = '3.75';
      handler.executeUnary(Operator.FRAC);
      expect(state.currentNumber).toBe('0.75');
    });

    it('단항 연산 후 기록에 추가됨', () => {
      state.currentNumber = '25';
      handler.executeUnary(Operator.SQRT);
      expect(record.getCount()).toBe(1);
    });

    it('단항 연산 후 bufferReset 활성화', () => {
      state.currentNumber = '5';
      handler.executeUnary(Operator.POW2);
      expect(state.bufferReset).toBe(true);
    });
  });

  describe('executeWithNumber', () => {
    it('숫자를 직접 사용하는 이항 연산', () => {
      state.currentNumber = '10';
      handler.executeWithNumber(Operator.MUL, 3);
      expect(state.currentNumber).toBe('30');
    });
  });

  describe('percent', () => {
    it('나눗셈 + 퍼센트: 비율 계산', () => {
      state.currentNumber = '50';
      handler.performBinaryOperation(Operator.DIV);
      state.currentNumber = '200';
      state.offBufferReset();
      handler.percent();

      expect(state.currentNumber).toBe('25');
    });

    it('곱셈 + 퍼센트: 퍼센트 계산', () => {
      state.currentNumber = '200';
      handler.performBinaryOperation(Operator.MUL);
      state.currentNumber = '10';
      state.offBufferReset();
      handler.percent();

      expect(state.currentNumber).toBe('20');
    });

    it('덧셈 + 퍼센트는 아무것도 안 함', () => {
      state.currentNumber = '100';
      handler.performBinaryOperation(Operator.ADD);
      state.currentNumber = '10';
      state.offBufferReset();
      handler.percent();

      // 덧셈이므로 퍼센트 연산 미수행, 상태 유지
      expect(state.currentOperator).toBe(Operator.ADD);
    });
  });

  describe('연쇄 연산', () => {
    it('1 + 2 + 3 = 6', () => {
      state.currentNumber = '1';
      handler.performBinaryOperation(Operator.ADD);
      state.currentNumber = '2';
      state.offBufferReset();
      handler.performBinaryOperation(Operator.ADD);
      state.currentNumber = '3';
      state.offBufferReset();
      handler.equal();

      expect(state.currentNumber).toBe('6');
    });

    it('2 * 3 + 4 = 10', () => {
      state.currentNumber = '2';
      handler.performBinaryOperation(Operator.MUL);
      state.currentNumber = '3';
      state.offBufferReset();
      handler.performBinaryOperation(Operator.ADD);
      state.currentNumber = '4';
      state.offBufferReset();
      handler.equal();

      expect(state.currentNumber).toBe('10');
    });
  });
});
