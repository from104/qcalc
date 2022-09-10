<script setup lang="ts">
import { onMounted, onBeforeMount, ref } from 'vue';
import { useQuasar } from 'quasar';
import tinykeys, { KeyBindingMap } from 'tinykeys';
import { useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';

import { useCalcStore } from 'src/stores/calc-store';

import MenuPanel from 'components/MenuPanel.vue';
import SettingPanel from 'components/SettingPanel.vue';
import HeaderIcons from 'components/HeaderIcons.vue';

const router = useRouter();

const store = useCalcStore();

const q = useQuasar();
const { t } = useI18n();

const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
  rightDrawerOpen.value = false;
};

const rightDrawerOpen = ref(false);

const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value;
  leftDrawerOpen.value = false;
};

onMounted(() => {
  const keyBindingMaps: KeyBindingMap = {};

  type Shortcut = [string[], () => void][];

  const shortcuts: Shortcut = [
    [['m'], () => toggleLeftDrawer()],
    [['e'], () => toggleRightDrawer()],
    [['F1', '?'], () => router.push({ path: '/help' })],
    [['F2'], () => router.push({ path: '/' })],
    [['F3'], () => router.push({ path: '/about' })],
  ];

  shortcuts.forEach((shortcut) => {
    const [keys, handler] = shortcut;
    keys.forEach((key) => {
      keyBindingMaps[key] = handler;
    });
  });

  tinykeys(window, keyBindingMaps);

  if (q.platform.is.electron) {
    window.myAPI.setAlwaysOnTop(store.alwaysOnTop);
  }
});

onBeforeMount(() => {
  store.setDarkMode(store.darkMode);
  store.locale = navigator.language;
});
</script>

<template>
  <q-layout view="hHh lpr fff">
    <q-header
      :class="'bg-' + store.getDarkColor('primary')"
      class="z-top noselect"
      elevated
    >
      <q-toolbar v-blur>
        <q-btn
          flat
          dense
          round
          icon="menu"
          :aria-label="t('menu')"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title> {{ t('title') }} </q-toolbar-title>
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
      v-model="leftDrawerOpen"
      :width="200"
      class="noselect"
      side="left"
      elevated
      overlay
      show-if-above
    >
      <MenuPanel />
    </q-drawer>

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

    <q-page-container style="padding-bottom: 0px">
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

<i18n>
ko:
  title: '퀘이사 계산기'
  menu: '메뉴'
  settings: '설정'
en:
  title: 'Quasar Calculator'
  menu: 'Menu'
  settings: 'Settings'
</i18n>

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
