import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// i18n 의존성 mock
vi.mock('src/i18n/initLocale', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

import { useUIStore } from '../uiStore';

describe('uiStore', () => {
  let store: ReturnType<typeof useUIStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useUIStore();
  });

  describe('초기 상태', () => {
    it('기본 상태값이 올바르게 설정되어야 한다', () => {
      expect(store.isAppStarted).toBe(false);
      expect(store.showTips).toBe(true);
      expect(store.showTipsDialog).toBe(false);
      expect(store.currentTab).toBe('calc');
      expect(store.inputFocused).toBe(false);
      expect(store.isDeleteRecordConfirmOpen).toBe(false);
      expect(store.recordLastScrollPosition).toBe(0);
      expect(store.isSearchOpen).toBe(false);
      expect(store.searchKeyword).toBe('');
      expect(store.isSnapFirstRun).toBe(false);
      expect(store.snapLastSeenVersion).toBe('');
      expect(store.lastSeenChangelogVersion).toBe('');
    });
  });

  describe('setCurrentTab', () => {
    it('유효한 탭 이름으로 설정할 수 있어야 한다', () => {
      const validTabs = ['calc', 'unit', 'currency', 'radix', 'formula'];
      for (const tab of validTabs) {
        store.setCurrentTab(tab);
        expect(store.currentTab).toBe(tab);
      }
    });

    it('유효하지 않은 탭 이름은 무시해야 한다', () => {
      store.setCurrentTab('calc');
      store.setCurrentTab('invalid');
      expect(store.currentTab).toBe('calc');
    });

    it('빈 문자열이면 기본값 calc로 설정해야 한다', () => {
      store.setCurrentTab('unit');
      store.setCurrentTab('');
      expect(store.currentTab).toBe('calc');
    });

    it('currentTab이 빈 문자열일 때 유효하지 않은 값이 들어오면 calc로 설정해야 한다', () => {
      store.$patch({ currentTab: '' });
      store.setCurrentTab('invalid_tab');
      expect(store.currentTab).toBe('calc');
    });
  });

  describe('입력 포커스 관련', () => {
    it('setInputFocused는 inputFocused를 true로 설정해야 한다', async () => {
      vi.useFakeTimers();
      store.setInputFocused();
      vi.advanceTimersByTime(20);
      expect(store.inputFocused).toBe(true);
      vi.useRealTimers();
    });

    it('setInputBlurred는 inputFocused를 false로 설정해야 한다', () => {
      store.$patch({ inputFocused: true });
      store.setInputBlurred();
      expect(store.inputFocused).toBe(false);
    });
  });

  describe('검색 관련', () => {
    it('isSearchOpen 상태를 직접 변경할 수 있어야 한다', () => {
      store.$patch({ isSearchOpen: true });
      expect(store.isSearchOpen).toBe(true);
    });

    it('searchKeyword를 변경할 수 있어야 한다', () => {
      store.$patch({ searchKeyword: '테스트' });
      expect(store.searchKeyword).toBe('테스트');
    });
  });

  describe('다이얼로그 관련', () => {
    it('showTipsDialog 상태를 변경할 수 있어야 한다', () => {
      store.$patch({ showTipsDialog: true });
      expect(store.showTipsDialog).toBe(true);
    });

    it('setDeleteRecordConfirmOpen으로 삭제 확인 다이얼로그를 열고 닫을 수 있어야 한다', () => {
      store.setDeleteRecordConfirmOpen(true);
      expect(store.isDeleteRecordConfirmOpen).toBe(true);

      store.setDeleteRecordConfirmOpen(false);
      expect(store.isDeleteRecordConfirmOpen).toBe(false);
    });
  });

  describe('recordLastScrollPosition', () => {
    it('스크롤 위치를 저장할 수 있어야 한다', () => {
      store.$patch({ recordLastScrollPosition: 150 });
      expect(store.recordLastScrollPosition).toBe(150);
    });
  });

  describe('lastSeenChangelogVersion', () => {
    it('updateLastSeenChangelogVersion으로 버전을 업데이트할 수 있어야 한다', () => {
      store.updateLastSeenChangelogVersion('0.12.0');
      expect(store.lastSeenChangelogVersion).toBe('0.12.0');
    });
  });

  describe('Snap 관련', () => {
    it('updateSnapVersion으로 버전을 업데이트하고 isSnapFirstRun을 false로 설정해야 한다', () => {
      store.$patch({ isSnapFirstRun: true });
      store.updateSnapVersion('1.0.0');
      expect(store.snapLastSeenVersion).toBe('1.0.0');
      expect(store.isSnapFirstRun).toBe(false);
    });
  });
});
