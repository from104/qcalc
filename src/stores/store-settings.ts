import { defineStore } from 'pinia';
import { Dark } from 'quasar';

// 설정 관련 상태와 동작을 관리하는 스토어 정의
export const useStoreSettings = defineStore('settings', {
  // 상태 정의
  state: () => ({
    darkMode: false,           // 다크 모드 상태
    alwaysOnTop: false,        // 항상 위에 표시 상태
    useGrouping: true,         // 숫자 그룹화 사용 여부
    decimalPlaces: -2,         // 소수점 자릿수 (-2는 자동)
    useSystemLocale: true,     // 시스템 로케일 사용 여부
    locale: '',                // 현재 로케일
    userLocale: '',            // 사용자 지정 로케일
    initPanel: false,          // 초기 패널 표시 여부
    showUnit: true,            // 단위 표시 여부
    showSymbol: true,          // 기호 표시 여부
    paddingOnResult: 20,       // 결과 패딩 값
    showButtonAddedLabel: true, // 버튼 추가 레이블 표시 여부
    hapticsMode: true,         // 햅틱 피드백 모드
  }),

  // 액션 정의
  actions: {
    // 다크 모드 설정
    setDarkMode(darkMode: boolean) {
      this.darkMode = darkMode;
      Dark.set(this.darkMode);
    },

    // 다크 모드 토글
    toggleDarkMode() {
      this.setDarkMode(!this.darkMode);
    },

    // 항상 위에 표시 설정
    setAlwaysOnTop(alwaysOnTop: boolean) {
      this.alwaysOnTop = alwaysOnTop;
      window.myAPI.setAlwaysOnTop(this.alwaysOnTop);
    },

    // 항상 위에 표시 토글
    toggleAlwaysOnTop() {
      this.setAlwaysOnTop(!this.alwaysOnTop);
    },

    // 초기 패널 설정
    setInitPanel(initPanel: boolean) {
      this.initPanel = initPanel;
    },

    // 초기 패널 토글
    toggleInitPanel() {
      this.setInitPanel(!this.initPanel);
    },

    // 숫자 그룹화 사용 토글
    toggleUseGrouping() {
      this.useGrouping = !this.useGrouping;
    },

    // 버튼 추가 레이블 표시 토글
    toggleButtonAddedLabel() {
      this.showButtonAddedLabel = !this.showButtonAddedLabel;
    },

    // 소수점 자릿수 설정
    setDecimalPlaces(decimalPlaces: number) {
      if ([-2, 0, 2, 4, 6].includes(decimalPlaces)) {
        this.decimalPlaces = decimalPlaces;
      }
    },

    // 소수점 자릿수 증가
    incDecimalPlaces() {
      this.setDecimalPlaces(this.decimalPlaces + 2);
    },

    // 소수점 자릿수 감소
    decDecimalPlaces() {
      this.setDecimalPlaces(this.decimalPlaces - 2);
    },

    // 단위 표시 토글
    toggleShowUnit(): void {
      this.showUnit = !this.showUnit;
    },

    // 기호 표시 토글
    toggleShowSymbol(): void {
      this.showSymbol = !this.showSymbol;
    },

    // 햅틱 피드백 모드 설정
    setHapticsMode(hapticsMode: boolean): void {
      this.hapticsMode = hapticsMode;
    },
  },

  // 상태 지속성 설정 (페이지 새로고침 후에도 상태 유지)
  persist: true,
});