/**
 * @file RadixConverter.ts
 * @description 이 파일은 진법 변환 관련 유틸리티 함수들을 제공합니다.
 *              2진수, 8진수, 10진수, 16진수 간의 상호 변환을 지원하며,
 *              정수부와 소수부의 변환, 음수 처리, 유효성 검사 등의 기능을 포함합니다.
 */

import { match } from 'ts-pattern';
import { toBigNumber, MathB } from '../calculator/CalculatorMath';
import { checkError } from '../../utils/ErrorUtils';

export enum Radix {
  Binary = 'bin',
  Octal = 'oct',
  Decimal = 'dec',
  Hexadecimal = 'hex',
}

export type RadixType = Radix;

const hexDigits = '0123456789ABCDEF';
const maxPrecision = 128;
export const radixMap = {
  [Radix.Binary]: 2,
  [Radix.Octal]: 8,
  [Radix.Decimal]: 10,
  [Radix.Hexadecimal]: 16,
} as const;

export function getAvailableRadixItems(): string[] {
  return Object.values(Radix);
}

export function getRadixItemDescription(item: string): string {
  const descriptions = {
    [Radix.Binary]: '2진수 (Binary)',
    [Radix.Octal]: '8진수 (Octal)',
    [Radix.Decimal]: '10진수 (Decimal)',
    [Radix.Hexadecimal]: '16진수 (Hexadecimal)',
  };

  checkError(!descriptions[item as Radix], 'error.radix.invalid_radix', {
    radix: item,
  });

  return descriptions[item as Radix];
}

export function isValidRadixNumber(number: string, radix: Radix): boolean {
  const patterns = {
    [Radix.Binary]: /^-?[01]+(\.[01]*)?$/,
    [Radix.Octal]: /^-?[0-7]+(\.[0-7]*)?$/,
    [Radix.Decimal]: /^-?\d+(\.\d*)?$/,
    [Radix.Hexadecimal]: /^-?[0-9A-Fa-f]+(\.[0-9A-Fa-f]*)?$/,
  };

  const result = patterns[radix].test(number);

  checkError(!result, 'error.radix.invalid_radix', { radix: radix, number: number });
  return result;
}

export function isValidBinary(value: string): boolean {
  return isValidRadixNumber(value, Radix.Binary);
}

export function isValidOctal(value: string): boolean {
  return isValidRadixNumber(value, Radix.Octal);
}

export function isValidDecimal(value: string): boolean {
  return isValidRadixNumber(value, Radix.Decimal);
}

export function isValidHexadecimal(value: string): boolean {
  return isValidRadixNumber(value, Radix.Hexadecimal);
}

function convertFractionToRadix(fraction: math.BigNumber, radix: Radix): string {
  const radixValue = radixMap[radix];
  let result = '';
  let remainingFraction = fraction;

  for (let precision = 0; precision < maxPrecision && !MathB.equal(remainingFraction, 0); precision++) {
    remainingFraction = MathB.multiply(remainingFraction, radixValue) as math.BigNumber;
    const integerPart = MathB.floor(remainingFraction);
    const digitStr = radix === Radix.Hexadecimal ? hexDigits[Number(integerPart.toFixed())] : integerPart.toString();
    result += digitStr;
    remainingFraction = MathB.subtract(remainingFraction, integerPart);
  }

  return result;
}

/**
 * BigNumber를 안전하게 정수 문자열로 변환합니다.
 * 과학적 표기법을 방지하기 위해 toFixed(0)를 사용합니다.
 * @param value - 변환할 BigNumber
 * @returns 정수 문자열 (과학적 표기법 없음)
 */
function safeIntegerToString(value: math.BigNumber): string {
  try {
    // toFixed(0)를 사용하여 소수점 없이 정수 문자열로 변환
    // 이렇게 하면 과학적 표기법이 사용되지 않습니다
    return value.toFixed(0);
  } catch {
    // toFixed가 실패하는 경우 (예: 무한대), toString() 사용
    const str = value.toString();
    // 과학적 표기법이 포함된 경우 처리
    if (str.includes('e') || str.includes('E')) {
      // 과학적 표기법을 일반 숫자로 변환 시도
      const num = Number(str);
      if (isFinite(num)) {
        return Math.floor(num).toString();
      }
      // 변환 실패 시 에러 발생
      throw new Error(`Cannot convert ${str} to integer string`);
    }
    return str;
  }
}

