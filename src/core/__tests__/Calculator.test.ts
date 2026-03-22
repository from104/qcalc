import { describe, it, expect, vi, beforeEach } from 'vitest';

// i18n 의존성 mock
vi.mock('src/i18n/initLocale', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

import { Calculator, Operator } from '../calculator/Calculator';
import { Radix } from '../converters/RadixConverter';

describe('Calculator (통합 테스트)', () => {
  let calc: Calculator;

  beforeEach(() => {
    calc = new Calculator();
  });

  describe('초기 상태', () => {
    it('현재 숫자는 0', () => {
      expect(calc.currentNumber).toBe('0');
    });

    it('입력 버퍼는 0', () => {
      expect(calc.inputBuffer).toBe('0');
    });

    it('현재 진법은 Decimal', () => {
      expect(calc.currentRadix).toBe(Radix.Decimal);
    });

    it('연산자는 NONE', () => {
      expect(calc.getCurrentOperator()).toBe(Operator.NONE);
    });

    it('메모리는 비어있음', () => {
      expect(calc.memory.isEmpty).toBe(true);
    });

    it('기록은 비어있음', () => {
      expect(calc.record.getCount()).toBe(0);
    });
  });

  describe('숫자 입력', () => {
    it('숫자 입력: 1, 2, 3 → 123', () => {
      calc.addDigit(1);
      calc.addDigit(2);
      calc.addDigit(3);
      expect(calc.currentNumber).toBe('123');
      expect(calc.inputBuffer).toBe('123');
    });

    it('소수점 입력: 3.14', () => {
      calc.addDigit(3);
      calc.addDot();
      calc.addDigit(1);
      calc.addDigit(4);
      expect(calc.currentNumber).toBe('3.14');
    });

    it('부호 변경', () => {
      calc.addDigit(5);
      calc.changeSign();
      expect(calc.currentNumber).toBe('-5');
    });

    it('백스페이스', () => {
      calc.addDigit(1);
      calc.addDigit(2);
      calc.addDigit(3);
      calc.deleteDigitOrDot();
      expect(calc.currentNumber).toBe('12');
    });
  });

  describe('기본 사칙연산', () => {
    it('3 + 4 = 7', () => {
      calc.addDigit(3);
      calc.executeBinary(Operator.ADD);
      calc.addDigit(4);
      calc.equal();
      expect(calc.currentNumber).toBe('7');
    });

    it('10 - 3 = 7', () => {
      calc.addDigit(1);
      calc.addDigit(0);
      calc.executeBinary(Operator.SUB);
      calc.addDigit(3);
      calc.equal();
      expect(calc.currentNumber).toBe('7');
    });

    it('6 × 7 = 42', () => {
      calc.addDigit(6);
      calc.executeBinary(Operator.MUL);
      calc.addDigit(7);
      calc.equal();
      expect(calc.currentNumber).toBe('42');
    });

    it('20 ÷ 4 = 5', () => {
      calc.addDigit(2);
      calc.addDigit(0);
      calc.executeBinary(Operator.DIV);
      calc.addDigit(4);
      calc.equal();
      expect(calc.currentNumber).toBe('5');
    });

    it('0으로 나누기 에러', () => {
      calc.addDigit(5);
      calc.executeBinary(Operator.DIV);
      calc.addDigit(0);
      expect(() => calc.equal()).toThrow();
    });
  });

  describe('연쇄 연산', () => {
    it('1 + 2 + 3 = 6', () => {
      calc.addDigit(1);
      calc.executeBinary(Operator.ADD);
      calc.addDigit(2);
      calc.executeBinary(Operator.ADD);
      calc.addDigit(3);
      calc.equal();
      expect(calc.currentNumber).toBe('6');
    });

    it('2 × 3 - 1 = 5', () => {
      calc.addDigit(2);
      calc.executeBinary(Operator.MUL);
      calc.addDigit(3);
      calc.executeBinary(Operator.SUB);
      calc.addDigit(1);
      calc.equal();
      expect(calc.currentNumber).toBe('5');
    });
  });

  describe('단항 연산', () => {
    it('제곱: 5² = 25', () => {
      calc.addDigit(5);
      calc.executeUnary(Operator.POW2);
      expect(calc.currentNumber).toBe('25');
    });

    it('제곱근: √16 = 4', () => {
      calc.addDigit(1);
      calc.addDigit(6);
      calc.executeUnary(Operator.SQRT);
      expect(calc.currentNumber).toBe('4');
    });

    it('역수: 1/4 = 0.25', () => {
      calc.addDigit(4);
      calc.executeUnary(Operator.REC);
      expect(calc.currentNumber).toBe('0.25');
    });
  });

  describe('메모리 연산', () => {
    it('메모리 저장 및 불러오기', () => {
      calc.addDigit(4);
      calc.addDigit(2);
      calc.memory.save();
      expect(calc.memory.isEmpty).toBe(false);

      calc.reset();
      expect(calc.currentNumber).toBe('0');

      calc.memory.recall();
      expect(calc.currentNumber).toBe('42');
    });

    it('메모리 더하기', () => {
      calc.addDigit(1);
      calc.addDigit(0);
      calc.memory.save();

      calc.reset();
      calc.addDigit(5);
      calc.memory.add();
      expect(calc.memory.getNumber()).toBe('15');
    });

    it('메모리 초기화', () => {
      calc.addDigit(5);
      calc.memory.save();
      calc.memory.clear();
      expect(calc.memory.isEmpty).toBe(true);
    });
  });

  describe('기록 관리', () => {
    it('계산 후 기록이 생성됨', () => {
      calc.addDigit(3);
      calc.executeBinary(Operator.ADD);
      calc.addDigit(4);
      calc.equal();
      expect(calc.record.getCount()).toBe(1);
    });

    it('여러 계산 후 기록 수 확인', () => {
      // 3 + 4 = 7
      calc.addDigit(3);
      calc.executeBinary(Operator.ADD);
      calc.addDigit(4);
      calc.equal();

      // 5 × 6 = 30
      calc.reset();
      calc.addDigit(5);
      calc.executeBinary(Operator.MUL);
      calc.addDigit(6);
      calc.equal();

      expect(calc.record.getCount()).toBe(2);
    });

    it('기록 전체 삭제', () => {
      calc.addDigit(1);
      calc.executeBinary(Operator.ADD);
      calc.addDigit(2);
      calc.equal();
      calc.record.clearRecords();
      expect(calc.record.getCount()).toBe(0);
    });
  });

  describe('reset', () => {
    it('계산 후 reset하면 초기 상태', () => {
      calc.addDigit(5);
      calc.executeBinary(Operator.ADD);
      calc.addDigit(3);
      calc.equal();

      calc.reset();
      expect(calc.currentNumber).toBe('0');
      expect(calc.inputBuffer).toBe('0');
      expect(calc.getCurrentOperator()).toBe(Operator.NONE);
    });
  });

  describe('상수', () => {
    it('π 상수 설정', () => {
      calc.setConstant('pi');
      expect(Number(calc.currentNumber)).toBeCloseTo(Math.PI, 10);
    });

    it('e 상수 설정', () => {
      calc.setConstant('e');
      expect(Number(calc.currentNumber)).toBeCloseTo(Math.E, 10);
    });
  });

  describe('진법 변환', () => {
    it('10진수에서 2진수로 전환', () => {
      calc.addDigit(1);
      calc.addDigit(0);
      calc.currentRadix = Radix.Binary;
      expect(calc.inputBuffer).toBe('1010');
    });

    it('잘못된 진법 설정 시 에러', () => {
      expect(() => {
        calc.currentRadix = 'invalid' as Radix;
      }).toThrow();
    });
  });

  describe('워드 사이즈', () => {
    it('wordSize 설정 및 조회', () => {
      calc.wordSize = 16;
      expect(calc.wordSize).toBe(16);
    });
  });

  describe('버퍼 관련', () => {
    it('needsBufferReset 설정 및 조회', () => {
      calc.needsBufferReset = true;
      expect(calc.needsBufferReset).toBe(true);
    });

    it('onBufferReset / offBufferReset', () => {
      calc.onBufferReset();
      expect(calc.needsBufferReset).toBe(true);
      calc.offBufferReset();
      expect(calc.needsBufferReset).toBe(false);
    });

    it('pasteToBuffer', () => {
      calc.pasteToBuffer('456');
      expect(calc.currentNumber).toBe('456');
    });

    it('refreshBuffer', () => {
      calc.addDigit(7);
      calc.refreshBuffer();
      expect(calc.currentNumber).toBe('7');
    });
  });

  describe('executeBinaryWithNumber', () => {
    it('숫자를 직접 사용하는 이항 연산', () => {
      calc.addDigit(1);
      calc.addDigit(0);
      calc.executeBinaryWithNumber(Operator.MUL, 3);
      expect(calc.currentNumber).toBe('30');
    });
  });

  describe('getOperatorString', () => {
    it('연산자 문자열 반환', () => {
      expect(calc.getOperatorString(Operator.ADD)).toBe('+');
      expect(calc.getOperatorString(Operator.SUB)).toBe('-');
      expect(calc.getOperatorString(Operator.MUL)).toBe('×');
      expect(calc.getOperatorString(Operator.DIV)).toBe('÷');
    });
  });

  describe('filterNumberCharacters', () => {
    it('10진수 필터링', () => {
      expect(calc.filterNumberCharacters('abc123.45def')).toBe('123.45');
    });

    it('16진수 필터링', () => {
      expect(calc.filterNumberCharacters('GzFF00', Radix.Hexadecimal)).toBe('FF00');
    });
  });
});
