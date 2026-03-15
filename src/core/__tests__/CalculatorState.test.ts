import { describe, it, expect, vi, beforeEach } from 'vitest';

// i18n 의존성 mock
vi.mock('src/i18n/initLocale', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

import { CalculatorState } from '../calculator/CalculatorState';
import { Operator } from '../calculator/Calculator';
import { Radix } from '../converters/RadixConverter';

describe('CalculatorState', () => {
  let state: CalculatorState;

  beforeEach(() => {
    state = new CalculatorState();
  });

  describe('초기 상태', () => {
    it('currentNumber 초기값은 0', () => {
      expect(state.currentNumber).toBe('0');
    });

    it('previousNumber 초기값은 0', () => {
      expect(state.previousNumber).toBe('0');
    });

    it('repeatedNumber 초기값은 0', () => {
      expect(state.repeatedNumber).toBe('0');
    });

    it('currentOperator 초기값은 NONE', () => {
      expect(state.currentOperator).toBe(Operator.NONE);
    });

    it('bufferReset 초기값은 false', () => {
      expect(state.bufferReset).toBe(false);
    });

    it('inputBuffer 초기값은 0', () => {
      expect(state.inputBuffer).toBe('0');
    });

    it('currentRadix 초기값은 Decimal', () => {
      expect(state.currentRadix).toBe(Radix.Decimal);
    });

    it('wordSize 초기값은 8', () => {
      expect(state.wordSize).toBe(8);
    });

    it('calculationSnapshot 초기값', () => {
      expect(state.calculationSnapshot).toEqual({
        previousNumber: '',
        operator: Operator.NONE,
        argumentNumber: '',
        resultNumber: '',
      });
    });
  });

  describe('게터/세터', () => {
    it('currentNumber 설정 및 조회', () => {
      state.currentNumber = '42';
      expect(state.currentNumber).toBe('42');
    });

    it('previousNumber 설정 및 조회', () => {
      state.previousNumber = '100';
      expect(state.previousNumber).toBe('100');
    });

    it('repeatedNumber 설정 및 조회', () => {
      state.repeatedNumber = '7';
      expect(state.repeatedNumber).toBe('7');
    });

    it('currentOperator 설정 및 조회', () => {
      state.currentOperator = Operator.ADD;
      expect(state.currentOperator).toBe(Operator.ADD);
    });

    it('bufferReset 설정 및 조회', () => {
      state.bufferReset = true;
      expect(state.bufferReset).toBe(true);
    });

    it('inputBuffer 설정 및 조회', () => {
      state.inputBuffer = '123';
      expect(state.inputBuffer).toBe('123');
    });

    it('currentRadix 설정 및 조회', () => {
      state.currentRadix = Radix.Binary;
      expect(state.currentRadix).toBe(Radix.Binary);
    });

    it('wordSize 설정 및 조회', () => {
      state.wordSize = 16;
      expect(state.wordSize).toBe(16);
    });

    it('calculationSnapshot 설정 및 조회', () => {
      const snapshot = {
        previousNumber: '10',
        operator: Operator.ADD,
        argumentNumber: '5',
        resultNumber: '15',
      };
      state.calculationSnapshot = snapshot;
      expect(state.calculationSnapshot).toEqual(snapshot);
    });
  });

  describe('reset', () => {
    it('모든 상태를 초기값으로 재설정', () => {
      state.currentNumber = '42';
      state.previousNumber = '100';
      state.repeatedNumber = '7';
      state.currentOperator = Operator.ADD;
      state.bufferReset = true;
      state.inputBuffer = '123';

      state.reset();

      expect(state.currentNumber).toBe('0');
      expect(state.previousNumber).toBe('0');
      expect(state.repeatedNumber).toBe('0');
      expect(state.currentOperator).toBe(Operator.NONE);
      expect(state.bufferReset).toBe(false);
      expect(state.inputBuffer).toBe('0');
    });

    it('reset 후 calculationSnapshot도 초기화', () => {
      state.calculationSnapshot = {
        previousNumber: '10',
        operator: Operator.ADD,
        argumentNumber: '5',
        resultNumber: '15',
      };
      state.reset();
      expect(state.calculationSnapshot).toEqual({
        previousNumber: '',
        operator: Operator.NONE,
        argumentNumber: '',
        resultNumber: '',
      });
    });
  });

  describe('onBufferReset / offBufferReset', () => {
    it('onBufferReset으로 bufferReset 활성화', () => {
      state.onBufferReset();
      expect(state.bufferReset).toBe(true);
    });

    it('offBufferReset으로 bufferReset 비활성화', () => {
      state.onBufferReset();
      state.offBufferReset();
      expect(state.bufferReset).toBe(false);
    });
  });

  describe('setCurrentNumberFromPrevious', () => {
    it('이전 숫자를 현재 숫자로 설정', () => {
      state.previousNumber = '99';
      state.setCurrentNumberFromPrevious();
      expect(state.currentNumber).toBe('99');
    });
  });

  describe('setPreviousNumberFromCurrent', () => {
    it('현재 숫자를 이전 숫자로 설정', () => {
      state.currentNumber = '77';
      state.setPreviousNumberFromCurrent();
      expect(state.previousNumber).toBe('77');
    });
  });

  describe('resetOperatorState', () => {
    it('연산자 상태를 초기화', () => {
      state.currentOperator = Operator.MUL;
      state.repeatedNumber = '5';
      state.resetOperatorState();
      expect(state.currentOperator).toBe(Operator.NONE);
      expect(state.repeatedNumber).toBe('0');
      expect(state.bufferReset).toBe(true);
    });
  });

  describe('resetInputState', () => {
    it('입력 상태를 초기화', () => {
      state.repeatedNumber = '5';
      state.resetInputState();
      expect(state.repeatedNumber).toBe('0');
      expect(state.bufferReset).toBe(true);
    });
  });
});
