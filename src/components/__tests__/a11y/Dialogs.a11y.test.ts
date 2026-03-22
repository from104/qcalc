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

describe('Dialog accessibility', () => {
  describe('VersionChangelogDialog', () => {
    const source = readFileSync(resolve(__dirname, '../../dialogs/VersionChangelogDialog.vue'), 'utf-8');

    it('should have role="dialog"', () => {
      expect(source).toContain('role="dialog"');
    });

    it('should have aria-label on q-dialog', () => {
      // The q-dialog element should have :aria-label
      const dialogRegex = /<q-dialog[^>]*>/;
      const match = source.match(dialogRegex);
      expect(match).not.toBeNull();
      expect(match![0]).toContain('aria-label');
    });
  });

  describe('AutoUpdate', () => {
    const source = readFileSync(resolve(__dirname, '../../dialogs/AutoUpdate.vue'), 'utf-8');

    it('should have role="dialog"', () => {
      expect(source).toContain('role="dialog"');
    });

    it('should have aria-label on q-dialog', () => {
      const dialogRegex = /<q-dialog[^>]*>/;
      const match = source.match(dialogRegex);
      expect(match).not.toBeNull();
      expect(match![0]).toContain('aria-label');
    });
  });

  describe('SnapFirst', () => {
    const source = readFileSync(resolve(__dirname, '../../dialogs/SnapFirst.vue'), 'utf-8');

    it('should have role="dialog"', () => {
      expect(source).toContain('role="dialog"');
    });

    it('should have aria-label on q-dialog', () => {
      const dialogRegex = /<q-dialog[^>]*>/;
      const match = source.match(dialogRegex);
      expect(match).not.toBeNull();
      expect(match![0]).toContain('aria-label');
    });
  });

  describe('RecordCard delete dialog', () => {
    const source = readFileSync(resolve(__dirname, '../../record/RecordCard.vue'), 'utf-8');

    it('should have role="alertdialog" on the delete confirmation dialog', () => {
      expect(source).toContain('role="alertdialog"');
    });

    it('should have aria-label on the delete confirmation dialog', () => {
      // Find the q-dialog with role="alertdialog" and check it has aria-label
      const alertDialogRegex = /<q-dialog[^>]*role="alertdialog"[^>]*>/;
      const match = source.match(alertDialogRegex);
      expect(match).not.toBeNull();
      expect(match![0]).toContain('aria-label');
    });
  });

  describe('RecordCard memo dialog', () => {
    const source = readFileSync(resolve(__dirname, '../../record/RecordCard.vue'), 'utf-8');

    it('should have role="dialog" on the memo dialog', () => {
      expect(source).toContain('role="dialog"');
    });

    it('should have aria-label on the memo dialog', () => {
      // Find q-dialog elements with role="dialog" and check for aria-label
      const dialogRegex = /<q-dialog[^>]*role="dialog"[^>]*>/;
      const match = source.match(dialogRegex);
      expect(match).not.toBeNull();
      expect(match![0]).toContain('aria-label');
    });
  });
});
