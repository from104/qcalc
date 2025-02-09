<script setup lang="ts">
  import { ref } from 'vue';
  import ToolTip from 'components/snippets/ToolTip.vue';

  /**
   * 작은 도움말 아이콘과 툴팁을 표시하는 컴포넌트입니다.
   * 텍스트는 prop 또는 slot으로 전달할 수 있습니다.
   */
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
    /** 텍스트 줄바꿈 허용 여부 */
    lineBreak?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    text: '',
    size: 'xs',
    textColor: 'green-10',
    bgColor: 'green-2',
    delay: 500,
    lineBreak: false,
  });

  const window = globalThis.window;
  const showTooltip = ref(false);
  let tooltipTimer: ReturnType<typeof setTimeout> | null = null;

  const handleTooltipTrigger = () => {
    if (window.isMobile) {
      showTooltip.value = true;

      // 이전 타이머가 있다면 제거
      if (tooltipTimer) {
        clearTimeout(tooltipTimer);
      }

      // 새로운 타이머 설정
      tooltipTimer = setTimeout(() => {
        showTooltip.value = false;
      }, props.delay);
    }
  };
</script>

<template>
  <q-icon name="help_outline" :size="size" class="cursor-pointer" @click="handleTooltipTrigger">
    <ToolTip
      v-if="!window.isMobile || (window.isMobile && showTooltip)"
      :text="text ?? ''"
      :text-color="textColor ?? 'green-10'"
      :bg-color="bgColor ?? 'green-2'"
      :delay="delay ?? 500"
      :line-break="lineBreak ?? false"
    >
      <slot />
    </ToolTip>
  </q-icon>
</template>
