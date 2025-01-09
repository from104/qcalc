import { defineBoot } from '#q-app/wrappers';

import { i18n } from 'src/i18n/initLocale';

// i18n 인스턴스를 앱에 등록합니다.
export default defineBoot(({ app }) => {
  app.use(i18n);
});