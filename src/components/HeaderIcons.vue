<script setup lang="ts">
  /**
   * @file HeaderIcons.vue
   * @description 이 파일은 QCalc 애플리케이션의 헤더 아이콘을 구성하는 Vue 컴포넌트입니다.
   *              사용자가 다양한 기능에 빠르게 접근할 수 있도록 아이콘을 제공하며,
   *              각 아이콘에 대한 동작을 설정합니다.
   */

  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { onMounted, ref } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // router 관련
  import { useRouter } from 'vue-router';
  const router = useRouter();

  // 전역 window 객체에 접근하기 위한 상수 선언
  const window = globalThis.window;

  // 스토어 인스턴스 생성
  const store = window.store;

  // 컴포넌트 import
  import ToolTip from './snippets/ToolTip.vue';
  import ShowTips from './ShowTips.vue';

  // 도움말 팝업 상태 관리
  const tipsDialog = ref(false);

  /**
   * 도움말 팝업을 표시하는 함수
   */
  const showHelpDialog = () => {
    // 로컬 스토리지에서 팁 표시 여부 확인
    const tipsShown = localStorage.getItem('tipsShown');
    if (!tipsShown) {
      tipsDialog.value = true;
    }
  };

  onMounted(() => {
    // 로컬 스토리지에서 팁 표시 여부 확인
    const tipsShown = localStorage.getItem('tipsShown');
    if (!tipsShown) {
      tipsDialog.value = store.showTips;
    }
  });
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
    flat
    icon="tips_and_updates"
    class="q-ma-none q-pa-none q-pl-xs q-pr-xs"
    :aria-label="t('ariaLabel.help')"
    @click="showHelpDialog"
  >
    <ToolTip :text="t('tooltipHelp')" />
  </q-btn>

  <ShowTips v-model="tipsDialog" />
</template>

<i18n>
ko:
  tooltipTips: '팁을 표시합니다.'
  openRecordPage: '클릭하면 기록 페이지를 엽니다.'
  ariaLabel:
    record: '기록 페이지 열기'
    help: '도움말 보기'
en:
  tooltipTips: 'Show tips.'
  openRecordPage: 'Click to open the record page.'
  ariaLabel:
    record: 'Open record page'
    help: 'View help'
</i18n>
