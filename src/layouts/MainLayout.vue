<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useCalcStore } from 'src/stores/calc-store';

import MenuPanel from 'components/MenuPanel.vue';
import SettingPanel from 'components/SettingPanel.vue';
import HeaderIcons from 'components/HeaderIcons.vue';

const store = useCalcStore();

const { t } = useI18n();

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

const title = ref('');

const updateTitle = (newTitle: string) => {
  title.value = newTitle;
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

onMounted(() => {
  keyBinding.subscribe();
});

const cTab = ref(store.initialPath.slice(1));
const tabs = [
  { name: 'calc', title: t('calc'), to: '/calc' },
  { name: 'unit', title: t('unit'), to: '/unit' },
  { name: 'currency', title: t('currency'), to: '/currency' },
];
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="z-top noselect" elevated>
      <q-toolbar v-blur>
        <q-tabs
          v-model="cTab"
          align="left"
          class="q-px-xs"
          active-color="secondary"
          indicator-color="info"
          dense
        >
          <q-route-tab
            v-for="tab in tabs"
            :key="tab.name"
            :label="tab.title"
            :to="tab.to"
          />
        </q-tabs>
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
    <q-page-container style="padding-bottom: 0px;">
      <router-view v-slot="{ Component }">
        <transition name="slide-fade" mode="out-in" appear>
          <div :key="$route.path">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
</style>
