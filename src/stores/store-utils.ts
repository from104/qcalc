import { convertRadix } from './../classes/RadixConverter';
import { copyToClipboard } from 'quasar';
import { defineStore } from 'pinia';
import { match } from 'ts-pattern';

import { useStoreBase } from './store-base';
import { useStoreSettings } from './store-settings';
import { useStoreRadix } from './store-radix';
import { useStoreNotifications } from './store-notifications';

import { Operator, CalculationResult } from 'classes/CalculatorTypes';
import { Radix } from 'classes/RadixConverter';

// 유틸리티 관련 상태 및 동작을 관리하는 스토어 정의
export const useStoreUtils = defineStore('utils', {
  // 상태 정의
  state: () => ({
    inputFocused: false, // 입력 필드 포커스 상태
  }),

  // 액션 정의
  actions: {
    // 숫자에 그룹화 적용
    numberGrouping(value: string): string {
      const storeSettings = useStoreSettings();
      const [integerPart, decimalPart] = value.split('.');
      const groupingPattern = new RegExp(`\\B(?=([\\da-fA-F]{${storeSettings.groupingUnit}})+(?![\\da-fA-F]))`, 'g');
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

      const storeSettings = useStoreSettings();
      const formattedValue = this.formatDecimalPlaces(value, storeSettings.decimalPlaces);

      return storeSettings.useGrouping ? this.numberGrouping(formattedValue) : formattedValue;
    },

    // 라디스 모드인 경우 숫자를 10진수로 변환하는 메서드
    convertIfRadix(value: string): string {
      const storeBase = useStoreBase();
      const storeRadix = useStoreRadix();
      const isRadixMode = storeBase.currentTab === 'radix';

      console.log('storeBase:', storeBase.currentTab);
      console.log('storeRadix:', storeRadix.sourceRadix);
      console.log('value:', value);
      console.log('isRadixMode:', isRadixMode);
      return isRadixMode ? convertRadix(value, Radix.Decimal, storeRadix.sourceRadix) : value;
    },

    // 계산 기록의 왼쪽 부분 생성
    getLeftSideInHistory(result: CalculationResult, useLineBreak = false): string {
      const lineBreak = useLineBreak ? '\n' : '';

      const prevValue = this.convertIfRadix(result.previousNumber);
      const argValue = result.argumentNumber ? this.convertIfRadix(result.argumentNumber) : '';
      const formattedPrev = this.toFormattedNumber(prevValue);
      const formattedArg = this.toFormattedNumber(argValue);
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
      return this.toFormattedNumber(this.convertIfRadix(result.resultNumber));
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
      const storeNotifications = useStoreNotifications();
      storeNotifications.showMessage(message);
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
