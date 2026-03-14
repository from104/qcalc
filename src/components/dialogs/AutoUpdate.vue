<script setup lang="ts">
  /**
   * @file AutoUpdate.vue
   * @description 이 파일은 자동 업데이트 기능을 관리하는 Vue 컴포넌트입니다.
   *              업데이트 확인, 다운로드 및 설치 프로세스를 관리하고,
   *              사용자에게 업데이트 진행 상황을 알리며 필요한 경우 재시작을 안내합니다.
   *              또한 개발 환경에서는 업데이트 테스트 기능을 제공합니다.
   */

  import { ref, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { showError, showMessage } from '../../utils/NotificationUtils';
  import { useSettingsStore } from 'stores/settingsStore';
  import { useDialogStyle } from 'src/composables/useDialogStyle';

  // 전역 window 객체에 접근하기 위한 상수 선언
  const $g = window.globalVars;

  const settingsStore = useSettingsStore();
  const { getButtonTextColor } = useDialogStyle();

  // i18n 설정
  const { t } = useI18n();

  // 상태 관리
  const updateDialog = ref(false);
  const updateStatus = ref<UpdateStatusInfo['status']>('checking');
  const updateInfo = ref<UpdateInfo | null>(null);
  const updateProgress = ref<UpdateProgressInfo | null>(null);
  const updateError = ref<UpdateError | null>(null);

  /**
   * 업데이트 상태를 처리하는 함수입니다.
   */
  const handleUpdateStatus = (
    status: UpdateStatusInfo['status'],
    info?: UpdateInfo | UpdateProgressInfo | UpdateError,
  ) => {
    // 자동 업데이트가 비활성화되어 있으면 패스
    if (!settingsStore.autoUpdate) {
      // 새 패키지 버전
      if (status === 'available' && 'version' in (info || {})) {
        const newVersion = (info as UpdateInfo).version;
        const newVersionMessage = t('newVersionMessage', { version: newVersion });
        const newVersionAddedMessage = t('newVersionAddedMessage');
        showMessage(`${newVersionMessage} - ${newVersionAddedMessage}`, 3000);
      }
      return;
    }

    updateStatus.value = status;

    switch (status) {
      case 'available':
        updateInfo.value = info as UpdateInfo;
        updateDialog.value = true;
        break;

      case 'progress':
        updateProgress.value = info as UpdateProgressInfo;
        break;

      case 'downloaded':
        updateInfo.value = info as UpdateInfo;
        updateDialog.value = true;
        break;

      case 'error':
        updateError.value = info as UpdateError;
        updateDialog.value = true;
        showError(`${t('error')}: ${t('errorMessage')}`);
        console.error((info as UpdateError).message);
        break;
    }
  };

  /**
   * 업데이트를 시작하는 함수입니다.
   */
  const startUpdate = () => {
    if ($g.isDev) {
      // 개발 모드에서는 진행 상태를 시뮬레이션
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        handleUpdateStatus('progress', {
          percent: progress,
          bytesPerSecond: 1024 * 1024, // 1MB/s로 가정
          transferred: (progress / 100) * 1024 * 1024 * 50, // 총 50MB 중 진행률에 따른 전송량
          total: 1024 * 1024 * 50, // 총 50MB로 가정
        });

        if (progress >= 100) {
          clearInterval(interval);
          handleUpdateStatus('downloaded', testUpdateInfo);
        }
      }, 500);
    } else {
      window.electronUpdater.startUpdate();
    }
  };

  /**
   * 업데이트를 설치하는 함수입니다.
   */
  const installUpdate = () => {
    if ($g.isDev) {
      // 개발 모드에서는 재시작 확인 다이얼로그 표시
      // console.log('개발 모드: 앱 재시작 시뮬레이션');
      updateDialog.value = false;
      showMessage(t('updateSimulationComplete'), 3000);
    } else {
      window.electronUpdater.installUpdate();
    }
  };

  // 테스트 업데이트 정보
  const testUpdateInfo: UpdateInfo = {
    version: '0.11.1',
    files: [
      {
        url: 'https://example.com/update.zip',
        sha512: 'dummy-sha512-hash',
        size: 1024 * 1024 * 50, // 50MB
      },
    ],
    path: 'update.zip',
    sha512: 'dummy-sha512-hash',
    releaseDate: new Date().toISOString(),
    releaseName: 'v0.11.1',
    releaseNotes: `
## [0.11.1] 2025-01-29

### Added

- Added temperature units: Delisle (°De), Newton (°N), Romer (°Rø), Réaumur (°Ré).
- Added support for adaptive layout: displays calculation history and sub-panel when the window width increases.
- Added search to calculation history
- Added automatic updates in electron package format

### Changed

- Increased currency conversion precision from Number to BigNumber.
- Expanded decimal point display limit up to 16 digits

### Fixed

- Fixed display error in percentage functionality.`,
  };

  /**
   * 테스트 업데이트를 시작하는 함수입니다.
   */
  const testUpdate = () => {
    if ($g.isDev) {
      handleUpdateStatus('available', testUpdateInfo);
    } else {
      window.electronUpdater.testUpdate();
    }
  };

  // 컴포넌트가 마운트될 때 실행
  onMounted(() => {
    // Electron 환경에서만 업데이트 리스너 등록
    if ($g.isElectron && !$g.isSnap) {
      window.electronUpdater.onUpdateStatus(handleUpdateStatus);

      // 개발 모드가 아닐 때만 업데이트 확인
      if (!$g.isDev) {
        window.electronUpdater.checkForUpdates();
      }
    }
  });

  // 컴포넌트가 언마운트될 때 실행
  onUnmounted(() => {
    // Electron 환경에서만 리스너 제거
    if ($g.isElectron && !$g.isSnap) {
      window.electronUpdater.removeUpdateStatusListener();
    }
  });
