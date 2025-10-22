<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter, useRoute } from 'vue-router';
  import { useUIStore } from 'stores/uiStore';
  import { useThemesStore } from 'stores/themesStore';
  import { useMainLayout } from '../composables/useMainLayout';
  import { useRecordManager } from '../composables/useRecordManager';
  import { navigateToPath } from '../utils/NavigationUtils';
  import { isWideWidth } from '../utils/GlobalHelpers';
  import ToolTip from 'components/snippets/ToolTip.vue';
  import MenuPanel from 'components/MenuPanel.vue';
  import HelpIcon from 'components/snippets/HelpIcon.vue';

  const props = defineProps({
    leftDrawerOpen: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['update:leftDrawerOpen', 'toggleLeftDrawer']);

  const { t } = useI18n();
  const router = useRouter();
  const route = useRoute();
  const uiStore = useUIStore();
  const themesStore = useThemesStore();
  const $g = window.globalVars;

  const recordManager = useRecordManager();
  const { tabs, SUB_PAGE_CONFIG } = useMainLayout(t, recordManager);
  const { recordFileInput, handleRecordFileChange } = recordManager;

  const localLeftDrawerOpen = computed({
    get: () => props.leftDrawerOpen,
    set: (value) => emit('update:leftDrawerOpen', value),
  });

  const localCurrentTab = computed({
    get: () => uiStore.currentTab,
    set: (value) => uiStore.setCurrentTab(value),
  });

  // 서브 페이지 관련
  const currentSubPage = computed(() => {
    const validPages = ['help', 'about', 'settings', 'record'];
    return validPages.includes(route.name as string) ? (route.name as string) : 'record';
  });

  const isSubPage = computed(() => {
    return Object.keys(SUB_PAGE_CONFIG)
      .filter((key) => !isWideWidth() || key !== 'record')
      .includes(String(route.name));
  });

  const onNavigateToPath = (path: string) => {
    navigateToPath(path, route, router);
  };

  const onPushRoute = (path: string) => {
    router.push(path);
  };

  const onBackRoute = () => {
    router.back();
  };
</script>

<template>
  <q-layout view="hHh LpR fFf">
    <q-drawer
      v-model="localLeftDrawerOpen"
      show-if-above
      elevated
      :width="250"
      :dark="themesStore.isDarkMode()"
      :swipe-only="$g.isMobile"
      behavior="mobile"
      @click="emit('update:leftDrawerOpen', false)"
    >
      <q-card class="full-height menu-card">
        <MenuPanel />
      </q-card>
    </q-drawer>

    <q-header id="header" class="z-top noselect" elevated>
      <!-- 좁은 화면 메인 헤더 -->
      <q-toolbar v-if="!isSubPage" v-auto-blur :class="{ 'q-pt-md': $g.isAndroid && $g.apiLevel >= 35 }">
        <q-btn flat dense round class="q-mr-sm" icon="menu" aria-label="Menu" @click="emit('toggleLeftDrawer')">
          <ToolTip
            :text-color="themesStore.getDarkColor()"
            :bg-color="themesStore.getCurrentThemeColors.ui.warning"
            :text="t('tooltip.menu')"
          />
        </q-btn>
        <q-tabs
          v-model="localCurrentTab"
          align="left"
          class="col-8 q-px-none"
          active-color="text-primary"
          indicator-color="secondary"
          dense
          shrink
          inline-label
          outside-arrows
          mobile-arrows
          role="tablist"
          :aria-label="t('ariaLabel.mainTabs')"
        >
          <q-tab
            v-for="tab in tabs"
            :id="`tab-${tab.name}`"
            :key="tab.name"
            :label="typeof tab.title === 'string' ? tab.title : (tab.title as any).value"
            :name="tab.name"
            class="q-px-xs"
            dense
            role="tab"
            :aria-selected="localCurrentTab === tab.name"
            :aria-controls="`panel-${tab.name}`"
          />
        </q-tabs>
        <q-space />
        <q-btn
          flat
          icon="mdi-history"
          class="q-ma-none q-pa-none q-pl-sm q-pr-xs"
          :aria-label="t('ariaLabel.record')"
          @click="onPushRoute('/record')"
        >
          <ToolTip
            :text-color="themesStore.getDarkColor()"
            :bg-color="themesStore.getCurrentThemeColors.ui.warning"
            :text="t('openRecordPage')"
          />
        </q-btn>
        <q-btn
          flat
          icon="settings"
          class="q-ma-none q-pa-none q-pl-xs q-pr-xs"
          :aria-label="t('ariaLabel.settings')"
          @click="onNavigateToPath('/settings')"
        >
          <ToolTip
            :text-color="themesStore.getDarkColor()"
            :bg-color="themesStore.getCurrentThemeColors.ui.warning"
            :text="t('tooltip.settings')"
          />
        </q-btn>
      </q-toolbar>

      <!-- 좁은 화면 서브 헤더 -->
      <q-toolbar v-else v-auto-blur class="q-px-sm" :class="{ 'q-pt-md': $g.isAndroid && $g.apiLevel >= 35 }">
        <q-btn
          flat
          dense
          round
          icon="arrow_back"
          role="button"
          :aria-label="t('ariaLabel.back')"
          @click="onBackRoute"
        />
        <q-toolbar-title class="text-subtitle1">
          {{
            typeof SUB_PAGE_CONFIG[currentSubPage]?.title === 'string'
              ? SUB_PAGE_CONFIG[currentSubPage]?.title
              : (SUB_PAGE_CONFIG[currentSubPage]?.title as any)?.value
          }}
          <HelpIcon
            v-if="currentSubPage === 'record' && $g.isMobile"
            :text-color="themesStore.getDarkColor()"
            :bg-color="themesStore.getCurrentThemeColors.ui.warning"
            :text="t('tooltip.recordSwipeHelp')"
          />
        </q-toolbar-title>
        <q-space />
        <q-btn
          v-for="button in SUB_PAGE_CONFIG[currentSubPage]?.buttons"
          :key="button.icon"
          dense
          flat
          size="md"
          class="high-z-index"
          :icon="button.icon"
          role="button"
          :aria-label="t(`ariaLabel.${button.icon}`)"
          :disable="(button.disabled as any).value"
          @click="button.action"
        >
          <ToolTip
            :text-color="themesStore.getDarkColor()"
            :bg-color="themesStore.getCurrentThemeColors.ui.warning"
            :text="button.tooltip as any"
          />
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container class="row no-padding-bottom">
      <!-- 메인 화면 컨텐츠 -->
      <template v-if="!isSubPage">
        <q-tab-panels
          v-model="localCurrentTab"
          animated
          infinite
          :swipeable="$g.isMobile"
          role="tabpanel"
          :aria-label="t('ariaLabel.calculatorContent')"
        >
          <q-tab-panel
            v-for="(tab, index) in tabs"
            :id="`panel-${tab.name}`"
            :key="index"
            :name="tab.name"
            role="tabpanel"
            :aria-label="
              t('ariaLabel.tabPanel', { name: typeof tab.title === 'string' ? tab.title : (tab.title as any).value })
            "
            :aria-labelledby="`tab-${tab.name}`"
          >
            <component :is="tab.component" />
          </q-tab-panel>
        </q-tab-panels>
      </template>

      <!-- 서브 화면 컨텐츠 -->
      <template v-else>
        <div class="col-12 sub-content">
          <q-scroll-area class="sub-scroll-area" :class="{ 'hide-scrollbar': currentSubPage === 'record' }">
            <component :is="SUB_PAGE_CONFIG[currentSubPage]?.component" class="sub-page" />
          </q-scroll-area>
        </div>
      </template>
    </q-page-container>
    <input ref="recordFileInput" type="file" style="display: none" accept="text/csv,.csv" @change="handleRecordFileChange" />
  </q-layout>
</template>

<style lang="scss" scoped>
  @import '../css/layout.scss';
</style>

<i18n lang="yaml" src="../i18n/components/Layout.yml" />
