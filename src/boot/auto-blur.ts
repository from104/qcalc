import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  // 해당 요소에 포커스가 들어오면 blur 이벤트를 발생시킵니다.
  app.directive('auto-blur', {
    mounted: (el: HTMLElement) => {
      el.addEventListener('focusin', (ev) => {
        (ev.target as HTMLElement)?.blur();
      });
    },
  });
});
