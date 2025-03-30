<script setup lang="ts">
  /**
   * @file MainLayout.vue
   * @description 이 파일은 Vue.js 애플리케이션의 메인 레이아웃을 정의합니다.
   *              레이아웃은 헤더, 사이드바, 메인 콘텐츠 영역으로 구성되어 있으며,
   *              다양한 페이지 컴포넌트를 동적으로 로드하여 사용자에게 보여줍니다.
   *              또한, 다국어 지원을 위한 i18n 기능을 통합하여
   *              사용자의 언어 설정에 따라 적절한 메시지를 표시합니다.
   *              이 레이아웃은 반응형 디자인을 지원하여 다양한 화면 크기에서
   *              최적의 사용자 경험을 제공합니다.
   */

  import { onBeforeUnmount, onMounted, reactive, shallowRef, watch, computed, ref } from 'vue';
  import type { ComputedRef } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { useMeta } from 'quasar';
  import { KeyBinding } from 'classes/KeyBinding';

  import { navigateToPath } from '../utils/NavigationUtils';
  import { isWideWidth } from '../utils/GlobalHelpers';

  // === 컴포넌트 임포트 ===
  import ToolTip from 'components/snippets/ToolTip.vue';
  import MenuPanel from 'components/MenuPanel.vue';
  import HelpIcon from 'components/snippets/HelpIcon.vue';
  import ShowTips from 'components/ShowTips.vue';

  // === 페이지 컴포넌트 임포트 ===
  import CalcPage from 'pages/CalcPage.vue';
  import UnitPage from 'pages/UnitPage.vue';
  import CurrencyPage from 'pages/CurrencyPage.vue';
  import RadixPage from 'pages/RadixPage.vue';
  import HelpPage from 'src/pages/HelpPage.vue';
  import AboutPage from 'src/pages/AboutPage.vue';
  import RecordPage from 'src/pages/RecordPage.vue';
  import SettingPage from 'src/pages/SettingPage.vue';

  const router = useRouter();
  const route = useRoute();
  const { locale } = useI18n({ useScope: 'global' });
  const { t } = useI18n();

  // === 스토어 임포트 ===
  import { useCalcStore } from 'src/stores/calcStore';
  import { useUIStore } from 'stores/uiStore';
  import { useSettingsStore } from 'stores/settingsStore';

  const calcStore = useCalcStore();
  const uiStore = useUIStore();
  const settingsStore = useSettingsStore();

  // === 전역 변수 설정 ===
  /**
   * 전역 변수와 상태 저장소를 설정합니다.
   */
  const $g = window.globalVars;

  // === 메타데이터 설정 ===
  /**
   * 앱 제목을 동적으로 설정합니다.
   */
  const title = computed(() => t('message.appTitle'));
  useMeta(() => ({ title: title.value }));

  // === 메인 탭 설정 ===
  /**
   * 메인 탭의 구성과 속성을 정의합니다.
   * 각 탭은 이름, 제목, 컴포넌트 참조를 포함합니다.
   */
  const tabs = reactive([
    { name: 'calc', title: computed(() => t('calc')), component: shallowRef(CalcPage) },
    { name: 'unit', title: computed(() => t('unit')), component: shallowRef(UnitPage) },
    { name: 'currency', title: computed(() => t('currency')), component: shallowRef(CurrencyPage) },
    { name: 'radix', title: computed(() => t('radix')), component: shallowRef(RadixPage) },
  ]);

  // === 서브페이지 설정 ===
  /**
   * 서브페이지의 구성을 정의하는 인터페이스입니다.
   */
  interface SubPageConfig {
    [key: string]: {
      component: ReturnType<typeof shallowRef>;
      title: ComputedRef<string>;
      showClose?: boolean;
      buttons?: {
        icon: string;
        disabled: ComputedRef<boolean>;
        action: () => void;
        tooltip: ComputedRef<string>;
      }[];
    };
  }

  /**
   * 기록 삭제 버튼의 비활성화 상태를 계산합니다.
   */
  const isRecordDisabled = computed(() => {
    return calcStore.calc.record.getAllRecords().length === 0 || uiStore.isDeleteRecordConfirmOpen;
  });

  /**
   * 서브페이지의 상세 설정을 정의합니다.
   */
  const SUB_PAGE_CONFIG = reactive<SubPageConfig>({
    help: {
      component: shallowRef(HelpPage),
      title: computed(() => t('message.help')),
      showClose: true,
    },
    about: {
      component: shallowRef(AboutPage),
      title: computed(() => t('message.about')),
      showClose: true,
    },
    record: {
      component: shallowRef(RecordPage),
      title: computed(() => t('message.record')),
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
          icon: 'delete_outline',
          disabled: isRecordDisabled,
          action: () => {
            uiStore.isDeleteRecordConfirmOpen = true;
          },
          tooltip: computed(() => t('tooltip.deleteRecord')),
        },
      ],
    },
    settings: {
      component: shallowRef(SettingPage),
      title: computed(() => t('message.settings')),
      showClose: true,
    },
  });

  // === 상태 관리 ===
  const currentSubPage = ref('record');
  const previousSubPage = ref('record');
  const isWideLayout = computed(() => isWideWidth());
  const leftDrawerOpen = ref(false);

  // === 유틸리티 함수 ===
  /**
   * 서브페이지를 전환하는 함수입니다.
   */
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

  /**
   * 현재 페이지가 서브페이지인지 확인합니다.
   */
  const isSubPage = computed(() => {
    return Object.keys(SUB_PAGE_CONFIG)
      .filter((key) => !isWideWidth() || key !== 'record')
      .includes(String(route.name));
  });

  /**
   * 탭 이동 관련 함수들
   */
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

  /**
   * 서브페이지를 닫는 함수입니다.
   */
  const closeSubPage = () => {
    if (isSubPage.value) {
      if (isWideWidth()) {
        switchSubPage('record');
      } else {
        router.back();
      }
    }
  };

  /**
   * 왼쪽 메뉴 서랍을 토글합니다.
   */
  const toggleLeftDrawer = () => {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  };

  // === 키보드 단축키 설정 ===
  /**
   * 전역 키보드 단축키를 설정합니다.
   */
  const keyBinding = new KeyBinding([
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

  // === 라이프사이클 훅 및 감시자 ===
  /**
   * 컴포넌트 마운트 시 초기화 작업을 수행합니다.
   */
  onMounted(() => {
    keyBinding.subscribe();

    // 현재 서브페이지 설정
    const validPages = ['help', 'about', 'settings'];
    currentSubPage.value = validPages.includes(route.name as string) ? (route.name as string) : 'record';

    // 로케일 설정
    if (!settingsStore.locale) {
      settingsStore.useSystemLocale = true;
      settingsStore.locale = navigator.language.substring(0, 2);
    }
    if (!settingsStore.userLocale) {
      settingsStore.userLocale = settingsStore.locale;
    }
    locale.value = settingsStore.locale;

    // OS별 UI 최적화
    if ($g.isWindows) {
      calcStore.resultPanelPadding = 8;
    } else if ($g.isLinux) {
      calcStore.resultPanelPadding = 3;
    } else {
      calcStore.resultPanelPadding = 0;
    }

    // 초기 설정 적용
    if (settingsStore.initPanel && calcStore.calc) {
      calcStore.calc.reset();
    }
    if ($g.isElectron) {
      settingsStore.setAlwaysOnTop(settingsStore.alwaysOnTop);
    }

    // 다크모드 설정
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', () => {
      if (settingsStore.darkMode === 'system') {
        settingsStore.updateDarkMode();
      }
    });
    settingsStore.updateDarkMode();

    // 팁 다이얼로그 초기화
    uiStore.showTipsDialog = uiStore.showTips && !uiStore.isAppStarted;
    uiStore.isAppStarted = true;
  });

  /**
   * 컴포넌트 언마운트 시 정리 작업을 수행합니다.
   */
  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
  });

  /**
   * 입력 필드 포커스 상태에 따라 키 바인딩을 관리합니다.
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

  // === 서브페이지 버튼 설정 ===
  /**
   * 서브페이지 버튼의 구성을 정의합니다.
   */
  const SUB_PAGE_BUTTONS = reactive([
    { label: 'help', icon: 'help_outline', path: '/help', tooltip: computed(() => t('tooltip.help')) },
    { label: 'about', icon: 'info_outline', path: '/about', tooltip: computed(() => t('tooltip.about')) },
    { label: 'settings', icon: 'settings', path: '/settings', tooltip: computed(() => t('tooltip.settings')) },
  ]);
