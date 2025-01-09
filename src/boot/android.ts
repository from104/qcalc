import { Platform } from 'quasar';
import { defineBoot } from '#q-app/wrappers';
import { App as CapacitorApp } from 'capacitor/app';

// 안드로이드 백버튼 이벤트
export default defineBoot(() => {
  if (Platform.is.android) {
    CapacitorApp.addListener('backButton', async ({ canGoBack }) => {
      if (canGoBack) {
        return;
      }
    });
  }
});
