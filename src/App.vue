<script setup lang="ts">
  /**
   * @file App.vue
   * @description 앱 루트 컴포넌트.
   *   - 전역 단축키 (Alt+t/d/p/n/i, 숫자 포맷, 앱 종료)
   *   - 라우트 트랜지션 (slide/fade/expand/collapse)
   *   - 모바일 화면 잠금, 다크모드 초기화, 저장 설정 검증
   */

  import { ref, onBeforeMount, watch, computed, onMounted, onUnmounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { ScreenOrientation } from '@capacitor/screen-orientation';
  import { useQuasar } from 'quasar';

  import AutoUpdate from 'components/dialogs/AutoUpdate.vue';
  import SnapFirst from 'components/dialogs/SnapFirst.vue';
  import VersionChangelogDialog from 'components/dialogs/VersionChangelogDialog.vue';

  import { useKeyBinding } from './composables/useKeyBinding';
  import { showMessage } from './utils/NotificationUtils';
  import { isWideWidth } from './utils/GlobalHelpers';

  import { useUIStore } from 'stores/uiStore';
  import { useSettingsStore } from 'stores/settingsStore';
  import { useThemesStore } from './stores/themesStore';
  import { useUnitStore } from './stores/unitStore';
  import { useCurrencyStore } from './stores/currencyStore';
  import { useRadixStore } from './stores/radixStore';

  const uiStore = useUIStore();
  const settingsStore = useSettingsStore();
  const themesStore = useThemesStore();
  const unitStore = useUnitStore();
  const currencyStore = useCurrencyStore();
  const radixStore = useRadixStore();

  const $g = window.globalVars;
  const route = useRoute();
  const { t } = useI18n();
  const $q = useQuasar();

  // ── 상태 ──
  const isFirstNavigation = ref(true);
  const previousPath = ref(route.path);
  const isWideLayout = ref(isWideWidth());
  const currentTransition = ref('');

  // ── 단축키 액션 ──
  const toggleAlwaysOnTop = () => {
    if (!$g.isElectron) return;
    settingsStore.toggleAlwaysOnTop();
    showMessage(settingsStore.alwaysOnTop ? t('alwaysOnTopOn') : t('alwaysOnTopOff'));
  };

  const toggleDarkMode = () => {
    themesStore.toggleDarkMode();
    const mode = themesStore.darkMode;
    showMessage(mode === 'system' ? t('darkMode.message.system') : t(`darkMode.message.${mode}`));
  };

  const quitApp = () => {
    if ($g.isElectron) window.electron.quitApp();
  };

  // ── 전역 키 바인딩 ──
  const { subscribe, unsubscribe } = useKeyBinding([
    [['Alt+t'], toggleAlwaysOnTop],
    [['Alt+i'], settingsStore.toggleInitPanel],
    [['Alt+d'], toggleDarkMode],
    [['Alt+p'], settingsStore.toggleHapticsMode],
    [['Alt+n'], settingsStore.toggleNumberFormatPerCalculator],
    [[';'], settingsStore.toggleButtonAddedLabel],
    [[','], settingsStore.toggleUseGrouping],
    [['Alt+,'], () => settingsStore.toggleGroupingUnit()],
    [['['], settingsStore.decrementDecimalPlaces],
    [[']'], settingsStore.incrementDecimalPlaces],
    [['q'], quitApp],
  ]);

  // ── 라이프사이클 ──
  onBeforeMount(async () => {
    uiStore.isAppStarted = false;

    // 모바일 세로 고정
    if ($g.isCapacitor && $g.isPhone) {
      await ScreenOrientation.lock({ orientation: 'portrait' });
    }

    themesStore.updateDarkModeAndTheme();

    // 초기 트랜지션 방지 (마운트 직후 100ms간 애니메이션 억제)
    setTimeout(() => {
      isFirstNavigation.value = false;
    }, 100);
  });

  onMounted(() => {
    // 앱 업데이트 후 유효하지 않은 저장 설정 자동 보정
    // 모두 실행해야 하므로 개별 호출 후 합산 (|| 단축 평가 방지)
    const u = unitStore.validateAndCorrectUnits();
    const c = currencyStore.validateAndCorrectCurrencies();
    const r = radixStore.validateAndCorrectRadixSettings();
    const corrected = u || c || r;

    if (corrected) {
      setTimeout(() => {
        $q.notify({
          message: t('persistedSettingsCorrected'),
          color: 'info',
          position: 'top',
          icon: 'info',
          timeout: 7000,
          actions: [{ icon: 'close', color: 'white' }],
        });
      }, 2500);
    }
  });

  onUnmounted(async () => {
    if ($g.isCapacitor && $g.isPhone) {
      await ScreenOrientation.unlock();
    }
  });

  // ── 워처 ──

  // 입력 필드 포커스 시 전역 단축키 비활성화
  watch(
    () => uiStore.inputFocused,
    (focused) => (focused ? unsubscribe() : subscribe()),
    { immediate: true },
  );

  // 레이아웃 전환 (넓은 ↔ 좁은)
  watch(
    () => isWideWidth(),
    (wide) => {
      if (isWideLayout.value !== wide) {
        currentTransition.value = wide ? 'expand-layout' : 'collapse-layout';
        isWideLayout.value = wide;
      }
    },
  );

  // 라우트 전환 애니메이션
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

  const transitionName = computed(() => (isFirstNavigation.value ? '' : currentTransition.value));
</script>

<template>
  <router-view v-slot="{ Component, route: routeProps }">
    <!--
      Wide: 고정 키('wide-layout')로 레이아웃 유지, 서브페이지만 전환
      Narrow: routeProps.path를 키로 사용하여 페이지 전환 애니메이션
    -->
    <transition :name="transitionName" mode="default">
      <component :is="Component" :key="isWideLayout ? 'wide-layout' : routeProps.path" />
    </transition>
  </router-view>
  <AutoUpdate />
  <SnapFirst />
  <VersionChangelogDialog />
</template>

<style scoped lang="scss">
  %transition-base {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  // 슬라이드 (뒤로/앞으로)
  .slide-back-enter-active,
  .slide-back-leave-active,
  .slide-forward-enter-active,
  .slide-forward-leave-active {
    @extend %transition-base;
    transition: transform 0.2s ease;
  }

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

  // 페이드
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

  // 레이아웃 확장
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

  // 레이아웃 축소
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

<i18n lang="yaml">
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
  persistedSettingsCorrected: '앱 업데이트로 인해 일부 저장된 설정이 초기화되었습니다.'
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
  persistedSettingsCorrected: 'Some saved settings have been reset due to an app update.'
ja:
  targetToBeCopiedResult: '計算結果を'
  targetToBeCopiedSelected: '選択した内容を'
  copiedToClipboard: '{target}クリップボードにコピーしました。'
  alwaysOnTopOn: '常に前面表示が有効になりました。'
  alwaysOnTopOff: '常に前面表示が無効になりました。'
  darkMode:
    message:
      system: 'ダークモードをシステム設定に従うように変更しました。'
      light: 'ライトモードに変更しました。'
      dark: 'ダークモードに変更しました。'
  persistedSettingsCorrected: 'アプリの更新により一部の保存された設定がリセットされました。'
zh:
  targetToBeCopiedResult: '计算结果'
  targetToBeCopiedSelected: '选中内容'
  copiedToClipboard: '已将{target}复制到剪贴板。'
  alwaysOnTopOn: '已启用始终置顶。'
  alwaysOnTopOff: '已禁用始终置顶。'
  darkMode:
    message:
      system: '已将深色模式更改为跟随系统设置。'
      light: '已切换到浅色模式。'
      dark: '已切换到深色模式。'
  persistedSettingsCorrected: '由于应用更新，部分保存的设置已被重置。'
hi:
  targetToBeCopiedResult: 'गणना परिणाम'
  targetToBeCopiedSelected: 'चयनित सामग्री'
  copiedToClipboard: '{target} क्लिपबोर्ड पर कॉपी किया गया।'
  alwaysOnTopOn: 'हमेशा ऊपर सक्षम किया गया।'
  alwaysOnTopOff: 'हमेशा ऊपर अक्षम किया गया।'
  darkMode:
    message:
      system: 'डार्क मोड सिस्टम सेटिंग्स के अनुसार बदला गया।'
      light: 'लाइट मोड में बदला गया।'
      dark: 'डार्क मोड में बदला गया।'
  persistedSettingsCorrected: 'ऐप अपडेट के कारण कुछ सहेजी गई सेटिंग्स रीसेट की गई हैं।'
de:
  targetToBeCopiedResult: 'das Berechnungsergebnis'
  targetToBeCopiedSelected: 'den ausgewählten Inhalt'
  copiedToClipboard: '{target} in die Zwischenablage kopiert.'
  alwaysOnTopOn: 'Immer im Vordergrund wurde aktiviert.'
  alwaysOnTopOff: 'Immer im Vordergrund wurde deaktiviert.'
  darkMode:
    message:
      system: 'Dunkelmodus folgt jetzt den Systemeinstellungen.'
      light: 'Zum hellen Modus gewechselt.'
      dark: 'Zum dunklen Modus gewechselt.'
  persistedSettingsCorrected: 'Einige gespeicherte Einstellungen wurden aufgrund eines App-Updates zurückgesetzt.'
es:
  targetToBeCopiedResult: 'el resultado del cálculo'
  targetToBeCopiedSelected: 'el contenido seleccionado'
  copiedToClipboard: 'Se copió {target} al portapapeles.'
  alwaysOnTopOn: 'Siempre arriba ha sido activado.'
  alwaysOnTopOff: 'Siempre arriba ha sido desactivado.'
  darkMode:
    message:
      system: 'El modo oscuro ahora sigue la configuración del sistema.'
      light: 'Cambiado a modo claro.'
      dark: 'Cambiado a modo oscuro.'
  persistedSettingsCorrected: 'Algunas configuraciones guardadas se han restablecido debido a una actualización de la aplicación.'
fr:
  targetToBeCopiedResult: 'le résultat du calcul'
  targetToBeCopiedSelected: 'le contenu sélectionné'
  copiedToClipboard: '{target} copié dans le presse-papiers.'
  alwaysOnTopOn: 'Toujours au-dessus a été activé.'
  alwaysOnTopOff: 'Toujours au-dessus a été désactivé.'
  darkMode:
    message:
      system: 'Le mode sombre suit maintenant les paramètres du système.'
      light: 'Passé en mode clair.'
      dark: 'Passé en mode sombre.'
  persistedSettingsCorrected: "Certains paramètres enregistrés ont été réinitialisés suite à une mise à jour de l'application."
</i18n>
