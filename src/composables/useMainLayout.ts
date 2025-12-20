/**
 * @file useMainLayout.ts
 * @description MainLayout.vue에서 사용되는 핵심 로직과 레이아웃 설정을 관리하는 컴포저블
 */

import { onBeforeUnmount, onMounted, watch, computed, ref, reactive, shallowRef } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'quasar';
import type { Tab, SubPageConfig, SubPageButton } from '../types/layout.d';
import { useKeyBinding } from './useKeyBinding';

import { navigateToPath } from '../utils/NavigationUtils';
import { isWideWidth } from '../utils/GlobalHelpers';

// === 화면 컴포넌트 임포트 ===
import CalcPage from 'pages/CalcPage.vue';
import UnitPage from 'pages/UnitPage.vue';
import CurrencyPage from 'pages/CurrencyPage.vue';
import RadixPage from 'pages/RadixPage.vue';
import HelpPage from 'src/pages/HelpPage.vue';
import AboutPage from 'src/pages/AboutPage.vue';
import RecordPage from 'src/pages/RecordPage.vue';
import SettingPage from 'src/pages/SettingPage.vue';

// === 스토어 임포트 ===
import { useCalcStore } from 'src/stores/calcStore';
import { useUIStore } from 'stores/uiStore';
import { useSettingsStore } from 'stores/settingsStore';
import { useThemesStore } from 'stores/themesStore';
import type { useRecordManager } from './useRecordManager';

/**
 * MainLayout에서 사용되는 핵심 로직과 레이아웃 설정을 제공하는 컴포저블
 * @param t - 번역 함수
 * @param recordManagerInstance - useRecordManager 인스턴스 (선택적)
 */
