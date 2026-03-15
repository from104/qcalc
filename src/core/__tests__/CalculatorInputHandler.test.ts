import { describe, it, expect, vi, beforeEach } from 'vitest';

// i18n 의존성 mock
vi.mock('src/i18n/initLocale', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

import { CalculatorInputHandler } from '../calculator/CalculatorInputHandler';
import { CalculatorState } from '../calculator/CalculatorState';
import { CalculatorRadixConverter } from '../calculator/CalculatorRadixConverter';
import { Radix } from '../converters/RadixConverter';

describe('CalculatorInputHandler', () => {
  let state: CalculatorState;
  let radixConverter: CalculatorRadixConverter;
  let handler: CalculatorInputHandler;

  beforeEach(() => {
    state = new CalculatorState();
    radixConverter = new CalculatorRadixConverter();
    handler = new CalculatorInputHandler(state, radixConverter);
  });

  describe('addDigit', () => {
    it('숫자를 입력 버퍼에 추가', () => {
      handler.addDigit(5);
      expect(state.inputBuffer).toBe('5');
      expect(state.currentNumber).toBe('5');
    });

    it('문자열 숫자 입력', () => {
      handler.addDigit('7');
      expect(state.inputBuffer).toBe('7');
    });

    it('연속 숫자 입력', () => {
      handler.addDigit(1);
      handler.addDigit(2);
      handler.addDigit(3);
      expect(state.inputBuffer).toBe('123');
      expect(state.currentNumber).toBe('123');
    });

    it('초기 0일 때 숫자 입력 시 0 대체', () => {
      expect(state.inputBuffer).toBe('0');
      handler.addDigit(5);
      expect(state.inputBuffer).toBe('5');
    });

    it('bufferReset이 true일 때 입력하면 새로운 숫자로 시작', () => {
      handler.addDigit(1);
      handler.addDigit(2);
      state.onBufferReset();
      handler.addDigit(9);
      expect(state.inputBuffer).toBe('9');
      expect(state.bufferReset).toBe(false);
    });

    it('16진수 모드에서 A-F 입력', () => {
      state.currentRadix = Radix.Hexadecimal;
      handler.addDigit('A');
      expect(state.inputBuffer).toBe('A');
    });

    it('2진수 모드에서 잘못된 숫자 입력 시 에러', () => {
      state.currentRadix = Radix.Binary;
      expect(() => handler.addDigit(5)).toThrow();
    });
  });

  describe('addDot', () => {
    it('소수점 추가', () => {
      handler.addDigit(3);
      handler.addDot();
      expect(state.inputBuffer).toBe('3.');
    });

    it('이미 소수점이 있으면 추가하지 않음', () => {
      handler.addDigit(3);
      handler.addDot();
      handler.addDot();
      expect(state.inputBuffer).toBe('3.');
    });

    it('bufferReset 상태에서 소수점 입력 시 0.으로 시작', () => {
      state.onBufferReset();
      handler.addDot();
      expect(state.inputBuffer).toBe('0.');
      expect(state.bufferReset).toBe(false);
    });

    it('소수점 뒤에 숫자 입력', () => {
      handler.addDigit(1);
      handler.addDot();
      handler.addDigit(5);
      expect(state.inputBuffer).toBe('1.5');
      expect(state.currentNumber).toBe('1.5');
    });
  });

  describe('deleteDigitOrDot', () => {
    it('마지막 숫자 삭제', () => {
      handler.addDigit(1);
      handler.addDigit(2);
      handler.addDigit(3);
      handler.deleteDigitOrDot();
      expect(state.inputBuffer).toBe('12');
    });

    it('한 자리 숫자 삭제 시 0으로 변환', () => {
      handler.addDigit(5);
      handler.deleteDigitOrDot();
      expect(state.inputBuffer).toBe('0');
    });

    it('소수점 삭제', () => {
      handler.addDigit(1);
      handler.addDot();
      handler.deleteDigitOrDot();
      expect(state.inputBuffer).toBe('1');
    });

    it('음수 한 자리 숫자 삭제 시 0으로 변환', () => {
      handler.addDigit(5);
      handler.changeSign();
      handler.deleteDigitOrDot();
      expect(state.inputBuffer).toBe('0');
    });

    it('-0 입력 시 0으로 변환', () => {
      state.inputBuffer = '-0';
      handler.deleteDigitOrDot();
      expect(state.inputBuffer).toBe('0');
    });
  });

  describe('changeSign', () => {
    it('양수를 음수로 변환', () => {
      handler.addDigit(5);
      handler.changeSign();
      expect(state.inputBuffer).toBe('-5');
      expect(state.currentNumber).toBe('-5');
    });

    it('음수를 양수로 변환', () => {
      handler.addDigit(5);
      handler.changeSign();
      handler.changeSign();
      expect(state.inputBuffer).toBe('5');
    });

    it('0일 때 부호 변경 안 함', () => {
      handler.changeSign();
      expect(state.inputBuffer).toBe('0');
    });
  });

  describe('pasteToBuffer', () => {
    it('유효한 숫자 텍스트 붙여넣기', () => {
      handler.pasteToBuffer('123.45');
      expect(state.inputBuffer).toBe('123.45');
      expect(state.currentNumber).toBe('123.45');
    });

    it('비유효 문자가 포함된 텍스트 붙여넣기 시 필터링', () => {
      handler.pasteToBuffer('abc123def');
      expect(state.inputBuffer).toBe('123');
    });

    it('붙여넣기 후 bufferReset 비활성화', () => {
      state.onBufferReset();
      handler.pasteToBuffer('99');
      expect(state.bufferReset).toBe(false);
    });
  });

  describe('setInputBuffer', () => {
    it('입력 버퍼 직접 설정', () => {
      handler.setInputBuffer('456');
      expect(state.inputBuffer).toBe('456');
      expect(state.currentNumber).toBe('456');
    });

    it('잘못된 문자 필터링', () => {
      handler.setInputBuffer('12abc34');
      expect(state.inputBuffer).toBe('1234');
    });
  });

  describe('refreshBuffer', () => {
    it('버퍼 새로고침 (값 유지)', () => {
      handler.addDigit(7);
      handler.addDigit(8);
      handler.refreshBuffer();
      expect(state.inputBuffer).toBe('78');
      expect(state.currentNumber).toBe('78');
    });
  });
});
