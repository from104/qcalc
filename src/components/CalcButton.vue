<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref, watch, reactive } from 'vue';
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

  const buttonColorsLight: { [key: string]: string } = {
    important: lighten(buttonColors.important, 70),
    function: lighten(buttonColors.function, 70),
    normal: lighten(buttonColors.normal, 70),
  };

  const buttonColorsDark: { [key: string]: string } = {
    important: lighten(buttonColors.important, 50),
    function: lighten(buttonColors.function, 50),
    normal: lighten(buttonColors.normal, 50),
  };

  const buttonShiftPressedColor = lighten(buttonColors.important, -30);

  // 버튼 타입 정의
  type Button = {
    [id: string]: [isIcon: boolean, label: string, color: string, keys: string[], handler: () => void];
  };

  // prettier-ignore
  const buttons: Button = {
    a1: [false, 'x²', 'function', ['Control+q'], () => calc.pow2()],
    b1: [false, '√x', 'function', ['Control+w'], () => calc.sqrt()],
    c1: [false, 'C', 'important', ['Control+e', 'Delete', 'Escape'], () => calc.clear()],
    d1: [true, 'mdi-backspace', 'important', ['Backspace', 'Control+r'], () => calc.deleteDigitOrDot()],
    a2: [true, 'mdi-plus-minus-variant', 'function', ['Control+a'], () => calc.changeSign()],
    b2: [false, '%', 'function', ['Control+s'], () => calc.percent()],
    c2: [false, '1/x', 'function', ['Control+d'], () => calc.rec()],
    d2: [true, 'mdi-division', 'function', ['/'], () => calc.div()],
    a3: [false, '7', 'normal', ['7'], () => calc.addDigit(7)],
    b3: [false, '8', 'normal', ['8'], () => calc.addDigit(8)],
    c3: [false, '9', 'normal', ['9'], () => calc.addDigit(9)],
    d3: [true, 'mdi-close', 'function', ['*'], () => calc.mul()],
    a4: [false, '4', 'normal', ['4'], () => calc.addDigit(4)],
    b4: [false, '5', 'normal', ['5'], () => calc.addDigit(5)],
    c4: [false, '6', 'normal', ['6'], () => calc.addDigit(6)],
    d4: [true, 'mdi-minus', 'function', ['-'], () => calc.minus()],
    a5: [false, '1', 'normal', ['1'], () => calc.addDigit(1)],
    b5: [false, '2', 'normal', ['2'], () => calc.addDigit(2)],
    c5: [false, '3', 'normal', ['3'], () => calc.addDigit(3)],
    d5: [true, 'mdi-plus', 'function', ['+'], () => calc.plus()],
    a6: [true, 'keyboard_capslock', 'important', ["'"], () => toggleButtonShift()],
    b6: [false, '0', 'normal', ['0'], () => calc.addDigit(0)],
    c6: [true, 'mdi-circle-small', 'normal', ['.'], () => calc.addDot()],
    d6: [true, 'mdi-equal', 'important', ['=', 'Enter'], () => calc.equal()],
  };

  type ButtonAddedFunc = {
    [id: string]: [label: string, keys: string[], handler: () => void];
  };

  // 계산기 버튼에 2번째 기능에 대한 레이블 정의
  // prettier-ignore
  const buttonsAddedFunc: ButtonAddedFunc = {
    a1: ['xⁿ', ['Shift+Control+q'], () => calc.pow()],
    b1: ['ⁿ√x', ['Shift+Control+w'], () => calc.root()],
    c1: ['MC', ['Shift+Control+e', 'Shift+Delete', 'Shift+Escape'], () => calc.memoryClear()],
    d1: ['MR', ['Shift+Backspace', 'Shift+Control+r'], () => { calc.memoryRecall(); showMemory(); }],
    a2: ['10ⁿ', ['Shift+Control+a'], () => calc.exp10()],
    b2: ['x%y', ['Shift+Control+s'], () => calc.mod()],
    c2: ['x!', ['Shift+Control+d'], () => calc.fct()],
    d2: ['M÷', ['Shift+Slash', 'Shift+NumpadDivide'], () => { calc.memoryDiv(); showMemory(); }],
    a3: ['sin', ['Shift+Digit7', 'Shift+Numpad7'], () => calc.sin()],
    b3: ['cos', ['Shift+Digit8', 'Shift+Numpad8'], () => calc.cos()],
    c3: ['tan', ['Shift+Digit9', 'Shift+Numpad9'], () => calc.tan()],
    d3: ['M×', ['Shift+NumpadMultiply'], () => { calc.memoryMul(); showMemory(); }, ],
    a4: ['Pi/2', ['Shift+Digit4', 'Shift+Numpad4'], () => calc.setConstant('pi2')],
    b4: ['ln10', ['Shift+Digit5', 'Shift+Numpad5'], () => calc.setConstant('ln10')],
    c4: ['ln2', ['Shift+Digit6', 'Shift+Numpad6'], () => calc.setConstant('ln2')],
    d4: ['M-', ['Shift+Minus', 'Shift+NumpadSubtract'], () => { calc.memoryMinus(); showMemory(); }],
    a5: ['Pi', ['Shift+Digit1', 'Shift+Numpad1'], () => calc.setConstant('pi')],
    b5: ['phi', ['Shift+Digit2', 'Shift+Numpad2'], () => calc.setConstant('phi')],
    c5: ['e', ['Shift+Digit3', 'Shift+Numpad3'], () => calc.setConstant('e')],
    d5: ['M+', ['Shift+Plus', 'Shift+NumpadAdd'], () => { calc.memoryPlus(); showMemory(); }],
    a6: ['', [], () => null],
    b6: ['int', ['Shift+Digit0', 'Shift+Numpad0'], () => calc.int()],
    c6: ['frac', ['Shift+Period', 'Shift+NumpadDecimal'], () => calc.frac()],
    d6: [ 'MS', ['Shift+Equal', 'Shift+Enter', 'Shift+NumpadEnter'], () => { calc.memorySave(); showMemory(); }],
  };

  // 버튼 클릭 시 알림 표시 함수
  const showButtonNotify = (id: ButtonID) => {
    if (buttonsAddedFunc[id][0] === 'MC') {
      notifyMsg(t('memoryCleared'));
    } else if (buttonsAddedFunc[id][0] === 'MR' && !calc.getIsMemoryReset()) {
      notifyMsg(t('memoryRecalled'));
    } else if (buttonsAddedFunc[id][0] === 'MS') {
      notifyMsg(t('memorySaved'));
    }
  };

  // 시프트 버튼의 ID 찾기
  const shiftID = Object.keys(buttonsAddedFunc).find((key) => buttonsAddedFunc[key][0] === '');

  // 추가 기능 툴팁 표시를 위한 타이머 상태 객체
  const timersOfTooltip: {[id: string]: boolean} = reactive(
    Object.fromEntries(Object.keys(buttons).map((id) => [id, false]))
  );

  type ButtonID = string | number;

  // 추가 기능 툴팁 표시 함수
  const showTooltipOfFunc = (id: ButtonID) => {
    if (timersOfTooltip[id] || id === shiftID || (!storeSettings.showButtonAddedLabel && storeBase.buttonShift)) return;
    timersOfTooltip[id] = true;
    setTimeout(() => {
      timersOfTooltip[id] = false;
    }, 1000);
  };

  // 버튼 시프트 상태에 따른 기능 실행
  const shiftFunc = (id: ButtonID) => {
    if (storeBase.buttonShift) {
      funcWithError(buttonsAddedFunc[id][2]);
      showTooltipOfFunc(id);
      showButtonNotify(id);
      if (id === shiftID) {
        offButtonShift();
        offButtonShiftLock();
        return;
      }
      if (!storeBase.buttonShiftLock) offButtonShift();
    } else {
      funcWithError(buttons[id][4]);
    }
  };

  // 버튼 길게 누르기 기능
  const holdFunc = (id: ButtonID) => {
    impactMedium();
    if (id === shiftID) {
      if (storeBase.buttonShiftLock) {
        offButtonShiftLock();
        offButtonShift();
      } else {
        onButtonShiftLock();
        onButtonShift();
      }
      return;
    }
    if (storeBase.buttonShift) {
      funcWithError(buttons[id][4]);
      if (!storeBase.buttonShiftLock) offButtonShift();
    } else {
      funcWithError(buttonsAddedFunc[id][2]);
      showTooltipOfFunc(id);
      showButtonNotify(id);
    }
  };

  // 메모리 표시 함수
  const showMemory = () => {
    if (!calc.getIsMemoryReset()) {
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

  import {KeyBinding, KeyBindings} from 'classes/KeyBinding';

  // 주요 키 바인딩 설정
  const keyBindingsPrimary: KeyBindings = Object.entries(buttons).map(([id, [, , , keys]]) => [
    keys,
    () => buttonClickByKey(id, false),
  ]);

  // 보조 키 바인딩 설정
  const keyBindingsSecondary: KeyBindings = Object.entries(buttonsAddedFunc).map(([id, [, keys]]) => [
    keys,
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
    {immediate: true}
  );

  // props 기본값 설정
  const props = withDefaults(defineProps<{type?: string}>(), {
    type: 'normal',
  });

  // 계산기 버튼 높이 설정
  const baseHeight = ref('136px');
  if (props.type === 'unit' || props.type === 'currency') {
    baseHeight.value = '234px';
  }
</script>

<template>
  <q-card-section
    v-touch-swipe:9e-2:12:50.up="() => (storeBase.isHistoryDialogOpen = true)"
    v-touch-swipe:9e-2:12:50.down="() => (storeBase.isSettingDialogOpen = true)"
    v-blur
    class="row wrap justify-center q-pt-xs q-pb-none q-px-none"
  >
    <div v-for="(button, id) in buttons" :key="id" class="col-3 row wrap justify-center q-pa-sm">
      <q-btn
        :id="'btn-' + id"
        v-touch-hold.mouse="() => holdFunc(id)"
        class="shadow-2 noselect col-12 button"
        no-caps
        push
        :label="
          storeBase.buttonShift && !storeSettings.showButtonAddedLabel && id !== shiftID
            ? buttonsAddedFunc[id][0]
            : button[0]
              ? undefined
              : button[1]
        "
        :icon="
          storeBase.buttonShift && !storeSettings.showButtonAddedLabel && id !== shiftID
            ? undefined
            : button[0]
              ? button[1]
              : undefined
        "
        :class="[
          storeBase.buttonShift && !storeSettings.showButtonAddedLabel && id !== shiftID ? 'char' : button[0] ? 'icon' : 'char',
          id === shiftID && storeBase.buttonShift ? 'button-shift' : '',
        ]"
        :style="!storeSettings.showButtonAddedLabel || !buttonsAddedFunc[id][0] ? {paddingTop: '4px'} : {}"
        :color="`btn-${button[2]}`"
        @click="() => shiftFunc(id)"
        @touchstart="() => impactLight()"
      >
        <span
          v-if="storeSettings.showButtonAddedLabel && buttonsAddedFunc[id]"
          class="top-label"
          :class="[`top-label-${button[0] ? 'icon' : 'char'}`]"
          :style="`color: ${storeBase.buttonShift ? buttonColorsLight[button[2]] : buttonColorsDark[button[2]]}`"
        >
          {{ buttonsAddedFunc[id][0] }}
        </span>
        <q-tooltip
          :model-value="timersOfTooltip[id]"
          no-parent-event
          class="noselect"
          :style="`background: ${buttonColors[button[2]]}; border: 2px outset ${buttonColors[button[2]]}; border-radius: 10px;`"
          anchor="top middle"
          self="center middle"
          transition-show="jump-up"
          transition-hide="jump-down"
          transition-duration="200"
        >
          {{ buttonsAddedFunc[id][0] }}
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
en:
  cannotDivideByZero: 'Cannot divide by zero'
  squareRootOfANegativeNumberIsNotAllowed: 'The square root of a negative number is not allowed.'
  factorialOfANegativeNumberIsNotAllowed: 'The factorial of a negative number is not allowed.'
  memoryCleared: 'Memory cleared.'
  memoryRecalled: 'Memory recalled.'
  memorySaved: 'Memory saved.'
  noMemoryToRecall: 'No memory to recall.'
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

  .top-label-important {
    color: v-bind('buttonColorsLight.important') !important; // 아이콘의 밝은 녹색
  }

  .top-label-function {
    color: v-bind('buttonColorsLight.function') !important; // 아이콘의 밝은 파란색과 어울리게 조정
  }

  .top-label-normal {
    color: v-bind('buttonColorsLight.normal') !important; // 어두운 색
  }

  .button-shift {
    background: v-bind(buttonShiftPressedColor) !important;
  }
</style>
