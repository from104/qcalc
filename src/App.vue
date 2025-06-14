<script setup lang="ts">
  /**
   * @file App.vue
   * @description 이 파일은 Vue 애플리케이션의 주요 컴포넌트를 정의합니다.
   *              사용자 인터페이스의 상태를 관리하고, 라우팅 및 다크모드와 같은 기능을 처리합니다.
   *              또한, 전역 단축키 설정 및 사용자 알림 기능을 포함하여
   *              애플리케이션의 전반적인 사용자 경험을 향상시키는 역할을 합니다.
   */

  // === 핵심 Vue 및 라우터 의존성 ===
  import { ref, onBeforeMount, watch, computed, onUnmounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { ScreenOrientation } from '@capacitor/screen-orientation';

  // === 컴포넌트 임포트 ===
  import AutoUpdate from 'components/AutoUpdate.vue';
  import SnapFirst from 'components/snippets/SnapFirst.vue';

  // === 유틸리티 클래스 임포트 ===
  import { KeyBinding } from 'classes/KeyBinding';
  import { showMessage } from './utils/NotificationUtils';
  import { isWideWidth } from './utils/GlobalHelpers';

  // === 스토어 임포트 및 설정 ===
  import { useUIStore } from 'stores/uiStore';
  import { useSettingsStore } from 'stores/settingsStore';
  import { useThemesStore } from './stores/themesStore';

  const uiStore = useUIStore();
  const settingsStore = useSettingsStore();
  const themesStore = useThemesStore();

  // === 전역 객체 및 상태 저장소 설정 ===
  const $g = window.globalVars;

  const route = useRoute();
  const { t } = useI18n();

  // === 상태 관리 ===
  const isFirstNavigation = ref(true);
  const previousPath = ref(route.path);
  const isWideLayout = ref(isWideWidth());
  const currentTransition = ref('');

  /**
   * '항상 위에' 기능을 토글하고 사용자에게 알림을 표시합니다.
   */
  const toggleAlwaysOnTopWithNotification = () => {
    if ($g.isElectron) {
      settingsStore.toggleAlwaysOnTop();
      showMessage(settingsStore.alwaysOnTop ? t('alwaysOnTopOn') : t('alwaysOnTopOff'));
    }
  };

  /**
   * 다크모드를 토글하고 현재 설정 상태를 사용자에게 알립니다.
   */
  const toggleDarkModeWithNotification = () => {
    themesStore.toggleDarkMode();
    showMessage(
      themesStore.darkMode === 'system' ? t('darkMode.message.system') : t('darkMode.message.' + themesStore.darkMode),
    );
  };

  /**
   * 앱을 종료합니다.
   */
  const quitApp = () => {
    if ($g.isElectron) window.electron.quitApp();
  };

  // === 키 바인딩 설정 ===
  /**
   * 전역 단축키 설정
   * Alt+t: 항상 위에 토글
   * Alt+i: 초기화 패널 토글
   * Alt+d: 다크모드 토글
   * Alt+p: 햅틱 모드 토글
   * F1-F4: 각종 페이지 이동
   * q: 앱 종료
   * 기타: 계산기 관련 기능
   */
  const keyBinding = new KeyBinding([
    [['Alt+t'], toggleAlwaysOnTopWithNotification],
    [['Alt+i'], settingsStore.toggleInitPanel],
    [['Alt+d'], toggleDarkModeWithNotification],
    [['Alt+p'], settingsStore.toggleHapticsMode],
    [[';'], settingsStore.toggleButtonAddedLabel],
    [[','], settingsStore.toggleUseGrouping],
    [['Alt+,'], () => settingsStore.setGroupingUnit(settingsStore.groupingUnit === 3 ? 4 : 3)],
    [['['], settingsStore.decrementDecimalPlaces],
    [[']'], settingsStore.incrementDecimalPlaces],
    [['q'], quitApp],
  ]);

  // === 라이프사이클 훅 및 감시자 ===
  /**
   * 첫 번째 네비게이션 플래그를 설정합니다.
   * 초기 트랜지션 애니메이션을 방지하기 위해 사용됩니다.
   */
  onBeforeMount(() => {
    setTimeout(() => {
      isFirstNavigation.value = false;
    }, 100);
  });

  /**
   * 입력 필드 포커스 상태에 따라 키 바인딩을 활성화/비활성화합니다.
   */
  watch(
    () => uiStore.inputFocused,
    () => {
      if (uiStore.inputFocused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
    { immediate: true },
  );

  /**
   * 레이아웃 너비 변경을 감시하고 적절한 트랜지션을 설정합니다.
   */
  watch(
    () => isWideWidth(),
    (newValue) => {
      if (isWideLayout.value !== newValue) {
        currentTransition.value = newValue ? 'expand-layout' : 'collapse-layout';
        isWideLayout.value = newValue;
      }
    },
  );

  /**
   * 라우트 변경을 감시하고 적절한 트랜지션을 설정합니다.
   */
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

  // === 계산된 속성 ===
  /**
   * 현재 적용할 트랜지션 이름을 반환합니다.
   */
  const computeTransition = computed(() => currentTransition.value);

  onBeforeMount(async () => {
    if ($g.isCapacitor && $g.isPhone) {
      await ScreenOrientation.lock({
        orientation: 'portrait',
      });
    }
    themesStore.updateDarkModeAndTheme();
  });

  onUnmounted(async () => {
    if ($g.isCapacitor && $g.isPhone) {
      await ScreenOrientation.unlock();
    }
  });

  uiStore.isAppStarted = false;
</script>

<template>
  <router-view v-slot="{ Component, route: routeProps }">
    <transition :name="isFirstNavigation ? '' : computeTransition || ''" mode="default">
      <component :is="Component" :key="routeProps.path + '-' + isWideLayout" />
    </transition>
  </router-view>
  <AutoUpdate />
  <SnapFirst />
</template>

<style scoped lang="scss">
  // === 공통 트랜지션 스타일 ===
  %transition-base {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  // === 슬라이드 트랜지션 ===
  // 뒤로 가기/앞으로 가기 애니메이션 공통 속성
  .slide-back-enter-active,
  .slide-back-leave-active,
  .slide-forward-enter-active,
  .slide-forward-leave-active {
    @extend %transition-base;
    transition: transform 0.2s ease;
  }

  // 뒤로 가기 애니메이션
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

  // 앞으로 가기 애니메이션
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

  // === 페이드 트랜지션 ===
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

  // === 레이아웃 확장/축소 트랜지션 ===
  // 확장 애니메이션
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

  // 축소 애니메이션
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
    transform: scaleX(2);
    transform-origin: left;
  }
</style>

<i18n>
ko:
  targetToBeCopiedResult: '계산 결과를'
  targetToBeCopiedSelected: '선택한 내용을'
  copiedToClipboard: '{target} 클립보드에 복사했습니다.'
  alwaysOnTopOn: '항상 위에 표시가 활성화되었습니다.'
  alwaysOnTopOff: '항상 위에 표시가 비활성화되었습니다.'
  darkMode:
    message:
      system: '다크모드를 시스템 설정에 따라 변경했습니다.'
      light: '라이트 모드로 변경했습니다.'
      dark: '다크 모드로 변경했습니다.'
en:
  targetToBeCopiedResult: 'the calculation result'
  targetToBeCopiedSelected: 'the selected content'
  copiedToClipboard: 'Copied {target} to the clipboard.'
  alwaysOnTopOn: 'Always on top has been enabled.'
  alwaysOnTopOff: 'Always on top has been disabled.'
  darkMode:
    message:
      system: 'Dark mode changed to follow system settings.'
      light: 'Changed to light mode.'
      dark: 'Changed to dark mode.'
</i18n>
