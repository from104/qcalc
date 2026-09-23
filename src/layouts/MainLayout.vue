<script setup lang="ts">
  import { useMainLayout } from '../composables/useMainLayout';
  import { useUIStore } from 'stores/uiStore';
  import { isWideWidth } from '../utils/GlobalHelpers';
  import NarrowLayout from './NarrowLayout.vue';
  import WideLayout from './WideLayout.vue';
  import { useI18n } from 'vue-i18n';
  import { computed, defineAsyncComponent, ref, watch } from 'vue';
  import { useRecordManager } from '../composables/useRecordManager';

  // Layout.yml의 메시지들을 가져와서 useMainLayout에 전달
  const { t } = useI18n();

  const uiStore = useUIStore();

  // 팁 다이얼로그(팁 md 10개 언어 포함)는 처음 열릴 때 불러온다. 한 번 마운트하면 유지해 닫힘 전환을 보존.
  const ShowTips = defineAsyncComponent(() => import('components/dialogs/ShowTips.vue'));
  const tipsMounted = ref(uiStore.showTipsDialog);
  watch(
    () => uiStore.showTipsDialog,
    (open) => {
      if (open) tipsMounted.value = true;
    },
  );

  const recordManager = useRecordManager(t);
  const { leftDrawerOpen, toggleLeftDrawer, tabs, SUB_PAGE_CONFIG, SUB_PAGE_BUTTONS } = useMainLayout(t, recordManager);

  const isWideLayout = computed(() => isWideWidth());
</script>

<template>
  <div class="main-layout">
    <NarrowLayout
      v-if="!isWideLayout"
      v-model:left-drawer-open="leftDrawerOpen"
      :tabs="tabs"
      :sub-page-config="SUB_PAGE_CONFIG"
      @toggle-left-drawer="toggleLeftDrawer"
    />
    <WideLayout
      v-else
      v-model:left-drawer-open="leftDrawerOpen"
      :tabs="tabs"
      :sub-page-config="SUB_PAGE_CONFIG"
      :sub-page-buttons="SUB_PAGE_BUTTONS"
      @toggle-left-drawer="toggleLeftDrawer"
    />
    <ShowTips v-if="tipsMounted" v-model="uiStore.showTipsDialog" />
  </div>
</template>

<style lang="scss" scoped>
  .main-layout {
    width: 100%;
    height: 100%;
  }
</style>

<i18n lang="yaml" src="../i18n/components/Layout.yml" />
