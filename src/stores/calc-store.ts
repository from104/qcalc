import { defineStore } from 'pinia';
import { Dark } from 'quasar';
import { Notify } from 'quasar';
import { Calculator } from 'classes/Calculator';
import type { History } from 'classes/Calculator';
import { CurrencyConverter } from 'classes/CurrencyConverter';
import { create, all } from 'mathjs';

const MathB = create(all, {
  number: 'BigNumber',
  precision: 64,
}) as math.MathJsStatic;

export const useCalcStore = defineStore('calc', {
  state: () => ({
    darkMode: false,
    alwaysOnTop: false,
    calc: new Calculator(),
    useGrouping: true,
    decimalPlaces: -2,
    useSystemLocale: true,
    // 시스템 로케일
    locale: '',
    // 사용자 로케일
    userLocale: '',
    // 최근 단위 변환 범주
    recentCategory: '',
    // 최근 단위 변환 단위
    recentUnitFrom: {} as { [key: string]: string },
    recentUnitTo: {} as { [key: string]: string },
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
    getDarkColor(color: string): string | undefined {
      const darkColors: { [key: string]: string } = {
        primary: 'brown-4',
        secondary: 'blue-grey-5',
        accent: 'purple-5',
        positive: 'green-5',
        negative: 'pink-4',
        info: 'light-blue-3',
        warning: 'indigo-5',
      };
      if (Object.keys(darkColors).includes(color)) {
        return this.darkMode ? darkColors[color] : color;
      }
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
    // toLocale(number: number): string {
    //   return number.toLocaleString(this.locale, {
    //     style: 'decimal',
    //     useGrouping: this.useGrouping,
    //     minimumFractionDigits: this.decimalPlaces == -2 ? 0 : this.decimalPlaces,
    //     maximumFractionDigits: this.decimalPlaces == -2 ? 20 : this.decimalPlaces,
    //   });
    // },
    // 숫자를 표준 로케일 문자열로 변환하는 함수
    toLocale(number: string): string {
      const n = MathB.bignumber(number);
      const s = MathB.format(n, {
        precision: this.decimalPlaces === -2 ? 20 : this.decimalPlaces,
        notation: this.decimalPlaces === -2 ? 'auto' : 'fixed',
        upperExp: 20,
      });
      return this.useGrouping ? this.numberGrouping(s) : s;
    },
    // 계산 결과 중 좌변
    getLeftSideInHistory(h: History, lf = false) {
      const br = lf ? '\n' : '';
      if (['+', '-', '×', '÷'].includes(h.operator)) {
        // 사칙연산
        return `${this.toLocale(h.previousNumber)}${br} ${h.operator} ${this.toLocale(h.argumentNumber ?? '')}`;
      } else if (h.operator == '÷%') {
        // 퍼센트로 나누는 경우
        return `${this.toLocale(h.previousNumber)}${br} ÷ ${this.toLocale(h.argumentNumber ?? '')}${br} × 100`;
      } else if (h.operator == '×%') {
        // 퍼센트로 곱하는 경우
        return `${this.toLocale(h.previousNumber)}${br} × ${this.toLocale(h.argumentNumber ?? '')}${br} ÷ 100`;
      } else if (h.operator == 'rec') {
        // 역수
        return `1${br} ÷ ${this.toLocale(h.previousNumber)}`;
      } else if (h.operator == 'pow2') {
        // 제곱
        return `${this.toLocale(h.previousNumber)} ^ 2`;
      } else if (['sqrt'].includes(h.operator)) {
        // 제곱근
        return `${h.operator} ( ${this.toLocale(h.previousNumber)} )`;
      } else {
        // 그 외
        return this.toLocale(h.previousNumber);
      }
    },
    // 계산 결과 중 우변
    getRightSideInHistory(h: History) {
      return this.toLocale(h.resultNumber);
    },
    // 알림을 띄우는 함수 - 메시지
    notifyMsg(msg: string, timeout = 500) {
      Notify.create({
        message: msg,
        position: 'top',
        timeout: timeout,
        color: 'positive',
      });
    },
    // 알림을 띄우는 함수 - 에러
    notifyError(msg: string, timeout = 500): void {
      Notify.create({
        message: msg,
        position: 'top',
        timeout: timeout,
        color: 'negative',
      });
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
  },
  persist: true,
});
