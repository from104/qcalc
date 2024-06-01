<script setup lang="ts">
import { useCalcStore } from 'src/stores/calc-store';

const store = useCalcStore();

defineProps({
  title: { type: String, required: true },
  caption: { type: String, default: '' },
  shortcut: { type: String, default: '' },
  path: { type: String, default: '#' },
  icon: { type: String, default: '' },
});
</script>

<template>
  <q-item active-class="text-primary" clickable :to="path" @click="store.setInitialPath(path)" >
    <q-item-section v-if="icon" class="col-3" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>
        {{ title }}
      </q-item-label>
      <q-item-label caption>
        {{ `${caption} (${shortcut})` }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>
