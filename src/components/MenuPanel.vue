<script setup lang="ts">
  import { onMounted, reactive, watch } from 'vue';
  import MenuItem from 'components/MenuItem.vue';
  import { useRouter } from 'vue-router';
  import { useStore } from 'src/stores/store';
  import { useI18n } from 'vue-i18n';

  // 라우터 인스턴스 초기화
  const router = useRouter();

  // 스토어 인스턴스 초기화
  const store = useStore();

  // i18n 설정
  const { t } = useI18n();

  // 메뉴 아이템 인터페이스 정의
  interface MenuItem {
    title?: string;
    caption?: string;
    shortcut?: string;
    icon?: string;
    action?: () => void;
    isSeparator?: boolean;
  }

  // 메뉴 아이템 정의
  const items: { [key: string]: MenuItem } = reactive({
    calc: {
      title: t('item.calc.title'),
      caption: t('item.calc.caption'),
      shortcut: 'Ctrl-1',
      icon: 'calculate',
      action: () => { store.currentTab = 'calc'; },
    },
    unit: {
      title: t('item.unit.title'),
      caption: t('item.unit.caption'),
      shortcut: 'Ctrl-2',
      icon: 'swap_vert',
      action: () => { store.currentTab = 'unit'; },
    },
    currency: {
      title: t('item.currency.title'),
      caption: t('item.currency.caption'),
      shortcut: 'Ctrl-3',
      icon: 'currency_exchange',
      action: () => { store.currentTab = 'currency'; },
    },
    radix: {
      title: t('item.radix.title'),
      caption: t('item.radix.caption'),
      shortcut: 'Ctrl-4',
      icon: 'transform',
      action: () => { store.currentTab = 'radix'; },
    },
    separator1: { isSeparator: true },
    settings: {
      title: t('item.settings.title'),
      caption: t('item.settings.caption'),
      shortcut: 'Alt-s',
      icon: 'settings',
      action: () => { store.isSettingDialogOpen = true; },
    },
    separator2: { isSeparator: true },
    help: {
      title: t('item.help.title'),
      caption: t('item.help.caption'),
      icon: 'help',
      action: () => router.push('/help'),
    },
    about: {
      title: t('item.about.title'),
      caption: t('item.about.caption'),
      icon: 'info',
      action: () => router.push('/about'),
    },
  });

  // 언어 변경 시 메뉴 아이템 텍스트 업데이트 함수
  const updateLocale = () => {
    Object.keys(items).forEach((item) => {
      if (!items[item].isSeparator) {
        items[item].title = t(`item.${item}.title`);
        items[item].caption = t(`item.${item}.caption`);
      }
    });
  };

  // 언어 변경 감지 및 메뉴 아이템 텍스트 업데이트
  watch(
    () => store.locale,
    () => {
      updateLocale();
    },
  );

  // 컴포넌트 마운트 시 초기 언어 설정
  onMounted(() => {
    updateLocale();
  });
</script>

<template>
  <q-list v-blur>
    <MenuItem v-for="item in items" :key="item.title" v-bind="item" />
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
    radix:
      title: '진법 변환'
      caption: '진법 변환기'
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
    radix:
      title: 'Radix Converter'
      caption: 'Radix Converter'  
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