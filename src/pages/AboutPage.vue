<script setup lang="ts">
  /**
   * @file AboutPage.vue
   * @description 이 파일은 애플리케이션의 'About' 페이지를 정의합니다.
   *              이 페이지는 사용자가 애플리케이션에 대한 정보를 확인할 수 있도록
   *              Markdown 형식의 콘텐츠를 표시합니다. 
   *              사용자의 언어 설정에 따라 한국어 또는 영어로 콘텐츠를 제공합니다.
   */

  import { useI18n } from 'vue-i18n';
  const { locale } = useI18n({ useScope: 'global' });

  import AboutPageMD_en from './AboutPage-en.md';
  import AboutPageMD_ko from './AboutPage-ko.md';
</script>

<template>
  <q-page class="scrollbar-custom">
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
