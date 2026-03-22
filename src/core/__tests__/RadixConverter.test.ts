import { describe, it, expect, vi } from 'vitest';

// i18n 의존성 mock
vi.mock('src/i18n/initLocale', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

import {
  Radix,
  convertRadix,
  isValidRadixNumber,
  isValidBinary,
  isValidOctal,
  isValidDecimal,
  isValidHexadecimal,
  getAvailableRadixItems,
  getRadixItemDescription,
} from '../converters/RadixConverter';

describe('RadixConverter', () => {
  describe('convertRadix - 10진수 → 2진수', () => {
    it('0 → 0', () => {
      expect(convertRadix('0', Radix.Decimal, Radix.Binary)).toBe('0');
    });

    it('10 → 1010', () => {
      expect(convertRadix('10', Radix.Decimal, Radix.Binary)).toBe('1010');
    });

    it('255 → 11111111', () => {
      expect(convertRadix('255', Radix.Decimal, Radix.Binary)).toBe('11111111');
    });

    it('1 → 1', () => {
      expect(convertRadix('1', Radix.Decimal, Radix.Binary)).toBe('1');
    });
  });

  describe('convertRadix - 2진수 → 10진수', () => {
    it('1010 → 10', () => {
      expect(convertRadix('1010', Radix.Binary, Radix.Decimal)).toBe('10');
    });

    it('11111111 → 255', () => {
      expect(convertRadix('11111111', Radix.Binary, Radix.Decimal)).toBe('255');
    });

    it('0 → 0', () => {
      expect(convertRadix('0', Radix.Binary, Radix.Decimal)).toBe('0');
    });
  });

  describe('convertRadix - 10진수 → 8진수', () => {
    it('8 → 10', () => {
      expect(convertRadix('8', Radix.Decimal, Radix.Octal)).toBe('10');
    });

    it('255 → 377', () => {
      expect(convertRadix('255', Radix.Decimal, Radix.Octal)).toBe('377');
    });
  });

  describe('convertRadix - 8진수 → 10진수', () => {
    it('10 → 8', () => {
      expect(convertRadix('10', Radix.Octal, Radix.Decimal)).toBe('8');
    });

    it('377 → 255', () => {
      expect(convertRadix('377', Radix.Octal, Radix.Decimal)).toBe('255');
    });
  });

  describe('convertRadix - 10진수 → 16진수', () => {
    it('255 → FF', () => {
      expect(convertRadix('255', Radix.Decimal, Radix.Hexadecimal)).toBe('FF');
    });

    it('16 → 10', () => {
      expect(convertRadix('16', Radix.Decimal, Radix.Hexadecimal)).toBe('10');
    });

    it('0 → 0', () => {
      expect(convertRadix('0', Radix.Decimal, Radix.Hexadecimal)).toBe('0');
    });

    it('4096 → 1000', () => {
      expect(convertRadix('4096', Radix.Decimal, Radix.Hexadecimal)).toBe('1000');
    });
  });

  describe('convertRadix - 16진수 → 10진수', () => {
    it('FF → 255', () => {
      expect(convertRadix('FF', Radix.Hexadecimal, Radix.Decimal)).toBe('255');
    });

    it('10 → 16', () => {
      expect(convertRadix('10', Radix.Hexadecimal, Radix.Decimal)).toBe('16');
    });

    it('소문자 ff → 255', () => {
      expect(convertRadix('ff', Radix.Hexadecimal, Radix.Decimal)).toBe('255');
    });
  });

  describe('convertRadix - 동일 진법', () => {
    it('같은 진법이면 원래 값 반환', () => {
      expect(convertRadix('42', Radix.Decimal, Radix.Decimal)).toBe('42');
      expect(convertRadix('1010', Radix.Binary, Radix.Binary)).toBe('1010');
      expect(convertRadix('FF', Radix.Hexadecimal, Radix.Hexadecimal)).toBe('FF');
    });
  });

  describe('convertRadix - 음수', () => {
    it('음수 10진수 → 2진수', () => {
      const result = convertRadix('-10', Radix.Decimal, Radix.Binary);
      expect(result).toBe('-1010');
    });

    it('음수 2진수 → 10진수', () => {
      const result = convertRadix('-1010', Radix.Binary, Radix.Decimal);
      expect(result).toBe('-10');
    });
  });

  describe('convertRadix - 소수', () => {
    it('10진수 소수 → 2진수', () => {
      const result = convertRadix('0.5', Radix.Decimal, Radix.Binary);
      expect(result).toBe('0.1');
    });

    it('2진수 소수 → 10진수', () => {
      const result = convertRadix('0.1', Radix.Binary, Radix.Decimal);
      expect(result).toBe('0.5');
    });
  });

  describe('convertRadix - 2진수 ↔ 16진수', () => {
    it('2진수 11111111 → 16진수 FF', () => {
      expect(convertRadix('11111111', Radix.Binary, Radix.Hexadecimal)).toBe('FF');
    });

    it('16진수 FF → 2진수 11111111', () => {
      expect(convertRadix('FF', Radix.Hexadecimal, Radix.Binary)).toBe('11111111');
    });
  });

  describe('isValidRadixNumber', () => {
    it('유효한 2진수', () => {
      expect(isValidBinary('1010')).toBe(true);
    });

    it('유효하지 않은 2진수', () => {
      expect(() => isValidBinary('1234')).toThrow();
    });

    it('유효한 8진수', () => {
      expect(isValidOctal('377')).toBe(true);
    });

    it('유효하지 않은 8진수', () => {
      expect(() => isValidOctal('89')).toThrow();
    });

    it('유효한 10진수', () => {
      expect(isValidDecimal('123')).toBe(true);
    });

    it('유효하지 않은 10진수', () => {
      expect(() => isValidDecimal('12AB')).toThrow();
    });

    it('유효한 16진수', () => {
      expect(isValidHexadecimal('FF00')).toBe(true);
    });

    it('유효하지 않은 16진수', () => {
      expect(() => isValidHexadecimal('GG')).toThrow();
    });

    it('음수 유효성 검사', () => {
      expect(isValidRadixNumber('-10', Radix.Decimal)).toBe(true);
      expect(isValidRadixNumber('-1010', Radix.Binary)).toBe(true);
    });

    it('소수 유효성 검사', () => {
      expect(isValidRadixNumber('1.5', Radix.Decimal)).toBe(true);
      expect(isValidRadixNumber('1.01', Radix.Binary)).toBe(true);
    });
  });

  describe('getAvailableRadixItems', () => {
    it('사용 가능한 진법 목록 반환', () => {
      const items = getAvailableRadixItems();
      expect(items).toContain(Radix.Binary);
      expect(items).toContain(Radix.Octal);
      expect(items).toContain(Radix.Decimal);
      expect(items).toContain(Radix.Hexadecimal);
      expect(items.length).toBe(4);
    });
  });

  describe('getRadixItemDescription', () => {
    it('2진수 설명', () => {
      expect(getRadixItemDescription(Radix.Binary)).toContain('Binary');
    });

    it('8진수 설명', () => {
      expect(getRadixItemDescription(Radix.Octal)).toContain('Octal');
    });

    it('10진수 설명', () => {
      expect(getRadixItemDescription(Radix.Decimal)).toContain('Decimal');
    });

    it('16진수 설명', () => {
      expect(getRadixItemDescription(Radix.Hexadecimal)).toContain('Hexadecimal');
    });

    it('유효하지 않은 진법 설명 시 에러', () => {
      expect(() => getRadixItemDescription('invalid')).toThrow();
    });
  });

  describe('큰 수 변환', () => {
    it('큰 10진수 → 16진수 → 10진수 왕복', () => {
      const original = '1000000';
      const hex = convertRadix(original, Radix.Decimal, Radix.Hexadecimal);
      const back = convertRadix(hex, Radix.Hexadecimal, Radix.Decimal);
      expect(back).toBe(original);
    });

    it('큰 10진수 → 2진수 → 10진수 왕복', () => {
      const original = '65535';
      const bin = convertRadix(original, Radix.Decimal, Radix.Binary);
      expect(bin).toBe('1111111111111111');
      const back = convertRadix(bin, Radix.Binary, Radix.Decimal);
      expect(back).toBe(original);
    });
  });

  describe('빈 값 / 0 처리', () => {
    it('빈 문자열은 유효하지 않은 입력으로 에러', () => {
      expect(() => convertRadix('', Radix.Binary, Radix.Decimal)).toThrow();
    });

    it('-0 → 0', () => {
      expect(convertRadix('-0', Radix.Decimal, Radix.Binary)).toBe('0');
    });
  });
});
