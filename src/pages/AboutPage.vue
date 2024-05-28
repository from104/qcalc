<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import AboutPageMD_en from './AboutPage-en.md';
import AboutPageMD_ko from './AboutPage-ko.md';

const { locale } = useI18n({ useScope: 'global' });
</script>

<template>
  <q-page>
    <q-card flat class="q-pa-lg">
      <q-markdown
        :src="locale.substring(0, 2) == 'ko' ? AboutPageMD_ko : AboutPageMD_en"
        no-linkify
        no-heading-anchor-links
      />
    </q-card>
  </q-page>
</template>
