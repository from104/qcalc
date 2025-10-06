<script setup lang="ts">
  import type { PropType } from 'vue';
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { Tab, SubPageConfig } from '../types/layout';
  import ToolTip from 'components/snippets/ToolTip.vue';
  import MenuPanel from 'components/MenuPanel.vue';
  import HelpIcon from 'components/snippets/HelpIcon.vue';

  const props = defineProps({
    leftDrawerOpen: {
      type: Boolean,
      default: false,
    },
    isSubPage: {
      type: Boolean,
      default: false,
    },
    currentTab: {
      type: String,
      default: '',
    },
    tabs: {
      type: Array as PropType<Tab[]>,
      default: () => [],
    },
    subPageConfig: {
      type: Object as PropType<SubPageConfig>,
      default: () => ({}),
    },
    currentSubPage: {
      type: String,
      default: '',
    },
    themesStore: {
      type: Object,
      default: () => ({}),
    },
    uiStore: {
      type: Object,
      default: () => ({}),
    },
    g: {
      type: Object,
      default: () => ({}),
    },
  });

  const emit = defineEmits([
    'update:leftDrawerOpen',
    'update:currentTab',
    'toggleLeftDrawer',
    'navigateToPath',
    'pushRoute',
    'backRoute',
  ]);

  const { t } = useI18n();

  const localLeftDrawerOpen = computed({
    get: () => props.leftDrawerOpen,
    set: (value) => emit('update:leftDrawerOpen', value),
  });

  const localCurrentTab = computed({
    get: () => props.currentTab,
    set: (value) => emit('update:currentTab', value),
  });
</script>

<template>
  <q-layout view="hHh LpR fFf">
    <q-drawer
      v-model="localLeftDrawerOpen"
      show-if-above
      elevated
      :width="250"
      :dark="themesStore.isDarkMode()"
      :swipe-only="g.isMobile"
      behavior="mobile"
      @click="emit('update:leftDrawerOpen', false)"
    >
      <q-card class="full-height menu-card">
        <MenuPanel />
      </q-card>
    </q-drawer>

    <q-header id="header" class="z-top noselect" elevated>
      <!-- 좁은 화면 메인 헤더 -->
      <q-toolbar v-if="!isSubPage" v-auto-blur :class="{ 'q-pt-md': g.isAndroid && g.apiLevel >= 35 }">
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
            :label="typeof tab.title === 'string' ? tab.title : tab.title.value"
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
          @click="emit('pushRoute', '/record')"
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
          @click="emit('navigateToPath', '/settings')"
        >
          <ToolTip
            :text-color="themesStore.getDarkColor()"
            :bg-color="themesStore.getCurrentThemeColors.ui.warning"
            :text="t('tooltip.settings')"
          />
        </q-btn>
      </q-toolbar>

      <!-- 좁은 화면 서브 헤더 -->
      <q-toolbar v-else v-auto-blur class="q-px-sm" :class="{ 'q-pt-md': g.isAndroid && g.apiLevel >= 35 }">
        <q-btn
          flat
          dense
          round
          icon="arrow_back"
          role="button"
          :aria-label="t('ariaLabel.back')"
          @click="emit('backRoute')"
        />
        <q-toolbar-title class="text-subtitle1">
          {{ subPageConfig[currentSubPage]?.title }}
          <HelpIcon
            v-if="currentSubPage === 'record' && g.isMobile"
            :text-color="themesStore.getDarkColor()"
            :bg-color="themesStore.getCurrentThemeColors.ui.warning"
            :text="t('tooltip.recordSwipeHelp')"
          />
        </q-toolbar-title>
        <q-space />
        <q-btn
          v-for="button in subPageConfig[currentSubPage]?.buttons"
          :key="button.icon"
          dense
          flat
          size="md"
          class="high-z-index"
          :icon="button.icon"
          role="button"
          :aria-label="t(`ariaLabel.${button.icon}`)"
          :disable="typeof button.disabled === 'boolean' ? button.disabled : button.disabled.value"
          @click="button.action"
        >
          <ToolTip
            :text-color="themesStore.getDarkColor()"
            :bg-color="themesStore.getCurrentThemeColors.ui.warning"
            :text="typeof button.tooltip === 'string' ? button.tooltip : button.tooltip.value"
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
          :swipeable="g.isMobile"
          role="tabpanel"
          :aria-label="t('ariaLabel.calculatorContent')"
        >
          <q-tab-panel
            v-for="(tab, index) in tabs"
            :id="`panel-${tab.name}`"
            :key="index"
            :name="tab.name"
            role="tabpanel"
            :aria-label="t('ariaLabel.tabPanel', { name: tab.title })"
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
            <component :is="subPageConfig[currentSubPage]?.component" class="sub-page" />
          </q-scroll-area>
        </div>
      </template>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
  @import '../css/layout.scss';
</style>
