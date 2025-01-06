import { Operator } from 'src/classes/Calculator';
import { useStore } from 'stores/store';
import { match } from 'ts-pattern';
import type { ComposerTranslation } from 'vue-i18n';

// ComposerTranslation 타입 사용
export function createCalcButtonSet(t: ComposerTranslation) {
  const store = useStore();

  // 스토어에서 필요한 메서드 추출
  const { calc, showMemoryTemporarily, showMessage } = store;

  // 비트 연산 사전 처리 메서드
  const bitOperationPreprocessing = (action: () => void, isBinary: boolean = true) => {
    if (BigNumber(calc.currentNumber).abs().floor().toString() !== calc.currentNumber) {
      calc.currentNumber = BigNumber(calc.currentNumber).abs().floor().toString();
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
    if (!calc.isMemoryEmpty) {
      setTimeout(() => {
        showMemoryTemporarily();
      }, 10);
    }
  };

  // 버튼 타입 정의
  type CalculatorButtonDefinition = {
    [id: string]: [label: string, color: string, keys: string[], action: () => void, isDisabled: boolean];
  };

  type CalculatorModeButtons = {
    [key in 'unit' | 'currency' | 'radix']: CalculatorButtonDefinition;
  };

  // prettier-ignore
  const standardButtons: CalculatorButtonDefinition = {
    a1: ['x²', 'function', ['Control+q'], () => calc.pow2(), false],
    b1: ['√x', 'function', ['Control+w'], () => calc.sqrt(), false],
    c1: ['Ｃ', 'important', ['Control+e', 'Delete'], () => calc.reset(), false],
    d1: ['@mdi-backspace', 'important', ['Backspace', 'Control+r'], () => calc.deleteDigitOrDot(), false],
    a2: ['@mdi-plus-minus-variant', 'function', ['Control+a'], () => calc.changeSign(), false],
    b2: ['%', 'function', ['Control+s'], () => calc.percent(), false],
    c2: ['1/x', 'function', ['Control+d'], () => calc.rec(), false],
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
    a6: ['@keyboard_capslock', 'important', ["'"], () => null, false],
    b6: ['0', 'normal', ['0'], () => calc.addDigit(0), false],
    c6: ['@mdi-circle-small', 'normal', ['.'], () => calc.addDot(), false],
    d6: ['@mdi-equal', 'important', ['=', 'Enter'], () => equalForBitOperation(), false],
  };

  // prettier-ignore
  const modeSpecificButtons: CalculatorModeButtons = {
    unit: {},
    currency: {},
    radix: {
        a1: ['x<<y', 'function', ['Control+q'], () => bitOperationPreprocessing(() => calc.bitSftL()), false],
        b1: ['x>>y', 'function', ['Control+w'], () => bitOperationPreprocessing(() => calc.bitSftR()), false],
        a2: ['AND', 'function', ['Control+a'], () => bitOperationPreprocessing(() => calc.bitAnd()), false],
        b2: ['OR', 'function', ['Control+s'], () => bitOperationPreprocessing(() => calc.bitOr()), false],
        c2: ['XOR', 'function', ['Control+d'], () => bitOperationPreprocessing(() => calc.bitXor()), false],
    },
  };

  // 버튼 기능 정의
  type ExtendedButtonFunction = {
    [key: string]: [label: string, shortcutKeys: string[], action: () => void, isDisabled: boolean];
  };

  type ExtendedButtonFunctionsByMode = {
    [key in 'unit' | 'currency' | 'radix']: ExtendedButtonFunction;
  };

  // 공통으로 사용할 기본 버튼 기능
  // prettier-ignore
  const standardExtendedFunctions: ExtendedButtonFunction = {
    a1: ['xⁿ', ['Shift+Control+q'], () => calc.pow(), false],
    b1: ['ⁿ√x', ['Shift+Control+w'], () => calc.root(), false],
    c1: ['MC', ['Shift+Control+e', 'Shift+Delete', 'Shift+Escape'], () => calc.memoryClear(), false],
    d1: [ 'MR', ['Shift+Backspace', 'Shift+Control+r'], () => { calc.memoryRecall(); displayMemoryStatus(); }, false ],
    a2: ['10ⁿ', ['Shift+Control+a'], () => calc.exp10(), false],
    b2: ['x%y', ['Shift+Control+s'], () => calc.mod(), false],
    c2: ['x!', ['Shift+Control+d'], () => calc.fct(), false],
    d2: [ 'M÷', ['Shift+Slash', 'Shift+NumpadDivide'], () => { calc.memoryDiv(); displayMemoryStatus(); }, false ],
    a3: ['sin', ['Shift+Digit7', 'Shift+Numpad7'], () => calc.sin(), false],
    b3: ['cos', ['Shift+Digit8', 'Shift+Numpad8'], () => calc.cos(), false],
    c3: ['tan', ['Shift+Digit9', 'Shift+Numpad9'], () => calc.tan(), false],
    d3: [ 'M×', ['Shift+NumpadMultiply'], () => { calc.memoryMul(); displayMemoryStatus(); }, false ],
    a4: ['Pi/2', ['Shift+Digit4', 'Shift+Numpad4'], () => calc.setConstant('pi2'), false],
    b4: ['ln10', ['Shift+Digit5', 'Shift+Numpad5'], () => calc.setConstant('ln10'), false],
    c4: ['ln2', ['Shift+Digit6', 'Shift+Numpad6'], () => calc.setConstant('ln2'), false],
    d4: [ 'M-', ['Shift+Minus', 'Shift+NumpadSubtract'], () => { calc.memorySub(); displayMemoryStatus(); }, false ],
    a5: ['Pi', ['Shift+Digit1', 'Shift+Numpad1'], () => calc.setConstant('pi'), false],
    b5: ['phi', ['Shift+Digit2', 'Shift+Numpad2'], () => calc.setConstant('phi'), false],
    c5: ['e', ['Shift+Digit3', 'Shift+Numpad3'], () => calc.setConstant('e'), false],
    d5: [ 'M+', ['Shift+Plus', 'Shift+NumpadAdd'], () => { calc.memoryAdd(); displayMemoryStatus(); }, false ],
    a6: ['', ['\''], () => null, false],
    b6: ['int', ['Shift+Digit0', 'Shift+Numpad0'], () => calc.int(), false],
    c6: ['frac', ['Shift+Period', 'Shift+NumpadDecimal'], () => calc.frac(), false],
    d6: [ 'MS', ['Shift+Equal', 'Shift+Enter', 'Shift+NumpadEnter'], () => { calc.memorySave(); displayMemoryStatus(); }, false ],
  };

  const modeSpecificExtendedFunctions: ExtendedButtonFunctionsByMode = {
    unit: {
      a2: ['×2', ['Shift+Control+a'], () => calc.mulNumber(2), false],
      b2: ['×3', ['Shift+Control+s'], () => calc.mulNumber(3), false],
      c2: ['×5', ['Shift+Control+d'], () => calc.mulNumber(5), false],
      a3: ['÷2', ['Shift+Digit7', 'Shift+Numpad7'], () => calc.divNumber(2), false],
      b3: ['÷3', ['Shift+Digit8', 'Shift+Numpad8'], () => calc.divNumber(3), false],
      c3: ['÷5', ['Shift+Digit9', 'Shift+Numpad9'], () => calc.divNumber(5), false],
      a4: ['×10', ['Shift+Digit4', 'Shift+Numpad4'], () => calc.mulNumber(10), false],
      b4: ['×100', ['Shift+Digit5', 'Shift+Numpad5'], () => calc.mulNumber(100), false],
      c4: ['×1000', ['Shift+Digit6', 'Shift+Numpad6'], () => calc.mulNumber(1000), false],
      a5: ['÷10', ['Shift+Digit1', 'Shift+Numpad1'], () => calc.divNumber(10), false],
      b5: ['÷100', ['Shift+Digit2', 'Shift+Numpad2'], () => calc.divNumber(100), false],
      c5: ['÷1000', ['Shift+Digit3', 'Shift+Numpad3'], () => calc.divNumber(1000), false],
    },
    currency: {
      a2: ['+5', ['Shift+Control+a'], () => calc.addNumber(5), false],
      b2: ['+10', ['Shift+Control+s'], () => calc.addNumber(10), false],
      c2: ['+100', ['Shift+Control+d'], () => calc.addNumber(100), false],
      a3: ['-5', ['Shift+Digit7', 'Shift+Numpad7'], () => calc.subNumber(5), false],
      b3: ['-10', ['Shift+Digit8', 'Shift+Numpad8'], () => calc.subNumber(10), false],
      c3: ['-100', ['Shift+Digit9', 'Shift+Numpad9'], () => calc.subNumber(100), false],
      a4: ['×10', ['Shift+Digit4', 'Shift+Numpad4'], () => calc.mulNumber(10), false],
      b4: ['×100', ['Shift+Digit5', 'Shift+Numpad5'], () => calc.mulNumber(100), false],
      c4: ['×1000', ['Shift+Digit6', 'Shift+Numpad6'], () => calc.mulNumber(1000), false],
      a5: ['÷10', ['Shift+Digit1', 'Shift+Numpad1'], () => calc.divNumber(10), false],
      b5: ['÷100', ['Shift+Digit2', 'Shift+Numpad2'], () => calc.divNumber(100), false],
      c5: ['÷1000', ['Shift+Digit3', 'Shift+Numpad3'], () => calc.divNumber(1000), false],
    },
    radix: {
      a1: ['x<<1', ['Shift+Control+q'], () => bitOperationPreprocessing(() => calc.bitSftLNumber(1), false), false],
      b1: ['x>>1', ['Shift+Control+w'], () => bitOperationPreprocessing(() => calc.bitSftRNumber(1), false), false],
      a2: ['x<<4', ['Shift+Control+a'], () => bitOperationPreprocessing(() => calc.bitSftLNumber(4), false), false],
      b2: ['x>>4', ['Shift+Control+s'], () => bitOperationPreprocessing(() => calc.bitSftRNumber(4), false), false],
      c2: ['NOT', ['Shift+Control+d'], () => bitOperationPreprocessing(() => calc.bitNot(), false), false],
      a3: ['NAND', ['Shift+Digit7', 'Shift+Numpad7'], () => bitOperationPreprocessing(() => calc.bitNand()), false],
      b3: ['NOR', ['Shift+Digit8', 'Shift+Numpad8'], () => bitOperationPreprocessing(() => calc.bitNor()), false],
      c3: ['XNOR', ['Shift+Digit9', 'Shift+Numpad9'], () => bitOperationPreprocessing(() => calc.bitXnor()), false],
      a4: ['D', ['Shift+Digit4', 'Shift+Numpad4'], () => calc.addDigit('D'), false],
      b4: ['E', ['Shift+Digit5', 'Shift+Numpad5'], () => calc.addDigit('E'), false],
      c4: ['F', ['Shift+Digit6', 'Shift+Numpad6'], () => calc.addDigit('F'), false],
      a5: ['A', ['Shift+Digit1', 'Shift+Numpad1'], () => calc.addDigit('A'), false],
      b5: ['B', ['Shift+Digit2', 'Shift+Numpad2'], () => calc.addDigit('B'), false],
      c5: ['C', ['Shift+Digit3', 'Shift+Numpad3'], () => calc.addDigit('C'), false],
    },
  };

  return {
    standardButtons,
    modeSpecificButtons,
    standardExtendedFunctions,
    modeSpecificExtendedFunctions,
  };
}
