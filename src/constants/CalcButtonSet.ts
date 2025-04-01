/**
 * @file CalcButtonSet.ts
 * @description 이 파일은 계산기 버튼 세트를 구성하는 상수 파일입니다.
 *              다양한 계산 기능을 수행하는 버튼을 정의하며,
 *              각 버튼의 동작 및 속성을 설정합니다.
 */

import { match } from 'ts-pattern';

import type { ComposerTranslation } from 'vue-i18n';

import { toBigNumber } from 'classes/CalculatorMath';
import { Operator } from 'classes/Calculator';
import { showMessage } from 'src/utils/NotificationUtils';

import { useCalcStore } from 'src/stores/calcStore';

const calcStore = useCalcStore();

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
    [id: string]: [label: string, color: string, keys: string[], action: () => void, isDisabled: boolean];
  };

  type CalculatorModeButtons = { [key in 'unit' | 'currency' | 'radix']: CalculatorButtonDefinition };

  // prettier-ignore
  const standardButtons: CalculatorButtonDefinition = {
    a1: ['x²', 'function', ['u'], () => calc.pow2(), false],
    b1: ['√x', 'function', ['i'], () => calc.sqrt(), false],
    c1: ['Ｃ', 'important', ['Delete'], () => calc.reset(), false],
    d1: ['@mdi-backspace', 'important', ['Backspace'], () => calc.deleteDigitOrDot(), false],
    a2: ['@mdi-plus-minus-variant', 'function', ['j'], () => calc.changeSign(), false],
    b2: ['%', 'function', ['k'], () => calc.percent(), false],
    c2: ['1/x', 'function', ['l'], () => calc.rec(), false],
    d2: ['@mdi-division', 'function', ['/'], () => calc.div(), false],
    a3: ['7', 'normal', ['7'], () => calc.addDigit(7), false],
    b3: ['8', 'normal', ['8'], () => calc.addDigit(8), false],
    c3: ['9', 'normal', ['9'], () => calc.addDigit(9), false],
    d3: ['@mdi-close', 'function', ['*'], () => calc.mul(), false],
    a4: ['4', 'normal', ['4'], () => calc.addDigit(4), false],
    b4: ['5', 'normal', ['5'], () => calc.addDigit(5), false],
    c4: ['6', 'normal', ['6'], () => calc.addDigit(6), false],
    d4: ['@mdi-minus', 'function', ['-'], () => calc.sub(), false],
    a5: ['1', 'normal', ['1'], () => calc.addDigit(1), false],
    b5: ['2', 'normal', ['2'], () => calc.addDigit(2), false],
    c5: ['3', 'normal', ['3'], () => calc.addDigit(3), false],
    d5: ['@mdi-plus', 'function', ['+'], () => calc.add(), false],
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
        a1: ['x<<y', 'function', ['u'], () => bitOperationPreprocessing(() => calc.bitSftL()), false],
        b1: ['x>>y', 'function', ['i'], () => bitOperationPreprocessing(() => calc.bitSftR()), false],
        a2: ['AND', 'function', ['j'], () => bitOperationPreprocessing(() => calc.bitAnd()), false],
        b2: ['OR', 'function', ['k'], () => bitOperationPreprocessing(() => calc.bitOr()), false],
        c2: ['XOR', 'function', ['l'], () => bitOperationPreprocessing(() => calc.bitXor()), false],
    },
  };

  // 버튼 기능 정의
  type ExtendedButtonFunction = {
    [key: string]: [label: string, shortcutKeys: string[], action: () => void, isDisabled: boolean];
  };

  type ExtendedButtonFunctionsByMode = { [key in 'unit' | 'currency' | 'radix']: ExtendedButtonFunction };

  // 공통으로 사용할 기본 버튼 기능
  // prettier-ignore
  const standardExtendedFunctions: ExtendedButtonFunction = {
    a1: ['xⁿ', ['r'], () => calc.pow(), false],
    b1: ['ⁿ√x', ['t'], () => calc.root(), false],
    c1: ['MC', ['Control+Delete'], () => {calc.memory.clear(); calcStore.onNeedButtonNotification();}, false],
    d1: ['MR', ['Control+Backspace'], () => { calc.memory.recall(); calc.refreshBuffer(); displayMemoryStatus(); calcStore.onNeedButtonNotification(); }, false ],
    a2: ['10ⁿ', ['f'], () => calc.exp10(), false],
    b2: ['x%y', ['g'], () => calc.mod(), false],
    c2: ['x!', ['h'], () => calc.fct(), false],
    d2: ['M÷', ['Control+Slash', 'Control+NumpadDivide'], () => { calc.memory.div(); displayMemoryStatus(); }, false ],
    a3: ['sin', ['q'], () => calc.sin(), false],
    b3: ['cos', ['w'], () => calc.cos(), false],
    c3: ['tan', ['e'], () => calc.tan(), false],
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
    b6: ['int', ['v'], () => calc.int(), false],
    c6: ['frac', ['b'], () => calc.frac(), false],
    d6: ['MS', ['Control+Equal', 'Control+Enter', 'Control+NumpadEnter'], () => { calc.memory.save(); displayMemoryStatus(); calcStore.onNeedButtonNotification(); }, false ],
  };

  const modeSpecificExtendedFunctions: ExtendedButtonFunctionsByMode = {
    unit: {
      a2: ['×2', ['f'], () => calc.mulNumber(2), false],
      b2: ['×3', ['g'], () => calc.mulNumber(3), false],
      c2: ['×5', ['h'], () => calc.mulNumber(5), false],
      a3: ['÷2', ['q'], () => calc.divNumber(2), false],
      b3: ['÷3', ['w'], () => calc.divNumber(3), false],
      c3: ['÷5', ['e'], () => calc.divNumber(5), false],
      a4: ['×10', ['a'], () => calc.mulNumber(10), false],
      b4: ['×100', ['s'], () => calc.mulNumber(100), false],
      c4: ['×1000', ['d'], () => calc.mulNumber(1000), false],
      a5: ['÷10', ['z'], () => calc.divNumber(10), false],
      b5: ['÷100', ['x'], () => calc.divNumber(100), false],
      c5: ['÷1000', ['c'], () => calc.divNumber(1000), false],
    },
    currency: {
      a2: ['+5', ['f'], () => calc.addNumber(5), false],
      b2: ['+10', ['g'], () => calc.addNumber(10), false],
      c2: ['+100', ['h'], () => calc.addNumber(100), false],
      a3: ['-5', ['q'], () => calc.subNumber(5), false],
      b3: ['-10', ['w'], () => calc.subNumber(10), false],
      c3: ['-100', ['e'], () => calc.subNumber(100), false],
      a4: ['×10', ['a'], () => calc.mulNumber(10), false],
      b4: ['×100', ['s'], () => calc.mulNumber(100), false],
      c4: ['×1000', ['d'], () => calc.mulNumber(1000), false],
      a5: ['÷10', ['z'], () => calc.divNumber(10), false],
      b5: ['÷100', ['x'], () => calc.divNumber(100), false],
      c5: ['÷1000', ['c'], () => calc.divNumber(1000), false],
    },
    radix: {
      a1: ['x<<1', ['r'], () => bitOperationPreprocessing(() => calc.bitSftLNumber(1), false), false],
      b1: ['x>>1', ['t'], () => bitOperationPreprocessing(() => calc.bitSftRNumber(1), false), false],
      a2: ['x<<4', ['f'], () => bitOperationPreprocessing(() => calc.bitSftLNumber(4), false), false],
      b2: ['x>>4', ['g'], () => bitOperationPreprocessing(() => calc.bitSftRNumber(4), false), false],
      c2: ['NOT', ['h'], () => bitOperationPreprocessing(() => calc.bitNot(), false), false],
      a3: ['NAND', ['q'], () => bitOperationPreprocessing(() => calc.bitNand()), false],
      b3: ['NOR', ['w'], () => bitOperationPreprocessing(() => calc.bitNor()), false],
      c3: ['XNOR', ['e'], () => bitOperationPreprocessing(() => calc.bitXnor()), false],
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
