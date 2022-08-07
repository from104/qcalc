<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import tinykeys, { KeyBindingMap } from 'tinykeys';
import { useRouter } from 'vue-router';

import { version } from '../../package.json';

import { useCalcStore } from 'src/stores/calc-store';
import PathRoute from 'components/PathRoute.vue';

const router = useRouter();

const store = useCalcStore();

// 시스템 로케일
store.locale = navigator.language;

const $q = useQuasar();

const paths = [
  {
    title: '계산기',
    caption: '간단한 계산기 (F2)',
    icon: 'calculate',
    path: '/',
  },
  {
    title: '도움말',
    caption: '기능과 사용법 (F1)',
    icon: 'help',
    path: '/help',
  },
  {
    title: '소개',
    caption: '앱에 대한 소개 (F3)',
    icon: 'info',
    path: '/about',
  },
];

const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const toggleAlwaysOnTop = (byManual = false) => {
  if ($q.platform.is.electron) {
    if (byManual) {
      // 수동으로 토글
      store.toggleAlwaysOnTop();
    }
    window.myAPI.setAlwaysOnTop(store.alwaysOnTop);
  }
};

onMounted(() => {
  const keyBindingMaps: KeyBindingMap = {};

  type Shortcut = [string[], () => void][];

  const shortcuts: Shortcut = [
    [['t'], () => toggleAlwaysOnTop(true)],
    [['m'], () => toggleLeftDrawer()],
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

  if ($q.platform.is.electron) {
    window.myAPI.setAlwaysOnTop(store.alwaysOnTop);
  }
});
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="noselect" elevated>
      <q-toolbar @focusin="($event.target as HTMLElement).blur()">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title> 간단한 계산기 </q-toolbar-title>
        <q-toggle
          v-if="$q.platform.is.electron"
          v-model="store.alwaysOnTop"
          label="항상 위 (T)"
          left-label
          keep-color
          color="info"
          @click="toggleAlwaysOnTop()"
        />
        <!-- :disable="!$q.platform.is.electron" -->
      </q-toolbar>
    </q-header>

    <q-drawer
      class="noselect"
      style="z-index: 20"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label class="text-h5" header> 메뉴 (M) </q-item-label>
        <PathRoute v-for="path in paths" :key="path.title" v-bind="path" />
      </q-list>
      <q-footer class="q-pa-sm"> 버전 : {{ version }} </q-footer>
    </q-drawer>

    <q-page-container style="padding-bottom: 0px">
      <!-- 트랜지션 적용 전 -->
      <!-- <router-view /> -->
      <!-- 트랜지션 적용 후 -->
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
