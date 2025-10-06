<script setup lang="ts">
  import { useMainLayout } from '../composables/useMainLayout';
  import NarrowLayout from './NarrowLayout.vue';
  import WideLayout from './WideLayout.vue';
  import ShowTips from 'components/ShowTips.vue';

  const {
    router,
    route,
    uiStore,
    themesStore,
    recordFileInput,
    handleRecordFileChange,
    $g,
    tabs,
    SUB_PAGE_CONFIG,
    currentSubPage,
    isWideLayout,
    leftDrawerOpen,
    switchSubPage,
    isSubPage,
    toggleLeftDrawer,
    navigateToPath,
    SUB_PAGE_BUTTONS,
  } = useMainLayout();

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
  <div class="main-layout">
    <NarrowLayout
      v-if="!isWideLayout"
      :left-drawer-open="leftDrawerOpen"
      :is-sub-page="isSubPage"
      :current-tab="uiStore.currentTab"
      :tabs="tabs"
      :sub-page-config="SUB_PAGE_CONFIG"
      :current-sub-page="currentSubPage"
      :themes-store="themesStore"
      :ui-store="uiStore"
      :g="$g"
      @update:left-drawer-open="leftDrawerOpen = $event"
      @update:current-tab="uiStore.setCurrentTab($event)"
      @toggle-left-drawer="toggleLeftDrawer"
      @navigate-to-path="onNavigateToPath"
      @push-route="onPushRoute"
      @back-route="onBackRoute"
    />
    <WideLayout
      v-else
      :left-drawer-open="leftDrawerOpen"
      :current-tab="uiStore.currentTab"
      :tabs="tabs"
      :sub-page-config="SUB_PAGE_CONFIG"
      :current-sub-page="currentSubPage"
      :sub-page-buttons="SUB_PAGE_BUTTONS"
      :themes-store="themesStore"
      :ui-store="uiStore"
      :g="$g"
      :route="route"
      @update:left-drawer-open="leftDrawerOpen = $event"
      @update:current-tab="uiStore.setCurrentTab($event)"
      @toggle-left-drawer="toggleLeftDrawer"
      @navigate-to-path="onNavigateToPath"
      @switch-sub-page="switchSubPage"
    />

    <ShowTips v-model="uiStore.showTipsDialog" />
    <input ref="recordFileInput" type="file" style="display: none" accept=".csv" @change="handleRecordFileChange" />
  </div>
</template>

<style lang="scss" scoped>
  .main-layout {
    width: 100%;
    height: 100%;
  }
</style>
