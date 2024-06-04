<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useMeta, useQuasar } from 'quasar';
import { ref, watch, onBeforeMount } from 'vue';

import { useCalcStore } from 'stores/calc-store';

const router = useRouter();

const store = useCalcStore();

const { locale } = useI18n({ useScope: 'global' });

const { t } = useI18n();

const $q = useQuasar();

const title = ref(t('message.appTitle'));

const updateTitle = () => {
  title.value = t('message.appTitle');
};

if ( $q.platform.is.electron ) {
  store.setAlwaysOnTop( store.alwaysOnTop );
}

useMeta(() => ({
  title: title.value,
}));

watch(() => store.locale, () => {
  updateTitle();
});

onBeforeMount( () => {
  locale.value = store.locale;

  if ( $q.platform.is.win ) {
    store.paddingOnResult = 8;
  } else if ( $q.platform.is.linux ) {
    store.paddingOnResult = 3;
  } else {
    store.paddingOnResult = 0;
  }
  updateTitle();
  store.isHistoryDialogOpen = false;
  store.isSettingDialogOpen = false;
});
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta?.transition as string || ''" mode="default">
      <component :is="Component" :key="route.path"/>
    </transition>
  </router-view>
</template>

<style>
.slide-right-enter-active, .slide-right-leave-active {
  transition: transform 0.3s ease
}
.slide-right-enter, .slide-right-leave-to {
  transform: translateX(100%);
}
.slide-right-enter-to, .slide-right-leave {
  transform: translateX(0);
}

.slide-left-enter-active , .slide-left-leave-active {
  transition: transform 0.3s ease
}
.slide-left-enter, .slide-left-leave-to {
  transform: translateX(-100%);
}
.slide-left-enter-to, .slide-left-leave {
  transform: translateX(0);
}
</style>