</script>

<template>
  <div class="main-layout">
    <!-- 좁은 화면 레이아웃 -->
    <q-layout v-if="!isWideLayout" view="hHh LpR fFf">
      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        elevated
        :width="250"
        :dark="settingsStore.isDarkMode()"
        :swipe-only="$g.isMobile"
        behavior="mobile"
        @click="leftDrawerOpen = false"
      >
        <q-card :class="settingsStore.isDarkMode() ? 'bg-grey-9' : 'bg-grey-3'" class="full-height menu-card">
          <MenuPanel />
        </q-card>
      </q-drawer>

      <q-header id="header" class="z-top noselect" elevated>
        <!-- 메인 페이지 헤더 -->
        <q-toolbar v-if="!isSubPage" v-auto-blur>
          <q-btn flat dense round class="q-mr-sm" icon="menu" aria-label="Menu" @click="toggleLeftDrawer">
            <ToolTip :text="t('tooltip.menu')" />
          </q-btn>
          <q-tabs
            v-model="uiStore.currentTab"
            align="left"
            class="col-8 q-px-none"
            active-color="text-primary"
            indicator-color="secondary"
            dense
            shrink
            inline-label
            outside-arrows
            mobile-arrows
            @update:model-value="uiStore.setCurrentTab($event)"
          >
            <q-tab v-for="tab in tabs" :key="tab.name" :label="tab.title" :name="tab.name" class="q-px-xs" dense />
          </q-tabs>
          <q-space />
          <q-btn
            v-if="!isWideWidth()"
            flat
            icon="mdi-history"
            class="q-ma-none q-pa-none q-pl-sm q-pr-xs"
            :aria-label="t('ariaLabel.record')"
            @click="router.push('/record')"
          >
            <ToolTip :text="t('openRecordPage')" />
          </q-btn>
          <q-btn
            v-if="!isWideWidth()"
            flat
            icon="settings"
            class="q-ma-none q-pa-none q-pl-xs q-pr-xs"
            :aria-label="t('ariaLabel.settings')"
            @click="navigateToPath('/settings', route, router)"
          >
            <ToolTip :text="t('tooltip.settings')" />
          </q-btn>
        </q-toolbar>

        <!-- 서브 페이지 헤더 -->
        <q-toolbar v-else v-auto-blur class="q-px-sm">
          <q-btn
            flat
            dense
            round
            icon="arrow_back"
            role="button"
            :aria-label="t('ariaLabel.back')"
            @click="router.back()"
          />
          <q-toolbar-title class="text-subtitle1">
            {{ SUB_PAGE_CONFIG[currentSubPage as keyof typeof SUB_PAGE_CONFIG]?.title }}
            <HelpIcon v-if="currentSubPage === 'record' && $g.isMobile" :text="t('tooltip.recordSwipeHelp')" />
          </q-toolbar-title>
          <q-space />
          <q-btn
            v-for="button in SUB_PAGE_CONFIG[currentSubPage as keyof typeof SUB_PAGE_CONFIG]?.buttons"
            :key="button.icon"
            dense
            flat
            size="md"
            class="high-z-index"
            :icon="button.icon"
            role="button"
            :aria-label="t(`ariaLabel.${button.icon}`)"
            :disable="button.disabled as unknown as boolean"
            @click="button.action"
          >
            <ToolTip :text="button.tooltip as unknown as string" />
          </q-btn>
        </q-toolbar>
      </q-header>

      <q-page-container class="row no-padding-bottom">
        <!-- 메인 페이지 컨텐츠 -->
        <template v-if="!isSubPage">
          <q-tab-panels v-model="uiStore.currentTab" animated infinite :swipeable="$g.isMobile">
            <q-tab-panel v-for="(tab, index) in tabs" :key="index" :name="tab.name">
              <component :is="tab.component" />
            </q-tab-panel>
          </q-tab-panels>
        </template>

        <!-- 서브 페이지 컨텐츠 -->
        <template v-else>
          <div class="col-12">
            <q-scroll-area class="sub-scroll-area" :class="{ 'hide-scrollbar': currentSubPage === 'record' }">
              <component
                :is="SUB_PAGE_CONFIG[currentSubPage as keyof typeof SUB_PAGE_CONFIG]?.component"
                class="sub-page"
              />
            </q-scroll-area>
          </div>
        </template>
      </q-page-container>
    </q-layout>

    <!-- 넓은 화면 레이아웃 -->
    <q-layout v-else>
      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        elevated
        :width="250"
        :dark="settingsStore.isDarkMode()"
        :swipe-only="$g.isMobile"
        behavior="mobile"
        @click="leftDrawerOpen = false"
      >
        <q-card class="full-height menu-card">
          <MenuPanel />
        </q-card>
      </q-drawer>

      <q-header id="header" class="z-top noselect row" elevated>
        <!-- 계산기 영역 헤더 -->
        <q-toolbar v-auto-blur class="col-6 calc-header">
          <q-btn flat dense round class="q-mr-sm" icon="menu" aria-label="Menu" @click="toggleLeftDrawer">
            <ToolTip :text="t('tooltip.menu')" />
          </q-btn>
          <q-tabs
            v-model="uiStore.currentTab"
            align="left"
            class="col-grow"
            active-color="text-primary"
            indicator-color="secondary"
            dense
            shrink
            inline-label
            role="tablist"
            :aria-label="t('ariaLabel.mainTabs')"
            @update:model-value="uiStore.setCurrentTab($event)"
          >
            <q-tab
              v-for="tab in tabs"
              :key="tab.name"
              :label="tab.title"
              :name="tab.name"
              class="q-px-xs"
              dense
              role="tab"
              :aria-label="t('ariaLabel.tab', { name: tab.title })"
              :aria-selected="uiStore.currentTab === tab.name"
              :aria-controls="`panel-${tab.name}`"
            />
          </q-tabs>
        </q-toolbar>

        <!-- 서브페이지 영역 헤더 -->
        <q-toolbar v-auto-blur class="col-6 sub-header">
          <transition name="animate-sub-page">
            <div :key="currentSubPage" :data-page="currentSubPage" class="header-content full-width row items-center">
              <q-toolbar-title
                class="text-subtitle1 col-4"
                role="heading"
                :aria-label="t('ariaLabel.subPageTitle', { title: SUB_PAGE_CONFIG[currentSubPage]?.title })"
              >
                {{ SUB_PAGE_CONFIG[currentSubPage]?.title }}
                <HelpIcon
                  v-if="(currentSubPage === 'record' || currentSubPage === '') && $g.isMobile"
                  :text="t('tooltip.recordSwipeHelp')"
                />
              </q-toolbar-title>
              <div class="col-8 row justify-end sub-header-buttons">
                <q-btn
                  v-for="button in SUB_PAGE_BUTTONS"
                  :key="button.label"
                  dense
                  flat
                  size="md"
                  :icon="button.icon"
                  role="button"
                  :aria-label="t('ariaLabel.subPageButton', { label: t(`message.${button.label}`) })"
                  @click="navigateToPath(button.path, route, router)"
                >
                  <ToolTip :text="button.tooltip" />
                </q-btn>
                <!-- <HelpIcon v-if="currentSubPage === 'record' && window.isMobile" :text="t('tooltip.recordSwipeHelp')" /> -->
                <q-separator vertical class="sub-header-separator q-mx-sm" />
                <q-btn
                  v-for="button in SUB_PAGE_CONFIG[currentSubPage]?.buttons"
                  :key="button.icon"
                  dense
                  flat
                  size="md"
                  :icon="button.icon"
                  role="button"
                  :aria-label="t(`ariaLabel.${button.icon}`)"
                  :disable="button.disabled as unknown as boolean"
                  @click="button.action"
                >
                  <ToolTip :text="button.tooltip as unknown as string" />
                </q-btn>
                <q-btn
                  v-if="SUB_PAGE_CONFIG[currentSubPage]?.showClose"
                  class="q-mx-none q-px-none"
                  flat
                  dense
                  round
                  icon="close"
                  role="button"
                  :aria-label="t('ariaLabel.closeSubPage')"
                  @click="switchSubPage('record')"
                />
              </div>
            </div>
          </transition>
        </q-toolbar>
      </q-header>

      <q-page-container class="row" style="padding-bottom: 0px">
        <!-- 계산기 영역 -->
        <div class="col-6 calc-content" role="region" :aria-label="t('ariaLabel.calculatorSection')">
          <q-tab-panels
            v-model="uiStore.currentTab"
            animated
            infinite
            :swipeable="$g.isMobile"
            role="tabpanel"
            :aria-label="t('ariaLabel.calculatorContent')"
          >
            <q-tab-panel
              v-for="(tab, index) in tabs"
              :id="`panel-${tab.name}`"
              :key="index"
              :name="tab.name"
              role="tabpanel"
              :aria-label="t('ariaLabel.tabPanel', { name: tab.title })"
              :aria-labelledby="`tab-${tab.name}`"
            >
              <component :is="tab.component" />
            </q-tab-panel>
          </q-tab-panels>
        </div>

        <!-- 서브페이지 영역 -->
        <div
          class="col-6 relative-position sub-content"
          role="complementary"
          :aria-label="t('ariaLabel.subPageSection')"
        >
          <q-scroll-area
            class="sub-scroll-area"
            :class="{ 'hide-scrollbar': currentSubPage === 'record' }"
            role="region"
            :aria-label="t('ariaLabel.subPageContent')"
          >
            <transition name="animate-sub-page">
              <component
                :is="SUB_PAGE_CONFIG[currentSubPage]?.component"
                :key="currentSubPage"
                :data-page="currentSubPage"
                class="sub-page"
              />
            </transition>
          </q-scroll-area>
        </div>
      </q-page-container>
    </q-layout>

    <ShowTips v-model="uiStore.showTipsDialog" />
  </div>
