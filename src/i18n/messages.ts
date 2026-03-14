/**
 * @file messages.ts
 * @description 이 파일은 다국어 지원을 위한 메시지를 정의합니다.
 *              한국어와 영어 메시지를 포함하며, 각 언어에 대한 에러 메시지도 관리합니다.
 *              이 파일은 Vue 애플리케이션에서 i18n 기능을 통해 다국어 메시지를 제공하는 데 사용됩니다.
 */

import koMessages from './messages/koMessages.yml';
import enMessages from './messages/enMessages.yml';
import jaMessages from './messages/jaMessages.yml';
import zhMessages from './messages/zhMessages.yml';
import hiMessages from './messages/hiMessages.yml';
import deMessages from './messages/deMessages.yml';
import esMessages from './messages/esMessages.yml';
import frMessages from './messages/frMessages.yml';

import koErrors from './errors/koErrors.yml';
import enErrors from './errors/enErrors.yml';
import jaErrors from './errors/jaErrors.yml';
import zhErrors from './errors/zhErrors.yml';
import hiErrors from './errors/hiErrors.yml';
import deErrors from './errors/deErrors.yml';
import esErrors from './errors/esErrors.yml';
import frErrors from './errors/frErrors.yml';

export default {
  ko: { message: koMessages, error: koErrors },
  en: { message: enMessages, error: enErrors },
  ja: { message: jaMessages, error: jaErrors },
  zh: { message: zhMessages, error: zhErrors },
  hi: { message: hiMessages, error: hiErrors },
  de: { message: deMessages, error: deErrors },
  es: { message: esMessages, error: esErrors },
  fr: { message: frMessages, error: frErrors },
};
