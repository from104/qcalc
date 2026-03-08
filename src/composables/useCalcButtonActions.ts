/**
 * @file useCalcButtonActions.ts
 * @description CalcButton 컴포넌트의 버튼 클릭, 롱프레스, 햅틱 피드백 등
 *              액션/핸들러 로직을 담당하는 컴포저블입니다.
 */

import { reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { match } from 'ts-pattern';

import { createCalcButtonSet } from '../constants/CalcButtonSet';
import { showError, showMessage } from '../utils/NotificationUtils';
import { clickButtonById } from '../utils/GlobalHelpers';
import { Radix } from '../utils/RadixConverter';

import { useSettingsStore } from 'stores/settingsStore';
import { useCalcStore } from '../stores/calcStore';
import { useUIStore } from 'stores/uiStore';
import { useRadixStore } from 'stores/radixStore';
import { useKeyBinding } from './useKeyBinding';
import type { KeyBindings } from './useKeyBinding';

import { Haptics, ImpactStyle } from '@capacitor/haptics';
import type { ComposerTranslation } from 'vue-i18n';

const $g = window.globalVars;

export function useCalcButtonActions(type: () => string, t: ComposerTranslation) {
  const settingsStore = useSettingsStore();
  const calcStore = useCalcStore();
  const uiStore = useUIStore();
  const radixStore = useRadixStore();

  const { calc } = calcStore;

  // 햅틱 피드백
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

  // 버튼 세트
  const { standardButtons, modeSpecificButtons, standardExtendedFunctions, modeSpecificExtendedFunctions } =
    createCalcButtonSet(t);

  // 진법 기반 비활성화 계산
  const currentRadixBase = computed(() => {
    const radixKey = radixStore.sourceRadix as Radix;
    return (
      ({ [Radix.Binary]: 2, [Radix.Octal]: 8, [Radix.Decimal]: 10, [Radix.Hexadecimal]: 16 } as Record<Radix, number>)[
        radixKey
      ] ?? 10
    );
  });

  const isButtonDisabledForCurrentBase = (label: string) => {
    if (type() !== 'radix') return false;
    const value = label.match(/^[0-9A-F]+$/)?.[0];
    if (!value) return false;
    return Number(radixStore.convertRadix(value, Radix.Hexadecimal, Radix.Decimal)) >= currentRadixBase.value;
  };

  const resolveDisabled = (val: boolean | (() => boolean) | undefined): boolean =>
    typeof val === 'function' ? val() : (val ?? false);

  // 버튼 정의 변환
  const transformButtonDefinitions = (buttons: CalculatorButtonDefinition) => {
    return Object.fromEntries(
      Object.entries(buttons).map(([id, [label, color, keys, action, isDisabled]]) => [
        id,
        {
          label,
          color,
          shortcutKeys: keys,
          action,
          isDisabled:
            typeof isDisabled === 'function'
              ? () => (isDisabled as () => boolean)() || isButtonDisabledForCurrentBase(label)
              : isDisabled || isButtonDisabledForCurrentBase(label),
        },
      ]),
    );
  };

  const activeButtonSet = computed(() => {
    // formula 모드: row-0 버튼이 최상단에 오도록 standardButtons 병합 없이 단독 사용
    if (type() === 'formula') {
      return transformButtonDefinitions(modeSpecificButtons['formula'] ?? {});
    }
    const modeSpecificButtonsForType = modeSpecificButtons[type() as keyof typeof modeSpecificButtons] ?? {};
    return {
      ...transformButtonDefinitions(standardButtons),
      ...transformButtonDefinitions(modeSpecificButtonsForType),
    };
  });

  const transformExtendedFunctions = (buttons: ExtendedButtonFunction) => {
    return Object.fromEntries(
      Object.entries(buttons).map(([id, [label, shortcutKeys, action, isDisabled]]) => [
        id,
        {
          label,
          shortcutKeys,
          action,
          isDisabled:
            typeof isDisabled === 'function'
              ? () => (isDisabled as () => boolean)() || isButtonDisabledForCurrentBase(label)
              : isDisabled || isButtonDisabledForCurrentBase(label),
        },
      ]),
    );
  };

  const extendedFunctionSet = computed(() => {
    const categoryButtons = modeSpecificExtendedFunctions[type() as keyof typeof modeSpecificExtendedFunctions] ?? {};
    return { ...transformExtendedFunctions(standardExtendedFunctions), ...transformExtendedFunctions(categoryButtons) };
  });

  type ButtonID = keyof typeof standardExtendedFunctions;

  const shiftButtonId = computed(() =>
    Object.keys(extendedFunctionSet.value).find((key) => extendedFunctionSet.value[key]?.label === ''),
  );

  // 툴팁 타이머
  const tooltipTimers: { [id: string]: boolean } = reactive(
    Object.fromEntries(Object.keys(activeButtonSet.value).map((id) => [id, false])),
  );

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

  const displayDisabledButtonNotification = () => {
    showMessage(t('disabledButton'));
  };

  // 에러 처리 함수
  const executeActionWithErrorHandling = (action: () => void, id: ButtonID) => {
    try {
      action();
    } catch (e: unknown) {
      if (e instanceof Error) {
        showError(e.message);
      } else {
        showError(t('error.unknown'));
      }
      return;
    }
    displayButtonNotification(id);
  };

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

  // 버튼 클릭 핸들러
  const handleClickBtn = (id: ButtonID) => {
    const isDisabled = calcStore.isShiftPressed
      ? resolveDisabled(extendedFunctionSet.value[id]?.isDisabled)
      : resolveDisabled(activeButtonSet.value[id]?.isDisabled);
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

  // 롱프레스 핸들러
  const handleLongPress = (id: ButtonID) => {
    hapticFeedbackMedium();
    const buttonFunctions = calcStore.isShiftPressed ? activeButtonSet.value : extendedFunctionSet.value;
    const buttonAction = buttonFunctions[id]?.action;
    const isDisabled = resolveDisabled(buttonFunctions[id]?.isDisabled);

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

  // 키 바인딩
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

  onMounted(() => {
    subscribe();
  });

  onBeforeUnmount(() => {
    unsubscribe();
  });

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

  // aria-label 설정
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

  return {
    activeButtonSet,
    extendedFunctionSet,
    shiftButtonId,
    tooltipTimers,
    hapticFeedbackLight,
    handleClickBtn,
    handleLongPress,
    displayDisabledButtonNotification,
    getAriaLabel,
    getTooltipsOfKeys,
    resolveDisabled,
  };
}
