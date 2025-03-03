<script setup lang="ts">
  /**
   * @file MenuItem.vue
   * @description 이 파일은 메뉴 항목을 표시하는 Vue 컴포넌트입니다.
   *              사용자는 제목, 캡션, 단축키, 아이콘 및 클릭 시 실행할 액션을 정의할 수 있습니다.
   *              이 컴포넌트는 Quasar 프레임워크의 q-item 및 q-separator를 사용하여
   *              메뉴 항목을 구성하고, 접근성을 고려한 aria-label 속성을 포함합니다.
   * 
   * @props {string} title - 메뉴 항목의 제목
   * @props {string} caption - 메뉴 항목의 캡션
   * @props {string} shortcut - 메뉴 항목의 단축키
   * @props {string} icon - 메뉴 항목의 아이콘 이름
   * @props {Function} action - 메뉴 항목 클릭 시 실행할 함수
   * @props {boolean} separator - 메뉴 항목 사이에 구분선을 표시할지 여부
   */

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
