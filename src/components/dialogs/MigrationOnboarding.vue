<script setup lang="ts">
  /**
   * @file MigrationOnboarding.vue
   * @description 이 파일은 Tauri 데스크톱 앱의 첫 실행 시 표시되는 데이터 마이그레이션 안내
   *              다이얼로그를 구현한 Vue 컴포넌트입니다. 이전 Electron 버전에서 내보낸 설정
   *              파일(계산 기록 포함)을 가져올 수 있도록 안내하며, 한 번 확인하면 다시
   *              표시되지 않습니다.
   *
   * @note WebKitGTK(Tauri Linux 웹뷰)에는 window.showOpenFilePicker가 없으므로,
   *       SettingCard.vue와 동일하게 숨은 <input type="file"> 폴백 경로를 사용합니다.
   */

  import { ref, useTemplateRef } from 'vue';
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import { useUIStore } from 'stores/uiStore';
  import { useCalcStore } from 'stores/calcStore';
  import { useDialogStyle } from 'src/composables/useDialogStyle';
  import { useSettingsManager } from 'src/composables/useSettingsManager';

  const $g = window.globalVars;
  const $q = useQuasar();
  const uiStore = useUIStore();
  const calcStore = useCalcStore();
  const { getButtonTextColor } = useDialogStyle();
  const { t } = useI18n();
  const { applySettings } = useSettingsManager(t);

  const onboardInput = useTemplateRef<HTMLInputElement>('onboardInput');

  /**
   * 표시 조건: Tauri 플랫폼 + 아직 확인하지 않음 + 기록이 없는 사실상 빈 상태
   */
  const show = ref($g.isTauri && !uiStore.migrationOnboardingSeen && calcStore.calc.record.getCount() === 0);

  /**
   * 가져오기 버튼 클릭 핸들러. showOpenFilePicker가 없는 환경(Tauri Linux)에서는
   * 숨은 파일 입력으로 폴백합니다.
   */
  const openPicker = async () => {
    if (window.showOpenFilePicker) {
      try {
        const [fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              description: 'JSON Files',
              accept: { 'application/json': ['.json'] },
            },
          ],
        });
        if (fileHandle) {
          processFile(await fileHandle.getFile());
        }
      } catch (error: unknown) {
        if (!(error instanceof Error && error.name === 'AbortError')) {
          console.error(error);
          $q.notify({ type: 'negative', message: t('importFail') });
        }
      }
    } else {
      onboardInput.value?.click();
    }
  };

  /**
   * 숨은 파일 입력의 change 이벤트 핸들러
   */
  const onFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) {
      processFile(file);
    }
  };

  /**
   * 선택된 파일을 읽어 설정을 적용합니다.
   */
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (applySettings(parsed)) {
          uiStore.markMigrationOnboardingSeen();
          $q.notify({ type: 'positive', message: t('importOk') });
          window.location.reload();
        } else {
          throw new Error('invalid settings format');
        }
      } catch (error) {
        console.error(error);
        $q.notify({ type: 'negative', message: t('importFail') });
      }
    };
    reader.readAsText(file);
  };

  /**
   * 다시 보지 않기 버튼 클릭 핸들러
   */
  const dismiss = () => {
    uiStore.markMigrationOnboardingSeen();
    show.value = false;
  };
</script>

