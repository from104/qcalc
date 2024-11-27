import { defineStore } from 'pinia';

import { Calculator } from 'classes/Calculator';
import { Radix } from 'classes/RadixConverter';

import { useStoreRadix } from './store-radix';

// 기본 스토어 정의
export const useStoreBase = defineStore('base', {
  // 상태 정의
  state: () => ({
    calc: new Calculator(), // 계산기 인스턴스
    currentTab: 'calc', // 현재 활성화된 탭
    isHistoryDialogOpen: false, // 히스토리 대화상자 열림 여부
    isSettingDialogOpen: false, // 설정 대화상자 열림 여부
    isShiftPressed: false, // Shift 버튼 상태
    isShiftLocked: false, // Shift 잠금 상태
    isMemoryVisible: false, // 메모리 표시 여부
    resultPanelPadding: 0, // 결과 패널의 상단 여백
  }),

  // 액션 정의
  actions: {
    // 현재 탭 설정
    setCurrentTab(tab: string): void {
      if (['calc', 'unit', 'currency', 'radix'].includes(tab)) {
        this.currentTab = tab;
      } else if (tab === '' || this.currentTab === '') {
        this.currentTab = 'calc'; // 기본값으로 'calc' 설정
      }
      this.updateCalculatorRadix();
    },

    updateCalculatorRadix(): void {
      if (this.currentTab === 'radix') {
        this.calc.radix = useStoreRadix().sourceRadix;
      } else {
        this.calc.radix = Radix.Decimal;
      }
    },

    // Shift 버튼 토글
    toggleShift(): void {
      this.isShiftPressed = !this.isShiftPressed;
    },

    // Shift 버튼 활성화
    enableShift(): void {
      this.isShiftPressed = true;
    },

    // Shift 버튼 비활성화
    disableShift(): void {
      this.isShiftPressed = false;
    },

    // Shift 잠금 토글
    toggleShiftLock(): void {
      this.isShiftLocked = !this.isShiftLocked;
    },

    // Shift 잠금 활성화
    enableShiftLock(): void {
      this.isShiftLocked = true;
    },

    // Shift 잠금 비활성화
    disableShiftLock(): void {
      this.isShiftLocked = false;
    },

    // 메모리 표시 끄기
    hideMemory(): void {
      this.isMemoryVisible = false;
    },

    // 메모리 표시 켜기 (2초 후 자동으로 꺼짐)
    showMemoryTemporarily(): void {
      this.isMemoryVisible = true;
      setTimeout(() => {
        this.isMemoryVisible = false;
      }, 2000);
    },
  },

  // 상태 지속성 설정
  persist: true,
});
