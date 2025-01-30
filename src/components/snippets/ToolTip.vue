<script setup lang="ts">
  interface Props {
    textColor?: string;
    bgColor?: string;
    delay?: number;
    hideDelay?: number;
    lineBreak?: boolean;
    text?: string;
    autoHide?: number;
  }

  const { autoHide } = withDefaults(defineProps<Props>(), {
    textColor: 'green-10',
    bgColor: 'green-2',
    delay: 500,
    hideDelay: 0,
    lineBreak: false,
    text: '',
    autoHide: 0,
  });
  import { ref } from 'vue';
  import { QTooltip } from 'quasar';

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
    :hide-delay="hideDelay"
    @show="handleAutoHideTooltip"
  >
    <template v-if="text">{{ text }}</template>
    <slot v-else />
  </q-tooltip>
</template>
