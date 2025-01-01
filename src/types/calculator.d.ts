import { BigNumber as tBigNumber } from 'mathjs';
import { Radix } from '../classes/RadixConverter';

/**
 * BigNumber 타입 정의
 */
declare type BigNumberType = tBigNumber;

// 진법 타입 정의
declare type RadixType = Radix;

/**
 * 계산 결과 스냅샷 인터페이스
 */
declare interface CalculationResult {
  previousNumber: string;
  operator: Operator | Operator[];
  argumentNumber?: string;
  resultNumber: string;
}

/**
 * 계산기 비트 연산에서 사용되는 워드 크기 타입
 */
declare type WordSize = 0 | 4 | 8 | 16 | 32 | 64;

/**
 * 계산기 기록 항목 인터페이스
 */
declare type Record = {
  id?: number;
  calculationResult: CalculationResult;
  memo?: string;
};

