import { create, all, BigNumber as tBigNumber } from 'mathjs';

/**
 * MathJS 라이브러리 설정
 * - BigNumber 타입 사용으로 정밀한 계산 지원
 * - 정밀도 64비트로 설정하여 높은 정확도 보장
 */
export const MathB = create(all, {
  number: 'BigNumber',
  precision: 128,
});

export const BigNumber = MathB.bignumber;

export type typeBigNumber = tBigNumber;

/**
 * 계산기에서 사용되는 연산자 열거형
 * @enum {string}
 * @description
 * 각 연산자에 대한 문자열 표현과 설명:
 * - NONE: 연산자 없음 ('')
 * - ADD: 덧셈 ('+')
 * - SUB: 뺄셈 ('-')
 * - MUL: 곱셈 ('×')
 * - DIV: 나눗셈 ('÷')
 * - PCT: 퍼센트 ('%')
 * - POW: 거듭제곱 ('pow')
 * - ROOT: 제곱근 ('root')
 * - MOD: 나머지 ('mod')
 * - BIT_SFT_R: 오른쪽 시프트 ('bitSftR')
 * - BIT_SFT_L: 왼쪽 시프트 ('bitSftL')
 * - BIT_AND: 비트 AND ('bitAnd')
 * - BIT_OR: 비트 OR ('bitOr')
 * - BIT_XOR: 비트 XOR ('bitXor')
 * - BIT_NOT: 비트 NOT ('bitNot')
 * - BIT_COMP: 비트 보수 ('bitComp')
 * - REC: 역수 ('rec')
 * - SQRT: 제곱근 ('sqrt')
 * - POW2: 제곱 ('pow2')
 * - SIN: 사인 함수 ('sin')
 * - COS: 코사인 함수 ('cos')
 * - TAN: 탄젠트 함수 ('tan')
 * - FCT: 팩토리얼 ('fct')
 * - EXP10: 10의 거듭제곱 ('exp10')
 * - INT: 정수부 추출 ('int')
 * - FRAC: 소수부 추출 ('frac')
 */
export enum Operator {
  NONE = '',
  ADD = '+',
  SUB = '-',
  MUL = '×',
  DIV = '÷',
  PCT = '%',
  POW = 'pow',
  ROOT = 'root',
  MOD = 'mod',
  BIT_SFT_R = 'bitSftR',
  BIT_SFT_L = 'bitSftL',
  BIT_AND = 'bitAnd',
  BIT_OR = 'bitOr',
  BIT_XOR = 'bitXor',
  BIT_NOT = 'bitNot',
  BIT_NAND = 'bitNand',
  BIT_NOR = 'bitNor',
  BIT_XNOR = 'bitXnor',
  REC = 'rec',
  SQRT = 'sqrt',
  POW2 = 'pow2',
  SIN = 'sin',
  COS = 'cos',
  TAN = 'tan',
  FCT = 'fct',
  EXP10 = 'exp10',
  INT = 'int',
  FRAC = 'frac'
}

/**
 * 수학 상수 정의 객체
 * @description
 * 자주 사용되는 수학 상수들을 BigNumber 형식으로 저장
 * - pi: 원주율 (π)
 * - pi2: π/2
 * - e: 자연상수
 * - ln2: 2의 자연로그
 * - ln10: 10의 자연로그
 * - phi: 황금비
 */
export const constants: { [key: string]: string } = {
  pi: MathB.pi.toString(),
  pi2: MathB.bignumber(MathB.pi).div(2).toString(),
  e: MathB.e.toString(),
  ln2: MathB.log(2).toString(),
  ln10: MathB.log(10).toString(),
  phi: MathB.phi.toString(),
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

export type WordSize = 0 | 4 | 8 | 16 | 32 | 64;
