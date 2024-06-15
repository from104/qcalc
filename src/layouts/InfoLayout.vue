<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';

import HelpPage from 'src/pages/HelpPage.vue';
import AboutPage from 'src/pages/AboutPage.vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

const goBackOnEsc = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    router.back();
  }
};

const titleMessage = route.name === 'help' ? 'message.help' : 'message.about';
const Component = route.name === 'help' ? HelpPage : AboutPage;

onMounted(() => {
  window.addEventListener('keydown', goBackOnEsc);
});

onUnmounted(() => {
  window.removeEventListener('keydown', goBackOnEsc);
});

const headerHeight = computed(() => {
  const header = document.getElementById('header');
  if (header) {
    console.log(header.clientHeight);
  }
  return header ? header.clientHeight + 'px' : '0px';
});
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header id="header" class="z-top noselect" elevated>
      <q-toolbar v-blur>
        <q-btn
          flat
          dense
          round
          icon="arrow_back"
          @click="$router.back()"
        />
        <q-toolbar-title>{{ t(titleMessage) }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container style="padding-bottom: 0px;">
      <q-scroll-area id="area">
        <component :is="Component" />
      </q-scroll-area>
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="scss">
#area {
  height: calc(100vh - v-bind('headerHeight')) !important;
}
</style>