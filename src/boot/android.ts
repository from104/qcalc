import {Platform} from 'quasar';
import {boot} from 'quasar/wrappers';
import {App as CapacitorApp} from 'capacitor/@capacitor/app';

// 안드로이드 백버튼 이벤트
export default boot(() => {
  if (Platform.is.android) {
    CapacitorApp.addListener('backButton', async ({canGoBack}) => {
      if (canGoBack) {
        return;
      }
    });
  }
});
