/**
 * @file store.ts
 * @description 이 파일은 Pinia 스토어를 정의하고 관리하는 기능을 제공합니다.
 *              계산기, 단위 변환, 통화 변환 등 다양한 기능을 포함하며,
 *              애플리케이션의 상태를 관리하는 데 사용됩니다.
 *              상태 정의, 액션, 변이 등을 포함하여 UI와 비즈니스 로직을 연결합니다.
 */

// Pinia 관련
import { defineStore } from 'pinia';

// Quasar 관련
import { Dark, copyToClipboard, Screen } from 'quasar';

// 패턴 매칭 유틸리티
import { match } from 'ts-pattern';

// 계산기 관련 타입과 클래스 가져오기
import { Operator } from 'classes/Calculator';
import { Radix } from 'classes/RadixConverter';
import { Calculator } from 'classes/Calculator';
import { UnitConverter } from 'classes/UnitConverter';
import { CurrencyConverter } from 'classes/CurrencyConverter';
import { RadixConverter } from 'classes/RadixConverter';

import type { StoreState, DarkModeType, DecimalPlacesType, GroupingUnitType } from '../types/store';
import { DECIMAL_PLACES } from '../types/store.d';

// 유틸리티 함수들 가져오기
import { numberGrouping, formatDecimalPlaces } from '../classes/utils/NumberUtils';
import { showMessage } from '../classes/utils/NotificationUtils';

const radixConverter = new RadixConverter();

