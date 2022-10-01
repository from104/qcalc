<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import tinykeys, { KeyBindingMap } from 'tinykeys';
import { useI18n } from 'vue-i18n';

import { useCalcStore } from 'src/stores/calc-store';

import MenuPanel from 'components/MenuPanel.vue';
import SettingPanel from 'components/SettingPanel.vue';
import HeaderIcons from 'components/HeaderIcons.vue';

const store = useCalcStore();

const { t } = useI18n();

const q = useQuasar();

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
  ];

  shortcuts.forEach((shortcut) => {
    const [keys, handler] = shortcut;
    keys.forEach((key) => {
      keyBindingMaps[key] = handler;
    });
  });

  tinykeys(window, keyBindingMaps);
});

const windowWidth = computed(() => q.screen.width);
const windowHeight = computed(() => q.screen.height);

watch([windowWidth, windowHeight], () => {
  store.windowWidth = q.screen.width;
  store.windowHeight = q.screen.height;
  // console.log('watch', q.screen.width, q.screen.height);
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
        <q-toolbar-title> {{ t('appTitle') }} </q-toolbar-title>
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
