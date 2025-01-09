<script setup lang="ts">
  import { onBeforeUnmount, onMounted, reactive, shallowRef, watch, computed, ref } from 'vue';
  import type { ComputedRef, ShallowRef } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useStore } from 'src/stores/store';
  import { useI18n } from 'vue-i18n';
  import { KeyBinding } from 'classes/KeyBinding';

  // 컴포넌트 가져오기
  import HeaderIcons from 'components/HeaderIcons.vue';

  // 페이지 컴포넌트 가져오기
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
  const store = useStore();
  const { t } = useI18n();

  // 메인 탭 정보 설정
  const tabs = reactive([
    { name: 'calc', title: t('calc'), component: shallowRef(CalcPage) },
    { name: 'unit', title: t('unit'), component: shallowRef(UnitPage) },
    { name: 'currency', title: t('currency'), component: shallowRef(CurrencyPage) },
    { name: 'radix', title: t('radix'), component: shallowRef(RadixPage) },
  ]);

  // 서브 페이지 설정
  interface PageConfig {
    component: ShallowRef<typeof HelpPage | typeof AboutPage | typeof RecordPage | typeof SettingPage>;
    title: string;
    showClose?: boolean;
    buttons?: PageButton[];
  }

  interface PageButton {
    icon: string;
    disabled: ComputedRef<boolean>;
    action: () => void;
  }

  const isRecordDisabled = computed(() => {
    return store.calc.record.getAllRecords().length === 0 || store.isDeleteRecordConfirmOpen;
  });

  const SUB_PAGE_CONFIG = reactive<Record<string, PageConfig>>({
    help: {
      component: shallowRef(HelpPage),
      title: t('message.help'),
      showClose: true,
    },
    about: {
      component: shallowRef(AboutPage),
      title: t('message.about'),
      showClose: true,
    },
    record: {
      component: shallowRef(RecordPage),
      title: t('message.record'),
      buttons: [
        {
          icon: 'search',
          disabled: computed(() => false),
          action: () => {
            store.isSearchOpen = !store.isSearchOpen;
          },
        },
        {
          icon: 'delete_outline',
          disabled: isRecordDisabled,
          action: () => {
            store.isDeleteRecordConfirmOpen = true;
          },
        },
      ],
    },
    settings: {
      component: shallowRef(SettingPage),
      title: t('message.settings'),
      showClose: true,
    },
  });

  // 현재 서브 페이지 관련
  const currentSubPage = ref('record');
  const previousSubPage = ref('record');

  const switchSubPage = async (pageName: string) => {
    if (currentSubPage.value === pageName) return;

    previousSubPage.value = currentSubPage.value;
    currentSubPage.value = pageName;

    // 라우터 히스토리에 페이지 추가
    if (pageName !== 'record') {
      router.push({ name: pageName });
    } else {
      router.back();
    }
  };

  // 현재 페이지가 서브 페이지인지 확인
  const isSubPage = computed(() => {
    return ['help', 'about', 'settings'].includes(String(route.name));
  });

  // 서브 페이지 닫기
  const closeSubPage = () => {
    if (isSubPage.value) {
      switchSubPage('record');
    }
  };

  // 키 바인딩 설정
  const keyBinding = new KeyBinding([
    [['Control+1'], () => store.setCurrentTab('calc')],
    [['Control+2'], () => store.setCurrentTab('unit')],
    [['Control+3'], () => store.setCurrentTab('currency')],
    [['Control+4'], () => store.setCurrentTab('radix')],
    [['Escape'], closeSubPage],
  ]);

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

  // 언어 변경 시 탭 이름 업데이트
  watch(
    () => store.locale,
    () => {
      tabs.forEach((tab) => {
        tab.title = t(tab.name);
      });
      Object.keys(SUB_PAGE_CONFIG).forEach((page) => {
        SUB_PAGE_CONFIG[page]!.title = t(`message.${page}`);
      });
    },
  );

  onMounted(() => {
    keyBinding.subscribe();
    const validPages = ['help', 'about', 'settings'];
    currentSubPage.value = validPages.includes(route.name as string) ? (route.name as string) : 'record';
  });

  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
  });

  const SUB_PAGE_BUTTONS = [
    { label: 'help', icon: 'help_outline', path: '/help' },
    { label: 'about', icon: 'info_outline', path: '/about' },
    { label: 'settings', icon: 'settings', path: '/settings' },
  ];
</script>

<template>
  <q-layout view="hHh LpR fFf">
    <q-header id="header" class="z-top noselect row" elevated>
      <!-- 계산기 영역 헤더 -->
      <q-toolbar v-auto-blur class="col-6 calc-header">
        <q-tabs
          v-model="store.currentTab"
          align="left"
          class="col-grow"
          active-color="text-primary"
          indicator-color="secondary"
          dense
          shrink
          inline-label
          role="tablist"
          :aria-label="t('ariaLabel.mainTabs')"
          @update:model-value="store.setCurrentTab($event)"
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
            :aria-selected="store.currentTab === tab.name"
            :aria-controls="`panel-${tab.name}`"
          />
        </q-tabs>
        <q-space />
        <HeaderIcons />
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
            </q-toolbar-title>
            <div class="col-8 row justify-end q-pr-lg">
              <q-btn
                v-for="button in SUB_PAGE_BUTTONS"
                :key="button.label"
                dense
                flat
                size="md"
                :icon="button.icon"
                role="button"
                :aria-label="t('ariaLabel.subPageButton', { label: t(`message.${button.label}`) })"
                @click="store.navigateToPath(button.path, route, router)"
              />
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
                :disable="button.disabled.value"
                @click="button.action"
              />
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
          v-model="store.currentTab"
          animated
          infinite
          :swipeable="false"
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
      <div class="col-6 relative-position sub-content" role="complementary" :aria-label="t('ariaLabel.subPageSection')">
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
</template>

<style lang="scss" scoped>
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
</style>

<i18n lang="yaml5">
ko:
  calc: 기본
  unit: 단위
  currency: 환율
  radix: 진법
  ariaLabel:
    delete_outline: '모든 기록 삭제'
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
en:
  calc: Basic
  unit: Unit
  currency: Currency
  radix: Radix
  ariaLabel:
    delete_outline: 'Delete all records'
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
</i18n>
