<script setup lang="ts">
  /**
   * @file VersionChangelogDialog.vue
   * @description 최초 실행 시 현재 버전의 CHANGELOG를 로컬 AboutPage md 파일에서
   *              파싱하여 표시하는 컴포넌트입니다.
   *              snap, Android, 개발 모드에서 동작합니다.
   */

  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useUIStore } from 'stores/uiStore';
  import { useDialogStyle } from 'src/composables/useDialogStyle';

  // 언어별 AboutPage md 파일 import
  import AboutMdEn from '../../content/pages/AboutPage-en.md';
  import AboutMdKo from '../../content/pages/AboutPage-ko.md';
  import AboutMdJa from '../../content/pages/AboutPage-ja.md';
  import AboutMdZh from '../../content/pages/AboutPage-zh.md';
  import AboutMdHi from '../../content/pages/AboutPage-hi.md';
  import AboutMdDe from '../../content/pages/AboutPage-de.md';
  import AboutMdEs from '../../content/pages/AboutPage-es.md';
  import AboutMdFr from '../../content/pages/AboutPage-fr.md';

  const uiStore = useUIStore();
  const { getButtonTextColor } = useDialogStyle();
  const { t, locale } = useI18n();

  const $g = window.globalVars;

  const showDialog = ref(false);

  // 언어별 md 맵 (AboutPage.vue와 동일한 패턴)
  const aboutMdMap: Record<string, string> = {
    ko: AboutMdKo,
    ja: AboutMdJa,
    zh: AboutMdZh,
    hi: AboutMdHi,
    de: AboutMdDe,
    es: AboutMdEs,
    fr: AboutMdFr,
  };

  const currentMd = computed(() => {
    const lang = locale.value.substring(0, 2);
    return aboutMdMap[lang] ?? AboutMdEn;
  });

  /**
   * 현재 로케일의 AboutPage md에서 최신 버전 changelog만 추출
   */
  const changelogContent = computed(() => {
    const md = currentMd.value;
    // 첫 번째 버전 섹션만 추출 (예: ## [0.12.0] 2026-03-22 ~ 다음 ## [ 전까지)
    const versionRegex = /(## \[\d+\.\d+\.\d+\][^\n]*\n[\s\S]*?)(?=\n## \[|$)/;
    const match = md.match(versionRegex);
    return match?.[1]?.trim() ?? '';
  });

  /**
   * 버전 체크 및 CHANGELOG 표시
   */
  const checkVersionAndShowChangelog = () => {
    if (!$g.isDev && !$g.isSnap && !$g.isAndroid) {
      return;
    }

    // 이 버전의 CHANGELOG를 아직 본 적이 없으면 표시
    if (uiStore.lastSeenChangelogVersion !== $g.version && changelogContent.value) {
      showDialog.value = true;
    }
  };

  const handleConfirm = () => {
    uiStore.updateLastSeenChangelogVersion($g.version);
    showDialog.value = false;
  };

  const testShowChangelog = () => {
    uiStore.updateLastSeenChangelogVersion('');
    checkVersionAndShowChangelog();
  };

  onMounted(() => {
    setTimeout(() => {
      checkVersionAndShowChangelog();
    }, 1000);
  });
</script>

<template>
  <q-dialog v-model="showDialog" persistent role="dialog" :aria-label="t('dialogTitle')">
    <q-card class="changelog-dialog">
      <q-card-section class="dialog-header">
        <div class="text-h6">{{ t('dialogTitle') }}</div>
        <div class="text-caption">{{ t('currentVersionMessage', { version: $g.version }) }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="dialog-body">
        <div class="changelog-content scrollbar-custom">
          <q-markdown :src="changelogContent" no-linkify />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
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
  dialogTitle: '새 버전 변경사항'
  currentVersionMessage: '현재 버전: v{version}'
  confirm: '확인'
  testChangelog: 'CHANGELOG 테스트'
en:
  dialogTitle: "What's New"
  currentVersionMessage: 'Current version: v{version}'
  confirm: 'OK'
  testChangelog: 'Test Changelog'
ja:
  dialogTitle: '新バージョンの変更点'
  currentVersionMessage: '現在のバージョン: v{version}'
  confirm: '確認'
  testChangelog: 'CHANGELOGテスト'
zh:
  dialogTitle: '新版本更新内容'
  currentVersionMessage: '当前版本: v{version}'
  confirm: '确认'
  testChangelog: 'CHANGELOG测试'
hi:
  dialogTitle: 'नए संस्करण में बदलाव'
  currentVersionMessage: 'वर्तमान संस्करण: v{version}'
  confirm: 'ठीक है'
  testChangelog: 'CHANGELOG परीक्षण'
de:
  dialogTitle: 'Neuerungen'
  currentVersionMessage: 'Aktuelle Version: v{version}'
  confirm: 'OK'
  testChangelog: 'CHANGELOG testen'
es:
  dialogTitle: 'Novedades'
  currentVersionMessage: 'Versión actual: v{version}'
  confirm: 'Aceptar'
  testChangelog: 'Probar CHANGELOG'
fr:
  dialogTitle: 'Nouveautés'
  currentVersionMessage: 'Version actuelle : v{version}'
  confirm: 'OK'
  testChangelog: 'Tester le CHANGELOG'
</i18n>
