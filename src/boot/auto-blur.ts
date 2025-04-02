 // Start Generation Here
  /**
   * @file auto-blur.ts
   * @description 이 파일은 Vue 애플리케이션에서 자동으로 포커스를 잃게 하는 디렉티브를 정의합니다.
   *              사용자가 특정 요소에 포커스할 때 해당 요소가 자동으로 블러 처리되어
   *              포커스가 다른 요소로 이동하게 됩니다. 이 기능은 사용자 경험을 향상시키기 위해
   *              특정 상황에서 포커스를 제어할 수 있도록 도와줍니다.
   */

import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ app }) => {
  // 해당 요소에 포커스가 들어오면 blur 이벤트를 발생시킵니다.
  app.directive('auto-blur', {
    mounted: (el: HTMLElement) => {
      el.addEventListener('focusin', (ev) => {
        (ev.target as HTMLElement)?.blur();
      });
    },
  });
});
