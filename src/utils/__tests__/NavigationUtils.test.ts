import { describe, it, expect, vi } from 'vitest';
import { navigateToPath } from '../NavigationUtils';
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router';

describe('NavigationUtils', () => {
  const createMockRouter = () =>
    ({
      push: vi.fn(),
      replace: vi.fn(),
    }) as unknown as Router;

  const createMockRoute = (path: string) =>
    ({
      path,
    }) as RouteLocationNormalizedLoaded;

  describe('navigateToPath', () => {
    it('현재 경로와 같으면 이동하지 않음', () => {
      const router = createMockRouter();
      const route = createMockRoute('/calculator');
      navigateToPath('/calculator', route, router);
      expect(router.push).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
    });

    it('help 경로에서는 replace 사용', () => {
      const router = createMockRouter();
      const route = createMockRoute('/help');
      navigateToPath('/calculator', route, router);
      expect(router.replace).toHaveBeenCalledWith('/calculator');
      expect(router.push).not.toHaveBeenCalled();
    });

    it('about 경로에서는 replace 사용', () => {
      const router = createMockRouter();
      const route = createMockRoute('/about');
      navigateToPath('/calculator', route, router);
      expect(router.replace).toHaveBeenCalledWith('/calculator');
    });

    it('settings 경로에서는 replace 사용', () => {
      const router = createMockRouter();
      const route = createMockRoute('/settings');
      navigateToPath('/calculator', route, router);
      expect(router.replace).toHaveBeenCalledWith('/calculator');
    });

    it('record 경로에서는 replace 사용', () => {
      const router = createMockRouter();
      const route = createMockRoute('/record');
      navigateToPath('/calculator', route, router);
      expect(router.replace).toHaveBeenCalledWith('/calculator');
    });

    it('일반 경로에서는 push 사용', () => {
      const router = createMockRouter();
      const route = createMockRoute('/calculator');
      navigateToPath('/settings', route, router);
      expect(router.push).toHaveBeenCalledWith('/settings');
      expect(router.replace).not.toHaveBeenCalled();
    });

    it('중첩된 help 경로에서도 replace 사용', () => {
      const router = createMockRouter();
      const route = createMockRoute('/some/help/page');
      navigateToPath('/calculator', route, router);
      expect(router.replace).toHaveBeenCalledWith('/calculator');
    });

    it('루트 경로에서 다른 경로로 push', () => {
      const router = createMockRouter();
      const route = createMockRoute('/');
      navigateToPath('/calculator', route, router);
      expect(router.push).toHaveBeenCalledWith('/calculator');
    });
  });
});
