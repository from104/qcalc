<script setup lang="ts">
import { useRouter,useRoute } from 'vue-router';

import { useI18n } from 'vue-i18n';

import { version } from '../../package.json';

import { useCalcStore } from 'src/stores/calc-store';
import { onMounted, reactive, watch } from 'vue';

import PathRoute from 'components/PathRoute.vue';

const router = useRouter();
const route = useRoute();

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

const emits = defineEmits(['updateTitle']);

const updateTitle = () => {
  emits('updateTitle', paths[route.path.slice(1)].title);
};

watch(()=>route.path, () => {
  updateTitle();
});

watch([()=>store.useSystemLocale, ()=>store.userLocale], () => {
  Object.keys(paths).forEach((path) => {
    paths[path].title = t(`path.${path}.title`);
    paths[path].caption = t(`path.${path}.caption`);
  });
  updateTitle();
});

import { KeyBinding } from 'classes/KeyBinding';

const keyBinding = new KeyBinding([
  [['F1'], () => router.push({ path: '/help' })],
  [['F2'], () => router.push({ path: '/calc' })],
  [['F3'], () => router.push({ path: '/unit' })],
  [['F4'], () => router.push({ path: '/currency' })],
  [['F5'], () => router.push({ path: '/about' })],
]);

onMounted(() => {
  keyBinding.subscribe();
  updateTitle();
});

</script>

<template>
  <q-list v-blur>
    <q-item-label class="q-mt-xl text-h5" header>
      {{ t('menu') }} (M)
    </q-item-label>
    <PathRoute v-for="path in paths" :key="path.title" v-bind="path" />
  </q-list>
  <!-- 패널 높이 조절 -->
  <!-- <q-input 
    v-model.number="store.paddingOnResult"
    type="number"
    filled
    dense
    class="text-white"
    style="max-width: 80px"
  /> -->

  <q-footer class="row items-center q-pa-sm bg-primary" >
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
      caption: '계산기'
    unit:
      title: '단위 변환'
      caption: '단위 변환기'
    currency:
      title: '통화 환전'
      caption: '통화 환전기'
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
      caption: 'Calculator'
    unit:
      title: 'Unit Converter'
      caption: 'Unit Converter'
    currency:
      title: 'Currency Converter'
      caption: 'Currency Converter'
    about:
      title: 'About'
      caption: 'About the app'
</i18n>
