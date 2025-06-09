<script setup lang="ts">
  /**
   * @file ToolTip.vue
   * @description 이 파일은 툴팁을 표시하는 Vue 컴포넌트입니다.
   *              사용자가 지정한 텍스트, 색상, 지연 시간 등의 설정에 따라
   *              툴팁을 표시하고 숨기는 기능을 제공합니다. 자동 숨김 기능을 통해
   *              지정된 시간 후 툴팁이 자동으로 사라지도록 설정할 수 있습니다.
   *              HEX 색상 코드(#000000)와 Quasar 색상 클래스 모두를 지원합니다.
   */

  import { ref, computed } from 'vue';
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
   * HEX 색상 코드인지 확인하는 함수
   * @param color - 확인할 색상 문자열
   * @returns HEX 색상 코드 여부
   */
  const isHexColor = (color: string): boolean => {
    return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);
  };

  /**
   * 텍스트 색상을 처리하는 computed 속성
   * HEX 코드인 경우 인라인 스타일로, 아닌 경우 Quasar 클래스로 처리
   */
  const textColorStyle = computed(() => {
    if (isHexColor(textColor)) {
      return { color: textColor };
    }
    return {};
  });

  /**
   * 배경 색상을 처리하는 computed 속성
   * HEX 코드인 경우 인라인 스타일로, 아닌 경우 Quasar 클래스로 처리
   */
  const bgColorStyle = computed(() => {
    if (isHexColor(bgColor)) {
      return { backgroundColor: bgColor };
    }
    return {};
  });

  /**
   * 텍스트 색상 클래스를 처리하는 computed 속성
   * HEX 코드가 아닌 경우에만 Quasar 클래스 적용
   */
  const textColorClass = computed(() => {
    return isHexColor(textColor) ? '' : `text-${textColor}`;
  });

  /**
   * 배경 색상 클래스를 처리하는 computed 속성
   * HEX 코드가 아닌 경우에만 Quasar 클래스 적용
   */
  const bgColorClass = computed(() => {
    return isHexColor(bgColor) ? '' : `bg-${bgColor}`;
  });

  /**
   * 최종 스타일 객체를 생성하는 computed 속성
   */
  const finalStyle = computed(() => {
    return {
      border: '1px solid black',
      wordBreak: lineBreak ? 'break-all' : 'normal',
      whiteSpace: lineBreak ? 'pre-wrap' : 'nowrap',
      ...textColorStyle.value,
      ...bgColorStyle.value,
    };
  });

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
    :class="[textColorClass, bgColorClass, 'text-body2 text-center fa-border-all'].filter(Boolean)"
    :style="finalStyle"
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
