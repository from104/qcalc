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
  <transition name="layout-transition" mode="out-in">
    <component :is="currentLayout" />
  </transition>
</template>

<style scoped>
  .layout-transition-enter-active,
  .layout-transition-leave-active {
    transition: all 0.3s ease;
  }

  .layout-transition-enter-from,
  .layout-transition-leave-to {
    opacity: 0;
    transform: scale(0.95);
  }

  .layout-transition-enter-to,
  .layout-transition-leave-from {
    opacity: 1;
    transform: scale(1);
  }
</style>
