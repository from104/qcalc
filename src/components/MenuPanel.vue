<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';

import MenuItem from 'components/MenuItem.vue';

import { useRouter,useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

import { useCalcStore } from 'src/stores/calc-store';
const store = useCalcStore();

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

interface Item {
  title: string;
  caption?: string;
  shortcut?: string;
  icon?: string;
  action?: ()=>void;
  isSeparator?: boolean;
};

const items: {[key: string]: Item} = reactive({
  calc: {
    title: t('item.calc.title'),
    caption: t('item.calc.caption'),
    shortcut: 'Ctrl-1',
    icon: 'calculate',
    action: () => {store.cTab = 'calc'},
  },
  unit: {
    title: t('item.unit.title'),
    caption: t('item.unit.caption'),
    shortcut: 'Ctrl-2',
    icon: 'swap_vert',
    action: () => {store.cTab = 'unit'},
  },
  currency: {
    title: t('item.currency.title'),
    caption: t('item.currency.caption'),
    shortcut: 'Ctrl-3',
    icon: 'currency_exchange',
    action: () => {store.cTab = 'currency'},
  },
  separator1: {
    title: 'separator',
    isSeparator: true,
  },
  settings: {
    title: t('item.settings.title'),
    caption: t('item.settings.caption'),
    shortcut: 'Ctrl-e',
    icon: 'settings',
    action: ()=>{store.isSettingDialogOpen = true},
  },
  separator2: {
    title: 'separator',
    isSeparator: true,
  },
  help: {
    title: t('item.help.title'),
    caption: t('item.help.caption'),
    shortcut: 'F1',
    icon: 'help',
    action: () => router.push('/help'),
  },
  about: {
    title: t('item.about.title'),
    caption: t('item.about.caption'),
    shortcut: 'F2',
    icon: 'info',
    action: () => router.push('/about'),
  },
});



// updateLocale() 함수는 items 객체의 title과 caption 속성을 각 언어에 맞게 업데이트
const updateLocale = () => {
  Object.keys(items).forEach((item) => {
    items[item].title = t(`item.${item}.title`);
    items[item].caption = t(`item.${item}.caption`);
  });
};

// store.locale이 변경될 때마다 updateLocale() 함수를 실행
watch(()=>store.locale, () => {
  updateLocale();
});

// 해당 기능으로 이동

import { KeyBinding } from 'classes/KeyBinding';

const keyBinding = new KeyBinding([
  [['Control-1'], () => (store.cTab = 'calc')],
  [['Control-2'], () => (store.cTab = 'unit')],
  [['Control-3'], () => (store.cTab = 'currency')],
  [['Control-e'], () => {}],
  [['F1'], () => router.push('/help')],
  [['F2'], () => router.push('/about')],
]);

onMounted(() => {
  keyBinding.subscribe();
  updateLocale();
});
</script>

<template>
  <q-list v-blur>
    <MenuItem v-for="item in items" :key="item.title" v-bind="item"/>
  </q-list>
</template>

<i18n>
ko:
  item:
    calc:
      title: '계산기'
      caption: '계산기'
    unit:
      title: '단위 변환'
      caption: '단위 변환기'
    currency:
      title: '통화 환전'
      caption: '통화 환전기'
    settings:
      title: '설정'
      caption: '설정'
    help:
      title: '도움말'
      caption: '기능과 사용법'
    about:
      title: '소개'
      caption: '앱에 대한 소개'
en:
  item:
    calc:
      title: 'Calculator'
      caption: 'Calculator'
    unit:
      title: 'Unit Converter'
      caption: 'Unit Converter'
    currency:
      title: 'Currency Converter'
      caption: 'Currency Converter'
    settings:
      title: 'Settings'
      caption: 'Settings'
    help:
      title: 'Help'
      caption: 'Features and Usage'
    about:
      title: 'About'
      caption: 'About the app'
</i18n>
