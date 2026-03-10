<script setup lang="ts">
  /**
   * @file HelpPage.vue
   * @description 도움말 페이지 - 앱의 기능과 사용법을 섹션별로 구조화하여 표시합니다.
   *              기존 마크다운 콘텐츠를 파싱하여 확장 패널로 구성합니다.
   */

  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { locale, t } = useI18n();

  import HelpMdEn from '../content/pages/HelpPage-en.md';
  import HelpMdKo from '../content/pages/HelpPage-ko.md';
  import HelpMdJa from '../content/pages/HelpPage-ja.md';

  const currentMd = computed(() => {
    const lang = locale.value.substring(0, 2);
    if (lang === 'ko') return HelpMdKo;
    if (lang === 'ja') return HelpMdJa;
    return HelpMdEn;
  });

  interface HelpSection {
    title: string;
    content: string;
    icon: string;
  }

  const sectionIcons = ['star_outline', 'menu_book', 'keyboard'];

  const sections = computed<HelpSection[]>(() => {
    const md = currentMd.value;
    const parts = md.split(/(?=\n## )/m).slice(1);
    return parts.map((part, i) => {
      const trimmed = part.trim();
      const firstNewline = trimmed.indexOf('\n');
      const title = (firstNewline >= 0 ? trimmed.substring(0, firstNewline) : trimmed).replace(/^## /, '').trim();
      const content = firstNewline >= 0 ? trimmed.substring(firstNewline + 1).trim() : '';
      return { title, content, icon: sectionIcons[i] || 'article' };
    });
  });

  // 마크다운에서 intro 텍스트 추출 (h1과 첫 h2 사이)
  const intro = computed(() => {
    const md = currentMd.value;
    const idx = md.indexOf('\n## ');
    const rawIntro = idx >= 0 ? md.substring(0, idx) : md;
    return rawIntro.replace(/^# .+\n+/, '').trim();
  });

  const calculatorIcons = ['calculate', 'straighten', 'currency_exchange', 'memory', 'functions'];
</script>

<template>
  <q-page class="scrollbar-custom">
    <!-- Header -->
    <div class="q-pa-lg q-pb-sm">
      <p class="text-body2 q-mb-none" style="opacity: 0.7">{{ intro }}</p>
    </div>

    <!-- Calculator type chips -->
    <div class="row justify-center q-px-lg q-pb-md q-gutter-xs" style="max-width: 100%">
      <q-chip v-for="(icon, i) in calculatorIcons" :key="i" outline size="md" class="col-3 calc-chip">
        <q-icon :name="icon" size="xs" class="q-mr-xs" />
        {{ t(`calc.${i}`) }}
      </q-chip>
    </div>

    <q-separator />

    <!-- Help sections -->
    <q-list>
      <q-expansion-item
        v-for="(section, i) in sections"
        :key="i"
        :icon="section.icon"
        :label="section.title"
        header-class="text-weight-medium"
        expand-separator
      >
        <q-card flat>
          <q-card-section class="section-content">
            <q-markdown :src="section.content" no-linkify no-heading-anchor-links class="markdown-content" />
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </q-page>
</template>

<style scoped>
  .calc-chip :deep(.q-chip__content) {
    justify-content: center;
  }

  .section-content :deep(h3:first-child),
  .section-content :deep(h4:first-child) {
    margin-top: 0;
  }
</style>

<style>
  .body--dark .markdown-content a {
    color: #7cb7ff !important;
  }
</style>

<i18n lang="yaml">
ko:
  title: '도움말'
  calc:
    '0': '표준'
    '1': '단위'
    '2': '통화'
    '3': '진법'
    '4': '수식'
en:
  title: 'Help'
  calc:
    '0': 'Standard'
    '1': 'Unit'
    '2': 'Currency'
    '3': 'Radix'
    '4': 'Formula'
ja:
  title: 'ヘルプ'
  calc:
    '0': '標準'
    '1': '単位'
    '2': '通貨'
    '3': '進数'
    '4': '数式'
</i18n>
