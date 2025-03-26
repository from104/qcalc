/**
 * @file NumberUtils.ts
 * @description 이 파일은 숫자 관련 유틸리티 함수들을 정의합니다.
 *              숫자 포맷팅, 정수 증분 처리, 소수부 반올림 처리 등의 기능을 제공하여
 *              애플리케이션에서 숫자를 효과적으로 관리하고 표시할 수 있도록 돕습니다.
 *              이 유틸리티는 숫자 처리의 일관성을 유지하고, 사용자 경험을 향상시키는 데 기여합니다.
 */

import { toBigNumber } from '../CalculatorMath';

/**
 * 진법에 따른 유효한 문자 패턴을 반환합니다.
 * @param radix - 진법 (2, 8, 10, 16)
 * @returns 해당 진법에서 유효한 문자들의 정규식 패턴
 */
function getValidDigitPattern(radix: number): string {
  switch (radix) {
    case 2:
      return '[0-1]';
    case 8:
      return '[0-7]';
    case 10:
      return '\\d';
    case 16:
      return '[0-9a-fA-F]';
    default:
      throw new Error('Unsupported radix. Only 2, 8, 10, and 16 are supported.');
  }
}

/**
 * 숫자를 그룹화하여 포맷팅합니다.
 * @param value - 포맷팅할 숫자 문자열
 * @param groupingUnit - 그룹화 단위
 * @returns 그룹화된 숫자 문자열
 */
export function numberGrouping(value: string, groupingUnit: number): string {
  const [integerPart, decimalPart] = value.split('.');
  const groupingPattern = new RegExp(`\\B(?=([\\da-fA-F]{${groupingUnit}})+(?![\\da-fA-F]))`, 'g');
  return (integerPart || '').replace(groupingPattern, ',') + (decimalPart ? `.${decimalPart}` : '');
}

/**
 * 정수부 증분 처리 (자리 올림 포함)
 * @param integerStr - 증분할 정수 문자열
 * @param radixNumber - 진법
 * @returns 증분된 정수 문자열
 */
function incrementInteger(integerStr: string, radixNumber: number): string {
  let result = '';
  let carry = 1;
  let i = integerStr.length - 1;

  while (i >= 0 || carry > 0) {
    const digit = i >= 0 ? parseInt(integerStr[i] || '0', radixNumber) : 0;
    const sum = digit + carry;
    carry = sum >= radixNumber ? 1 : 0;
    const newDigit = (sum % radixNumber).toString(radixNumber).toUpperCase();
    result = newDigit + result;
    i--;
  }

  return result || '0';
}

/**
 * 소수부 반올림 처리
 * @param fractional - 소수부 문자열
 * @param decimalPlaces - 소수점 자릿수
 * @param radixNumber - 진법
 * @returns 반올림된 소수부와 자리올림 여부
 */
function roundFractionalPart(
  fractional: string,
  decimalPlaces: number,
  radixNumber: number,
): { roundedFraction: string; carryOver: number } {
  if (fractional.length <= decimalPlaces) {
    return {
      roundedFraction: fractional.padEnd(decimalPlaces, '0'),
      carryOver: 0,
    };
  }

  const retainPart = fractional.substring(0, decimalPlaces);
  const nextDigit = fractional[decimalPlaces] || '0';
  const nextValue = parseInt(nextDigit, radixNumber);
  const halfRadix = Math.floor(radixNumber / 2);

  // 반올림 필요 없는 경우
  if (nextValue < halfRadix) {
    return {
      roundedFraction: retainPart.padEnd(decimalPlaces, '0'),
      carryOver: 0,
    };
  }

  // 반올림 수행
  const digits = retainPart.split('').map((char: string): string => char || '0');

  let carryOver = 1;
  for (let i = digits.length - 1; i >= 0; i--) {
    const currentValue = parseInt(digits[i] || '0', radixNumber) + carryOver;
    carryOver = currentValue >= radixNumber ? 1 : 0;
    digits[i] = (currentValue % radixNumber).toString(radixNumber).toUpperCase();
  }

  return {
    roundedFraction: digits.join('').padEnd(decimalPlaces, '0'),
    carryOver: carryOver,
  };
}

/**
 * 소수점 이하의 불필요한 0을 제거합니다.
 * @param value - 처리할 숫자 문자열
 * @param keepDecimalPlaces - 유지할 소수점 자릿수
 * @returns 불필요한 0이 제거된 숫자 문자열
 */
function trimTrailingZeros(value: string, keepDecimalPlaces: number = 0): string {
  if (!value.includes('.')) return value;
  if (keepDecimalPlaces > 0) {
    const [integerPart, decimalPart = ''] = value.split('.');
    return `${integerPart}.${decimalPart.padEnd(keepDecimalPlaces, '0')}`;
  }
  return value.replace(/\.?0+$/, '');
}

