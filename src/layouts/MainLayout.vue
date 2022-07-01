<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import tinykeys from 'tinykeys';
import { useCalcStore } from 'src/stores/calc-store';
import PathRoute from 'components/PathRoute.vue';

const $q = useQuasar();

const paths = [
  { title: 'Calculator', caption: 'Simple calculator', icon: 'calculate', path: '/', },
  { title: 'Help', caption: 'How to use', icon: 'help', path: '/help', },
  { title: 'About', caption: 'About this app', icon: 'info', path: '/about', },
];

const leftDrawerOpen = ref(false);
const alwaysOnTop = ref(useCalcStore().$state.alwaysOnTop);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const toggleAlwaysOnTop = (byManual = false) => {
  if ($q.platform.is.electron) {
    if (byManual) { // 수동으로 토글
      alwaysOnTop.value = !alwaysOnTop.value;
    }
    useCalcStore().$state.alwaysOnTop = alwaysOnTop.value;
    window.myAPI.setAlwaysOnTop(alwaysOnTop.value);
  }
}

onMounted(() => {
  if ($q.platform.is.electron) {
    window.myAPI.setAlwaysOnTop(useCalcStore().$state.alwaysOnTop);
  };
  tinykeys(window, {
    't': () => {
      toggleAlwaysOnTop(true); // 수동으로 토글
    }
  });
});
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer"
          @focusin="($event.target as HTMLInputElement).blur()" />
        <q-toolbar-title> Simple Calculator </q-toolbar-title>
        <!-- <div>Quasar v{{ $q.version }}</div> -->
        <!-- <div>{{ $q.screen.width+"x"+$q.screen.height }}</div> -->
        <q-toggle v-model="alwaysOnTop" label="on top" left-label keep-color color="info"
          :disable="!$q.platform.is.electron" @click="toggleAlwaysOnTop()"
          @focusin="($event.target as HTMLInputElement).blur()" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Menus </q-item-label>
        <PathRoute v-for="path in paths" :key="path.title" v-bind="path" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
