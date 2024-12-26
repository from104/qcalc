<script setup lang="ts">
  // Vue Composition API에서 필요한 함수들을 가져옵니다.
  import { onMounted, onUnmounted, computed, ComputedRef } from 'vue';

  // router 인스턴스 가져오기
  import { useRouter } from 'vue-router'
  const router = useRouter()

  // route 인스턴스 가져오기
  import { useRoute } from 'vue-router'
  const route = useRoute()

  // 스토어 인스턴스를 가져옵니다.
  import { useStore } from 'src/stores/store';
  const store = useStore();

  // 페이지 컴포넌트를 가져옵니다.
  import HelpPage from 'src/pages/HelpPage.vue';
  import AboutPage from 'src/pages/AboutPage.vue';
  import HistoryPage from 'src/pages/HistoryPage.vue';
  import SettingPage from 'src/pages/SettingPage.vue';

  // 다국어 지원을 위한 i18n 설정을 가져옵니다.
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // ESC 키를 눌렀을 때 이전 페이지로 돌아가는 함수입니다.
  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      router.back();
    }
  };

  interface PageButton {
    icon: string;
    disabled: ComputedRef<boolean>;
    action: () => void;
  }

  interface PageConfig {
    component: typeof HelpPage | typeof AboutPage | typeof HistoryPage | typeof SettingPage;
    buttons?: PageButton[];
  }

  // computed 속성 추가
  const isHistoryDisabled = computed(() => {
    return store.calc.history.getAllRecords().length === 0 || store.isDeleteHistoryConfirmOpen;
  });

  const PAGE_CONFIG: Record<string, PageConfig> = {
    help: {
      component: HelpPage,
    },
    about: {
      component: AboutPage,
    },
    history: {
      component: HistoryPage,
      buttons: [
        {
          icon: 'delete_outline',
          disabled: isHistoryDisabled,
          action: () => {
            store.isDeleteHistoryConfirmOpen = true;
          },
        },
      ],
    },
    settings: {
      component: SettingPage,
    },
  } as const;

  // 현재 라우트에 따라 표시할 컴포넌트를 결정합니다.
  const CurrentPageComponent = computed(() => {
    return PAGE_CONFIG[route.name as keyof typeof PAGE_CONFIG]?.component ?? null;
  });

  // 컴포넌트가 마운트될 때 ESC 키 이벤트 리스너를 추가합니다.
  onMounted(() => {
    window.addEventListener('keydown', handleEscapeKey);
  });

  // 컴포넌트가 언마운트될 때 ESC 키 이벤트 리스너를 제거��니다.
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscapeKey);
  });
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header id="header" class="z-top noselect" elevated>
      <q-toolbar v-blur class="q-px-sm">
        <q-btn flat dense round icon="arrow_back" @click="router.back()" />
        <q-toolbar-title class="text-h6">{{ t(`message.${String(route.name)}`) }}</q-toolbar-title>
        <q-space />
        <q-btn
          v-for="button in PAGE_CONFIG[route.name as keyof typeof PAGE_CONFIG]?.buttons"
          :key="button.icon"
          dense
          flat
          size="md"
          style="z-index: 1000"
          :icon="button.icon"
          :disable="button.disabled.value"
          @click="button.action"
        />
      </q-toolbar>
    </q-header>
    <q-page-container style="padding-bottom: 0px">
      <q-scroll-area id="scroll-area">
        <component :is="CurrentPageComponent" />
      </q-scroll-area>
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="scss">
  #scroll-area {
    height: 100vh;
  }
</style>
