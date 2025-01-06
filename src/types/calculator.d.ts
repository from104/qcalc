import type { BigNumber as tBigNumber } from 'mathjs';
import type { Radix } from 'classes/RadixConverter';

declare global {
  type BigNumberType = tBigNumber;

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
    calculationResult: CalculationResult;
  };

  interface RecordString {
    id: number;
    memo?: string;
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

export { WordSize, CalculationResult, ResultRecord, RecordString }; // 파일을 모듈로 만들기 위한 빈 export
