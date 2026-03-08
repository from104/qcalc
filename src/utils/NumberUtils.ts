/**
 * @file NumberUtils.ts
 * @description 이 파일은 숫자 관련 유틸리티 함수들을 정의합니다.
 *              숫자 포맷팅, 정수 증분 처리, 소수부 반올림 처리 등의 기능을 제공하여
 *              애플리케이션에서 숫자를 효과적으로 관리하고 표시할 수 있도록 돕습니다.
 *              이 유틸리티는 숫자 처리의 일관성을 유지하고, 사용자 경험을 향상시키는 데 기여합니다.
 */

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
 * @param number - 포맷팅할 숫자 문자열
 * @param groupingUnit - 그룹화 단위
 * @returns 그룹화된 숫자 문자열
 */
export function numberGrouping(number: string, groupingUnit: number): string {
  const [integerPart, decimalPart] = number.split('.');
  const groupingPattern = new RegExp(`\\B(?=([\\da-fA-F]{${groupingUnit}})+(?![\\da-fA-F]))`, 'g');
  return (integerPart || '').replace(groupingPattern, ',') + (decimalPart ? `.${decimalPart}` : '');
}

/**
 * 정수 문자열에 1을 더합니다 (양수 처리).
 * 대소문자 정규화는 formatDecimalPlaces 에서 일괄 처리합니다.
 */
function incrementInteger(integerStr: string, radixNumber: number): string {
  let result = '';
  let carry = 1;
  let i = integerStr.length - 1;

  while (i >= 0 || carry > 0) {
    const digit = i >= 0 ? parseInt(integerStr[i] || '0', radixNumber) : 0;
    const sum = digit + carry;
    carry = sum >= radixNumber ? 1 : 0;
    result = (sum % radixNumber).toString(radixNumber) + result;
    i--;
  }

  return result || '0';
}

/**
 * 소수부 반올림 처리 - Banker's Rounding (round half to even)
 * 대소문자 정규화는 formatDecimalPlaces 에서 일괄 처리합니다.
 * @param fractional - 소수부 문자열
 * @param decimalPlaces - 소수점 자릿수
 * @param radixNumber - 진법 (예: 10)
 * @returns 반올림된 소수부와 자리 올림 여부
 */
function roundFractionalPartEven(
  fractional: string,
  decimalPlaces: number,
  radixNumber: number,
): { roundedFraction: string; carryOver: number } {
  // 소수부 자릿수가 충분하지 않으면 0으로 채움
  if (fractional.length <= decimalPlaces) {
    return {
      roundedFraction: fractional.padEnd(decimalPlaces, '0'),
      carryOver: 0,
    };
  }

  const retainPart = fractional.substring(0, decimalPlaces);
  const nextDigit = fractional[decimalPlaces] || '0';
  const nextValue = parseInt(nextDigit, radixNumber);
  const halfRadix = radixNumber / 2;

  let roundUp = false;

  if (nextValue > halfRadix) {
    roundUp = true;
  } else if (nextValue < halfRadix) {
    roundUp = false;
  } else {
    const trailingPart = fractional.substring(decimalPlaces + 1);
    const hasNonZero = trailingPart.split('').some((d) => parseInt(d, radixNumber) !== 0);
    if (hasNonZero) {
      roundUp = true;
    } else {
      // 정확히 절반인 경우, 마지막 보존 자릿수가 홀수이면 올림
      const lastRetainedDigit = retainPart[retainPart.length - 1] || '0';
      roundUp = parseInt(lastRetainedDigit, radixNumber) % 2 !== 0;
    }
  }

  if (!roundUp) {
    return {
      roundedFraction: retainPart.padEnd(decimalPlaces, '0'),
      carryOver: 0,
    };
  }

  // 올림이 필요한 경우, 보존 부분에 1을 더함
  const digits = retainPart.split('').map((char) => char || '0');
  let carryOver = 1;
  for (let i = digits.length - 1; i >= 0; i--) {
    const currentValue = parseInt(digits[i] || '0', radixNumber) + carryOver;
    carryOver = currentValue >= radixNumber ? 1 : 0;
    digits[i] = (currentValue % radixNumber).toString(radixNumber);
  }

  return {
    roundedFraction: digits.join('').padEnd(decimalPlaces, '0'),
    carryOver: carryOver,
  };
}

/**
 * 부동소수점 연산 노이즈(후행 0/max자릿수 반복)를 정리합니다.
 * - 후행 0 반복: x.yz000…[a] → x.yz
 * - 후행 max 반복: x.yz999…[a] → Banker's Rounding 적용
 * @param integerPart - 정수부 문자열
 * @param fractionalPart - 소수부 문자열
 * @param radix - 진법
 * @returns 정리된 숫자 문자열 (부호 없음)
 */
