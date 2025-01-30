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
  // 개발 모드 여부
  defineImmutableProperty(window, 'isDev', !!import.meta.env.DEV);

  // 플랫폼 정보
  defineImmutableProperty(window, 'isDesktop', Platform.is.desktop);
  defineImmutableProperty(window, 'isMobile', Platform.is.mobile);
  defineImmutableProperty(window, 'isWindows', Platform.is.win);
  defineImmutableProperty(window, 'isLinux', Platform.is.linux);
  defineImmutableProperty(window, 'isAndroid', Platform.is.android);
  defineImmutableProperty(window, 'isElectron', Platform.is.electron);
  defineImmutableProperty(window, 'isCapacitor', Platform.is.capacitor);

  defineImmutableProperty(window, 'isSnap', window.electron.isSnap);

  defineImmutableProperty(window, 'version', version);

  // 스토어 인스턴스 (수정 가능)
  window.store = useStore();
});
