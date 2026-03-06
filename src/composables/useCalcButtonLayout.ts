/**
 * @file useCalcButtonLayout.ts
 * @description CalcButton 컴포넌트의 레이아웃 계산 로직을 담당하는 컴포저블입니다.
 *              화면 크기, 버튼 높이, 라벨 스케일링 등의 계산을 처리합니다.
 */

import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { isWideWidth, logDev } from '../utils/GlobalHelpers';

const $g = window.globalVars;

export function useCalcButtonLayout(type: () => string, currentTab: () => string) {
  const screenWidth = ref(isWideWidth() ? window.innerWidth / 2 : window.innerWidth);
  const screenHeight = ref(window.innerHeight);

  const handleResize = () => {
    screenWidth.value = isWideWidth() ? window.innerWidth / 2 : window.innerWidth;
    screenHeight.value = window.innerHeight;
    requestAnimationFrame(() => calculateDynamicBaseHeight());
  };

  const getInitialBaseHeight = () => {
    return type() === 'calc' ? '130px' : '220px';
  };

  const baseHeight = ref(getInitialBaseHeight());

  const calculateDynamicBaseHeight = () => {
    try {
      let totalHeightToExclude = 0;

      if ($g.isAndroid && $g.apiLevel >= 35) {
        totalHeightToExclude += 24;
        if (!$g.isGestureNavigation) {
          totalHeightToExclude += 48;
        }
      } else {
        totalHeightToExclude += 10;
      }

      const currentCard = document.querySelector('.q-tab-panel--active q-card') as HTMLElement;

      if (currentCard) {
        const cardStyles = window.getComputedStyle(currentCard);
        const paddingTop = parseInt(cardStyles.paddingTop) || 4;
        const paddingBottom = parseInt(cardStyles.paddingBottom) || 16;
        totalHeightToExclude += paddingTop + paddingBottom;

        const cardChildren = Array.from(currentCard.children) as HTMLElement[];

        for (const child of cardChildren) {
          if (!child.querySelector('.button') && !child.classList.contains('button')) {
            const childHeight = child.offsetHeight;
            totalHeightToExclude += childHeight;

            if (process.env.DEV) {
              console.log(`Child element height: ${childHeight}px`, child.className || child.tagName);
            }
          }
        }
      } else {
        if (type() === 'calc') {
          totalHeightToExclude += 100;
        } else {
          totalHeightToExclude += 200;
        }
        totalHeightToExclude += 20;
      }

      const calculatedHeight = Math.max(totalHeightToExclude, 120);
      baseHeight.value = `${calculatedHeight}px`;
    } catch (error) {
      console.warn('Error calculating dynamic baseHeight, using fallback values:', error);
      baseHeight.value =
        type() === 'calc' ? '130px' : ['unit', 'currency', 'radix'].includes(type()) ? '220px' : '130px';
    }
  };

  const labelScalingFactor = computed(() => {
    if ($g.isCapacitor) {
      logDev('window.textZoom: ', $g.textZoom);
      return $g.textZoom / 100;
    }
    const screenWidthPx = screenWidth.value;
    const screenHeightPx = screenHeight.value;
    const BASE_WIDTH_PX = 352;
    const BASE_HEIGHT_PX = 604;

    const scaleFactorWidth = screenWidthPx / BASE_WIDTH_PX;
    const scaleFactorHeight = screenHeightPx / BASE_HEIGHT_PX;

    return Math.min(scaleFactorWidth, scaleFactorHeight);
  });

  const labelSizeAdjustmentRatio = computed(() => {
    return $g.isCapacitor ? 1 / labelScalingFactor.value : 1;
  });

  // props.type 변경 시 baseHeight 재계산
  watch(type, async () => {
    baseHeight.value = getInitialBaseHeight();
    await nextTick();
    requestAnimationFrame(() => calculateDynamicBaseHeight());
  });

  // 탭 변경 시 baseHeight 재계산
  watch(currentTab, async () => {
    await nextTick();
    requestAnimationFrame(() => calculateDynamicBaseHeight());
  });

  // 화면 크기 변경 감지
  watch(
    () => [screenWidth.value, screenHeight.value],
    async () => {
      await nextTick();
      calculateDynamicBaseHeight();
    },
  );

  onMounted(async () => {
    window.addEventListener('resize', handleResize);
    await nextTick();
    requestAnimationFrame(() => calculateDynamicBaseHeight());
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
  });

  return {
    screenWidth,
    screenHeight,
    baseHeight,
    labelScalingFactor,
    labelSizeAdjustmentRatio,
  };
}
