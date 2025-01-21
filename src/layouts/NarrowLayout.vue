<script setup lang="ts">
  import { onBeforeUnmount, onMounted, reactive, shallowRef, watch, computed, type ComputedRef } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useQuasar } from 'quasar';
  import { useStore } from 'src/stores/store';
  import { useI18n } from 'vue-i18n';
  import { KeyBinding } from 'classes/KeyBinding';

  // 컴포넌트 가져오기
  import HeaderIcons from 'components/HeaderIcons.vue';
  import ToolTip from 'components/snippets/ToolTip.vue';
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
    { name: 'calc', title: computed(() => t('calc')), component: shallowRef(CalcPage) },
    { name: 'unit', title: computed(() => t('unit')), component: shallowRef(UnitPage) },
    { name: 'currency', title: computed(() => t('currency')), component: shallowRef(CurrencyPage) },
    { name: 'radix', title: computed(() => t('radix')), component: shallowRef(RadixPage) },
  ]);

  // 서브 페이지 설정

  interface SubPageConfig {
    [key: string]: {
      component: ReturnType<typeof shallowRef>;
      title: ComputedRef<string>;
      buttons?: {
        icon: string;
        disabled: ComputedRef<boolean>;
        action: () => void;
        tooltip: ComputedRef<string>;
      }[];
    };
  }

  const isRecordDisabled = computed(() => {
    return store.calc.record.getAllRecords().length === 0 || store.isDeleteRecordConfirmOpen;
  });

  const SUB_PAGE_CONFIG = reactive<SubPageConfig>({
    help: {
      component: shallowRef(HelpPage),
      title: computed(() => t('message.help')),
    },
    about: {
      component: shallowRef(AboutPage),
      title: computed(() => t('message.about')),
    },
    record: {
      component: shallowRef(RecordPage),
      title: computed(() => t('message.record')),
      buttons: [
        {
          icon: 'search',
          disabled: computed(() => false),
          action: () => {
            store.isSearchOpen = !store.isSearchOpen;
          },
          tooltip: computed(() => t('tooltip.search')),
        },
        {
          icon: 'delete_outline',
          disabled: isRecordDisabled,
          action: () => {
            store.isDeleteRecordConfirmOpen = true;
          },
          tooltip: computed(() => t('tooltip.deleteRecord')),
        },
      ],
    },
    settings: {
      component: shallowRef(SettingPage),
      title: computed(() => t('message.settings')),
    },
  });

  // 현재 페이지가 서브 페이지인지 확인
  const isSubPage = computed(() => {
    return Object.keys(SUB_PAGE_CONFIG).includes(String(route.name));
  });

  // 현재 서브 페이지 컴포넌트
  const CurrentSubPageComponent = computed(() => {
    return SUB_PAGE_CONFIG[currentSubPage.value as keyof typeof SUB_PAGE_CONFIG]?.component ?? null;
  });

  // 탭 이동 함수들
  const moveTabRight = () => {
    const currentIndex = tabs.findIndex((tab) => tab.name === store.currentTab);
    const nextTab = tabs[(currentIndex + 1) % tabs.length]?.name;
    if (nextTab) {
      store.setCurrentTab(nextTab);
    }
  };

  const moveTabLeft = () => {
    const currentIndex = tabs.findIndex((tab) => tab.name === store.currentTab);
    const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length]?.name;
    if (prevTab) {
      store.setCurrentTab(prevTab);
    }
  };

  // 서브 페이지 닫기
  const closeSubPage = () => {
    if (isSubPage.value) {
      router.back();
    }
  };

  // 키 바인딩 설정
  const keyBinding = new KeyBinding([
    [['Control+1'], () => store.setCurrentTab('calc')],
    [['Control+2'], () => store.setCurrentTab('unit')],
    [['Control+3'], () => store.setCurrentTab('currency')],
    [['Control+4'], () => store.setCurrentTab('radix')],
    [['Control+Tab', 'ArrowRight'], moveTabRight],
    [['Control+Shift+Tab', 'ArrowLeft'], moveTabLeft],
    [['Escape'], closeSubPage],
  ]);

  // 입력 포커스 상태에 따라 키 바인딩 활성화/비활성화
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
  });

  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
  });

  const currentSubPage = computed(() => {
    return route.name;
  });
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header id="header" class="z-top noselect" elevated>
      <!-- 메인 페이지 헤더 -->
      <q-toolbar v-if="!isSubPage" v-auto-blur>
        <q-tabs
          v-model="store.currentTab"
          align="left"
          class="col-8 q-px-none"
          active-color="text-primary"
          indicator-color="secondary"
          dense
          shrink
          inline-label
          outside-arrows
          mobile-arrows
          @update:model-value="store.setCurrentTab($event)"
        >
          <q-tab v-for="tab in tabs" :key="tab.name" :label="tab.title" :name="tab.name" class="q-px-xs" dense />
        </q-tabs>
        <q-space />
        <HeaderIcons />
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
        <q-toolbar-title class="text-subtitle1">{{ SUB_PAGE_CONFIG[currentSubPage as keyof typeof SUB_PAGE_CONFIG]?.title }}</q-toolbar-title>
        <q-space />
        <q-btn
          v-for="button in SUB_PAGE_CONFIG[currentSubPage as keyof typeof SUB_PAGE_CONFIG]?.buttons"
          :key="button.icon"
          dense
          flat
          size="md"
          style="z-index: 1000"
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

    <q-page-container class="row" style="padding-bottom: 0px">
      <!-- 메인 페이지 컨텐츠 -->
      <template v-if="!isSubPage">
        <q-tab-panels v-model="store.currentTab" animated infinite :swipeable="$q.platform.is.mobile">
          <q-tab-panel v-for="(tab, index) in tabs" :key="index" :name="tab.name">
            <component :is="tab.component" />
          </q-tab-panel>
        </q-tab-panels>
      </template>

      <!-- 서브 페이지 컨텐츠 -->
      <template v-else>
        <div class="col-12">
          <q-scroll-area class="sub-scroll-area" :class="{ 'hide-scrollbar': currentSubPage === 'record' }">
            <component :is="CurrentSubPageComponent" class="sub-page" />
          </q-scroll-area>
        </div>
      </template>
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

  .sub-scroll-area {
    height: calc(100vh - 50px);
  }

  .hide-scrollbar {
    :deep(.q-scrollarea__thumb) {
      display: none !important;
    }
  }

  .sub-page {
    max-width: 100vw;
  }
</style>

<i18n lang="yaml5">
ko:
  calc: 기본
  unit: 단위
  currency: 환율
  radix: 진법
  ariaLabel:
    back: '이전 페이지로 돌아가기'
    delete_outline: '모든 기록 삭제'
  tooltip:
    search: '검색'
    deleteRecord: '모든 기록 삭제'
en:
  calc: Basic
  unit: Unit
  currency: Currency
  radix: Radix
  ariaLabel:
    back: 'Go back to previous page'
    delete_outline: 'Delete all records'
  tooltip:
    search: 'Search'
    deleteRecord: 'Delete all records'
</i18n>
