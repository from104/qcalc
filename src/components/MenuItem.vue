<script setup lang="ts">
import { is } from 'quasar';
import { useCalcStore } from 'src/stores/calc-store';

const store = useCalcStore();

defineProps({
  title: { type: String, required: true },
  caption: { type: String, default: '' },
  shortcut: { type: String, default: '' },
  icon: { type: String, default: '' },
  action: { type: Function, default: () => {} },
  isSeparator: { type: Boolean, default: false },
});
</script>

<template>
  <q-item v-if="!isSeparator" clickable @click="action()">
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
  <q-separator v-else class="q-my-xs" />
</template>
