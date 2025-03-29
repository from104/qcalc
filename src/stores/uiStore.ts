/**
 * @file uiStore.ts
 * @description UI와 테마 관련 상태와 액션을 관리하는 스토어입니다.
 */

import { defineStore } from 'pinia';

interface UIState {
  isAppStarted: boolean;
  showTips: boolean;
  showTipsDialog: boolean;
  currentTab: string;
  inputFocused: boolean;
  isDeleteRecordConfirmOpen: boolean;
  recordLastScrollPosition: number;
  isSearchOpen: boolean;
  searchKeyword: string;
  isSnapFirstRun: boolean;
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    isAppStarted: false,
    showTips: true,
    showTipsDialog: false,
    currentTab: 'calc',
    inputFocused: false,
    isDeleteRecordConfirmOpen: false,
    recordLastScrollPosition: 0,
    isSearchOpen: false,
    searchKeyword: '',
    isSnapFirstRun: false,
  }),

  actions: {
    // 탭 관리
    setCurrentTab(tab: string): void {
      if (['calc', 'unit', 'currency', 'radix'].includes(tab)) {
        this.currentTab = tab;
      } else if (tab === '' || this.currentTab === '') {
        this.currentTab = 'calc'; // 기본값으로 'calc' 설정
      }
    },

    // 입력 포커스 관련
    setInputFocused(): void {
      setTimeout(() => {
        this.inputFocused = true;
      }, 10);
    },

    setInputBlurred(): void {
      this.inputFocused = false;
    },

    // 전체 계산 결과 삭제 확인 다이얼로그 표시 여부
    setDeleteRecordConfirmOpen(value: boolean) {
      this.isDeleteRecordConfirmOpen = value;
    },

    // 기본 계산기 여부 확인
    isDefaultCalculator(): boolean {
      return true;
    },
  },

  persist: true,
});
