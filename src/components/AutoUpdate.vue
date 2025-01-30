<script setup lang="ts">
  /**
   * 자동 업데이트 기능을 관리하는 컴포넌트입니다.
   * 업데이트 확인, 다운로드, 설치 등의 기능을 처리합니다.
   */
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import DOMPurify from 'dompurify';

    // 전역 window 객체에 접근하기 위한 상수 선언
  const window = globalThis.window;

  // i18n 설정
  const { t } = useI18n();

  // Quasar 프레임워크 인스턴스 초기화
  const $q = useQuasar();

  // 스토어 인스턴스 생성
  const store = window.store;

  // 상태 관리
  const updateDialog = ref(false);
  const updateStatus = ref<UpdateStatusInfo['status']>('checking');
  const updateInfo = ref<UpdateInfo | null>(null);
  const updateProgress = ref<UpdateProgressInfo | null>(null);
  const updateError = ref<UpdateError | null>(null);

  // 릴리스 노트 sanitize
  const sanitizedReleaseNotes = computed(() =>
    updateInfo.value?.releaseNotes
      ? DOMPurify.sanitize(updateInfo.value.releaseNotes).replace(/h3>/gm, 'h6>').replace(/h2>/gm, 'h5>')
      : '',
  );

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
        store.showMessage(`${newVersionMessage} - ${newVersionAddedMessage}`, 3000);
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
        $q.notify({
          type: 'negative',
          message: t('error'),
          caption: t('errorMessage'),
        });
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
      console.log('개발 모드: 앱 재시작 시뮬레이션');
      updateDialog.value = false;
      store.showMessage(t('updateSimulationComplete'), 3000);
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
    <h2>[0.11.1] 2025-01-29</h2>
    <h3>Added</h3>
    <ul>
      <li>Added temperature units: Delisle (°De), Newton (°N), Romer (°Rø), Réaumur (°Ré).</li>
      <li>Added support for adaptive layout: displays calculation history and sub-panel when the window width increases.</li>
      <li>Added search to calculation history</li>
      <li>Added automatic updates in electron package format</li>
    </ul>
    <h3>Changed</h3>
    <ul>
      <li>Increased currency conversion precision from Number to BigNumber.</li>
      <li>Expanded decimal point display limit up to 16 digits</li>
    </ul>
    <h3>Fixed</h3>
    <ul>
      <li>Fixed display error in percentage functionality.</li>
    </ul>
  `,
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
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-if="updateInfo?.releaseNotes" class="release-notes q-mb-lg" v-html="sanitizedReleaseNotes" />
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

<style scoped lang="scss">
  .release-notes {
    :deep(h5),
    :deep(h6) {
      font-weight: 700;
      margin-top: 0.5em;
      margin-bottom: 0.5em;
      padding: 0;
      line-height: 1;
      background: none;
    }

    :deep(h5) {
      font-size: 1.6em;
    }

    :deep(h6) {
      font-size: 1.4em;
    }
  }
</style>

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
