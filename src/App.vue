<script setup lang="ts">
  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { ref, watch, onBeforeMount, onMounted, onBeforeUnmount } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useMeta, useQuasar } from 'quasar';
  import { RouteLocationNormalizedLoaded } from 'vue-router';

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

  // 스토어에서 필요한 함수들을 구조 분해 할당으로 가져옵니다.
  const { showMessage, toggleAlwaysOnTop } = store;

  // '항상 위에' 설정을 토글하고 알림을 표시하는 함수입니다.
  const toggleAlwaysOnTopWithNotification = () => {
    if ($q.platform.is.electron) {
      toggleAlwaysOnTop();

      if (store.alwaysOnTop) {
        showMessage(t('alwaysOnTopOn'));
      } else {
        showMessage(t('alwaysOnTopOff'));
      }
    }
  };

  // 다크모드 토글 함수
  const toggleDarkModeWithNotification = () => {
    store.toggleDarkMode();

    if (store.darkMode == 'system') {
      showMessage(t('darkMode.message.system'));
    } else {
      showMessage(t('darkMode.message.' + store.darkMode));
    }
  };
  import { useRouter } from 'vue-router';

  // router 인스턴스 가져오기
  const router = useRouter();

  // 키 바인딩 클래스를 가져옵니다.
  import { KeyBinding } from 'classes/KeyBinding';

  // 키 바인딩을 설정합니다.
  const keyBinding = new KeyBinding([
    [['Alt+t'], toggleAlwaysOnTopWithNotification],
    [['Alt+i'], store.toggleInitPanel],
    [['Alt+d'], toggleDarkModeWithNotification],
    [['Alt+p'], store.toggleHapticsMode],
    [['F1'], () => router.push('/help')],
    [['F2'], () => router.push('/about')],
    [['F3'], () => router.push('/settings')],
    [['F4'], () => router.push('/record')],
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

  // 컴포넌트가 마운트된 후 실행되는 훅입니다.
  onMounted(() => {
    keyBinding.subscribe();
  });

  // 컴포넌트가 언마운트되기 전에 실행되는 훅입니다.
  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
  });

  // 로케일을 설정하는 함수입니다.
  const setLanguage = () => {
    if (store.useSystemLocale) {
      locale.value = systemLocale.value;
    } else {
      locale.value = store.userLocale;
    }
  };

  // 시스템 로케일을 참조로 저장합니다.
  const systemLocale = ref(navigator.language.substring(0, 2));

  // 컴포넌트가 마운트되기 전에 실행되는 훅입니다.
  onBeforeMount(() => {
    setLanguage();

    // 초기 실행 시 로케일 설정
    if (store.locale === '') {
      store.locale = systemLocale.value;
    }
    if (store.userLocale === '') {
      store.userLocale = systemLocale.value;
    }
  });
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';

  interface RouteMeta {
    getTransition?: (navigationMethod: string) => string;
    navigationMethod?: string;
  }

  const route = useRoute() as RouteLocationNormalizedLoaded & { meta: RouteMeta };

  const getTransition = computed(() => {
    const navigationMethod = route.meta.navigationMethod as string;

    if (store.isAtLeastDoubleWidth()) {
      return 'fade-in';
    } else {
      return navigationMethod === 'back' ? 'move-back' : 'move-forward';
    }
  });
</script>

<template>
  <router-view v-slot="{ Component, route: routeProps }">
    <transition :name="isFirstNavigation ? '' : getTransition || 'fade-in'" mode="default">
      <component :is="Component" :key="routeProps.path" />
    </transition>
  </router-view>
</template>

<style scoped lang="scss">
  .move-back-enter-active,
  .move-back-leave-active,
  .move-forward-enter-active,
  .move-forward-leave-active {
    transition: transform 0.5s ease;
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden; /* 스크롤바 숨기기 */
  }

  .move-back-enter-from {
    transform: translateX(-100%);
  }

  .move-back-enter-to,
  .move-back-leave-from {
    transform: translateX(0);
  }

  .move-back-leave-to {
    transform: translateX(100%);
  }

  .move-forward-enter-from {
    transform: translateX(100%);
  }

  .move-forward-enter-to,
  .move-forward-leave-from {
    transform: translateX(0);
  }

  .move-forward-leave-to {
    transform: translateX(-100%);
  }

  .fade-in-enter-active,
  .fade-in-leave-active {
    transition: opacity 0.3s ease;
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .fade-in-enter-from,
  .fade-in-leave-to {
    opacity: 0;
  }

  .fade-in-enter-to,
  .fade-in-leave-from {
    opacity: 1;
  }
</style>
