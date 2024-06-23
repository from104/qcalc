<script setup lang="ts">
  defineProps({
    title: {type: String, default: ''},
    caption: {type: String, default: ''},
    shortcut: {type: String, default: ''},
    icon: {type: String, default: ''},
    action: {type: Function, default: () => {}},
    separator: {type: Boolean, default: false},
  });
</script>

<template>
  <q-item v-if="!separator" clickable @click="action()">
    <q-item-section v-if="icon" class="col-3" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label v-if="title">
        {{ title }}
      </q-item-label>
      <q-item-label v-if="caption" caption class="ellipsis">
        {{ caption }} {{ shortcut ? '('+shortcut+')' : '' }}
      </q-item-label>
    </q-item-section>
  </q-item>
  <q-separator v-else class="q-my-xs" />
</template>
