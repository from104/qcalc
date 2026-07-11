import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { CalculatorMath } from '../../core/calculator/CalculatorMath';

vi.mock('src/i18n/initLocale', () => ({
  i18n: { global: { t: (key: string) => key } },
}));

vi.stubGlobal('window', { electron: { setAlwaysOnTop: vi.fn() } });

describe('formulaStore 삼각함수 도 단위 기준 (BENCH-02)', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  let useFormulaStore: (typeof import('../formulaStore'))['useFormulaStore'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  let useCalcStore: (typeof import('../calcStore'))['useCalcStore'];

  beforeEach(async () => {
    vi.resetModules();
    setActivePinia(createPinia());
    useFormulaStore = (await import('../formulaStore')).useFormulaStore;
    useCalcStore = (await import('../calcStore')).useCalcStore;
  });

  const evalExpr = (expr: string): string => {
    const f = useFormulaStore();
    const c = useCalcStore();
    f.expression = expr;
    f.evaluate();
    return c.calc.currentNumber;
  };

  const math = new CalculatorMath();

  it('sin(90)이 기본 계산기와 동일하게 1이어야 한다', () => {
    expect(evalExpr('sin(90)')).toBe('1');
    expect(evalExpr('sin(90)')).toBe(math.sin('90')); // 두 계산기 기준 일치 (필수 수용 기준)
  });

  it('cos(0)=1, cos(90)≈0 (도 단위)', () => {
    expect(evalExpr('cos(0)')).toBe('1');
    expect(Number(evalExpr('cos(90)'))).toBeCloseTo(0, 10);
  });

  it('tan(45)이 기본 계산기와 전체 정밀도까지 동일해야 한다', () => {
    expect(evalExpr('tan(45)')).toBe(math.tan('45'));
  });

  it('sin(30)+cos(60)=1 (도 단위 복합식)', () => {
    expect(evalExpr('sin(30)+cos(60)')).toBe('1');
  });

  it('역삼각 asin(1)은 라디안(≈1.57)이 아니라 도(90)를 반환해야 한다', () => {
    expect(Number(evalExpr('asin(1)'))).toBeCloseTo(90, 10);
  });

  it('acos(0)=90, atan(1)=45, atan2(1,1)=45 (도)', () => {
    expect(Number(evalExpr('acos(0)'))).toBeCloseTo(90, 10);
    expect(Number(evalExpr('atan(1)'))).toBeCloseTo(45, 10);
    expect(Number(evalExpr('atan2(1,1)'))).toBeCloseTo(45, 10);
  });

  it('비삼각 수식은 스코프 주입 영향 없이 정상 평가된다', () => {
    expect(evalExpr('2+3*4')).toBe('14');
    expect(evalExpr('sqrt(16)')).toBe('4');
  });

  it('isExpressionValid는 삼각/비삼각 모두 유효 판정한다', () => {
    const f = useFormulaStore();
    f.expression = 'sin(90)';
    expect(f.isExpressionValid()).toBe(true);
    f.expression = 'sin(';
    expect(f.isExpressionValid()).toBe(false);
  });
});
