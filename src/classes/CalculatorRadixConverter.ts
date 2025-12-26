/**
 * @file CalculatorRadixConverter.ts
 * @description 계산기의 진법 변환 및 숫자 필터링을 담당하는 유틸리티 클래스입니다.
 *              입력 버퍼와 현재 숫자 간의 진법 변환을 처리합니다.
 */

import { Radix, convertRadix, isValidRadixNumber } from '../utils/RadixConverter';
import { checkError } from '../utils/ErrorUtils';

/**
 * 계산기의 진법 변환 및 숫자 필터링을 담당하는 클래스
 * @class CalculatorRadixConverter
 */
export class CalculatorRadixConverter {
  /**
   * 문자열에서 현재 진법에 맞는 유효한 숫자만 추출합니다.
   * @param originalString - 원본 문자열
   * @param radix - 진법 (기본값: Decimal)
   * @returns 필터링된 숫자 문자열
   */
  public filterNumberCharacters(originalString: string, radix: Radix = Radix.Decimal): string {
    // 진법에 따라 적절한 정규식 패턴 선택
    let onlyNumber = (() => {
      switch (radix) {
        case 'hex':
          return originalString.replace(/[^0-9a-fA-F.-]/gm, '').toUpperCase();
        case 'oct':
          return originalString.replace(/[^0-7.-]/gm, '');
        case 'bin':
          return originalString.replace(/[^0-1.-]/gm, '');
        default:
          return originalString.replace(/[^0-9.-]/gm, '');
      }
    })();

    const isNegative = onlyNumber.startsWith('-');
    onlyNumber = onlyNumber.replace(/-/g, '');
    const [integerPart, ...fractionParts] = onlyNumber.split('.');
    let result = integerPart || '0';

    if (fractionParts.length > 0) {
      result += '.' + fractionParts.join('');
    }

    return (isNegative ? '-' : '') + result;
  }

  /**
   * 입력 버퍼를 현재 숫자로 변환합니다.
   * @param inputBuffer - 입력 버퍼 문자열
   * @param currentRadix - 현재 진법
   * @returns 10진수로 변환된 숫자 문자열
   */
  public convertBufferToCurrentNumber(inputBuffer: string, currentRadix: Radix): string {
    return convertRadix(inputBuffer, currentRadix, Radix.Decimal);
  }

  /**
   * 현재 숫자를 입력 버퍼로 변환합니다.
   * @param currentNumber - 현재 숫자 문자열 (10진수)
   * @param targetRadix - 대상 진법
   * @returns 대상 진법으로 변환된 숫자 문자열
   */
  public convertCurrentNumberToBuffer(currentNumber: string, targetRadix: Radix): string {
    return convertRadix(currentNumber.toString(), Radix.Decimal, targetRadix);
  }

  /**
   * 숫자가 현재 진법에 유효한지 검증합니다.
   * @param digit - 검증할 숫자 문자열
   * @param radix - 진법
   * @throws 유효하지 않은 숫자인 경우 에러를 발생시킵니다.
   */
  public validateRadixNumber(digit: string, radix: Radix): void {
    checkError(!isValidRadixNumber(digit, radix), 'error.invalid_digit');
  }
}
