<script setup lang="ts">
  /**
   * @file HeaderIcons.vue
   * @description 이 파일은 QCalc 애플리케이션의 헤더 아이콘을 구성하는 Vue 컴포넌트입니다.
   *              사용자가 다양한 기능에 빠르게 접근할 수 있도록 아이콘을 제공하며,
   *              각 아이콘에 대한 동작을 설정합니다.
   */

  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { ref } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();
  const { locale } = useI18n({ useScope: 'global' });

  // router 관련
  import { useRouter } from 'vue-router';
  const router = useRouter();

  // 전역 window 객체에 접근하기 위한 상수 선언
  const window = globalThis.window;

  // 스토어 인스턴스 생성
  const store = window.store;

  // 스토어에서 필요한 메서드와 속성 추출

  // 컴포넌트 import
  import ToolTip from './snippets/ToolTip.vue';

  // 마크다운 파일 import
  import ShortHelpMD_en from './ShortHelp-en.md';
  import ShortHelpMD_ko from './ShortHelp-ko.md';

  // 도움말 팝업 상태 관리
  const helpDialog = ref(false);

  /**
   * 도움말 팝업을 표시하는 함수
   */
  const showHelpDialog = () => {
    helpDialog.value = true;
  };
</script>

<template>
  <q-btn
    v-if="!store.isWideWidth()"
    flat
    icon="mdi-history"
    class="q-ma-none q-pa-none q-pl-sm q-pr-xs"
    :aria-label="t('ariaLabel.record')"
    @click="router.push('/record')"
  >
    <ToolTip :text="t('openRecordPage')" />
  </q-btn>
  <q-btn
    id="btn-help"
    flat
    icon="help_center"
    class="q-ma-none q-pa-none q-pl-xs q-pr-xs"
    :aria-label="t('ariaLabel.help')"
    @click="showHelpDialog"
  >
    <ToolTip :text="t('tooltipHelp')" />
  </q-btn>

  <!-- 도움말 팝업 다이얼로그 -->
  <q-dialog v-model="helpDialog">
    <q-card class="help-dialog">
      <q-bar class="bg-primary text-white">
        <q-space />
        <div class="text-subtitle1">{{ t('helpTitle') }}</div>
        <q-space />
        <q-btn dense flat icon="close" class="q-ml-sm" @click="helpDialog = false" />
      </q-bar>
      <q-card-section class="help-content scrollbar-custom">
        <q-markdown
          :src="locale.substring(0, 2) == 'ko' ? ShortHelpMD_ko : ShortHelpMD_en"
          no-linkify
          no-heading-anchor-links
          style="margin-top: -20px"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
  .help-dialog {
    top: 5%;
    width: 100%;
    height: 100%;
    max-width: 400px;
    max-height: 450px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .help-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }
  }
</style>

<i18n>
ko:
  tooltipHelp: '도움말을 표시합니다.'
  openRecordPage: '클릭하면 기록 페이지를 엽니다.'
  helpTitle: '짧은 도움말'
  ariaLabel:
    record: '기록 페이지 열기'
    help: '도움말 보기'
en:
  tooltipHelp: 'Show help.'
  openRecordPage: 'Click to open the record page.'
  helpTitle: 'Quick Help'
  ariaLabel:
    record: 'Open record page'
    help: 'View help'
</i18n>
