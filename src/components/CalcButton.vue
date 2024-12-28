<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref, watch, reactive, computed } from 'vue';
  import { useQuasar, colors } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import { match } from 'ts-pattern';

  import { Haptics, ImpactStyle } from 'capacitor/@capacitor/haptics';

  import { KeyBinding, KeyBindings } from 'classes/KeyBinding';
  import { Radix } from 'classes/RadixConverter';
  import { BigNumber, Operator } from 'src/classes/CalculatorTypes';

  import { useStore } from 'src/stores/store';

  import MyTooltip from 'components/MyTooltip.vue';

  // Quasar 인스턴스 및 색상 유틸리티 초기화
  const $q = useQuasar();
  const { lighten } = colors;

  // i18n 설정
  const { t } = useI18n();

  // props 기본값 설정
  const props = withDefaults(defineProps<{ type?: string }>(), {
    type: 'calc',
  });

  // 스토어 인스턴스 초기화
  const store = useStore();

  // 스토어에서 필요한 메서드 추출
  const { 
    calc, 
    disableShift, 
    disableShiftLock, 
    enableShift, 
    enableShiftLock, 
    toggleShift,
    toggleShiftLock,
    showMemoryTemporarily, 
    showError,
    showMessage,
    convertRadix,
    clickButtonById,
  } = store;

  // 햅틱 피드백 함수
  const hapticFeedbackLight = async () => {
    if ($q.platform.is.capacitor && store.hapticsMode) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const hapticFeedbackMedium = async () => {
    if ($q.platform.is.capacitor && store.hapticsMode) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  };

  // 에러 처리 함수
  const executeActionWithErrorHandling = (action: () => void) => {
    const errorMessages: { [key: string]: string } = {
      'Cannot divide by zero.': 'cannotDivideByZero',
      'The square root of a negative number is not allowed.': 'squareRootOfANegativeNumberIsNotAllowed',
      'The factorial of a negative number is not allowed.': 'factorialOfANegativeNumberIsNotAllowed',
      'No memory to recall.': 'noMemoryToRecall',
    };
    try {
      action();
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (errorMessages[e.message]) {
          showError(t(errorMessages[e.message]));
        } else {
          showError(e.message);
        }
      }
    }
  };

  // 버튼 색상 정의
  const calculatorButtonColors: { [key: string]: string } = {
    important: '#cb9247',
    function: '#1d8fb6',
    normal: '#5e9e7d',
  };

  const shiftButtonPressedColor = lighten(calculatorButtonColors.important, -30);

  // 비트 연산 사전  처리 메서드
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
    c1: ['Ｃ', 'important', ['Control+e', 'Delete', 'Escape'], () => calc.reset(), false],
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
    a6: ['@keyboard_capslock', 'important', ["'"], null, false],
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

  // mainRadix의 변경을 감지하는 computed 속성 추가
  const currentRadixBase = computed(() => {
    return (
      {
        [Radix.Binary]: 2,
        [Radix.Octal]: 8,
        [Radix.Decimal]: 10,
        [Radix.Hexadecimal]: 16,
      }[store.sourceRadix] ?? 10
    );
  });

  // isButtonDisabledForBase 함수를 computed 속성 사용하도록 수정
  const isButtonDisabledForCurrentBase = (label: string) => {
    if (props.type !== 'radix') return false;

    const value = label.match(/^[0-9A-F]+$/)?.[0];
    if (!value) return false;

    return Number(convertRadix(value, Radix.Hexadecimal, Radix.Decimal)) >= currentRadixBase.value;
  };

  // 버튼 변환 함수 추출
  const transformButtonDefinitions = (buttons: CalculatorButtonDefinition) => {
    return Object.fromEntries(
      Object.entries(buttons).map(([id, [label, color, keys, action, isDisabled]]) => [
        id,
        { label, color, shortcutKeys: keys, action, isDisabled: isDisabled || isButtonDisabledForCurrentBase(label) },
      ]),
    );
  };

  // activeButtonSet을 computed로 변경
  const activeButtonSet = computed(() => {
    const modeSpecificButtonsForType = modeSpecificButtons[props.type as keyof typeof modeSpecificButtons] ?? {};

    return {
      ...transformButtonDefinitions(standardButtons),
      ...transformButtonDefinitions(modeSpecificButtonsForType),
    };
  });

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

  // 추가 버튼 기능 변환 함수
  const transformExtendedFunctions = (buttons: ExtendedButtonFunction) => {
    return Object.fromEntries(
      Object.entries(buttons).map(([id, [label, shortcutKeys, action, isDisabled]]) => [
        id,
        { label, shortcutKeys, action, isDisabled: isDisabled || isButtonDisabledForCurrentBase(label) },
      ]),
    );
  };

  // extendedFunctionSet을 computed로 변경
  const extendedFunctionSet = computed(() => {
    const categoryButtons =
      modeSpecificExtendedFunctions[props.type as keyof typeof modeSpecificExtendedFunctions] ?? {};

    return {
      ...transformExtendedFunctions(standardExtendedFunctions),
      ...transformExtendedFunctions(categoryButtons),
    };
  });

  type ButtonID = keyof typeof standardExtendedFunctions;

  // 버튼 클릭 시 알림 표시 함수
  const displayButtonNotification = (id: ButtonID) => {
    const buttonFunc = extendedFunctionSet.value[id];
    if (buttonFunc.label === 'MC') {
      showMessage(t('memoryCleared'));
    } else if (buttonFunc.label === 'MR' && !calc.isMemoryEmpty) {
      showMessage(t('memoryRecalled'));
    }
  };

  // 시프트 버튼의 ID 찾기
  const shiftButtonId = computed(() =>
    Object.keys(extendedFunctionSet.value).find((key) => extendedFunctionSet.value[key].label === ''),
  );

  // 추가 기능 툴팁 표시를 위한 타이머 상태 객체
  const tooltipTimers: { [id: string]: boolean } = reactive(
    Object.fromEntries(Object.keys(activeButtonSet.value).map((id) => [id, false])),
  );

  // 추가 기능 툴팁 표시 함수
  const displayActionTooltip = (id: ButtonID) => {
    if (
      tooltipTimers[id] ||
      id === shiftButtonId.value ||
      (!store.showButtonAddedLabel && store.isShiftPressed)
    )
      return;
    tooltipTimers[id] = true;
    setTimeout(() => {
      tooltipTimers[id] = false;
    }, 1000);
  };

  // 버튼 시프트 상태에 따른 기능 실행
  const handleShiftFunction = (id: ButtonID) => {
    const isShiftButton = id === shiftButtonId.value;
    const isDisabled = store.isShiftPressed
      ? extendedFunctionSet.value[id].isDisabled
      : activeButtonSet.value[id].isDisabled;
    const action = store.isShiftPressed ? extendedFunctionSet.value[id].action : activeButtonSet.value[id].action;

    if (isShiftButton) {
      toggleShift();
      disableShiftLock();
      return;
    }

    if (isDisabled) {
      displayDisabledButtonNotification();
      return;
    }

    executeActionWithErrorHandling(action);

    if (store.isShiftPressed) {
      displayActionTooltip(id);
      displayButtonNotification(id);
      if (!store.isShiftLocked) disableShift();
    }
  };

  // 버튼 길게 누르기 기능
  const handleLongPress = (id: ButtonID) => {
    hapticFeedbackMedium();
    const isShiftButton = id === shiftButtonId.value;
    const isShiftActive = store.isShiftPressed;
    const isShiftLocked = store.isShiftLocked;
    if (isShiftButton) {
      if (isShiftLocked) {
        disableShiftLock();
      } else {
        enableShiftLock();
      }
      if (isShiftLocked) {
        disableShift();
      } else {
        enableShift();
      }
      return;
    }

    const buttonFunctions = isShiftActive ? activeButtonSet.value : extendedFunctionSet.value;
    const buttonAction = buttonFunctions[id].action;
    const isDisabled = buttonFunctions[id].isDisabled;

    if (isDisabled) {
      displayDisabledButtonNotification();
      return;
    }

    executeActionWithErrorHandling(buttonAction);

    if (isShiftActive) {
      if (!isShiftLocked) disableShift();
    } else {
      displayActionTooltip(id);
      displayButtonNotification(id);
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

  // 키 입력에 따른 버튼 클릭 함수
  const triggerButtonClickByKey = (id: ButtonID, isShift: boolean) => {
    if (isShift) {
      toggleShiftLock();
      setTimeout(() => {
        clickButtonById('btn-' + id);
      }, 5);
    } else {
      clickButtonById('btn-' + id);
    }
  };

  // 주요 키 바인딩 설정
  const keyBindingsPrimary: KeyBindings = Object.entries(activeButtonSet.value).map(([id, button]) => [
    button.shortcutKeys,
    () => triggerButtonClickByKey(id, false),
  ]);

  // 보조 키 바인딩 설정
  const keyBindingsSecondary: KeyBindings = Object.entries(extendedFunctionSet.value).map(([id, button]) => [
    button.shortcutKeys,
    () => triggerButtonClickByKey(id, true),
  ]);

  // 모든 키 바인딩 통합
  const keyBindings = [...keyBindingsPrimary, ...keyBindingsSecondary];
  const keyBinding = new KeyBinding(keyBindings);

  // 컴포넌트 마운트 시 키 바인딩 활성화
  onMounted(() => {
    keyBinding.subscribe();
  });

  // 컴포넌트 언마운트 전 키 바인딩 비활성화
  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
  });

  // 입력 포커스 상태에 따른 키 바인딩 관리
  watch(
    () => store.inputFocused,
    (focused) => {
      if (focused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
    { immediate: true },
  );

  // 계산기 버튼 높이 설정
  const baseHeight = ref('136px');
  if (['unit', 'currency', 'radix'].includes(props.type)) {
    baseHeight.value = '234px';
  }

  const displayDisabledButtonNotification = () => {
    showMessage(t('disabledButton'));
  };

  const getTooltipsOfKeys = (btnId: ButtonID, isShift: boolean) => {
    const buttonFunctions = isShift ? extendedFunctionSet.value : activeButtonSet.value;
    const shortcutKeys = buttonFunctions[btnId].shortcutKeys;
    
    return shortcutKeys.map((key) => {
      if (key === '+') return '+';
      const parts = key.split('+');
      const modifiers = parts.slice(0, -1)
        .map(part => {
          if (part === 'Shift') return 'S';
          if (part === 'Control') return 'C';
          if (part === 'Alt') return 'A';
          return part;
        })
        .join('');
      
      const lastPart = parts[parts.length - 1].replace('Digit', '').replace('Numpad', 'N');
      return modifiers + (modifiers ? '-' : '') + lastPart;
    }).join(', ');
  };
</script>

<template>
  <q-card-section
    v-touch-swipe:9e-2:12:50.up="() => (store.isHistoryDialogOpen = true)"
    v-touch-swipe:9e-2:12:50.down="() => (store.isSettingDialogOpen = true)"
    v-blur
    class="row wrap justify-center q-pt-xs q-pb-none q-px-none"
  >
    <div v-for="(button, id) in activeButtonSet" :key="id" class="col-3 row wrap justify-center q-pa-sm">
      <q-btn
        :id="'btn-' + id"
        v-touch-hold.mouse="() => handleLongPress(id)"
        class="shadow-2 noselect col-12 button"
        no-caps
        push
        :label="
          store.isShiftPressed && !store.showButtonAddedLabel && id !== shiftButtonId
            ? extendedFunctionSet[id].label
            : button.label.charAt(0) === '@'
              ? undefined
              : button.label
        "
        :icon="
          store.isShiftPressed && !store.showButtonAddedLabel && id !== shiftButtonId
            ? undefined
            : button.label.charAt(0) === '@'
              ? button.label.slice(1)
              : undefined
        "
        :class="[
          store.isShiftPressed && !store.showButtonAddedLabel && id !== shiftButtonId
            ? 'char'
            : button.label.charAt(0) === '@'
              ? 'icon'
              : 'char',
          id === shiftButtonId && store.isShiftPressed ? 'button-shift' : '',
          store.isShiftPressed && !store.showButtonAddedLabel && !extendedFunctionSet[id].isDisabled
            ? ''
            : button.isDisabled || store.isShiftPressed
              ? 'disabled-button'
              : '',
        ]"
        :style="[
          !store.showButtonAddedLabel || !extendedFunctionSet[id].label ? { paddingTop: '4px' } : {}
        ]"
        :color="`btn-${button.color}`"
        @click="() => (button.isDisabled ? displayDisabledButtonNotification() : handleShiftFunction(id))"
        @touchstart="() => hapticFeedbackLight()"
      >
        <span
          v-if="store.showButtonAddedLabel && extendedFunctionSet[id]"
          class="top-label"
          :class="[
            `top-label-${button.label.charAt(0) === '@' ? 'icon' : 'char'}`,
            extendedFunctionSet[id].isDisabled ? 'disabled-button-added-label' : '',
            store.isShiftPressed && !extendedFunctionSet[id].isDisabled ? 'shifted-button-added-label' : '',
          ]"
        >
          {{ extendedFunctionSet[id].label }}
        </span>
        <q-tooltip
          :model-value="tooltipTimers[id]"
          no-parent-event
          class="noselect"
          :style="`background: ${calculatorButtonColors[button.color]}; border: 2px outset ${calculatorButtonColors[button.color]}; border-radius: 10px;`"
          anchor="top middle"
          self="center middle"
          transition-show="jump-up"
          transition-hide="jump-down"
          transition-duration="200"
        >
          {{ extendedFunctionSet[id].label }}
        </q-tooltip>
        <MyTooltip>
          {{
            store.isShiftPressed ? 
              extendedFunctionSet[id].isDisabled ? t('disabledButton') : getTooltipsOfKeys(id, true)
            :
              activeButtonSet[id].isDisabled ? t('disabledButton') : getTooltipsOfKeys(id, false)
          }}
        </MyTooltip>
      </q-btn>
    </div>
  </q-card-section>
