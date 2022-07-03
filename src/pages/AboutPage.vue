<script setup lang="ts">
import AboutPageMD from './AboutPage.md';

</script>

<template>
  <q-page>
    <q-card flat class="q-pa-lg">
      <q-markdown :src="AboutPageMD" no-linkify no-heading-anchor-links />
    </q-card>
  </q-page>
</template>
