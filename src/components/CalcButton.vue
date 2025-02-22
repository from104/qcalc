<script setup lang="ts">
  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { onMounted, onBeforeUnmount, ref, watch, reactive, computed } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // Quasar 관련 설정
  import { useQuasar, colors } from 'quasar';
  // Quasar 인스턴스 및 색상 유틸리티 초기화
  const $q = useQuasar();
  const { lighten } = colors;

  // 패턴 매칭 유틸리티
  import { match } from 'ts-pattern';

  // 햅틱 피드백 관련
  import { Haptics, ImpactStyle } from 'capacitor/haptics';

  // 키 바인딩 관련
  import { KeyBinding } from 'classes/KeyBinding';
  import type { KeyBindings } from 'classes/KeyBinding';

  // 진법 관련
  import { Radix } from 'classes/RadixConverter';

  // 스토어 관련
  import { useStore } from 'src/stores/store';
  // 스토어 인스턴스 초기화
  const store = useStore();

  // 컴포넌트 import
  import ToolTip from 'src/components/snippets/ToolTip.vue';

  // props 기본값 설정
  const props = withDefaults(defineProps<{ type?: string }>(), {
    type: 'calc',
  });

  // 스토어에서 필요한 메서드 추출
  const {
    calc,
    disableShift,
    disableShiftLock,
    enableShift,
    enableShiftLock,
    toggleShift,
    toggleShiftLock,
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
    } as const;
    try {
      action();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      if (errorMessages[message]) {
        showError(t(errorMessages[message]));
      } else {
        showError(message);
      }
    }
  };

  // 버튼 색상 정의
  const calculatorButtonColors: { [key: string]: string } = {
    important: '#cb9247',
    function: '#1d8fb6',
    normal: '#5e9e7d',
  };

  const shiftButtonPressedColor = lighten(calculatorButtonColors.important ?? '', -30);

  import { createCalcButtonSet } from 'src/constants/CalcButtonSet';

  // const i18n = useI18n();
  const { standardButtons, modeSpecificButtons, standardExtendedFunctions, modeSpecificExtendedFunctions } =
    createCalcButtonSet(t);

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
    if (buttonFunc?.label === 'MC') {
      showMessage(t('memoryCleared'));
    } else if (buttonFunc?.label === 'MR' && !calc.isMemoryEmpty) {
      showMessage(t('memoryRecalled'));
    }
  };

  // 시프트 버튼의 ID 찾기
  const shiftButtonId = computed(() =>
    Object.keys(extendedFunctionSet.value).find((key) => extendedFunctionSet.value[key]?.label === ''),
  );

  // 추가 기능 툴팁 표시를 위한 타이머 상태 객체
  const tooltipTimers: { [id: string]: boolean } = reactive(
    Object.fromEntries(Object.keys(activeButtonSet.value).map((id) => [id, false])),
  );

  // 추가 기능 툴팁 표시 함수
  const displayActionTooltip = (id: ButtonID) => {
    if (tooltipTimers[id] || id === shiftButtonId.value || (!store.showButtonAddedLabel && store.isShiftPressed))
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
      ? (extendedFunctionSet.value[id]?.isDisabled ?? false)
      : (activeButtonSet.value[id]?.isDisabled ?? false);
    const action = store.isShiftPressed ? extendedFunctionSet.value[id]?.action : activeButtonSet.value[id]?.action;

    if (isShiftButton) {
      toggleShift();
      disableShiftLock();
      return;
    }

    if (isDisabled) {
      displayDisabledButtonNotification();
      return;
    }

    executeActionWithErrorHandling(action as () => void);

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
    const buttonAction = buttonFunctions[id]?.action;
    const isDisabled = buttonFunctions[id]?.isDisabled ?? false;

    if (isDisabled) {
      displayDisabledButtonNotification();
      return;
    }

    executeActionWithErrorHandling(buttonAction as () => void);

    if (isShiftActive) {
      if (!isShiftLocked) disableShift();
    } else {
      displayActionTooltip(id);
      displayButtonNotification(id);
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
    const shortcutKeys = buttonFunctions[btnId]?.shortcutKeys ?? [];

    return shortcutKeys
      .map((key) => {
        if (key === '+') return '+';
        const parts = key.split('+');
        const modifiers = parts
          .slice(0, -1)
          .map((part) => {
            if (part === 'Shift') return 'S';
            if (part === 'Control') return 'C';
            if (part === 'Alt') return 'A';
            return part;
          })
          .join('');

        const lastPart = parts[parts.length - 1]?.replace('Digit', '').replace('Numpad', 'N') ?? '';
        return modifiers + (modifiers ? '-' : '') + lastPart;
      })
      .join(', ');
  };

  const baseWidth = computed(() => {
    return store.isAtLeastDoubleWidth() ? '50vw' : '100vw';
  });

  // 버튼의 aria-label 설정
  const getAriaLabel = (id: ButtonID, button: { label: string }) => {
    if (button.label.charAt(0) === '@') {
      // 아이콘 버튼의 경우 아이콘 이름에 따라 적절한 레이블 반환
      return match(button.label.slice(1))
        .with('mdi-backspace', () => t('ariaLabel.backspace'))
        .with('mdi-plus-minus-variant', () => t('ariaLabel.plusMinus'))
        .with('mdi-division', () => t('ariaLabel.divide'))
        .with('mdi-close', () => t('ariaLabel.multiply'))
        .with('mdi-minus', () => t('ariaLabel.subtract'))
        .with('mdi-plus', () => t('ariaLabel.add'))
        .with('mdi-equal', () => t('ariaLabel.equals'))
        .with('mdi-circle-small', () => t('ariaLabel.decimal'))
        .with('keyboard_capslock', () => t('ariaLabel.shift'))
        .otherwise(() => button.label.slice(1));
    }
    return button.label;
  };
</script>

<template>
  <q-card-section v-auto-blur class="row wrap justify-center q-pt-xs q-pb-none q-px-none">
    <div v-for="(button, id) in activeButtonSet" :key="id" class="col-3 row wrap justify-center q-pa-sm">
      <q-btn
        :id="'btn-' + id"
        v-touch-hold.mouse="() => handleLongPress(id)"
        class="shadow-2 noselect col-12 button"
        no-caps
        push
        :label="
          store.isShiftPressed && !store.showButtonAddedLabel && id !== shiftButtonId
            ? (extendedFunctionSet[id]?.label ?? '')
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
          store.isShiftPressed && !store.showButtonAddedLabel && !(extendedFunctionSet[id]?.isDisabled ?? false)
            ? ''
            : (button.isDisabled ?? false) || store.isShiftPressed
              ? 'disabled-button'
              : '',
        ]"
        :style="[!store.showButtonAddedLabel || !(extendedFunctionSet[id]?.label ?? '') ? { paddingTop: '4px' } : {}]"
        :color="`btn-${button.color}`"
        :aria-label="getAriaLabel(id, button)"
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
          :model-value="tooltipTimers[id] ?? false"
          no-parent-event
          class="noselect"
          :style="`background: ${calculatorButtonColors[button.color]}; border: 2px outset ${calculatorButtonColors[button.color]}; border-radius: 10px;`"
          anchor="top middle"
          self="center middle"
          transition-show="jump-up"
          transition-hide="jump-down"
          transition-duration="200"
        >
          {{ extendedFunctionSet[id]?.label ?? '' }}
        </q-tooltip>
        <ToolTip>
          {{
            store.isShiftPressed
              ? (extendedFunctionSet[id]?.isDisabled ?? false)
                ? t('disabledButton')
                : getTooltipsOfKeys(id, true)
              : (activeButtonSet[id]?.isDisabled ?? false)
                ? t('disabledButton')
                : getTooltipsOfKeys(id, false)
          }}
        </ToolTip>
      </q-btn>
    </div>
  </q-card-section>
