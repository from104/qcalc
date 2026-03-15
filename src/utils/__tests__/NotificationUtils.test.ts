import { describe, it, expect, vi, beforeEach } from 'vitest';

// Quasar Notify mock
const mockCreate = vi.fn();
vi.mock('quasar', () => ({
  Notify: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

import { showMessage, showError } from '../NotificationUtils';

describe('NotificationUtils', () => {
  beforeEach(() => {
    mockCreate.mockClear();
  });

  describe('showMessage', () => {
    it('기본 성공 메시지 표시', () => {
      showMessage('성공!');
      expect(mockCreate).toHaveBeenCalledTimes(1);
      const call = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
      expect(call.message).toBe('성공!');
      expect(call.color).toBe('positive');
      expect(call.timeout).toBe(2000);
      expect(call.position).toBe('top');
      expect(call.html).toBe(true);
    });

    it('커스텀 duration 설정', () => {
      showMessage('테스트', 5000);
      const call = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
      expect(call.timeout).toBe(5000);
    });

    it('커스텀 position 설정', () => {
      showMessage('테스트', 2000, 'bottom');
      const call = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
      expect(call.position).toBe('bottom');
    });

    it('aria 속성 확인 (role: status, aria-live: polite)', () => {
      showMessage('접근성 테스트');
      const call = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
      const attrs = call.attrs as Record<string, string>;
      expect(attrs.role).toBe('status');
      expect(attrs['aria-live']).toBe('polite');
    });
  });

  describe('showError', () => {
    it('기본 에러 메시지 표시', () => {
      showError('에러 발생!');
      expect(mockCreate).toHaveBeenCalledTimes(1);
      const call = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
      expect(call.message).toBe('에러 발생!');
      expect(call.color).toBe('negative');
      expect(call.timeout).toBe(2000);
      expect(call.position).toBe('top');
      expect(call.html).toBe(true);
    });

    it('커스텀 duration 설정', () => {
      showError('에러', 3000);
      const call = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
      expect(call.timeout).toBe(3000);
    });

    it('커스텀 position 설정', () => {
      showError('에러', 2000, 'center');
      const call = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
      expect(call.position).toBe('center');
    });

    it('aria 속성 확인 (role: alert, aria-live: assertive)', () => {
      showError('접근성 에러 테스트');
      const call = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
      const attrs = call.attrs as Record<string, string>;
      expect(attrs.role).toBe('alert');
      expect(attrs['aria-live']).toBe('assertive');
    });
  });

  describe('showMessage vs showError 차이점', () => {
    it('성공은 positive, 에러는 negative 색상', () => {
      showMessage('성공');
      showError('에러');
      const msgCall = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
      const errCall = mockCreate.mock.calls[1]![0] as Record<string, unknown>;
      expect(msgCall.color).toBe('positive');
      expect(errCall.color).toBe('negative');
    });

    it('성공은 polite, 에러는 assertive aria-live', () => {
      showMessage('성공');
      showError('에러');
      const msgAttrs = (mockCreate.mock.calls[0]![0] as Record<string, unknown>).attrs as Record<string, string>;
      const errAttrs = (mockCreate.mock.calls[1]![0] as Record<string, unknown>).attrs as Record<string, string>;
      expect(msgAttrs['aria-live']).toBe('polite');
      expect(errAttrs['aria-live']).toBe('assertive');
    });
  });
});
