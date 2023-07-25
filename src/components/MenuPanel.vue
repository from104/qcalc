<script setup lang="ts">
import tinykeys, { KeyBindingMap } from 'tinykeys';
import { useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';

import { version } from '../../package.json';

import { useCalcStore } from 'src/stores/calc-store';
import { onMounted, reactive, watch } from 'vue';

import PathRoute from 'components/PathRoute.vue';

const router = useRouter();

const store = useCalcStore();

const { t } = useI18n();

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
    path: '/calc',
  },
  unit: {
    title: t('path.unit.title'),
    caption: t('path.unit.caption'),
    shortcut: 'F3',
    icon: 'swap_vert',
    path: '/unit',
  },
  currency: {
    title: t('path.currency.title'),
    caption: t('path.currency.caption'),
    shortcut: 'F4',
    icon: 'currency_exchange',
    path: '/currency',
  },
  about: {
    title: t('path.about.title'),
    caption: t('path.about.caption'),
    shortcut: 'F5',
    icon: 'info',
    path: '/about',
  },
});

watch([()=>store.useSystemLocale, ()=>store.userLocale], () => {
  Object.keys(paths).forEach((path) => {
    paths[path].title = t(`path.${path}.title`);
    paths[path].caption = t(`path.${path}.caption`);
  });
});

onMounted(() => {
  const keyBindingMaps: KeyBindingMap = {};

  type Shortcut = [string[], () => void][];

  const shortcuts: Shortcut = [
    [['F1', '?'], () => router.push({ path: '/help' })],
    [['F2'], () => router.push({ path: '/calc' })],
    [['F3'], () => router.push({ path: '/unit' })],
    [['F4'], () => router.push({ path: '/currency' })],
    [['F5'], () => router.push({ path: '/about' })],
  ];

  shortcuts.forEach((shortcut) => {
    const [keys, handler] = shortcut;
    keys.forEach((key) => {
      keyBindingMaps[key] = handler;
    });
  });

  tinykeys(window, keyBindingMaps);
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
  path:
    help:
      title: '도움말'
      caption: '기능과 사용법'
    calc:
      title: '계산기'
      caption: '퀘이사 계산기'
    unit:
      title: '단위 변환'
      caption: '단위 변환 계산기'
    currency:
      title: '환율 변환'
      caption: '환율 변환 계산기'
    about:
      title: '소개'
      caption: '앱에 대한 소개'
en:
  path:
    help:
      title: 'Help'
      caption: 'Features and Usage'
    calc:
      title: 'Calculator'
      caption: 'Quasar Calculator'
    unit:
      title: 'Unit Conversion'
      caption: 'Unit Conversion Calculator'
    currency:
      title: 'Currency Conversion'
      caption: 'Currency Conversion Calculator'
    about:
      title: 'About'
      caption: 'About the app'
</i18n>
