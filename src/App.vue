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
  if (!store.initPanel) {
    router.push(store.initialPath);
  }
});
</script>

<template>
  <router-view />
</template>;