</template>

<i18n>
ko:
  cannotDivideByZero: '0으로 나눌 수 없습니다.'
  squareRootOfANegativeNumberIsNotAllowed: '음수의 제곱근은 허용되지 않습니다.'
  factorialOfANegativeNumberIsNotAllowed: '음수의 팩토리얼은 허용되지 않습니다.'
  bitOperationPreprocessingCompleted: '비트 연산을 위해 절대값 정수로 계산을 완료되었습니다.'
  bitOperationPreprocessingReady: '비트 연산을 위해 절대값 정수로 계산을 준비하였습니다.'
  memoryCleared: '메모리를 초기화했습니다.'
  memoryRecalled: '메모리를 불러왔습니다.'
  memorySaved: '메모리에 저장되었습니다.'
  noMemoryToRecall: '불러올 메모리가 없습니다.'
  disabledButton: '비활성화된 버튼'
en:
  cannotDivideByZero: 'Cannot divide by zero'
  squareRootOfANegativeNumberIsNotAllowed: 'The square root of a negative number is not allowed.'
  factorialOfANegativeNumberIsNotAllowed: 'The factorial of a negative number is not allowed.'
  bitOperationPreprocessingCompleted: 'Bit operation preprocessing completed.'
  bitOperationPreprocessingReady: 'Bit operation preprocessing ready.'
  memoryCleared: 'Memory cleared.'
  memoryRecalled: 'Memory recalled.'
  memorySaved: 'Memory saved.'
  noMemoryToRecall: 'No memory to recall.'
  disabledButton: 'Disabled button'
