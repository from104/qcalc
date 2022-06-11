<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          Simple Calc by Quasar
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
        <!-- <div>{{ $q.screen.width+"x"+$q.screen.height }}</div> -->
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          Essential Links
        </q-item-label>

        <PathRoute v-for="path in paths" :key="path.title" v-bind="path" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import PathRoute from 'components/PathRoute.vue';

const paths = [
  {
    title: 'Calculator',
    caption: 'Simple calculator',
    icon: 'calculate',
    path: '/'
  },
  {
    title: 'Help',
    caption: 'How to use',
    icon: 'help',
    path: '/help'
  },
  {
    title: 'About',
    caption: 'About this app',
    icon: 'info',
    path: '/about'
  },
];

export default defineComponent({
  name: 'MainLayout',

  components: {
    PathRoute,
  },

  setup () {
    const leftDrawerOpen = ref(false)

    return {
      paths,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
});
</script>
