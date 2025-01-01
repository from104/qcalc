import { Calculator } from 'classes/Calculator';
import { CurrencyConverter } from 'classes/CurrencyConverter';
import { WordSize, CalculationResult } from 'src/types/calculator';
import { RadixType } from 'src/classes/RadixConverter';
import { Router, RouteLocationNormalizedLoaded } from 'vue-router';
import { StoreDefinition } from 'pinia';

declare global {
  /**
   * 다크모드 설정 타입
   */
  declare type DarkModeType = 'system' | 'light' | 'dark';

  /**
   * 스토어의 상태 인터페이스
   */
  declare interface StoreState {
    // 계산기 관련
    calc: Calculator;
    currentTab: string;
    isMemoryVisible: boolean;
    resultPanelPadding: number;
    paddingOnResult: number;

    // UI 상태 관련
    isShiftPressed: boolean;
    isShiftLocked: boolean;
    inputFocused: boolean;
    initPanel: boolean;
    showButtonAddedLabel: boolean;
    hapticsMode: boolean;

    // 테마/디스플레이 관련
    darkMode: DarkModeType;
    alwaysOnTop: boolean;

    // 계산 결과 관련
    isDeleteRecordConfirmOpen: boolean;
    recordLastScrollPosition: number;

    // 숫자 표시 관련
    useGrouping: boolean;
    groupingUnit: 3 | 4;
    decimalPlaces: number;
    useSystemLocale: boolean;
    locale: string;
    userLocale: string;

    // 단위 변환 관련
    selectedCategory: string;
    sourceUnits: { [key: string]: string };
    targetUnits: { [key: string]: string };
    showUnit: boolean;
    showSymbol: boolean;

    // 통화 변환 관련
    converter: CurrencyConverter;
    sourceCurrency: string;
    targetCurrency: string;

    // 진법 변환 관련
    wordSize: WordSize;
    radixList: RadixType[];
    sourceRadix: RadixType;
    targetRadix: RadixType;
    showRadix: boolean;
    radixType: 'prefix' | 'suffix';
  }

  /**
   * 스토어의 액션 인터페이스
   */
  declare interface StoreActions {
    // 탭 관리
    setCurrentTab(tab: string): void;
    updateCalculatorRadix(): void;

    // Shift 키 관련
    toggleShift(): void;
    enableShift(): void;
    disableShift(): void;
    toggleShiftLock(): void;
    enableShiftLock(): void;
    disableShiftLock(): void;

    // 메모리 표시 관련
    hideMemory(): void;
    showMemoryTemporarily(): void;

    // 숫자 포맷팅 관련
    numberGrouping(value: string): string;
    formatDecimalPlaces(value: string, decimalPlaces: number): string;
    toFormattedNumber(value: string): string;

    // 진법 변환 관련
    convertIfRadix(value: string): string;
    convertRadix(value: string, fromRadix: RadixType, toRadix: RadixType): string;
    validateRadixNumber(value: string, radix: RadixType): boolean;
    getRadixPrefix(radix: RadixType): string;
    getRadixSuffix(radix: RadixType): string;
    initRecentRadix(): void;
    swapRadixes(): void;
    updateWordSize(value: WordSize): void;

    // 계산 기록 관련
    getLeftSideInRecord(result: CalculationResult, useLineBreak?: boolean): string;
    getRightSideInRecord(result: CalculationResult): string;

    // UI 포커스 관련
    blurElement(): void;
    clickButtonById(buttonId: string): void;
    setInputFocused(): void;
    setInputBlurred(): void;

    // 클립보드 관련
    copyToClipboard(text: string, message: string): void;

    // 단위 변환 관련
    initRecentUnits(): void;
    swapUnits(): void;

    // 다크모드 관련
    isDarkMode(): boolean;
    setDarkMode(mode: DarkModeType): void;
    updateDarkMode(): void;
    toggleDarkMode(): void;

    // 디스플레이 설정 관련
    setAlwaysOnTop(isAlwaysOnTop: boolean): void;
    toggleAlwaysOnTop(): void;
    setInitPanel(isInitPanel: boolean): void;
    toggleInitPanel(): void;

    // 숫자 표시 설정
    toggleUseGrouping(): void;
    setGroupingUnit(digitCount: 3 | 4): void;
    setDecimalPlaces(places: number): void;
    incrementDecimalPlaces(): void;
    decrementDecimalPlaces(): void;

    // UI 표시 설정
    toggleShowUnit(): void;
    toggleShowSymbol(): void;
    toggleShowRadix(): void;
    setRadixType(displayType: 'prefix' | 'suffix'): void;
    toggleButtonAddedLabel(): void;

    // 햅틱 피드백 설정
    setHapticsMode(isEnabled: boolean): void;
    toggleHapticsMode(): void;

    // 통화 변환 관련
    initRecentCurrencies(): void;
    swapCurrencies(): void;

    // 알림 관련
    showMessage(
      message: string,
      duration?: number,
      position?:
        | 'top'
        | 'top-left'
        | 'top-right'
        | 'bottom-left'
        | 'bottom-right'
        | 'bottom'
        | 'left'
        | 'right'
        | 'center',
    ): void;
    showError(
      message: string,
      duration?: number,
      position?:
        | 'top'
        | 'top-left'
        | 'top-right'
        | 'bottom-left'
        | 'bottom-right'
        | 'bottom'
        | 'left'
        | 'right'
        | 'center',
    ): void;

    // 기타
    setDeleteRecordConfirmOpen(value: boolean): void;
    isAtLeastDoubleWidth(): boolean;
    isDefaultCalculator(): boolean;
    navigateToPath(path: string, route: RouteLocationNormalizedLoaded, router: Router): void;
    setSubPageAnimating(value: boolean): void;
  }

  /**
   * 스토어 인터페이스
   */
  type Store = StoreDefinition<'store', StoreState, Record<never, never>, StoreActions>;
}

export { };
