import { copyToClipboard } from 'quasar';
import {defineStore} from 'pinia';
import {create, all} from 'mathjs';
import {useStoreSettings} from './store-settings';
import {useStoreNotifications} from './store-notifications';
import {Operator, operatorMap, ResultSnapshot} from 'src/classes/Calculator';

// BigNumber 정밀도를 64로 설정한 MathJS 인스턴스 생성
const MathB = create(all, {
  number: 'BigNumber',
  precision: 64,
})

// 유틸리티 관련 상태 및 동작을 관리하는 스토어 정의
export const useStoreUtils = defineStore('utils', {
  // 상태 정의
  state: () => ({
    inputFocused: false, // 입력 필드 포커스 상태
  }),

  // 액션 정의
  actions: {
    // 숫자에 그룹화 적용
    numberGrouping(number: string, grouping: number = 3, separator: string = ','): string {
      const [integer, decimal] = number.split('.');
      const regex = new RegExp(`\\B(?=(\\d{${grouping}})+(?!\\d))`, 'g');
      return integer.replace(regex, separator) + (decimal ? `.${decimal}` : '');
    },

    // 숫자를 포맷팅된 문자열로 변환
    toFormattedNumber(number: string): string {
      const storeSettings = useStoreSettings();
      if (number === '') {
        return '';
      }
      const bignumber = MathB.bignumber(number);
      const formattedNumber = MathB.format(bignumber, {
        precision: storeSettings.decimalPlaces === -2 ? 64 : storeSettings.decimalPlaces,
        notation: storeSettings.decimalPlaces === -2 ? 'auto' : 'fixed',
        lowerExp: -64,
        upperExp: 64,
      });
      return storeSettings.useGrouping ? this.numberGrouping(formattedNumber) : formattedNumber;
    },

    // 계산 기록의 왼쪽 부분 생성
    getLeftSideInHistory(history: ResultSnapshot, useLineBreak = false): string {
      const lineBreak = useLineBreak ? '\n' : '';

      const formattedPrev = this.toFormattedNumber(history.previousNumber);
      const formattedArg = history.argumentNumber ? this.toFormattedNumber(history.argumentNumber) : '';
      const operator = Object.keys(operatorMap).find((key) => operatorMap[key] === history.operator) || '';

      switch (Array.isArray(history.operator) ? history.operator[0] : history.operator) {
        case Operator.Plus:
        case Operator.Minus:
        case Operator.Mul:
        case Operator.Div:
        case Operator.Mod:
          return `${formattedPrev}${lineBreak} ${operator} ${formattedArg}`;
        case Operator.Pow:
          return `${formattedPrev}${lineBreak} ^ ${formattedArg}`;
        case Operator.Root:
         return `${formattedPrev}${lineBreak} ^ (1/${formattedArg})`;
        case Operator.Pct:
          if (Array.isArray(history.operator) && history.operator[1] === Operator.Div) {
            return `${formattedPrev}${lineBreak} / ${formattedArg}${lineBreak} × 100`;
          } else {
            return `${formattedPrev}${lineBreak} × ${formattedArg}%`;
          }
        case Operator.Rec:
          return `1${lineBreak} ÷ ${formattedPrev}`;
        case Operator.Pow2:
          return `${formattedPrev} ^ 2`;
        case Operator.Exp10:
          return `${this.toFormattedNumber('10')} ^ ${formattedPrev}`;
        case Operator.Sqrt:
        case Operator.Sin:
        case Operator.Cos:
        case Operator.Tan:
        case Operator.Fct:
        case Operator.Int:
        case Operator.Frac:
          return `${operator} ( ${formattedPrev} )`;
        default:
          return formattedPrev;
      }
    },

    // 계산 기록의 오른쪽 부분 생성
    getRightSideInHistory(history: ResultSnapshot): string {
      return this.toFormattedNumber(history.resultNumber);
    },

    // 현재 포커스된 요소의 포커스 해제
    blurElement(): void {
      const el = document.activeElement as HTMLElement;
      el?.blur();
    },

    // 지정된 ID를 가진 버튼 클릭
    clickButtonById(id: string): void {
      const button = document.getElementById(id);
      if (button) {
        button.click();
      }
    },

    // 텍스트를 클립보드에 복사하고 알림 표시
    copyToClipboard(text: string, message: string): void {
      copyToClipboard(text);
      const storeNotifications = useStoreNotifications();
      storeNotifications.notifyMsg(message);
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
  },

  // 상태 지속성 설정 (페이지 새로고침 후에도 상태 유지)
  persist: true,
});
