import { describe, it, expect, vi, beforeEach } from 'vitest';

// i18n 의존성 mock
vi.mock('src/i18n/initLocale', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

import { UnitConverter } from '../converters/UnitConverter';
import { toBigNumber } from '../calculator/CalculatorMath';

describe('UnitConverter', () => {
  describe('getCategories', () => {
    it('카테고리 목록을 반환', () => {
      const categories = UnitConverter.getCategories();
      expect(categories).toContain('length');
      expect(categories).toContain('weight');
      expect(categories).toContain('temp');
      expect(categories).toContain('area');
      expect(categories).toContain('volume');
      expect(categories.length).toBeGreaterThan(0);
    });
  });

  describe('getUnitLists', () => {
    it('길이 단위 목록 반환', () => {
      const units = UnitConverter.getUnitLists('length');
      expect(units).toContain('m');
      expect(units).toContain('km');
      expect(units).toContain('cm');
    });

    it('유효하지 않은 카테고리에서 에러', () => {
      expect(() => UnitConverter.getUnitLists('invalid_category')).toThrow();
    });
  });

  describe('getUnitValue', () => {
    it('유효한 단위의 값 반환', () => {
      const value = UnitConverter.getUnitValue('length', 'km');
      expect(value).toBeDefined();
    });

    it('유효하지 않은 단위에서 에러', () => {
      expect(() => UnitConverter.getUnitValue('length', 'invalid_unit')).toThrow();
    });

    it('유효하지 않은 카테고리에서 에러', () => {
      expect(() => UnitConverter.getUnitValue('invalid', 'm')).toThrow();
    });
  });

  describe('getUnitDesc', () => {
    it('단위 설명 반환', () => {
      const desc = UnitConverter.getUnitDesc('length', 'km');
      expect(desc).toBe('Kilometer');
    });

    it('유효하지 않은 단위에서 에러', () => {
      expect(() => UnitConverter.getUnitDesc('length', 'invalid_unit')).toThrow();
    });
  });

  describe('convert - 길이', () => {
    it('1 km = 1000 m', () => {
      const result = UnitConverter.convert('length', toBigNumber(1), 'km', 'm');
      expect(result).toBe('1000');
    });

    it('100 cm = 1 m', () => {
      const result = UnitConverter.convert('length', toBigNumber(100), 'cm', 'm');
      expect(result).toBe('1');
    });

    it('1 m = 100 cm', () => {
      const result = UnitConverter.convert('length', toBigNumber(1), 'm', 'cm');
      expect(result).toBe('100');
    });

    it('1000 mm = 1 m', () => {
      const result = UnitConverter.convert('length', toBigNumber(1000), 'mm', 'm');
      expect(result).toBe('1');
    });
  });

  describe('convert - 무게', () => {
    it('1 kg = 1000 g', () => {
      const result = UnitConverter.convert('weight', toBigNumber(1), 'kg', 'g');
      expect(result).toBe('1000');
    });

    it('1000 g = 1 kg', () => {
      const result = UnitConverter.convert('weight', toBigNumber(1000), 'g', 'kg');
      expect(result).toBe('1');
    });
  });

  describe('convert - 온도', () => {
    it('0°C = 32°F', () => {
      const result = UnitConverter.convert('temp', toBigNumber(0), '°C', '°F');
      expect(Number(result)).toBeCloseTo(32, 5);
    });

    it('100°C = 212°F', () => {
      const result = UnitConverter.convert('temp', toBigNumber(100), '°C', '°F');
      expect(Number(result)).toBeCloseTo(212, 5);
    });

    it('32°F = 0°C', () => {
      const result = UnitConverter.convert('temp', toBigNumber(32), '°F', '°C');
      expect(Number(result)).toBeCloseTo(0, 5);
    });

    it('0°C = 273.15 K', () => {
      const result = UnitConverter.convert('temp', toBigNumber(0), '°C', 'K');
      expect(Number(result)).toBeCloseTo(273.15, 5);
    });

    it('273.15 K = 0°C', () => {
      const result = UnitConverter.convert('temp', toBigNumber(273.15), 'K', '°C');
      expect(Number(result)).toBeCloseTo(0, 5);
    });
  });

  describe('convert - 동일 단위', () => {
    it('같은 단위 간 변환은 원래 값 반환', () => {
      const result = UnitConverter.convert('length', toBigNumber(42), 'm', 'm');
      expect(result).toBe('42');
    });
  });

  describe('정밀도', () => {
    it('매우 작은 값 변환', () => {
      const result = UnitConverter.convert('length', toBigNumber(1), 'mm', 'km');
      expect(Number(result)).toBeCloseTo(0.000001, 10);
    });

    it('큰 값 변환', () => {
      const result = UnitConverter.convert('length', toBigNumber(1000000), 'mm', 'km');
      expect(Number(result)).toBeCloseTo(1, 10);
    });
  });

  describe('인스턴스 메서드', () => {
    let converter: UnitConverter;

    beforeEach(() => {
      converter = new UnitConverter();
    });

    it('getAvailableItems', () => {
      const items = converter.getAvailableItems();
      expect(items).toContain('length');
    });

    it('units getter', () => {
      expect(converter.units).toBeDefined();
      expect(converter.units['length']).toBeDefined();
    });

    it('isValid: 유효한 단위', () => {
      expect(converter.isValid('1', 'length.m')).toBe(true);
    });

    it('isValid: 유효하지 않은 형식', () => {
      expect(converter.isValid('1', 'invalid')).toBe(false);
    });

    it('isValid: 유효하지 않은 단위', () => {
      expect(converter.isValid('1', 'length.invalid_unit')).toBe(false);
    });

    it('getItemDescription', () => {
      const desc = converter.getItemDescription('length.km');
      expect(desc).toBe('Kilometer');
    });

    it('getItemDescription: 잘못된 형식', () => {
      expect(() => converter.getItemDescription('invalid')).toThrow();
    });
  });
});
