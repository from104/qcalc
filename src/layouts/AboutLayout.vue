<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import AboutPage from 'src/pages/AboutPage.vue';
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
