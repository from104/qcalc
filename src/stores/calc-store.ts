import { defineStore } from 'pinia';
import { Dark } from 'quasar';
import { Notify } from 'quasar';
import { Calculator } from 'classes/Calculator';
import type { History } from 'classes/Calculator';
import { CurrencyConverter } from 'classes/CurrencyConverter';

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
    // 단우 및 통화 표시할 때 기호를 표시할지 여부
    showSymbol: false,
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
    // 숫자를 표준 로케일 문자열로 변환하는 함수
    toLocale(number: number): string {
      return number.toLocaleString(this.locale, {
        style: 'decimal',
        useGrouping: this.useGrouping,
        minimumFractionDigits:
          this.decimalPlaces == -2 ? 0 : this.decimalPlaces,
        maximumFractionDigits:
          this.decimalPlaces == -2 ? 20 : this.decimalPlaces,
      });
    },
    // 계산 결과 중 좌변
    getLeftSideInHistory(h: History, lf = false) {
      const br = lf ? '\n' : '';
      if (['+', '-', '×', '÷'].includes(h.operator)) { // 사칙연산
        return `${this.toLocale(h.preNumber)}${br} ${
          h.operator
        } ${this.toLocale(h.argNumber as number)}`;
      } else if (h.operator == '÷%') { // 퍼센트로 나누는 경우
        return `${this.toLocale(h.preNumber)}${br} ÷ ${this.toLocale(
          h.argNumber as number
        )}${br} × 100`;
      } else if (h.operator == '×%') { // 퍼센트로 곱하는 경우
        return `${this.toLocale(h.preNumber)}${br} × ${this.toLocale(
          h.argNumber as number
        )}${br} ÷ 100`;
      } else if (h.operator == 'rec') { // 역수
        return `1${br} ÷ ${this.toLocale(h.preNumber)}`;
      } else if (h.operator == 'pow2') { // 제곱
        return `${this.toLocale(h.preNumber)}${br} × ${this.toLocale(
          h.preNumber
        )}`;
      } else if (['sqrt'].includes(h.operator)) { // 제곱근
        return `${h.operator} ( ${this.toLocale(h.preNumber)} )`;
      } else { // 그 외
        return this.toLocale(h.preNumber);
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
    notifyError(msg: string, timeout = 500) {
      Notify.create({
        message: msg,
        position: 'top',
        timeout: timeout,
        color: 'negative',
      });
    },
    // 요소의 포커스를 해제하는 함수
    blurElement() {
      const el = document.activeElement as HTMLElement;
      el?.blur();
    },
    // 입력 필드가 포커스를 받았다고 셋팅하는 함수
    setInputFocused() {
      setTimeout(() => {
        this.inputFocused = true;
        console.log('setInputFocused', this.inputFocused);
      }, 10);
    },
    // 입력 필드가 포커스를 잃었다고 셋팅하는 함수
    setInputBlurred() {
      this.inputFocused = false;
      console.log('setInputBlurred', this.inputFocused);

    },
    showSymbolToggle() {
      this.showSymbol = !this.showSymbol;
    },
  },
  persist: true,
});
