<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref, watch, reactive, computed, nextTick } from 'vue';
  import { useQuasar, colors } from 'quasar';
  import { useI18n } from 'vue-i18n';

  import { Haptics, ImpactStyle } from 'capacitor/@capacitor/haptics';

  import { KeyBinding, KeyBindings } from 'classes/KeyBinding';
  import { Radix } from 'classes/RadixConverter';

  import { useStoreBase } from 'src/stores/store-base';
  import { useStoreSettings } from 'src/stores/store-settings';
  import { useStoreNotifications } from 'src/stores/store-notifications';
  import { useStoreUtils } from 'src/stores/store-utils';
  import { useStoreRadix } from 'src/stores/store-radix';

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
  const storeSettings = useStoreSettings();
  const storeBase = useStoreBase();
  const storeNotifications = useStoreNotifications();
  const storeRadix = useStoreRadix();
  const storeUtils = useStoreUtils();

  // 스토어에서 필요한 메서드 추출
  const {
    calc,
    offButtonShift,
    offButtonShiftLock,
    onButtonShift,
    onButtonShiftLock,
    showMemoryOnWithTimer,
    toggleButtonShift,
  } = storeBase;
  const { notifyError, notifyMsg } = storeNotifications;
  const { convertRadix } = storeRadix;
  const { clickButtonById } = storeUtils;

  // 햅틱 피드백 함수
  const hapticFeedbackLight = async () => {
    if ($q.platform.is.capacitor && storeSettings.hapticsMode) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const hapticFeedbackMedium = async () => {
    if ($q.platform.is.capacitor && storeSettings.hapticsMode) {
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
          notifyError(t(errorMessages[e.message]));
        } else {
          notifyError(e.message);
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
    c1: ['C', 'important', ['Control+e', 'Delete', 'Escape'], () => calc.reset(), false],
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
    d6: ['@mdi-equal', 'important', ['=', 'Enter'], () => calc.equal(), false],
  };

  // prettier-ignore
  const modeSpecificButtons: CalculatorModeButtons = {
    unit: {},
    currency: {},
    radix: {
      a1: ['x<<y', 'function', ['Control+q'], () => calc.bitSftL(), false],
      b1: ['x>>y', 'function', ['Control+w'], () => calc.bitSftR(), false],
      a2: ['x&y', 'function', ['Control+a'], () => calc.bitAnd(), false],
      b2: ['x|y', 'function', ['Control+s'], () => calc.bitOr(), false],
      c2: ['x^y', 'function', ['Control+d'], () => calc.bitXor(), false],
    },
  };

  // mainRadix의 변경을 감지하는 computed 속성 추가
  const currentRadixBase = computed(() => {
    return {
      [Radix.Binary]: 2,
      [Radix.Octal]: 8,
      [Radix.Decimal]: 10,
      [Radix.Hexadecimal]: 16,
    }[storeRadix.mainRadix] ?? 10;
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

  // 활성화된 버튼 계산 함수
  const calculateActiveButtonSet = () => {
    const modeSpecificButtonsForType = modeSpecificButtons[props.type as keyof typeof modeSpecificButtons] ?? {};
    
    return {
      ...transformButtonDefinitions(standardButtons),
      ...transformButtonDefinitions(modeSpecificButtonsForType),
    };
  };

  // activeButtons를 ref로 변경
  const activeButtonSet = reactive(calculateActiveButtonSet());

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
    a6: ['', [], () => null, false],
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
      a1: ['x<<1', ['Shift+Control+q'], () => calc.bitSftLNumber(1), false],
      b1: ['x>>1', ['Shift+Control+w'], () => calc.bitSftRNumber(1), false],
      a2: ['x<<4', ['Shift+Control+a'], () => calc.bitSftLNumber(4), false],
      b2: ['x>>4', ['Shift+Control+s'], () => calc.bitSftRNumber(4), false],
      c2: ['!x', ['Shift+Control+d'], () => calc.bitNot(), false],
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

  // 활성화된 추가 버튼 기능 계산 함수
  const calculateExtendedFunctionSet = () => {
    const categoryButtons = modeSpecificExtendedFunctions[props.type as keyof typeof modeSpecificExtendedFunctions] ?? {};
    
    return {
      ...transformExtendedFunctions(standardExtendedFunctions),
      ...transformExtendedFunctions(categoryButtons),
    };
  };

  // addedButtonFunctions를 ref로 변경
  const extendedFunctionSet = reactive(calculateExtendedFunctionSet());

  type ButtonID = keyof typeof standardExtendedFunctions;

  // 버튼 클릭 시 알림 표시 함수
  const displayButtonNotification = (id: ButtonID) => {
    const buttonFunc = extendedFunctionSet[id];
    if (buttonFunc.label === 'MC') {
      notifyMsg(t('memoryCleared'));
    } else if (buttonFunc.label === 'MR' && !calc.isMemoryReset) {
      notifyMsg(t('memoryRecalled'));
    }
  };

  // 시프트 버튼의 ID 찾기
  const shiftButtonId = computed(() =>
    Object.keys(extendedFunctionSet).find((key) => extendedFunctionSet[key].label === ''),
  );

  // 추가 기능 툴팁 표시를 위한 타이머 상태 객체
  const tooltipTimers: { [id: string]: boolean } = reactive(
    Object.fromEntries(Object.keys(activeButtonSet).map((id) => [id, false])),
  );

  // 추가 기능 툴팁 표시 함수
  const displayActionTooltip = (id: ButtonID) => {
    if (tooltipTimers[id] || id === shiftButtonId.value || (!storeSettings.showButtonAddedLabel && storeBase.buttonShift))
      return;
    tooltipTimers[id] = true;
    setTimeout(() => {
      tooltipTimers[id] = false;
    }, 1000);
  };

  // 버튼 시프트 상태에 따른 기능 실행
  const handleShiftFunction = (id: ButtonID) => {
    const isShiftButton = id === shiftButtonId.value;
    const isDisabled = storeBase.buttonShift
      ? extendedFunctionSet[id].isDisabled
      : activeButtonSet[id].isDisabled;
    const action = storeBase.buttonShift ? extendedFunctionSet[id].action : activeButtonSet[id].action;

    if (isShiftButton) {
      toggleButtonShift();
      offButtonShiftLock();
      return;
    }

    if (isDisabled) {
      displayDisabledButtonNotification();
      return;
    }

    executeActionWithErrorHandling(action);

    if (storeBase.buttonShift) {
      displayActionTooltip(id);
      displayButtonNotification(id);
      if (!storeBase.buttonShiftLock) offButtonShift();
    }
  };

  // 버튼 길게 누르기 기능
  const handleLongPress = (id: ButtonID) => {
    hapticFeedbackMedium();
    const isShiftButton = id === shiftButtonId.value;
    const isShiftActive = storeBase.buttonShift;
    const isShiftLocked = storeBase.buttonShiftLock;
    if (isShiftButton) {
      if (isShiftLocked) {
        offButtonShiftLock();
      } else {
        onButtonShiftLock();
      }
      if (isShiftLocked) {
        offButtonShift();
      } else {
        onButtonShift();
      }
      return;
    }

    const buttonFunctions = isShiftActive ? activeButtonSet : extendedFunctionSet;
    const buttonAction = buttonFunctions[id].action;
    const isDisabled = buttonFunctions[id].isDisabled;

    if (isDisabled) {
      displayDisabledButtonNotification();
      return;
    }

    executeActionWithErrorHandling(buttonAction);

    if (isShiftActive) {
      if (!isShiftLocked) offButtonShift();
    } else {
      displayActionTooltip(id);
      displayButtonNotification(id);
    }
  };

  // 메모리 표시 함수
  const displayMemoryStatus = () => {
    if (!calc.isMemoryReset) {
      setTimeout(() => {
        showMemoryOnWithTimer();
      }, 10);
    }
  };

  // 키 입력에 따른 버튼 클릭 함수
  const triggerButtonClickByKey = (id: ButtonID, isShift: boolean) => {
    if (isShift) {
      toggleButtonShift();
      setTimeout(() => {
        clickButtonById('btn-' + id);
      }, 5);
    } else {
      clickButtonById('btn-' + id);
    }
  };


  // 주요 키 바인딩 설정
  const keyBindingsPrimary: KeyBindings = Object.entries(activeButtonSet).map(([id, button]) => [
    button.shortcutKeys,
    () => triggerButtonClickByKey(id, false),
  ]);

  // 보조 키 바인딩 설정
  const keyBindingsSecondary: KeyBindings = Object.entries(extendedFunctionSet).map(([id, button]) => [
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
    () => storeUtils.inputFocused,
    (focused) => {
      if (focused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
    { immediate: true },
  );

  // 컴포넌트 최상단에 key를 위한 ref 추가
  const componentKey = ref(0);

  watch(() => storeRadix.mainRadix, async () => {
    console.log('mainRadix changed:', storeRadix.mainRadix);
    Object.assign(activeButtonSet, calculateActiveButtonSet());
    Object.assign(extendedFunctionSet, calculateExtendedFunctionSet());
    
    await nextTick();
    componentKey.value++;
    },
    { immediate: true },
  );

  // 계산기 버튼 높이 설정
  const baseHeight = ref('136px');
  if (['unit', 'currency', 'radix'].includes(props.type)) {
    baseHeight.value = '234px';
  }

  const displayDisabledButtonNotification = () => {
    notifyMsg(t('disabledButton'));
  };
</script>

<template>
  <q-card-section
    :key="componentKey"
    v-touch-swipe:9e-2:12:50.up="() => (storeBase.isHistoryDialogOpen = true)"
    v-touch-swipe:9e-2:12:50.down="() => (storeBase.isSettingDialogOpen = true)"
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
          storeBase.buttonShift && !storeSettings.showButtonAddedLabel && id !== shiftButtonId
            ? extendedFunctionSet[id].label
            : button.label.charAt(0) === '@'
              ? undefined
              : button.label
        "
        :icon="
          storeBase.buttonShift && !storeSettings.showButtonAddedLabel && id !== shiftButtonId
            ? undefined
            : button.label.charAt(0) === '@'
              ? button.label.slice(1)
              : undefined
        "
        :class="[
          storeBase.buttonShift && !storeSettings.showButtonAddedLabel && id !== shiftButtonId
            ? 'char'
            : button.label.charAt(0) === '@'
              ? 'icon'
              : 'char',
          id === shiftButtonId && storeBase.buttonShift ? 'button-shift' : '',
          storeBase.buttonShift && !storeSettings.showButtonAddedLabel && !extendedFunctionSet[id].isDisabled
            ? ''
            : button.isDisabled || storeBase.buttonShift
              ? 'disabled-button'
              : '',
        ]"
        :style="[!storeSettings.showButtonAddedLabel || !extendedFunctionSet[id].label ? { paddingTop: '4px' } : {}]"
        :color="`btn-${button.color}`"
        @click="() => (button.isDisabled ? displayDisabledButtonNotification() : handleShiftFunction(id))"
        @touchstart="() => hapticFeedbackLight()"
      >
        <span
          v-if="storeSettings.showButtonAddedLabel && extendedFunctionSet[id]"
          class="top-label"
          :class="[
            `top-label-${button.label.charAt(0) === '@' ? 'icon' : 'char'}`,
            extendedFunctionSet[id].isDisabled ? 'disabled-button-added-label' : '',
            storeBase.buttonShift && !extendedFunctionSet[id].isDisabled ? 'shifted-button-added-label' : '',
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
      </q-btn>
    </div>
  </q-card-section>
</template>

<i18n>
ko:
  cannotDivideByZero: '0으로 나눌 수 없습니다.'
  squareRootOfANegativeNumberIsNotAllowed: '음수의 제곱근은 허용되지 않습니다.'
  factorialOfANegativeNumberIsNotAllowed: '음수의 팩토리얼은 허용되지 않습니다.'
  memoryCleared: '메모리를 초기화했습니다.'
  memoryRecalled: '메모리를 불러왔습니다.'
  memorySaved: '메모리에 저장되었습니다.'
  noMemoryToRecall: '불러올 메모리가 없습니다.'
  disabledButton: '버튼이 비활성화되었습니다.'
en:
  cannotDivideByZero: 'Cannot divide by zero'
  squareRootOfANegativeNumberIsNotAllowed: 'The square root of a negative number is not allowed.'
  factorialOfANegativeNumberIsNotAllowed: 'The factorial of a negative number is not allowed.'
  memoryCleared: 'Memory cleared.'
  memoryRecalled: 'Memory recalled.'
  memorySaved: 'Memory saved.'
  noMemoryToRecall: 'No memory to recall.'
  disabledButton: 'Button is disabled.'
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
