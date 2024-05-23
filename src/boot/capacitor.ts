import { Platform } from 'quasar';
import { boot } from 'quasar/wrappers';
import { App } from 'capacitor/@capacitor/app';

import { i18n } from 'src/i18n/initLocale';
const t = (key: string) => {
  return i18n.global.t(key);
};

import { useCalcStore } from 'src/stores/calc-store';
const store = useCalcStore();

let willExitApp: boolean = false;
export default boot(({ app }) => {
  if (Platform.is.capacitor) {
    App.addListener('backButton', async () => {
      if (willExitApp) {
        try {
          await App.exitApp();
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
