
/**
 * @file RadixConverter.ts
 * @description 이 파일은 진법 변환 관련 유틸리티 함수들을 제공합니다.
 *              2진수, 8진수, 10진수, 16진수 간의 상호 변환을 지원하며,
 *              정수부와 소수부의 변환, 음수 처리, 유효성 검사 등의 기능을 포함합니다.
 */

import { match } from 'ts-pattern';
import { toBigNumber, MathB } from '../classes/CalculatorMath';
import { checkError } from './ErrorUtils';

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
    const digitStr =
      radix === Radix.Hexadecimal ? hexDigits[Number(integerPart.toFixed())] : integerPart.toString();
    result += digitStr;
    remainingFraction = MathB.subtract(remainingFraction, integerPart);
  }

  return result;
}

function convertDecimalToRadix(decimal: string | BigNumber, radix: Radix): string {
  if (!decimal) return '0';
  if (radix === Radix.Decimal) return decimal.toString();

  const bigNumberValue = MathB.bignumber(decimal);
  const isNegative = MathB.smaller(bigNumberValue, 0);
  const absoluteValue = MathB.abs(bigNumberValue);
  const integerPartValue = MathB.floor(absoluteValue);
  const fractionPartValue = MathB.subtract(absoluteValue, integerPartValue);

  const integerPart = BigInt(integerPartValue.toString()).toString(radixMap[radix]).toUpperCase();

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
  const radixPrefix = match(radix)
    .with(Radix.Binary, () => '0b')
    .with(Radix.Octal, () => '0o')
    .with(Radix.Hexadecimal, () => '0x')
    .exhaustive();

  let result = toBigNumber(integerPart ? BigInt(radixPrefix + integerPart).toString() : '0');

  if (fractionPart) {
    result = MathB.add(result, convertFractionFromRadix(fractionPart, radix));
  }

  return (isNegative ? '-' : '') + result.toString() + (isOnlyFraction ? '.' : '');
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
