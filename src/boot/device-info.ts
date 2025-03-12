/**
 * @file device-info.ts
 * @description 이 파일은 Capacitor를 사용하여 모바일 디바이스 정보를 관리하고
 *              전역 window 객체에 할당하는 부트스트랩 파일입니다.
 */

import { Device } from '@capacitor/device';
import { ScreenReader } from '@capacitor/screen-reader';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Platform } from 'quasar';
import { defineBoot } from '#q-app/wrappers';

// 타입 정의
export type OrientationType = 'portrait' | 'landscape';

// 네이티브에서 전달한 디바이스 정보 타입 정의
export interface NativeDeviceInfo {
  isTablet: boolean;
  isPhone: boolean;
  isFoldable: boolean;
  textZoomLevel: number;
}

// 디바이스 정보 타입 정의
export interface DeviceInfo {
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
  orientation: OrientationType;
  isScreenReaderEnabled: boolean;
  // 방향 제어 기능
  unlockOrientation: () => Promise<void>;
  lockToPortrait: () => Promise<void>;
  lockToLandscape: () => Promise<void>;
}

// AndroidInterface 타입 정의
export interface NativeAndroidInterface {
  isTablet(): boolean;
  isPhone(): boolean;
  isFoldable(): boolean;
  lockToPortrait(): void;
  lockToLandscape(): void;
  unlockOrientation(): void;
}

// 전역 객체 타입
type GlobalWithDeviceInfo = {
  deviceInfo: DeviceInfo | null;
  nativeDeviceInfo: NativeDeviceInfo | null;
  AndroidInterface: NativeAndroidInterface | null;
};

// 전역 객체 초기화
(window as unknown as GlobalWithDeviceInfo).deviceInfo = null;
(window as unknown as GlobalWithDeviceInfo).nativeDeviceInfo = null;
(window as unknown as GlobalWithDeviceInfo).AndroidInterface = null;

export default defineBoot(async () => {
  if (!Platform.is.capacitor) return;

  try {
    // 디바이스 정보 가져오기
    const info = await Device.getInfo();
    const screenReaderStatus = await ScreenReader.isEnabled();

    // 디바이스 타입 판별 - 네이티브 정보가 있으면 우선 사용
    let isTablet = false;
    let isPhone = false;
    let isFoldable = false;

    // 안드로이드에서 전달한 정보가 있는지 확인
    const global = window as unknown as GlobalWithDeviceInfo;
    const androidInterface = global.AndroidInterface;
    const nativeDeviceInfo = global.nativeDeviceInfo;

    if (androidInterface) {
      // Android JavascriptInterface 사용
      isTablet = androidInterface.isTablet();
      isPhone = androidInterface.isPhone();
      isFoldable = androidInterface.isFoldable();
      console.log('AndroidInterface를 통해 디바이스 정보를 가져왔습니다:', { isTablet, isPhone, isFoldable });
    } else if (nativeDeviceInfo) {
      // WebViewClient를 통해 주입된 정보 사용
      isTablet = nativeDeviceInfo.isTablet;
      isPhone = nativeDeviceInfo.isPhone;
      isFoldable = nativeDeviceInfo.isFoldable;
      console.log('nativeDeviceInfo를 통해 디바이스 정보를 가져왔습니다:', nativeDeviceInfo);
    } else {
      // 웹뷰에서 자체 판별 (기존 코드 사용)
      isTablet =
        info.platform === 'android'
          ? window.innerWidth >= 600 || window.innerHeight >= 600
          : info.model.includes('iPad');
      isPhone = !isTablet;
      isFoldable = info.model.toLowerCase().includes('fold') || info.model.toLowerCase().includes('flip');
      console.log('자체 판별한 디바이스 정보:', { isTablet, isPhone, isFoldable });
    }

    // 방향 제어 함수
    const lockToPortrait = async (): Promise<void> => {
      try {
        if (androidInterface) {
          androidInterface.lockToPortrait();
        } else {
          await ScreenOrientation.lock({ orientation: 'portrait' });
        }
        console.log('화면이 세로 모드로 고정되었습니다.');
      } catch (error) {
        console.error('화면 방향 고정 실패:', error);
      }
    };

    const lockToLandscape = async (): Promise<void> => {
      try {
        if (androidInterface) {
          androidInterface.lockToLandscape();
        } else {
          await ScreenOrientation.lock({ orientation: 'landscape' });
        }
        console.log('화면이 가로 모드로 고정되었습니다.');
      } catch (error) {
        console.error('화면 방향 고정 실패:', error);
      }
    };

    const unlockOrientation = async (): Promise<void> => {
      try {
        if (androidInterface) {
          androidInterface.unlockOrientation();
        } else {
          await ScreenOrientation.unlock();
        }
        console.log('화면 방향 고정이 해제되었습니다.');
      } catch (error) {
        console.error('화면 방향 고정 해제 실패:', error);
      }
    };

    // 디바이스 정보 객체 생성
    const appDeviceInfo: DeviceInfo = {
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
      unlockOrientation,
      lockToPortrait,
      lockToLandscape,
    };

    // window 객체에 할당
    (window as unknown as GlobalWithDeviceInfo).deviceInfo = appDeviceInfo;

    // 화면 방향 변경 이벤트 리스너
    window.addEventListener('resize', () => {
      const global = window as unknown as GlobalWithDeviceInfo;
      const deviceInfo = global.deviceInfo;
      if (!deviceInfo) return;

      const newOrientation: OrientationType = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      if (deviceInfo.orientation !== newOrientation) {
        (window as unknown as GlobalWithDeviceInfo).deviceInfo = {
          ...deviceInfo,
          orientation: newOrientation,
        };
      }
    });

    // 스크린리더 상태 변경 이벤트 리스너
    ScreenReader.addListener('stateChange', (state) => {
      const global = window as unknown as GlobalWithDeviceInfo;
      const deviceInfo = global.deviceInfo;
      if (!deviceInfo) return;

      (window as unknown as GlobalWithDeviceInfo).deviceInfo = {
        ...deviceInfo,
        isScreenReaderEnabled: state.value,
      };
    });

    // 휴대폰인 경우 세로 모드로 고정
    if (isPhone && !androidInterface) {
      await lockToPortrait();
    }
  } catch (error) {
    console.error('Failed to initialize device info:', error);
  }
});
