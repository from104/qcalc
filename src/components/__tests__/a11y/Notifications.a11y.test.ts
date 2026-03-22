// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Quasar Notify
const mockNotifyCreate = vi.fn();
vi.mock('quasar', () => ({
  Notify: {
    create: (opts: Record<string, unknown>) => mockNotifyCreate(opts),
  },
}));

import { showMessage, showError } from '../../../utils/NotificationUtils';

describe('Notification accessibility', () => {
  beforeEach(() => {
    mockNotifyCreate.mockClear();
  });

  describe('showMessage', () => {
    it('should create notification with role="status"', () => {
      showMessage('Test message');
      expect(mockNotifyCreate).toHaveBeenCalledTimes(1);
      const opts = mockNotifyCreate.mock.calls[0]?.[0];
      expect(opts.attrs).toBeDefined();
      expect(opts.attrs.role).toBe('status');
    });

    it('should create notification with aria-live="polite"', () => {
      showMessage('Test message');
      const opts = mockNotifyCreate.mock.calls[0]?.[0];
      expect(opts.attrs['aria-live']).toBe('polite');
    });
  });

  describe('showError', () => {
    it('should create notification with role="alert"', () => {
      showError('Test error');
      expect(mockNotifyCreate).toHaveBeenCalledTimes(1);
      const opts = mockNotifyCreate.mock.calls[0]?.[0];
      expect(opts.attrs).toBeDefined();
      expect(opts.attrs.role).toBe('alert');
    });

    it('should create notification with aria-live="assertive"', () => {
      showError('Test error');
      const opts = mockNotifyCreate.mock.calls[0]?.[0];
      expect(opts.attrs['aria-live']).toBe('assertive');
    });
  });
});
