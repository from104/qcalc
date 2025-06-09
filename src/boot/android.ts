/**
 * @file android.ts
 * @description 이 파일은 안드로이드 플랫폼에서의 백버튼 이벤트를 처리하는 부트스트랩 파일입니다.
 *              Quasar 프레임워크와 Capacitor를 사용하여 안드로이드 기기에서의 
 *              사용자 경험을 향상시키기 위해 백버튼 동작을 정의합니다.
 *              사용자가 이전 페이지로 돌아갈 수 있는 경우와 그렇지 않은 경우를 
 *              구분하여 적절한 동작을 수행합니다.
 */

import { Platform } from 'quasar';
import { defineBoot } from '#q-app/wrappers';
import { App as CapacitorApp } from '@capacitor/app';

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
