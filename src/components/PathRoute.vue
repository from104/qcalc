<script lang="ts" setup>
defineProps({
  title: { type: String, required: true },
  caption: { type: String, default: '' },
  path: { type: String, default: '#' },
  icon: { type: String, default: '' },
});
</script>

<template>
  <q-item clickable :to="path">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>
