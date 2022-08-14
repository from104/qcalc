import { defineStore } from 'pinia';
import { Dark } from 'quasar';
import { Calculator } from 'classes/Calculator';
import type { History } from 'classes/Calculator';

export const useCalcStore = defineStore('calc', {
  state: () => ({
    darkMode: false,
    alwaysOnTop: false,
    calc: new Calculator(),
    useGrouping: true,
    decimalPlaces: -2,
    // 시스템 로케일
    locale: '',
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
    toggleAlwaysOnTop() {
      this.alwaysOnTop = !this.alwaysOnTop;
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
      const br = lf ? '<br />' : '';
      if (['+', '-', '×', '÷'].includes(h.operator)) {
        return `${this.toLocale(h.preNumber)} ${br} ${
          h.operator
        } ${this.toLocale(h.argNumber as number)}`;
      } else if (h.operator == '%') {
        return `${this.toLocale(h.preNumber)} ${br} ÷ ${this.toLocale(
          h.argNumber as number
        )} ${br} × 100`;
      } else if (h.operator == 'rec') {
        return `1 ${br} ÷ ${this.toLocale(h.preNumber)}`;
      } else if (h.operator == 'pow2') {
        return `${this.toLocale(h.preNumber)} ${br} × ${this.toLocale(
          h.preNumber
        )}`;
      } else if (['sqrt'].includes(h.operator)) {
        return `${h.operator} ( ${this.toLocale(h.preNumber)} )`;
      } else {
        return this.toLocale(h.preNumber);
      }
    },
    // 계산 결과 중 우변
    getRightSideInHistory(h: History) {
      return this.toLocale(h.resultNumber);
    },
  },
  persist: true,
});
