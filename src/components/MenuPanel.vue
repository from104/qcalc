<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { version } from '../../package.json';

import PathRoute from 'components/PathRoute.vue';
import { useCalcStore } from 'src/stores/calc-store';
import { reactive, watch } from 'vue';

const { t } = useI18n();

const store = useCalcStore();

interface Path {
  title: string;
  caption: string;
  shortcut: string;
  path: string;
  icon: string;
};

const paths: {[key: string]: Path} = reactive({
  help: {
    title: t('path.help.title'),
    caption: t('path.help.caption'),
    shortcut: 'F1',
    icon: 'help',
    path: '/help',
  },
  calc: {
    title: t('path.calc.title'),
    caption: t('path.calc.caption'),
    shortcut: 'F2',
    icon: 'calculate',
    path: '/',
  },
  about: {
    title: t('path.about.title'),
    caption: t('path.about.caption'),
    shortcut: 'F3',
    icon: 'info',
    path: '/about',
  },
});

const { locale } = useI18n({ useScope: 'global' });

watch(locale, () => {
  Object.keys(paths).forEach((path) => {
    paths[path].title = t(`path.${path}.title`);
    paths[path].caption = t(`path.${path}.caption`);
  });
});
</script>

<template>
  <q-list v-blur>
    <q-item-label class="q-mt-xl text-h5" header>
      {{ t('menu') }} (M)
    </q-item-label>
    <PathRoute v-for="path in paths" :key="path.title" v-bind="path" />
  </q-list>
  <q-footer
    :class="'bg-' + store.getDarkColor('primary')"
    class="row items-center q-pa-sm"
  >
    {{ `${t('version')} : ${version}` }}
    <q-space />
  </q-footer>
</template>

<i18n>
ko:
  menu: '메뉴'
  path:
    help:
      title: '도움말'
      caption: '기능과 사용법'
    calc:
      title: '계산기'
      caption: '퀘이사 계산기'
    about:
      title: '소개'
      caption: '앱에 대한 소개'
  version: '버전'
en:
  menu: 'Menu'
  path:
    help:
      title: 'Help'
      caption: 'Features and Usage'
    calc:
      title: 'Calculator'
      caption: 'Quasar Calculator'
    about:
      title: 'About'
      caption: 'About the app'
  version: 'Version'
</i18n>
