import { defineStore } from 'pinia';
import { Dark } from 'quasar';

// 설정 관련 상태와 동작을 관리하는 스토어 정의
export const useStoreSettings = defineStore('settings', {
  // 상태 정의
  state: () => ({
    darkMode: false, // 다크 모드 상태
    alwaysOnTop: false, // 항상 위에 표시 상태
    useGrouping: true, // 숫자 그룹화 사용 여부
    groupingUnit: 3 as 3 | 4, // 숫자 그룹화 단위 갯수 (3, 4)
    decimalPlaces: -2, // 소수점 자릿수 (-2는 자동)
    useSystemLocale: true, // 시스템 로케일 사용 여부
    locale: '', // 현재 로케일
    userLocale: '', // 사용자 지정 로케일
    initPanel: false, // 초기 패널 표시 여부
    showUnit: true, // 단위 표시 여부
    showSymbol: true, // 기호 표시 여부
    // 진법 표시 방법 (기본, 접두사, 접미사)
    showRadix: true,
    // 진법 표시 형식 - 앞에(0xff, 0o765, 0b1010 등), 뒤에(ff(16), 765(8), 1010(2) 등)
    radixType: 'suffix' as 'prefix' | 'suffix',
    paddingOnResult: 20, // 결과 패딩 값
    showButtonAddedLabel: true, // 버튼 추가 레이블 표시 여부
    hapticsMode: true, // 햅틱 피드백 모드
  }),

  // 액션 정의
  actions: {
    // 다크 모드 설정
    setDarkMode(isDark: boolean) {
      this.darkMode = isDark;
      Dark.set(this.darkMode);
    },

    // 다크 모드 토글
    toggleDarkMode() {
      this.setDarkMode(!this.darkMode);
    },

    // 항상 위에 표시 설정
    setAlwaysOnTop(isAlwaysOnTop: boolean) {
      this.alwaysOnTop = isAlwaysOnTop;
      window.myAPI.setAlwaysOnTop(this.alwaysOnTop);
    },

    // 항상 위에 표시 토글
    toggleAlwaysOnTop() {
      this.setAlwaysOnTop(!this.alwaysOnTop);
    },

    // 초기 패널 설정
    setInitPanel(isInitPanel: boolean) {
      this.initPanel = isInitPanel;
    },

    // 초기 패널 토글
    toggleInitPanel() {
      this.setInitPanel(!this.initPanel);
    },

    // 숫자 그룹화 사용 토글
    toggleUseGrouping() {
      this.useGrouping = !this.useGrouping;
    },

    // 숫자 그룹화 단위 설정
    setGroupingUnit(digitCount: 3 | 4) {
      this.groupingUnit = digitCount;
    },

    // 버튼 추가 레이블 표시 토글
    toggleButtonAddedLabel() {
      this.showButtonAddedLabel = !this.showButtonAddedLabel;
    },

    // 소수점 자릿수 설정
    setDecimalPlaces(places: number) {
      if ([-2, 0, 2, 4, 6].includes(places)) {
        this.decimalPlaces = places;
      }
    },

    // 소수점 자릿수 증가
    incrementDecimalPlaces() {
      this.setDecimalPlaces(this.decimalPlaces + 2);
    },

    // 소수점 자릿수 감소
    decrementDecimalPlaces() {
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

    // 진법 표시 토글
    toggleShowRadix(): void {
      this.showRadix = !this.showRadix;
    },

    // 진법 표시 형식 설정
    setRadixType(displayType: 'prefix' | 'suffix'): void {
      this.radixType = displayType;
    },

    // 햅틱 피드백 모드 설정
    setHapticsMode(isEnabled: boolean): void {
      this.hapticsMode = isEnabled;
    },

    // 햅틱 피드백 모드 토글
    toggleHapticsMode(): void {
      this.setHapticsMode(!this.hapticsMode);
    },
  },

  // 상태 지속성 설정 (페이지 새로고침 후에도 상태 유지)
  persist: true,
});
