<script setup lang="ts">
  /**
   * @file App.vue
   * @description 앱 루트 컴포넌트.
   *   - 전역 단축키 (Alt+t/d/p/n/i, 숫자 포맷, 앱 종료)
   *   - 라우트 트랜지션 (slide/fade/expand/collapse)
   *   - 모바일 화면 잠금, 다크모드 초기화, 저장 설정 검증
   */

  import { ref, onBeforeMount, watch, computed, onMounted, onUnmounted, defineAsyncComponent, nextTick } from 'vue';

  // 버전 변경 로그 다이얼로그(정보 md 10개 언어 포함)는 첫 화면 뒤에 별도 chunk로 불러온다
  const VersionChangelogDialog = defineAsyncComponent(() => import('components/dialogs/VersionChangelogDialog.vue'));
  // 업데이트·Snap 안내·마이그레이션 다이얼로그도 첫 화면 뒤 별도 chunk로
  const AutoUpdate = defineAsyncComponent(() => import('components/dialogs/AutoUpdate.vue'));
  const SnapFirst = defineAsyncComponent(() => import('components/dialogs/SnapFirst.vue'));
  const MigrationOnboarding = defineAsyncComponent(() => import('components/dialogs/MigrationOnboarding.vue'));
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { ScreenOrientation } from '@capacitor/screen-orientation';
  import { useQuasar } from 'quasar';

  import { useKeyBinding } from './composables/useKeyBinding';
  import { useHtmlLangSync } from './composables/useHtmlLangSync';
  import { showMessage } from './utils/NotificationUtils';
  import { isWideWidth } from './utils/GlobalHelpers';

  import { useUIStore } from 'stores/uiStore';
  import { useSettingsStore } from 'stores/settingsStore';
  import { useThemesStore } from './stores/themesStore';
  import { useUnitStore } from './stores/unitStore';
  import { useCurrencyStore } from './stores/currencyStore';
  import { useRadixStore } from './stores/radixStore';
  import { useFormulaStore } from './stores/formulaStore';

  const uiStore = useUIStore();
  const settingsStore = useSettingsStore();
  const themesStore = useThemesStore();
  const unitStore = useUnitStore();
  const currencyStore = useCurrencyStore();
  const radixStore = useRadixStore();

  const $g = window.globalVars;
  const route = useRoute();
  const { t, locale } = useI18n();
  const $q = useQuasar();

  // ── 상태 ──
  const isFirstNavigation = ref(true);
  const previousPath = ref(route.path);
  const isWideLayout = ref(isWideWidth());
  const currentTransition = ref('');

  // HTML lang 속성을 i18n locale과 동기화 (WCAG 3.1.1 Level A)
  const { syncNow: syncHtmlLang } = useHtmlLangSync(locale);

  // ── 단축키 액션 ──
  const toggleAlwaysOnTop = () => {
    if (!$g.isElectron && !$g.isTauri) return;
    settingsStore.toggleAlwaysOnTop();
    showMessage(settingsStore.alwaysOnTop ? t('alwaysOnTopOn') : t('alwaysOnTopOff'));
  };

  const toggleDarkMode = () => {
    themesStore.toggleDarkMode();
    const mode = themesStore.darkMode;
    showMessage(mode === 'system' ? t('darkMode.message.system') : t(`darkMode.message.${mode}`));
  };

  const quitApp = () => {
    if ($g.isElectron || $g.isTauri) window.electron.quitApp();
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
    // 첫 화면이 뜬 뒤 유휴 시간에 수식 엔진(mathjs 전체)을 미리 불러온다 — 시작 경로에서는 제외
    const prefetchFormulaMath = () => void useFormulaStore().ensureMath();
    if ('requestIdleCallback' in window) requestIdleCallback(prefetchFormulaMath, { timeout: 3000 });
    else setTimeout(prefetchFormulaMath, 1500);

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

    // HTML lang 속성을 i18n locale과 동기화
    syncHtmlLang();
  });

  onUnmounted(async () => {
    if ($g.isCapacitor && $g.isPhone) {
      await ScreenOrientation.unlock();
    }
  });

  // ── 워처 ──
  // (HTML lang ↔ i18n locale 동기화는 useHtmlLangSync 컴포저블이 담당)

  // 입력 필드 포커스 시 전역 단축키 비활성화
  watch(
    () => uiStore.inputFocused,
    (focused) => (focused ? unsubscribe() : subscribe()),
    { immediate: true },
  );

  // 레이아웃 전환 (넓은 ↔ 좁은)
  // 경계를 넘는 즉시 레이아웃을 바꾸고, 새 화면은 살짝 확대되며 나타나고 넓은 화면의 보조 패널은 옆에서
  // 밀려 들어온다. transform·opacity 만 쓰는 컴포지터 애니메이션이라 메인 스레드가 막혀도 끊기지 않는다.
  // 시도했다 버린 방식 (WebKitGTK 릴리스 실측):
  // - scaleX 늘이기: 글자가 찌그러짐
  // - View Transition: 창 크기가 바뀌는 중이면 "viewport size changed"로 건너뛰어져 순간 교체
  // - 계산기 폭(width) 애니메이션: 버튼 컨테이너 쿼리 재배치가 프레임당 30~100ms 라 뚝뚝 끊김
  const LAYOUT_MS = 200;
  const LAYOUT_EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

  const swapLayout = async (wide: boolean) => {
    const root = document.documentElement;
    const reduceMotion =
      root.classList.contains('motion-reduced') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    currentTransition.value = '';
    isWideLayout.value = wide;
    if (reduceMotion) return;
    await nextTick();
    document.querySelector<HTMLElement>('.main-layout')?.animate(
      [
        { opacity: 0.4, transform: 'scale(0.985)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: LAYOUT_MS, easing: LAYOUT_EASE },
    );
    if (wide) {
      document.querySelector<HTMLElement>('.sub-pane')?.animate(
        [
          { transform: 'translateX(24px)', opacity: 0 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: LAYOUT_MS + 60, easing: LAYOUT_EASE },
      );
    }
  };

  watch(
    () => isWideWidth(),
    (wide) => {
      if (wide !== isWideLayout.value) void swapLayout(wide);
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
    <!-- 이름이 비면(:css=false) 떠나는 화면을 즉시 제거 — 레이아웃 전환 때 옛·새 레이아웃이 겹치면
         새 화면(.main-layout)에 거는 등장 애니메이션 대상이 옛 화면으로 어긋난다 -->
    <transition :name="transitionName" :css="!!transitionName" mode="default">
      <component :is="Component" :key="isWideLayout ? 'wide-layout' : routeProps.path" />
    </transition>
  </router-view>
  <AutoUpdate />
  <SnapFirst />
  <VersionChangelogDialog />
  <MigrationOnboarding />
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
    transition: transform var(--motion-base) var(--ease-out);
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
    transition: opacity var(--motion-base) ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .fade-enter-to,
  .fade-leave-from {
    opacity: 1;
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
pt:
  targetToBeCopiedResult: 'o resultado do cálculo'
  targetToBeCopiedSelected: 'o conteúdo selecionado'
  copiedToClipboard: '{target} copiado para a área de transferência.'
  alwaysOnTopOn: 'Sempre no topo foi ativado.'
  alwaysOnTopOff: 'Sempre no topo foi desativado.'
  darkMode:
    message:
      system: 'O modo escuro foi alterado para seguir as configurações do sistema.'
      light: 'Alterado para o modo claro.'
      dark: 'Alterado para o modo escuro.'
  persistedSettingsCorrected: 'Algumas configurações salvas foram redefinidas devido a uma atualização do aplicativo.'
ru:
  targetToBeCopiedResult: 'результат вычисления'
  targetToBeCopiedSelected: 'выбранное содержимое'
  copiedToClipboard: '{target} скопировано в буфер обмена.'
  alwaysOnTopOn: 'Режим «Всегда поверх» включён.'
  alwaysOnTopOff: 'Режим «Всегда поверх» отключён.'
  darkMode:
    message:
      system: 'Тёмный режим изменён на системные настройки.'
      light: 'Переключено на светлый режим.'
      dark: 'Переключено на тёмный режим.'
  persistedSettingsCorrected: 'Некоторые сохранённые настройки были сброшены из-за обновления приложения.'
</i18n>
