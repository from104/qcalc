/**
 * @file global-variables.ts
 * @description 이 파일은 애플리케이션의 전역 변수를 정의하고 설정하는 부트스트랩 파일입니다.
 *              Quasar 프레임워크와 Pinia 스토어를 사용하여 애플리케이션의 다양한 플랫폼 정보를
 *              수집하고, 이를 전역 변수로 설정하여 다른 컴포넌트에서 쉽게 접근할 수 있도록 합니다.
 *              또한, 불변 속성을 정의하는 유틸리티 함수를 포함하여, 전역 변수의 변경을 방지합니다.
 */

import { defineBoot } from '#q-app/wrappers';
import { Platform } from 'quasar';
import { version } from '../../package.json';

// 불변 속성 정의 함수
import { defineImmutableProperty } from 'src/utils/GlobalHelpers';

// 설정 스토어 import
import { useSettingsStore } from 'src/stores/settingsStore';

// 불변 속성 정의 함수
// const defineImmutableProperty = <T>(obj: object, prop: string, value: T) => {
//   Object.defineProperty(obj, prop, {
//     value, // 값 설정
//     writable: false, // 값 변경 불가
//     configurable: false, // 속성 재정의 불가
//     enumerable: true, // 열거 가능
//   });
// };

export default defineBoot(() => {
  // globalVars 객체 생성
  const globalVars = {
    // 개발 모드 여부
    isDev: !!import.meta.env.DEV,

    // 플랫폼 정보
    isDesktop: Platform.is.desktop,
    isMobile: Platform.is.mobile,
    isWindows: Platform.is.win,
    isLinux: Platform.is.linux,
    isMac: Platform.is.mac,
    isAndroid: Platform.is.android,
    isIOS: Platform.is.ios,
    isElectron: Platform.is.electron,
    isCapacitor: Platform.is.capacitor,

    // 디바이스 타입 정보
    isTablet: false,
    isPhone: false,
    isFoldable: false,
    textZoom: 100,

    // 스냅 여부
    isSnap: window.electron?.isSnap ?? false,

    // 버전 정보
    version: version,
  };

  // Capacitor 환경에서 자바스크립트 인터페이스 추가
  if (Platform.is.capacitor) {
    globalVars.isTablet = window.androidInterface?.isTablet() ?? false;
    globalVars.isPhone = window.androidInterface?.isPhone() ?? false;
    globalVars.isFoldable = window.androidInterface?.isFoldable() ?? false;
    globalVars.textZoom = window.androidInterface?.getTextZoom() ?? 100;
  }

  // window.globalVars로 전역 변수 설정
  defineImmutableProperty(window, 'globalVars', globalVars);

  // 설정 스토어 초기화 및 테마 설정
  const settingsStore = useSettingsStore();
  settingsStore.initializeTheme();
});