// 기본 스토어 정의
export const useStore = defineStore('store', {
  // 상태 정의
  state: (): StoreState => ({
    // 계산기 관련
    calc: new Calculator(),
    currentTab: 'calc',
    isMemoryVisible: false,
    resultPanelPadding: 0,
    paddingOnResult: 20,

    // UI 상태 관련
    isShiftPressed: false,
    isShiftLocked: false,
    inputFocused: false,
    initPanel: false,
    showButtonAddedLabel: true,
    hapticsMode: true,

    // 테마/디스플레이 관련
    darkMode: 'system',
    alwaysOnTop: false,

    // 계산 결과 관련
    isDeleteRecordConfirmOpen: false,
    recordLastScrollPosition: 0,
    isSearchOpen: false,
    searchKeyword: '',

    // 숫자 표시 관련
    useGrouping: true,
    groupingUnit: 3,
    decimalPlaces: -1,

    // 언어 관련
    useSystemLocale: true,
    locale: '',
    userLocale: '',

    // 단위 변환 관련
    selectedCategory: '',
    sourceUnits: {},
    targetUnits: {},
    showUnit: true,
    showSymbol: true,

    // 통화 변환 관련
    currencyConverter: new CurrencyConverter(),
    sourceCurrency: 'USD',
    targetCurrency: 'KRW',

    // 진법 변환 관련
    wordSize: 32,
    radixList: Object.values(Radix),
    sourceRadix: Radix.Decimal,
    targetRadix: Radix.Hexadecimal,
    showRadix: true,
    radixType: 'suffix',

    // 자동 업데이트 관련
    autoUpdate: true,

    // Snap 관련
    isSnapFirstRun: true,
  }),

  getters: {
    getDecimalPlaces: (state) => DECIMAL_PLACES[state.decimalPlaces ?? -1] ?? -1,
  },
  // 액션 정의
  actions: {
    // 탭 관리
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
        this.calc.currentRadix = this.sourceRadix;
      } else {
        this.calc.currentRadix = Radix.Decimal;
      }
    },

    // Shift 키 관련
    toggleShift(): void {
      this.isShiftPressed = !this.isShiftPressed;
    },

    enableShift(): void {
      this.isShiftPressed = true;
    },

    disableShift(): void {
      this.isShiftPressed = false;
    },

    toggleShiftLock(): void {
      this.isShiftLocked = !this.isShiftLocked;
    },

    enableShiftLock(): void {
      this.isShiftLocked = true;
    },

    disableShiftLock(): void {
      this.isShiftLocked = false;
    },

    // 메모리 표시 관련
    hideMemory(): void {
      this.isMemoryVisible = false;
    },

    showMemoryTemporarily(): void {
      this.isMemoryVisible = true;
      setTimeout(() => {
        this.isMemoryVisible = false;
      }, 2000);
    },

    // 숫자 포맷팅 관련
    toFormattedNumber(value: string, isTargetRadix: boolean = false): string {
      if (!value) return '';

      const formattedValue = formatDecimalPlaces(
        value,
        this.getDecimalPlaces,
        this.radixEnumToNumber(
          this.currentTab === 'radix' ? (isTargetRadix ? this.targetRadix : this.sourceRadix) : Radix.Decimal,
        ),
      );

      return this.useGrouping ? numberGrouping(formattedValue, this.groupingUnit) : formattedValue;
    },

    // 진법 변환 관련
    convertIfRadix(value: string): string {
      const isRadixMode = this.currentTab === 'radix';

      return isRadixMode ? this.convertRadix(value, Radix.Decimal, this.sourceRadix) : value;
    },

    convertRadix(value: string, fromRadix: Radix, toRadix: Radix): string {
      return radixConverter.convertRadix(value, fromRadix, toRadix);
    },

    validateRadixNumber(value: string, radix: Radix): boolean {
      return radixConverter.isValidRadixNumber(value, radix);
    },

    radixEnumToNumber(radix: Radix): number {
      return {
        [Radix.Binary]: 2,
        [Radix.Octal]: 8,
        [Radix.Decimal]: 10,
        [Radix.Hexadecimal]: 16,
      }[radix];
    },

    getRadixNumberToOrder(number: number): number {
      return { [2]: 0, [8]: 1, [10]: 2, [16]: 3 }[number] ?? -1;
    },

    getRadixPrefix(radix: Radix) {
      return ['0b', '0o', '0x', ''][this.getRadixNumberToOrder(this.radixEnumToNumber(radix))];
    },

    getRadixSuffix(radix: Radix) {
      return ['2', '8', '10', '16'][this.getRadixNumberToOrder(this.radixEnumToNumber(radix))];
    },

    initRecentRadix() {
      const availableRadixes = Object.values(Radix);
      const isValidRadixType = (radix: Radix) => availableRadixes.includes(radix);

      if (!isValidRadixType(this.sourceRadix)) {
        this.sourceRadix = Radix.Decimal;
      }
      if (!isValidRadixType(this.targetRadix)) {
        this.targetRadix = Radix.Hexadecimal;
      }
      if (this.sourceRadix === this.targetRadix) {
        this.targetRadix = this.radixList[
          (this.radixList.indexOf(this.sourceRadix) + 1) % this.radixList.length
        ] as Radix;
      }
    },

    swapRadixes() {
      [this.sourceRadix, this.targetRadix] = [this.targetRadix, this.sourceRadix];
    },

    updateWordSize(value: WordSize) {
      this.wordSize = value;
      this.calc.wordSize = value;
    },

    // 계산 기록 관련
    getLeftSideInRecord(result: CalculationResult, useLineBreak = false): string {
      const radixPrefix =
        this.currentTab === 'radix' && this.showRadix && this.radixType === 'prefix'
          ? this.getRadixPrefix(this.sourceRadix)
          : '';
      const radixSuffix =
        this.currentTab === 'radix' && this.showRadix && this.radixType === 'suffix'
          ? `(${this.getRadixSuffix(this.sourceRadix)})`
          : '';

      const lineBreak = useLineBreak ? '\n' : '';

      const prevValue = this.convertIfRadix(result.previousNumber);
      const argValue = result.argumentNumber ? this.convertIfRadix(result.argumentNumber) : '';
      const formattedPrev = radixPrefix + this.toFormattedNumber(prevValue) + radixSuffix;
      const formattedArg = radixPrefix + this.toFormattedNumber(argValue) + radixSuffix;
      const operator = Array.isArray(result.operator) ? result.operator[0] : result.operator || '';

      return match(operator)
        .with(
          Operator.ADD,
          Operator.SUB,
          Operator.MUL,
          Operator.DIV,
          Operator.MOD,
          (op) => `${formattedPrev}${lineBreak} ${op} ${formattedArg}`,
        )
        .with(Operator.BIT_NOT, () => `! ${formattedPrev}`)
        .with(Operator.BIT_AND, () => `${formattedPrev}${lineBreak} & ${formattedArg}`)
        .with(Operator.BIT_OR, () => `${formattedPrev}${lineBreak} | ${formattedArg}`)
        .with(Operator.BIT_XOR, () => `${formattedPrev}${lineBreak} ^ ${formattedArg}`)
        .with(Operator.BIT_NAND, () => `! (${formattedPrev}${lineBreak} & ${formattedArg})`)
        .with(Operator.BIT_NOR, () => `! (${formattedPrev}${lineBreak} | ${formattedArg})`)
        .with(Operator.BIT_XNOR, () => `! (${formattedPrev}${lineBreak} ^ ${formattedArg})`)
        .with(Operator.BIT_SFT_R, () => `${formattedPrev}${lineBreak} >> ${formattedArg}`)
        .with(Operator.BIT_SFT_L, () => `${formattedPrev}${lineBreak} << ${formattedArg}`)
        .with(Operator.POW, () => `${formattedPrev}${lineBreak} ^ ${formattedArg}`)
        .with(Operator.ROOT, () => `${formattedPrev}${lineBreak} ^ (1/${formattedArg})`)
        .with(Operator.PCT, () => {
          if (Array.isArray(result.operator) && result.operator[1] === Operator.DIV) {
            return `${formattedPrev}${lineBreak} / ${formattedArg}${lineBreak} × 100`;
          } else {
            return `${formattedPrev}${lineBreak} × ${formattedArg}%`;
          }
        })
        .with(Operator.REC, () => `1${lineBreak} ÷ ${formattedPrev}`)
        .with(Operator.POW2, () => `${formattedPrev} ^ 2`)
        .with(Operator.EXP10, () => `${this.toFormattedNumber('10')} ^ ${formattedPrev}`)
        .with(
          Operator.SQRT,
          Operator.SIN,
          Operator.COS,
          Operator.TAN,
          Operator.FCT,
          Operator.INT,
          Operator.FRAC,
          () => `${operator} ( ${formattedPrev} )`,
        )
        .otherwise(() => formattedPrev);
    },

    getRightSideInRecord(result: CalculationResult): string {
      const radixPrefix =
        this.currentTab === 'radix' && this.showRadix && this.radixType === 'prefix'
          ? this.getRadixPrefix(this.sourceRadix)
          : '';
      const radixSuffix =
        this.currentTab === 'radix' && this.showRadix && this.radixType === 'suffix'
          ? `(${this.getRadixSuffix(this.sourceRadix)})`
          : '';
      return radixPrefix + this.toFormattedNumber(this.convertIfRadix(result.resultNumber)) + radixSuffix;
    },

    // UI 포커스 관련
    blurElement(): void {
      const element = document.activeElement as HTMLElement;
      element?.blur();
    },

    clickButtonById(buttonId: string): void {
      const button = document.getElementById(buttonId);
      if (button) {
        button.click();
      }
    },

    setInputFocused(): void {
      setTimeout(() => {
        this.inputFocused = true;
      }, 10);
    },

    setInputBlurred(): void {
      this.inputFocused = false;
    },

    // 클립보드 관련
    copyToClipboard(text: string, message: string): void {
      copyToClipboard(text);
      showMessage(message);
    },

    // 단위 변환 관련
    initRecentUnits(): void {
      // 최근 카테고리가 설정되지 않은 경우, 첫 번째 카테고리로 설정
      if (this.selectedCategory === '') {
        this.selectedCategory = UnitConverter.getCategories()[0] ?? '';
      }

      // 변환 출발 단위가 설정되지 않은 경우, 각 카테고리의 첫 번째 단위로 설정
      if (Object.keys(this.sourceUnits).length === 0) {
        UnitConverter.getCategories().forEach((category) => {
          const units = UnitConverter.getUnitLists(category);
          this.sourceUnits[category] = units[0] ?? '';
        });
      }

      // 변환 도착 단위가 설정되지 않은 경우, 각 카테고리의 두 번째 단위(없으면 첫 번째)로 설정
      if (Object.keys(this.targetUnits).length === 0) {
        UnitConverter.getCategories().forEach((category) => {
          const units = UnitConverter.getUnitLists(category);
          this.targetUnits[category] = units[1] || units[0] || '';
        });
      }
    },

    swapUnits(): void {
      const temp = this.sourceUnits[this.selectedCategory];
      this.sourceUnits[this.selectedCategory] = this.targetUnits[this.selectedCategory] || '';
      this.targetUnits[this.selectedCategory] = temp || '';
    },

    // 다크모드 여부 얻기
    isDarkMode(): boolean {
      if (this.darkMode === 'system') {
        // 시스템 다크모드 상태 감지
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isDark;
      } else {
        return this.darkMode === 'dark';
      }
    },

    // 테마/디스플레이 설정
    setDarkMode(mode: DarkModeType) {
      this.darkMode = mode;
      this.updateDarkMode();
    },

    // 다크모드 상태 업데이트 메서드 추가
    updateDarkMode() {
      if (this.darkMode === 'system') {
        // 시스템 다크모드 상태 감지
        const isDark = this.isDarkMode();
        Dark.set(isDark);
      } else {
        Dark.set(this.darkMode === 'dark');
      }
    },

    toggleDarkMode() {
      const modes: DarkModeType[] = ['light', 'dark', 'system'];
      const currentIndex = modes.indexOf(this.darkMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      this.setDarkMode(nextMode as DarkModeType);
    },

    setAlwaysOnTop(isAlwaysOnTop: boolean) {
      this.alwaysOnTop = isAlwaysOnTop;
      window.electron.setAlwaysOnTop(this.alwaysOnTop);
    },

    toggleAlwaysOnTop() {
      this.setAlwaysOnTop(!this.alwaysOnTop);
    },

    setInitPanel(isInitPanel: boolean) {
      this.initPanel = isInitPanel;
    },

    toggleInitPanel() {
      this.setInitPanel(!this.initPanel);
    },

    // 숫자 표시 설정
    toggleUseGrouping() {
      this.useGrouping = !this.useGrouping;
    },

    setGroupingUnit(digitCount: GroupingUnitType) {
      this.groupingUnit = digitCount;
    },

    setDecimalPlaces(places: DecimalPlacesType) {
      this.decimalPlaces = places;
    },

    incrementDecimalPlaces() {
      this.decimalPlaces = Math.min(this.decimalPlaces + 1, Math.max(...Object.keys(DECIMAL_PLACES).map(Number)));
    },

    decrementDecimalPlaces() {
      this.decimalPlaces = Math.max(this.decimalPlaces - 1, Math.min(...Object.keys(DECIMAL_PLACES).map(Number)));
    },

    // UI 표시 설정
    toggleShowUnit(): void {
      this.showUnit = !this.showUnit;
    },

    toggleShowSymbol(): void {
      this.showSymbol = !this.showSymbol;
    },

    toggleShowRadix(): void {
      this.showRadix = !this.showRadix;
    },

    setRadixType(displayType: 'prefix' | 'suffix'): void {
      this.radixType = displayType;
    },

    toggleButtonAddedLabel() {
      this.showButtonAddedLabel = !this.showButtonAddedLabel;
    },

    // 햅틱 피드백 설정
    setHapticsMode(isEnabled: boolean): void {
      this.hapticsMode = isEnabled;
    },

    toggleHapticsMode(): void {
      this.setHapticsMode(!this.hapticsMode);
    },

    // 통화 변환 관련
    initRecentCurrencies(): void {
      const availableCurrencies = this.currencyConverter.getAvailableItems();
      // 출발 통화 초기화
      this.sourceCurrency =
        this.sourceCurrency !== '' && availableCurrencies.includes(this.sourceCurrency)
          ? this.sourceCurrency // 유효한 경우 기존 값 유지
          : 'USD'; // 유효하지 않은 경우 기본값 'USD'로 설정
      // 도착 통화 초기화
      this.targetCurrency =
        this.targetCurrency !== '' && availableCurrencies.includes(this.targetCurrency)
          ? this.targetCurrency // 유효한 경우 기존 값 유지
          : 'KRW'; // 유효하지 않은 경우 기본값 'KRW'로 설정
    },

    swapCurrencies(): void {
      [this.sourceCurrency, this.targetCurrency] = [this.targetCurrency, this.sourceCurrency];
    },

    // 전체 계산 결과 삭제 확인 다이얼로그 표시 여부
    setDeleteRecordConfirmOpen(value: boolean) {
      this.isDeleteRecordConfirmOpen = value;
    },

    // 화면이 세로인지 확인
    isPortrait() {
      return Screen.width < Screen.height;
    },

    // 화면이 가로인지 확인
    isLandscape() {
      return !this.isPortrait();
    },

    // 넓은 너비 여부 확인
    isWideWidth() {
      if (window.isTablet) {
        // 태블릿은 가로 모드만 지원
        return this.isLandscape();
      } else if (window.isPhone) {
        // 폰은 넓은 너비 지원 안함
        return false;
      } else {
        // 데스크탑은 넓은 너비 여부 확인
        return Screen.width >= 330 * 2;
      }
    },

    // 기본 계산기 여부 확인
    isDefaultCalculator(): boolean {
      return this.currentTab === 'calc';
    },

    // 자동 업데이트 관련
    setAutoUpdate(value: boolean) {
      this.autoUpdate = value;
    },

    toggleAutoUpdate() {
      this.setAutoUpdate(!this.autoUpdate);
    },
  },

  // 상태 지속성 설정
  persist: true,
});

export default useStore;
