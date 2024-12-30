<script setup lang="ts">
  import { onBeforeUnmount, onMounted, reactive, shallowRef, watch, computed, ref, ComputedRef } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useQuasar } from 'quasar';
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
  const $q = useQuasar();
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
    showBackArrow?: boolean;
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
      showBackArrow: true,
    },
    about: {
      component: AboutPage,
      title: t('message.about'),
      showBackArrow: true,
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
      showBackArrow: true,
    },
  };

  // 현재 서브 페이지 관련
  const currentSubPage = ref('record');
  const previousSubPage = ref('record');
  const isPageTransitioning = ref(false);

  const switchSubPage = async (pageName: string) => {
    if (currentSubPage.value === pageName) return;

    isPageTransitioning.value = true;
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
      isPageTransitioning.value = false;
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
      <q-toolbar v-blur class="col-6 q-px-md sub-header">
        <q-toolbar-title class="text-subtitle1">
          {{ SUB_PAGE_CONFIG[currentSubPage]?.title }}
        </q-toolbar-title>
        <q-space />
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
          v-if="SUB_PAGE_CONFIG[currentSubPage]?.showBackArrow"
          class="q-ma-none q-pa-none"
          flat
          dense
          round
          icon="arrow_forward"
          role="button"
          :aria-label="t('ariaLabel.backToRecord')"
          @click="switchSubPage('record')"
        />
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
        <transition
          enter-active-class="animate-sub-page-enter"
          leave-active-class="animate-sub-page-leave"
          @enter="isPageTransitioning = true"
          @after-enter="isPageTransitioning = false"
        >
          <q-scroll-area class="sub-scroll-area" :class="{ 'hide-scrollbar': currentSubPage === 'record' }">
            <component :is="SUB_PAGE_CONFIG[currentSubPage]?.component" :key="currentSubPage" class="sub-page" />
          </q-scroll-area>
        </transition>
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
    min-height: 100%;
    position: relative;
  }

  .animate-sub-page-enter {
    animation: slideFromRight 0.3s ease-out;
  }

  .animate-sub-page-leave {
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
  }

  .sub-scroll-area {
    height: calc(100vh - 50px);
  }

  .hide-scrollbar {
    :deep(.q-scrollarea__thumb) {
      display: none !important;
    }
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
