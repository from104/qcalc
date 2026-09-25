/**
 * @file qmarkdown-lazy.ts
 * @description QMarkdown(markdown-it·prism 포함)을 전역 비동기 컴포넌트로 등록합니다.
 *              qmarkdown 앱 확장은 시작 시 전역 등록으로 markdown-it을 첫 번들에 넣었기에,
 *              도움말·정보·팁·업데이트 노트를 실제로 그릴 때만 불러오도록 대체합니다.
 */

import { defineBoot } from '#q-app/wrappers';
import { defineAsyncComponent } from 'vue';

export default defineBoot(({ app }) => {
  app.component(
    'QMarkdown',
    defineAsyncComponent(async () => {
      const [mod] = await Promise.all([
        import('@quasar/quasar-ui-qmarkdown/src/components/QMarkdown.js'),
        import('@quasar/quasar-ui-qmarkdown/src/index.sass'),
      ]);
      return mod.default;
    }),
  );
});
