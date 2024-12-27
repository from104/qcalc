<script setup lang="ts">
  import { computed } from 'vue';
  import { useQuasar } from 'quasar';
  import { useRoute, useRouter } from 'vue-router';
  import CalcLayout from './CalcLayout.vue';
  import SubLayout from './SubLayout.vue';

  const $q = useQuasar();
  const route = useRoute();
  const router = useRouter();

  const isWideScreen = computed(() => {
    return $q.screen.width >= 640;
  });

  // 서브 레이아웃이 표시되어야 하는지 여부
  const shouldShowSubLayout = computed(() => {
    return route.name !== undefined && route.name !== 'index';
  });
</script>

<template>
  <div class="main-layout">
    <!-- 와이드 스크린일 때 -->
    <template v-if="isWideScreen">
      <div class="row">
        <div class="col-6 calc-container">
          <CalcLayout />
        </div>
        <div class="col-6 sub-container">
          <SubLayout v-if="shouldShowSubLayout" />
        </div>
      </div>
    </template>

    <!-- 모바일 스크린일 때 -->
    <template v-else>
      <template v-if="shouldShowSubLayout">
        <SubLayout />
      </template>
      <template v-else>
        <CalcLayout />
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
  .main-layout {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  .calc-container {
    height: 100vh;
    transition: width 0.3s ease;
  }

  .sub-container {
    height: 100vh;
    border-left: 1px solid rgba(0, 0, 0, 0.12);
    transition: width 0.3s ease;

    :deep(.q-layout) {
      background: var(--q-primary);
    }
  }

  :deep(.q-layout) {
    height: 100vh;
  }

  // 다크모드 대응
  .body--dark {
    .sub-container {
      border-left-color: rgba(255, 255, 255, 0.12);
    }
  }
</style>
