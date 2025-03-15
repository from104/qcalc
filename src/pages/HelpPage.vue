<script setup lang="ts">
  /**
   * @file HelpPage.vue
   * @description 이 파일은 사용자가 도움을 받을 수 있는 페이지를 정의합니다.
   *              이 페이지는 사용자가 애플리케이션의 기능이나 사용 방법에 대한 정보를
   *              Markdown 형식으로 표시합니다. 사용자의 언어 설정에 따라 한국어 또는
   *              영어로 콘텐츠를 제공합니다.
   */

  import { useI18n } from 'vue-i18n';
  const { locale } = useI18n({ useScope: 'global' });

  import HelpPageMD_en from './HelpPage-en.md';
  import HelpPageMD_ko from './HelpPage-ko.md';
</script>

<template>
  <q-page class="scrollbar-custom">
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
