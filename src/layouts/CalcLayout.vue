<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';


import SettingPanel from 'components/SettingPanel.vue';
import HeaderIcons from 'components/HeaderIcons.vue';

import CalcPage from 'src/pages/CalcPage.vue';
import UnitPage from 'src/pages/UnitPage.vue';
import CurrencyPage from 'src/pages/CurrencyPage.vue';

import CalcHistory from 'components/CalcHistory.vue';

import { useCalcStore } from 'src/stores/calc-store';
const store = useCalcStore();

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const tabs = reactive([
  { name: 'calc', title: t('calc'), component: CalcPage },
  { name: 'unit', title: t('unit'), component: UnitPage },
  { name: 'currency', title: t('currency'), component: CurrencyPage },
]);

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
  rightDrawerOpen.value = false;
};

const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value;
  leftDrawerOpen.value = false;
};

import { KeyBinding } from 'classes/KeyBinding';

const keyBinding = new KeyBinding([
  [['m'], toggleLeftDrawer],
  [['e'], toggleRightDrawer],
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
  { immediate: true }
);

watch(() => store.locale, () => {
  // 언어가 바뀌면 탭 이름도 바꿔줍니다.
  for (const tab of tabs) {
    tab.title = t(tab.name);
  }
});

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
            class="q-px-xs"
            dense
          />
        </q-tabs>
        <q-space />
        <HeaderIcons />
        <q-btn
          class="q-ml-sm"
          flat
          dense
          round
          icon="settings"
          :aria-label="t('settings')"
          @click="toggleRightDrawer"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="rightDrawerOpen"
      :width="200"
      class="noselect"
      side="right"
      elevated
      overlay
      show-if-above
    >
      <SettingPanel />
    </q-drawer>
    <q-page-container class="overflow-hidden" style="padding-bottom: 0px;">
      <q-tab-panels v-model="store.cTab" animated>
        <q-tab-panel v-for="tab in tabs" :key="tab.name" :name="tab.name">
          <component :is="tab.component" />
        </q-tab-panel>
      </q-tab-panels>
      <CalcHistory />
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