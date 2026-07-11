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

describe('탭 오버플로 메뉴 접근성', () => {
  describe.each([
    ['WideLayout', '../../../layouts/WideLayout.vue'],
    ['NarrowLayout', '../../../layouts/NarrowLayout.vue'],
  ])('%s', (_name, path) => {
    const source = readFileSync(resolve(__dirname, path), 'utf-8');

    it('오버플로 q-btn에 aria-haspopup="menu"가 있어야 한다', () => {
      expect(source).toContain('aria-haspopup="menu"');
    });

    it('오버플로 q-btn에 :aria-expanded="overflowMenuOpen"가 있어야 한다', () => {
      expect(source).toContain(':aria-expanded="overflowMenuOpen"');
    });

    it('오버플로 q-btn에 ariaLabel.overflowTabs 번역 키가 있어야 한다', () => {
      expect(source).toContain("t('ariaLabel.overflowTabs')");
    });

    it('q-menu에 v-model="overflowMenuOpen"이 연결되어야 한다', () => {
      expect(source).toContain('v-model="overflowMenuOpen"');
    });

    it('overflowMenuOpen ref 상태가 정의되어야 한다', () => {
      expect(source).toContain('const overflowMenuOpen = ref(false)');
    });
  });

  it('Layout.yml에 overflowTabs 키가 10개 언어 전부 존재해야 한다', () => {
    const yml = readFileSync(resolve(__dirname, '../../../i18n/components/Layout.yml'), 'utf-8');
    expect(yml.match(/overflowTabs:/g)?.length).toBe(10);
  });
});
