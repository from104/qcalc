<script setup lang="ts">
  import type { PropType } from 'vue';
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { Tab, SubPageConfig, SubPageButton } from '../types/layout';
  import ToolTip from 'components/snippets/ToolTip.vue';
  import MenuPanel from 'components/MenuPanel.vue';
  import HelpIcon from 'components/snippets/HelpIcon.vue';

  const props = defineProps({
    leftDrawerOpen: {
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
    subPageButtons: {
      type: Array as PropType<SubPageButton[]>,
      default: () => [],
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
    route: {
      type: Object,
      default: () => ({}),
    },
  });

  const emit = defineEmits([
    'update:leftDrawerOpen',
    'update:currentTab',
    'toggleLeftDrawer',
    'navigateToPath',
    'switchSubPage',
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
  <q-layout>
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
      <q-card :class="themesStore.isDarkMode() ? 'bg-grey-9' : 'bg-grey-3'" class="full-height menu-card">
        <MenuPanel />
      </q-card>
    </q-drawer>

    <q-header id="header" class="z-top noselect row" elevated>
      <!-- 넓은 화면 계산기 영역 헤더 -->
      <q-toolbar v-auto-blur class="col-6 calc-header" :class="{ 'q-pt-md': g.isAndroid && g.apiLevel >= 35 }">
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
          class="col-grow"
          active-color="text-primary"
          indicator-color="secondary"
          dense
          shrink
          inline-label
          role="tablist"
          :aria-label="t('ariaLabel.mainTabs')"
        >
          <q-tab
            v-for="tab in tabs"
            :key="tab.name"
            :label="typeof tab.title === 'string' ? tab.title : tab.title.value"
            :name="tab.name"
            class="q-px-xs"
            dense
            role="tab"
            :aria-label="t('ariaLabel.tab', { name: tab.title })"
            :aria-selected="localCurrentTab === tab.name"
            :aria-controls="`panel-${tab.name}`"
          />
        </q-tabs>
      </q-toolbar>

      <!-- 넓은 화면 서브 헤더 -->
      <q-toolbar v-auto-blur class="col-6 sub-header" :class="{ 'q-pt-md': g.isAndroid && g.apiLevel >= 35 }">
        <transition name="animate-sub-page">
          <div :key="currentSubPage" :data-page="currentSubPage" class="header-content full-width row items-center">
            <q-toolbar-title
              class="text-subtitle1 col-3"
              role="heading"
              :aria-label="t('ariaLabel.subPageTitle', { title: subPageConfig[currentSubPage]?.title })"
            >
              {{ subPageConfig[currentSubPage]?.title }}
              <HelpIcon
                v-if="(currentSubPage === 'record' || currentSubPage === '') && g.isMobile"
                :text-color="themesStore.getDarkColor()"
                :bg-color="themesStore.getCurrentThemeColors.ui.warning"
                :text="t('tooltip.recordSwipeHelp')"
              />
            </q-toolbar-title>
            <div class="col-9 row justify-end sub-header-buttons">
              <q-btn
                v-for="button in subPageButtons.filter((btn) => btn.path !== route.path)"
                :key="button.label"
                dense
                flat
                size="md"
                :icon="button.icon"
                role="button"
                :aria-label="t('ariaLabel.subPageButton', { label: t(`message.${button.label}`) })"
                @click="emit('navigateToPath', button.path)"
              >
                <ToolTip
                  :text-color="themesStore.getDarkColor()"
                  :bg-color="themesStore.getCurrentThemeColors.ui.warning"
                  :text="typeof button.tooltip === 'string' ? button.tooltip : button.tooltip.value"
                />
              </q-btn>
              <q-separator vertical class="sub-header-separator q-mx-sm" />
              <q-btn
                v-for="button in subPageConfig[currentSubPage]?.buttons"
                :key="button.icon"
                class="q-pl-none"
                dense
                flat
                size="md"
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
              <q-btn
                v-if="subPageConfig[currentSubPage]?.showClose"
                class="q-mx-none q-px-none"
                flat
                dense
                round
                icon="close"
                role="button"
                :aria-label="t('ariaLabel.closeSubPage')"
                @click="emit('switchSubPage', 'record')"
              />
            </div>
          </div>
        </transition>
      </q-toolbar>
    </q-header>

    <q-page-container class="row" style="padding-bottom: 0px">
      <!-- 넓은 화면 계산기 영역 -->
      <div class="col-6 calc-content" role="region" :aria-label="t('ariaLabel.calculatorSection')">
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
      </div>

      <!-- 넓은 화면 서브 영역 -->
      <div class="col-6 relative-position sub-content" role="complementary" :aria-label="t('ariaLabel.subPageSection')">
        <q-scroll-area
          class="sub-scroll-area"
          :class="{ 'hide-scrollbar': currentSubPage === 'record' }"
          role="region"
          :aria-label="t('ariaLabel.subPageContent')"
        >
          <transition name="animate-sub-page">
            <component
              :is="subPageConfig[currentSubPage]?.component"
              :key="currentSubPage"
              :data-page="currentSubPage"
              class="sub-page"
            />
          </transition>
        </q-scroll-area>
      </div>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
  @import '../css/layout.scss';

  .calc-header {
    border-right: 3px solid rgba(255, 255, 255, 0.2);
  }

  .calc-content {
    border-right: 3px solid rgba(0, 0, 0, 0.2);
  }

  .body--dark {
    .calc-content {
      border-right: 3px solid rgba(255, 255, 255, 0.2);
    }

    .sub-header-separator {
      border-right: 3px solid rgba(255, 255, 255, 0.05);
    }
  }

  .sub-header-separator {
    border-right: 3px solid rgba(255, 255, 255, 0.4);
  }

  .sub-header-buttons {
    padding-right: 16px; // q-pr-lg와 동일
  }
</style>

<i18n lang="yaml5" src="../i18n/components/Layout.yml" />