</i18n>

<style scoped lang="scss">
  .button {
    min-height: calc((100vh - v-bind('baseHeight')) / 6 - 20px);
    max-height: calc((100vh - v-bind('baseHeight')) / 6 - 20px);
    font-weight: 700;
    position: relative;
  }

  .icon {
    font-size: calc(min(calc((100vh - v-bind('baseHeight')) / 6 * 0.25), calc((100vw - 40px) / 4 * 0.3)) * 0.8);
    padding-top: calc(((100vh - v-bind('baseHeight')) / 6 - 13px) * 0.3); /* Lower the content by 4px */
  }

  .char {
    font-size: calc(min(calc((100vh - v-bind('baseHeight')) / 6 * 0.26), calc((100vw - 40px) / 4 * 0.3)) * 1.2);
    padding-top: calc(((100vh - v-bind('baseHeight')) / 6 - 29px) * 0.3); /* Lower the content by 4px */      
  }

  .top-label {
    text-align: center;
    position: absolute;
    font-size: calc(min(calc((100vh - v-bind('baseHeight')) / 6 * 0.26), calc((100vw - 40px) / 4 * 0.3)) * 1.2 * 0.7);
    color: rgba(255, 255, 255, 0.7);
  }

  .top-label-icon {
    top: calc(((100vh - v-bind('baseHeight')) / 6) * 0.15 - 11px);
  }

  .top-label-char {
    top: calc(((100vh - v-bind('baseHeight')) / 6) * 0.15 - 17px);
  }

  .bg-btn-important {
    background: v-bind('calculatorButtonColors.important') !important; // 아이콘의 밝은 녹색
  }

  .bg-btn-function {
    background: v-bind('calculatorButtonColors.function') !important; // 아이콘의 밝은 파란색과 어울리게 조정
  }

  .bg-btn-normal {
    background: v-bind('calculatorButtonColors.normal') !important; // 어두운 색
  }

  .button-shift {
    background: v-bind(shiftButtonPressedColor) !important;
  }

  .disabled-button {
    &:deep(.q-btn__content) {
      color: rgba(255, 255, 255, 0.4) !important;
    }
  }

  .disabled-button-added-label {
    color: rgba(255, 255, 255, 0.3) !important;
  }

  .shifted-button-added-label {
    color: rgba(255, 255, 255, 0.85) !important;
  }
</style>
