<script setup lang="ts">
  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { ref, watch, computed, onBeforeMount } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  // useScope: 'global'로 설정하여 전역 범위에서 사용
  const { locale } = useI18n({ useScope: 'global' });
  const { t } = useI18n();

  // 라우터 관련 설정
  import { useRouter, useRoute } from 'vue-router';
  import type { RouteLocationNormalizedLoaded } from 'vue-router';

  // router 인스턴스 가져오기
  const router = useRouter();
  const route = useRoute() as RouteLocationNormalizedLoaded & { meta: RouteTransitionMeta };

  // 계산기 관련 타입과 클래스
  import { KeyBinding } from 'classes/KeyBinding';

  // 스토어 관련
  import { useStore } from 'src/stores/store';
  // 스토어 인스턴스 생성 및 필요한 메서드 추출
  const store = useStore();
  const { setDarkMode, setAlwaysOnTop } = store;

  // 앱 제목을 반응형 변수로 선언
  const title = ref(t('message.appTitle'));

  // HTML 메타 데이터 및 Quasar 프레임워크 설정
  import { useMeta, useQuasar } from 'quasar';
  // Quasar 프레임워크 인스턴스 초기화
  const $q = useQuasar();
  // HTML 메타 데이터 설정 (페이지 제목)
  useMeta(() => ({
    title: title.value,
  }));

  // 자동 업데이트 컴포넌트 가져오기
  import AutoUpdate from 'components/AutoUpdate.vue';

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
    { immediate: true },
  );

  const isFirstNavigation = ref(true);

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

    // 다크모드 상태 설정
    store.updateDarkMode();

    // 첫 번째 네비게이션 후에 플래그를 false로 설정
    setTimeout(() => {
      isFirstNavigation.value = false;
    }, 100);
  });

  // '항상 위에' 설정을 토글하고 알림을 표시하는 함수입니다.
  const toggleAlwaysOnTopWithNotification = () => {
    if ($q.platform.is.electron) {
      store.toggleAlwaysOnTop();

      if (store.alwaysOnTop) {
        store.showMessage(t('alwaysOnTopOn'));
      } else {
        store.showMessage(t('alwaysOnTopOff'));
      }
    }
  };

  // 다크모드 토글 함수
  const toggleDarkModeWithNotification = () => {
    store.toggleDarkMode();

    if (store.darkMode == 'system') {
      store.showMessage(t('darkMode.message.system'));
    } else {
      store.showMessage(t('darkMode.message.' + store.darkMode));
    }
  };

  // 키 바인딩을 설정합니다.
  const keyBinding = new KeyBinding([
    [['Alt+t'], toggleAlwaysOnTopWithNotification],
    [['Alt+i'], store.toggleInitPanel],
    [['Alt+d'], toggleDarkModeWithNotification],
    [['Alt+p'], store.toggleHapticsMode],
    [['F1'], () => store.navigateToPath('/help', route, router)],
    [['F2'], () => store.navigateToPath('/about', route, router)],
    [['F3'], () => store.navigateToPath('/settings', route, router)],
    [['F4'], () => store.navigateToPath('/record', route, router)],
    [[';'], store.toggleButtonAddedLabel],
    [[','], store.toggleUseGrouping],
    [['Alt+,'], () => store.setGroupingUnit(store.groupingUnit === 3 ? 4 : 3)],
    [['['], store.decrementDecimalPlaces],
    [[']'], store.incrementDecimalPlaces],
  ]);

  // 입력 포커스 상태에 따라 키 바인딩을 활성화/비활성화합니다.
  watch(
    () => store.inputFocused,
    () => {
      if (store.inputFocused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
    { immediate: true },
  );

  // Track navigation state
  const previousPath = ref(route.path);
  const isWideLayout = ref(store.isAtLeastDoubleWidth());
  const currentTransition = ref('');

  // Watch for layout and route changes
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

  // Pure computed for transition name
  const computeTransition = computed(() => currentTransition.value);
</script>

<template>
  <router-view v-slot="{ Component, route: routeProps }">
    <transition :name="isFirstNavigation ? '' : computeTransition || ''" mode="default">
      <component :is="Component" :key="routeProps.path" />
    </transition>
  </router-view>
  <AutoUpdate />
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
