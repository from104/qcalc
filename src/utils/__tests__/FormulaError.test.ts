import { describe, it, expect } from 'vitest';
import { classifyFormulaError } from '../FormulaError';
import { MathB } from '../../core/calculator/CalculatorMath';

const classifyOf = (expr: string) => {
  try {
    MathB.evaluate(expr);
    return null;
  } catch (e) {
    return classifyFormulaError(e instanceof Error ? e.message : String(e));
  }
};

describe('classifyFormulaError (UX-06)', () => {
  it('빈 수식은 예외를 던지지 않는다 (오류 없음)', () => {
    expect(classifyOf('')).toBeNull();
    // 분류기 자체의 방어적 동작: 빈 메시지가 들어오면 구문 오류로 취급
    expect(classifyFormulaError('').key).toBe('error.formula.syntax');
  });

  it('괄호 불일치를 error.formula.paren_mismatch로 분류한다', () => {
    expect(classifyOf('(1+2')?.key).toBe('error.formula.paren_mismatch');
    expect(classifyOf('1+2)')?.key).toBe('error.formula.paren_mismatch');
  });

  it('미지 기호/함수를 error.formula.unknown_symbol로 분류한다', () => {
    expect(classifyOf('x+1')?.key).toBe('error.formula.unknown_symbol');
    expect(classifyOf('foo(2)')?.key).toBe('error.formula.unknown_symbol');
  });

  it('미완성/일반 구문 오류를 error.formula.syntax로 분류한다', () => {
    expect(classifyOf('3++')?.key).toBe('error.formula.syntax');
  });

  it('앱 내부 throw 문자열을 기존 키로 매핑한다', () => {
    expect(classifyFormulaError('memory is empty').key).toBe('error.calc.no_memory');
    expect(classifyFormulaError('non-finite result').key).toBe('error.formula.not_finite');
  });

  it('매핑 불가한 메시지는 error.formula.evaluation과 원문 detail로 fallback한다', () => {
    const r = classifyFormulaError('some weird message');
    expect(r.key).toBe('error.formula.evaluation');
    expect(r.detail).toBe('some weird message');
  });
});
