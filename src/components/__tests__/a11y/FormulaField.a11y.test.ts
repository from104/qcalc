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

describe('FormulaField 표시 모드 접근성', () => {
  const source = readFileSync(resolve(__dirname, '../../calc/FormulaField.vue'), 'utf-8');

  it('표시 모드 div가 role="button"을 가져야 한다', () => {
    expect(source).toContain('role="button"');
  });

  it('표시 모드 div가 tabindex="0"으로 키보드 포커스 가능해야 한다', () => {
    expect(source).toContain('tabindex="0"');
  });

  it('Enter 키로 startEditing이 호출되어야 한다', () => {
    expect(source).toContain('@keydown.enter.prevent="startEditing"');
  });

  it('Space 키로 startEditing이 호출되고 전역 버블링이 차단되어야 한다', () => {
    expect(source).toContain('@keydown.space.prevent.stop="startEditing"');
  });
});
