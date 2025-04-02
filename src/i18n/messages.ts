/**
 * @file messages.ts
 * @description 이 파일은 다국어 지원을 위한 메시지를 정의합니다.
 *              한국어와 영어 메시지를 포함하며, 각 언어에 대한 에러 메시지도 관리합니다.
 *              이 파일은 Vue 애플리케이션에서 i18n 기능을 통해 다국어 메시지를 제공하는 데 사용됩니다.
 */

// 한국어와 영어 메시지 파일을 가져옵니다.
import koMessages from './messages/koMessages.yml';
import enMessages from './messages/enMessages.yml';

// 에러 메시지 파일을 가져옵니다.
import koErrors from './errors/koErrors.yml';
import enErrors from './errors/enErrors.yml';

// 다국어 메시지 객체를 내보냅니다.
export default {
  // 한국어 메시지
  ko: {
    message: koMessages,
    error: koErrors,
  },
  // 영어 메시지
  en: {
    message: enMessages,
    error: enErrors,
  },
};
