import { describe, it, expect } from 'vitest';
import { numberGrouping, formatDecimalPlaces, formatExpressionNumbers } from '../NumberUtils';

describe('NumberUtils', () => {
  describe('numberGrouping', () => {
    it('3자리 그룹핑', () => {
      expect(numberGrouping('1234567', 3)).toBe('1,234,567');
    });

    it('4자리 그룹핑', () => {
      expect(numberGrouping('12345678', 4)).toBe('1234,5678');
    });

    it('그룹핑 불필요한 짧은 숫자', () => {
      expect(numberGrouping('123', 3)).toBe('123');
      expect(numberGrouping('0', 3)).toBe('0');
    });

    it('소수부가 있는 숫자', () => {
      expect(numberGrouping('1234567.89', 3)).toBe('1,234,567.89');
    });

    it('소수부만 있는 경우', () => {
      expect(numberGrouping('0.123456', 3)).toBe('0.123456');
    });

    it('16진수 그룹핑', () => {
      expect(numberGrouping('ABCDEF12', 4)).toBe('ABCD,EF12');
    });

    it('빈 정수부', () => {
      expect(numberGrouping('.123', 3)).toBe('.123');
    });
  });

  describe('formatDecimalPlaces', () => {
    describe('기본 동작', () => {
      it('빈 문자열은 0을 반환', () => {
        expect(formatDecimalPlaces('', 2, 10)).toBe('0');
      });

      it('유효하지 않은 숫자는 0을 반환', () => {
        expect(formatDecimalPlaces('abc', 2, 10)).toBe('0');
        expect(formatDecimalPlaces('12.34.56', 2, 10)).toBe('0');
      });

      it('정수 입력', () => {
        expect(formatDecimalPlaces('42', -1, 10)).toBe('42');
      });

      it('음수 처리', () => {
        expect(formatDecimalPlaces('-42.567', 2, 10)).toBe('-42.57');
      });
    });

    describe('decimalPlaces < 0 (부동소수점 노이즈 제거)', () => {
      it('정수는 그대로 반환', () => {
        expect(formatDecimalPlaces('123', -1, 10)).toBe('123');
      });

      it('정상 소수는 그대로 반환', () => {
        expect(formatDecimalPlaces('3.14', -1, 10)).toBe('3.14');
      });

      it('후행 0 반복 제거 (10자리 이상)', () => {
        expect(formatDecimalPlaces('1.20000000000003', -1, 10)).toBe('1.2');
      });

      it('후행 9 반복 반올림 (10자리 이상)', () => {
        expect(formatDecimalPlaces('1.29999999999997', -1, 10)).toBe('1.3');
      });

      it('후행 9 반복으로 정수부 올림', () => {
        expect(formatDecimalPlaces('9.99999999999997', -1, 10)).toBe('10');
      });
    });

    describe("decimalPlaces = 0 (정수 반올림, Banker's Rounding)", () => {
      it('소수부 없으면 그대로', () => {
        expect(formatDecimalPlaces('5', 0, 10)).toBe('5');
      });

      it('.5 → 짝수 쪽으로 반올림 (2.5 → 2)', () => {
        expect(formatDecimalPlaces('2.5', 0, 10)).toBe('2');
      });

      it('.5 → 짝수 쪽으로 반올림 (3.5 → 4)', () => {
        expect(formatDecimalPlaces('3.5', 0, 10)).toBe('4');
      });

      it('.5 초과 → 올림 (2.6 → 3)', () => {
        expect(formatDecimalPlaces('2.6', 0, 10)).toBe('3');
      });

      it('.5 미만 → 내림 (2.4 → 2)', () => {
        expect(formatDecimalPlaces('2.4', 0, 10)).toBe('2');
      });

      it('.50001 → 올림 (정확히 절반 초과)', () => {
        expect(formatDecimalPlaces('2.50001', 0, 10)).toBe('3');
      });

      it("음수 Banker's Rounding", () => {
        expect(formatDecimalPlaces('-2.5', 0, 10)).toBe('-2');
        expect(formatDecimalPlaces('-3.5', 0, 10)).toBe('-4');
      });
    });

    describe('decimalPlaces > 0 (지정 자릿수 반올림)', () => {
      it('소수점 없는 숫자에 0 패딩', () => {
        expect(formatDecimalPlaces('5', 3, 10)).toBe('5.000');
      });

      it('소수부가 짧으면 0으로 채움', () => {
        expect(formatDecimalPlaces('1.2', 4, 10)).toBe('1.2000');
      });

      it("소수부 반올림 (Banker's Rounding)", () => {
        expect(formatDecimalPlaces('1.245', 2, 10)).toBe('1.24');
        expect(formatDecimalPlaces('1.255', 2, 10)).toBe('1.26');
        expect(formatDecimalPlaces('1.2451', 2, 10)).toBe('1.25');
      });

      it('소수부 반올림으로 정수부 올림', () => {
        expect(formatDecimalPlaces('9.999', 2, 10)).toBe('10.00');
      });

      it('음수 소수부 반올림', () => {
        expect(formatDecimalPlaces('-1.2567', 2, 10)).toBe('-1.26');
      });
    });

    describe('16진수 처리', () => {
      it('16진수 정수', () => {
        expect(formatDecimalPlaces('ff', -1, 16)).toBe('FF');
      });

      it('16진수 소수 반올림', () => {
        expect(formatDecimalPlaces('a.bc', 1, 16)).toBe('A.C');
      });

      it('유효하지 않은 16진수', () => {
        expect(formatDecimalPlaces('xyz', 0, 16)).toBe('0');
      });
    });

    describe('2진수 처리', () => {
      it('2진수 정수', () => {
        expect(formatDecimalPlaces('1010', -1, 2)).toBe('1010');
      });

      it('2진수 소수 반올림', () => {
        expect(formatDecimalPlaces('1.11', 1, 2)).toBe('10.0');
      });
    });

    describe('8진수 처리', () => {
      it('8진수 정수', () => {
        expect(formatDecimalPlaces('77', -1, 8)).toBe('77');
      });

      it('8진수 소수 반올림', () => {
        expect(formatDecimalPlaces('7.74', 1, 8)).toBe('10.0');
      });
    });
  });

  describe('formatExpressionNumbers', () => {
    it('수식 내 숫자 그룹핑', () => {
      expect(formatExpressionNumbers('1234+5678', 3, -1)).toBe('1,234+5,678');
    });

    it('소수부 자릿수 제한', () => {
      expect(formatExpressionNumbers('3.14159', 3, 2)).toBe('3.14');
    });

    it('소수부 제한 없음 (음수)', () => {
      expect(formatExpressionNumbers('3.14159', 3, -1)).toBe('3.14159');
    });

    it('정수만 있는 수식', () => {
      expect(formatExpressionNumbers('100+200*300', 3, -1)).toBe('100+200*300');
    });

    it('큰 숫자가 포함된 수식', () => {
      expect(formatExpressionNumbers('1000000+0.123456', 3, 3)).toBe('1,000,000+0.123');
    });

    it('소수부 자릿수 제한 0이면 소수부 제거', () => {
      expect(formatExpressionNumbers('3.14', 3, 0)).toBe('3');
    });
  });
});
