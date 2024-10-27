<script setup lang="ts">
  // Vue 및 관련 기능 가져오기
  import { ref, watch, onBeforeMount } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useMeta, useQuasar } from 'quasar';

  // 스토어 가져오기
  import { useStoreBase } from 'src/stores/store-base';
  import { useStoreSettings } from 'src/stores/store-settings';

  // 스토어 초기화
  const storeBase = useStoreBase();
  const storeSettings = useStoreSettings();
  const { setDarkMode, setAlwaysOnTop } = storeSettings;

  // i18n 설정
  const { locale, t } = useI18n({ useScope: 'global' });

  // 앱 제목 설정
  const title = ref(t('message.appTitle'));

  // 메타 데이터 설정
  useMeta(() => ({
    title: title.value,
  }));

  // Quasar 인스턴스 가져오기
  const $q = useQuasar();

  // 다크 모드 설정
  setDarkMode(storeSettings.darkMode);

  // 제목 업데이트 함수
  const updateTitle = () => {
    title.value = t('message.appTitle');
  };

  // 로케일 변경 감지 및 제목 업데이트
  watch(
    () => storeSettings.locale,
    () => {
      updateTitle();
    },
  );

  // 컴포넌트 마운트 전 실행되는 훅
  onBeforeMount(() => {
    // 로케일 설정
    locale.value = storeSettings.locale;

    // 플랫폼별 결과 패딩 설정
    if ($q.platform.is.win) {
      storeBase.paddingOnResult = 8;
    } else if ($q.platform.is.linux) {
      storeBase.paddingOnResult = 3;
    } else {
      storeBase.paddingOnResult = 0;
    }

    // 제목 업데이트
    updateTitle();

    // 다이얼로그 상태 초기화
    storeBase.isHistoryDialogOpen = false;
    storeBase.isSettingDialogOpen = false;

    // 초기 패널 설정
    if (storeSettings.initPanel && storeBase.calc) {
      storeBase.calc.clear();
    }

    // 일렉트론 환경에서 항상 위에 표시 설정
    if ($q.platform.is.electron) {
      setAlwaysOnTop(storeSettings.alwaysOnTop);
    }
  });
</script>

<template>
  <router-view v-slot="{Component, route}">
    <transition :name="(route.meta?.transition as string) || ''" mode="default">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: transform 0.3s ease;
  }
  .slide-right-enter,
  .slide-right-leave-to {
    transform: translateX(100%);
  }
  .slide-right-enter-to,
  .slide-right-leave {
    transform: translateX(0);
  }

  .slide-left-enter-active,
  .slide-left-leave-active {
    transition: transform 0.3s ease;
  }
  .slide-left-enter,
  .slide-left-leave-to {
    transform: translateX(-100%);
  }
  .slide-left-enter-to,
  .slide-left-leave {
    transform: translateX(0);
  }
</style>
