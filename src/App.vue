<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta, useQuasar } from 'quasar';
import { ref, watch, onBeforeMount } from 'vue';

import { useCalcStore } from 'stores/calc-store';

const store = useCalcStore();

const { locale } = useI18n({ useScope: 'global' });
const { t } = useI18n();

const $q = useQuasar();

const title = ref(t('appTitle'));

if ($q.platform.is.electron) {
  store.setAlwaysOnTop(store.alwaysOnTop);
}

useMeta(() => ({
  title: title.value,
}));

watch(locale, () => {
  title.value = t('appTitle');
});

onBeforeMount(() => {
  if ($q.platform.is.win) {
    store.paddingOnResult = 8
  } else if ($q.platform.is.linux) {
    store.paddingOnResult = 3
  } else {
    store.paddingOnResult = 0
  }
});
</script>

<template>
  <router-view />
</template>;
