<script setup lang="ts">
  import { computed, toValue } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter, useRoute } from 'vue-router';
  import { useUIStore } from 'stores/uiStore';
  import { useThemesStore } from 'stores/themesStore';
  import { navigateToPath } from '../utils/NavigationUtils';
  import ToolTip from 'components/common/ToolTip.vue';
  import MenuPanel from 'components/settings/MenuPanel.vue';
  import HelpIcon from 'components/common/HelpIcon.vue';
  import { useRecordManager } from '../composables/useRecordManager';
  import type { Tab, SubPageConfig, SubPageButton } from '../types/layout.d';

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
    subPageButtons: {
      type: Array,
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
  const recordManager = useRecordManager();
  const { recordFileInput, handleRecordFileChange } = recordManager;

  const localLeftDrawerOpen = computed({
    get: () => props.leftDrawerOpen,
    set: (value) => emit('update:leftDrawerOpen', value),
  });

  const localCurrentTab = computed({
    get: () => uiStore.currentTab,
    set: (value) => uiStore.setCurrentTab(value),
  });

  const MAX_VISIBLE_TABS = 4;
  const visibleTabs = computed(() => props.tabs.slice(0, MAX_VISIBLE_TABS));
  const overflowTabs = computed(() => props.tabs.slice(MAX_VISIBLE_TABS));
  const isOverflowActive = computed(() => overflowTabs.value.some((tab) => tab.name === localCurrentTab.value));

  // 서브 페이지 관련
  const currentSubPage = computed(() => {
    const validPages = ['help', 'about', 'settings'];
    return validPages.includes(route.name as string) ? (route.name as string) : 'record';
  });

  const switchSubPage = async (pageName: string) => {
    if (currentSubPage.value === pageName) return;

    if (pageName !== 'record') {
      router.push({ name: pageName });
    } else {
      router.back();
    }
  };

  const onNavigateToPath = (path: string) => {
    navigateToPath(path, route, router);
  };
</script>

<template>
  <q-layout>
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
      <q-card :class="themesStore.isDarkMode() ? 'bg-grey-9' : 'bg-grey-3'" class="full-height menu-card">
        <MenuPanel />
      </q-card>
    </q-drawer>

    <q-header id="header" class="z-top noselect row" elevated>
      <!-- 넓은 화면 계산기 영역 헤더 -->
      <q-toolbar v-auto-blur class="col-6 calc-header" :class="{ 'q-pt-md': $g.isAndroid && $g.apiLevel >= 35 }">
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
          :arrows="false"
          role="tablist"
          :aria-label="t('ariaLabel.mainTabs')"
        >
          <q-tab
            v-for="tab in visibleTabs"
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
        <q-btn
          v-if="overflowTabs.length > 0"
          flat
          dense
          icon="more_horiz"
          class="q-px-xs overflow-menu-btn"
          :color="isOverflowActive ? 'secondary' : undefined"
        >
          <q-menu anchor="bottom right" self="top right" :offset="[0, 8]" class="overflow-menu-wrapper">
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
      </q-toolbar>

      <!-- 넓은 화면 서브 헤더 -->
      <q-toolbar v-auto-blur class="col-6 sub-header" :class="{ 'q-pt-md': $g.isAndroid && $g.apiLevel >= 35 }">
        <transition name="animate-sub-page">
          <div :key="currentSubPage" :data-page="currentSubPage" class="header-content full-width row items-center">
            <q-toolbar-title
              class="text-subtitle1 col-3"
              role="heading"
              :aria-label="
                t('ariaLabel.subPageTitle', {
                  title:
                    props.subPageConfig[currentSubPage]?.title != null
                      ? toValue(props.subPageConfig[currentSubPage]!.title)
                      : '',
                })
              "
            >
              {{
                props.subPageConfig[currentSubPage]?.title != null
                  ? toValue(props.subPageConfig[currentSubPage]!.title)
                  : ''
              }}
              <HelpIcon
                v-if="(currentSubPage === 'record' || currentSubPage === '') && $g.isMobile"
                :text-color="themesStore.getDarkColor()"
                :bg-color="themesStore.getCurrentThemeColors.ui.warning"
                :text="t('tooltip.recordSwipeHelp')"
              />
            </q-toolbar-title>
            <div class="col-9 row justify-end sub-header-buttons">
              <q-btn
                v-for="button in (props.subPageButtons as SubPageButton[]).filter((btn) => btn.path !== route.path)"
                :key="button.label"
                dense
                flat
                size="md"
                :icon="button.icon"
                role="button"
                :aria-label="t('ariaLabel.subPageButton', { label: t(`message.${button.label}`) })"
                @click="onNavigateToPath(button.path)"
              >
                <ToolTip
                  :text-color="themesStore.getDarkColor()"
                  :bg-color="themesStore.getCurrentThemeColors.ui.warning"
                  :text="toValue(button.tooltip)"
                />
              </q-btn>
              <q-separator vertical class="sub-header-separator q-mx-sm" />
              <q-btn
                v-for="button in props.subPageConfig[currentSubPage]?.buttons"
                :key="button.icon"
                class="q-pl-none"
                dense
                flat
                size="md"
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
              <q-btn
                v-if="props.subPageConfig[currentSubPage]?.showClose"
                class="q-mx-none q-px-none"
                flat
                dense
                round
                icon="close"
                role="button"
                :aria-label="t('ariaLabel.closeSubPage')"
                @click="switchSubPage('record')"
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
              :is="props.subPageConfig[currentSubPage]?.component"
              :key="currentSubPage"
              :data-page="currentSubPage"
              class="sub-page"
            />
          </transition>
        </q-scroll-area>
      </div>
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

<i18n lang="yaml" src="../i18n/components/Layout.yml" />
