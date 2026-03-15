import { describe, it, expect, vi, beforeEach } from 'vitest';

// i18n 의존성 mock
vi.mock('src/i18n/initLocale', () => ({
  i18n: {
    global: {
      t: (key: string, params?: Record<string, unknown>) => {
        if (params && Object.keys(params).length > 0) {
          return `${key}:${JSON.stringify(params)}`;
        }
        return key;
      },
    },
  },
}));

import { getErrorMessage, checkError, throwError } from '../ErrorUtils';

describe('ErrorUtils', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getErrorMessage', () => {
    it('i18n 키로 에러 메시지를 가져옴', () => {
      expect(getErrorMessage('errors.notFound')).toBe('errors.notFound');
    });

    it('파라미터가 포함된 에러 메시지', () => {
      const result = getErrorMessage('errors.invalid', { field: 'name' });
      expect(result).toContain('errors.invalid');
      expect(result).toContain('name');
    });

    it('파라미터 없이 호출', () => {
      expect(getErrorMessage('errors.generic')).toBe('errors.generic');
    });
  });

  describe('checkError', () => {
    it('condition이 true이면 에러 발생', () => {
      expect(() => checkError(true, 'errors.test')).toThrow('errors.test');
    });

    it('condition이 false이면 에러 없음', () => {
      expect(() => checkError(false, 'errors.test')).not.toThrow();
    });

    it('condition이 true일 때 console.error 호출', () => {
      try {
        checkError(true, 'errors.test');
      } catch {
        // expected
      }
      expect(console.error).toHaveBeenCalledWith('errors.test');
    });

    it('파라미터가 포함된 에러 발생', () => {
      expect(() => checkError(true, 'errors.invalid', { field: 'age' })).toThrow();
    });
  });

  describe('throwError', () => {
    it('항상 에러를 발생시킴', () => {
      expect(() => throwError('errors.fatal')).toThrow('errors.fatal');
    });

    it('console.error를 호출', () => {
      try {
        throwError('errors.fatal');
      } catch {
        // expected
      }
      expect(console.error).toHaveBeenCalledWith('errors.fatal');
    });

    it('파라미터가 포함된 에러 발생', () => {
      expect(() => throwError('errors.custom', { detail: 'info' })).toThrow();
    });

    it('반환 타입이 never (항상 throw)', () => {
      let reached = false;
      try {
        throwError('errors.never');
        reached = true;
      } catch {
        // expected
      }
      expect(reached).toBe(false);
    });
  });
});
