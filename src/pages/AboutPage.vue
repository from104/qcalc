<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  const { locale } = useI18n({ useScope: 'global' });

  import AboutPageMD_en from './AboutPage-en.md';
  import AboutPageMD_ko from './AboutPage-ko.md';
</script>

<template>
  <q-page>
    <q-card flat class="q-pa-lg">
      <q-markdown
        :src="locale.substring(0, 2) == 'ko' ? AboutPageMD_ko : AboutPageMD_en"
        no-linkify
        no-heading-anchor-links
        class="markdown-content"
      />
    </q-card>
  </q-page>
</template>

<style>
  .body--dark .markdown-content a {
    color: #7cb7ff !important; /* 다크모드에서 밝은 파란색 링크 */
  }
</style>
