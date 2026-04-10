<script setup lang="ts">
  /**
   * @file AboutPage.vue
   * @description 앱 소개 페이지 - 앱 정보, 기술 스택, 변경 이력 등을 구조화하여 표시합니다.
   */

  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { version } from '../../package.json';

  const { locale, t } = useI18n();

  import AboutMdEn from '../content/pages/AboutPage-en.md';
  import AboutMdKo from '../content/pages/AboutPage-ko.md';
  import AboutMdJa from '../content/pages/AboutPage-ja.md';
  import AboutMdZh from '../content/pages/AboutPage-zh.md';
  import AboutMdHi from '../content/pages/AboutPage-hi.md';
  import AboutMdDe from '../content/pages/AboutPage-de.md';
  import AboutMdEs from '../content/pages/AboutPage-es.md';
  import AboutMdFr from '../content/pages/AboutPage-fr.md';

  const aboutMdMap: Record<string, string> = {
    ko: AboutMdKo,
    ja: AboutMdJa,
    zh: AboutMdZh,
    hi: AboutMdHi,
    de: AboutMdDe,
    es: AboutMdEs,
    fr: AboutMdFr,
  };

  const currentMd = computed(() => {
    const lang = locale.value.substring(0, 2);
    return aboutMdMap[lang] ?? AboutMdEn;
  });

  const changelog = computed(() => {
    const md = currentMd.value;
    const match = md.match(/## \[[\s\S]*/);
    return match ? match[0] : '';
  });

  const techStack = ['Vue 3', 'Quasar', 'TypeScript', 'Electron', 'Capacitor'];

  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener');
  };
</script>

<template>
  <q-page class="scrollbar-custom">
    <!-- App Header -->
    <div class="column items-center q-pt-xl q-pb-lg q-px-lg">
      <q-avatar size="80px" class="q-mb-md shadow-3" square rounded>
        <img src="/icons/favicon-128x128.png" alt="QCalc" />
      </q-avatar>
      <div class="text-h4 text-weight-bold">Q Calc</div>
      <q-badge color="primary" class="q-mt-xs text-weight-medium" :label="'v' + version" />
      <p class="text-body2 text-center q-mt-md q-mb-none" style="opacity: 0.7; max-width: 360px">
        {{ t('description') }}
      </p>
    </div>

    <!-- Tech Stack -->
    <div class="flex justify-center q-gutter-xs q-pb-lg">
      <q-badge v-for="tech in techStack" :key="tech" outline color="primary" :label="tech" />
    </div>

    <q-separator />

    <!-- Info Section -->
    <q-list>
      <q-item>
        <q-item-section avatar>
          <q-icon name="person" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ t('author') }}</q-item-label>
          <q-item-label caption>Seo Kihyun</q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section avatar>
          <q-icon name="gavel" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ t('license') }}</q-item-label>
          <q-item-label caption>MIT License</q-item-label>
        </q-item-section>
      </q-item>

      <q-item clickable @click="openExternal('mailto:from104@gmail.com')">
        <q-item-section avatar>
          <q-icon name="email" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ t('contact') }}</q-item-label>
          <q-item-label caption>from104@gmail.com</q-item-label>
        </q-item-section>
      </q-item>

      <q-item clickable @click="openExternal('https://github.com/from104/qcalc')">
        <q-item-section avatar>
          <q-icon name="code" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>GitHub</q-item-label>
          <q-item-label caption>from104/qcalc</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="open_in_new" size="16px" />
        </q-item-section>
      </q-item>
    </q-list>

    <q-separator />

    <!-- Changelog -->
    <q-expansion-item icon="history" :label="t('changelog')" header-class="text-weight-medium" expand-separator>
      <q-card flat>
        <q-card-section>
          <q-markdown :src="changelog" no-linkify no-heading-anchor-links class="markdown-content" />
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Footer -->
    <div class="text-center text-caption q-py-md" style="opacity: 0.5">
      Copyright &copy; 2022 Seo Kihyun. All rights reserved.
    </div>
  </q-page>
</template>

<style>
  .body--dark .markdown-content a {
    color: #7cb7ff !important;
  }
</style>

<i18n lang="yaml">
ko:
  description: '현대적인 웹 기술로 만들어진 다목적 계산기입니다. 데스크톱과 모바일 환경 모두에서 사용할 수 있습니다.'
  author: '개발자'
  license: '라이선스'
  contact: '연락처'
  changelog: '변경 이력'
en:
  description: 'A multi-purpose calculator built with modern web technologies. Available on both desktop and mobile platforms.'
  author: 'Developer'
  license: 'License'
  contact: 'Contact'
  changelog: 'Changelog'
ja:
  description: '最新のWeb技術で構築された多目的電卓です。デスクトップとモバイルの両方で利用できます。'
  author: '開発者'
  license: 'ライセンス'
  contact: '連絡先'
  changelog: '変更履歴'
zh:
  description: '使用现代网络技术构建的多功能计算器。可在桌面和移动平台上使用。'
  author: '开发者'
  license: '许可证'
  contact: '联系方式'
  changelog: '更新日志'
hi:
  description: 'आधुनिक वेब तकनीकों से निर्मित बहुउद्देशीय कैलकुलेटर। डेस्कटॉप और मोबाइल दोनों प्लेटफ़ॉर्म पर उपलब्ध।'
  author: 'डेवलपर'
  license: 'लाइसेंस'
  contact: 'संपर्क'
  changelog: 'परिवर्तन लॉग'
de:
  description: 'Ein Mehrzweckrechner mit modernen Webtechnologien. Verfügbar auf Desktop- und Mobilplattformen.'
  author: 'Entwickler'
  license: 'Lizenz'
  contact: 'Kontakt'
  changelog: 'Änderungsprotokoll'
es:
  description: 'Una calculadora multipropósito construida con tecnologías web modernas. Disponible en plataformas de escritorio y móviles.'
  author: 'Desarrollador'
  license: 'Licencia'
  contact: 'Contacto'
  changelog: 'Registro de cambios'
fr:
  description: 'Une calculatrice polyvalente construite avec des technologies web modernes. Disponible sur ordinateur et mobile.'
  author: 'Développeur'
  license: 'Licence'
  contact: 'Contact'
  changelog: 'Journal des modifications'
pt:
  description: 'Uma calculadora multifuncional construída com tecnologias web modernas. Disponível em plataformas desktop e móveis.'
  author: 'Desenvolvedor'
  license: 'Licença'
  contact: 'Contato'
  changelog: 'Registro de alterações'
ru:
  description: 'Многофункциональный калькулятор, созданный с использованием современных веб-технологий. Доступен на настольных и мобильных платформах.'
  author: 'Разработчик'
  license: 'Лицензия'
  contact: 'Контакты'
  changelog: 'Журнал изменений'
</i18n>
