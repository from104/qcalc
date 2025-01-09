<script setup lang="ts">
  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // MenuItem 컴포넌트의 props 정의
  defineProps({
    title: { type: String, default: '' },
    caption: { type: String, default: '' },
    shortcut: { type: String, default: '' },
    icon: { type: String, default: '' },
    action: { type: Function, default: () => {} },
    separator: { type: Boolean, default: false },
  });
</script>

<template>
  <q-separator v-if="separator" />
  <q-item v-else v-close-popup clickable role="menuitem" :aria-label="title" @click="(evt: Event) => action(evt)">
    <q-item-section v-if="icon" avatar class="col-3">
      <q-icon :name="icon" role="img" :aria-label="t('ariaLabel.icon', { name: title })" />
    </q-item-section>
    <q-item-section>
      <q-item-label v-if="title" role="text">
        {{ title }}
      </q-item-label>
      <q-item-label v-if="caption" caption role="text" class="ellipsis">
        {{ caption }} {{ shortcut ? '(' + shortcut + ')' : '' }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<i18n>
ko:
  ariaLabel:
    icon: '{name} 메뉴 아이콘'
en:
  ariaLabel:
    icon: '{name} menu icon'
</i18n>
