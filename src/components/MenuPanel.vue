<script setup lang="ts">
  /**
   * @file MenuPanel.vue
   * @description 이 파일은 QCalc 애플리케이션의 메뉴 패널을 구성하는 Vue 컴포넌트입니다.
   *              사용자가 다양한 계산기 기능에 접근할 수 있도록 메뉴 아이템을 정의하고,
   *              각 메뉴 아이템에 대한 동작을 설정합니다.
   */

  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { onMounted, reactive, watch } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  import { useRouter, useRoute } from 'vue-router';
  import type { RouteLocationNormalizedLoaded } from 'vue-router';

  // router 인스턴스 가져오기
  const router = useRouter();
  const route = useRoute() as RouteLocationNormalizedLoaded & { meta: RouteTransitionMeta };

  // 스토어 import
  import { useUIStore } from 'stores/uiStore';
  import { useSettingsStore } from 'stores/settingsStore';

  // 스토어 인스턴스 생성
  const uiStore = useUIStore();
  const settingsStore = useSettingsStore();

  // 컴포넌트 import
  import MenuItem from 'components/snippets/MenuItem.vue';
  import { navigateToPath } from 'src/utils/NavigationUtils';

  // 메뉴 아이템 인터페이스 정의
  interface MenuItem {
    id: string;
    title?: string | undefined;
    caption?: string | undefined;
    shortcut?: string | undefined;
    icon?: string | undefined;
    action?: (() => void) | undefined;
    separator?: boolean | undefined;
  }

  // 메뉴 아이템 정의
  const items = reactive([
    {
      id: 'calc',
      title: t('item.calc.title'),
      caption: t('item.calc.caption'),
      shortcut: 'Ctrl-1',
      icon: 'calculate',
      action: () => (uiStore.currentTab = 'calc'),
    },
    {
      id: 'unit',
      title: t('item.unit.title'),
      caption: t('item.unit.caption'),
      shortcut: 'Ctrl-2',
      icon: 'swap_vert',
      action: () => (uiStore.currentTab = 'unit'),
    },
    {
      id: 'currency',
      title: t('item.currency.title'),
      caption: t('item.currency.caption'),
      shortcut: 'Ctrl-3',
      icon: 'currency_exchange',
      action: () => (uiStore.currentTab = 'currency'),
    },
    {
      id: 'radix',
      title: t('item.radix.title'),
      caption: t('item.radix.caption'),
      shortcut: 'Ctrl-4',
      icon: 'transform',
      action: () => (uiStore.currentTab = 'radix'),
    },
    { id: 'separator1', separator: true },
    {
      id: 'record',
      title: t('item.record.title'),
      caption: t('item.record.caption'),
      shortcut: 'F4',
      icon: 'history',
      action: () => navigateToPath('/record', route, router),
    },
    {
      id: 'settings',
      title: t('item.settings.title'),
      caption: t('item.settings.caption'),
      shortcut: 'F3',
      icon: 'settings',
      action: () => navigateToPath('/settings', route, router),
    },
    { id: 'separator2', separator: true },
    {
      id: 'tips',
      title: t('item.tips.title'),
      caption: t('item.tips.caption'),
      shortcut: 'F5',
      icon: 'report',
      action: () => (uiStore.showTipsDialog = true),
    },

    {
      id: 'help',
      title: t('item.help.title'),
      caption: t('item.help.caption'),
      shortcut: 'F1',
      icon: 'help',
      action: () => navigateToPath('/help', route, router),
    },
    {
      id: 'about',
      title: t('item.about.title'),
      caption: t('iem.about.caption'),
      shortcut: 'F2',
      icon: 'info',
      action: () => navigateToPath('/about', route, router),
    },
  ]);

  // 언어 변경 시 메뉴 아이템 텍스트 업데이트 함수
  const updateLocale = () => {
    items.forEach((item) => {
      if (!item.separator) {
        item.title = t(`item.${item.id}.title`);
        item.caption = t(`item.${item.id}.caption`);
      }
    });
  };

  // 언어 변경 감지 및 메뉴 아이템 텍스트 업데이트
  watch(
    () => settingsStore.locale,
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
  <q-list v-auto-blur role="menu" :aria-label="t('ariaLabel.menu')">
    <MenuItem v-for="item in items" :key="item.id" v-bind="item" />
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
    record:
      title: '기록'
      caption: '기록 화면'
    settings:
      title: '설정'
      caption: '설정'
    tips:
      title: '팁'
      caption: '팁 다이얼로그'
    help:
      title: '도움말'
      caption: '기능과 사용법'
    about:
      title: '소개'
      caption: '앱에 대한 소개'
  ariaLabel:
    menu: '메인 메뉴'
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
    record:
      title: 'Record'
      caption: 'Record Screen'
    settings:
      title: 'Settings'
      caption: 'Settings'
    tips:
      title: 'Tips'
      caption: 'Tips dialog'
    help:
      title: 'Help'
      caption: 'Features and Usage'
    about:
      title: 'About'
      caption: 'About the app'
  ariaLabel:
    menu: 'Main menu'
</i18n>
