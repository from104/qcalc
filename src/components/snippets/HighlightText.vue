<script setup lang="ts">
  /**
   * @file HighlightText.vue
   * @description 이 파일은 주어진 텍스트에서 특정 검색어를 강조 표시하는 Vue 컴포넌트입니다.
   *              사용자는 검색어를 입력하고, 해당 검색어가 포함된 텍스트 부분이 강조 표시됩니다.
   *              이 컴포넌트는 텍스트가 줄임표로 표시되는 경우 툴팁을 통해 전체 텍스트를 보여주는 기능도 포함하고 있습니다.
   * 
   * @props {string} text - 강조 표시할 텍스트
   * @props {string} searchTerm - 강조할 검색어
   * @props {boolean} allowLineBreak - 줄바꿈 허용 여부
   */

  import { h, ref, onMounted, watch, onUnmounted } from 'vue';

  // 전역 window 객체에 접근하기 위한 상수 선언
  const $g = window.globalVars;

  // 스토어 인스턴스 생성
  const $s = $g.store;

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
      const textElement = document.getElementById(id);
      if (textElement) {
        if (textElement.scrollWidth > textElement.clientWidth) {
          emit('show-tooltip', true);
          return;
        }
      }
    }
    emit('show-tooltip', false);
  };

  // 컴포넌트가 마운트된 후 overflow 체크 및 리사이즈 이벤트 리스너 등록
  onMounted(() => {
    setTimeout(checkTextOverflow, 350);
    window.addEventListener('resize', checkTextOverflow);
  });

  // 컴포넌트가 언마운트될 때 리사이즈 이벤트 리스너 제거
  onUnmounted(() => {
    window.removeEventListener('resize', checkTextOverflow);
  });

  // 텍스트가 변경될 때 체크
  watch(
    () => props.text,
    () => {
      setTimeout(checkTextOverflow, 10);
    },
  );

  // UUID v4 생성 함수
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const renderLine = (text: string, searchTerm: string) => {
    // UUID 기반의 고유 ID 생성
    const id = `highlight-${generateUUID()}`;
    textIDs.value.push(id);

    if (!$s.isSearchOpen || !searchTerm.trim()) {
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
