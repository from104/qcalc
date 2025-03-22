/**
 * @file NumberUtils.ts
 * @description 이 파일은 숫자 관련 유틸리티 함수들을 정의합니다.
 *              숫자 포맷팅, 정수 증분 처리, 소수부 반올림 처리 등의 기능을 제공하여
 *              애플리케이션에서 숫자를 효과적으로 관리하고 표시할 수 있도록 돕습니다.
 *              이 유틸리티는 숫자 처리의 일관성을 유지하고, 사용자 경험을 향상시키는 데 기여합니다.
 */

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
      roundedFraction: retainPart,
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
    roundedFraction: digits.join(''),
    carryOver: carryOver,
  };
}

/**
 * 소수점 이하의 불필요한 0을 제거합니다.
 * @param value - 처리할 숫자 문자열
 * @returns 불필요한 0이 제거된 숫자 문자열
 */
function trimTrailingZeros(value: string): string {
  if (!value.includes('.')) return value;
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
  if (!value) return '';
  if (decimalPlaces < 0) return value;

  const [integerPart = '', fractionalPart = ''] = value.split('.');

  // 소수점 이하 처리 필요 없는 경우
  if (decimalPlaces === 0) {
    if (!fractionalPart) return integerPart;

    // 첫 번째 소수점 자리에서 반올림
    const firstDigit = parseInt(fractionalPart[0] || '0', currentRadixNumber);
    const shouldRoundUp = firstDigit >= Math.floor(currentRadixNumber / 2);
    return shouldRoundUp ? incrementInteger(integerPart, currentRadixNumber) : integerPart;
  }

  // 소수점 이하 처리
  if (!value.includes('.')) {
    return decimalPlaces > 0 ? `${value}.${'0'.repeat(decimalPlaces)}` : value;
  }

  // 반올림 처리
  const { roundedFraction, carryOver } = roundFractionalPart(fractionalPart, decimalPlaces, currentRadixNumber);

  // 정수부 자리 올림 처리
  let finalInteger = integerPart;
  if (carryOver > 0) {
    finalInteger = incrementInteger(integerPart, currentRadixNumber);
  }

  // 최종 결과 조합
  const formattedDecimal = roundedFraction.padEnd(decimalPlaces, '0');
  return trimTrailingZeros(`${finalInteger}${formattedDecimal ? `.${formattedDecimal}` : ''}`);
}

/**
 * 숫자를 지정된 소수점 자리에서 반올림합니다. (Excel의 ROUND 함수와 동일)
 * @param value - 반올림할 숫자 문자열
 * @param decimalPlaces - 소수점 자릿수 (음수인 경우 정수부 자릿수에서 반올림)
 * @param currentRadixNumber - 현재 진법
 * @returns 반올림된 숫자 문자열
 */
export function round(value: string, decimalPlaces: number, currentRadixNumber: number = 10): string {
  if (!value) return '';

  // 음수 자릿수 처리 (정수부 자릿수에서 반올림)
  if (decimalPlaces < 0) {
    const absPlaces = Math.abs(decimalPlaces);
    const multiplier = Math.pow(currentRadixNumber, absPlaces);
    const divided = (parseInt(value, currentRadixNumber) / multiplier).toString(currentRadixNumber);
    const rounded = formatDecimalPlaces(divided, 0, currentRadixNumber);
    return (parseInt(rounded, currentRadixNumber) * multiplier).toString(currentRadixNumber).toUpperCase();
  }

  return trimTrailingZeros(formatDecimalPlaces(value, decimalPlaces, currentRadixNumber));
}

/**
 * 숫자를 지정된 소수점 자리에서 올림합니다. (Excel의 ROUNDUP 함수와 동일)
 * @param value - 올림할 숫자 문자열
 * @param decimalPlaces - 소수점 자릿수 (음수인 경우 정수부 자릿수에서 올림)
 * @param currentRadixNumber - 현재 진법
 * @returns 올림된 숫자 문자열
 */