</template>

<style scoped lang="scss">
  .button {
    min-height: calc((100vh - v-bind('baseHeight')) / 6 - 20px);
    max-height: calc((100vh - v-bind('baseHeight')) / 6 - 20px);
    font-weight: 700;
    position: relative;
  }

  .icon {
    font-size: calc(
      min(calc((100vh - v-bind('baseHeight')) / 6 * 0.25), calc((v-bind('baseWidth') - 40px) / 4 * 0.3)) * 0.7
    );
    padding-top: calc(((100vh - v-bind('baseHeight')) / 6 - 13px) * 0.25); /* Lower the content by 4px */
  }

  .char {
    font-size: calc(
      min(calc((100vh - v-bind('baseHeight')) / 6 * 0.26), calc((v-bind('baseWidth') - 40px) / 4 * 0.3)) * 1.1
    );
    padding-top: calc(((100vh - v-bind('baseHeight')) / 6 - 13px) * 0.23); /* Lower the content by 4px */
  }

  .top-label {
    text-align: center;
    position: absolute;
    font-size: calc(min(calc((100vh - v-bind('baseHeight')) / 6 * 0.26), calc((100vw - 40px) / 4 * 0.3)) * 1.2 * 0.7);
    color: rgba(255, 255, 255, 0.7);
    width: 100%; /* 가로 중앙 정렬을 위해 추가 */
  }

  .top-label-icon {
    top: 6%;
  }

  .top-label-char {
    top: -7%;
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
  ariaLabel:
    backspace: '지우기'
    plusMinus: '부호 바꾸기'
    divide: '나누기'
    multiply: '곱하기'
    subtract: '빼기'
    add: '더하기'
    equals: '계산하기'
    decimal: '소수점'
    shift: '시프트'
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
  ariaLabel:
    backspace: 'Backspace'
    plusMinus: 'Change sign'
    divide: 'Divide'
    multiply: 'Multiply' 
    subtract: 'Subtract'
    add: 'Add'
    equals: 'Calculate'
    decimal: 'Decimal point'
    shift: 'Shift'
</i18n>
