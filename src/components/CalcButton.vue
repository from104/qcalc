<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref, watch, reactive, computed } from 'vue';
  import { useQuasar, colors } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import { Haptics, ImpactStyle } from 'capacitor/@capacitor/haptics';
  import { useStoreSettings } from 'src/stores/store-settings';
  import { useStoreBase } from 'src/stores/store-base';
  import { useStoreNotifications } from 'src/stores/store-notifications';
  import { useStoreUtils } from 'src/stores/store-utils';

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
  const { clickButtonById } = storeUtils;

  // 햅틱 피드백 함수
  const impactLight = async () => {
    if ($q.platform.is.capacitor && storeSettings.hapticsMode) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const impactMedium = async () => {
    if ($q.platform.is.capacitor && storeSettings.hapticsMode) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  };

  // 에러 처리 함수
  const funcWithError = (func: () => void) => {
    const errorMessages: { [key: string]: string } = {
      'Cannot divide by zero.': 'cannotDivideByZero',
      'The square root of a negative number is not allowed.': 'squareRootOfANegativeNumberIsNotAllowed',
      'The factorial of a negative number is not allowed.': 'factorialOfANegativeNumberIsNotAllowed',
      'No memory to recall.': 'noMemoryToRecall',
    };
    try {
      func();
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
  const buttonColors: { [key: string]: string } = {
    important: '#cb9247',
    function: '#1d8fb6',
    normal: '#5e9e7d',
  };

  const buttonShiftPressedColor = lighten(buttonColors.important, -30);

  // 버튼 타입 정의
  type CalculatorButton = {
    [id: string]: [label: string, color: string, keys: string[], action: () => void, isDisabled: boolean];
  };

  type CalculatorMode = {
    [key in 'unit' | 'currency' | 'radix']: CalculatorButton;
  };

  // prettier-ignore
  const commonButtons: CalculatorButton = {
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
  const specializedButtons: CalculatorMode = {
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

const activeButtons = computed(() => {
  const transformButtons = (buttons: CalculatorButton) => {
    return Object.fromEntries(
      Object.entries(buttons).map(([id, [label, color, keys, action, isDisabled]]) => [
        id,
        { label, color, keys, action, isDisabled },
      ])
    );
  };

  return {
    ...transformButtons(commonButtons),
    ...transformButtons(specializedButtons[props.type as keyof typeof specializedButtons] ?? {}),
    };
  });

  type AddedButtonFunction = {
    [key: string]: [label: string, shortcutKeys: string[], action: () => void, isDisabled: boolean];
  };

  type AddedButtonFunctionType = {
    [key in 'unit' | 'currency' | 'radix']: AddedButtonFunction;
  };

  // 공통으로 사용할 기본 버튼 기능
  // prettier-ignore
  const additionalButtonFunctions: AddedButtonFunction = {
    a1: ['xⁿ', ['Shift+Control+q'], () => calc.pow(), false],
    b1: ['ⁿ√x', ['Shift+Control+w'], () => calc.root(), false],
    c1: ['MC', ['Shift+Control+e', 'Shift+Delete', 'Shift+Escape'], () => calc.memoryClear(), false],
    d1: [ 'MR', ['Shift+Backspace', 'Shift+Control+r'], () => { calc.memoryRecall(); showMemory(); }, false ],
    a2: ['10ⁿ', ['Shift+Control+a'], () => calc.exp10(), false],
    b2: ['x%y', ['Shift+Control+s'], () => calc.mod(), false],
    c2: ['x!', ['Shift+Control+d'], () => calc.fct(), false],
    d2: [ 'M÷', ['Shift+Slash', 'Shift+NumpadDivide'], () => { calc.memoryDiv(); showMemory(); }, false ],
    a3: ['sin', ['Shift+Digit7', 'Shift+Numpad7'], () => calc.sin(), false],
    b3: ['cos', ['Shift+Digit8', 'Shift+Numpad8'], () => calc.cos(), false],
    c3: ['tan', ['Shift+Digit9', 'Shift+Numpad9'], () => calc.tan(), false],
    d3: [ 'M×', ['Shift+NumpadMultiply'], () => { calc.memoryMul(); showMemory(); }, false ],
    a4: ['Pi/2', ['Shift+Digit4', 'Shift+Numpad4'], () => calc.setConstant('pi2'), false],
    b4: ['ln10', ['Shift+Digit5', 'Shift+Numpad5'], () => calc.setConstant('ln10'), false],
    c4: ['ln2', ['Shift+Digit6', 'Shift+Numpad6'], () => calc.setConstant('ln2'), false],
    d4: [ 'M-', ['Shift+Minus', 'Shift+NumpadSubtract'], () => { calc.memorySub(); showMemory(); }, false ],
    a5: ['Pi', ['Shift+Digit1', 'Shift+Numpad1'], () => calc.setConstant('pi'), false],
    b5: ['phi', ['Shift+Digit2', 'Shift+Numpad2'], () => calc.setConstant('phi'), false],
    c5: ['e', ['Shift+Digit3', 'Shift+Numpad3'], () => calc.setConstant('e'), false],
    d5: [ 'M+', ['Shift+Plus', 'Shift+NumpadAdd'], () => { calc.memoryAdd(); showMemory(); }, false ],
    a6: ['', [], () => null, false],
    b6: ['int', ['Shift+Digit0', 'Shift+Numpad0'], () => calc.int(), false],
    c6: ['frac', ['Shift+Period', 'Shift+NumpadDecimal'], () => calc.frac(), false],
    d6: [ 'MS', ['Shift+Equal', 'Shift+Enter', 'Shift+NumpadEnter'], () => { calc.memorySave(); showMemory(); }, false ],
  };

  const buttonsAddedFuncByCategory: AddedButtonFunctionType = {
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
      c2: ['~x', ['Shift+Control+d'], () => calc.bitNot(), false],
      a4: ['D', ['Shift+Digit4', 'Shift+Numpad4'], () => calc.addDigit('D'), false],
      b4: ['E', ['Shift+Digit5', 'Shift+Numpad5'], () => calc.addDigit('E'), false],
      c4: ['F', ['Shift+Digit6', 'Shift+Numpad6'], () => calc.addDigit('F'), false],
      a5: ['A', ['Shift+Digit1', 'Shift+Numpad1'], () => calc.addDigit('A'), false],
      b5: ['B', ['Shift+Digit2', 'Shift+Numpad2'], () => calc.addDigit('B'), false],
      c5: ['C', ['Shift+Digit3', 'Shift+Numpad3'], () => calc.addDigit('C'), false],
    },
  };

  // prop type에 따라 적절한 버튼 기능 선택
  const transformAddedButtonFunctions = (buttons: AddedButtonFunction) => {
    return Object.fromEntries(
      Object.entries(buttons).map(([id, [label, shortcutKeys, action, isDisabled]]) => [
        id,
        { label, shortcutKeys, action, isDisabled },
      ])
    );
  };

  const addedButtonFunctions = computed(() => ({
    ...transformAddedButtonFunctions(additionalButtonFunctions),
    ...transformAddedButtonFunctions(buttonsAddedFuncByCategory[props.type as keyof typeof buttonsAddedFuncByCategory] ?? {}),
  }));

  type ButtonID = keyof typeof additionalButtonFunctions;

  // 버튼 클릭 시 알림 표시 함수
  const showButtonNotify = (id: ButtonID) => {
    const buttonFunc = addedButtonFunctions.value[id];
    if (buttonFunc.label === 'MC') {
      notifyMsg(t('memoryCleared'));
    } else if (buttonFunc.label === 'MR' && !calc.isMemoryReset) {
      notifyMsg(t('memoryRecalled'));
    }
  };

  // 시프트 버튼의 ID 찾기
  const shiftID = computed(() =>
    Object.keys(addedButtonFunctions.value).find((key) => addedButtonFunctions.value[key].label === ''),
  );

  // 추가 기능 툴팁 표시를 위한 타이머 상태 객체
  const timersOfTooltip: { [id: string]: boolean } = reactive(
    Object.fromEntries(Object.keys(activeButtons.value).map((id) => [id, false])),
  );

  // 추가 기능 툴팁 표시 함수
  const showTooltipOfFunc = (id: ButtonID) => {
    if (timersOfTooltip[id] || id === shiftID.value || (!storeSettings.showButtonAddedLabel && storeBase.buttonShift))
      return;
    timersOfTooltip[id] = true;
    setTimeout(() => {
      timersOfTooltip[id] = false;
    }, 1000);
  };

  // 버튼 시프트 상태에 따른 기능 실행
  const shiftFunc = (id: ButtonID) => {
    const isShiftButton = id === shiftID.value;
    const isDisabled = storeBase.buttonShift ? addedButtonFunctions.value[id].isDisabled : activeButtons.value[id].isDisabled;
    const action = storeBase.buttonShift ? addedButtonFunctions.value[id].action : activeButtons.value[id].action;

    if (isShiftButton) {
      toggleButtonShift();
      offButtonShiftLock();
      return;
    }

    if (isDisabled) {
      showDisabledButtonNotify();
      return;
    }

    funcWithError(action);

    if (storeBase.buttonShift) {
      showTooltipOfFunc(id);
      showButtonNotify(id);
      if (!storeBase.buttonShiftLock) offButtonShift();
    }
  };

  // 버튼 길게 누르기 기능
const holdFunc = (id: ButtonID) => {
  impactMedium();
  const isShiftButton = id === shiftID.value;
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

  const buttonFunctions = isShiftActive ? activeButtons.value : addedButtonFunctions.value;
  const buttonAction = buttonFunctions[id].action;
  const isDisabled = buttonFunctions[id].isDisabled;

  if (isDisabled) {
    showDisabledButtonNotify();
    return;
  }

  funcWithError(buttonAction);

  if (isShiftActive) {
    if (!isShiftLocked) offButtonShift();
  } else {
    showTooltipOfFunc(id);
    showButtonNotify(id);
  }
};

  // 메모리 표시 함수
  const showMemory = () => {
    if (!calc.isMemoryReset) {
      setTimeout(() => {
        showMemoryOnWithTimer();
      }, 10);
    }
  };

  // 키 입력에 따른 버튼 클릭 함수
  const buttonClickByKey = (id: ButtonID, isShift: boolean) => {
    if (isShift) {
      toggleButtonShift();
      setTimeout(() => {
        clickButtonById('btn-' + id);
      }, 5);
    } else {
      clickButtonById('btn-' + id);
    }
  };

  import { KeyBinding, KeyBindings } from 'classes/KeyBinding';

  // 주요 키 바인딩 설정
  const keyBindingsPrimary: KeyBindings = Object.entries(activeButtons.value).map(([id, button]) => [
    button.keys,
    () => buttonClickByKey(id, false),
  ]);

  // 보조 키 바인딩 설정
  const keyBindingsSecondary: KeyBindings = Object.entries(addedButtonFunctions.value).map(([id, button]) => [
    button.shortcutKeys,
    () => buttonClickByKey(id, true),
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

  // 계산기 버튼 높이 설정
  const baseHeight = ref('136px');
  if (['unit', 'currency', 'radix'].includes(props.type)) {
    baseHeight.value = '234px';
  }

  const showDisabledButtonNotify = () => {
    notifyMsg(t('disabledButton'));
  };
</script>

<template>
  <q-card-section
    v-touch-swipe:9e-2:12:50.up="() => (storeBase.isHistoryDialogOpen = true)"
    v-touch-swipe:9e-2:12:50.down="() => (storeBase.isSettingDialogOpen = true)"
    v-blur
    class="row wrap justify-center q-pt-xs q-pb-none q-px-none"
  >
    <div v-for="(button, id) in activeButtons" :key="id" class="col-3 row wrap justify-center q-pa-sm">
      <q-btn
        :id="'btn-' + id"
        v-touch-hold.mouse="() => holdFunc(id)"
        class="shadow-2 noselect col-12 button"
        no-caps
        push
        :label="
          storeBase.buttonShift && !storeSettings.showButtonAddedLabel && id !== shiftID
            ? addedButtonFunctions[id].label
            : button.label.charAt(0) === '@'
              ? undefined
              : button.label
        "
        :icon="
          storeBase.buttonShift && !storeSettings.showButtonAddedLabel && id !== shiftID
            ? undefined
            : button.label.charAt(0) === '@'
              ? button.label.slice(1)
              : undefined
        "
        :class="[
          storeBase.buttonShift && !storeSettings.showButtonAddedLabel && id !== shiftID
            ? 'char'
            : button.label.charAt(0) === '@'
              ? 'icon'
              : 'char',
          id === shiftID && storeBase.buttonShift ? 'button-shift' : '',
          button.isDisabled ? 'disabled-button' : '',
        ]"
        
        :style="[
          !storeSettings.showButtonAddedLabel || !addedButtonFunctions[id].label ? { paddingTop: '4px' } : {},
        ]"
        :color="`btn-${button.color}`"
        @click="() => button.isDisabled ? showDisabledButtonNotify() : shiftFunc(id)"
        @touchstart="() => impactLight()"
      >
        <span
          v-if="storeSettings.showButtonAddedLabel && addedButtonFunctions[id]"
          class="top-label"
          :class="[
            `top-label-${button.label.charAt(0) === '@' ? 'icon' : 'char'}`,
            addedButtonFunctions[id].isDisabled ? 'disabled-button-added-label' : '',
            storeBase.buttonShift ? 'shifted-button-added-label' : '',
          ]"
        >
          {{ addedButtonFunctions[id].label }}
        </span>
        <q-tooltip
          :model-value="timersOfTooltip[id]"
          no-parent-event
          class="noselect"
          :style="`background: ${buttonColors[button.color]}; border: 2px outset ${buttonColors[button.color]}; border-radius: 10px;`"
          anchor="top middle"
          self="center middle"
          transition-show="jump-up"
          transition-hide="jump-down"
          transition-duration="200"
        >
          {{ addedButtonFunctions[id].label }}
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
    padding-top: calc(((100vh - v-bind('baseHeight')) / 6 - 15px) * 0.3); /* Lower the content by 4px */
  }

  .char {
    font-size: calc(min(calc((100vh - v-bind('baseHeight')) / 6 * 0.26), calc((100vw - 40px) / 4 * 0.3)) * 1.2);
    padding-top: calc(((100vh - v-bind('baseHeight')) / 6 - 25px) * 0.3); /* Lower the content by 4px */
  }

  .top-label {
    text-align: center;
    position: absolute;
    font-size: calc(min(calc((100vh - v-bind('baseHeight')) / 6 * 0.26), calc((100vw - 40px) / 4 * 0.3)) * 1.2 * 0.7);
    color: rgba(255, 255, 255, 0.5);
  }

  .top-label-icon {
    top: calc(((100vh - v-bind('baseHeight')) / 6) * 0.15 - 9px);
  }

  .top-label-char {
    top: calc(((100vh - v-bind('baseHeight')) / 6) * 0.15 - 17px);
  }

  .bg-btn-important {
    background: v-bind('buttonColors.important') !important; // 아이콘의 밝은 녹색
  }

  .bg-btn-function {
    background: v-bind('buttonColors.function') !important; // 아이콘의 밝은 파란색과 어울리게 조정
  }

  .bg-btn-normal {
    background: v-bind('buttonColors.normal') !important; // 어두운 색
  }

  .button-shift {
    background: v-bind(buttonShiftPressedColor) !important;
  }

  .disabled-button {
    &:deep(.q-btn__content) {
      color: rgba(255, 255, 255, 0.5) !important;
    }
  }
  
  .disabled-button-added-label {
    color: rgba(255, 255, 255, 0.3) !important;
  }

  .shifted-button-added-label {
    color: rgba(255, 255, 255, 0.7) !important;
  }
</style>
