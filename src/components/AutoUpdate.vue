<script setup lang="ts">
  /**
   * @file AutoUpdate.vue
   * @description 이 파일은 자동 업데이트 기능을 관리하는 Vue 컴포넌트입니다.
   *              업데이트 확인, 다운로드 및 설치와 같은 기능을 처리합니다.
   */
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { showError, showMessage } from 'src/classes/utils/NotificationUtils';

  // 전역 window 객체에 접근하기 위한 상수 선언
  const window = globalThis.window;

  // 스토어 인스턴스 생성
  const store = window.store;

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
    if (!store.autoUpdate) {
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
    if (window.isDev) {
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
    if (window.isDev) {
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
    if (window.isDev) {
      handleUpdateStatus('available', testUpdateInfo);
    } else {
      window.electronUpdater.testUpdate();
    }
  };

  // 컴포넌트가 마운트될 때 실행
  onMounted(() => {
    // Electron 환경에서만 업데이트 리스너 등록
    if (window.isElectron && !window.isSnap) {
      window.electronUpdater.onUpdateStatus(handleUpdateStatus);

      // 개발 모드가 아닐 때만 업데이트 확인
      if (!window.isDev) {
        window.electronUpdater.checkForUpdates();
      }
    }
  });

  // 컴포넌트가 언마운트될 때 실행
  onUnmounted(() => {
    // Electron 환경에서만 리스너 제거
    if (window.isElectron && !window.isSnap) {
      window.electronUpdater.removeUpdateStatusListener();
    }
  });
</script>

<template>
  <!-- Electron 환경에서만 업데이트 관련 UI 표시 -->
  <template v-if="window.isElectron && !window.isSnap">
    <q-dialog v-model="updateDialog" persistent>
      <q-card style="min-width: 350px; margin-top: 25px">
        <q-card-section>
          <div class="text-h6">{{ t('title') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <template v-if="updateStatus === 'available'">
            <p>{{ t('newVersionMessage', { version: updateInfo?.version }) }}</p>
            <q-markdown :src="updateInfo?.releaseNotes || ''" class="q-mb-lg" no-linkify />
            <p>{{ t('confirmUpdate') }}</p>
          </template>
          <template v-else-if="updateStatus === 'progress'">
            <p>{{ t('downloading', { percent: Math.round(updateProgress?.percent || 0) }) }}</p>
            <q-linear-progress :value="(updateProgress?.percent || 0) / 100" />
          </template>
          <template v-else-if="updateStatus === 'downloaded'">
            <p>{{ t('downloadComplete') }}</p>
          </template>
          <template v-else-if="updateStatus === 'error'">
            <p>{{ t('error') }}</p>
            <p>{{ t('errorMessage') }}</p>
          </template>
        </q-card-section>

        <q-card-actions align="right">
          <template v-if="updateStatus === 'available'">
            <q-btn
              v-close-popup
              flat
              :label="t('later')"
              color="primary"
              :text-color="store.isDarkMode() ? 'blue-grey-2' : 'primary'"
              class="q-mr-sm"
            />
            <q-btn
              flat
              :label="t('update')"
              color="primary"
              :text-color="store.isDarkMode() ? 'blue-grey-2' : 'primary'"
              @click="startUpdate"
            />
          </template>
          <template v-else-if="updateStatus === 'downloaded'">
            <q-btn
              v-close-popup
              flat
              :label="t('later')"
              color="primary"
              :text-color="store.isDarkMode() ? 'blue-grey-2' : 'primary'"
              class="q-mr-sm"
            />
            <q-btn
              flat
              :label="t('installNow')"
              color="primary"
              :text-color="store.isDarkMode() ? 'blue-grey-2' : 'primary'"
              @click="installUpdate"
            />
          </template>
          <template v-else-if="updateStatus === 'error'">
            <q-btn
              v-close-popup
              flat
              :label="t('close')"
              color="primary"
              :text-color="store.isDarkMode() ? 'blue-grey-2' : 'primary'"
            />
          </template>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- 개발 환경에서만 표시되는 테스트 버튼 -->
    <q-btn
      v-if="window.isDev"
      class="fixed-bottom-right q-ma-md"
      color="primary"
      icon="refresh"
      :aria-label="t('testUpdate')"
      @click="testUpdate"
    />
  </template>
</template>

<i18n lang="yaml5">
  ko:
    title: 업데이트 알림
    newVersionMessage: '새로운 버전이 있습니다: v{version}.'
    newVersionAddedMessage: '업데이트를 위해서는 설정에서 자동 업데이트를 활성화하고 앱을 재시작해야 합니다.'
    confirmUpdate: 업데이트를 진행하시겠습니까?
    downloading: '다운로드 중... {percent}%'
    downloadComplete: 업데이트가 다운로드되었습니다. 지금 설치하시겠습니까?
    error: '업데이트 중 오류가 발생했습니다.'
    errorMessage: '업데이트 중 오류가 발생했습니다: 콘솔을 확인해주세요.'
    later: 나중에
    update: 업데이트
    installNow: 지금 설치
    close: 닫기
    testUpdate: 업데이트 테스트
    restartTitle: 재시작 필요
    restartMessage: 업데이트를 적용하려면 앱을 재시작해야 합니다.
    restart: 재시작
    updateSimulationComplete: 업데이트 시뮬레이션이 완료되었습니다.
  en:
    title: Update Notification
    newVersionMessage: 'New version available: v{version}.'
    newVersionAddedMessage: 'To apply the update, you need to enable automatic updates in the settings and restart the app.'
    confirmUpdate: Would you like to proceed with the update?
    downloading: 'Downloading... {percent}%'
    downloadComplete: Update has been downloaded. Would you like to install it now?
    error: 'An error occurred during update:'
    errorMessage: 'An error occurred during update: Check the console.'
    later: Later
    update: Update
    installNow: Install Now
    close: Close
    testUpdate: Test Update
    restartTitle: Restart Required
    restartMessage: The application needs to restart to apply the update.
    restart: Restart
    updateSimulationComplete: Update simulation complete.
</i18n>
