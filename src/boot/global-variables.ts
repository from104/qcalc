import { defineBoot } from '#q-app/wrappers';
import { Platform } from 'quasar';
import { version } from '../../package.json';

// 전역 변수 정의
import { useStore } from './../stores/store';

// 불변 속성 정의 함수
const defineImmutableProperty = <T>(obj: object, prop: string, value: T) => {
  Object.defineProperty(obj, prop, {
    value,
    writable: false, // 값 변경 불가
    configurable: false, // 속성 재정의 불가
    enumerable: true, // 열거 가능
  });
};

export default defineBoot(() => {
  const globalVariables = {
    // 개발 모드 여부
    isDev: !!import.meta.env.DEV,

    // 플랫폼 정보
    isDesktop: Platform.is.desktop,
    isMobile: Platform.is.mobile,
    isWindows: Platform.is.win,
    isLinux: Platform.is.linux,
    isAndroid: Platform.is.android,
    isElectron: Platform.is.electron,
    isCapacitor: Platform.is.capacitor,

    isSnap: window.electron?.isSnap ?? false,

    version: version,
    store: useStore(),
  };

  // 전역 변수 일괄 정의
  Object.entries(globalVariables).forEach(([key, value]) => {
    defineImmutableProperty(window, key, value);
  });
});
