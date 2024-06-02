<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';

import { version } from '../../package.json';

import PathRoute from 'components/PathRoute.vue';

import { useRouter,useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

import { useCalcStore } from 'src/stores/calc-store';
const store = useCalcStore();

import { useI18n } from 'vue-i18n';
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

// updateTitle() 함수를 사용하기 위해 emits() 함수를 정의
const emits = defineEmits(['updateTitle']);

// updateTitle() 함수는 updateTitle 이벤트를 발생시키는 역할
// paths 객체에서 현재 경로에 해당하는 객체를 찾아 title 속성을 업데이트
// route.path.slice(1)은 경로에서 첫 번째 문자를 제외한 나머지 문자열을 반환
const updateTitle = () => {
  emits('updateTitle', paths[route.path.slice(1)].title);
};

// route.path가 변경될 때마다 updateTitle() 함수를 실행
watch(()=>route.path, () => {
  updateTitle();
});

// updateLocale() 함수는 paths 객체의 title과 caption 속성을 각 언어에 맞게 업데이트
const updateLocale = () => {
  Object.keys(paths).forEach((path) => {
    paths[path].title = t(`path.${path}.title`);
    paths[path].caption = t(`path.${path}.caption`);
  });
  updateTitle();
};

// store.locale이 변경될 때마다 updateLocale() 함수를 실행
watch(()=>store.locale, () => {
  updateLocale();
});

// 해당 기능으로 이동
const toPath = (path: string) => {
  router.push({ path: path });
};

import { KeyBinding } from 'classes/KeyBinding';

const keyBinding = new KeyBinding([
  [['F1'], () => toPath('/help')],
  [['F2'], () => toPath('/calc')],
  [['F3'], () => toPath('/unit')],
  [['F4'], () => toPath('/currency')],
  [['F5'], () => toPath('/about')],
]);

onMounted(() => {
  keyBinding.subscribe();
  updateLocale();
});
</script>

<template>
  <q-list v-blur>
    <q-item-label class="q-mt-xl text-h5" header>
      {{ t('message.menu') }} (M)
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
    {{ `${t('message.version')} : ${version}` }}
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
