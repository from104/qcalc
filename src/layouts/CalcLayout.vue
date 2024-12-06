<script setup lang="ts">
  import { onMounted, reactive, shallowRef, watch } from 'vue';

  // 컴포넌트 가져오기
  import HistoryDialog from 'components/HistoryDialog.vue';
  import SettingDialog from 'components/SettingDialog.vue';
  import HeaderIcons from 'components/HeaderIcons.vue';

  // 페이지 컴포넌트 가져오기
  import CalcPage from 'pages/CalcPage.vue';
  import UnitPage from 'pages/UnitPage.vue';
  import CurrencyPage from 'pages/CurrencyPage.vue';
  import RadixPage from 'pages/RadixPage.vue';

  // Quasar 프레임워크 사용을 위한 설정
  import { useQuasar } from 'quasar';
  const $q = useQuasar();

  // 스토어 가져오기
  import { useStore } from 'src/stores/store';

  const store = useStore();

  // 다국어 지원을 위한 i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // 탭 정보 설정
  const tabs = reactive([
    { name: 'calc', title: t('calc'), component: shallowRef(CalcPage) },
    { name: 'unit', title: t('unit'), component: shallowRef(UnitPage) },
    { name: 'currency', title: t('currency'), component: shallowRef(CurrencyPage) },
    { name: 'radix', title: t('radix'), component: shallowRef(RadixPage) },
  ]);

  // 탭 오른쪽으로 이동하는 함수
  const moveTabRight = () => {
    const currentIndex = tabs.findIndex((tab) => tab.name === store.currentTab);
    const nextTab = tabs[(currentIndex + 1) % tabs.length].name;
    store.setCurrentTab(nextTab);
  };

  // 탭 왼쪽으로 이동하는 함수
  const moveTabLeft = () => {
    const currentIndex = tabs.findIndex((tab) => tab.name === store.currentTab);
    const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length].name;
    store.setCurrentTab(prevTab);
  };

  // 키 바인딩 설정
  import { KeyBinding } from 'classes/KeyBinding';

  const keyBinding = new KeyBinding([
    [['Control+1'], () => store.setCurrentTab('calc')],
    [['Control+2'], () => store.setCurrentTab('unit')],
    [['Control+3'], () => store.setCurrentTab('currency')],
    [['Control+4'], () => store.setCurrentTab('radix')],
    [['Control+Tab', 'ArrowRight'], moveTabRight],
    [['Control+Shift+Tab', 'ArrowLeft'], moveTabLeft],
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

  // 컴포넌트 마운트 시 키 바인딩 활성화
  onMounted(() => {
    keyBinding.subscribe();
  });
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="z-top noselect" elevated>
      <q-toolbar v-blur>
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
        <q-space />
        <HeaderIcons />
      </q-toolbar>
    </q-header>

    <q-page-container style="padding-bottom: 0px">
      <q-tab-panels
        v-model="store.currentTab"
        animated
        infinite
        :swipeable="$q.platform.is.mobile"
      >
        <q-tab-panel v-for="(tab, index) in tabs" :key="index" :name="tab.name">
          <component :is="tab.component" />
        </q-tab-panel>
      </q-tab-panels>
      <SettingDialog />
      <HistoryDialog />
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