<template>
  <q-dialog v-if="$g.isTauri" v-model="show" persistent role="dialog" :aria-label="t('migrationTitle')">
    <q-card class="migration-dialog">
      <q-card-section class="dialog-header">
        <div class="text-h6">{{ t('migrationTitle') }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="dialog-body">
        <div class="notice-content">{{ t('migrationMessage') }}</div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          :label="t('dismissButton')"
          color="primary"
          :text-color="getButtonTextColor()"
          size="md"
          @click="dismiss"
        />
        <q-btn
          unelevated
          :label="t('importButton')"
          color="primary"
          :text-color="getButtonTextColor(true)"
          icon="file_open"
          size="md"
          @click="openPicker"
        />
      </q-card-actions>
    </q-card>
    <input
      ref="onboardInput"
      type="file"
      style="display: none"
      accept="text/json,.json"
      :aria-label="t('importButton')"
      @change="onFileChange"
    />
  </q-dialog>
</template>

<style scoped lang="scss">
  @import '../../css/dialog.scss';

  .migration-dialog {
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
  migrationTitle: '이전 데이터 가져오기'
  migrationMessage: |
    이전 Q Calc(Electron 버전)에서 설정을 내보내셨다면 지금 가져올 수 있어요. 설정, 테마, 단위/통화/진법 상태와 계산 기록이 모두 복원됩니다.

    내보낸 파일이 없다면 '다시 보지 않기'를 눌러주세요.
  importButton: '가져오기'
  dismissButton: '다시 보지 않기'
  importOk: '데이터를 성공적으로 가져왔습니다.'
  importFail: '데이터를 가져오지 못했습니다.'
en:
  migrationTitle: 'Import Previous Data'
  migrationMessage: |
    If you exported settings from the previous Q Calc (Electron version), you can import them now. Settings, theme, unit/currency/radix state, and calculation history will all be restored.

    If you don't have an exported file, tap "Don't show again".
  importButton: 'Import'
  dismissButton: "Don't show again"
  importOk: 'Data imported successfully.'
  importFail: 'Failed to import data.'
ja:
  migrationTitle: '以前のデータをインポート'
  migrationMessage: |
    以前のQ Calc（Electron版）から設定をエクスポートしている場合、今すぐインポートできます。設定、テーマ、単位・通貨・進数の状態、計算履歴がすべて復元されます。

    エクスポートしたファイルがない場合は「今後表示しない」をタップしてください。
  importButton: 'インポート'
  dismissButton: '今後表示しない'
  importOk: 'データを正常にインポートしました。'
  importFail: 'データのインポートに失敗しました。'
zh:
  migrationTitle: '导入以前的数据'
  migrationMessage: |
    如果您从之前的 Q Calc（Electron 版本）导出过设置，现在可以导入。设置、主题、单位/货币/进制状态以及计算记录都将被恢复。

    如果没有导出文件，请点击"不再显示"。
  importButton: '导入'
  dismissButton: '不再显示'
  importOk: '数据导入成功。'
  importFail: '数据导入失败。'
hi:
  migrationTitle: 'पिछला डेटा आयात करें'
  migrationMessage: |
    यदि आपने पिछले Q Calc (Electron संस्करण) से सेटिंग्स निर्यात की हैं, तो अब आप उन्हें आयात कर सकते हैं। सेटिंग्स, थीम, यूनिट/मुद्रा/आधार स्थिति और गणना इतिहास सभी पुनर्स्थापित हो जाएंगे।

    यदि आपके पास निर्यात की गई फ़ाइल नहीं है, तो 'फिर से न दिखाएं' पर टैप करें।
  importButton: 'आयात करें'
  dismissButton: 'फिर से न दिखाएं'
  importOk: 'डेटा सफलतापूर्वक आयात किया गया।'
  importFail: 'डेटा आयात करने में विफल।'
de:
  migrationTitle: 'Vorherige Daten importieren'
  migrationMessage: |
    Wenn Sie Einstellungen aus der vorherigen Q Calc (Electron-Version) exportiert haben, können Sie sie jetzt importieren. Einstellungen, Theme, Einheiten-/Währungs-/Zahlensystem-Status und Berechnungsverlauf werden alle wiederhergestellt.

    Wenn Sie keine exportierte Datei haben, tippen Sie auf „Nicht mehr anzeigen".
  importButton: 'Importieren'
  dismissButton: 'Nicht mehr anzeigen'
  importOk: 'Daten erfolgreich importiert.'
  importFail: 'Import der Daten fehlgeschlagen.'
es:
  migrationTitle: 'Importar datos anteriores'
  migrationMessage: |
    Si exportó la configuración de la versión anterior de Q Calc (Electron), puede importarla ahora. Se restaurarán la configuración, el tema, el estado de unidades/moneda/base numérica y el historial de cálculos.

    Si no tiene un archivo exportado, toque "No volver a mostrar".
  importButton: 'Importar'
  dismissButton: 'No volver a mostrar'
  importOk: 'Datos importados correctamente.'
  importFail: 'No se pudieron importar los datos.'
fr:
  migrationTitle: 'Importer les données précédentes'
  migrationMessage: |
    Si vous avez exporté les paramètres depuis la version précédente de Q Calc (Electron), vous pouvez les importer maintenant. Les paramètres, le thème, l'état des unités/devises/bases numériques et l'historique des calculs seront tous restaurés.

    Si vous n'avez pas de fichier exporté, appuyez sur « Ne plus afficher ».
  importButton: 'Importer'
  dismissButton: 'Ne plus afficher'
  importOk: 'Données importées avec succès.'
  importFail: "Échec de l'importation des données."
pt:
  migrationTitle: 'Importar dados anteriores'
  migrationMessage: |
    Se você exportou as configurações da versão anterior do Q Calc (Electron), pode importá-las agora. Configurações, tema, estado de unidades/moeda/base numérica e histórico de cálculos serão todos restaurados.

    Se você não tem um arquivo exportado, toque em "Não mostrar novamente".
  importButton: 'Importar'
  dismissButton: 'Não mostrar novamente'
  importOk: 'Dados importados com sucesso.'
  importFail: 'Falha ao importar dados.'
ru:
  migrationTitle: 'Импорт предыдущих данных'
  migrationMessage: |
    Если вы экспортировали настройки из предыдущей версии Q Calc (Electron), вы можете импортировать их сейчас. Настройки, тема, состояние единиц/валюты/системы счисления и история вычислений будут восстановлены.

    Если у вас нет экспортированного файла, нажмите «Больше не показывать».
  importButton: 'Импортировать'
  dismissButton: 'Больше не показывать'
  importOk: 'Данные успешно импортированы.'
  importFail: 'Не удалось импортировать данные.'
</i18n>
