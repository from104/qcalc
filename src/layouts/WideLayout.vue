<script setup lang="ts">
  import { onBeforeUnmount, onMounted, reactive, shallowRef, watch, computed, ref, ComputedRef } from 'vue';
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
    component: typeof HelpPage | typeof AboutPage | typeof RecordPage | typeof SettingPage;
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

  const SUB_PAGE_CONFIG: Record<string, PageConfig> = {
    help: {
      component: HelpPage,
      title: t('message.help'),
      showClose: true,
    },
    about: {
      component: AboutPage,
      title: t('message.about'),
      showClose: true,
    },
    record: {
      component: RecordPage,
      title: t('message.record'),
      buttons: [
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
      component: SettingPage,
      title: t('message.settings'),
      showClose: true,
    },
  };

  // 현재 서브 페이지 관련
  const currentSubPage = ref('record');
  const previousSubPage = ref('record');

  const switchSubPage = async (pageName: string) => {
    if (currentSubPage.value === pageName) return;

    store.setSubPageAnimating(true);
    previousSubPage.value = currentSubPage.value;
    currentSubPage.value = pageName;

    // 라우터 히스토리에 페이지 추가
    if (pageName !== 'record') {
      router.push({ name: pageName });
    } else {
      router.back();
    }

    // 트랜지션이 끝나면 상태 초기화
    setTimeout(() => {
      store.setSubPageAnimating(false);
    }, 300);
  };

  // 키 바인딩 설정
  const keyBinding = new KeyBinding([
    [['Control+1'], () => store.setCurrentTab('calc')],
    [['Control+2'], () => store.setCurrentTab('unit')],
    [['Control+3'], () => store.setCurrentTab('currency')],
    [['Control+4'], () => store.setCurrentTab('radix')],
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
    <q-header class="z-top noselect row" elevated>
      <!-- 계산기 영역 헤더 -->
      <q-toolbar v-blur class="col-6 calc-header">
        <q-tabs
          v-model="store.currentTab"
          align="left"
          class="col-grow"
          active-color="text-primary"
          indicator-color="secondary"
          dense
          shrink
          inline-label
          @update:model-value="store.setCurrentTab($event)"
        >
          <q-tab v-for="tab in tabs" :key="tab.name" :label="tab.title" :name="tab.name" class="q-px-xs" dense />
        </q-tabs>
        <q-space />
        <HeaderIcons />
      </q-toolbar>

      <!-- 서브페이지 영역 헤더 -->
      <q-toolbar v-blur class="col-6 q-px-none sub-header">
        <transition name="animate-sub-page">
          <div :key="currentSubPage" :data-page="currentSubPage" class="header-content row full-width items-center">
            <q-toolbar-title class="text-subtitle1 q-ml-md">
              {{ SUB_PAGE_CONFIG[currentSubPage]?.title }}
            </q-toolbar-title>
            <q-space />
            <q-btn
              v-for="button in SUB_PAGE_BUTTONS"
              :key="button.label"
              class="q-mx-xs q-px-none"
              dense
              flat
              size="md"
              :icon="button.icon"
              @click="store.navigateToPath(button.path, route, router)"
            />
            <q-separator vertical class="sub-header-separator q-mx-xs q-pl-xs" />
            <q-btn
              v-for="button in SUB_PAGE_CONFIG[currentSubPage]?.buttons"
              :key="button.icon"
              class="q-mr-md"
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
              class="q-mr-md"
              flat
              dense
              round
              icon="close"
              role="button"
              :aria-label="t('ariaLabel.backToRecord')"
              @click="switchSubPage('record')"
            />
          </div>
        </transition>
      </q-toolbar>
    </q-header>

    <q-page-container class="row" style="padding-bottom: 0px">
      <!-- 계산기 영역 -->
      <div class="col-6 calc-content">
        <q-tab-panels v-model="store.currentTab" animated infinite :swipeable="false">
          <q-tab-panel v-for="(tab, index) in tabs" :key="index" :name="tab.name">
            <component :is="tab.component" />
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <!-- 서브페이지 영역 -->
      <div class="col-6 relative-position sub-content">
        <q-scroll-area class="sub-scroll-area" :class="{ 'hide-scrollbar': currentSubPage === 'record' }">
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
en:
  calc: Basic
  unit: Unit
  currency: Currency
  radix: Radix
  ariaLabel:
    delete_outline: 'Delete all records'
    backToRecord: 'Return to record page'
</i18n>
