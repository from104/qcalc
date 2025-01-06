<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import MarkdownIt from 'markdown-it';
  import DOMPurify from 'dompurify';
  import { ref, onMounted, watch } from 'vue';
  const { locale } = useI18n({ useScope: 'global' });

  import HelpPageMD_en from './HelpPage-en.md?raw';
  import HelpPageMD_ko from './HelpPage-ko.md?raw';

  const markdownContent = ref('');
  const md = new MarkdownIt({
    html: false,
    linkify: false,
    typographer: true,
  });

  const updateMarkdownContent = () => {
    const mdContent = locale.value.substring(0, 2) === 'ko' ? HelpPageMD_ko : HelpPageMD_en;
    const rendered = md.render(mdContent);
    markdownContent.value = DOMPurify.sanitize(rendered);
  };

  onMounted(() => {
    updateMarkdownContent();
  });

  watch(locale, () => {
    updateMarkdownContent();
  });
</script>

<template>
  <q-page>
    <q-card flat class="q-pa-lg">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="markdown-content" v-html="markdownContent" />
    </q-card>
  </q-page>
</template>

<style>
  .markdown-content {
    /* 헤딩 요소들의 공통 스타일 */
    --heading-font-weight: 700;
  }

  .markdown-content h1,
  .markdown-content h2,
  .markdown-content h3,
  .markdown-content h4,
  .markdown-content h5,
  .markdown-content h6 {
    font-weight: var(--heading-font-weight);
  }

  .markdown-content h1 {
    font-size: 1.8em;
  }

  .markdown-content h2 {
    font-size: 1.5em;
  }

  .markdown-content h3 {
    font-size: 1.2em;
  }

  .markdown-content h4 {
    font-size: 1.1em;
  }

  .markdown-content h5 {
    font-size: 1em;
  }

  .markdown-content h6 {
    font-size: 0.9em;
  }
</style>
