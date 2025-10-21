/**
 * @file useDialogStyle.ts
 * @description 다이얼로그 컴포넌트의 공통 스타일과 로직을 관리하는 composable입니다.
 */

import { computed } from 'vue';
import { useThemesStore } from 'stores/themesStore';

/**
 * 다이얼로그 스타일과 색상을 관리하는 composable
 * @returns 다이얼로그 관련 유틸리티 함수와 계산된 값
 */
export function useDialogStyle() {
  const themesStore = useThemesStore();

  /**
   * 다크 모드 여부를 반환합니다.
   */
  const isDarkMode = computed(() => themesStore.isDarkMode());

  /**
   * 버튼의 텍스트 색상을 반환합니다.
   * @param isElevated - unelevated 버튼 여부 (기본값: false)
   * @returns 다크모드에 따른 버튼 텍스트 색상
   */
  const getButtonTextColor = (isElevated = false): string => {
    if (isElevated) {
      return isDarkMode.value ? 'blue-grey-2' : 'white';
    }
    return isDarkMode.value ? 'blue-grey-2' : 'primary';
  };

  /**
   * 다이얼로그 헤더의 그라데이션 배경 스타일을 반환합니다.
   */
  const headerGradient = 'linear-gradient(135deg, var(--q-primary) 0%, rgba(var(--q-primary-rgb), 0.8) 100%)';

  return {
    isDarkMode,
    getButtonTextColor,
    headerGradient,
    themesStore,
  };
}
