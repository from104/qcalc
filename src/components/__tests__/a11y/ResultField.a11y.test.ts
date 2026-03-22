// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: { value: 'en' } }),
}));

vi.stubGlobal('globalVars', {
  isElectron: false,
  isAndroid: false,
  isCapacitor: false,
  isMobile: false,
  isDesktop: true,
  isPhone: false,
  isTablet: false,
  isDev: true,
  version: '0.12.0',
});

describe('ResultField accessibility', () => {
  const source = readFileSync(resolve(__dirname, '../../calc/ResultField.vue'), 'utf-8');

  it('should have aria-live="polite" attribute on the result field', () => {
    expect(source).toContain('aria-live="polite"');
  });

  it('should have aria-atomic="true" attribute', () => {
    expect(source).toContain('aria-atomic="true"');
  });

  it('should have aria-label with resultField translation key', () => {
    expect(source).toContain('aria-label');
    expect(source).toContain('resultField');
  });

  it('should have role="textbox" attribute', () => {
    expect(source).toContain('role="textbox"');
  });
});
