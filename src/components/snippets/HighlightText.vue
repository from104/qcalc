<script setup lang="ts">
import { h } from 'vue';
import { useStore } from 'stores/store';

const store = useStore();

interface Props {
  text: string;
  searchTerm: string;
}

const props = defineProps<Props>();

const render = () => {
  if (!store.isSearchOpen || !props.searchTerm.trim()) {
    return h('span', props.text);
  }

  const escapedSearchTerm = props.searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  const parts = props.text.split(regex);

  return h(
    'span',
    parts.map((part, i) =>
      i % 2 === 1
        ? h('span', { class: 'search-highlight' }, part)
        : h('span', part)
    )
  );
};
</script>

<template>
  <component :is="render()" />
</template>

<style scoped>
.search-highlight {
  background-color: rgba(255, 255, 0, 0.3);
  border-radius: 2px;
  padding: 0 2px;
  margin: 0 -2px;
}

:deep(.body--dark .search-highlight) {
  background-color: rgba(255, 255, 0, 0.2);
}
</style> 