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

describe('SettingCard accessibility', () => {
  const source = readFileSync(resolve(__dirname, '../../settings/SettingCard.vue'), 'utf-8');

  it('should have aria-label attributes on q-toggle elements', () => {
    // Extract all q-toggle elements (multi-line) and check they have aria-label
    const toggleRegex = /<q-toggle[\s\S]*?\/>/g;
    const toggleMatches = source.match(toggleRegex) || [];
    expect(toggleMatches.length).toBeGreaterThan(0);
    for (const toggle of toggleMatches) {
      expect(toggle).toContain('aria-label');
    }
  });

  it('should have aria-label attributes on key q-select elements', () => {
    // Verify that q-select elements exist
    expect(source).toContain('<q-select');
    // The primary q-select elements (theme, language) should have aria-label
    // Extract q-select blocks that contain aria-label
    const selectWithAriaRegex = /<q-select[\s\S]*?aria-label[\s\S]*?(?:\/>|<\/q-select>)/g;
    const selectsWithAria = source.match(selectWithAriaRegex) || [];
    expect(selectsWithAria.length).toBeGreaterThan(0);
  });

  it('should have role="list" on settings list', () => {
    expect(source).toContain('role="list"');
  });

  it('should have role="separator" on separators', () => {
    expect(source).toContain('role="separator"');
  });
});
