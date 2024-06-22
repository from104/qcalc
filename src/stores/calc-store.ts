import {defineStore} from 'pinia';
import {Dark, Notify, copyToClipboard} from 'quasar';
import {create, all} from 'mathjs';

import {Calculator} from 'classes/Calculator';
import type {History} from 'classes/Calculator';

import {UnitConverter} from 'classes/UnitConverter';
import {CurrencyConverter} from 'classes/CurrencyConverter';

const MathB = create(all, {
  number: 'BigNumber',
  precision: 64,
}) as math.MathJsStatic;

export const useCalcStore = defineStore('calc', {
  state: () => ({
    // 계산기 클래스
    calc: new Calculator(),
    // 다크 모드 여부
    darkMode: false,
    // 항상 위 여부
    alwaysOnTop: false,
    // 숫자 그루핑 여부
    useGrouping: true,
    // 소수점 자리 (-2: 제한 없음)
    decimalPlaces: -2,
    // 시스템 로케일 사용 여부
    useSystemLocale: true,
    // 시스템 로케일
    locale: '',
    // 사용자 로케일
    userLocale: '',
    // 최근 단위 변환 범주
    recentCategory: '',
    // 최근 단위 변환 단위
    recentUnitFrom: {} as {[key: string]: string},
    recentUnitTo: {} as {[key: string]: string},
    // 시작시 패널 초기화 여부
    initPanel: false,
    // 환율 계산기
    currencyConverter: new CurrencyConverter(),
    // 환율 계산기 - 최근 '환율 계산' 탭에서 선택한 통화
    recentCurrencyFrom: '',
    recentCurrencyTo: '',
    // 입력 필드가 포커스를 받았는지 여부
    inputFocused: false,
    // 단위 변환기에서 단위를 표시할지 여부
    showUnit: true,
    // 통화 변환기에서 통화 기호를 표시할지 여부
    showSymbol: true,
    // 패널 숫자 위 여백
    paddingOnResult: 20,
    // 현재 계산기 탭
    cTab: 'calc',
    // history dialog가 열렸는지 여부
    isHistoryDialogOpen: false,
    // setting dialog가 열렸는지 여부
    isSettingDialogOpen: false,
    // 버튼의 추가 라벨 표시 여부
    showButtonAddedLabel: true,
    // 계산기 버튼의 추가 기능 여부
    buttonShift: false,
    // 계산기 버튼의 추가 기능 잠금
    buttonShiftLock: false,
  }),
  getters: {},
  actions: {
    setDarkMode(darkMode: boolean) {
      this.darkMode = darkMode;
      Dark.set(this.darkMode);
    },
    toggleDarkMode() {
      this.setDarkMode(!this.darkMode);
    },
    setAlwaysOnTop(alwaysOnTop: boolean) {
      this.alwaysOnTop = alwaysOnTop;
      window.myAPI.setAlwaysOnTop(this.alwaysOnTop);
    },
    setInitPanel(initPanel: boolean) {
      this.initPanel = initPanel;
    },
    toggleAlwaysOnTop() {
      this.setAlwaysOnTop(!this.alwaysOnTop);
    },
    toggleInitPanel() {
      this.setInitPanel(!this.initPanel);
    },
    toggleUseGrouping() {
      this.useGrouping = !this.useGrouping;
    },
    toggleButtonAddedLabel() {
      this.showButtonAddedLabel = !this.showButtonAddedLabel;
    },
    setDecimalPlaces(decimalPlaces: number) {
      if ([-2, 0, 2, 4, 6].includes(decimalPlaces)) {
        this.decimalPlaces = decimalPlaces;
      }
    },
    incDecimalPlaces() {
      this.setDecimalPlaces(this.decimalPlaces + 2);
    },
    decDecimalPlaces() {
      this.setDecimalPlaces(this.decimalPlaces - 2);
    },
    // 숫자를 구분자로 그루핑하는 함수
    numberGrouping(number: string, grouping: number = 3, separator: string = ',') {
      const [integer, decimal] = number.split('.'),
        regex = new RegExp(`\\B(?=(\\d{${grouping}})+(?!\\d))`, 'g');
      return integer.replace(regex, separator) + (decimal ? `.${decimal}` : '');
    },
    // 숫자를 표준 로케일 문자열로 변환하는 함수
    toFormattedNumber(number: string): string {
      const bignumber = MathB.bignumber(number);
      const formattedNumber = MathB.format(bignumber, {
        precision: this.decimalPlaces === -2 ? 64 : this.decimalPlaces,
        notation: this.decimalPlaces === -2 ? 'auto' : 'fixed',
        lowerExp: -64,
        upperExp: 64,
      });
      return this.useGrouping ? this.numberGrouping(formattedNumber) : formattedNumber;
    },
    // 계산 결과 중 좌변
    getLeftSideInHistory(h: History, lf = false) {
      const br = lf ? '\n' : '';
      if (['+', '-', '×', '÷', 'mod'].includes(h.operator)) {
        // 사칙연산
        return `${this.toFormattedNumber(h.previousNumber)}${br} ${h.operator} ${this.toFormattedNumber(h.argumentNumber ?? '')}`;
      } else if (h.operator == 'pow') {
        // N제곱
        return `${this.toFormattedNumber(h.previousNumber)}${br} ^ ${this.toFormattedNumber(h.argumentNumber ?? '')}`;
      } else if (h.operator == 'root') {
        // N제곱근
        return `${this.toFormattedNumber(h.previousNumber)}${br} ^ (1/${this.toFormattedNumber(h.argumentNumber ?? '')})`;
      } else if (h.operator == '÷%') {
        // 퍼센트로 나누는 경우
        return `${this.toFormattedNumber(h.previousNumber)}${br} ÷ ${this.toFormattedNumber(h.argumentNumber ?? '')}${br} × 100`;
      } else if (h.operator == '×%') {
        // 퍼센트로 곱하는 경우
        return `${this.toFormattedNumber(h.previousNumber)}${br} × ${this.toFormattedNumber(h.argumentNumber ?? '')}${br} ÷ 100`;
      } else if (h.operator == 'rec') {
        // 역수
        return `1${br} ÷ ${this.toFormattedNumber(h.previousNumber)}`;
      } else if (h.operator == 'pow2') {
        // 제곱
        return `${this.toFormattedNumber(h.previousNumber)} ^ 2`;
      } else if (h.operator == 'exp10') {
        // 10의 N제곱
        return `${this.toFormattedNumber('10')} ^ ${this.toFormattedNumber(h.previousNumber)}`;
      } else if (['sqrt', 'sin', 'cos', 'tan', 'fct', 'int', 'frac'].includes(h.operator)) {
        // 제곱근 및 삼각함수 등
        return `${h.operator} ( ${this.toFormattedNumber(h.previousNumber)} )`;
      } else {
        // 그 외
        return this.toFormattedNumber(h.previousNumber);
      }
    },
    // 계산 결과 중 우변
    getRightSideInHistory(h: History) {
      return this.toFormattedNumber(h.resultNumber);
    },
    // 알림을 띄우는 함수 - 메시지
    notifyMsg(
      msg: string,
      timeout = 500,
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
        | undefined = 'top',
    ): void {
      Notify.create({
        message: msg,
        position: position,
        timeout: timeout,
        color: 'positive',
      });
    },
    // 알림을 띄우는 함수 - 에러
    notifyError(
      msg: string,
      timeout = 500,
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
        | undefined = 'top',
    ): void {
      Notify.create({
        message: msg,
        position: position,
        timeout: timeout,
        color: 'negative',
      });
    },
    // 클립보드에 복사하는 함수
    copyToClipboard(text: string, message: string): void {
      copyToClipboard(text);
      this.notifyMsg(message);
    },
    // 요소의 포커스를 해제하는 함수
    blurElement(): void {
      const el = document.activeElement as HTMLElement;
      el?.blur();
    },
    // 입력 필드가 포커스를 받았다고 셋팅하는 함수
    setInputFocused(): void {
      setTimeout(() => {
        this.inputFocused = true;
      }, 10);
    },
    // 입력 필드가 포커스를 잃었다고 셋팅하는 함수
    setInputBlurred(): void {
      this.inputFocused = false;
    },
    showUnitToggle(): void {
      this.showUnit = !this.showUnit;
    },
    showSymbolToggle(): void {
      this.showSymbol = !this.showSymbol;
    },
    // id가 있는 버튼의 클릭 이벤트를 에뮬레이트 하기 위한 함수
    clickButtonById(id: string): void {
      const button = document.getElementById(id);
      if (button) {
        button.click();
      }
    },
    // 범주와 단위를 초기화
    initRecentCategoryAndUnit(): void {
      // 범주 초기화
      if (!UnitConverter.categories.includes(this.recentCategory)) {
        this.recentCategory = UnitConverter.categories[0];
      }

      // 단위 초기화
      if (!UnitConverter.getUnitLists(this.recentCategory).includes(this.recentUnitFrom[this.recentCategory])) {
        this.recentUnitFrom[this.recentCategory] = UnitConverter.getUnitLists(this.recentCategory)[0];
      }

      if (!UnitConverter.getUnitLists(this.recentCategory).includes(this.recentUnitTo[this.recentCategory])) {
        this.recentUnitTo[this.recentCategory] = UnitConverter.getUnitLists(this.recentCategory)[0];
        if (this.recentUnitTo[this.recentCategory] == this.recentUnitFrom[this.recentCategory]) {
          this.recentUnitTo[this.recentCategory] = UnitConverter.getUnitLists(this.recentCategory)[1];
        }
      }
    },
    // 선택할 통화 초기화
    initRecentCurrency(): void {
      const defaultCurrency = ['USD', 'KRW'];

      // 저장된 원본 통화가 잘못됐으면 초기화
      if (!this.currencyConverter.getCurrencyLists().includes(this.recentCurrencyFrom)) {
        this.recentCurrencyFrom = defaultCurrency[0];
        if (this.recentCurrencyFrom === this.recentCurrencyTo) {
          this.recentCurrencyFrom = defaultCurrency[1];
        }
      }

      // 저장된 대상 통화가 잘못됐으면 초기화
      if (!this.currencyConverter.getCurrencyLists().includes(this.recentCurrencyTo)) {
        this.recentCurrencyTo = defaultCurrency[1];
        if (this.recentCurrencyTo === this.recentCurrencyFrom) {
          this.recentCurrencyTo = defaultCurrency[0];
        }
      }
    },
    // 시작 탭 설정
    setCTab(tab: string): void {
      // 계산기, 단위 변환기, 통화 변환기 중 하나인 경우에만 설정
      if (['calc', 'unit', 'currency'].includes(tab)) {
        this.cTab = tab;
      } else if (tab === '' || this.cTab === '') {
        this.cTab = 'calc';
      }
    },
    swapUnitValue(): void {
      if (this.cTab === 'unit') {
        // 변환 결과를 원본 값으로 바꾸기
        // (computed로 선언된 unitResult로 인해 값이 바뀌면 자동으로 변환 결과가 바뀜)
        this.calc.setCurrentNumber(document.getElementById('subResult')?.textContent ?? '0');
        // 단위도 바꾸기
        const temp = this.recentUnitFrom[this.recentCategory];
        this.recentUnitFrom[this.recentCategory] = this.recentUnitTo[this.recentCategory];
        this.recentUnitTo[this.recentCategory] = temp;
      }
    },
    swapCurrencyValue(): void {
      if (this.cTab === 'currency') {
        // 변환 결과를 원본 값으로 바꾸기
        this.calc.setCurrentNumber(document.getElementById('subResult')?.textContent ?? '0');
        // 화폐도 바꾸기
        const temp = this.recentCurrencyFrom;
        this.recentCurrencyFrom = this.recentCurrencyTo;
        this.recentCurrencyTo = temp;
      }
    },
    toggleButtonShift(): void {
      this.buttonShift = !this.buttonShift;
    },
    onButtonShift(): void {
      this.buttonShift = true;
    },
    offButtonShift(): void {
      this.buttonShift = false;
    },
    toggleButtonShiftLock(): void {
      this.buttonShiftLock = !this.buttonShiftLock;
    },
    onButtonShiftLock(): void {
      this.buttonShiftLock = true;
    },
    offButtonShiftLock(): void {
      this.buttonShiftLock = false;
    },
  },
  persist: true,
});
