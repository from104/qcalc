<script setup lang="ts">
  /**
   * @file HelpIcon.vue
   * @description 이 파일은 작은 도움말 아이콘과 툴팁을 표시하는 Vue 컴포넌트입니다.
   *              사용자는 prop 또는 slot을 통해 텍스트를 전달할 수 있으며,
   *              모바일 환경에서는 아이콘 클릭 시 툴팁이 표시됩니다.
   *              툴팁의 표시 시간은 설정할 수 있습니다.
   *
   * @props {string} text - 툴팁에 표시할 텍스트
   * @props {string} size - 아이콘 크기 (xs, sm, md, lg, xl)
   * @props {string} textColor - 툴팁 텍스트 색상
   * @props {string} bgColor - 툴팁 배경 색상
   * @props {number} delay - 툴팁 표시 지연 시간 (ms)
   * @props {number} hideDelay - 툴팁 표시 여부
   * @props {boolean} lineBreak - 텍스트 줄바꿈 허용 여부
   */

  import { ref } from 'vue';
  import ToolTip from 'components/snippets/ToolTip.vue';

  // === 전역 변수 설정 ===
  /**
   * 전역 변수와 상태 저장소를 설정합니다.
   */
  const $g = window.globalVars;

  interface Props {
    /** 툴팁에 표시할 텍스트 */
    text?: string;
    /** 아이콘 크기 (xs, sm, md, lg, xl) */
    size?: string;
    /** 툴팁 텍스트 색상 */
    textColor?: string;
    /** 툴팁 배경 색상 */
    bgColor?: string;
    /** 툴팁 표시 지연 시간 (ms) */
    delay?: number;
    /** 툴팁 표시 여부 */
    hideDelay?: number;
    /** 텍스트 줄바꿈 허용 여부 */
    lineBreak?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    text: '',
    size: 'xs',
    textColor: 'green-10',
    bgColor: 'green-2',
    delay: 500,
    hideDelay: 5000,
    lineBreak: true,
  });

  const showTooltip = ref(false);
  let tooltipTimer: ReturnType<typeof setTimeout> | null = null;

  const handleTooltipTrigger = () => {
    if ($g.isMobile) {
      showTooltip.value = true;

      // 이전 타이머가 있다면 제거
      if (tooltipTimer) {
        clearTimeout(tooltipTimer);
      }

      // 새로운 타이머 설정
      tooltipTimer = setTimeout(() => {
        showTooltip.value = false;
      }, props.hideDelay);
    }
  };
</script>

<template>
  <q-icon name="help_outline" :size="size" class="cursor-pointer" @click="handleTooltipTrigger">
    <ToolTip
      v-if="!$g.isMobile || ($g.isMobile && showTooltip)"
      :model-value="$g.isMobile ? showTooltip : null"
      :text="text ?? ''"
      :text-color="textColor ?? 'green-10'"
      :bg-color="bgColor ?? 'green-2'"
      :delay="$g.isMobile ? 0 : (delay ?? 500)"
      :line-break="lineBreak ?? true"
    >
      <slot />
    </ToolTip>
  </q-icon>
</template>
