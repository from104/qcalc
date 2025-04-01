<script setup lang="ts">
  /**
   * @file CalcButton.vue
   * @description 이 파일은 계산기 버튼을 구성하는 Vue 컴포넌트입니다.
   *              사용자가 다양한 계산 기능을 수행할 수 있도록 버튼을 제공하며,
   *              각 버튼에 대한 동작을 설정합니다.
   *
   * @props {string} type - 버튼의 유형 (기본값: 'calc')
   */

  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { onMounted, onBeforeUnmount, ref, watch, reactive, computed } from 'vue';

  import { createCalcButtonSet } from 'src/constants/CalcButtonSet';
  import { showError, showMessage } from 'src/utils/NotificationUtils';
  import { clickButtonById, isWideWidth } from 'src/utils/GlobalHelpers';

  // 전역 window 객체에 접근하기 위한 상수 선언
  const $g = window.globalVars;

  import { useSettingsStore } from 'stores/settingsStore';
  import { useCalcStore } from 'src/stores/calcStore';
  import { useUIStore } from 'stores/uiStore';
  import { useRadixStore } from 'stores/radixStore';

  const settingsStore = useSettingsStore();
  const uiStore = useUIStore();
  const calcStore = useCalcStore();
  const radixStore = useRadixStore();

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // Quasar 관련 설정
  import { colors } from 'quasar';
  // Quasar 인스턴스 및 색상 유틸리티 초기화
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

  // 컴포넌트 import
  import ToolTip from 'src/components/snippets/ToolTip.vue';

  // props 기본값 설정
  const props = withDefaults(defineProps<{ type?: string }>(), { type: 'calc' });

  // 스토어에서 필요한 메서드 추출
  const { calc } = calcStore;

  // 햅틱 피드백 함수
  const hapticFeedbackLight = async () => {
    if ($g.isCapacitor && settingsStore.hapticsMode) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const hapticFeedbackMedium = async () => {
    if ($g.isCapacitor && settingsStore.hapticsMode) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  };

  // 에러 처리 함수
  const executeActionWithErrorHandling = (action: () => void) => {
    try {
      action();
    } catch (e: unknown) {
      if (e instanceof Error) {
        // 에러 메시지가 이미 i18n 처리된 경우 그대로 표시
        showError(e.message);
      } else {
        // 알 수 없는 에러의 경우 기본 에러 메시지 표시
        showError(t('error.unknown'));
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

  // const i18n = useI18n();
  const { standardButtons, modeSpecificButtons, standardExtendedFunctions, modeSpecificExtendedFunctions } =
    createCalcButtonSet(t);

  // mainRadix의 변경을 감지하는 computed 속성 추가
  const currentRadixBase = computed(() => {
    const radixKey = radixStore.sourceRadix as Radix;
    return (
      ({ [Radix.Binary]: 2, [Radix.Octal]: 8, [Radix.Decimal]: 10, [Radix.Hexadecimal]: 16 } as Record<Radix, number>)[
        radixKey
      ] ?? 10
    );
  });

  // isButtonDisabledForBase 함수를 computed 속성 사용하도록 수정
  const isButtonDisabledForCurrentBase = (label: string) => {
    if (props.type !== 'radix') return false;

    const value = label.match(/^[0-9A-F]+$/)?.[0];
    if (!value) return false;

    return Number(radixStore.convertRadix(value, Radix.Hexadecimal, Radix.Decimal)) >= currentRadixBase.value;
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

    return { ...transformExtendedFunctions(standardExtendedFunctions), ...transformExtendedFunctions(categoryButtons) };
  });

  type ButtonID = keyof typeof standardExtendedFunctions;

  // 버튼 클릭 시 알림 표시 함수
  const displayButtonNotification = (id: ButtonID) => {
    const buttonFunc = extendedFunctionSet.value[id];
    if (buttonFunc?.label === 'MC' && !calc.memory.isEmpty) {
      showMessage(t('memoryCleared'));
    } else if (buttonFunc?.label === 'MR' && !calc.memory.isEmpty) {
      showMessage(t('memoryRecalled'));
    } else if (buttonFunc?.label === 'MS') {
      showMessage(t('memorySaved'));
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
    if (
      tooltipTimers[id] ||
      id === shiftButtonId.value ||
      (settingsStore.showButtonAddedLabel && calcStore.isShiftPressed)
    )
      return;
    tooltipTimers[id] = true;
    setTimeout(() => {
      tooltipTimers[id] = false;
    }, 1000);
  };

  // 버튼 시프트 상태에 따른 기능 실행
  const handleClickBtn = (id: ButtonID) => {
    // const isShiftButton = id === shiftButtonId.value;
    const isDisabled = calcStore.isShiftPressed
      ? (extendedFunctionSet.value[id]?.isDisabled ?? false)
      : (activeButtonSet.value[id]?.isDisabled ?? false);
    const action = calcStore.isShiftPressed ? extendedFunctionSet.value[id]?.action : activeButtonSet.value[id]?.action;

    // if (isShiftButton) {
    //   calcStore.toggleShift();
    //   calcStore.disableShiftLock();
    //   return;
    // }

    if (isDisabled) {
      displayDisabledButtonNotification();
      return;
    }

    executeActionWithErrorHandling(action as () => void);

    if (id !== shiftButtonId.value && calcStore.isShiftPressed) {
      displayActionTooltip(id);
      displayButtonNotification(id);
      if (!calcStore.isShiftLocked) calcStore.disableShift();
    }
  };

  // 버튼 길게 누르기 기능
  const handleLongPress = (id: ButtonID) => {
    hapticFeedbackMedium();
    // const isShiftButton = id === shiftButtonId.value;
    const isShiftActive = calcStore.isShiftPressed;
    const isShiftLocked = calcStore.isShiftLocked;
    // if (isShiftButton) {
    //   if (isShiftLocked) {
    //     calcStore.disableShiftLock();
    //     calcStore.disableShift();
    //   } else {
    //     calcStore.enableShiftLock();
    //     calcStore.enableShift();
    //   }
    //   return;
    // }

    const buttonFunctions = isShiftActive ? activeButtonSet.value : extendedFunctionSet.value;
    const buttonAction = buttonFunctions[id]?.action;
    const isDisabled = buttonFunctions[id]?.isDisabled ?? false;

    if (isDisabled) {
      displayDisabledButtonNotification();
      return;
    }

    executeActionWithErrorHandling(buttonAction as () => void);

    if (id !== shiftButtonId.value && isShiftActive) {
      if (!isShiftLocked) calcStore.disableShift();
    } else {
      displayActionTooltip(id);
      displayButtonNotification(id);
    }
  };

  // 키 입력에 따른 버튼 클릭 함수
  const triggerButtonClickByKey = (id: ButtonID, isShift: boolean) => {
    if (isShift) {
      calcStore.toggleShiftLock();
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
    () => {
      calcStore.enableShift();
      triggerButtonClickByKey(id, true);
      setTimeout(() => {
        calcStore.disableShift();
      }, 5);
    },
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
    () => uiStore.inputFocused,
    (focused) => {
      if (focused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
    { immediate: true },
  );

  // resize 이벤트를 처리하기 위한 ref 생성
  const screenWidth = ref(isWideWidth() ? window.innerWidth / 2 : window.innerWidth);
  const screenHeight = ref(window.innerHeight);

  // resize 이벤트 핸들러
  const handleResize = () => {
    screenWidth.value = isWideWidth() ? window.innerWidth / 2 : window.innerWidth;
    screenHeight.value = window.innerHeight;
  };

  // 컴포넌트 마운트 시 resize 이벤트 리스너 등록
  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  // 컴포넌트 언마운트 시 resize 이벤트 리스너 제거
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
  });

  // 계산기 버튼 높이 설정
  const baseHeight = ref('136px');
  // const baseHeight = ref('272px');
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

  // const baseWidth = computed(() => {
  //   return $s.isWideWidth() ? '50vw' : '100vw';
  // });

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

  const labelScalingFactor = computed(() => {
    if ($g.isCapacitor) {
      // console.log('window.textZoom: ', window.textZoom);
      return $g.textZoom / 100;
    }
    // screenWidth ref를 사용하여 화면 너비 계산
    const screenWidthPx = screenWidth.value;
    const screenHeightPx = screenHeight.value;
    // 기준이 되는 너비 (Android와 동일한 값 사용)
    const BASE_WIDTH_PX = 352;
    const BASE_HEIGHT_PX = 604;

    // 현재 화면 너비를 기준 너비에 대해 상대적으로 스케일링 팩터를 계산합니다
    const scaleFactorWidth = screenWidthPx / BASE_WIDTH_PX;
    const scaleFactorHeight = screenHeightPx / BASE_HEIGHT_PX;

    // Android와 동일하게 100을 곱한 후 100으로 나누어 비율을 계산합니다
    return Math.min(scaleFactorWidth, scaleFactorHeight);
  });

  const labelSizeAdjustmentRatio = computed(() => {
    return $g.isCapacitor ? 1 / labelScalingFactor.value : 1;
  });
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
          calcStore.isShiftPressed && !settingsStore.showButtonAddedLabel && id !== shiftButtonId
            ? (extendedFunctionSet[id]?.label ?? '')
            : button.label.charAt(0) === '@'
              ? undefined
              : button.label
        "
        :icon="
          calcStore.isShiftPressed && !settingsStore.showButtonAddedLabel && id !== shiftButtonId
            ? undefined
            : button.label.charAt(0) === '@'
              ? button.label.slice(1)
              : undefined
        "
        :class="[
          calcStore.isShiftPressed && !settingsStore.showButtonAddedLabel && id !== shiftButtonId
            ? 'char'
            : button.label.charAt(0) === '@'
              ? 'icon'
              : 'char',
          id === shiftButtonId && calcStore.isShiftPressed ? 'button-shift' : '',
          calcStore.isShiftPressed &&
          !settingsStore.showButtonAddedLabel &&
          !(extendedFunctionSet[id]?.isDisabled ?? false)
            ? ''
            : (button.isDisabled ?? false) || calcStore.isShiftPressed
              ? 'disabled-button'
              : '',
        ]"
        :style="[
          !settingsStore.showButtonAddedLabel || !(extendedFunctionSet[id]?.label ?? '') ? { paddingTop: '4px' } : {},
        ]"
        :color="`btn-${button.color}`"
        :aria-label="getAriaLabel(id, button)"
        @click="() => (button.isDisabled ? displayDisabledButtonNotification() : handleClickBtn(id))"
        @touchstart="() => hapticFeedbackLight()"
      >
        <span
          v-if="settingsStore.showButtonAddedLabel && extendedFunctionSet[id]"
          class="top-label"
          :class="[
            `top-label-${button.label.charAt(0) === '@' ? 'icon' : 'char'}`,
            extendedFunctionSet[id].isDisabled ? 'disabled-button-added-label' : '',
            calcStore.isShiftPressed && !extendedFunctionSet[id].isDisabled ? 'shifted-button-added-label' : '',
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
            calcStore.isShiftPressed
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
    font-size: calc(((100vh - v-bind('baseHeight')) / 6 - 20px) * 0.25 * v-bind('labelSizeAdjustmentRatio'));
    padding-top: calc(
      ((100vh - v-bind('baseHeight')) / 6 - 13px) * 0.27 * v-bind('labelScalingFactor') *
        v-bind('labelSizeAdjustmentRatio')
    );
  }

  .char {
    font-size: calc(((100vh - v-bind('baseHeight')) / 6 - 20px) * 0.38 * v-bind('labelSizeAdjustmentRatio'));
    padding-top: calc(
      ((100vh - v-bind('baseHeight')) / 6 - 13px) * 0.26 * v-bind('labelScalingFactor') *
        v-bind('labelSizeAdjustmentRatio')
    );
  }

  .top-label {
    text-align: center;
    position: absolute;
    font-size: calc(((100vh - v-bind('baseHeight')) / 6 - 20px) * 0.25 * v-bind('labelSizeAdjustmentRatio'));
    color: rgba(255, 255, 255, 0.7);
    width: 100%; /* 가로 중앙 정렬을 위해 추가 */
  }

  .top-label-icon {
    top: 6%;
  }

  .top-label-char {
    top: -6%;
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
