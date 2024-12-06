import { defineStore } from 'pinia';
import { Notify, Dark, copyToClipboard } from 'quasar';
import { match } from 'ts-pattern';

import { WordSize, Operator, CalculationResult } from 'classes/CalculatorTypes';
import { Calculator } from 'classes/Calculator';
import { UnitConverter } from 'classes/UnitConverter';
import { CurrencyConverter } from 'classes/CurrencyConverter';
import { RadixConverter, Radix, RadixType } from 'src/classes/RadixConverter';

const radixConverter = new RadixConverter();

// 기본 스토어 정의
export const useStore = defineStore('store', {
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
    selectedCategory: '', // 최근 선택한 카테고리
    sourceUnits: {} as { [key: string]: string }, // 각 카테고리별 최근 선택한 변환 출발 단위
    targetUnits: {} as { [key: string]: string }, // 각 카테고리별 최근 선택한 변환 도착 단위
    converter: new CurrencyConverter(), // 통화 변환기 인스턴스
    sourceCurrency: 'USD', // 최근 사용한 출발 통화
    targetCurrency: 'KRW', // 최근 사용한 도착 통화
    wordSize: 32 as WordSize, // 비트 크기
    radixList: Object.values(Radix), // 진법 목록
    sourceRadix: Radix.Decimal as RadixType, // 기본 진법
    targetRadix: Radix.Hexadecimal as RadixType, // 보조 진법
    inputFocused: false, // 입력 필드 포커스 상태
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
        this.calc.radix = this.sourceRadix;
      } else {
        this.calc.radix = Radix.Decimal;
      }
    },

    // Shift 버튼 토글
    toggleShift(): void {
      console.log('toggleShift');
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

    // 숫자에 그룹화 적용
    numberGrouping(value: string): string {
      const [integerPart, decimalPart] = value.split('.');
      const groupingPattern = new RegExp(`\\B(?=([\\da-fA-F]{${this.groupingUnit}})+(?![\\da-fA-F]))`, 'g');
      return integerPart.replace(groupingPattern, ',') + (decimalPart ? `.${decimalPart}` : '');
    },
    /**
     * 숫자의 소수점 자릿수를 조정하는 함수
     *
     * @param value 변환할 숫자 문자열 (예: "100.123456789")
     * @param decimalPlaces 원하는 소수점 자릿수 (음수는 모든 자릿수 표시, 0은 정수부만 표시, 양수는 지정된 자릿수까지 표시)
     * @returns 지정된 소수점 자릿수로 변환된 문자열
     *
     * @description
     * - decimalPlaces가 음수인 경우: 모든 소수점 자릿수 표시
     * - decimalPlaces가 0인 경우: 정수부만 표시
     * - decimalPlaces가 양수인 경우: 지정된 자릿수까지 표시
     * @example
     * formatDecimalPlaces('100.123456789', -2) => '100.123456789'
     * formatDecimalPlaces('100.123456789', 0) => '100'
     * formatDecimalPlaces('100.123456789', 2) => '100.12'
     * formatDecimalPlaces('100.123', 5) => '100.12300'
     */
    /**
     * 숫자 문자열의 소수점 자릿수를 지정된 값으로 포맷팅하는 메서드
     * @param value 포맷팅할 숫자 문자열
     * @param decimalPlaces 표시할 소수점 자릿수 (-1: 모두 표시, 0: 정수만, n: n자리)
     */
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

    /**
     * 숫자 문자열을 설정에 따라 포맷팅하여 반환하는 메서드
     * @param value 포맷팅할 숫자 문자열
     */
    toFormattedNumber(value: string): string {
      if (!value) return '';

      const formattedValue = this.formatDecimalPlaces(value, this.decimalPlaces);

      return this.useGrouping ? this.numberGrouping(formattedValue) : formattedValue;
    },

    // 라디스 모드인 경우 숫자를 10진수로 변환하는 메서드
    convertIfRadix(value: string): string {
      const isRadixMode = this.currentTab === 'radix';

      return isRadixMode ? this.convertRadix(value, Radix.Decimal, this.sourceRadix) : value;
    },

    // 계산 기록의 왼쪽 부분 생성
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
      const operator = result.operator || '';

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

    // 계산 기록의 오른쪽 부분 생성
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

    // 현재 포커스된 요소의 포커스 해제
    blurElement(): void {
      const element = document.activeElement as HTMLElement;
      element?.blur();
    },

    // 지정된 ID를 가진 버튼 클릭
    clickButtonById(buttonId: string): void {
      const button = document.getElementById(buttonId);
      if (button) {
        button.click();
      }
    },

    // 텍스트를 클립보드에 복사하고 알림 표시
    copyToClipboard(text: string, message: string): void {
      copyToClipboard(text);
      this.showMessage(message);
    },

    // 입력 필드 포커스 상태 설정 (약간의 지연 적용)
    setInputFocused(): void {
      setTimeout(() => {
        this.inputFocused = true;
      }, 10);
    },

    // 입력 필드 포커스 해제 상태 설정
    setInputBlurred(): void {
      this.inputFocused = false;
    },

    // 최근 카테고리와 단위 초기화
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

    // 현재 카테고리의 변환 출발 단위와 도착 단위 교환
    swapUnits(): void {
      const temp = this.sourceUnits[this.selectedCategory];
      this.sourceUnits[this.selectedCategory] = this.targetUnits[this.selectedCategory];
      this.targetUnits[this.selectedCategory] = temp;
    },
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
    // 최근 진법 초기화
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

    // 진법 교환
    swapRadixes() {
      [this.sourceRadix, this.targetRadix] = [this.targetRadix, this.sourceRadix];
    },

    // 문자열을 원하는 진법으로 변환
    convertRadix(value: string, fromRadix: RadixType, toRadix: RadixType): string {
      return radixConverter.convertRadix(value, fromRadix, toRadix);
    },

    // 문자열이 유효한 진법 문자열인지 검사
    validateRadixNumber(value: string, radix: RadixType): boolean {
      return radixConverter.isValidRadixNumber(value, radix);
    },

    // 워드 크기 설정
    updateWordSize(value: WordSize) {
      this.wordSize = value;
      this.calc.wordSize = value;
    },

    // 진법 접두사 얻기
    getRadixPrefix(radix: RadixType) {
      return {
        [Radix.Binary]: '0b',
        [Radix.Octal]: '0o',
        [Radix.Hexadecimal]: '0x',
        [Radix.Decimal]: '',
      }[radix];
    },

    // 진법 접미사 얻기
    getRadixSuffix(radix: RadixType) {
      return {
        [Radix.Binary]: '2',
        [Radix.Octal]: '8',
        [Radix.Hexadecimal]: '16',
        [Radix.Decimal]: '10',
      }[radix];
    },
    // 일반 메시지 알림을 표시하는 함수
    showMessage(
      message: string, // 표시할 메시지 내용
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
        message, // 메시지 내용
        position, // 알림 위치
        timeout: duration, // 표시 시간
        color: 'positive', // 알림 색상 (긍정적인 메시지)
      });
    },

    // 오류 메시지 알림을 표시하는 함수
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
    // 최근 사용한 통화 초기화
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

    // 출발 통화와 도착 통화 교환
    swapCurrencies(): void {
      [this.sourceCurrency, this.targetCurrency] = [this.targetCurrency, this.sourceCurrency];
    },
  },

  // 상태 지속성 설정
  persist: true,
});