</script>

<template>
  <!-- Electron 환경에서만 업데이트 관련 UI 표시 -->
  <template v-if="$g.isElectron && !$g.isSnap">
    <q-dialog v-model="updateDialog" persistent>
      <q-card class="update-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ t('title') }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="dialog-body">
          <template v-if="updateStatus === 'available'">
            <p>{{ t('newVersionMessage', { version: updateInfo?.version }) }}</p>
            <div class="update-content scrollbar-custom">
              <q-markdown :src="updateInfo?.releaseNotes || ''" no-linkify />
            </div>
            <p class="q-mt-md">{{ t('confirmUpdate') }}</p>
          </template>
          <template v-else-if="updateStatus === 'progress'">
            <p>{{ t('downloading', { percent: Math.round(updateProgress?.percent || 0) }) }}</p>
            <q-linear-progress :value="(updateProgress?.percent || 0) / 100" color="primary" />
          </template>
          <template v-else-if="updateStatus === 'downloaded'">
            <p>{{ t('downloadComplete') }}</p>
          </template>
          <template v-else-if="updateStatus === 'error'">
            <p class="text-negative">{{ t('error') }}</p>
            <p class="text-grey-7">{{ t('errorMessage') }}</p>
          </template>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <template v-if="updateStatus === 'available'">
            <q-btn
              v-close-popup
              flat
              :label="t('later')"
              color="primary"
              :text-color="getButtonTextColor()"
              size="md"
            />
            <q-btn
              unelevated
              :label="t('update')"
              color="primary"
              :text-color="getButtonTextColor(true)"
              size="md"
              @click="startUpdate"
            />
          </template>
          <template v-else-if="updateStatus === 'downloaded'">
            <q-btn
              v-close-popup
              flat
              :label="t('later')"
              color="primary"
              :text-color="getButtonTextColor()"
              size="md"
            />
            <q-btn
              unelevated
              :label="t('installNow')"
              color="primary"
              :text-color="getButtonTextColor(true)"
              size="md"
              @click="installUpdate"
            />
          </template>
          <template v-else-if="updateStatus === 'error'">
            <q-btn
              v-close-popup
              unelevated
              :label="t('close')"
              color="primary"
              :text-color="getButtonTextColor(true)"
              size="md"
            />
          </template>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- 개발 환경에서만 표시되는 테스트 버튼 -->
    <q-btn
      v-if="$g.isDev"
      class="fixed-bottom-right q-ma-md"
      color="primary"
      icon="refresh"
      round
      :aria-label="t('testUpdate')"
      @click="testUpdate"
    />
  </template>
</template>

