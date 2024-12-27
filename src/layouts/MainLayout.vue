<script setup lang="ts">
  import { computed } from 'vue';
  import { useQuasar } from 'quasar';
  import NarrowLayout from './NarrowLayout.vue';
  import WideLayout from './WideLayout.vue';

  const $q = useQuasar();

  // 1024px를 기준으로 레이아웃 선택
  const currentLayout = computed(() => {
    return $q.screen.gt.xs ? WideLayout : NarrowLayout;
  });
</script>

<template>
  <component :is="currentLayout" />
</template>
