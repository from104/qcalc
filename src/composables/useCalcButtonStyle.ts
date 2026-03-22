/**
 * @file useCalcButtonStyle.ts
 * @description CalcButton 컴포넌트의 버튼 색상 및 스타일 관련 로직을 담당하는 컴포저블입니다.
 */

import { computed } from 'vue';
import { colors } from 'quasar';

import { useThemesStore } from '../stores/themesStore';
import { useCalcStore } from '../stores/calcStore';
import { useSettingsStore } from 'stores/settingsStore';

const { lighten } = colors;

export function useCalcButtonStyle() {
  const themesStore = useThemesStore();
  const calcStore = useCalcStore();
  const settingsStore = useSettingsStore();

  const buttonColor = (color: string) => {
    return themesStore.isDarkMode() ? lighten(color ?? '', -20) : color;
  };

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

  const getFinalButtonStyle = (
    id: string,
    colorType: 'important' | 'function' | 'normal',
    shiftButtonId: string | undefined,
  ) => {
    if (id === shiftButtonId && calcStore.isShiftPressed) {
      return shiftButtonPressedStyle.value;
    }
    if (colorType === 'important') return importantButtonStyle.value;
    if (colorType === 'function') return functionButtonStyle.value;
    return normalButtonStyle.value;
  };

  return {
    themesStore,
    calcStore,
    settingsStore,
    getFinalButtonStyle,
  };
}
