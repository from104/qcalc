<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import AboutPage from 'src/pages/AboutPage.vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { useRouter } from 'vue-router';
const router = useRouter();

const goBackOnEsc = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    router.back();
  }
};

onMounted(() => {
  window.addEventListener('keydown', goBackOnEsc);
});

onUnmounted(() => {
  window.removeEventListener('keydown', goBackOnEsc);
});
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="z-top noselect" elevated>
      <q-toolbar v-blur>
        <q-btn
          flat
          dense
          round
          icon="arrow_back"
          :aria-label="t('message.about')"
          @click="$router.back()"
        />
        <q-toolbar-title>{{ t('message.about') }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container style="padding-bottom: 0px;">
      <AboutPage />
    </q-page-container>
  </q-layout>
</template>