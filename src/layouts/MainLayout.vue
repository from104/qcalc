<script setup lang="ts">
import { version } from '../../package.json';
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import tinykeys from 'tinykeys';
import { useCalcStore } from 'src/stores/calc-store';
import PathRoute from 'components/PathRoute.vue';

const calcStore = useCalcStore();

const $q = useQuasar();

const paths = [
  { title: '계산기', caption: '간단한 계산기', icon: 'calculate', path: '/' },
  { title: '도움말', caption: '기능과 사용법', icon: 'help', path: '/help' },
  { title: '소개', caption: '앱에 대한 소개', icon: 'info', path: '/about' },
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
  if ($q.platform.is.electron) {
    window.myAPI.setAlwaysOnTop(useCalcStore().$state.alwaysOnTop);
  }
  tinykeys(window, {
    t: () => {
      toggleAlwaysOnTop(true); // 수동으로 토글
    },
  });
});
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          @focusin="($event.target as HTMLInputElement).blur()"
        />
        <q-toolbar-title> 간단한 계산기 </q-toolbar-title>
        <!-- <div>Quasar v{{ $q.version }}</div> -->
        <!-- <div>{{ $q.screen.width+"x"+$q.screen.height }}</div> -->
        <q-toggle
          v-model="calcStore.alwaysOnTop"
          label="항상 위"
          left-label
          keep-color
          color="info"
          :disable="!$q.platform.is.electron"
          @click="toggleAlwaysOnTop()"
          @focusin="($event.target as HTMLInputElement).blur()"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label class="text-h5" header> 메뉴 (v {{ version }}) </q-item-label>
        <PathRoute v-for="path in paths" :key="path.title" v-bind="path" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
