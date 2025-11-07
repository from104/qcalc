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
  import { clickButtonById, isWideWidth, logDev } from 'src/utils/GlobalHelpers';

  // 전역 window 객체에 접근하기 위한 상수 선언
  const $g = window.globalVars;

  import { useSettingsStore } from 'stores/settingsStore';
  import { useThemesStore } from 'stores/themesStore';
  import { useCalcStore } from 'src/stores/calcStore';
  import { useUIStore } from 'stores/uiStore';
  import { useRadixStore } from 'stores/radixStore';

  const settingsStore = useSettingsStore();
  const themesStore = useThemesStore();
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
  import { Haptics, ImpactStyle } from '@capacitor/haptics';

  // 키 바인딩 관련
  import { useKeyBinding } from '../composables/useKeyBinding';
  import type { KeyBindings } from '../composables/useKeyBinding';

  // 진법 관련
  import { Radix } from 'src/utils/RadixConverter';

  // 컴포넌트 import
  import ToolTip from 'src/components/snippets/ToolTip.vue';

  // props 기본값 설정
  const props = withDefaults(defineProps<{ type?: string }>(), { type: 'calc' });

  // 스토어에서 필요한 메서드 추출
  const { calc } = calcStore;

  /**
   * 가벼운 햅틱 피드백을 실행합니다.
   */
  const hapticFeedbackLight = async () => {
    if ($g.isCapacitor && settingsStore.hapticsMode) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  /**
   * 중간 강도의 햅틱 피드백을 실행합니다.
   */
  const hapticFeedbackMedium = async () => {
    if ($g.isCapacitor && settingsStore.hapticsMode) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  };

  /**
   * 에러 핸들링과 함께 버튼 액션을 실행합니다.
   * @param action - 실행할 함수
   * @param id - 버튼의 고유 ID
   */
  const executeActionWithErrorHandling = (action: () => void, id: ButtonID) => {
    try {
      action();
    } catch (e: unknown) {
      if (e instanceof Error) {
        showError(e.message); // 이미 번역된 에러 메시지
      } else {
        showError(t('error.unknown')); // 일반적인 에러 메시지
      }
      return;
    }
    displayButtonNotification(id);
  };

  /**
   * 현재 테마에 맞는 버튼 색상을 반환합니다.
   * @param color - 기본 색상
   * @returns 테마가 적용된 색상
   */
  const buttonColor = (color: string) => {
    return themesStore.isDarkMode() ? lighten(color ?? '', -20) : color;
  };

  // 버튼 스타일을 위한 computed 속성
  const importantButtonStyle = computed(() => {
    const background = buttonColor(themesStore.getButtonColor('important'));
    const textColor = themesStore.getTextColorByBackgroundColor(background);
    return { background, textColor };
  });

  const functionButtonStyle = computed(() => {
    const background = buttonColor(themesStore.getButtonColor('function'));
    const textColor = themesStore.getTextColorByBackgroundColor(background);
    return { background, textColor };
  });

  const normalButtonStyle = computed(() => {
    const background = buttonColor(themesStore.getButtonColor('normal'));
    const textColor = themesStore.getTextColorByBackgroundColor(background);
    return { background, textColor };
  });

  const shiftButtonPressedStyle = computed(() => {
    const background = lighten(importantButtonStyle.value.background, -30);
    const textColor = themesStore.getTextColorByBackgroundColor(background);
    return { background, textColor };
  });

  /**
   * 버튼의 최종 스타일(배경색, 텍스트 색상)을 결정합니다.
   * @param id - 버튼 ID
   * @param colorType - 버튼 색상 유형 ('important', 'function', 'normal')
   * @returns 최종 버튼 스타일 객체
   */
  const getFinalButtonStyle = (id: ButtonID, colorType: 'important' | 'function' | 'normal') => {
    if (id === shiftButtonId.value && calcStore.isShiftPressed) {
      return shiftButtonPressedStyle.value;
    }
    if (colorType === 'important') return importantButtonStyle.value;
    if (colorType === 'function') return functionButtonStyle.value;
    return normalButtonStyle.value;
  };

  const { standardButtons, modeSpecificButtons, standardExtendedFunctions, modeSpecificExtendedFunctions } =
    createCalcButtonSet(t);

  // 현재 진법의 기수를 반환하는 computed 속성
  const currentRadixBase = computed(() => {
    const radixKey = radixStore.sourceRadix as Radix;
    return (
      ({ [Radix.Binary]: 2, [Radix.Octal]: 8, [Radix.Decimal]: 10, [Radix.Hexadecimal]: 16 } as Record<Radix, number>)[
        radixKey
      ] ?? 10
    );
  });

  /**
   * 현재 진법에 따라 버튼을 비활성화할지 여부를 결정합니다.
   * @param label - 버튼의 레이블
   * @returns 비활성화 여부
   */
  const isButtonDisabledForCurrentBase = (label: string) => {
    if (props.type !== 'radix') return false;

    const value = label.match(/^[0-9A-F]+$/)?.[0];
    if (!value) return false;

    return Number(radixStore.convertRadix(value, Radix.Hexadecimal, Radix.Decimal)) >= currentRadixBase.value;
  };

  /**
   * 버튼 정의 객체를 변환합니다.
   * @param buttons - 변환할 버튼 정의
   * @returns 변환된 버튼 객체
   */
  const transformButtonDefinitions = (buttons: CalculatorButtonDefinition) => {
    return Object.fromEntries(
      Object.entries(buttons).map(([id, [label, color, keys, action, isDisabled]]) => [
        id,
        { label, color, shortcutKeys: keys, action, isDisabled: isDisabled || isButtonDisabledForCurrentBase(label) },
      ]),
    );
  };

  // 현재 활성화된 버튼 세트를 반환하는 computed 속성
  const activeButtonSet = computed(() => {
    const modeSpecificButtonsForType = modeSpecificButtons[props.type as keyof typeof modeSpecificButtons] ?? {};
    return {
      ...transformButtonDefinitions(standardButtons),
      ...transformButtonDefinitions(modeSpecificButtonsForType),
    };
  });

  /**
   * 확장 기능 버튼 정의를 변환합니다.
   * @param buttons - 변환할 확장 기능 버튼 정의
   * @returns 변환된 버튼 객체
   */
  const transformExtendedFunctions = (buttons: ExtendedButtonFunction) => {
    return Object.fromEntries(
      Object.entries(buttons).map(([id, [label, shortcutKeys, action, isDisabled]]) => [
        id,
        { label, shortcutKeys, action, isDisabled: isDisabled || isButtonDisabledForCurrentBase(label) },
      ]),
    );
  };

  // 현재 확장 기능 세트를 반환하는 computed 속성
  const extendedFunctionSet = computed(() => {
    const categoryButtons =
      modeSpecificExtendedFunctions[props.type as keyof typeof modeSpecificExtendedFunctions] ?? {};
    return {
      ...transformExtendedFunctions(standardExtendedFunctions),
      ...transformExtendedFunctions(categoryButtons),
    };
  });

  type ButtonID = keyof typeof standardExtendedFunctions;

  // 시프트 버튼의 ID를 찾는 computed 속성
  const shiftButtonId = computed(() =>
    Object.keys(extendedFunctionSet.value).find((key) => extendedFunctionSet.value[key]?.label === ''),
  );

  // 툴팁 타이머 상태
  const tooltipTimers: { [id: string]: boolean } = reactive(
    Object.fromEntries(Object.keys(activeButtonSet.value).map((id) => [id, false])),
  );

  /**
   * 버튼 액션에 대한 툴팁을 표시합니다.
   * @param id - 툴팁을 표시할 버튼의 ID
   */
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

  /**
   * 특정 버튼 클릭에 대한 알림을 표시합니다 (예: 메모리).
   * @param id - 알림을 발생시킨 버튼의 ID
   */
  const displayButtonNotification = (id: ButtonID) => {
    if (!calcStore.needButtonNotification) return;

    const buttonFunc = extendedFunctionSet.value[id];
    if (buttonFunc?.label === 'MC' && calc.memory.isEmpty) {
      showMessage(t('memoryCleared'));
    } else if (buttonFunc?.label === 'MR' && !calc.memory.isEmpty) {
      showMessage(t('memoryRecalled'));
    } else if (buttonFunc?.label === 'MS' && !calc.memory.isEmpty) {
      showMessage(t('memorySaved'));
    }
    calcStore.offNeedButtonNotification();
  };

  /**
   * 버튼 클릭 이벤트를 처리합니다.
   * @param id - 클릭된 버튼의 ID
   */
  const handleClickBtn = (id: ButtonID) => {
    const isDisabled = calcStore.isShiftPressed
      ? extendedFunctionSet.value[id]?.isDisabled ?? false
      : activeButtonSet.value[id]?.isDisabled ?? false;
    const action = calcStore.isShiftPressed ? extendedFunctionSet.value[id]?.action : activeButtonSet.value[id]?.action;

    if (isDisabled) {
      displayDisabledButtonNotification();
      return;
    }

    executeActionWithErrorHandling(action as () => void, id);

    if (id !== shiftButtonId.value && calcStore.isShiftPressed) {
      displayActionTooltip(id);
      if (!calcStore.isShiftLocked) calcStore.disableShift();
    }
  };

  /**
   * 버튼 길게 누르기 이벤트를 처리합니다.
   * @param id - 길게 누른 버튼의 ID
   */
  const handleLongPress = (id: ButtonID) => {
    hapticFeedbackMedium();
    const buttonFunctions = calcStore.isShiftPressed ? activeButtonSet.value : extendedFunctionSet.value;
    const buttonAction = buttonFunctions[id]?.action;
    const isDisabled = buttonFunctions[id]?.isDisabled ?? false;

    if (isDisabled) {
      displayDisabledButtonNotification();
      return;
    }

    executeActionWithErrorHandling(buttonAction as () => void, id);

    if (calcStore.isShiftPressed) {
      if (!calcStore.isShiftLocked) calcStore.disableShift();
    } else {
      displayActionTooltip(id);
    }
  };

  /**
   * 키 입력에 따라 버튼 클릭을 트리거합니다.
   * @param id - 트리거할 버튼의 ID
   * @param isShift - 시프트 키가 눌렸는지 여부
   */
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

  // 키 바인딩 설정
  const keyBindingsPrimary: KeyBindings = Object.entries(activeButtonSet.value).map(([id, button]) => [
    button.shortcutKeys,
    () => triggerButtonClickByKey(id, false),
  ]);

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

  const keyBindings = [...keyBindingsPrimary, ...keyBindingsSecondary];
  const { subscribe, unsubscribe } = useKeyBinding(keyBindings);

  // 컴포넌트 라이프사이클에 따른 키 바인딩 관리
  onMounted(() => subscribe());
  onBeforeUnmount(() => unsubscribe());

  // 입력 필드 포커스 상태에 따른 키 바인딩 활성화/비활성화
  watch(
    () => uiStore.inputFocused,
    (focused) => {
      if (focused) {
        unsubscribe();
      } else {
        subscribe();
      }
    },
    { immediate: true },
  );

  // 화면 크기 변화 감지를 위한 ref
  const screenWidth = ref(isWideWidth() ? window.innerWidth / 2 : window.innerWidth);
  const screenHeight = ref(window.innerHeight);

  /**
   * 창 크기 변경 이벤트를 처리합니다.
   */
  const handleResize = () => {
    screenWidth.value = isWideWidth() ? window.innerWidth / 2 : window.innerWidth;
    screenHeight.value = window.innerHeight;
    setTimeout(() => calculateDynamicBaseHeight(), 100);
  };

  // 컴포넌트 라이프사이클에 따른 이벤트 리스너 관리
  onMounted(() => {
    window.addEventListener('resize', handleResize);
    setTimeout(() => calculateDynamicBaseHeight(), 150);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
  });

  /**
   * 버튼 영역의 동적 높이를 계산하여 `baseHeight`를 설정합니다.
   * @description DOM 요소의 실제 높이를 측정하여 버튼 높이를 동적으로 조절합니다.
   */
  const calculateDynamicBaseHeight = () => {
    try {
      let totalHeightToExclude = 0;

      // 1. 시스템 UI 및 헤더 높이
      if ($g.isAndroid && $g.apiLevel >= 35) {
        totalHeightToExclude += 24;
        if (!$g.isGestureNavigation) {
          totalHeightToExclude += 48;
        }
      } else {
        totalHeightToExclude += 10;
      }

      // 2. 현재 탭의 컨테이너 카드 요소
      const currentCard = document.querySelector('.q-tab-panel--active q-card') as HTMLElement;

      if (currentCard) {
        // 3. 카드 패딩
        const cardStyles = window.getComputedStyle(currentCard);
        const paddingTop = parseInt(cardStyles.paddingTop) || 4;
        const paddingBottom = parseInt(cardStyles.paddingBottom) || 16;
        totalHeightToExclude += paddingTop + paddingBottom;

        // 4. 버튼 영역을 제외한 다른 자식 요소들의 높이
        const cardChildren = Array.from(currentCard.children) as HTMLElement[];
        for (const child of cardChildren) {
          if (!child.querySelector('.button') && !child.classList.contains('button')) {
            totalHeightToExclude += child.offsetHeight;
          }
        }
      } else {
        // 카드를 찾지 못한 경우의 폴백
        totalHeightToExclude += props.type === 'calc' ? 100 : 200;
        totalHeightToExclude += 20; // 패딩 추정값
      }

      // 5. 최소 높이 보장 및 최종 값 설정
      const calculatedHeight = Math.max(totalHeightToExclude, 120);
      baseHeight.value = `${calculatedHeight}px`;

      logDev(`🎯 baseHeight calculated for "${props.type}": ${baseHeight.value}`);
    } catch (error) {
      console.warn('⚠️ 동적 높이 계산 오류, 폴백 값 사용:', error);
      baseHeight.value =
        props.type === 'calc' ? '130px' : ['unit', 'currency', 'radix'].includes(props.type) ? '220px' : '130px';
    }
  };

  const baseHeight = ref('130px');

  // props.type 또는 현재 탭 변경 시 높이 재계산
  watch(() => props.type, () => setTimeout(() => calculateDynamicBaseHeight(), 100));
  watch(() => uiStore.currentTab, () => setTimeout(() => calculateDynamicBaseHeight(), 150));
  watch(() => [screenWidth.value, screenHeight.value], () => setTimeout(() => calculateDynamicBaseHeight(), 100));

  /**
   * 비활성화된 버튼 클릭 시 알림을 표시합니다.
   */
  const displayDisabledButtonNotification = () => {
    showMessage(t('disabledButton'));
  };

  /**
   * 버튼의 단축키에 대한 툴팁 문자열을 생성합니다.
   * @param btnId - 버튼 ID
   * @param isShift - 시프트 상태 여부
   * @returns 단축키 툴팁 문자열
   */
  const getTooltipsOfKeys = (btnId: ButtonID, isShift: boolean) => {
    const buttonFunctions = isShift ? extendedFunctionSet.value : activeButtonSet.value;
    const shortcutKeys = buttonFunctions[btnId]?.shortcutKeys ?? [];

    return shortcutKeys
      .map((key) => {
        if (key === '+') return '+';
        const parts = key.split('+');
        const modifiers = parts
          .slice(0, -1)
          .map((part) => ({ Shift: 'S', Control: 'C', Alt: 'A' }[part] || part))
          .join('');
        const lastPart = parts[parts.length - 1]?.replace('Digit', '').replace('Numpad', 'N') ?? '';
        return modifiers + (modifiers ? '-' : '') + lastPart;
      })
      .join(', ');
  };

  /**
   * 버튼의 ARIA 레이블을 생성합니다.
   * @param id - 버튼 ID
   * @param button - 버튼 객체
   * @returns ARIA 레이블 문자열
   */
  const getAriaLabel = (id: ButtonID, button: { label: string }) => {
    if (button.label.charAt(0) === '@') {
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

  // 폰트 크기 조정을 위한 스케일링 팩터
  const labelScalingFactor = computed(() => {
    if ($g.isCapacitor) {
      logDev('window.textZoom: ', $g.textZoom);
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
          calcStore.isShiftPressed &&
          !settingsStore.showButtonAddedLabel &&
          !(extendedFunctionSet[id]?.isDisabled ?? false)
            ? ''
            : (button.isDisabled ?? false) || calcStore.isShiftPressed
              ? 'disabled-button'
              : '',
        ]"
        :style="{
          background: getFinalButtonStyle(id, button.color as 'important' | 'function' | 'normal').background,
          color: getFinalButtonStyle(id, button.color as 'important' | 'function' | 'normal').textColor,
          paddingTop:
            !settingsStore.showButtonAddedLabel || !(extendedFunctionSet[id]?.label ?? '') ? '4px' : undefined,
        }"
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
          :style="`background: ${themesStore.getButtonColor(button.color as 'normal' | 'important' | 'function')}; border: 2px outset ${themesStore.getButtonColor(button.color as 'normal' | 'important' | 'function')}; border-radius: 10px;`"
          anchor="top middle"
          self="center middle"
          transition-show="jump-up"
          transition-hide="jump-down"
          transition-duration="200"
        >
          {{ extendedFunctionSet[id]?.label ?? '' }}
        </q-tooltip>
        <ToolTip
          :text-color="themesStore.getDarkColor()"
          :bg-color="themesStore.getCurrentThemeColors.ui.warning"
          :text="
            calcStore.isShiftPressed
              ? (extendedFunctionSet[id]?.isDisabled ?? false)
                ? t('disabledButton')
                : getTooltipsOfKeys(id, true)
              : (activeButtonSet[id]?.isDisabled ?? false)
                ? t('disabledButton')
                : getTooltipsOfKeys(id, false)
          "
        />
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
    color: inherit;
    opacity: 0.7;
    width: 100%; /* 가로 중앙 정렬을 위해 추가 */
  }

  .top-label-icon {
    top: 6%;
  }

  .top-label-char {
    top: -6%;
  }

  .disabled-button {
    opacity: 0.6;
  }

  .disabled-button-added-label {
    opacity: 0.5 !important;
  }

  .shifted-button-added-label {
    opacity: 0.85 !important;
  }
</style>

<i18n lang="yaml">
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
