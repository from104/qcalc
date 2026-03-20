/**
 * @file CalcButtonSet.ts
 * @description 이 파일은 계산기 버튼 세트를 구성하는 상수 파일입니다.
 *              다양한 계산 기능을 수행하는 버튼을 정의하며,
 *              각 버튼의 동작 및 속성을 설정합니다.
 */

import { match } from 'ts-pattern';

import type { ComposerTranslation } from 'vue-i18n';
import type { ButtonType } from '../types/store';

import { toBigNumber } from 'core/calculator/CalculatorMath';
import { Operator } from 'core/calculator/Calculator';
import { showMessage, showError } from 'src/utils/NotificationUtils';

import { useCalcStore } from 'src/stores/calcStore';
import { useFormulaStore } from 'src/stores/formulaStore';
import { useUIStore } from 'src/stores/uiStore';

const calcStore = useCalcStore();
const formulaStore = useFormulaStore();
const uiStore = useUIStore();

const { calc } = calcStore;

// ComposerTranslation 타입 사용
export function createCalcButtonSet(t: ComposerTranslation) {
  // 시프트 버튼 메서드
  const handleShift = () => {
    calcStore.toggleShift();
    calcStore.disableShiftLock();
  };

  // 시프트 버튼 잠금 메서드
  const handleShiftLock = () => {
    console.log('handleShiftLock');
    if (calcStore.isShiftLocked) {
      calcStore.disableShiftLock();
      calcStore.disableShift();
    } else {
      calcStore.enableShiftLock();
      calcStore.enableShift();
    }
  };

  // 비트 연산 사전 처리 메서드
  const bitOperationPreprocessing = (action: () => void, isBinary: boolean = true) => {
    if (toBigNumber(calc.currentNumber).abs().floor().toString() !== calc.currentNumber) {
      calc.currentNumber = toBigNumber(calc.currentNumber).abs().floor().toString();
      if (isBinary) {
        showMessage(t('bitOperationPreprocessingReady'));
      } else {
        showMessage(t('bitOperationPreprocessingCompleted'));
      }
    }
    action();
  };

  // 비트 연산 등호 메서드
  const equalForBitOperation = () => {
    const isBitwiseOperationwithBinary = match(calc.getCurrentOperator())
      .with(
        Operator.BIT_AND,
        Operator.BIT_OR,
        Operator.BIT_XOR,
        Operator.BIT_NAND,
        Operator.BIT_NOR,
        Operator.BIT_XNOR,
        Operator.BIT_SFT_L,
        Operator.BIT_SFT_R,
        () => true,
      )
      .otherwise(() => false);

    if (isBitwiseOperationwithBinary) {
      bitOperationPreprocessing(() => calc.equal(), false);
    } else {
      calc.equal();
    }
  };

  // 메모리 표시 함수
  const displayMemoryStatus = () => {
    if (!calc.memory.isEmpty) {
      setTimeout(() => {
        calcStore.showMemoryTemporarily();
      }, 10);
    }
  };

  // 버튼 타입 정의
  type CalculatorButtonDefinition = {
    [id: string]: [
      label: string,
      color: ButtonType,
      keys: string[],
      action: () => void,
      isDisabled: boolean | (() => boolean),
    ];
  };

  type CalculatorModeButtons = { [key in 'unit' | 'currency' | 'radix' | 'formula']: CalculatorButtonDefinition };

  // prettier-ignore
  const standardButtons: CalculatorButtonDefinition = {
    a1: ['x²', 'function', ['u'], () => calc.executeUnary(Operator.POW2), false],
    b1: ['√x', 'function', ['i'], () => calc.executeUnary(Operator.SQRT), false],
    c1: ['Ｃ', 'important', ['Delete'], () => calc.reset(), false],
    d1: ['@mdi-backspace', 'important', ['Backspace'], () => calc.deleteDigitOrDot(), false],
    a2: ['@mdi-plus-minus-variant', 'function', ['j'], () => calc.changeSign(), false],
    b2: ['%', 'function', ['Shift+Digit5','k'], () => calc.percent(), false],
    c2: ['1/x', 'function', ['l'], () => calc.executeUnary(Operator.REC), false],
    d2: ['@mdi-division', 'function', ['/'], () => calc.executeBinary(Operator.DIV), false],
    a3: ['7', 'normal', ['7'], () => calc.addDigit(7), false],
    b3: ['8', 'normal', ['8'], () => calc.addDigit(8), false],
    c3: ['9', 'normal', ['9'], () => calc.addDigit(9), false],
    d3: ['@mdi-close', 'function', ['*'], () => calc.executeBinary(Operator.MUL), false],
    a4: ['4', 'normal', ['4'], () => calc.addDigit(4), false],
    b4: ['5', 'normal', ['5'], () => calc.addDigit(5), false],
    c4: ['6', 'normal', ['6'], () => calc.addDigit(6), false],
    d4: ['@mdi-minus', 'function', ['-'], () => calc.executeBinary(Operator.SUB), false],
    a5: ['1', 'normal', ['1'], () => calc.addDigit(1), false],
    b5: ['2', 'normal', ['2'], () => calc.addDigit(2), false],
    c5: ['3', 'normal', ['3'], () => calc.addDigit(3), false],
    d5: ['@mdi-plus', 'function', ['+'], () => calc.executeBinary(Operator.ADD), false],
    a6: ['@keyboard_capslock', 'important', ['\''], () => handleShift(), false],
    b6: ['0', 'normal', ['0'], () => calc.addDigit(0), false],
    c6: ['@mdi-circle-small', 'normal', ['.'], () => calc.addDot(), false],
    d6: ['@mdi-equal', 'important', ['=', 'Enter'], () => equalForBitOperation(), false],
  };

  // prettier-ignore
  const modeSpecificButtons: CalculatorModeButtons = {
    unit: {},
    currency: {},
    radix: {
        a1: ['x<<y', 'function', ['u'], () => bitOperationPreprocessing(() => calc.executeBinary(Operator.BIT_SFT_L)), false],
        b1: ['x>>y', 'function', ['i'], () => bitOperationPreprocessing(() => calc.executeBinary(Operator.BIT_SFT_R)), false],
        a2: ['AND', 'function', ['j'], () => bitOperationPreprocessing(() => calc.executeBinary(Operator.BIT_AND)), false],
        b2: ['OR', 'function', ['k'], () => bitOperationPreprocessing(() => calc.executeBinary(Operator.BIT_OR)), false],
        c2: ['XOR', 'function', ['l'], () => bitOperationPreprocessing(() => calc.executeBinary(Operator.BIT_XOR)), false],
    },
    // formula 모드: row-0(수식전용) + row1-6 전부 정의 (standardButtons 미사용, 순서 보장)
    formula: {
      // Row 0: 수식 전용 버튼
      a0: ['(', 'function', ['('], () => formulaStore.append('('), () => !formulaStore.canAppend('(')],
      b0: [')', 'function', [')'], () => formulaStore.append(')'), () => !formulaStore.canAppend(')')],
      c0: ['@alternate_email', 'normal', ['@'], () => formulaStore.append('@'), () => !formulaStore.canAppend('@')],
      d0: ['?', 'important', ['?'], () => formulaStore.toggleHelp(), false],
      // Row 1
      a1: ['x²', 'function', ['u'], () => formulaStore.wrapLastToken((s) => `(${s})^2`), false],
      b1: ['√x', 'function', ['i'], () => formulaStore.wrapLastToken((s) => `sqrt(${s})`), false],
      c1: ['Ｃ', 'important', ['Delete'], () => formulaStore.clearAll(), false],
      d1: ['@mdi-backspace', 'important', ['Backspace'], () => formulaStore.deleteChar(), false],
      // Row 2
      a2: ['@mdi-plus-minus-variant', 'function', ['j'], () => formulaStore.wrapLastToken((s) => `-(${s})`), false],
      b2: ['%', 'function', ['k'], () => formulaStore.append('%'), () => !formulaStore.canAppend('%')],
      c2: ['1/x', 'function', ['l'], () => formulaStore.wrapLastToken((s) => `1/(${s})`), false],
      d2: ['@mdi-division', 'function', ['/'], () => formulaStore.append('/'), () => !formulaStore.canAppend('/')],
      // Row 3
      a3: ['7', 'normal', ['7'], () => formulaStore.append('7'), () => !formulaStore.canAppend('7')],
      b3: ['8', 'normal', ['8'], () => formulaStore.append('8'), () => !formulaStore.canAppend('8')],
      c3: ['9', 'normal', ['9'], () => formulaStore.append('9'), () => !formulaStore.canAppend('9')],
      d3: ['@mdi-close', 'function', ['*'], () => formulaStore.append('*'), () => !formulaStore.canAppend('*')],
      // Row 4
      a4: ['4', 'normal', ['4'], () => formulaStore.append('4'), () => !formulaStore.canAppend('4')],
      b4: ['5', 'normal', ['5'], () => formulaStore.append('5'), () => !formulaStore.canAppend('5')],
      c4: ['6', 'normal', ['6'], () => formulaStore.append('6'), () => !formulaStore.canAppend('6')],
      d4: ['@mdi-minus', 'function', ['-'], () => formulaStore.append('-'), () => !formulaStore.canAppend('-')],
      // Row 5
      a5: ['1', 'normal', ['1'], () => formulaStore.append('1'), () => !formulaStore.canAppend('1')],
      b5: ['2', 'normal', ['2'], () => formulaStore.append('2'), () => !formulaStore.canAppend('2')],
      c5: ['3', 'normal', ['3'], () => formulaStore.append('3'), () => !formulaStore.canAppend('3')],
      d5: ['@mdi-plus', 'function', ['+'], () => formulaStore.append('+'), () => !formulaStore.canAppend('+')],
      // Row 6
      a6: ['@keyboard_capslock', 'important', ["'"], () => handleShift(), false],
      b6: ['0', 'normal', ['0'], () => formulaStore.append('0'), () => !formulaStore.canAppend('0')],
      c6: ['@mdi-circle-small', 'normal', ['.'], () => formulaStore.append('.'), () => !formulaStore.canAppend('.')],
      d6: ['@mdi-equal', 'important', ['=', 'Enter'], () => { if (!formulaStore.expression) { formulaStore.openEditDialog(); uiStore.inputFocused = true; return; } try { formulaStore.evaluate(); } catch { showError(t('formulaEvaluationError')); } }, false],
    },
  };

  // 버튼 기능 정의
  type ExtendedButtonFunction = {
    [key: string]: [label: string, shortcutKeys: string[], action: () => void, isDisabled: boolean | (() => boolean)];
  };

  type ExtendedButtonFunctionsByMode = { [key in 'unit' | 'currency' | 'radix' | 'formula']: ExtendedButtonFunction };

  // 공통으로 사용할 기본 버튼 기능
  // prettier-ignore
  const standardExtendedFunctions: ExtendedButtonFunction = {
    a1: ['xⁿ', ['r'], () => calc.executeBinary(Operator.POW), false],
    b1: ['ⁿ√x', ['t'], () => calc.executeBinary(Operator.ROOT), false],
    c1: ['MC', ['Control+Delete'], () => {calc.memory.clear(); calcStore.onNeedButtonNotification();}, false],
    d1: ['MR', ['Control+Backspace'], () => { calc.memory.recall(); calc.refreshBuffer(); displayMemoryStatus(); calcStore.onNeedButtonNotification(); }, false ],
    a2: ['10ⁿ', ['f'], () => calc.executeUnary(Operator.EXP10), false],
    b2: ['x%y', ['g'], () => calc.executeBinary(Operator.MOD), false],
    c2: ['x!', ['h'], () => calc.executeUnary(Operator.FCT), false],
    d2: ['M÷', ['Control+Slash', 'Control+NumpadDivide'], () => { calc.memory.div(); displayMemoryStatus(); }, false ],
    a3: ['sin', ['q'], () => calc.executeUnary(Operator.SIN), false],
    b3: ['cos', ['w'], () => calc.executeUnary(Operator.COS), false],
    c3: ['tan', ['e'], () => calc.executeUnary(Operator.TAN), false],
    d3: ['M×', ['Control+NumpadMultiply'], () => { calc.memory.mul(); displayMemoryStatus(); }, false ],
    a4: ['Pi/2', ['a'], () => calc.setConstant('pi2'), false],
    b4: ['ln10', ['s'], () => calc.setConstant('ln10'), false],
    c4: ['ln2', ['d'], () => calc.setConstant('ln2'), false],
    d4: ['M-', ['Control+Minus', 'Control+NumpadSubtract'], () => { calc.memory.sub(); displayMemoryStatus(); }, false ],
    a5: ['Pi', ['z'], () => calc.setConstant('pi'), false],
    b5: ['phi', ['x'], () => calc.setConstant('phi'), false],
    c5: ['e', ['c'], () => calc.setConstant('e'), false],
    d5: ['M+', ['Control+Plus', 'Control+NumpadAdd'], () => { calc.memory.add(); displayMemoryStatus(); }, false ],
    a6: ['', ['Shifted'], () => handleShiftLock(), false],
    b6: ['int', ['v'], () => calc.executeUnary(Operator.INT), false],
    c6: ['frac', ['b'], () => calc.executeUnary(Operator.FRAC), false],
    d6: ['MS', ['Control+Equal', 'Control+Enter', 'Control+NumpadEnter'], () => { calc.memory.save(); displayMemoryStatus(); calcStore.onNeedButtonNotification(); }, false ],
  };

  const modeSpecificExtendedFunctions: ExtendedButtonFunctionsByMode = {
    unit: {
      a2: ['×2', ['f'], () => calc.executeBinaryWithNumber(Operator.MUL, 2), false],
      b2: ['×3', ['g'], () => calc.executeBinaryWithNumber(Operator.MUL, 3), false],
      c2: ['×5', ['h'], () => calc.executeBinaryWithNumber(Operator.MUL, 5), false],
      a3: ['÷2', ['q'], () => calc.executeBinaryWithNumber(Operator.DIV, 2), false],
      b3: ['÷3', ['w'], () => calc.executeBinaryWithNumber(Operator.DIV, 3), false],
      c3: ['÷5', ['e'], () => calc.executeBinaryWithNumber(Operator.DIV, 5), false],
      a4: ['×10', ['a'], () => calc.executeBinaryWithNumber(Operator.MUL, 10), false],
      b4: ['×100', ['s'], () => calc.executeBinaryWithNumber(Operator.MUL, 100), false],
      c4: ['×1000', ['d'], () => calc.executeBinaryWithNumber(Operator.MUL, 1000), false],
      a5: ['÷10', ['z'], () => calc.executeBinaryWithNumber(Operator.DIV, 10), false],
      b5: ['÷100', ['x'], () => calc.executeBinaryWithNumber(Operator.DIV, 100), false],
      c5: ['÷1000', ['c'], () => calc.executeBinaryWithNumber(Operator.DIV, 1000), false],
    },
    currency: {
      a2: ['+5', ['f'], () => calc.executeBinaryWithNumber(Operator.ADD, 5), false],
      b2: ['+10', ['g'], () => calc.executeBinaryWithNumber(Operator.ADD, 10), false],
      c2: ['+100', ['h'], () => calc.executeBinaryWithNumber(Operator.ADD, 100), false],
      a3: ['-5', ['q'], () => calc.executeBinaryWithNumber(Operator.SUB, 5), false],
      b3: ['-10', ['w'], () => calc.executeBinaryWithNumber(Operator.SUB, 10), false],
      c3: ['-100', ['e'], () => calc.executeBinaryWithNumber(Operator.SUB, 100), false],
      a4: ['×10', ['a'], () => calc.executeBinaryWithNumber(Operator.MUL, 10), false],
      b4: ['×100', ['s'], () => calc.executeBinaryWithNumber(Operator.MUL, 100), false],
      c4: ['×1000', ['d'], () => calc.executeBinaryWithNumber(Operator.MUL, 1000), false],
      a5: ['÷10', ['z'], () => calc.executeBinaryWithNumber(Operator.DIV, 10), false],
      b5: ['÷100', ['x'], () => calc.executeBinaryWithNumber(Operator.DIV, 100), false],
      c5: ['÷1000', ['c'], () => calc.executeBinaryWithNumber(Operator.DIV, 1000), false],
    },
    // formula 모드 shift 함수: 수식에 맞는 수학 함수들
    formula: {
      c0: ['$', ['$'], () => formulaStore.append('$'), () => !formulaStore.canAppend('$')],
      a1: ['xⁿ', ['r'], () => formulaStore.append('^'), () => !formulaStore.canAppend('^')],
      b1: ['ⁿ√x', ['t'], () => formulaStore.wrapLastToken((s) => `nthRoot(${s},`), false],
      a2: ['10ⁿ', ['f'], () => formulaStore.wrapLastToken((s) => `10^(${s})`), false],
      b2: ['x%y', ['g'], () => formulaStore.append('%'), () => !formulaStore.canAppend('%')],
      c2: ['x!', ['h'], () => formulaStore.wrapLastToken((s) => `factorial(${s})`), false],
      a3: ['sin', ['q'], () => formulaStore.wrapLastToken((s) => `sin(${s})`), false],
      b3: ['cos', ['w'], () => formulaStore.wrapLastToken((s) => `cos(${s})`), false],
      c3: ['tan', ['e'], () => formulaStore.wrapLastToken((s) => `tan(${s})`), false],
      a4: ['pi/2', ['a'], () => formulaStore.append('pi/2'), () => !formulaStore.canAppend('pi/2')],
      b4: ['log10', ['s'], () => formulaStore.append('log10('), () => !formulaStore.canAppend('log10(')],
      c4: ['log2', ['d'], () => formulaStore.append('log2('), () => !formulaStore.canAppend('log2(')],
      a5: ['pi', ['z'], () => formulaStore.append('pi'), () => !formulaStore.canAppend('pi')],
      b5: ['phi', ['x'], () => formulaStore.append('phi'), () => !formulaStore.canAppend('phi')],
      c5: ['e', ['c'], () => formulaStore.append('e'), () => !formulaStore.canAppend('e')],
      a6: ['', ['Shifted'], () => handleShiftLock(), false],
      b6: ['int', ['v'], () => formulaStore.wrapLastToken((s) => `floor(${s})`), false],
      c6: ['frac', ['b'], () => formulaStore.wrapLastToken((s) => `(${s} - floor(${s}))`), false],
    },
    radix: {
      a1: [
        'x<<1',
        ['r'],
        () => bitOperationPreprocessing(() => calc.executeBinaryWithNumber(Operator.BIT_SFT_L, 1), false),
        false,
      ],
      b1: [
        'x>>1',
        ['t'],
        () => bitOperationPreprocessing(() => calc.executeBinaryWithNumber(Operator.BIT_SFT_R, 1), false),
        false,
      ],
      a2: [
        'x<<4',
        ['f'],
        () => bitOperationPreprocessing(() => calc.executeBinaryWithNumber(Operator.BIT_SFT_L, 4), false),
        false,
      ],
      b2: [
        'x>>4',
        ['g'],
        () => bitOperationPreprocessing(() => calc.executeBinaryWithNumber(Operator.BIT_SFT_R, 4), false),
        false,
      ],
      c2: ['NOT', ['h'], () => bitOperationPreprocessing(() => calc.executeUnary(Operator.BIT_NOT), false), false],
      a3: ['NAND', ['q'], () => bitOperationPreprocessing(() => calc.executeBinary(Operator.BIT_NAND)), false],
      b3: ['NOR', ['w'], () => bitOperationPreprocessing(() => calc.executeBinary(Operator.BIT_NOR)), false],
      c3: ['XNOR', ['e'], () => bitOperationPreprocessing(() => calc.executeBinary(Operator.BIT_XNOR)), false],
      a4: ['D', ['a'], () => calc.addDigit('D'), false],
      b4: ['E', ['s'], () => calc.addDigit('E'), false],
      c4: ['F', ['d'], () => calc.addDigit('F'), false],
      a5: ['A', ['z'], () => calc.addDigit('A'), false],
      b5: ['B', ['x'], () => calc.addDigit('B'), false],
      c5: ['C', ['c'], () => calc.addDigit('C'), false],
    },
  };

  return { standardButtons, modeSpecificButtons, standardExtendedFunctions, modeSpecificExtendedFunctions };
}
