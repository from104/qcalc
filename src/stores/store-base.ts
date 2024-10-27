import {defineStore} from 'pinia';
import {Calculator} from 'classes/Calculator';

// 기본 스토어 정의
export const useStoreBase = defineStore('base', {
  // 상태 정의
  state: () => ({
    calc: new Calculator(),  // 계산기 인스턴스
    cTab: 'calc',            // 현재 활성화된 탭
    isHistoryDialogOpen: false,  // 히스토리 대화상자 열림 여부
    isSettingDialogOpen: false,  // 설정 대화상자 열림 여부
    buttonShift: false,      // Shift 버튼 상태
    buttonShiftLock: false,  // Shift 잠금 상태
    showMemory: false,       // 메모리 표시 여부
    paddingOnResult: 0,      // 결과 패널의 상단 여백
  }),

  // 액션 정의
  actions: {
    // 현재 탭 설정
    setCTab(tab: string): void {
      if (['calc', 'unit', 'currency'].includes(tab)) {
        this.cTab = tab;
      } else if (tab === '' || this.cTab === '') {
        this.cTab = 'calc';  // 기본값으로 'calc' 설정
      }
    },

    // Shift 버튼 토글
    toggleButtonShift(): void {
      this.buttonShift = !this.buttonShift;
    },

    // Shift 버튼 활성화
    onButtonShift(): void {
      this.buttonShift = true;
    },

    // Shift 버튼 비활성화
    offButtonShift(): void {
      this.buttonShift = false;
    },

    // Shift 잠금 토글
    toggleButtonShiftLock(): void {
      this.buttonShiftLock = !this.buttonShiftLock;
    },

    // Shift 잠금 활성화
    onButtonShiftLock(): void {
      this.buttonShiftLock = true;
    },

    // Shift 잠금 비활성화
    offButtonShiftLock(): void {
      this.buttonShiftLock = false;
    },

    // 메모리 표시 끄기
    showMemoryOff(): void {
      this.showMemory = false;
    },

    // 메모리 표시 켜기 (2초 후 자동으로 꺼짐)
    showMemoryOnWithTimer(): void {
      this.showMemory = true;
      setTimeout(() => {
        this.showMemory = false;
      }, 2000);
    },
  },

  // 상태 지속성 설정
  persist: true,
});
