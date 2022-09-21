<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'quasar'
import { ref, watch } from 'vue'

const { locale } = useI18n({ useScope: 'global' });
const { t } = useI18n();

const title = ref(t('appTitle'));

useMeta(() => {
  return {
    title: title.value
  };
});

watch(locale, () => {
  title.value = t('appTitle');
});
</script>

<template>
  <router-view />
</template>
