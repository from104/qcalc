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
  <q-dialog
    v-if="$g.isSnap"
    v-model="uiStore.isSnapFirstRun"
    persistent
    role="dialog"
    :aria-label="t('snapNoticeTitle')"
  >
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
ja:
  snapNoticeTitle: 'Snap環境のお知らせ'
  snapFirstRun: |
    Snapのstrictモードでのfontconfigキャッシュの問題により、初回起動時に遅延が発生する場合があります。

    一部のシステムダイアログでフォントが四角(□)で表示される場合がありますが、強制終了せずにしばらくお待ちください。

    以降の起動は正常に動作します。

    詳細は「Issue を見る」ボタンをクリックしてGitHub issueページをご確認ください。
  confirm: '確認'
  viewIssue: 'Issue を見る'
zh:
  snapNoticeTitle: 'Snap 环境提示'
  snapFirstRun: |
    由于 Snap strict 模式中的 fontconfig 缓存问题，首次启动时可能会出现延迟。

    某些系统对话框中的字体可能显示为方块(□)，请不要强制退出，请稍等片刻。

    后续启动将正常运行。

    有关更多信息，请点击"查看问题"访问 GitHub 问题页面。
  confirm: '确认'
  viewIssue: '查看问题'
hi:
  snapNoticeTitle: 'Snap वातावरण सूचना'
  snapFirstRun: |
    Snap strict मोड में fontconfig कैश समस्याओं के कारण प्रारंभिक लॉन्च में देरी हो सकती है।

    कुछ सिस्टम डायलॉग में फ़ॉन्ट वर्गों (□) के रूप में दिखाई दे सकते हैं, कृपया बलपूर्वक बंद न करें और थोड़ा प्रतीक्षा करें।

    बाद के लॉन्च सामान्य रूप से काम करेंगे।

    अधिक जानकारी के लिए 'समस्या देखें' बटन पर क्लिक करें।
  confirm: 'पुष्टि करें'
  viewIssue: 'समस्या देखें'
de:
  snapNoticeTitle: 'Snap-Umgebungshinweis'
  snapFirstRun: |
    Aufgrund von Fontconfig-Cache-Problemen im Snap-Strict-Modus kann es beim ersten Start zu Verzögerungen kommen.

    In einigen Systemdialogen werden Schriftarten möglicherweise als Quadrate (□) angezeigt. Bitte erzwingen Sie keinen Abbruch und warten Sie einen Moment.

    Nachfolgende Starts funktionieren normal.

    Weitere Informationen finden Sie auf der GitHub-Issue-Seite über die Schaltfläche „Issue anzeigen".
  confirm: 'Bestätigen'
  viewIssue: 'Issue anzeigen'
es:
  snapNoticeTitle: 'Aviso del entorno Snap'
  snapFirstRun: |
    Debido a problemas de caché de fontconfig en el modo estricto de Snap, puede haber un retraso durante el primer inicio.

    Algunos diálogos del sistema pueden mostrar fuentes como cuadrados (□), por favor no fuerce el cierre y espere un momento.

    Los inicios posteriores funcionarán normalmente.

    Para más información, haga clic en 'Ver problema' para visitar la página de problemas de GitHub.
  confirm: 'Confirmar'
  viewIssue: 'Ver problema'
fr:
  snapNoticeTitle: "Avis sur l'environnement Snap"
  snapFirstRun: |
    En raison de problèmes de cache fontconfig en mode strict Snap, il peut y avoir un délai lors du premier lancement.

    Certaines boîtes de dialogue système peuvent afficher les polices sous forme de carrés (□), veuillez ne pas forcer la fermeture et patienter un instant.

    Les lancements suivants fonctionneront normalement.

    Pour plus d'informations, cliquez sur « Voir le problème » pour visiter la page GitHub.
  confirm: 'Confirmer'
  viewIssue: 'Voir le problème'
</i18n>
