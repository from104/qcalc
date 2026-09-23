/**
 * @file FormulaMath.ts
 * @description 수식 계산기 전용 mathjs 전체 인스턴스를 지연 로드합니다.
 *              mathjs 전체는 번들에서 가장 큰 덩어리라 앱 시작 경로에서 빼고,
 *              수식 계산기 진입(또는 유휴 시간 프리페치) 시점에 한 번만 불러옵니다.
 *              도움말이 약속한 "mathjs의 모든 수학 함수"는 이 인스턴스로 유지됩니다.
 */

import type { FactoryFunctionMap, MathJsInstance } from 'mathjs';

let instance: MathJsInstance | null = null;
let loading: Promise<MathJsInstance> | null = null;

/** 로드된 인스턴스를 반환합니다. 아직 로드 전이면 null. */
export function getFormulaMath(): MathJsInstance | null {
  return instance;
}

/** 전체 mathjs 인스턴스를 로드합니다. 여러 번 호출해도 한 번만 로드됩니다. */
export function loadFormulaMath(): Promise<MathJsInstance> {
  if (instance) return Promise.resolve(instance);
  // 경량 인스턴스(CalculatorMath)와 모듈을 공유하면 Rollup이 공유분을 시작 chunk에 붙이므로,
  // 자체 완결형 브라우저 번들을 불러와 완전히 별도 chunk로 분리한다.
  loading ??= import('mathjs/lib/browser/math.js').then((mod) => {
    const { all, create } = ((mod as { default?: MathJsInstance }).default ?? mod) as MathJsInstance & {
      all: FactoryFunctionMap;
    };
    // 브라우저 번들은 create()의 config 인자를 반영하지 않아(15.1.1 실측) 생성 후 따로 설정한다
    instance = create(all);
    instance.config({ number: 'BigNumber', precision: 64 });
    return instance;
  });
  return loading;
}

/**
 * 수식 계산기용 삼각함수 스코프 (도 단위)
 * @description mathjs 기본 삼각함수는 라디안 기준이지만, 기본 계산기(CalculatorMath.sin 등)는
 *              도(degree)를 사용한다. 수식 계산기가 기본 계산기와 동일한 각도 기준을 쓰도록
 *              sin/cos/tan/asin/acos/atan/atan2를 도 단위로 오버라이드한 스코프를 반환한다.
 *              - 순삼각(sin/cos/tan): 입력을 도로 간주하여 라디안 변환 후 계산
 *              - 역삼각(asin/acos/atan/atan2): 라디안 결과를 도로 변환하여 반환
 *              반환값은 BigNumber로 유지되어 정밀도 손실이 없다.
 *              매 평가마다 새 객체를 반환하여 스코프 변수 대입에 의한 상태 누적을 방지한다.
 * @param math - 평가에 쓰는 mathjs 인스턴스 (BigNumber 클래스를 인스턴스 안에서 일치시킨다)
 * @returns mathjs evaluate scope에 주입할 함수 맵
 */
export function createFormulaTrigScope(math: MathJsInstance): Record<string, (...args: BigNumber[]) => BigNumber> {
  const bn = (x: BigNumber): BigNumber => math.bignumber(x) as unknown as BigNumber;
  const pi = math.pi as unknown as BigNumber;
  const degToRad = (x: BigNumber): BigNumber => bn(x).times(pi).div(180);
  const radToDeg = (x: BigNumber): BigNumber => bn(x).times(180).div(pi);
  return {
    sin: (x) => degToRad(x).sin(),
    cos: (x) => degToRad(x).cos(),
    tan: (x) => degToRad(x).tan(),
    asin: (x) => radToDeg(bn(x).asin()),
    acos: (x) => radToDeg(bn(x).acos()),
    atan: (x) => radToDeg(bn(x).atan()),
    atan2: (y, x) => radToDeg(math.evaluate('atan2(y, x)', { y, x }) as BigNumber),
  };
}
