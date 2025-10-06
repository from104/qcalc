/**
 * @file useMainLayout.ts
 * @description MainLayout.vue에서 사용되는 로직을 관리하는 컴포저블
 */

import { onBeforeUnmount, onMounted, reactive, shallowRef, watch, computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'quasar';
import type { Tab, SubPageConfig, SubPageButton } from '../types/layout';
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
import { useRecordManager } from './useRecordManager';

export function useMainLayout(t: (key: string) => string) {
  const router = useRouter();
  const route = useRoute();
  const { locale } = useI18n({ useScope: 'global' });

  const calcStore = useCalcStore();
  const uiStore = useUIStore();
  const settingsStore = useSettingsStore();
  const themesStore = useThemesStore();
  const { clearRecords, exportRecordsToCSV, importRecordsFromCSV } = useRecordManager();

  const recordFileInput = ref<HTMLInputElement | null>(null);

  const handleRecordImportClick = () => {
    recordFileInput.value?.click();
  };

  const handleRecordFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    importRecordsFromCSV(file);

    target.value = '';
  };

  const $g = window.globalVars;

  const title = computed(() => t('message.appTitle'));
  useMeta(() => ({ title: title.value }));

  const tabs = reactive<Tab[]>([
    { name: 'calc', title: computed(() => t('calc')), component: shallowRef(CalcPage) },
    { name: 'unit', title: computed(() => t('unit')), component: shallowRef(UnitPage) },
    { name: 'currency', title: computed(() => t('currency')), component: shallowRef(CurrencyPage) },
    { name: 'radix', title: computed(() => t('radix')), component: shallowRef(RadixPage) },
  ]);

  const isRecordDisabled = computed(() => {
    return calcStore.calc.record.getAllRecords().length === 0 || uiStore.isDeleteRecordConfirmOpen;
  });

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
      buttons: [
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
          disabled: isRecordDisabled,
          action: () => exportRecordsToCSV(),
          tooltip: computed(() => t('tooltip.exportRecords')),
        },
        {
          icon: 'file_upload',
          disabled: computed(() => false),
          action: () => handleRecordImportClick(),
          tooltip: computed(() => t('tooltip.importRecords')),
        },
        {
          icon: 'delete_outline',
          disabled: isRecordDisabled,
          action: () => clearRecords(),
          tooltip: computed(() => t('tooltip.deleteRecord')),
        },
      ],
    },
    settings: {
      component: shallowRef(SettingPage),
      title: computed(() => t('settings')),
      showClose: true,
    },
  });

  const currentSubPage = ref('record');
  const previousSubPage = ref('record');
  const isWideLayout = computed(() => isWideWidth());
  const leftDrawerOpen = ref(false);

  const switchSubPage = async (pageName: string) => {
    if (currentSubPage.value === pageName) return;

    previousSubPage.value = currentSubPage.value;
    currentSubPage.value = pageName;

    if (pageName !== 'record') {
      router.push({ name: pageName });
    } else {
      router.back();
    }
  };

  const isSubPage = computed(() => {
    return Object.keys(SUB_PAGE_CONFIG)
      .filter((key) => !isWideWidth() || key !== 'record')
      .includes(String(route.name));
  });

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

  const closeSubPage = () => {
    if (isSubPage.value) {
      if (isWideWidth()) {
        switchSubPage('record');
      } else {
        router.back();
      }
    }
  };

  const toggleLeftDrawer = () => {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  };

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

  onMounted(() => {
    subscribe();

    const validPages = ['help', 'about', 'settings'];
    currentSubPage.value = validPages.includes(route.name as string) ? (route.name as string) : 'record';

    if (!settingsStore.locale) {
      settingsStore.useSystemLocale = true;
      settingsStore.locale = navigator.language.substring(0, 2);
    }
    if (!settingsStore.userLocale) {
      settingsStore.userLocale = settingsStore.locale;
    }
    locale.value = settingsStore.locale;

    if (settingsStore.initPanel && calcStore.calc) {
      calcStore.calc.reset();
    }
    if ($g.isElectron) {
      settingsStore.setAlwaysOnTop(settingsStore.alwaysOnTop);
    }

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', () => {
      if (themesStore.darkMode === 'system') {
        themesStore.updateDarkMode();
      }
    });
    themesStore.updateDarkMode();

    uiStore.showTipsDialog = uiStore.showTips && !uiStore.isAppStarted;
    uiStore.isAppStarted = true;
  });

  onBeforeUnmount(() => {
    unsubscribe();
  });

  watch(
    () => uiStore.inputFocused,
    () => {
      if (uiStore.inputFocused) {
        unsubscribe();
      } else {
        subscribe();
      }
    },
    { immediate: true },
  );

  const SUB_PAGE_BUTTONS = reactive<SubPageButton[]>([
    { label: 'help', icon: 'help_outline', path: '/help', tooltip: computed(() => t('tooltip.help')) },
    { label: 'about', icon: 'info_outline', path: '/about', tooltip: computed(() => t('tooltip.about')) },
    { label: 'settings', icon: 'settings', path: '/settings', tooltip: computed(() => t('tooltip.settings')) },
  ]);

  return {
    router,
    route,
    t,
    calcStore,
    uiStore,
    settingsStore,
    themesStore,
    recordFileInput,
    handleRecordImportClick,
    handleRecordFileChange,
    $g,
    tabs,
    SUB_PAGE_CONFIG,
    currentSubPage,
    isWideLayout,
    leftDrawerOpen,
    switchSubPage,
    isSubPage,
    closeSubPage,
    toggleLeftDrawer,
    navigateToPath,
    SUB_PAGE_BUTTONS,
  };
}