</template>

<style lang="scss" scoped>
  .main-layout {
    width: 100%;
    height: 100%;
  }

  .q-tab {
    :deep(.q-tab__label) {
      font-size: 16px;
    }
  }

  .q-tab-panel {
    padding: 0px;
  }

  .sub-page {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }

  .animate-sub-page-enter-from[data-page='record'],
  .animate-sub-page-leave-to[data-page='record'] {
    opacity: 0;
  }

  .animate-sub-page-enter-active[data-page='record'],
  .animate-sub-page-leave-active[data-page='record'] {
    transition: opacity 0.3s ease;
  }

  .animate-sub-page-enter-active:not([data-page='record']) {
    animation: slideFromRight 0.3s ease-out;
  }

  .animate-sub-page-leave-active:not([data-page='record']) {
    animation: slideToRight 0.3s ease-out;
  }

  @keyframes slideFromRight {
    from {
      transform: translateX(100%);
    }

    to {
      transform: translateX(0);
    }
  }

  @keyframes slideToRight {
    from {
      transform: translateX(0);
    }

    to {
      transform: translateX(100%);
    }
  }

  .calc-header {
    border-right: 3px solid rgba(255, 255, 255, 0.2);
  }

  .calc-content {
    border-right: 3px solid rgba(0, 0, 0, 0.2);
  }

  .body--dark {
    .calc-content {
      border-right: 3px solid rgba(255, 255, 255, 0.2);
    }

    .sub-header-separator {
      border-right: 3px solid rgba(255, 255, 255, 0.05);
    }
  }

  .sub-header-separator {
    border-right: 3px solid rgba(255, 255, 255, 0.4);
  }

  .sub-scroll-area {
    height: calc(100vh - 50px);
  }

  .hide-scrollbar {
    :deep(.q-scrollarea__thumb) {
      display: none !important;
    }
  }

  .header-content {
    position: absolute;
  }

  // 새로 추가된 클래스
  .menu-card {
    padding-top: 55px;
  }

  .high-z-index {
    z-index: 1000;
  }

  .no-padding-bottom {
    padding-bottom: 0px;
  }

  .sub-header-buttons {
    padding-right: 16px; // q-pr-lg와 동일
  }