<style scoped lang="scss">
  @import '../../css/dialog.scss';

  .update-dialog {
    @extend .dialog-container;
  }

  .update-content {
    @extend .scrollable-content;
    max-height: 300px;
    margin: 8px 0;
    background: rgba(var(--q-primary-rgb), 0.05);

    @media (max-width: 599px) {
      max-height: 200px;
    }
  }
</style>

<i18n lang="yaml">
ko:
  title: '업데이트 알림'
  newVersionMessage: '새로운 버전이 있습니다: v{version}.'
  newVersionAddedMessage: '업데이트를 위해서는 설정에서 자동 업데이트를 활성화하고 앱을 재시작해야 합니다.'
  confirmUpdate: '업데이트를 진행하시겠습니까?'
  downloading: '다운로드 중... {percent}%'
  downloadComplete: '업데이트가 다운로드되었습니다. 지금 설치하시겠습니까?'
  error: '업데이트 중 오류가 발생했습니다.'
  errorMessage: '업데이트 중 오류가 발생했습니다: 콘솔을 확인해주세요.'
  later: '나중에'
  update: '업데이트'
  installNow: '지금 설치'
  close: '닫기'
  testUpdate: '업데이트 테스트'
  restartTitle: '재시작 필요'
  restartMessage: '업데이트를 적용하려면 앱을 재시작해야 합니다.'
  restart: '재시작'
  updateSimulationComplete: '업데이트 시뮬레이션이 완료되었습니다.'
en:
  title: 'Update Notification'
  newVersionMessage: 'New version available: v{version}.'
  newVersionAddedMessage: 'To apply the update, you need to enable automatic updates in the settings and restart the app.'
  confirmUpdate: 'Would you like to proceed with the update?'
  downloading: 'Downloading... {percent}%'
  downloadComplete: 'Update has been downloaded. Would you like to install it now?'
  error: 'An error occurred during update:'
  errorMessage: 'An error occurred during update: Check the console.'
  later: 'Later'
  update: 'Update'
  installNow: 'Install Now'
  close: 'Close'
  testUpdate: 'Test Update'
  restartTitle: 'Restart Required'
  restartMessage: 'The application needs to restart to apply the update.'
  restart: 'Restart'
  updateSimulationComplete: 'Update simulation complete.'
ja:
  title: 'アップデート通知'
  newVersionMessage: '新しいバージョンがあります: v{version}'
  newVersionAddedMessage: 'アップデートを適用するには、設定で自動アップデートを有効にしてアプリを再起動してください。'
  confirmUpdate: 'アップデートを続行しますか？'
  downloading: 'ダウンロード中... {percent}%'
  downloadComplete: 'アップデートがダウンロードされました。今すぐインストールしますか？'
  error: 'アップデート中にエラーが発生しました：'
  errorMessage: 'アップデート中にエラーが発生しました：コンソールを確認してください。'
  later: '後で'
  update: 'アップデート'
  installNow: '今すぐインストール'
  close: '閉じる'
  testUpdate: 'アップデートテスト'
  restartTitle: '再起動が必要です'
  restartMessage: 'アップデートを適用するにはアプリの再起動が必要です。'
  restart: '再起動'
  updateSimulationComplete: 'アップデートシミュレーションが完了しました。'
zh:
  title: '更新通知'
  newVersionMessage: '有新版本可用: v{version}'
  newVersionAddedMessage: '要应用更新，请在设置中启用自动更新并重启应用。'
  confirmUpdate: '是否继续更新？'
  downloading: '下载中... {percent}%'
  downloadComplete: '更新已下载。是否立即安装？'
  error: '更新过程中发生错误：'
  errorMessage: '更新过程中发生错误：请检查控制台。'
  later: '稍后'
  update: '更新'
  installNow: '立即安装'
  close: '关闭'
  testUpdate: '测试更新'
  restartTitle: '需要重启'
  restartMessage: '需要重启应用以应用更新。'
  restart: '重启'
  updateSimulationComplete: '更新模拟已完成。'
