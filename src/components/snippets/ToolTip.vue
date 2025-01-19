<script setup lang="ts">
  interface Props {
    textColor?: string;
    bgColor?: string;
    delay?: number;
    lineBreak?: boolean;
    text?: string;
  }

  withDefaults(defineProps<Props>(), {
    textColor: 'green-10',
    bgColor: 'green-2',
    delay: 500,
    lineBreak: false,
    text: '',
  });
</script>

<template>
  <q-tooltip
    :class="[`text-${textColor}`, `bg-${bgColor}`, 'text-body2 text-center fa-border-all']"
    :style="{
      border: '1px solid black',
      wordBreak: lineBreak ? 'break-all' : 'normal',
      whiteSpace: lineBreak ? 'pre-wrap' : 'nowrap',
    }"
    anchor="top middle"
    self="bottom middle"
    :delay="delay"
  >
    <template v-if="text">{{ text }}</template>
    <slot v-else />
  </q-tooltip>
</template>