export function useMainLayout(t: (key: string) => string, recordManagerInstance?: ReturnType<typeof useRecordManager>) {
  const router = useRouter();
  const route = useRoute();
  const { locale } = useI18n({ useScope: 'global' });

  const calcStore = useCalcStore();
  const uiStore = useUIStore();
  const settingsStore = useSettingsStore();
  const themesStore = useThemesStore();

  const $g = window.globalVars;

  // 페이지 타이틀 설정
  const title = computed(() => t('message.appTitle'));
  useMeta(() => ({ title: title.value }));

  // === 레이아웃 설정 ===

  /**
   * 메인 탭 설정
   */
  const tabs = reactive<Tab[]>([
    { name: 'calc', title: computed(() => t('calc')), component: shallowRef(CalcPage) },
    { name: 'unit', title: computed(() => t('unit')), component: shallowRef(UnitPage) },
    { name: 'currency', title: computed(() => t('currency')), component: shallowRef(CurrencyPage) },
    { name: 'radix', title: computed(() => t('radix')), component: shallowRef(RadixPage) },
  ]);

  /**
   * 서브 페이지 설정
   * recordManagerInstance가 제공되면 레코드 버튼 설정에 해당 인스턴스의 함수들을 사용
   */
  const SUB_PAGE_CONFIG = reactive<SubPageConfig>({
    help: {
      component: shallowRef(HelpPage),
      title: computed(() => t('help')),
      showClose: true,
    },
    about: {
      component: shallowRef(AboutPage),
      title: computed(() => t('about')),
      showClose: true,
    },
    record: {
      component: shallowRef(RecordPage),
      title: computed(() => t('record')),
      buttons: recordManagerInstance
        ? [
            {
              icon: 'search',
              disabled: computed(() => false),
              action: () => {
                uiStore.isSearchOpen = !uiStore.isSearchOpen;
              },
              tooltip: computed(() => t('tooltip.search')),
            },
            {
              icon: 'file_download',
              disabled: recordManagerInstance.isRecordDisabled,
              action: () => recordManagerInstance.exportRecordsToCSV(),
              tooltip: computed(() => t('tooltip.exportRecords')),
            },
            {
              icon: 'file_upload',
              disabled: computed(() => false),
              action: () => recordManagerInstance.handleRecordImportClick(),
              tooltip: computed(() => t('tooltip.importRecords')),
            },
            {
              icon: 'delete_outline',
              disabled: recordManagerInstance.isRecordDisabled,
              action: () => recordManagerInstance.clearRecords(),
              tooltip: computed(() => t('tooltip.deleteRecord')),
            },
          ]
        : [],
    },
    settings: {
      component: shallowRef(SettingPage),
      title: computed(() => t('settings')),
      showClose: true,
    },
  });

  /**
   * 서브 페이지 버튼 설정
   */
  const SUB_PAGE_BUTTONS = reactive<SubPageButton[]>([
    { label: 'help', icon: 'help_outline', path: '/help', tooltip: computed(() => t('tooltip.help')) },
    { label: 'about', icon: 'info_outline', path: '/about', tooltip: computed(() => t('tooltip.about')) },
    { label: 'settings', icon: 'settings', path: '/settings', tooltip: computed(() => t('tooltip.settings')) },
  ]);

  // 레이아웃 상태 관리
  const leftDrawerOpen = ref(false);

  const toggleLeftDrawer = () => {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  };

  // 서브 페이지 관련
  const isSubPage = computed(() => {
    return Object.keys(SUB_PAGE_CONFIG)
      .filter((key) => !isWideWidth() || key !== 'record')
      .includes(String(route.name));
  });

  const closeSubPage = () => {
    if (isSubPage.value) {
      router.back();
    }
  };

  // 탭 이동 관련
  const moveTabRight = () => {
    const currentIndex = tabs.findIndex((tab) => tab.name === uiStore.currentTab);
    const nextTab = tabs[(currentIndex + 1) % tabs.length]?.name;
    if (nextTab) uiStore.setCurrentTab(nextTab);
  };

  const moveTabLeft = () => {
    const currentIndex = tabs.findIndex((tab) => tab.name === uiStore.currentTab);
    const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length]?.name;
    if (prevTab) uiStore.setCurrentTab(prevTab);
  };

  // 키보드 단축키 설정
  const { subscribe, unsubscribe } = useKeyBinding([
    [['Control+1'], () => uiStore.setCurrentTab('calc')],
    [['Control+2'], () => uiStore.setCurrentTab('unit')],
    [['Control+3'], () => uiStore.setCurrentTab('currency')],
    [['Control+4'], () => uiStore.setCurrentTab('radix')],
    [['Control+Tab', 'ArrowRight'], moveTabRight],
    [['Control+Shift+Tab', 'ArrowLeft'], moveTabLeft],
    [['F1'], () => navigateToPath('/help', route, router)],
    [['F2'], () => navigateToPath('/about', route, router)],
    [['F3'], () => navigateToPath('/settings', route, router)],
    [['F4'], () => navigateToPath('/record', route, router)],
    [['F5'], () => (uiStore.showTipsDialog = true)],
    [['Escape'], closeSubPage],
  ]);

  // 컴포넌트 마운트 시 초기화
  onMounted(() => {
    // 로케일 설정
    if (!settingsStore.locale) {
      settingsStore.useSystemLocale = true;
      settingsStore.locale = navigator.language.substring(0, 2);
    }
    if (!settingsStore.userLocale) {
      settingsStore.userLocale = settingsStore.locale;
    }
    locale.value = settingsStore.locale;

    // 초기화 설정
    if (settingsStore.initPanel && calcStore.calc) {
      calcStore.calc.reset();
    }
    if ($g.isElectron) {
      settingsStore.setAlwaysOnTop(settingsStore.alwaysOnTop);
    }

    // 다크 모드 설정
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', () => {
      if (themesStore.darkMode === 'system') {
        themesStore.updateDarkMode();
      }
    });
    themesStore.updateDarkMode();

    // 팁 다이얼로그 표시
    uiStore.showTipsDialog = uiStore.showTips && !uiStore.isAppStarted;
    uiStore.isAppStarted = true;
  });

  onBeforeUnmount(() => {
    unsubscribe();
  });

  // 입력 포커스 상태에 따른 키보드 단축키 활성화/비활성화
  watch(
    () => uiStore.inputFocused,
    (isFocused) => {
      if (isFocused) {
        unsubscribe();
      } else {
        subscribe();
      }
    },
    { immediate: true },
  );

  return {
    leftDrawerOpen,
    toggleLeftDrawer,
    tabs,
    SUB_PAGE_CONFIG,
    SUB_PAGE_BUTTONS,
  };
}
