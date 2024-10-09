import {copyToClipboard} from 'quasar';
import {defineStore} from 'pinia';
import {create, all} from 'mathjs';
import {useStoreSettings} from './store-settings';
import {useStoreNotifications} from './store-notifications';
import {ResultSnapshot} from 'src/classes/Calculator';

const MathB = create(all, {
  number: 'BigNumber',
  precision: 64,
}) as math.MathJsStatic;

export const useStoreUtils = defineStore('utils', {
  state: () => ({
    inputFocused: false,
  }),
  actions: {
    numberGrouping(number: string, grouping: number = 3, separator: string = ',') {
      const [integer, decimal] = number.split('.'),
        regex = new RegExp(`\\B(?=(\\d{${grouping}})+(?!\\d))`, 'g');
      return integer.replace(regex, separator) + (decimal ? `.${decimal}` : '');
    },
    toFormattedNumber(number: string): string {
      const storeSettings = useStoreSettings();
      const bignumber = MathB.bignumber(number);
      const formattedNumber = MathB.format(bignumber, {
        precision: storeSettings.decimalPlaces === -2 ? 64 : storeSettings.decimalPlaces,
        notation: storeSettings.decimalPlaces === -2 ? 'auto' : 'fixed',
        lowerExp: -64,
        upperExp: 64,
      });
      return storeSettings.useGrouping ? this.numberGrouping(formattedNumber) : formattedNumber;
    },
    getLeftSideInHistory(history: ResultSnapshot, useLineBreak = false) {
      const lineBreak = useLineBreak ? '\n' : '';
      const formattedPrev = this.toFormattedNumber(history.previousNumber);
      const formattedArg = this.toFormattedNumber(history.argumentNumber ?? '');

      switch (history.operator) {
        case '+':
        case '-':
        case '×':
        case '÷':
        case 'mod':
          return `${formattedPrev}${lineBreak} ${history.operator} ${formattedArg}`;
        case 'pow':
          return `${formattedPrev}${lineBreak} ^ ${formattedArg}`;
        case 'root':
          return `${formattedPrev}${lineBreak} ^ (1/${formattedArg})`;
        case '÷%':
          return `${formattedPrev}${lineBreak} ÷ ${formattedArg}${lineBreak} × 100`;
        case '×%':
          return `${formattedPrev}${lineBreak} × ${formattedArg}${lineBreak} ÷ 100`;
        case 'rec':
          return `1${lineBreak} ÷ ${formattedPrev}`;
        case 'pow2':
          return `${formattedPrev} ^ 2`;
        case 'exp10':
          return `${this.toFormattedNumber('10')} ^ ${formattedPrev}`;
        case 'sqrt':
        case 'sin':
        case 'cos':
        case 'tan':
        case 'fct':
        case 'int':
        case 'frac':
          return `${history.operator} ( ${formattedPrev} )`;
        default:
          return formattedPrev;
      }
    },
    getRightSideInHistory(history: ResultSnapshot) {
      return this.toFormattedNumber(history.resultNumber);
    },
    blurElement(): void {
      const el = document.activeElement as HTMLElement;
      el?.blur();
    },
    clickButtonById(id: string): void {
      const button = document.getElementById(id);
      if (button) {
        button.click();
      }
    },
    copyToClipboard(text: string, message: string): void {
      copyToClipboard(text);
      const storeNotifications = useStoreNotifications();
      storeNotifications.notifyMsg(message);
    },
    setInputFocused(): void {
      setTimeout(() => {
        this.inputFocused = true;
      }, 10);
    },
    setInputBlurred(): void {
      this.inputFocused = false;
    },
  },
  persist: true,
});
