import { create, all, BigNumber as tBigNumber } from 'mathjs';

/**
 * MathJS 라이브러리 설정
 * - BigNumber 타입 사용으로 정밀한 계산 지원
 * - 정밀도 128비트로 설정하여 높은 정확도 보장
 */
export const MathB = create(all, {
  number: 'BigNumber',
  precision: 128,
});

export const BigNumber = MathB.bignumber;

export type BigNumberType = tBigNumber;

/**
 * 계산기에서 사용되는 연산자 열거형
 * @enum {string}
 */
export enum Operator {
  NONE = '', // 연산자 없음
  ADD = '+', // 덧셈
  SUB = '-', // 뺄셈
  MUL = '×', // 곱셈
  DIV = '÷', // 나눗셈
  PCT = '%', // 퍼센트
  POW = 'pow', // 거듭제곱
  ROOT = 'root', // 제곱근
  MOD = 'mod', // 나머지
  BIT_SFT_R = 'bitSftR', // 오른쪽 시프트
  BIT_SFT_L = 'bitSftL', // 왼쪽 시프트
  BIT_AND = 'bitAnd', // 비트 AND
  BIT_OR = 'bitOr', // 비트 OR
  BIT_XOR = 'bitXor', // 비트 XOR
  BIT_NOT = 'bitNot', // 비트 NOT
  BIT_NAND = 'bitNand', // 비트 NAND
  BIT_NOR = 'bitNor', // 비트 NOR
  BIT_XNOR = 'bitXnor', // 비트 XNOR
  REC = 'rec', // 역수
  SQRT = 'sqrt', // 제곱근
  POW2 = 'pow2', // 제곱
  SIN = 'sin', // 사인 함수
  COS = 'cos', // 코사인 함수
  TAN = 'tan', // 탄젠트 함수
  FCT = 'fct', // 팩토리얼
  EXP10 = 'exp10', // 10의 거듭제곱
  INT = 'int', // 정수부 추출
  FRAC = 'frac', // 소수부 추출
}

/**
 * 수학 상수 정의 객체
 */
export const constants: { [key: string]: string } = {
  pi: MathB.pi.toString(), // 원주율
  pi2: MathB.bignumber(MathB.pi).div(2).toString(), // 원주율의 절반
  e: MathB.e.toString(), // 자연로그의 밑
  ln2: MathB.log(2).toString(), // 자연로그 2
  ln10: MathB.log(10).toString(), // 자연로그 10
  phi: MathB.phi.toString(), // 황금비
};

/**
 * 계산 결과 스냅샷 인터페이스
 * @interface
 * @description
 * 계산 과정과 결과를 저장하기 위한 데이터 구조
 * @property {string} previousNumber - 이전 숫자 (피연산자1)
 * @property {Operator | Operator[]} operator - 수행된 연산자
 * @property {string} [argumentNumber] - 현재 숫자 (피연산자2, 선택적)
 * @property {string} resultNumber - 계산 결과
 */
export interface CalculationResult {
  previousNumber: string;
  operator: Operator | Operator[];
  argumentNumber?: string;
  resultNumber: string;
}

/**
 * 단어 크기 열거형
 * @enum {number}
 * @description
 * 계산기에서 사용되는 단어 크기를 정의하는 열거형
 * @property {number} 0 - 무제한
 * @property {number} 4 - 4비트
 * @property {number} 8 - 8비트
 * @property {number} 16 - 16비트
 * @property {number} 32 - 32비트
 * @property {number} 64 - 64비트
 */
export type WordSize = 0 | 4 | 8 | 16 | 32 | 64;
