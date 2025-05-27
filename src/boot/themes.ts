/**
 * @file global-variables.ts
 * @description 이 파일은 애플리케이션의 테마 설정을 초기화하는 부트스트랩 파일입니다.
 *              애플리케이션 시작 시 설정 스토어를 사용하여 저장된 테마 설정을 불러오고 적용하여,
 *              사용자가 선택한 테마로 UI가 올바르게 표시되도록 합니다.
 */

// 부트스트랩 함수 임포트
import { defineBoot } from '#q-app/wrappers';

// 설정 스토어 import
import { useSettingsStore } from 'src/stores/settingsStore';

export default defineBoot(() => {
  // 설정 스토어 초기화 및 테마 설정
  const settingsStore = useSettingsStore();
  settingsStore.initializeTheme();
});
