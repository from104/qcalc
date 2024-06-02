import { Platform } from 'quasar';
import { boot } from 'quasar/wrappers';
import { App as CapacitorApp } from 'capacitor/@capacitor/app';

import { i18n } from 'src/i18n/initLocale';
const t = (key: string) => {
  return i18n.global.t(key);
};

import { useCalcStore } from 'src/stores/calc-store';
const store = useCalcStore();

let willExitApp: boolean = false;

export default boot(() => {
  if (Platform.is.capacitor) {
    CapacitorApp.addListener('backButton', async ({canGoBack}) => {
      if (canGoBack) {
        return;
      } 
      if (willExitApp) {
        try {
          await CapacitorApp.exitApp();
        } catch (e) {
          console.error(e);
        }
      } else {
        store.notifyMsg(t('message.willExitApp'), 1000, 'bottom');
        willExitApp = true;
        setTimeout(() => {
          willExitApp = false;
        }, 2000);
      }
    });
  }
});
