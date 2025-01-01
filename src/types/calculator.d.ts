import { BigNumber as tBigNumber } from 'mathjs';
import { Radix } from '../classes/RadixConverter';

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
    calculationResult: CalculationResult;
    memo?: string;
  };
}

export {}; // 파일을 모듈로 만들기 위한 빈 export
