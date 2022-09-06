<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { version } from '../../package.json';

import PathRoute from 'components/PathRoute.vue';
import { useCalcStore } from 'src/stores/calc-store';

const { t } = useI18n();

const store = useCalcStore();

const paths = [
  {
    title: '계산기',
    caption: '퀘이사 계산기 (F2)',
    icon: 'calculate',
    path: '/',
  },
  {
    title: '도움말',
    caption: '기능과 사용법 (F1)',
    icon: 'help',
    path: '/help',
  },
  {
    title: '소개',
    caption: '앱에 대한 소개 (F3)',
    icon: 'info',
    path: '/about',
  },
];
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
  version: '버전'
en:
  menu: 'Menu'
  version: 'Version'

</i18n>
