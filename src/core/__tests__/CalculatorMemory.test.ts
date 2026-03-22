import { describe, it, expect, vi, beforeEach } from 'vitest';

// i18n 의존성 mock
vi.mock('src/i18n/initLocale', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

import { CalculatorMemory } from '../calculator/CalculatorMemory';

describe('CalculatorMemory', () => {
  let memory: CalculatorMemory;
  let currentNumber: string;

  beforeEach(() => {
    memory = new CalculatorMemory();
    currentNumber = '0';
    memory.setGetCurrentNumberCallback(() => currentNumber);
    memory.setSetCurrentNumberCallback((value: string) => {
      currentNumber = value;
    });
  });

  describe('isEmpty', () => {
    it('초기 상태에서 메모리는 비어있음', () => {
      expect(memory.isEmpty).toBe(true);
    });

    it('저장 후 메모리는 비어있지 않음', () => {
      currentNumber = '42';
      memory.save();
      expect(memory.isEmpty).toBe(false);
    });
  });

  describe('save', () => {
    it('현재 숫자를 메모리에 저장', () => {
      currentNumber = '123';
      memory.save();
      expect(memory.getNumber()).toBe('123');
    });

    it('빈 문자열일 때 저장하지 않음', () => {
      currentNumber = '';
      memory.save();
      expect(memory.isEmpty).toBe(true);
    });

    it('연속 저장 시 마지막 값으로 덮어쓰기', () => {
      currentNumber = '10';
      memory.save();
      currentNumber = '20';
      memory.save();
      expect(memory.getNumber()).toBe('20');
    });
  });

  describe('recall', () => {
    it('저장된 숫자를 불러오기', () => {
      currentNumber = '99';
      memory.save();
      const result = memory.recall();
      expect(result).toBe('99');
      expect(currentNumber).toBe('99');
    });

    it('메모리가 비어있을 때 recall하면 에러', () => {
      expect(() => memory.recall()).toThrow();
    });
  });

  describe('clear', () => {
    it('메모리를 초기화', () => {
      currentNumber = '50';
      memory.save();
      memory.clear();
      expect(memory.isEmpty).toBe(true);
    });

    it('메모리가 비어있을 때 clear하면 에러', () => {
      expect(() => memory.clear()).toThrow();
    });
  });

  describe('add', () => {
    it('메모리에 현재 숫자를 더하기', () => {
      currentNumber = '10';
      memory.save();
      currentNumber = '5';
      memory.add();
      expect(memory.getNumber()).toBe('15');
    });

    it('메모리가 비어있을 때 add하면 에러', () => {
      currentNumber = '5';
      expect(() => memory.add()).toThrow();
    });

    it('현재 숫자가 빈 문자열이면 아무것도 안 함', () => {
      currentNumber = '10';
      memory.save();
      currentNumber = '';
      memory.add(); // 아무것도 안 함
      expect(memory.getNumber()).toBe('10');
    });
  });

  describe('sub', () => {
    it('메모리에서 현재 숫자를 빼기', () => {
      currentNumber = '10';
      memory.save();
      currentNumber = '3';
      memory.sub();
      expect(memory.getNumber()).toBe('7');
    });

    it('메모리가 비어있을 때 sub하면 에러', () => {
      currentNumber = '5';
      expect(() => memory.sub()).toThrow();
    });
  });

  describe('mul', () => {
    it('메모리에 현재 숫자를 곱하기', () => {
      currentNumber = '6';
      memory.save();
      currentNumber = '7';
      memory.mul();
      expect(memory.getNumber()).toBe('42');
    });

    it('메모리가 비어있을 때 mul하면 에러', () => {
      currentNumber = '5';
      expect(() => memory.mul()).toThrow();
    });
  });

  describe('div', () => {
    it('메모리를 현재 숫자로 나누기', () => {
      currentNumber = '20';
      memory.save();
      currentNumber = '4';
      memory.div();
      expect(memory.getNumber()).toBe('5');
    });

    it('메모리가 비어있을 때 div하면 에러', () => {
      currentNumber = '5';
      expect(() => memory.div()).toThrow();
    });

    it('0으로 나누면 에러', () => {
      currentNumber = '10';
      memory.save();
      currentNumber = '0';
      expect(() => memory.div()).toThrow();
    });
  });

  describe('콜백 미설정', () => {
    it('getCurrentNumberCallback 미설정 시 빈 문자열 반환', () => {
      const mem = new CalculatorMemory();
      expect(mem.getCurrentNumber()).toBe('');
    });

    it('setCurrentNumberCallback 미설정 시 setCurrentNumber 호출해도 에러 없음', () => {
      const mem = new CalculatorMemory();
      expect(() => mem.setCurrentNumber('5')).not.toThrow();
    });
  });

  describe('onOperationComplete 콜백', () => {
    it('메모리 연산 완료 후 콜백이 호출됨', () => {
      const callback = vi.fn();
      memory.setOperationCompleteCallback(callback);
      currentNumber = '10';
      memory.save();
      currentNumber = '5';
      memory.add();
      expect(callback).toHaveBeenCalled();
    });
  });
});
