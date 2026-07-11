/**
 * @file CalcButtonSet.test.ts
 * @description 수식 계산기 키패드 '=' 버튼(d6)의 오류 처리 회귀 테스트.
 *              classifyFormulaError/expressionError를 거치지 않고 bare catch로
 *              generic 메시지만 보여주던 결함(UX-06 부분 미해결)이 재발하지 않는지 검증한다.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { getErrorMessage } from 'src/utils/ErrorUtils';

import type { ComposerTranslation } from 'vue-i18n';

vi.mock('src/utils/NotificationUtils', () => ({
  showMessage: vi.fn(),
  showError: vi.fn(),
}));

vi.stubGlobal('window', { electron: { setAlwaysOnTop: vi.fn() } });

describe('수식 계산기 "=" 키패드 (d6) 오류 처리', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  let createCalcButtonSet: (typeof import('../CalcButtonSet'))['createCalcButtonSet'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  let useFormulaStore: (typeof import('../../stores/formulaStore'))['useFormulaStore'];
  let showError: ReturnType<typeof vi.fn>;

  const identityT = ((key: string) => key) as unknown as ComposerTranslation;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    setActivePinia(createPinia());

    ({ createCalcButtonSet } = await import('../CalcButtonSet'));
    ({ useFormulaStore } = await import('../../stores/formulaStore'));
    ({ showError } = (await import('src/utils/NotificationUtils')) as unknown as {
      showError: ReturnType<typeof vi.fn>;
    });
  });

  const getD6Action = (): (() => void) => {
    const { modeSpecificButtons } = createCalcButtonSet(identityT);
    const entry = modeSpecificButtons.formula.d6;
    if (!entry) throw new Error('d6 button entry not found');
    return entry[3];
  };

  it('구문 오류(3++)는 error.formula.syntax로 지역화되어 표시된다 (제네릭 메시지 아님)', () => {
    const formulaStore = useFormulaStore();
    formulaStore.expression = '3++';

    getD6Action()();

    expect(showError).toHaveBeenCalledTimes(1);
    const shown = showError.mock.calls[0]?.[0] as string;
    expect(shown).toBe(getErrorMessage('error.formula.syntax'));
    // 옛 제네릭 키가 그대로 노출되지 않아야 함
    expect(shown).not.toBe('formulaEvaluationError');
  });

  it('평가 도중 발생한 예외(1/0 → non-finite)도 classifyFormulaError로 분류되어 표시된다', () => {
    const formulaStore = useFormulaStore();
    // expressionError()의 사전 검사는 통과하지만(mathjs가 Infinity를 반환),
    // evaluate() 내부의 isFinite 검사에서 던지는 예외 경로를 검증한다.
    formulaStore.expression = '1/0';

    getD6Action()();

    expect(showError).toHaveBeenCalledTimes(1);
    const shown = showError.mock.calls[0]?.[0] as string;
    expect(shown).toBe(getErrorMessage('error.formula.not_finite'));
  });

  it('매핑 불가한 예외는 detail이 실제로 치환된 메시지로 표시된다 (콜론 뒤 빈칸/괄호 부가 없음)', () => {
    const formulaStore = useFormulaStore();
    // 알 수 없는 심볼 → expressionError()에서 이미 unknown_symbol로 분류되는지 확인 겸
    // detail 치환 회귀(빈 문자열 방지)를 함께 검증
    formulaStore.expression = 'sin(';

    getD6Action()();

    expect(showError).toHaveBeenCalledTimes(1);
    const shown = showError.mock.calls[0]?.[0] as string;
    // 콜론 뒤 빈 칸 + 원문을 괄호로 덧붙이는 옛 방식의 흔적(' ()' 이중 표시)이 없어야 함
    expect(shown).not.toMatch(/:\s*\(/);
  });

  it('빈 수식이면 편집 모드로 진입할 뿐 오류를 표시하지 않는다', () => {
    const formulaStore = useFormulaStore();
    formulaStore.expression = '';
    formulaStore.closeEditDialog();

    getD6Action()();

    expect(showError).not.toHaveBeenCalled();
    expect(formulaStore.isEditDialogOpen).toBe(true);
  });
});