/**
 * 소수점 자릿수에 따라 숫자를 포맷팅합니다.
 * @param value - 포맷팅할 숫자 문자열
 * @param decimalPlaces - 소수점 자릿수
 * @param currentRadixNumber - 현재 진법
 * @returns 포맷팅된 숫자 문자열
 */
export function formatDecimalPlaces(value: string, decimalPlaces: number, currentRadixNumber: number): string {
  // 빈 문자열일 경우 0 반환
  if (!value) return '0';

  // 진법에 따른 유효한 문자 패턴 가져오기
  const digitPattern = getValidDigitPattern(currentRadixNumber);

  // 숫자가 아닌 문자가 포함된 경우 0 반환
  const validNumberPattern = new RegExp(`^-?${digitPattern}+\\.?${digitPattern}*$`);
  if (!validNumberPattern.test(value)) return '0';

  const [integerPart = '', fractionalPart = ''] = value.split('.');

  if (decimalPlaces < 0) {
    // 소수점 이하 부분이 없는 경우 정수부만 반환
    if (!fractionalPart) return integerPart ?? '0';
    // 반복 횟수 최소 10회
    const minConsecutiveDigits = 10;

    // x.yz000000000000a 일 경우 x.yz만 반환
    const trailingZeroesWithDigitPattern = new RegExp(`0{${minConsecutiveDigits},}${digitPattern}$`);
    if (trailingZeroesWithDigitPattern.test(fractionalPart)) {
      return (integerPart + '.' + fractionalPart.replace(trailingZeroesWithDigitPattern, '')).replace(/\.$/, '');
    }

    // 진법에 따른 최대 자릿수 패턴
    const maxDigitForRadix =
      currentRadixNumber === 2 ? '1' : currentRadixNumber === 8 ? '7' : currentRadixNumber === 16 ? '[fF]' : '9';

    // x.yz999999999999a 일 경우 x.yz9에서 반올림 반환
    const trailingNinesWithDigitPattern = new RegExp(`${maxDigitForRadix}{${minConsecutiveDigits},}${digitPattern}$`);
    if (trailingNinesWithDigitPattern.test(fractionalPart)) {
      // 패턴 적용 후 소수점 이하 자릿수 계산
      const significantDecimalPlaces = fractionalPart.replace(trailingNinesWithDigitPattern, '').length;
      // 소수점 이하 자릿수 계산 후 0,'.' 제거
      return formatDecimalPlaces(
        integerPart +
          '.' +
          fractionalPart.replace(trailingNinesWithDigitPattern, currentRadixNumber == 16 ? 'f' : maxDigitForRadix),
        significantDecimalPlaces,
        currentRadixNumber,
      )
        .replace(/0+$/, '')
        .replace(/\.$/, '');
    }
    return value;
  } else if (decimalPlaces === 0) {
    // 소수점 이하 처리 필요 없는 경우
    if (!fractionalPart) return integerPart;

    // 첫 번째 소수점 자리에서 반올림
    const firstDigit = parseInt(fractionalPart[0] || '0', currentRadixNumber);
    const shouldRoundUp = firstDigit >= Math.floor(currentRadixNumber / 2);
    return shouldRoundUp ? incrementInteger(integerPart, currentRadixNumber) : integerPart;
  } else {
    // decimalPlaces > 0
    if (!value.includes('.')) {
      return `${value}.${'0'.repeat(decimalPlaces)}`;
    }

    // 반올림 처리
    const { roundedFraction, carryOver } = roundFractionalPart(fractionalPart, decimalPlaces, currentRadixNumber);

    // 정수부 자리 올림 처리
    let finalInteger = integerPart;
    if (carryOver > 0) {
      finalInteger = incrementInteger(integerPart, currentRadixNumber);
    }

    // 최종 결과 조합
    return `${finalInteger}.${roundedFraction}`;
  }
}

// console.log(formatDecimalPlaces('0.000011', -1, 10));
// console.log(formatDecimalPlaces('0.0000000000000000000000000000000000000000000000000000001', -1, 10));
// console.log(formatDecimalPlaces('0.0000999999999999', -1, 10));
// console.log(formatDecimalPlaces('0.00099999999999999999999999999999999995', -1, 10));
// console.log(formatDecimalPlaces('1.9999999999999999999999', -1, 10));
// console.log(formatDecimalPlaces('0.11111111111111', -1, 2));
// console.log(formatDecimalPlaces('0.0000ffffffffffffffffffffffffff0', -1, 16));
// console.log(formatDecimalPlaces('0.999999999999999999999999999999999999999999999999999999999999999', -1, 10));