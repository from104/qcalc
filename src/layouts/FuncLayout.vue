<script setup lang="ts">
  import { match } from 'ts-pattern';

  // Vue Composition API에서 필요한 함수들을 가져옵니다.
  import { onMounted, onUnmounted, computed } from 'vue';

  // 도움말과 정보 페이지 컴포넌트를 가져옵니다.
  import HistoryPage from 'src/pages/HistoryPage.vue';
  import SettingPage from 'src/pages/SettingPage.vue';

  // 다국어 지원을 위한 i18n 설정을 가져옵니다.
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // Vue Router의 기능을 사용하기 위해 필요한 함수들을 가져옵니다.
  import { useRouter, useRoute } from 'vue-router';
  const router = useRouter();
  const route = useRoute();

  // ESC 키를 눌렀을 때 이전 페이지로 돌아가는 함수입니다.
  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      router.back();
    }
  };

  // 현재 라우트에 따라 제목 메시지와 표시할 컴포넌트를 결정합니다.
  const pageTitleMessage = computed(() => {
    return match(route.name)
      .with('history', () => 'message.history')
      .with('settings', () => 'message.settings')
      .otherwise(() => '');
  });

  const CurrentPageComponent = computed(() => {
    return match(route.name)
      .with('history', () => HistoryPage)
      .with('settings', () => SettingPage)
      .otherwise(() => null);
  });

  // 컴포넌트가 마운트될 때 ESC 키 이벤트 리스너를 추가합니다.
  onMounted(() => {
    window.addEventListener('keydown', handleEscapeKey);
  });

  // 컴포넌트가 언마운트될 때 ESC 키 이벤트 리스너를 제거합니다.
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscapeKey);
  });

  // 헤더의 높이를 동적으로 계산하는 computed 속성입니다.
  const calculatedHeaderHeight = computed(() => {
    const headerElement = document.getElementById('header');
    return headerElement ? headerElement.clientHeight + 'px' : '0px';
  });
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header id="header" class="z-top noselect" elevated>
      <q-toolbar v-blur>
        <q-btn flat dense round icon="arrow_back" @click="router.back()" />
        <q-toolbar-title>{{ t(pageTitleMessage) }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container style="padding-bottom: 0px">
      <q-scroll-area id="area">
        <component :is="CurrentPageComponent" />
      </q-scroll-area>
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="scss">
  #area {
    height: calc(100vh - v-bind('calculatedHeaderHeight')) !important;
    // height: 100%;
  }
</style>
