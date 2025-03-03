/**
 * @file i18n.ts
 * @description 이 파일은 Vue 애플리케이션의 국제화(i18n) 설정을 정의하는 부트스트랩 파일입니다.
 *              이 파일에서는 i18n 인스턴스를 생성하고, 애플리케이션에 등록하여 다양한 언어를 지원합니다.
 *              사용자가 선택한 언어에 따라 애플리케이션의 텍스트가 동적으로 변경되며,
 *              사용자 경험을 향상시키기 위해 다국어 지원을 제공합니다.
 */

import { defineBoot } from '#q-app/wrappers';

import { i18n } from 'src/i18n/initLocale';

// i18n 인스턴스를 앱에 등록합니다.
export default defineBoot(({ app }) => {
  app.use(i18n);
});