</style>

<i18n lang="yaml5">
ko:
  calc: 기본
  unit: 단위
  currency: 환율
  radix: 진법
  tooltipTips: '팁을 표시합니다.'
  openRecordPage: '클릭하면 기록 페이지를 엽니다.'
  tooltipHelp: '도움말을 표시합니다.'
  ariaLabel:
    delete_outline: '모든 기록 삭제'
    back: '이전 페이지로 돌아가기'
    backToRecord: '기록 페이지로 돌아가기'
    mainTabs: '메인 탭 목록'
    tab: '{name} 탭'
    subPageTitle: '{title} 페이지'
    subPageButton: '{label} 버튼'
    closeSubPage: '서브페이지 닫기'
    calculatorSection: '계산기 영역'
    calculatorContent: '계산기 컨텐츠'
    tabPanel: '{name} 탭 패널'
    subPageSection: '서브페이지 영역'
    subPageContent: '서브페이지 컨텐츠'
    tabSelected: '{name} 탭 선택됨'
    tabUnselected: '{name} 탭 선택되지 않음'
    record: '기록 페이지 열기'
    help: '도움말 보기'
  tooltip:
    help: '도움말'
    about: '정보'
    settings: '설정'
    deleteRecord: '모든 기록 삭제'
    search: '검색'
    menu: '메뉴 열기'
    recordSwipeHelp: '기록 페이지에서 왼쪽으로 스와이프하여 메모를 추가,수정하거나 오른쪽으로 스와이프하여 기록을 삭제할 수 있습니다.'
en:
  calc: Basic
  unit: Unit
  currency: Currency
  radix: Radix
  tooltipTips: 'Show tips.'
  openRecordPage: 'Click to open the record page.'
  tooltipHelp: 'Show help.'
  ariaLabel:
    delete_outline: 'Delete all records'
    back: 'Go back to previous page'
    backToRecord: 'Return to record page'
    mainTabs: 'Main tab list'
    tab: '{name} tab'
    subPageTitle: '{title} page'
    subPageButton: '{label} button'
    closeSubPage: 'Close sub page'
    calculatorSection: 'Calculator section'
    calculatorContent: 'Calculator content'
    tabPanel: '{name} tab panel'
    subPageSection: 'Sub page section'
    subPageContent: 'Sub page content'
    tabSelected: '{name} tab selected'
    tabUnselected: '{name} tab unselected'
    record: 'Open record page'
    help: 'View help'
  tooltip:
    help: 'Help'
    about: 'About'
    settings: 'Settings'
    deleteRecord: 'Delete all records'
    search: 'Search'
    menu: 'Open menu'
    recordSwipeHelp: 'You can add, modify, or delete records by swiping left on the record page, or by swiping right to delete the record.'
</i18n>
