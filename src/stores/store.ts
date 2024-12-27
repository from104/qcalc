import { defineStore } from 'pinia';
import { Notify, Dark, copyToClipboard } from 'quasar';
import { match } from 'ts-pattern';
import { useRoute, useRouter } from 'vue-router';

import { WordSize, Operator, CalculationResult } from 'classes/CalculatorTypes';
import { Calculator } from 'classes/Calculator';
import { UnitConverter } from 'classes/UnitConverter';
import { CurrencyConverter } from 'classes/CurrencyConverter';
import { RadixConverter, Radix, RadixType } from 'src/classes/RadixConverter';

const radixConverter = new RadixConverter();

// darkMode 타입 정의 추가
type DarkModeType = 'system' | 'light' | 'dark';

// 기본 스토어 정의
export const useStore = defineStore('store', {
  // 상태 정의
  state: () => ({
    // 계산기 관련
    calc: new Calculator(),
    currentTab: 'calc',
    isHistoryDialogOpen: false,
    isMemoryVisible: false,
    resultPanelPadding: 0,
    paddingOnResult: 20,

    // // Vue Router 관련
    // router: useRouter(),
    // route: useRoute(),

    // UI 상태 관련
    isSettingDialogOpen: false,
    isShiftPressed: false,
    isShiftLocked: false,
    inputFocused: false,
    initPanel: false,
    showButtonAddedLabel: true,
    hapticsMode: true,

    // 테마/디스플레이 관련
    darkMode: 'system' as DarkModeType,
    alwaysOnTop: false,

    // 계산 결과 관련
    // 전체 계산 결과 삭제 확인 다이얼로그 표시 여부
    isDeleteHistoryConfirmOpen: false,
    // 계산 결과 창 스크롤 위치 저장
    historyLastScrollPosition: 0,

    // 숫자 표시 관련
    useGrouping: true,
    groupingUnit: 3 as 3 | 4,
    decimalPlaces: -2,
    useSystemLocale: true,
    locale: '',
    userLocale: '',

    // 단위 변환 관련
    selectedCategory: '',
    sourceUnits: {} as { [key: string]: string },
    targetUnits: {} as { [key: string]: string },
    showUnit: true,
    showSymbol: true,

    // 통화 변환 관련
    converter: new CurrencyConverter(),
    sourceCurrency: 'USD',
    targetCurrency: 'KRW',

    // 진법 변환 관련
    wordSize: 32 as WordSize,
    radixList: Object.values(Radix),
    sourceRadix: Radix.Decimal as RadixType,
    targetRadix: Radix.Hexadecimal as RadixType,
    showRadix: true,
    radixType: 'suffix' as 'prefix' | 'suffix',
  }),

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
        this.calc.radix = this.sourceRadix;
      } else {
        this.calc.radix = Radix.Decimal;
      }
    },

    // Shift 키 관련
    toggleShift(): void {
      console.log('toggleShift');
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
    numberGrouping(value: string): string {
      const [integerPart, decimalPart] = value.split('.');
      const groupingPattern = new RegExp(`\\B(?=([\\da-fA-F]{${this.groupingUnit}})+(?![\\da-fA-F]))`, 'g');
      return integerPart.replace(groupingPattern, ',') + (decimalPart ? `.${decimalPart}` : '');
    },

    formatDecimalPlaces(value: string, decimalPlaces: number): string {
      if (!value) return '';
      if (decimalPlaces < 0) return value;
      if (decimalPlaces === 0) return value.split('.')[0];

      // 소수점이 없는 경우 처리
      if (!value.includes('.')) {
        return decimalPlaces > 0 ? `${value}.${'0'.repeat(decimalPlaces)}` : value;
      }

      // 소수점이 있는 경우 처리
      const [integerPart, decimalPart] = value.split('.');
      const formattedDecimal = decimalPart.slice(0, decimalPlaces).padEnd(decimalPlaces, '0');

      return `${integerPart}.${formattedDecimal}`;
    },

    toFormattedNumber(value: string): string {
      if (!value) return '';

      const formattedValue = this.formatDecimalPlaces(value, this.decimalPlaces);

      return this.useGrouping ? this.numberGrouping(formattedValue) : formattedValue;
    },

    // 진법 ��환 관련
    convertIfRadix(value: string): string {
      const isRadixMode = this.currentTab === 'radix';

      return isRadixMode ? this.convertRadix(value, Radix.Decimal, this.sourceRadix) : value;
    },

    convertRadix(value: string, fromRadix: RadixType, toRadix: RadixType): string {
      return radixConverter.convertRadix(value, fromRadix, toRadix);
    },

    validateRadixNumber(value: string, radix: RadixType): boolean {
      return radixConverter.isValidRadixNumber(value, radix);
    },

    getRadixPrefix(radix: RadixType) {
      return {
        [Radix.Binary]: '0b',
        [Radix.Octal]: '0o',
        [Radix.Hexadecimal]: '0x',
        [Radix.Decimal]: '',
      }[radix];
    },

    getRadixSuffix(radix: RadixType) {
      return {
        [Radix.Binary]: '2',
        [Radix.Octal]: '8',
        [Radix.Hexadecimal]: '16',
        [Radix.Decimal]: '10',
      }[radix];
    },

    initRecentRadix() {
      const availableRadixes = Object.values(Radix);
      const isValidRadixType = (radix: RadixType) => availableRadixes.includes(radix);

      if (!isValidRadixType(this.sourceRadix)) {
        this.sourceRadix = Radix.Decimal;
      }
      if (!isValidRadixType(this.targetRadix)) {
        this.targetRadix = Radix.Hexadecimal;
      }
      if (this.sourceRadix === this.targetRadix) {
        this.targetRadix = this.radixList[(this.radixList.indexOf(this.sourceRadix) + 1) % this.radixList.length];
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
    getLeftSideInHistory(result: CalculationResult, useLineBreak = false): string {
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

    getRightSideInHistory(result: CalculationResult): string {
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
      this.showMessage(message);
    },

    // 단위 변환 관련
    initRecentUnits(): void {
      // 최근 카테고리가 설정되지 않은 경우, 첫 번째 카테고리로 설정
      if (this.selectedCategory === '') {
        this.selectedCategory = UnitConverter.categories[0];
      }

      // 변환 출발 단위가 설정되지 않은 경우, 각 카테고리의 첫 번째 단위로 설정
      if (Object.keys(this.sourceUnits).length === 0) {
        UnitConverter.categories.forEach((category) => {
          const units = UnitConverter.getUnitLists(category);
          this.sourceUnits[category] = units[0];
        });
      }

      // 변환 도착 단위가 설정되지 않은 경우, 각 카테고리의 두 번째 단위(없으면 첫 번째)로 설정
      if (Object.keys(this.targetUnits).length === 0) {
        UnitConverter.categories.forEach((category) => {
          const units = UnitConverter.getUnitLists(category);
          this.targetUnits[category] = units[1] || units[0];
        });
      }
    },

    swapUnits(): void {
      const temp = this.sourceUnits[this.selectedCategory];
      this.sourceUnits[this.selectedCategory] = this.targetUnits[this.selectedCategory];
      this.targetUnits[this.selectedCategory] = temp;
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
      this.setDarkMode(nextMode);
    },

    setAlwaysOnTop(isAlwaysOnTop: boolean) {
      this.alwaysOnTop = isAlwaysOnTop;
      window.myAPI.setAlwaysOnTop(this.alwaysOnTop);
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

    setGroupingUnit(digitCount: 3 | 4) {
      this.groupingUnit = digitCount;
    },

    setDecimalPlaces(places: number) {
      if ([-2, 0, 2, 4, 6].includes(places)) {
        this.decimalPlaces = places;
      }
    },

    incrementDecimalPlaces() {
      this.setDecimalPlaces(this.decimalPlaces + 2);
    },

    decrementDecimalPlaces() {
      this.setDecimalPlaces(this.decimalPlaces - 2);
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
      const availableCurrencies = this.converter.getCurrencyLists();
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

    // 알림 관련
    showMessage(
      message: string, // 표시할 메시지 내용
      duration = 1000, // 알림 표시 시간 (기본값: 1000ms)
      position:
        | 'top'
        | 'top-left'
        | 'top-right'
        | 'bottom-left'
        | 'bottom-right'
        | 'bottom'
        | 'left'
        | 'right'
        | 'center'
        | undefined = 'top', // 알림 위치 (기본값: 'top')
    ): void {
      Notify.create({
        message, // 메시지 내용
        position, // 알림 위치
        timeout: duration, // 표시 시간
        color: 'positive', // 알림 색상 (긍정적인 메시지)
      });
    },

    showError(
      message: string, // 표시할 오류 메시지 내용
      duration = 500, // 알림 표시 시간 (기본값: 500ms)
      position:
        | 'top'
        | 'top-left'
        | 'top-right'
        | 'bottom-left'
        | 'bottom-right'
        | 'bottom'
        | 'left'
        | 'right'
        | 'center'
        | undefined = 'top', // 알림 위치 (기본값: 'top')
    ): void {
      Notify.create({
        message, // 오류 메시지 내용
        position, // 알림 위치
        timeout: duration, // 표시 시간
        color: 'negative', // 알림 색상 (부정적인 메시지)
      });
    },

    // 전체 계산 결과 삭제 확인 다이얼로그 표시 여부
    setDeleteHistoryConfirmOpen(value: boolean) {
      this.isDeleteHistoryConfirmOpen = value;
    },
  },

  // 상태 지속성 설정
  persist: true,
});

export default useStore;
