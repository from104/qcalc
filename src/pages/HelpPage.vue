<script setup lang="ts">
import HelpPageMD from './HelpPage.md';
</script>

<template>
  <q-page>
    <q-card flat class="q-pa-lg">
      <q-markdown :src="HelpPageMD" no-linkify no-heading-anchor-links />
    </q-card>
  </q-page>
</template>
