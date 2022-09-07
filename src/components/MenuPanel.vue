<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { version } from '../../package.json';

import PathRoute from 'components/PathRoute.vue';
import { useCalcStore } from 'src/stores/calc-store';
import { reactive, watch } from 'vue';

const { t } = useI18n();

const store = useCalcStore();

const paths = reactive([
  {
    title: t('path.title.계산기'),
    caption: t('path.caption.계산기')+' (F2)',
    icon: 'calculate',
    path: '/',
  },
  {
    title: t('path.title.도움말'),
    caption: t('path.caption.도움말')+' (F1)',
    icon: 'help',
    path: '/help',
  },
  {
    title: t('path.title.소개'),
    caption: t('path.caption.소개')+' (F3)',
    icon: 'info',
    path: '/about',
  },
]);

const { locale } = useI18n({ useScope: 'global' });

watch(locale, () => {
  paths[0].title = t('path.title.계산기');
  paths[0].caption = t('path.caption.계산기')+' (F2)';
  paths[1].title = t('path.title.도움말');
  paths[1].caption = t('path.caption.도움말')+' (F1)';
  paths[2].title = t('path.title.소개');
  paths[2].caption = t('path.caption.소개')+' (F3)';
});
</script>

<template>
  <q-list>
    <q-item-label class="q-mt-xl text-h5" header> {{ t('menu') }} (M) </q-item-label>
    <PathRoute v-for="path in paths" :key="path.title" v-bind="path" />
  </q-list>
  <q-footer
    :class="'bg-' + store.getDarkColor('primary')"
    class="row items-center q-pa-sm"
  >
    {{ `${t('version')} : ${version}`}}
    <q-space />
  </q-footer>
</template>

<i18n>
ko:
  menu: '메뉴'
  path:
    title:
      계산기: '계산기'
      도움말: '도움말'
      소개: '소개'
    caption:
      계산기: '퀘이사 계산기)'
      도움말: '기능과 사용법'
      소개: '앱에 대한 소개'
  version: '버전'
en:
  menu: 'Menu'
  path:
    title:
      계산기: 'Calculator'
      도움말: 'Help'
      소개: 'About'
    caption:
      계산기: 'Quasar Calculator'
      도움말: 'Features and Usage'
      소개: 'About this app'
  version: 'Version'

</i18n>
