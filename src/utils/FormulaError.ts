/**
 * @file FormulaError.ts
 * @description mathjs 평가 예외 메시지를 i18n 가능한 오류 카테고리로 분류합니다.
 *              매핑되는 카테고리는 지역화된 메시지만 표시하고,
 *              매핑 불가한 경우 정제된 원문(detail)을 부가 정보로 함께 전달합니다.
 */

export interface FormulaErrorInfo {
  /** 'error.formula.*' 또는 재사용 오류 i18n 키 */
  key: string;
  /** 매핑 불가 시 표시할 정제된 원문 (지역화된 메시지 뒤에 부가) */
  detail?: string;
}

/**
 * mathjs 예외 메시지(또는 앱 내부 throw 문자열)를 오류 카테고리로 분류합니다.
 * @param rawMessage Error.message 원문
 */
export function classifyFormulaError(rawMessage: string): FormulaErrorInfo {
  const msg = (rawMessage ?? '').trim();

  // 빈/미완성 메시지 (방어적) → 구문 오류로 취급
  if (!msg) return { key: 'error.formula.syntax' };

  // 앱 내부 throw: 메모리 비어 있음 → 기존 키 재사용
  if (/memory is empty/i.test(msg)) return { key: 'error.calc.no_memory' };

  // 앱 내부 throw: 비유한 결과 (0으로 나누기 등)
  if (/non-finite result|infinit/i.test(msg)) return { key: 'error.formula.not_finite' };

  // 괄호 불일치 ("Parenthesis ) expected", "Unexpected operator )")
  if (/parenthesis/i.test(msg) || /unexpected operator \)/i.test(msg)) {
    return { key: 'error.formula.paren_mismatch' };
  }

  // 알 수 없는 기호/함수 ("Undefined symbol x", "Undefined function foo")
  if (/undefined (symbol|function)/i.test(msg)) {
    return { key: 'error.formula.unknown_symbol' };
  }

  // 미완성/일반 구문 오류
  if (
    /unexpected end of expression|value expected|unexpected part|syntax error|unexpected operator|too (few|many) arguments/i.test(
      msg,
    )
  ) {
    return { key: 'error.formula.syntax' };
  }

  // 매핑 불가 → 정제된 원문을 부가 정보로
  return { key: 'error.formula.evaluation', detail: msg };
}
