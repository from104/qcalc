import { boot } from 'quasar/wrappers';

import { i18n } from 'src/i18n/initLocale';

// i18n 인스턴스를 앱에 등록합니다.
export default boot(({ app }) => {
  app.use(i18n);
});
