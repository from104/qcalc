<script setup lang="ts">
  import {onMounted, reactive, watch} from 'vue';

  import MenuItem from 'components/MenuItem.vue';

  import {useRouter} from 'vue-router';
  const router = useRouter();

  import {useStoreCalc} from 'src/stores/store-calc';
  const storeCalc = useStoreCalc();

  import {useI18n} from 'vue-i18n';
  const {t} = useI18n();

  interface Item {
    title?: string;
    caption?: string;
    shortcut?: string;
    icon?: string;
    action?: () => void;
    separator?: boolean;
  }

  const items: {[key: string]: Item} = reactive({
    calc: {
      title: t('item.calc.title'),
      caption: t('item.calc.caption'),
      shortcut: 'Ctrl-1',
      icon: 'calculate',
      action: () => {
        storeCalc.cTab = 'calc';
      },
    },
    unit: {
      title: t('item.unit.title'),
      caption: t('item.unit.caption'),
      shortcut: 'Ctrl-2',
      icon: 'swap_vert',
      action: () => {
        storeCalc.cTab = 'unit';
      },
    },
    currency: {
      title: t('item.currency.title'),
      caption: t('item.currency.caption'),
      shortcut: 'Ctrl-3',
      icon: 'currency_exchange',
      action: () => {
        storeCalc.cTab = 'currency';
      },
    },
    separator1: {
      separator: true,
    },
    settings: {
      title: t('item.settings.title'),
      caption: t('item.settings.caption'),
      shortcut: 'Alt-s',
      icon: 'settings',
      action: () => {
        storeCalc.isSettingDialogOpen = true;
      },
    },
    separator2: {
      separator: true,
    },
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

  const updateLocale = () => {
    Object.keys(items).forEach((item) => {
      items[item].title = t(`item.${item}.title`);
      items[item].caption = t(`item.${item}.caption`);
    });
  };

  watch(
    () => storeCalc.locale,
    () => {
      updateLocale();
    },
  );

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