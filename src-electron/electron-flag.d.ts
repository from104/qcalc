/* eslint-disable */

// 이 파일은 자동 생성된 기능 플래그 파일입니다.
// 제거하거나 변경하면 관련 타입들이 작동하지 않을 수 있습니다.

// Quasar의 기능 플래그 타입을 가져옵니다.
import 'quasar/dist/types/feature-flag';

/**
 * Quasar의 기능 플래그 모듈을 확장합니다.
 * 이 선언은 Quasar 프레임워크에 Electron 지원이 활성화되어 있음을 나타냅니다.
 */
declare module 'quasar/dist/types/feature-flag' {
  /**
   * QuasarFeatureFlags 인터페이스를 확장하여 Electron 지원을 추가합니다.
   */
  interface QuasarFeatureFlags {
    /**
     * Electron 지원이 활성화되어 있음을 나타내는 플래그입니다.
     * 이 값이 true로 설정되면 Quasar 프로젝트에서 Electron 관련 기능을 사용할 수 있습니다.
     */
    electron: true;
  }
}
