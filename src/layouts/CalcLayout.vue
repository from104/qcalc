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
  import { useStoreBase } from 'src/stores/store-base';
  import { useStoreSettings } from 'src/stores/store-settings';
  import { useStoreUtils } from 'src/stores/store-utils';

  const storeBase = useStoreBase();
  const storeSettings = useStoreSettings();
  const storeUtils = useStoreUtils();

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
    const index = tabs.findIndex((tab) => tab.name === storeBase.cTab);
    const newTab = tabs[(index + 1) % tabs.length].name;
    storeBase.setCTab(newTab);
  };

  // 탭 왼쪽으로 이동하는 함수
  const moveTabLeft = () => {
    const index = tabs.findIndex((tab) => tab.name === storeBase.cTab);
    const newTab = tabs[(index - 1 + tabs.length) % tabs.length].name;
    storeBase.setCTab(newTab);
  };

  // 키 바인딩 설정
  import { KeyBinding } from 'classes/KeyBinding';

  const keyBinding = new KeyBinding([
    [['Control+1'], () => storeBase.setCTab('calc')],
    [['Control+2'], () => storeBase.setCTab('unit')],
    [['Control+3'], () => storeBase.setCTab('currency')],
    [['Control+4'], () => storeBase.setCTab('radix')],
    [['Control+Tab', 'ArrowRight'], moveTabRight],
    [['Control+Shift+Tab', 'ArrowLeft'], moveTabLeft],
  ]);

  // 입력 포커스 상태에 따라 키 바인딩 활성화/비활성화
  watch(
    () => storeUtils.inputFocused,
    () => {
      if (storeUtils.inputFocused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
    { immediate: true },
  );

  // 언어 변경 시 탭 이름 업데이트
  watch(
    () => storeSettings.locale,
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
          v-model="storeBase.cTab"
          align="left"
          class="col-8 q-px-none"
          active-color="text-primary"
          indicator-color="secondary"
          dense
          shrink
          inline-label
          outside-arrows
          mobile-arrows
          @update:model-value="storeBase.setCalcRadixByCTab()"
        >
          <q-tab
            v-for="tab in tabs"
            :key="tab.name"
            :label="tab.title"
            :name="tab.name"
            :disable="storeBase.isSettingDialogOpen"
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
        v-model="storeBase.cTab"
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
