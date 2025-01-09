<script setup lang="ts">
  import { computed } from 'vue';

  import NarrowLayout from './NarrowLayout.vue';
  import WideLayout from './WideLayout.vue';

  import useStore from 'stores/store';
  const store = useStore();

  // 1024px를 기준으로 레이아웃 선택
  const currentLayout = computed(() => {
    return store.isAtLeastDoubleWidth() ? WideLayout : NarrowLayout;
  });
</script>

<template>
  <component :is="currentLayout" />
</template>
