/**
 * @file useSettingsManager.ts
 * @description 여러 Pinia 스토어에 분산된 설정을 중앙에서 관리하는 Composable입니다.
 *              설정의 취합, 적용, 초기화 및 내보내기/가져오기 로직을 담당합니다.
 */

import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import { useSettingsStore } from 'src/stores/settingsStore';
import { useThemesStore } from 'src/stores/themesStore';
import { useCalcStore } from 'src/stores/calcStore';
import { useCurrencyStore } from 'src/stores/currencyStore';
import { useRadixStore } from 'src/stores/radixStore';
import { useUnitStore } from 'src/stores/unitStore';
import { useUIStore } from 'src/stores/uiStore';

// 설정에 포함할 스토어 목록
const stores = {
  settings: useSettingsStore,
  themes: useThemesStore,
  calc: useCalcStore,
  currency: useCurrencyStore,
  radix: useRadixStore,
  unit: useUnitStore,
  ui: useUIStore,
};

type StoreKeys = keyof typeof stores;

export function useSettingsManager() {
  const $q = useQuasar();
  const { t } = useI18n({ useScope: 'global' });
  const $g = window.globalVars;

  const gatherSettings = (): Record<StoreKeys, unknown> => {
    const settingsToExport: { [K in StoreKeys]?: (state: Record<string, unknown>) => Record<string, unknown> } = {
      settings: (state) => ({ ...state }),
      themes: (state) => ({ ...state }),
      calc: (state) => ({ isMemoryVisible: state.isMemoryVisible, isShiftLocked: state.isShiftLocked }),
      currency: (state) => ({
        sourceCurrency: state.sourceCurrency,
        targetCurrency: state.targetCurrency,
        showSymbol: state.showSymbol,
        favoriteCurrencies: state.favoriteCurrencies,
      }),
      radix: (state) => ({
        wordSize: state.wordSize,
        sourceRadix: state.sourceRadix,
        targetRadix: state.targetRadix,
        showRadix: state.showRadix,
        radixType: state.radixType,
      }),
      unit: (state) => ({ ...state }),
      ui: (state) => ({ showTips: state.showTips, showTipsDialog: state.showTipsDialog, currentTab: state.currentTab }),
    };

    const allSettings = {} as Record<StoreKeys, unknown>;
    for (const key in stores) {
      const storeKey = key as StoreKeys;
      const store = stores[storeKey]();
      const stateAsRecord = store.$state as unknown as Record<string, unknown>; // Cast once
      if (settingsToExport[storeKey]) {
        allSettings[storeKey] = settingsToExport[storeKey]!(stateAsRecord);
      } else {
        allSettings[storeKey] = stateAsRecord;
      }
    }
    return allSettings;
  };

  const applySettings = (newSettings: Record<string, unknown>): boolean => {
    try {
      for (const key in newSettings) {
        const storeKey = key as StoreKeys;
        if (stores[storeKey]) {
          const store = stores[storeKey]();
          const settingsForStore = newSettings[key];

          if (settingsForStore && typeof settingsForStore === 'object' && !Array.isArray(settingsForStore)) {
            (store.$patch as (partialState: Record<string, unknown>) => void)(
              settingsForStore as Record<string, unknown>,
            );
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to apply settings:', error);
      return false;
    }
  };

  const resetSettings = () => {
    for (const key in stores) {
      const storeKey = key as StoreKeys;
      const store = stores[storeKey]();
      store.$reset();
    }
  };

  const exportSettings = async () => {
    try {
      const settings = gatherSettings();
      const jsonString = JSON.stringify(settings, null, 2);

      if ($g.isCapacitor) {
        $q.dialog({
          title: t('exportSettings.exportMethodTitle'),
          message: t('exportSettings.exportMethodMessage'),
          ok: {
            label: t('exportSettings.saveToDevice'),
            flat: true,
          },
          cancel: {
            label: t('exportSettings.shareFile'),
            flat: true,
          },
          persistent: true,
        })
          .onOk(async () => {
            // Save to Device
            try {
              const fileName = `qcalc-settings-${Date.now()}.json`;
              await Filesystem.writeFile({
                path: fileName,
                data: jsonString,
                directory: Directory.Documents,
                encoding: Encoding.UTF8,
              });
              $q.notify({
                type: 'positive',
                message: t('exportSettings.successMobile', { fileName: fileName }),
                caption: t('exportSettings.mobileSaveLocation'),
                timeout: 10000,
                actions: [{ icon: 'close', color: 'white' }],
              });
            } catch (e) {
              console.error('Error saving file on Capacitor:', e);
              $q.notify({ type: 'negative', message: t('exportSettings.fail') });
            }
          })
          .onCancel(async () => {
            // Share File
            try {
              const result = await Filesystem.writeFile({
                path: `qcalc-settings-${Date.now()}.json`,
                data: jsonString,
                directory: Directory.Cache,
                encoding: Encoding.UTF8,
              });
              await Share.share({
                title: t('exportSettings.shareTitle'),
                text: t('exportSettings.shareText'),
                files: [result.uri],
                dialogTitle: t('exportSettings.shareDialogTitle'),
              });
            } catch (error: unknown) {
              if ((error as Error)?.message !== 'Share canceled') {
                console.error('Capacitor file write or share error:', error);
                $q.notify({ type: 'negative', message: t('exportSettings.fail') });
              } else {
                $q.notify({ type: 'info', message: t('exportSettings.cancelled') });
              }
            }
          });
      } else {
        // Web export
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
        if (window.showSaveFilePicker) {
          try {
            const handle = await window.showSaveFilePicker({
              suggestedName: 'qcalc-settings.json',
              types: [
                {
                  description: 'JSON Files',
                  accept: { 'application/json': ['.json'] },
                },
              ],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            $q.notify({ type: 'positive', message: t('exportSettings.success') });
          } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') {
              $q.notify({ type: 'info', message: t('exportSettings.cancelled') });
            } else {
              $q.notify({ type: 'negative', message: t('exportSettings.fail') });
            }
          }
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'qcalc-settings.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          $q.notify({ type: 'positive', message: t('exportSettings.success') });
        }
      }
    } catch (error) {
      console.error('General export error:', error);
      $q.notify({ type: 'negative', message: t('exportSettings.fail') });
    }
  };

  return {
    applySettings,
    resetSettings,
    exportSettings,
  };
}
