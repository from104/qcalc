<script setup lang="ts">
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

  withDefaults(defineProps<Props>(), {
    text: '',
    size: 'xs',
    textColor: 'green-10',
    bgColor: 'green-2',
    delay: 500,
    lineBreak: false,
  });
</script>

<template>
  <q-icon name="help_outline" :size="size" class="cursor-pointer">
    <ToolTip
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
