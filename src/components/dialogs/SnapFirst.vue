<script setup lang="ts">
  /**
   * @file SnapFirst.vue
   * @description 이 파일은 Snap 환경에서 첫 실행 시 표시되는 다이얼로그를 구현한 Vue 컴포넌트입니다.
   *              Snap 환경에서 폰트 캐싱 문제로 인한 초기 실행 시 지연을 사용자에게 안내하고,
   *              강제 종료를 방지하기 위한 경고 메시지를 표시합니다. 이후 실행 시에는
   *              이 다이얼로그가 표시되지 않습니다.
   *
   * @note electron-builder 이슈 #5217 관련:
   *       strict/devmode Snap에서 시스템 다이얼로그의 폰트가 네모(□)로 깨지는 fontconfig 캐시 문제가
   *       보고되었습니다. 최신 Electron 버전에서 일부 개선되었으나, 초기 실행 시 폰트 캐싱으로 인한
   *       지연이 발생할 수 있습니다. 사용자가 앱이 응답하지 않는다고 오해하여 강제 종료하는 것을
   *       방지하기 위해 이 안내 다이얼로그를 표시합니다.
   *       참고: https://github.com/electron-userland/electron-builder/issues/5217
   */

  import { useI18n } from 'vue-i18n';
  import { useUIStore } from 'stores/uiStore';
  import { useDialogStyle } from 'src/composables/useDialogStyle';

  const $g = window.globalVars;
  const uiStore = useUIStore();
  const { getButtonTextColor } = useDialogStyle();
  const { t } = useI18n();

  /**
   * Snap 환경에서 첫 실행 또는 버전 업데이트 시 다이얼로그 표시 여부 확인
   */
  if ($g.isSnap && uiStore.snapLastSeenVersion !== $g.version) {
    uiStore.isSnapFirstRun = true;
  }

  /**
   * 사용자가 확인 버튼을 클릭하면 현재 버전을 저장하고 다이얼로그 닫기
   */
  const handleConfirm = () => {
    uiStore.updateSnapVersion($g.version);
  };

  /**
   * GitHub 이슈 페이지 열기
   */
  const openGitHubIssue = () => {
    window.open('https://github.com/electron-userland/electron-builder/issues/5217', '_blank');
  };
</script>

<template>
  <q-dialog v-if="$g.isSnap" v-model="uiStore.isSnapFirstRun" persistent>
    <q-card class="snap-dialog">
      <q-card-section class="dialog-header">
        <div class="text-h6">{{ t('snapNoticeTitle') }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="dialog-body">
        <div class="notice-content">{{ t('snapFirstRun') }}</div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          :label="t('viewIssue')"
          color="primary"
          :text-color="getButtonTextColor()"
          icon="open_in_new"
          size="md"
          @click="openGitHubIssue"
        />
        <q-btn
          unelevated
          :label="t('confirm')"
          color="primary"
          :text-color="getButtonTextColor(true)"
          size="md"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
  @import '../../css/dialog.scss';

  .snap-dialog {
    @extend .dialog-container;
  }

  .dialog-header {
    .text-h6 {
      text-align: center;
    }
  }

  .notice-content {
    white-space: pre-line;
    line-height: 1.7;
    font-size: 0.95rem;

    @media (max-width: 599px) {
      font-size: 0.9rem;
    }
  }
</style>

<i18n lang="yaml">
ko:
  snapNoticeTitle: 'Snap 환경 안내'
  snapFirstRun: |
    Snap의 strict 모드에서 fontconfig 캐시 문제로 인해 초기 실행 시 지연이 발생할 수 있습니다.

    일부 시스템 다이얼로그에서 폰트가 네모(□)로 표시될 수 있으나, 절대 강제 종료하지 마시고 잠시만 기다려 주세요.

    이후 실행 시에는 정상 작동합니다.

    자세한 내용은 '이슈 보기' 버튼을 클릭하여 GitHub 이슈 페이지를 확인하세요.
  confirm: '확인'
  viewIssue: '이슈 보기'
en:
  snapNoticeTitle: 'Snap Environment Notice'
  snapFirstRun: |
    Due to fontconfig cache issues in Snap strict mode, there may be a delay during initial launch.

    Some system dialogs may show fonts as squares (□), but please do not force quit and wait a moment.

    Subsequent launches will work normally.

    For more information, click 'View Issue' to visit the GitHub issue page.
  confirm: 'Confirm'
  viewIssue: 'View Issue'
</i18n>
