/**
 * @file calculator.d.ts
 * @description 이 파일은 계산기 관련 타입과 인터페이스를 정의합니다.
 *              계산 결과, 버튼 정의, 기록 등의 구조를 포함하여
 *              계산기 기능을 구현하는 데 필요한 타입 정보를 제공합니다.
 */

import type { BigNumber as tBigNumber } from 'mathjs';
import type { Radix } from 'classes/RadixConverter';

declare global {
  type BigNumber = tBigNumber;

  type RadixType = Radix;

  interface CalculationResult {
    previousNumber: string;
    operator: Operator | Operator[];
    argumentNumber?: string;
    resultNumber: string;
  }

  type WordSize = 0 | 4 | 8 | 16 | 32 | 64;

  type ResultRecord = {
    id?: number;
    memo?: string;
    timestamp: number;
    calculationResult: CalculationResult;
  };

  interface RecordString {
    id: number;
    memo?: string;
    timestamp: number;
    displayText: string;
    origResult: CalculationResult;
  }

  type CalculatorButtonDefinition = {
    [id: string]: [label: string, color: string, keys: string[], action: () => void, isDisabled: boolean];
  };

  type ExtendedButtonFunction = {
    [key: string]: [label: string, shortcutKeys: string[], action: () => void, isDisabled: boolean];
  };
}

export { WordSize, CalculationResult, ResultRecord, RecordString };
