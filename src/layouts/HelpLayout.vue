<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

import HelpPage from 'src/pages/HelpPage.vue';

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
          :aria-label="t('message.help')"
          @click="$router.back()"
        />
        <q-toolbar-title>{{ t('message.help') }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container style="padding-bottom: 0px;">
      <HelpPage />
    </q-page-container>
  </q-layout>
</template>
