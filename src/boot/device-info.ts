/**
 * @file device-info.ts
 * @description 이 파일은 Capacitor를 사용하여 모바일 디바이스 정보를 관리하고
 *              전역 window 객체에 할당하는 부트스트랩 파일입니다.
 */

import { Device } from '@capacitor/device';
import { ScreenReader } from '@capacitor/screen-reader';
import { Platform } from 'quasar';
import { defineImmutableProperty } from 'src/utils/global-helpers';
import { defineBoot } from '#q-app/wrappers';

// 디바이스 정보 타입 정의
interface DeviceInfo {
  // 정적 정보
  model: string;
  platform: string;
  operatingSystem: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
  webViewVersion: string;
  // 디바이스 타입
  isTablet: boolean;
  isPhone: boolean;
  isFoldable: boolean;
  // 화면 관련 정보
  orientation: 'portrait' | 'landscape';
  isScreenReaderEnabled: boolean;
}

export default defineBoot(async () => {
  if (!Platform.is.capacitor) return;

  try {
    // 디바이스 정보 가져오기
    const info = await Device.getInfo();
    const languageCode = await Device.getLanguageCode();
    const screenReaderStatus = await ScreenReader.isEnabled();

    // 디바이스 타입 판별
    const isTablet =
      info.platform === 'android' ? window.innerWidth >= 600 || window.innerHeight >= 600 : info.model.includes('iPad');

    const isPhone = !isTablet;
    const isFoldable = info.model.toLowerCase().includes('fold') || info.model.toLowerCase().includes('flip');

    // 디바이스 정보 객체 생성
    const deviceInfo: DeviceInfo = {
      model: info.model,
      platform: info.platform,
      operatingSystem: info.operatingSystem,
      osVersion: info.osVersion,
      manufacturer: info.manufacturer,
      isVirtual: info.isVirtual,
      webViewVersion: info.webViewVersion,
      isTablet,
      isPhone,
      isFoldable,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      isScreenReaderEnabled: screenReaderStatus.value,
    };

    // 전역 객체에 디바이스 정보 할당
    defineImmutableProperty(window, 'deviceInfo', deviceInfo);

    // 화면 방향 변경 이벤트 리스너
    window.addEventListener('resize', () => {
      if (!window.deviceInfo) return;

      const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      if (window.deviceInfo.orientation !== newOrientation) {
        defineImmutableProperty(window, 'deviceInfo', { ...window.deviceInfo, orientation: newOrientation });
      }
    });

    // 스크린리더 상태 변경 이벤트 리스너
    ScreenReader.addListener('stateChange', (state) => {
      if (!window.deviceInfo) return;

      defineImmutableProperty(window, 'deviceInfo', { ...window.deviceInfo, isScreenReaderEnabled: state.value });
    });
  } catch (error) {
    console.error('Failed to initialize device info:', error);
  }
});
