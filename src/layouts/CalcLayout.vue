<script setup lang="ts">
  import {onMounted, reactive, shallowRef, watch} from 'vue';

  import HistoryDialog from 'components/HistoryDialog.vue';
  import SettingDialog from 'components/SettingDialog.vue';
  import HeaderIcons from 'components/HeaderIcons.vue';

  import CalcPage from 'pages/CalcPage.vue';
  import UnitPage from 'pages/UnitPage.vue';
  import CurrencyPage from 'pages/CurrencyPage.vue';

  import {useQuasar} from 'quasar';
  const $q = useQuasar();

  import {useCalcStore} from 'src/stores/calc-store';
  const store = useCalcStore();

  import {useI18n} from 'vue-i18n';
  const {t} = useI18n();

  const tabs = reactive([
    {name: 'calc', title: t('calc'), component: shallowRef(CalcPage)},
    {name: 'unit', title: t('unit'), component: shallowRef(UnitPage)},
    {
      name: 'currency',
      title: t('currency'),
      component: shallowRef(CurrencyPage),
    },
  ]);

  // 탭 오른쪽으로 이동
  const moveTabRight = () => {
    const index = tabs.findIndex((tab) => tab.name === store.cTab);
    store.cTab = tabs[(index + 1) % tabs.length].name;
  };

  // 탭 왼쪽으로 이동
  const moveTabLeft = () => {
    const index = tabs.findIndex((tab) => tab.name === store.cTab);
    store.cTab = tabs[(index + tabs.length - 1) % tabs.length].name;
  };

  import {KeyBinding} from 'classes/KeyBinding';

  const keyBinding = new KeyBinding([
    [['Control+1'], () => (store.cTab = 'calc')],
    [['Control+2'], () => (store.cTab = 'unit')],
    [['Control+3'], () => (store.cTab = 'currency')],
    [['Control+Tab', 'ArrowRight'], moveTabRight],
    [['Control+Shift+Tab', 'ArrowLeft'], moveTabLeft],
  ]);

  // inputFocused 값이 바뀌면 키바인딩을 추가하거나 제거합니다.
  watch(
    () => store.inputFocused,
    () => {
      if (store.inputFocused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
    {immediate: true},
  );

  watch(
    () => store.locale,
    () => {
      // 언어가 바뀌면 탭 이름도 바꿔줍니다.
      for (const tab of tabs) {
        tab.title = t(tab.name);
      }
    },
  );

  onMounted(() => {
    keyBinding.subscribe();
  });
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="z-top noselect" elevated>
      <q-toolbar v-blur>
        <q-tabs
          v-model="store.cTab"
          align="left"
          class="col-8 q-px-none"
          active-color="text-primary"
          indicator-color="secondary"
          dense
          shrink
          inline-label
          outside-arrows
          mobile-arrows
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
        v-model="store.cTab"
        animated
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
  calc: 계산기
  unit: 단위변환
  currency: 환율
en: 
  calc: Calculator
  unit: Unit Conversion
  currency: Currency Exchange
</i18n>
