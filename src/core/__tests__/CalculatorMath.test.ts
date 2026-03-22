import { describe, it, expect, vi } from 'vitest';

// i18n 의존성 mock
vi.mock('src/i18n/initLocale', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

import { CalculatorMath } from '../calculator/CalculatorMath';

const math = new CalculatorMath();

describe('CalculatorMath', () => {
  describe('기본 수학 함수', () => {
    it('abs: 절대값', () => {
      expect(math.abs('-5')).toBe('5');
      expect(math.abs('5')).toBe('5');
      expect(math.abs('0')).toBe('0');
    });

    it('int: 정수 부분', () => {
      expect(math.int('3.7')).toBe('3');
      expect(math.int('-3.7')).toBe('-4');
      expect(math.int('5')).toBe('5');
    });

    it('frac: 소수 부분', () => {
      expect(math.frac('3.75')).toBe('0.75');
      expect(math.frac('5')).toBe('0');
    });

    it('fact: 팩토리얼', () => {
      expect(math.fact('0')).toBe('1');
      expect(math.fact('1')).toBe('1');
      expect(math.fact('5')).toBe('120');
      expect(math.fact('10')).toBe('3628800');
    });

    it('exp10: 10의 거듭제곱', () => {
      expect(math.exp10('0')).toBe('1');
      expect(math.exp10('1')).toBe('10');
      expect(math.exp10('3')).toBe('1000');
    });
  });

  describe('산술 연산', () => {
    it('add: 덧셈', () => {
      expect(math.add('1', '2')).toBe('3');
      expect(math.add('0.1', '0.2')).toBe('0.3');
      expect(math.add('-5', '3')).toBe('-2');
    });

    it('sub: 뺄셈', () => {
      expect(math.sub('5', '3')).toBe('2');
      expect(math.sub('0.3', '0.1')).toBe('0.2');
      expect(math.sub('1', '5')).toBe('-4');
    });

    it('mul: 곱셈', () => {
      expect(math.mul('3', '4')).toBe('12');
      expect(math.mul('0.1', '0.2')).toBe('0.02');
      expect(math.mul('-3', '4')).toBe('-12');
    });

    it('div: 나눗셈', () => {
      expect(math.div('10', '2')).toBe('5');
      expect(math.div('1', '3')).toMatch(/^0\.3+$/);
      expect(math.div('-10', '2')).toBe('-5');
    });

    it('div: 0으로 나누면 에러', () => {
      expect(() => math.div('10', '0')).toThrow();
    });

    it('mod: 나머지', () => {
      expect(math.mod('10', '3')).toBe('1');
      expect(math.mod('10', '5')).toBe('0');
    });

    it('mod: 0으로 나누면 에러', () => {
      expect(() => math.mod('10', '0')).toThrow();
    });

    it('pow: 거듭제곱', () => {
      expect(math.pow('2', '10')).toBe('1024');
      expect(math.pow('3', '0')).toBe('1');
      expect(math.pow('5', '2')).toBe('25');
    });

    it('root: 제곱근', () => {
      expect(math.root('4', '2')).toBe('2');
      expect(math.root('27', '3')).toBe('3');
      expect(math.root('16', '4')).toBe('2');
    });

    it('root: 음수의 짝수 제곱근은 에러', () => {
      expect(() => math.root('-4', '2')).toThrow();
    });
  });

  describe('삼각함수', () => {
    it('sin: 사인 (도 단위)', () => {
      expect(math.sin('0')).toBe('0');
      expect(math.sin('90')).toBe('1');
      expect(Number(math.sin('30'))).toBeCloseTo(0.5, 10);
    });

    it('cos: 코사인 (도 단위)', () => {
      expect(math.cos('0')).toBe('1');
      expect(Number(math.cos('90'))).toBeCloseTo(0, 10);
      expect(Number(math.cos('60'))).toBeCloseTo(0.5, 10);
    });

    it('tan: 탄젠트 (도 단위)', () => {
      expect(math.tan('0')).toBe('0');
      expect(Number(math.tan('45'))).toBeCloseTo(1, 10);
    });
  });

  describe('비트 연산', () => {
    it('bitwiseAnd', () => {
      expect(math.bitwiseAnd('12', '10', 8)).toBe('8');
      expect(math.bitwiseAnd('255', '15', 8)).toBe('15');
    });

    it('bitwiseOr', () => {
      expect(math.bitwiseOr('12', '10', 8)).toBe('14');
    });

    it('bitwiseXor', () => {
      expect(math.bitwiseXor('12', '10', 8)).toBe('6');
    });

    it('bitwiseNot', () => {
      expect(math.bitwiseNot('0', 8)).toBe('255');
      expect(math.bitwiseNot('255', 8)).toBe('0');
    });

    it('bitwiseLeftShift', () => {
      expect(math.bitwiseLeftShift('1', '3', 8)).toBe('8');
      expect(math.bitwiseLeftShift('1', '8', 8)).toBe('0');
    });

    it('bitwiseRightShift', () => {
      expect(math.bitwiseRightShift('8', '3', 8)).toBe('1');
      expect(math.bitwiseRightShift('255', '4', 8)).toBe('15');
    });

    it('음수 입력은 에러', () => {
      expect(() => math.bitwiseAnd('-1', '1', 8)).toThrow();
    });
  });

  describe('상수', () => {
    it('pi 상수 조회', () => {
      expect(Number(math.getConstant('pi'))).toBeCloseTo(Math.PI, 10);
    });

    it('e 상수 조회', () => {
      expect(Number(math.getConstant('e'))).toBeCloseTo(Math.E, 10);
    });

    it('존재하지 않는 상수는 에러', () => {
      expect(() => math.getConstant('invalid' as keyof typeof Object)).toThrow();
    });
  });

  describe('BigNumber 정밀도', () => {
    it('부동소수점 오류 없이 정확한 계산', () => {
      expect(math.add('0.1', '0.2')).toBe('0.3');
      expect(math.sub('1', '0.9')).toBe('0.1');
      expect(math.mul('0.1', '0.1')).toBe('0.01');
    });

    it('큰 수 연산', () => {
      expect(math.add('999999999999999999', '1')).toBe('1000000000000000000');
      expect(math.mul('123456789', '987654321')).toBe('121932631112635269');
    });
  });
});
