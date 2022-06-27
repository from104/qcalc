<script setup lang="ts">
import { onMounted, ref } from 'vue';
//import { ipcRenderer } from 'electron';
import { useCalcStore } from 'src/stores/calc-store';
import PathRoute from 'components/PathRoute.vue';

const paths = [
  {
    title: 'Calculator',
    caption: 'Simple calculator',
    icon: 'calculate',
    path: '/',
  },
  {
    title: 'Help',
    caption: 'How to use',
    icon: 'help',
    path: '/help',
  },
  {
    title: 'About',
    caption: 'About this app',
    icon: 'info',
    path: '/about',
  },
];

const leftDrawerOpen = ref(false);
const alwaysOnTop = ref(useCalcStore().$state.alwaysOnTop);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const toggleAlwaysOnTop = () => {
  // alwaysOnTop.value = !alwaysOnTop.value;
  useCalcStore().$state.alwaysOnTop = alwaysOnTop.value;
  window.myAPI.setAlwaysOnTop(alwaysOnTop.value);
  // console.log('alwaysOnTop: ' + alwaysOnTop.value);
}

onMounted(() => {
  window.myAPI.setAlwaysOnTop(useCalcStore().$state.alwaysOnTop);
});
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Simple Calc </q-toolbar-title>

        <!-- <div>Quasar v{{ $q.version }}</div> -->
        <!-- <div>{{ $q.screen.width+"x"+$q.screen.height }}</div> -->
        <!-- -->
        <q-toggle v-model="alwaysOnTop" label="on top" left-label keep-color color="info"
          :disable="!$q.platform.is.desktop" @click="toggleAlwaysOnTop()" />
      </q-toolbar>

    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <PathRoute v-for="path in paths" :key="path.title" v-bind="path" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>

</template>