function convertDecimalToRadix(decimal: string | BigNumber, radix: Radix): string {
  if (!decimal) return '0';
  if (radix === Radix.Decimal) return decimal.toString();

  const bigNumberValue = MathB.bignumber(decimal);
  const isNegative = MathB.smaller(bigNumberValue, 0);
  const absoluteValue = MathB.abs(bigNumberValue);
  const integerPartValue = MathB.floor(absoluteValue);
  const fractionPartValue = MathB.subtract(absoluteValue, integerPartValue);

  // BigInt 변환 전에 안전하게 정수 문자열로 변환
  const integerStr = safeIntegerToString(integerPartValue);
  const integerPart = BigInt(integerStr).toString(radixMap[radix]).toUpperCase();

  if (MathB.equal(fractionPartValue, 0)) {
    return isNegative ? `-${integerPart}` : integerPart;
  }

  const fractionPart = convertFractionToRadix(fractionPartValue, radix);
  const result = `${integerPart}.${fractionPart}`;
  return isNegative ? `-${result}` : result;
}

function convertFractionFromRadix(fractionPart: string, radix: Radix): math.BigNumber {
  const radixValue = radixMap[radix];
  const digits = radix === Radix.Hexadecimal ? fractionPart.toUpperCase() : fractionPart;

  return digits
    .split('')
    .reduce<BigNumber>((accumulator: BigNumber, currentDigit: string, position: number): BigNumber => {
      const digitValue = parseInt(currentDigit, radixValue);
      const weightedValue = MathB.divide(
        toBigNumber(digitValue),
        MathB.pow(toBigNumber(radixValue), position + 1),
      ) as BigNumber;
      return MathB.add(accumulator, weightedValue);
    }, toBigNumber(0));
}

function convertRadixToDecimal(value: string, radix: Radix): string {
  if (!value || value === '0' || value === '-0') {
    return '0';
  }
  if (radix === Radix.Decimal) {
    return value;
  }

  const isOnlyFraction = value.endsWith('.');
  const isNegative = value.startsWith('-');
  const absValue = isNegative ? value.slice(1) : value;
  const [integerPart, fractionPart = ''] = absValue.split('.');

  // BigInt 변환을 안전하게 처리
  let integerDecimalStr = '0';
  if (integerPart) {
    try {
      // 진법에 따른 접두사 결정
      const radixPrefix = match(radix)
        .with(Radix.Binary, () => '0b')
        .with(Radix.Octal, () => '0o')
        .with(Radix.Hexadecimal, () => '0x')
        .exhaustive();
      integerDecimalStr = BigInt(radixPrefix + integerPart).toString();
    } catch {
      // BigInt 변환 실패 시 (매우 큰 숫자 등) 직접 변환 알고리즘 사용
      integerDecimalStr = convertIntegerPartFromRadix(integerPart, radix);
    }
  }
  let result = toBigNumber(integerDecimalStr);

  if (fractionPart) {
    result = MathB.add(result, convertFractionFromRadix(fractionPart, radix));
  }

  return (isNegative ? '-' : '') + result.toString() + (isOnlyFraction ? '.' : '');
}

/**
 * 진법에서 10진수로 정수 부분을 직접 변환합니다.
 * BigInt 변환이 실패하는 매우 큰 숫자에 대한 대안입니다.
 * @param integerPart - 변환할 정수 부분 문자열
 * @param radix - 원본 진법
 * @returns 10진수 문자열
 */
function convertIntegerPartFromRadix(integerPart: string, radix: Radix): string {
  if (!integerPart || integerPart === '0') {
    return '0';
  }

  const radixValue = radixMap[radix];
  const digits = radix === Radix.Hexadecimal ? integerPart.toUpperCase() : integerPart;

  // 각 자릿수를 10진수로 변환하고 가중치를 곱하여 합산
  let result = toBigNumber(0);
  for (let i = 0; i < digits.length; i++) {
    const digit = digits[digits.length - 1 - i]; // 오른쪽부터 처리
    if (!digit) continue; // 안전성 체크
    const digitValue = parseInt(digit, radixValue);
    if (isNaN(digitValue)) continue; // 유효하지 않은 자릿수 건너뛰기
    const power = MathB.pow(toBigNumber(radixValue), i);
    result = MathB.add(result, MathB.multiply(toBigNumber(digitValue), power)) as math.BigNumber;
  }

  return result.toFixed(0);
}

function convertFromDecimal(decimal: string, toRadix: Radix): string {
  checkError(!isValidDecimal(decimal), 'error.radix.invalid_decimal', { decimal: decimal });
  return convertDecimalToRadix(decimal, toRadix);
}

function convertToDecimal(value: string, fromRadix: Radix): string {
  checkError(!isValidRadixNumber(value, fromRadix), 'error.radix.invalid_radix', {
    radix: fromRadix,
    value: value,
  });
  return convertRadixToDecimal(value, fromRadix);
}

export function convertRadix(value: string, fromRadix: Radix, toRadix: Radix): string {
  if (toRadix === fromRadix) {
    return value;
  }
  const decimal = convertToDecimal(value, fromRadix);
  return convertFromDecimal(decimal, toRadix);
}
