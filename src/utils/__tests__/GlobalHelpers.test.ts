import { describe, it, expect, vi, beforeEach } from 'vitest';

// Quasar Screen mock
vi.mock('quasar', () => ({
  Screen: {
    width: 1024,
    height: 768,
  },
}));

import {
  defineImmutableProperty,
  isPortrait,
  isLandscape,
  isWideWidth,
  blurElement,
  clickButtonById,
  logDev,
} from '../GlobalHelpers';
import { Screen } from 'quasar';

describe('GlobalHelpers', () => {
  describe('defineImmutableProperty', () => {
    it('불변 속성을 정의', () => {
      const obj: Record<string, unknown> = {};
      defineImmutableProperty(obj, 'testKey', 'testValue');
      expect(obj.testKey).toBe('testValue');
    });

    it('불변 속성은 재할당 불가', () => {
      const obj: Record<string, unknown> = {};
      defineImmutableProperty(obj, 'testKey', 'testValue');
      expect(() => {
        'use strict';
        obj.testKey = 'newValue';
      }).toThrow();
    });

    it('불변 속성은 열거 가능', () => {
      const obj: Record<string, unknown> = {};
      defineImmutableProperty(obj, 'testKey', 'testValue');
      expect(Object.keys(obj)).toContain('testKey');
    });

    it('불변 속성은 삭제 불가', () => {
      const obj: Record<string, unknown> = {};
      defineImmutableProperty(obj, 'testKey', 'testValue');
      expect(() => {
        'use strict';
        delete obj.testKey;
      }).toThrow();
    });
  });

  describe('isPortrait / isLandscape', () => {
    it('가로 모드 (width > height)', () => {
      (Screen as { width: number }).width = 1024;
      (Screen as { height: number }).height = 768;
      expect(isPortrait()).toBe(false);
      expect(isLandscape()).toBe(true);
    });

    it('세로 모드 (width < height)', () => {
      (Screen as { width: number }).width = 400;
      (Screen as { height: number }).height = 800;
      expect(isPortrait()).toBe(true);
      expect(isLandscape()).toBe(false);
    });

    it('정사각형 (width === height)', () => {
      (Screen as { width: number }).width = 500;
      (Screen as { height: number }).height = 500;
      expect(isPortrait()).toBe(false);
      expect(isLandscape()).toBe(true);
    });
  });

  describe('isWideWidth', () => {
    beforeEach(() => {
      // 기본 globalVars 설정
      globalThis.window = {
        ...globalThis.window,
        globalVars: {
          isTablet: false,
          isPhone: false,
        },
      } as unknown as Window & typeof globalThis;
    });

    it('데스크탑: 넓은 너비 (width >= 660)', () => {
      (Screen as { width: number }).width = 700;
      (Screen as { height: number }).height = 500;
      expect(isWideWidth()).toBe(true);
    });

    it('데스크탑: 좁은 너비 (width < 660)', () => {
      (Screen as { width: number }).width = 600;
      (Screen as { height: number }).height = 500;
      expect(isWideWidth()).toBe(false);
    });

    it('폰: 항상 false', () => {
      Object.defineProperty(globalThis.window, 'globalVars', {
        value: { isTablet: false, isPhone: true },
        writable: true,
        configurable: true,
      });
      (Screen as { width: number }).width = 1000;
      (Screen as { height: number }).height = 500;
      expect(isWideWidth()).toBe(false);
    });

    it('태블릿: 가로 모드면 true', () => {
      Object.defineProperty(globalThis.window, 'globalVars', {
        value: { isTablet: true, isPhone: false },
        writable: true,
        configurable: true,
      });
      (Screen as { width: number }).width = 1024;
      (Screen as { height: number }).height = 768;
      expect(isWideWidth()).toBe(true);
    });

    it('태블릿: 세로 모드면 false', () => {
      Object.defineProperty(globalThis.window, 'globalVars', {
        value: { isTablet: true, isPhone: false },
        writable: true,
        configurable: true,
      });
      (Screen as { width: number }).width = 768;
      (Screen as { height: number }).height = 1024;
      expect(isWideWidth()).toBe(false);
    });
  });

  describe('blurElement', () => {
    it('현재 포커스된 요소의 포커스를 해제', () => {
      const mockBlur = vi.fn();
      const mockDocument = { activeElement: { blur: mockBlur } };
      vi.stubGlobal('document', mockDocument);
      blurElement();
      expect(mockBlur).toHaveBeenCalled();
      vi.unstubAllGlobals();
    });

    it('activeElement가 없으면 에러 없음', () => {
      const mockDocument = { activeElement: null };
      vi.stubGlobal('document', mockDocument);
      expect(() => blurElement()).not.toThrow();
      vi.unstubAllGlobals();
    });
  });

  describe('clickButtonById', () => {
    it('ID로 버튼을 찾아 클릭', () => {
      const mockClick = vi.fn();
      const mockDocument = {
        getElementById: vi.fn().mockReturnValue({ click: mockClick }),
      };
      vi.stubGlobal('document', mockDocument);
      clickButtonById('test-btn');
      expect(mockDocument.getElementById).toHaveBeenCalledWith('test-btn');
      expect(mockClick).toHaveBeenCalled();
      vi.unstubAllGlobals();
    });

    it('존재하지 않는 버튼은 무시', () => {
      const mockDocument = {
        getElementById: vi.fn().mockReturnValue(null),
      };
      vi.stubGlobal('document', mockDocument);
      expect(() => clickButtonById('nonexistent')).not.toThrow();
      vi.unstubAllGlobals();
    });
  });

  describe('logDev', () => {
    it('DEV 모드에서 콘솔 로그 출력', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      // vitest는 기본적으로 DEV 모드
      logDev('test message', 123);
      // DEV 환경에서는 호출됨
      if (import.meta.env.DEV) {
        expect(spy).toHaveBeenCalledWith('test message', 123);
      }
      spy.mockRestore();
    });
  });
});
