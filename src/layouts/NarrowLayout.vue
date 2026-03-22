<script setup lang="ts">
  import { computed, toValue } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter, useRoute } from 'vue-router';
  import { useUIStore } from 'stores/uiStore';
  import { useThemesStore } from 'stores/themesStore';
  import { navigateToPath } from '../utils/NavigationUtils';
  import { isWideWidth } from '../utils/GlobalHelpers';
  import ToolTip from 'components/common/ToolTip.vue';
  import MenuPanel from 'components/settings/MenuPanel.vue';
  import HelpIcon from 'components/common/HelpIcon.vue';
  import { useRecordManager } from '../composables/useRecordManager';
  import type { Tab, SubPageConfig } from '../types/layout.d';

  const props = defineProps({
    leftDrawerOpen: {
      type: Boolean,
      default: false,
    },
    tabs: {
      type: Array as () => Tab[],
      required: true,
    },
    subPageConfig: {
      type: Object as () => SubPageConfig,
      required: true,
    },
  });

  const emit = defineEmits(['update:leftDrawerOpen', 'toggleLeftDrawer']);

  const { t } = useI18n();
  const router = useRouter();
  const route = useRoute();
  const uiStore = useUIStore();
  const themesStore = useThemesStore();
  const $g = window.globalVars;

  // useRecordManager는 컴포저블이므로 같은 인스턴스를 반환함
  // 하지만 키 바인딩은 useMainLayout에서만 등록되므로 중복 등록 방지
  const recordManager = useRecordManager(t);
  const { recordFileInput, handleRecordFileChange } = recordManager;

  const localLeftDrawerOpen = computed({
    get: () => props.leftDrawerOpen,
    set: (value) => emit('update:leftDrawerOpen', value),
  });

  const localCurrentTab = computed({
    get: () => uiStore.currentTab,
    set: (value) => uiStore.setCurrentTab(value),
  });

  const MAX_VISIBLE_TABS = 3;
  const visibleTabs = computed(() => props.tabs.slice(0, MAX_VISIBLE_TABS));
  const overflowTabs = computed(() => props.tabs.slice(MAX_VISIBLE_TABS));
  const isOverflowActive = computed(() => overflowTabs.value.some((tab) => tab.name === localCurrentTab.value));

  // 서브 페이지 관련
  const currentSubPage = computed(() => {
    const validPages = ['help', 'about', 'settings', 'record'];
    return validPages.includes(route.name as string) ? (route.name as string) : 'record';
  });

  const isSubPage = computed(() => {
    return Object.keys(props.subPageConfig)
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
      <q-toolbar v-if="!isSubPage" v-auto-blur :class="{ 'q-pt-lg': $g.isAndroid && $g.apiLevel >= 35 }">
        <q-btn flat dense round class="q-mr-none" icon="menu" aria-label="Menu" @click="emit('toggleLeftDrawer')">
          <ToolTip
            :text-color="themesStore.getDarkColor()"
            :bg-color="themesStore.getCurrentThemeColors.ui.warning"
            :text="t('tooltip.menu')"
          />
        </q-btn>
        <q-tabs
          v-model="localCurrentTab"
          align="left"
          class="col-grow q-px-none"
          active-color="text-primary"
          indicator-color="secondary"
          dense
          shrink
          :arrows="false"
          role="tablist"
          :aria-label="t('ariaLabel.mainTabs')"
        >
          <q-tab
            v-for="tab in visibleTabs"
            :id="`tab-${tab.name}`"
            :key="tab.name"
            :icon="tab.icon"
            :name="tab.name"
            class="q-px-xs"
            dense
            role="tab"
            :aria-label="toValue(tab.title)"
            :aria-selected="localCurrentTab === tab.name"
            :aria-controls="`panel-${tab.name}`"
          >
            <q-tooltip :delay="500">{{ toValue(tab.title) }}</q-tooltip>
          </q-tab>
        </q-tabs>
        <!-- 오버플로우 메뉴 -->
        <q-btn
          v-if="overflowTabs.length > 0"
          flat
          dense
          icon="expand_more"
          class="q-px-xs overflow-menu-btn"
          :color="isOverflowActive ? 'secondary' : undefined"
        >
          <q-menu anchor="bottom right" self="top right" :offset="[0, 14]" class="overflow-menu-wrapper">
            <q-list dense style="min-width: 160px" class="overflow-menu-list">
              <q-item
                v-for="tab in overflowTabs"
                :key="tab.name"
                v-close-popup
                clickable
                :active="localCurrentTab === tab.name"
                active-class="text-secondary"
                @click="uiStore.setCurrentTab(tab.name)"
              >
                <q-item-section avatar>
                  <q-icon :name="tab.icon" size="20px" />
                </q-item-section>
                <q-item-section>{{ toValue(tab.title) }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
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
      <q-toolbar v-else v-auto-blur class="q-px-sm" :class="{ 'q-pt-lg': $g.isAndroid && $g.apiLevel >= 35 }">
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
            props.subPageConfig[currentSubPage]?.title != null
              ? toValue(props.subPageConfig[currentSubPage]!.title)
              : ''
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
          v-for="button in props.subPageConfig[currentSubPage]?.buttons"
          :key="button.icon"
          dense
          flat
          size="md"
          class="high-z-index"
          :icon="button.icon"
          role="button"
          :aria-label="t(`ariaLabel.${button.icon}`)"
          :disable="toValue(button.disabled)"
          @click="button.action"
        >
          <ToolTip
            :text-color="themesStore.getDarkColor()"
            :bg-color="themesStore.getCurrentThemeColors.ui.warning"
            :text="toValue(button.tooltip)"
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
            v-for="(tab, index) in props.tabs"
            :id="`panel-${tab.name}`"
            :key="index"
            :name="tab.name"
            role="tabpanel"
            :aria-label="t('ariaLabel.tabPanel', { name: toValue(tab.title) })"
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
            <component :is="props.subPageConfig[currentSubPage]?.component" class="sub-page" />
          </q-scroll-area>
        </div>
      </template>
    </q-page-container>
    <input
      ref="recordFileInput"
      type="file"
      style="display: none"
      accept="text/csv,.csv"
      @change="handleRecordFileChange"
    />
  </q-layout>
</template>

<style lang="scss" scoped>
  @import '../css/layout.scss';
</style>

<i18n lang="yaml" src="../i18n/components/Layout.yml" />
