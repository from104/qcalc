<script setup lang="ts">
  import { onBeforeUnmount, onMounted, reactive, shallowRef, watch, computed, type ComputedRef } from 'vue';
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
  interface PageButton {
    icon: string;
    disabled: ComputedRef<boolean>;
    action: () => void;
  }

  interface PageConfig {
    component: typeof HelpPage | typeof AboutPage | typeof RecordPage | typeof SettingPage;
    buttons?: PageButton[];
  }

  const isRecordDisabled = computed(() => {
    return store.calc.record.getAllRecords().length === 0 || store.isDeleteRecordConfirmOpen;
  });

  const SUB_PAGE_CONFIG: Record<string, PageConfig> = {
    help: { component: HelpPage },
    about: { component: AboutPage },
    record: {
      component: RecordPage,
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
    settings: { component: SettingPage },
  };

  // 현재 페이지가 서브 페이지인지 확인
  const isSubPage = computed(() => {
    return ['help', 'about', 'record', 'settings'].includes(String(route.name));
  });

  // 현재 서브 페이지 컴포넌트
  const CurrentSubPageComponent = computed(() => {
    return SUB_PAGE_CONFIG[route.name as keyof typeof SUB_PAGE_CONFIG]?.component ?? null;
  });

  // 탭 이동 함수들
  const moveTabRight = () => {
    const currentIndex = tabs.findIndex((tab) => tab.name === store.currentTab);
    const nextTab = tabs[(currentIndex + 1) % tabs.length].name;
    store.setCurrentTab(nextTab);
  };

  const moveTabLeft = () => {
    const currentIndex = tabs.findIndex((tab) => tab.name === store.currentTab);
    const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length].name;
    store.setCurrentTab(prevTab);
  };

  // 키 바인딩 설정
  const keyBinding = new KeyBinding([
    [['Control+1'], () => store.setCurrentTab('calc')],
    [['Control+2'], () => store.setCurrentTab('unit')],
    [['Control+3'], () => store.setCurrentTab('currency')],
    [['Control+4'], () => store.setCurrentTab('radix')],
    [['Control+Tab', 'ArrowRight'], moveTabRight],
    [['Control+Shift+Tab', 'ArrowLeft'], moveTabLeft],
    [
      ['Escape'],
      () => {
        if (isSubPage.value) router.back();
      },
    ],
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

  // 언어 변경 시 탭 이름 업데이트
  watch(
    () => store.locale,
    () => {
      tabs.forEach((tab) => {
        tab.title = t(tab.name);
      });
    },
  );

  onMounted(() => {
    keyBinding.subscribe();
  });

  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
  });
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="z-top noselect" elevated>
      <!-- 서브 페이지 헤더 -->
      <q-toolbar v-if="isSubPage" v-blur class="q-px-sm">
        <q-btn flat dense round icon="arrow_back" @click="router.back()" />
        <q-toolbar-title class="text-subtitle1">{{ t(`message.${String(route.name)}`) }}</q-toolbar-title>
        <q-space />
        <q-btn
          v-for="button in SUB_PAGE_CONFIG[route.name as keyof typeof SUB_PAGE_CONFIG]?.buttons"
          :key="button.icon"
          dense
          flat
          size="md"
          style="z-index: 1000"
          :icon="button.icon"
          :disable="button.disabled.value"
          @click="button.action"
        />
      </q-toolbar>

      <!-- 메인 페이지 헤더 -->
      <q-toolbar v-else v-blur>
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
    </q-header>

    <q-page-container style="padding-bottom: 0px">
      <!-- 서브 페이지 컨텐츠 -->
      <template v-if="isSubPage">
        <q-scroll-area style="height: 100vh">
          <component :is="CurrentSubPageComponent" />
        </q-scroll-area>
      </template>

      <!-- 메인 페이지 컨텐츠 -->
      <template v-else>
        <q-tab-panels v-model="store.currentTab" animated infinite :swipeable="$q.platform.is.mobile">
          <q-tab-panel v-for="(tab, index) in tabs" :key="index" :name="tab.name">
            <component :is="tab.component" />
          </q-tab-panel>
        </q-tab-panels>
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
