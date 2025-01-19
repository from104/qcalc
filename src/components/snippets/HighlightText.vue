<script setup lang="ts">
  import { h, ref, onMounted, watch } from 'vue';
  import { useStore } from 'stores/store';

  const store = useStore();

  interface Props {
    text: string;
    searchTerm: string;
    allowLineBreak?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    allowLineBreak: false,
  });

  // emit 정의
  const emit = defineEmits<{
    (e: 'show-tooltip', value: boolean): void;
  }>();

  // 텍스트 요소에 대한 참조 생성
  const textIDs = ref<string[]>([]);

  // 텍스트가 줄임표로 표시되는지 확인
  const checkTextOverflow = () => {
    for (const id of textIDs.value) {
      console.log('checkTextOverflow id', id);
      const textElement = document.getElementById(id);
      if (textElement) {
        if (textElement.scrollWidth > textElement.clientWidth) {
          console.log('checkTextOverflow', true);
          emit('show-tooltip', true);
          return;
        }
      }
    }
    console.log('checkTextOverflow', false);
    emit('show-tooltip', false);
  };

  // 컴포넌트가 마운트된 후 overflow 체크
  onMounted(() => {
    checkTextOverflow();
  });

  const renderLine = (text: string, searchTerm: string) => {
    // now()기반의 고유 ID 생성
    const id = Date.now() + '-for-check-overflow';
    textIDs.value.push(id);

    if (!store.isSearchOpen || !searchTerm.trim()) {
      return h(
        'span',
        {
          class: 'single-line',
          id: id,
        },
        text,
      );
    }

    const escapedSearchTerm = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    const parts = text.split(regex);

    return h(
      'span',
      {
        class: 'single-line',
        id: id,
      },
      parts.map((part, i) => (i % 2 === 1 ? h('span', { class: 'search-highlight' }, part) : h('span', part))),
    );
  };

  const render = () => {
    if (!props.allowLineBreak) {
      return renderLine(props.text, props.searchTerm);
    }

    // 줄바꿈으로 텍스트를 나누기
    const lines = props.text.split('\n');

    return h(
      'span',
      { class: 'multiline' },
      lines.map((line, index) => [renderLine(line, props.searchTerm), index < lines.length - 1 ? h('br') : null]),
    );
  };

  
  watch(() => props.text, () => {
    setTimeout(checkTextOverflow, 10);
  });

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

  /* 한 줄 표시 (줄임표) */
  .single-line {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 여러 줄 표시 */
  .multiline {
    display: block;
    max-width: 100%;
    word-break: break-word;
  }
</style>
