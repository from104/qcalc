<script setup lang="ts">
  import { ref, onBeforeMount, watch, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import type { RouteLocationNormalizedLoaded } from 'vue-router';

  // 컴포넌트 가져오기
  import AutoUpdate from 'components/AutoUpdate.vue';
  import SnapFirst from 'components/snippets/SnapFirst.vue';

    // 전역 window 객체에 접근하기 위한 상수 선언
  const window = globalThis.window;

  // 스토어 인스턴스 생성
  const store = window.store;

  const route = useRoute() as RouteLocationNormalizedLoaded & { meta: RouteTransitionMeta };
  const isFirstNavigation = ref(true);

  // 첫 번째 네비게이션 플래그 설정
  onBeforeMount(() => {
    setTimeout(() => {
      isFirstNavigation.value = false;
    }, 100);
  });

  // 트랜지션 상태 관리
  const previousPath = ref(route.path);
  const isWideLayout = ref(store.isAtLeastDoubleWidth());
  const currentTransition = ref('');

  // 레이아웃과 라우트 변경 감시
  watch(
    () => store.isAtLeastDoubleWidth(),
    (newValue) => {
      if (isWideLayout.value !== newValue) {
        currentTransition.value = newValue ? 'expand-layout' : 'collapse-layout';
        isWideLayout.value = newValue;
      }
    },
  );

  watch(
    () => route.path,
    (newPath) => {
      if (!isWideLayout.value && previousPath.value !== newPath) {
        const { navigationMethod } = route.meta as RouteTransitionMeta;
        currentTransition.value =
          navigationMethod === 'back' ? 'slide-back' : navigationMethod === 'forward' ? 'slide-forward' : 'fade';
        previousPath.value = newPath;
      } else {
        currentTransition.value = '';
      }
    },
  );

  const computeTransition = computed(() => currentTransition.value);
</script>

<template>
  <router-view v-slot="{ Component, route: routeProps }">
    <transition :name="isFirstNavigation ? '' : computeTransition || ''" mode="default">
      <component :is="Component" :key="routeProps.path" />
    </transition>
  </router-view>
  <AutoUpdate />
  <SnapFirst />
</template>

<style scoped lang="scss">
  // Common transition properties
  %transition-base {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  // Slide transitions
  .slide-back-enter-active,
  .slide-back-leave-active,
  .slide-forward-enter-active,
  .slide-forward-leave-active {
    @extend %transition-base;
    transition: transform 0.2s ease;
  }

  // Slide back animation
  .slide-back-enter-from {
    transform: translateX(-100%);
  }
  .slide-back-enter-to,
  .slide-back-leave-from {
    transform: translateX(0);
  }
  .slide-back-leave-to {
    transform: translateX(100%);
  }

  // Slide forward animation
  .slide-forward-enter-from {
    transform: translateX(100%);
  }
  .slide-forward-enter-to,
  .slide-forward-leave-from {
    transform: translateX(0);
  }
  .slide-forward-leave-to {
    transform: translateX(-100%);
  }

  // Fade transition
  .fade-enter-active,
  .fade-leave-active {
    @extend %transition-base;
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  .fade-enter-to,
  .fade-leave-from {
    opacity: 1;
  }

  // Layout expansion animation
  .expand-layout-enter-active,
  .expand-layout-leave-active {
    @extend %transition-base;
    transition: transform 0.2s ease;
  }

  .expand-layout-enter-from {
    transform: scaleX(2);
    transform-origin: left;
  }
  .expand-layout-enter-to,
  .expand-layout-leave-from {
    transform: scaleX(1);
    transform-origin: left;
  }
  .expand-layout-leave-to {
    transform: scaleX(0.5);
    transform-origin: left;
  }

  // Layout collapse animation
  .collapse-layout-enter-active,
  .collapse-layout-leave-active {
    @extend %transition-base;
    transition: transform 0.2s ease;
  }

  .collapse-layout-enter-from {
    transform: scaleX(0.5);
    transform-origin: left;
  }
  .collapse-layout-enter-to,
  .collapse-layout-leave-from {
    transform: scaleX(1);
    transform-origin: left;
  }
  .collapse-layout-leave-to {
    transform: translateX(100%);
  }
</style>
