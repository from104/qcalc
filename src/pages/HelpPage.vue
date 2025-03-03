<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  const { locale } = useI18n({ useScope: 'global' });

  import HelpPageMD_en from './HelpPage-en.md';
  import HelpPageMD_ko from './HelpPage-ko.md';
</script>

<template>
  <q-page>
    <q-card flat class="q-pa-lg">
      <q-markdown
        :src="locale.substring(0, 2) == 'ko' ? HelpPageMD_ko : HelpPageMD_en"
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
