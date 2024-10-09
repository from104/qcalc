<script setup lang="ts">
  import {ref, watch, onBeforeMount} from 'vue';

  import {useStoreBase} from 'src/stores/store-base';
  import {useStoreSettings} from 'src/stores/store-settings';

  const storeBase = useStoreBase();
  const storeSettings = useStoreSettings();
  const {setDarkMode, setAlwaysOnTop} = storeSettings;

  import {useI18n} from 'vue-i18n';
  const {locale} = useI18n({useScope: 'global'});
  const {t} = useI18n();

  const title = ref(t('message.appTitle'));

  import {useMeta, useQuasar} from 'quasar';
import { Calculator } from './classes/Calculator';
import { CalculatorHistory } from './classes/CalculatorHistory';
  useMeta(() => ({
    title: title.value,
  }));
  const $q = useQuasar();

  setDarkMode(storeSettings.darkMode);

  const updateTitle = () => {
    title.value = t('message.appTitle');
  };

  watch(
    () => storeSettings.locale,
    () => {
      updateTitle();
    },
  );

  onBeforeMount(() => {
    locale.value = storeSettings.locale;

    if ($q.platform.is.win) {
      storeBase.paddingOnResult = 8;
    } else if ($q.platform.is.linux) {
      storeBase.paddingOnResult = 3;
    } else {
      storeBase.paddingOnResult = 0;
    }

    updateTitle();

    storeBase.isHistoryDialogOpen = false;
    storeBase.isSettingDialogOpen = false;

    if (storeBase.calc === null) {
      storeBase.calc = new Calculator();
    }

    if (storeBase.calc && storeBase.calcHistory === null) {
      storeBase.calcHistory = new CalculatorHistory(storeBase.calc as unknown as Calculator);
    }

    if (storeSettings.initPanel && storeBase.calc) {
      storeBase.calc.clear();
    }

    if ($q.platform.is.electron) {
      setAlwaysOnTop(storeSettings.alwaysOnTop);
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