function cleanFloatingPointNoise(integerPart: string, fractionalPart: string, radix: number): string {
  const minRun = 10;
  const digitPat = getValidDigitPattern(radix);
  const maxDigit = radix === 2 ? '1' : radix === 8 ? '7' : radix === 16 ? '[fF]' : '9';

  // 후행 0 반복 제거
  const zeroPattern = new RegExp(`0{${minRun},}${digitPat}?$`);
  if (zeroPattern.test(fractionalPart)) {
    const cleaned = fractionalPart.replace(zeroPattern, '');
    return cleaned ? `${integerPart}.${cleaned}` : integerPart;
  }

  // 후행 max 자릿수 반복 → Banker's Rounding 직접 적용 (재귀 없음)
  const ninePattern = new RegExp(`${maxDigit}{${minRun},}${digitPat}?$`);
  if (ninePattern.test(fractionalPart)) {
    const significantLen = fractionalPart.replace(ninePattern, '').length;
    const { roundedFraction, carryOver } = roundFractionalPartEven(fractionalPart, significantLen, radix);
    const finalInt = carryOver ? incrementInteger(integerPart, radix) : integerPart;
    const trimmed = roundedFraction.replace(/0+$/, '');
    return trimmed ? `${finalInt}.${trimmed}` : finalInt;
  }

  return `${integerPart}.${fractionalPart}`;
}

/**
 * 수식 문자열 내의 숫자를 계산기 서식에 맞게 포맷팅한 표시용 문자열을 반환합니다.
 * - 정수부: groupingUnit 단위로 컴마 삽입
 * - 소수부: maxDecimalPlaces >= 0 이면 해당 자릿수로 표시 제한, 음수이면 제한 없음
 * - 수식 연산자·함수·괄호·@ 는 그대로 유지됩니다.
 * @param expression - 수식 문자열
 * @param groupingUnit - 컴마 구분 단위 (예: 3, 4)
 * @param maxDecimalPlaces - 소수부 표시 자릿수 한도 (음수 = 제한 없음)
 * @returns 표시용 포맷팅된 수식 문자열
 */
export function formatExpressionNumbers(expression: string, groupingUnit: number, maxDecimalPlaces: number): string {
  return expression.replace(/\d+(?:\.\d+)?/g, (match) => {
    const dotIndex = match.indexOf('.');
    if (dotIndex === -1) {
      return numberGrouping(match, groupingUnit);
    }
    const intPart = match.slice(0, dotIndex);
    const decPart = match.slice(dotIndex + 1);
    const limitedDec = maxDecimalPlaces >= 0 ? decPart.slice(0, maxDecimalPlaces) : decPart;
    const grouped = numberGrouping(intPart, groupingUnit);
    return limitedDec ? `${grouped}.${limitedDec}` : grouped;
  });
}

/**
 * 소수점 자릿수에 따라 숫자를 포맷팅합니다.
 * - decimalPlaces < 0: 부동소수점 노이즈 자동 제거
 * - decimalPlaces = 0: 정수 반올림 (Banker's Rounding)
 * - decimalPlaces > 0: 지정 자릿수 반올림 (Banker's Rounding)
 * 대소문자 정규화(.toUpperCase)는 이 함수의 최종 반환에서만 적용됩니다.
 * @param number - 포맷팅할 숫자 문자열
 * @param decimalPlaces - 소수점 자릿수
 * @param currentRadixNumber - 현재 진법
 * @returns 포맷팅된 숫자 문자열
 */
export function formatDecimalPlaces(number: string, decimalPlaces: number, currentRadixNumber: number): string {
  if (!number) return '0';

  const isNegative = number.startsWith('-');
  const absoluteNumber = isNegative ? number.substring(1) : number;

  // 부호 적용 + 대소문자 정규화를 한 번에 처리
  const sign = (s: string) => ((isNegative ? '-' : '') + s).toUpperCase();

  const digitPattern = getValidDigitPattern(currentRadixNumber);
  const validNumberPattern = new RegExp(`^${digitPattern}+\\.?${digitPattern}*$`);
  if (!validNumberPattern.test(absoluteNumber)) return '0';

  const [integerPart = '', fractionalPart = ''] = absoluteNumber.split('.');

  if (decimalPlaces < 0) {
    if (!fractionalPart) return sign(integerPart);
    return sign(cleanFloatingPointNoise(integerPart, fractionalPart, currentRadixNumber));
  } else if (decimalPlaces === 0) {
    if (!fractionalPart) return sign(integerPart);

    // Banker's Rounding: 정확히 절반일 때 정수부의 홀짝을 기준으로 반올림
    const firstDigit = parseInt(fractionalPart[0] || '0', currentRadixNumber);
    const halfRadix = currentRadixNumber / 2;
    let roundUp: boolean;
    if (firstDigit > halfRadix) {
      roundUp = true;
    } else if (firstDigit < halfRadix) {
      roundUp = false;
    } else {
      const hasTrailing = fractionalPart
        .slice(1)
        .split('')
        .some((d) => parseInt(d, currentRadixNumber) !== 0);
      if (hasTrailing) {
        roundUp = true;
      } else {
        // 정확히 .5: 정수부 마지막 자릿수가 홀수이면 올림
        const lastIntDigit = parseInt(integerPart[integerPart.length - 1] || '0', currentRadixNumber);
        roundUp = lastIntDigit % 2 !== 0;
      }
    }
    return sign(roundUp ? incrementInteger(integerPart, currentRadixNumber) : integerPart);
  } else {
    // decimalPlaces > 0
    if (!absoluteNumber.includes('.')) {
      return sign(`${absoluteNumber}.${'0'.repeat(decimalPlaces)}`);
    }

    const { roundedFraction, carryOver } = roundFractionalPartEven(fractionalPart, decimalPlaces, currentRadixNumber);
    const finalInteger = carryOver > 0 ? incrementInteger(integerPart, currentRadixNumber) : integerPart;
    return sign(`${finalInteger}.${roundedFraction}`);
  }
}
