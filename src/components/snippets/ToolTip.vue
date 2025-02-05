<script setup lang="ts">
  import { ref } from 'vue';
  import { QTooltip } from 'quasar';

  interface Props {
    text?: string;
    textColor?: string;
    bgColor?: string;
    delay?: number;
    lineBreak?: boolean;
    autoHide?: number;
  }

  const {
    text = '',
    textColor = 'green-10',
    bgColor = 'green-2',
    delay = 500,
    lineBreak = false,
    autoHide = 0,
  } = defineProps<Props>();

  const tooltipRef = ref<QTooltip>();

  /**
   * 툴팁이 표시될 때 자동 숨김 타이머를 설정합니다.
   * autoHide 값이 0보다 크면 지정된 시간 후 툴팁을 자동으로 숨깁니다.
   */
  const handleAutoHideTooltip = () => {
    if (autoHide > 0) {
      setTimeout(() => {
        tooltipRef.value?.hide();
      }, autoHide);
    }
  };
</script>

<template>
  <q-tooltip
    ref="tooltipRef"
    :class="[`text-${textColor}`, `bg-${bgColor}`, 'text-body2 text-center fa-border-all']"
    :style="{
      border: '1px solid black',
      wordBreak: lineBreak ? 'break-all' : 'normal',
      whiteSpace: lineBreak ? 'pre-wrap' : 'nowrap',
    }"
    anchor="top middle"
    self="bottom middle"
    :delay="delay"
    @show="handleAutoHideTooltip"
  >
    <template v-if="text">{{ text }}</template>
    <slot v-else />
  </q-tooltip>
</template>
