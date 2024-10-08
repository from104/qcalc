<script setup lang="ts">
  import {ref, watch, onBeforeMount} from 'vue';

  import {useStoreCalc} from 'src/stores/store-calc';

  const store = useStoreCalc();
  const {setDarkMode, setAlwaysOnTop} = store;

  import {useI18n} from 'vue-i18n';
  const {locale} = useI18n({useScope: 'global'});
  const {t} = useI18n();

  const title = ref(t('message.appTitle'));

  import {useMeta, useQuasar} from 'quasar';
  useMeta(() => ({
    title: title.value,
  }));
  const $q = useQuasar();

  setDarkMode(store.darkMode);

  const updateTitle = () => {
    title.value = t('message.appTitle');
  };

  watch(
    () => store.locale,
    () => {
      updateTitle();
    },
  );

  onBeforeMount(() => {
    locale.value = store.locale;

    if ($q.platform.is.win) {
      store.paddingOnResult = 8;
    } else if ($q.platform.is.linux) {
      store.paddingOnResult = 3;
    } else {
      store.paddingOnResult = 0;
    }

    updateTitle();

    store.isHistoryDialogOpen = false;
    store.isSettingDialogOpen = false;

    if (store.initPanel) {
      store.calc.clear();
    }

    if ($q.platform.is.electron) {
      setAlwaysOnTop(store.alwaysOnTop);
    }
  });
</script>

<template>
  <router-view v-slot="{Component, route}">
    <transition :name="(route.meta?.transition as string) || ''" mode="default">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: transform 0.3s ease;
  }
  .slide-right-enter,
  .slide-right-leave-to {
    transform: translateX(100%);
  }
  .slide-right-enter-to,
  .slide-right-leave {
    transform: translateX(0);
  }

  .slide-left-enter-active,
  .slide-left-leave-active {
    transition: transform 0.3s ease;
  }
  .slide-left-enter,
  .slide-left-leave-to {
    transform: translateX(-100%);
  }
  .slide-left-enter-to,
  .slide-left-leave {
    transform: translateX(0);
  }
</style>