hi:
  title: 'अपडेट सूचना'
  newVersionMessage: 'नया संस्करण उपलब्ध: v{version}'
  newVersionAddedMessage: 'अपडेट लागू करने के लिए, सेटिंग्स में स्वचालित अपडेट सक्षम करें और ऐप को पुनरारंभ करें।'
  confirmUpdate: 'क्या आप अपडेट जारी रखना चाहते हैं?'
  downloading: 'डाउनलोड हो रहा है... {percent}%'
  downloadComplete: 'अपडेट डाउनलोड हो गया। क्या आप अभी इंस्टॉल करना चाहते हैं?'
  error: 'अपडेट के दौरान त्रुटि हुई:'
  errorMessage: 'अपडेट के दौरान त्रुटि हुई: कृपया कंसोल जांचें।'
  later: 'बाद में'
  update: 'अपडेट'
  installNow: 'अभी इंस्टॉल करें'
  close: 'बंद करें'
  testUpdate: 'अपडेट परीक्षण'
  restartTitle: 'पुनरारंभ आवश्यक'
  restartMessage: 'अपडेट लागू करने के लिए ऐप को पुनरारंभ करना होगा।'
  restart: 'पुनरारंभ'
  updateSimulationComplete: 'अपडेट सिमुलेशन पूर्ण।'
de:
  title: 'Update-Benachrichtigung'
  newVersionMessage: 'Neue Version verfügbar: v{version}'
  newVersionAddedMessage: 'Um das Update anzuwenden, aktivieren Sie automatische Updates in den Einstellungen und starten Sie die App neu.'
  confirmUpdate: 'Möchten Sie mit dem Update fortfahren?'
  downloading: 'Wird heruntergeladen... {percent}%'
  downloadComplete: 'Update wurde heruntergeladen. Möchten Sie es jetzt installieren?'
  error: 'Beim Update ist ein Fehler aufgetreten:'
  errorMessage: 'Beim Update ist ein Fehler aufgetreten: Überprüfen Sie die Konsole.'
  later: 'Später'
  update: 'Aktualisieren'
  installNow: 'Jetzt installieren'
  close: 'Schließen'
  testUpdate: 'Update testen'
  restartTitle: 'Neustart erforderlich'
  restartMessage: 'Die Anwendung muss neu gestartet werden, um das Update anzuwenden.'
  restart: 'Neustart'
  updateSimulationComplete: 'Update-Simulation abgeschlossen.'
es:
  title: 'Notificación de actualización'
  newVersionMessage: 'Nueva versión disponible: v{version}'
  newVersionAddedMessage: 'Para aplicar la actualización, habilite las actualizaciones automáticas en la configuración y reinicie la aplicación.'
  confirmUpdate: '¿Desea continuar con la actualización?'
  downloading: 'Descargando... {percent}%'
  downloadComplete: 'La actualización se ha descargado. ¿Desea instalarla ahora?'
  error: 'Se produjo un error durante la actualización:'
  errorMessage: 'Se produjo un error durante la actualización: Revise la consola.'
  later: 'Más tarde'
  update: 'Actualizar'
  installNow: 'Instalar ahora'
  close: 'Cerrar'
  testUpdate: 'Probar actualización'
  restartTitle: 'Reinicio necesario'
  restartMessage: 'La aplicación necesita reiniciarse para aplicar la actualización.'
  restart: 'Reiniciar'
  updateSimulationComplete: 'Simulación de actualización completada.'
fr:
  title: 'Notification de mise à jour'
  newVersionMessage: 'Nouvelle version disponible : v{version}'
  newVersionAddedMessage: "Pour appliquer la mise à jour, activez les mises à jour automatiques dans les paramètres et redémarrez l'application."
  confirmUpdate: 'Souhaitez-vous procéder à la mise à jour ?'
  downloading: 'Téléchargement en cours... {percent}%'
  downloadComplete: "La mise à jour a été téléchargée. Voulez-vous l'installer maintenant ?"
  error: 'Une erreur est survenue lors de la mise à jour :'
  errorMessage: 'Une erreur est survenue lors de la mise à jour : Vérifiez la console.'
  later: 'Plus tard'
  update: 'Mettre à jour'
  installNow: 'Installer maintenant'
  close: 'Fermer'
  testUpdate: 'Tester la mise à jour'
  restartTitle: 'Redémarrage nécessaire'
  restartMessage: "L'application doit être redémarrée pour appliquer la mise à jour."
  restart: 'Redémarrer'
  updateSimulationComplete: 'Simulation de mise à jour terminée.'
</i18n>