export function roundUp(value: string, decimalPlaces: number, currentRadixNumber: number = 10): string {
  if (!value) return '';

  // 음수 자릿수 처리 (정수부 자릿수에서 올림)
  if (decimalPlaces < 0) {
    const absPlaces = Math.abs(decimalPlaces);
    const multiplier = Math.pow(currentRadixNumber, absPlaces);
    const divided = (parseInt(value, currentRadixNumber) / multiplier).toString(currentRadixNumber);
    const [integerPart = '', fractionalPart = ''] = divided.split('.');

    // 소수부가 있으면 무조건 올림
    const shouldRoundUp = fractionalPart !== '';
    const roundedInteger = shouldRoundUp ? incrementInteger(integerPart, currentRadixNumber) : integerPart;
    return (parseInt(roundedInteger, currentRadixNumber) * multiplier).toString(currentRadixNumber).toUpperCase();
  }

  const [integerPart = '', fractionalPart = ''] = value.split('.');
  if (decimalPlaces === 0) {
    return fractionalPart ? incrementInteger(integerPart, currentRadixNumber) : integerPart;
  }

  // 소수부 처리
  const roundedFractionArray = fractionalPart.padEnd(decimalPlaces, '0').split('').slice(0, decimalPlaces);
  const nextDigit = fractionalPart[decimalPlaces] || '0';

  // 다음 자리에 숫자가 있으면 무조건 올림
  if (parseInt(nextDigit, currentRadixNumber) > 0) {
    let carryOver = 1;
    for (let i = roundedFractionArray.length - 1; i >= 0; i--) {
      const digit = roundedFractionArray[i] || '0';
      const currentValue = parseInt(digit, currentRadixNumber) + carryOver;
      carryOver = currentValue >= currentRadixNumber ? 1 : 0;
      roundedFractionArray[i] = (currentValue % currentRadixNumber).toString(currentRadixNumber).toUpperCase();
    }

    const roundedFraction = roundedFractionArray.join('');
    if (carryOver > 0) {
      return trimTrailingZeros(`${incrementInteger(integerPart, currentRadixNumber)}.${roundedFraction}`);
    }
    return trimTrailingZeros(`${integerPart}.${roundedFraction}`);
  }

  return trimTrailingZeros(`${integerPart}.${roundedFractionArray.join('')}`);
}

/**
 * 숫자를 지정된 소수점 자리에서 내림합니다. (Excel의 ROUNDDOWN 함수와 동일)
 * @param value - 내림할 숫자 문자열
 * @param decimalPlaces - 소수점 자릿수 (음수인 경우 정수부 자릿수에서 내림)
 * @param currentRadixNumber - 현재 진법
 * @returns 내림된 숫자 문자열
 */
export function roundDown(value: string, decimalPlaces: number, currentRadixNumber: number = 10): string {
  if (!value) return '';

  // 음수 자릿수 처리 (정수부 자릿수에서 내림)
  if (decimalPlaces < 0) {
    const absPlaces = Math.abs(decimalPlaces);
    const multiplier = Math.pow(currentRadixNumber, absPlaces);
    const divided = Math.floor(parseInt(value, currentRadixNumber) / multiplier).toString(currentRadixNumber);
    return (parseInt(divided, currentRadixNumber) * multiplier).toString(currentRadixNumber).toUpperCase();
  }

  const [integerPart = '', fractionalPart = ''] = value.split('.');
  if (decimalPlaces === 0) {
    return integerPart;
  }

  // 소수부 처리 - 단순히 지정된 자릿수만큼 잘라냄
  const roundedFraction = fractionalPart.padEnd(decimalPlaces, '0').substring(0, decimalPlaces);
  return trimTrailingZeros(`${integerPart}${roundedFraction ? `.${roundedFraction}` : ''}`);
}
