/**
 * 숫자를 그룹화하여 포맷팅합니다.
 * @param value - 포맷팅할 숫자 문자열
 * @param groupingUnit - 그룹화 단위
 * @returns 그룹화된 숫자 문자열
 */
export function numberGrouping(value: string, groupingUnit: number): string {
  const [integerPart, decimalPart] = value.split('.');
  const groupingPattern = new RegExp(`\\B(?=([\\da-fA-F]{${groupingUnit}})+(?![\\da-fA-F]))`, 'g');
  return integerPart?.replace(groupingPattern, ',') + (decimalPart ? `.${decimalPart}` : '');
}

/**
 * 정수부 증분 처리 (자리 올림 포함)
 * @param integerStr - 증분할 정수 문자열
 * @param radixNumber - 진법
 * @returns 증분된 정수 문자열
 */
export function incrementInteger(integerStr: string, radixNumber: number): string {
  let result = '';
  let carry = 1;
  let i = integerStr.length - 1;

  while (i >= 0 || carry > 0) {
    const digit = i >= 0 ? parseInt(integerStr[i] ?? '', radixNumber) : 0;
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
export function roundFractionalPart(
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
  const nextDigit = fractional[decimalPlaces];
  const nextValue = parseInt(nextDigit ?? '', radixNumber as unknown as number);
  const halfRadix = Math.floor(radixNumber / 2);

  // 반올림 필요 없는 경우
  if (nextValue < halfRadix) {
    return {
      roundedFraction: retainPart,
      carryOver: 0,
    };
  }

  // 반올림 수행
  const rounded = retainPart.split('');
  let carryOver = 1;
  let i = rounded.length - 1;

  while (i >= 0 && carryOver > 0) {
    const currentValue = parseInt(rounded[i] ?? '', radixNumber) + carryOver;
    carryOver = currentValue >= radixNumber ? 1 : 0;
    rounded[i] = (currentValue % radixNumber).toString(radixNumber).toUpperCase();
    i--;
  }

  return {
    roundedFraction: rounded.join(''),
    carryOver: carryOver,
  };
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
    const firstDigit = parseInt(fractionalPart[0] ?? '', currentRadixNumber);
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
  return `${finalInteger}${formattedDecimal ? `.${formattedDecimal}` : ''}`;
}
