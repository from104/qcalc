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
  import HistoryPage from 'src/pages/HistoryPage.vue';
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
    component: typeof HelpPage | typeof AboutPage | typeof HistoryPage | typeof SettingPage;
    title: string;
    showBackArrow?: boolean;
    buttons?: PageButton[];
  }

  interface PageButton {
    icon: string;
    disabled: ComputedRef<boolean>;
    action: () => void;
  }

  const isHistoryDisabled = computed(() => {
    return store.calc.history.getAllRecords().length === 0 || store.isDeleteHistoryConfirmOpen;
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
    history: {
      component: HistoryPage,
      title: t('message.history'),
      buttons: [
        {
          icon: 'delete_outline',
          disabled: isHistoryDisabled,
          action: () => {
            store.isDeleteHistoryConfirmOpen = true;
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
  const currentSubPage = ref('history');
  const previousSubPage = ref('history');
  const isPageTransitioning = ref(false);

  const switchSubPage = async (pageName: string) => {
    if (currentSubPage.value === pageName) return;

    isPageTransitioning.value = true;
    previousSubPage.value = currentSubPage.value;
    currentSubPage.value = pageName;

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
    currentSubPage.value = route.name as string;
  });

  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
  });
</script>

<template>
  <q-layout view="hHh LpR fFf">
    <q-header class="z-top noselect row" elevated>
      <!-- 계산기 영역 헤더 -->
      <q-toolbar v-blur class="col-6">
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
          <q-tab
            v-for="tab in tabs"
            :key="tab.name"
            :label="tab.title"
            :name="tab.name"
            :disable="store.isSettingDialogOpen"
            class="q-px-xs"
            dense
          />
        </q-tabs>
      </q-toolbar>

      <!-- 서브페이지 영역 헤더 -->
      <q-toolbar v-blur class="col-6 q-px-sm">
        <q-btn
          v-if="SUB_PAGE_CONFIG[currentSubPage]?.showBackArrow"
          flat
          dense
          round
          icon="arrow_forward"
          @click="switchSubPage('history')"
        />
        <q-toolbar-title class="text-h6">
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
          :disable="button.disabled.value"
          @click="button.action"
        />
      </q-toolbar>
    </q-header>

    <q-page-container class="row" style="padding-bottom: 0px">
      <!-- 계산기 영역 -->
      <div class="col-6">
        <q-tab-panels v-model="store.currentTab" animated infinite :swipeable="false">
          <q-tab-panel v-for="(tab, index) in tabs" :key="index" :name="tab.name">
            <component :is="tab.component" />
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <!-- 서브페이지 영역 -->
      <div class="col-6 relative-position">
        <transition
          enter-active-class="animate-sub-page-enter"
          leave-active-class="animate-sub-page-leave"
          @enter="isPageTransitioning = true"
          @after-enter="isPageTransitioning = false"
        >
          <component :is="SUB_PAGE_CONFIG[currentSubPage]?.component" :key="currentSubPage" class="sub-page" />
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
    position: absolute;
    width: 100%;
    height: 100%;
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
</style>

<i18n lang="yaml5">
ko:
  calc: 기본
  unit: 단위
  currency: 환율
  radix: 진법
en:
  calc: Basic
  unit: Unit
  currency: Currency
  radix: Radix
</i18n>
