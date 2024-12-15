<script setup lang="ts">
  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { ref, watch, onBeforeMount } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useMeta, useQuasar } from 'quasar';

  // 상태 관리를 위한 스토어 가져오기
  import { useStore } from 'src/stores/store';

  // 스토어 인스턴스 생성 및 필요한 메서드 추출
  const store = useStore();
  const { setDarkMode, setAlwaysOnTop } = store;

  // 다국어 지원을 위한 i18n 설정
  // useScope: 'global'로 설정하여 전역 범위에서 사용
  const { locale, t } = useI18n({ useScope: 'global' });

  // 앱 제목을 반응형 변수로 선언
  const title = ref(t('message.appTitle'));

  // HTML 메타 데이터 설정 (페이지 제목)
  useMeta(() => ({
    title: title.value,
  }));

  // Quasar 프레임워크 인스턴스 초기화
  const $q = useQuasar();

  // 사용자 설정에 따른 다크 모드 적용
  setDarkMode(store.darkMode);

  // 앱 제목 업데이트 함수
  // 현재 설정된 언어로 제목을 변경
  const updateTitle = () => {
    title.value = t('message.appTitle');
  };

  // 언어 설정 변경 감지 및 제목 자동 업데이트
  watch(
    () => store.locale,
    () => {
      updateTitle();
    },
  );

  // 컴포넌트 마운트 직전 초기화 작업 수행
  onBeforeMount(() => {
    // 저장된 언어 설정 적용
    locale.value = store.locale;

    // 운영체제별 결과창 패딩 최적화
    if ($q.platform.is.win) {
      store.resultPanelPadding = 8;
    } else if ($q.platform.is.linux) {
      store.resultPanelPadding = 3;
    } else {
      store.resultPanelPadding = 0;
    }

    // 현재 언어로 앱 제목 설정
    updateTitle();

    // 모든 다이얼로그 초기 상태를 닫힘으로 설정
    store.isHistoryDialogOpen = false;
    store.isSettingDialogOpen = false;

    // 설정에 따라 계산기 패널 초기화
    if (store.initPanel && store.calc) {
      store.calc.reset();
    }

    // 일렉트론 환경에서만 '항상 위에 표시' 설정 적용
    if ($q.platform.is.electron) {
      setAlwaysOnTop(store.alwaysOnTop);
    }

    // 시스템 다크모드 변경 감지
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', () => {
      if (store.darkMode === 'system') {
        store.updateDarkMode();
      }
    });

    // 초기 다크모드 상태 설정
    store.updateDarkMode();
  });
</script>

<template>
  <router-view v-slot="{ Component, route }">
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
