<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import HistoryCard from 'components/HistoryCard.vue';
  const { locale } = useI18n({ useScope: 'global' });
</script>

<template>
  <q-page class="q-pa-md">
    <HistoryCard />
  </q-page>
</template>
