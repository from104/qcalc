/**
 * @file formulaStore.ts
 * @description 수식 계산기 모드의 상태와 로직을 관리하는 스토어입니다.
 *              수식 입력, 평가, 단항 연산 래핑, 수식 편집 다이얼로그 상태를 담당합니다.
 */

import { defineStore } from 'pinia';
import { MathB } from '../core/calculator/CalculatorMath';
import { useCalcStore } from './calcStore';
import { formatDecimalPlaces } from '../utils/NumberUtils';

interface FormulaState {
  expression: string; // 현재 입력 중인 수식 (@는 currentNumber, $는 메모리 값 플레이스홀더)
  lastExpression: string; // 직전 평가된 수식 (ResultField label 표시용)
  isEditDialogOpen: boolean; // 인라인 편집 모드 활성화 여부
  isHelpOpen: boolean; // mathjs 참조 메뉴 표시 여부
  historyIndex: number; // 히스토리 탐색 인덱스 (-1: 현재 입력)
  savedExpression: string; // 히스토리 탐색 전 사용자 입력 백업
  _isNavigating: boolean; // historyUp/Down에 의한 expression 변경 여부 (내부용)
  _editOpenedAt: number; // 편집 모드 진입 시각 (Enter keyup 가드용)
}

export const useFormulaStore = defineStore('formula', {
  state: (): FormulaState => ({
    expression: '',
    lastExpression: '',
    isEditDialogOpen: false,
    isHelpOpen: false,
    historyIndex: -1,
    savedExpression: '',
    _isNavigating: false,
    _editOpenedAt: 0,
  }),

  actions: {
    /** 수식 끝에 문자열 추가
     *  수식이 비어 있고 이항 연산자(+, *, /, ^, %)로 시작하면 '@'를 자동 선행 삽입 */
    append(s: string): void {
      if (!this.expression && /^[+\-*/^%]/.test(s)) {
        this.expression = '@' + s;
      } else {
        if (!this.canAppend(s)) return;
        this.expression += s;
      }
    },

    /** 수식 마지막 글자 삭제 */
    deleteChar(): void {
      if (this.expression.length > 0) {
        this.expression = this.expression.slice(0, -1);
      }
    },

    /** 수식 입력 필드만 초기화 (FC 버튼) */
    clearExpression(): void {
      this.expression = '';
    },

    /** 수식 + currentNumber 모두 초기화 (C 버튼) */
    clearAll(): void {
      this.expression = '';
      this.lastExpression = '';
      const calcStore = useCalcStore();
      calcStore.calc.reset();
    },

    /**
     * 수식 내 플레이스홀더(@, $)를 실제 값으로 치환합니다.
     * - @ → calc.currentNumber
     * - $ → calc.memory 값 (비어 있으면 Error throw)
     */
    _resolvePlaceholders(expr: string): string {
      const calcStore = useCalcStore();
      const currentValue = formatDecimalPlaces(calcStore.calc.currentNumber, -1, 10);
      let resolved = expr.replace(/@/g, currentValue);

      if (resolved.includes('$')) {
        if (calcStore.calc.memory.isEmpty) {
          throw new Error('memory is empty');
        }
        const memoryValue = formatDecimalPlaces(calcStore.calc.memory.getNumber(), -1, 10);
        resolved = resolved.replace(/\$/g, memoryValue);
      }

      return resolved;
    },

    /**
     * 수식을 평가합니다.
     * - @ 는 평가 직전에 calc.currentNumber 로 치환
     * - $ 는 평가 직전에 calc.memory 값으로 치환
     * - 성공 시 calc.currentNumber 에 결과를 반영하고 히스토리에 저장
     * - 실패 시 Error를 throw (호출부에서 노티 처리)
     */
    evaluate(): void {
      this.expression = this.expression.trim();
      if (!this.expression) return;

      const resolved = this._resolvePlaceholders(this.expression);

      // mathjs 평가 (실패 시 throw)
      const raw: unknown = MathB.evaluate(resolved);

      // BigNumber / 일반 number → string 변환
      const resultStr: string =
        raw !== null && typeof raw === 'object' && 'toFixed' in raw
          ? (raw as { toFixed: () => string }).toFixed()
          : String(raw);

      if (!isFinite(Number(resultStr))) {
        throw new Error('non-finite result');
      }

      // calc.currentNumber에 결과 반영 (5개 계산기 공유)
      const calcStore = useCalcStore();
      calcStore.calc.currentNumber = resultStr;
      calcStore.calc.offBufferReset();

      // 히스토리 저장 (resolved: @/$ 치환된 수식)
      calcStore.calc.record.addRecord(
        { previousNumber: '', operator: [], resultNumber: resultStr },
        'formula',
        resolved,
      );

      this.lastExpression = resolved;
      this.clearExpression();
      this.resetHistory();
    },

    /**
     * 수식의 마지막 피연산자(숫자/함수/괄호/곱나누 체인)를 wrapFn으로 감쌉니다.
     * 연산자/열린 괄호/빈 식으로 끝나는 경우 무시됩니다.
     *
     * @example
     * expression = "3 + 5 * 2"  →  wrapFn = s => `(${s})^2`
     * result     = "3 + (5 * 2)^2"
     */
    wrapLastToken(wrapFn: (inner: string) => string): void {
      const expr = this.expression.trimEnd();
      // 수식이 비어 있으면 '@'(현재 계산값)를 피연산자로 자동 사용
      if (!expr) {
        this.expression = wrapFn('@');
        return;
      }
      // 이항 연산자, 열린 괄호, 쉼표로 끝나면 무시
      if (/[+\-*/^%,(]$/.test(expr)) return;

      const start = this._findWrapStart(expr);
      const inner = expr.slice(start).trim();
      const before = expr.slice(0, start);
      this.expression = before + wrapFn(inner);
    },

    /**
     * 오른쪽부터 스캔하여 래핑 범위의 시작 인덱스를 반환합니다.
     * 괄호 깊이 0인 첫 번째 이항 +/- 의 다음 위치를 반환합니다.
     * 없으면 0 (전체 감싸기).
     */
    _findWrapStart(expr: string): number {
      let depth = 0;
      for (let i = expr.length - 1; i >= 0; i--) {
        const ch = expr[i];
        if (ch === ')') depth++;
        else if (ch === '(') depth--;
        else if (depth === 0 && (ch === '+' || ch === '-') && i > 0) {
          // 이항 연산자로 판단 (i > 0 이므로 단항 음수 제외)
          return i + 1;
        }
      }
      return 0; // 전체 감싸기
    },

    /** formula 모드 기록만 반환 (최신순, expression 배열) */
    _getFormulaHistory(): string[] {
      const calcStore = useCalcStore();
      return calcStore.calc.record
        .getAllRecords()
        .filter((r) => r.mode === 'formula' && r.expression)
        .map((r) => r.expression!);
    },

    /** 히스토리 탐색 초기화 */
    resetHistory(): void {
      this.historyIndex = -1;
      this.savedExpression = '';
    },

    /** ↑ 키: 이전 수식으로 이동 */
    historyUp(): void {
      const history = this._getFormulaHistory();
      if (history.length === 0) return;
      if (this.historyIndex === -1) {
        this.savedExpression = this.expression;
      }
      if (this.historyIndex < history.length - 1) {
        this._isNavigating = true;
        this.historyIndex++;
        this.expression = history[this.historyIndex]!;
        this._isNavigating = false;
      }
    },

    /** ↓ 키: 다음 수식으로 이동 */
    historyDown(): void {
      if (this.historyIndex < 0) return;
      this._isNavigating = true;
      this.historyIndex--;
      if (this.historyIndex === -1) {
        this.expression = this.savedExpression;
      } else {
        const history = this._getFormulaHistory();
        this.expression = history[this.historyIndex]!;
      }
      this._isNavigating = false;
    },

    openEditDialog(): void {
      this.isEditDialogOpen = true;
      this._editOpenedAt = Date.now();
    },

    closeEditDialog(): void {
      this.isEditDialogOpen = false;
      this.isHelpOpen = false;
      this.resetHistory();
    },

    toggleHelp(): void {
      this.isHelpOpen = !this.isHelpOpen;
    },

    /**
     * 수식 끝 상태와 추가할 문자열 s를 비교하여 입력 허용 여부를 반환합니다.
     *
     * 분류:
     *  - 숫자(digit): /^\d/
     *  - 연산자(operator): /^[+\-*\/^%]$/  (단일 문자)
     *  - 열린 괄호/함수(openParen): '(' 또는 알파벳으로 시작하며 '('로 끝나는 문자열
     *  - 닫힌 괄호(closeParen): ')'
     *  - 소수점(decimal): '.'
     *  - 상수/식별자(constant): '@' 또는 알파벳으로 시작하며 '('로 끝나지 않는 문자열
     */
    canAppend(s: string): boolean {
      const expr = this.expression.trimEnd();

      const isDigit = /^\d/.test(s);
      const isOperator = /^[+\-*/^%]$/.test(s);
      const isOpenParen = s === '(' || (/^[a-zA-Z]/.test(s) && s.endsWith('('));
      const isCloseParen = s === ')';
      const isDecimal = s === '.';
      const isPlaceholder = s === '@' || s === '$';
      const isConstant = /^[@$a-zA-Z]/.test(s) && !s.endsWith('(');

      // @, $ 단독 토큰 강제: 앞에 숫자/문자/@/$ 불가
      if (isPlaceholder && expr) {
        const lastChar = expr[expr.length - 1]!;
        if (/[\d.a-zA-Z@$)]/.test(lastChar)) return false;
      }

      // 빈 수식: ')' 와 '.' 만 불가
      if (!expr) return !isCloseParen && !isDecimal;

      const lastChar = expr[expr.length - 1]!;
      const depth = (expr.match(/\(/g) ?? []).length - (expr.match(/\)/g) ?? []).length;

      // @, $ 뒤에 숫자/소수점/@/$ 불가
      if (/[@$]/.test(lastChar)) {
        if (isDigit || isDecimal || isPlaceholder) return false;
        if (isOperator) return true;
        if (isCloseParen) return depth > 0;
        return false;
      }

      if (/\d/.test(lastChar)) {
        if (isDigit) return true;
        if (isDecimal) {
          const tokenMatch = expr.match(/[\d.]+$/);
          return tokenMatch ? !tokenMatch[0].includes('.') : true;
        }
        if (isOperator) return true;
        if (isCloseParen) return depth > 0;
        return false;
      }

      if (lastChar === '.') return isDigit;

      if (/[a-zA-Z]/.test(lastChar)) {
        if (isOperator) return true;
        if (isCloseParen) return depth > 0;
        return false;
      }

      if (/[+\-*/^%]/.test(lastChar)) {
        if (isCloseParen || isDecimal) return false;
        if (isDigit || isConstant || isOpenParen) return true;
        if (s === '-') return true; // 단항 음수 (예: 3*-5)
        return false;
      }

      if (lastChar === '(') {
        if (isDigit || isConstant || isOpenParen) return true;
        if (s === '-') return true; // 단항 음수
        return false;
      }

      if (lastChar === ')') {
        if (isOperator) return true;
        if (isCloseParen) return depth > 0;
        return false;
      }

      return true;
    },

    /**
     * @, $ 플레이스홀더가 단독 토큰으로 사용되었는지 검사합니다.
     * - 앞뒤에 숫자, 문자, 소수점, 다른 플레이스홀더가 붙으면 false
     */
    _hasValidPlaceholders(expr: string): boolean {
      if (!/@|\$/.test(expr)) return true;
      // 숫자/문자/소수점/@/$ 바로 앞뒤에 @/$가 있으면 invalid
      return !/[\d.a-zA-Z@$][@$]|[@$][\d.a-zA-Z@$]/.test(expr);
    },

    /**
     * 현재 수식이 mathjs로 평가 가능한지 여부를 반환합니다.
     * 빈 수식은 true (오류 없음), @는 현재 계산기 값으로 치환하여 시도합니다.
     * @/$ 토큰 규칙 위반 시에도 false를 반환합니다.
     */
    isExpressionValid(): boolean {
      const expr = this.expression.trim();
      if (!expr) return true;
      if (!this._hasValidPlaceholders(expr)) return false;
      try {
        const resolved = this._resolvePlaceholders(expr);
        MathB.evaluate(resolved);
        return true;
      } catch {
        return false;
      }
    },
  },

  persist: {
    pick: ['expression', 'lastExpression', 'isEditDialogOpen', 'isHelpOpen'],
  },
});
