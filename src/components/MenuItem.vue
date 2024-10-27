<script setup lang="ts">
  // MenuItem 컴포넌트의 props 정의
  defineProps({
    // 메뉴 아이템의 제목
    title: {
      type: String,
      default: ''
    },
    // 메뉴 아이템의 부가 설명
    caption: {
      type: String,
      default: ''
    },
    // 메뉴 아이템의 단축키
    shortcut: {
      type: String,
      default: ''
    },
    // 메뉴 아이템의 아이콘
    icon: {
      type: String,
      default: ''
    },
    // 메뉴 아이템 클릭 시 실행할 함수
    action: {
      type: Function,
      default: () => {}
    },
    // 구분선 여부
    separator: {
      type: Boolean,
      default: false
    },
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
