<script setup lang="ts">
  /**
   * @file ToolTip.vue
   * @description 이 파일은 툴팁을 표시하는 Vue 컴포넌트입니다.
   *              사용자가 지정한 텍스트, 색상, 지연 시간 등의 설정에 따라
   *              툴팁을 표시하고 숨기는 기능을 제공합니다. 자동 숨김 기능을 통해
   *              지정된 시간 후 툴팁이 자동으로 사라지도록 설정할 수 있습니다.
   */

  import { ref } from 'vue';
  import { QTooltip } from 'quasar';

  interface Props {
    modelValue?: boolean | null;
    text?: string;
    textColor?: string;
    bgColor?: string;
    delay?: number;
    lineBreak?: boolean;
    autoHide?: number;
  }

  const {
    modelValue = null,
    text = '',
    textColor = 'green-10',
    bgColor = 'green-2',
    delay = 500,
    lineBreak = false,
    autoHide = 0,
  } = defineProps<Props>();

  const tooltipRef = ref<QTooltip>();

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
  }>();

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
    :model-value="modelValue"
    :class="[`text-${textColor}`, `bg-${bgColor}`, 'text-body2 text-center fa-border-all']"
    :style="{
      border: '1px solid black',
      wordBreak: lineBreak ? 'break-all' : 'normal',
      whiteSpace: lineBreak ? 'pre-wrap' : 'nowrap',
    }"
    anchor="top middle"
    self="bottom middle"
    :delay="delay"
    @update:model-value="(val) => emit('update:modelValue', val)"
    @show="handleAutoHideTooltip"
  >
    <template v-if="text">{{ text }}</template>
    <slot v-else />
  </q-tooltip>
</template>
