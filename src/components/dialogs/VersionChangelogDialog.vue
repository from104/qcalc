<script setup lang="ts">
  /**
   * @file VersionChangelogDialog.vue
   * @description 이 파일은 snap 패키지와 안드로이드 플랫폼에서 최신 버전 체크 및
   *              CHANGELOG 표시를 관리하는 Vue 컴포넌트입니다.
   *              GitHub API를 사용하여 최신 버전 정보를 가져오고,
   *              사용자가 최신 버전을 사용 중일 때 최초 실행 시 변경 사항을 안내합니다.
   *              개발 모드에서는 가상의 정보를 사용하여 테스트 가능합니다.
   */

  import { ref, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import axios from 'axios';
  import { useUIStore } from 'stores/uiStore';
  import { useDialogStyle } from 'src/composables/useDialogStyle';

  const uiStore = useUIStore();
  const { getButtonTextColor } = useDialogStyle();
  const { t } = useI18n();

  // 전역 window 객체에 접근하기 위한 상수 선언
  const $g = window.globalVars;

  // 상태 관리
  const showDialog = ref(false);
  const changelogContent = ref('');
  const latestVersion = ref('');
  const isLoading = ref(false);
  const isLatestVersion = ref(false);

  /**
   * CHANGELOG.md 파일에서 최신 버전의 내용을 추출합니다.
   * @param changelogText - CHANGELOG.md의 전체 텍스트
   * @returns 최신 버전의 변경 사항
   */
  const extractLatestChangelog = (changelogText: string): { version: string; content: string } => {
    // 버전 헤더를 찾는 정규식 (예: ## [0.11.5] 2025-10-07)
    const versionRegex = /## \[(\d+\.\d+\.\d+)\][^\n]*\n([\s\S]*?)(?=\n## \[|$)/;
    const match = changelogText.match(versionRegex);

    if (match) {
      const version = match[1];
      const content = match[2]?.trim() || '';
      return { version: version || '', content: content || '' };
    }

    return { version: '', content: '' };
  };

  /**
   * GitHub API를 사용하여 최신 릴리스 정보를 가져옵니다.
   */
  const fetchLatestRelease = async (): Promise<{ version: string; isLatest: boolean }> => {
    try {
      if ($g.isDev) {
        // 개발 모드에서는 가상 데이터 반환
        return {
          version: $g.version,
          isLatest: true,
        };
      }

      // GitHub API를 사용하여 최신 릴리스 정보 가져오기
      const response = await axios.get('https://api.github.com/repos/from104/qcalc/releases/latest', {
        timeout: 5000,
      });

      const latestReleaseVersion = response.data.tag_name.replace('v', '');
      const currentVersion = $g.version;

      // 버전 비교 (간단한 문자열 비교)
      const isLatest = latestReleaseVersion === currentVersion;

      return {
        version: latestReleaseVersion,
        isLatest,
      };
    } catch (error) {
      console.error('Failed to fetch latest release:', error);
      // 오류 발생 시 현재 버전을 최신으로 간주
      return {
        version: $g.version,
        isLatest: true,
      };
    }
  };

  /**
   * CHANGELOG.md 파일을 가져옵니다.
   */
  const fetchChangelog = async (): Promise<string> => {
    try {
      if ($g.isDev) {
        // 개발 모드에서는 가상 CHANGELOG 데이터 사용
        return `# Changelog

All notable changes to this project are recorded in this file.

The format is based on [Keep a Changelog] and this project follows [Semantic Versioning].

## [${$g.version}] ${new Date().toISOString().split('T')[0]}

### Added

- **Version Check for Snap and Android**: Added automatic version check for Snap packages and Android platforms with changelog notification on first launch of the latest version.
- **Calculation History Font Size Control**: Added a feature to adjust the font size of the calculation history in 3 steps.
- **Settings Management**: Added the ability to reset, export, and import all settings.
- **Calculation History Management**: Added the ability to export and import calculation history as a CSV file.
- **User Theme Customization**: Added the ability for users to create, edit, and delete their own themes.

### Changed

- **Improved version notification system**: Enhanced version checking logic to support platforms without auto-update capability.

### Fixed

- **Calculation History Scroll Bug Fixed**: Fixed a bug where calculation history could not be scrolled using the floating icon or keyboard (Up/Down/PageUp/PageDown/Home/End).

## [0.11.4] 2025-06-10

### Added

- **User Theme Customization**: Added the ability for users to create, edit, and delete their own themes.`;
      }

      // 프로덕션 모드에서는 GitHub raw URL에서 가져오기
      const response = await axios.get('https://raw.githubusercontent.com/from104/qcalc/main/CHANGELOG.md', {
        timeout: 5000,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch CHANGELOG:', error);
      return '';
    }
  };

  /**
   * 버전 체크 및 CHANGELOG 표시 로직
   */
  const checkVersionAndShowChangelog = async () => {
    // 개발 모드가 아니고, snap 또는 Android 플랫폼이 아니면 실행하지 않음
    if (!$g.isDev && !$g.isSnap && !$g.isAndroid) {
      return;
    }

    isLoading.value = true;

    try {
      // 최신 릴리스 정보 가져오기
      const { version, isLatest } = await fetchLatestRelease();
      latestVersion.value = version;
      isLatestVersion.value = isLatest;

      // 현재 버전이 최신 버전이고, 아직 이 버전의 CHANGELOG를 본 적이 없으면 표시
      if (isLatest && uiStore.lastSeenChangelogVersion !== $g.version) {
        // CHANGELOG 파일 가져오기
        const changelogText = await fetchChangelog();

        if (changelogText) {
          // 최신 버전의 내용만 추출
          const { content } = extractLatestChangelog(changelogText);

          if (content) {
            changelogContent.value = `## [${$g.version}]\n\n${content}`;
            showDialog.value = true;
          }
        }
      }
    } catch (error) {
      console.error('Error in version check:', error);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 사용자가 확인 버튼을 클릭했을 때 처리
   */
  const handleConfirm = () => {
    uiStore.updateLastSeenChangelogVersion($g.version);
    showDialog.value = false;
  };

  /**
   * GitHub 릴리스 페이지 열기
   */
  const openReleasePage = () => {
    window.open(`https://github.com/from104/qcalc/releases/tag/v${$g.version}`, '_blank');
  };

  /**
   * 개발 모드에서 강제로 다이얼로그 표시 (테스트용)
   */
  const testShowChangelog = async () => {
    // 버전을 초기화하여 강제로 다이얼로그를 표시
    uiStore.updateLastSeenChangelogVersion('');
    await checkVersionAndShowChangelog();
  };

  // 컴포넌트 마운트 시 실행
  onMounted(() => {
    // 앱이 시작된 후에 버전 체크 실행
    setTimeout(() => {
      checkVersionAndShowChangelog();
    }, 1000);
  });
</script>

<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="changelog-dialog">
      <q-card-section class="dialog-header">
        <div class="text-h6">{{ t('title') }}</div>
        <div class="text-caption text-grey-7">{{ t('currentVersionMessage', { version: $g.version }) }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="dialog-body">
        <div v-if="isLoading" class="text-center q-pa-md">
          <q-spinner color="primary" size="3em" />
          <p class="q-mt-md text-grey-7">{{ t('loading') }}</p>
        </div>
        <div v-else class="changelog-content scrollbar-custom">
          <q-markdown :src="changelogContent" no-linkify />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          :label="t('viewOnGitHub')"
          color="primary"
          :text-color="getButtonTextColor()"
          icon="open_in_new"
          size="md"
          @click="openReleasePage"
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

  <!-- 개발 환경에서만 표시되는 테스트 버튼 -->
  <q-btn
    v-if="$g.isDev"
    class="fixed-bottom-left q-ma-md"
    color="secondary"
    icon="article"
    round
    :aria-label="t('testChangelog')"
    @click="testShowChangelog"
  />
</template>

<style scoped lang="scss">
  @import '../../css/dialog.scss';

  .changelog-dialog {
    @extend .dialog-container;
  }

  .dialog-body {
    padding: 0;
    min-height: 200px;
    max-height: calc(80vh - 180px);

    @media (max-width: 599px) {
      padding: 0;
    }
  }

  .dialog-header {
    .text-h6 {
      margin-bottom: 4px;
    }
  }

  .changelog-content {
    @extend .scrollable-content;
    height: 100%;
    padding: 16px 20px;

    @media (max-width: 599px) {
      padding: 12px 16px;
    }
  }
</style>

<i18n lang="yaml">
ko:
  title: '새 버전 변경사항'
  currentVersionMessage: '현재 버전: v{version}'
  loading: '버전 정보를 확인하는 중...'
  viewOnGitHub: 'GitHub에서 보기'
  confirm: '확인'
  testChangelog: 'CHANGELOG 테스트'
en:
  title: "What's New"
  currentVersionMessage: 'Current version: v{version}'
  loading: 'Checking version information...'
  viewOnGitHub: 'View on GitHub'
  confirm: 'OK'
  testChangelog: 'Test Changelog'
</i18n>
