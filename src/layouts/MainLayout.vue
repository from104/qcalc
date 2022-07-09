<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import tinykeys, { KeyBindingMap } from 'tinykeys';
import { useRouter } from 'vue-router';

import { version } from '../../package.json';

import { useCalcStore } from 'src/stores/calc-store';
import PathRoute from 'components/PathRoute.vue';

const router = useRouter();

const calcStore = useCalcStore();

const $q = useQuasar();

const paths = [
  { title: '계산기', caption: '간단한 계산기 (Q)', icon: 'calculate', path: '/' },
  { title: '도움말', caption: '기능과 사용법 (H)', icon: 'help', path: '/help' },
  { title: '소개', caption: '앱에 대한 소개 (A)', icon: 'info', path: '/about' },
];

const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const toggleAlwaysOnTop = (byManual = false) => {
  if ($q.platform.is.electron) {
    if (byManual) {
      // 수동으로 토글
      calcStore.toggleAlwaysOnTop();
    }
    window.myAPI.setAlwaysOnTop(calcStore.alwaysOnTop);
  }
};

onMounted(() => {
  const keyBindingMaps: KeyBindingMap = {};

  type Shortcut = [string[], () => void][];

  const shortcuts: Shortcut = [
    [['t'], () => toggleAlwaysOnTop(true)],
    [['F3', 'm'], () => toggleLeftDrawer()],
    [['q'], () => router.push({ path: '/' })],
    [['F1', 'h', '?'], () => router.push({ path: '/help' })],
    [['a'], () => router.push({ path: '/about' })],
  ];

  if ($q.platform.is.electron) {
    window.myAPI.setAlwaysOnTop(calcStore.alwaysOnTop);
  }

  shortcuts.forEach((shortcut) => {
    const [keys, handler] = shortcut;
    keys.forEach((key) => {
      keyBindingMaps[key] = handler;
    });
  });

  tinykeys(window, keyBindingMaps);
});
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar @focusin="($event.target as HTMLInputElement).blur()">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> 간단한 계산기 </q-toolbar-title>
        <q-toggle
          v-if="$q.platform.is.electron"
          v-model="calcStore.alwaysOnTop"
          label="항상 위 (T)"
          left-label
          keep-color
          color="info"
          @click="toggleAlwaysOnTop()"
        />
        <!-- :disable="!$q.platform.is.electron" -->
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label class="text-h5" header> 메뉴 (M) </q-item-label>
        <PathRoute v-for="path in paths" :key="path.title" v-bind="path" />
      </q-list>
      <q-footer class="q-pa-sm"> 버전 : {{ version }} </q-footer>
    </q-drawer>

    <q-page-container style="padding-bottom: 0px">
      <router-view />
    </q-page-container>
  </q-layout>
</template>
