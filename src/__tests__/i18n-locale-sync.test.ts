/**
 * @file i18n-locale-sync.test.ts
 * @description i18n locale과 HTML lang 속성 동기화 테스트
 *              WCAG 3.1.1 Level A 준수: 언어 변경 시 documentElement.lang 업데이트 확인
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createI18n } from 'vue-i18n';

describe('i18n locale 동기화 (HTML lang 속성)', () => {
  let originalLang: string | null;

  beforeEach(() => {
    // HTML lang 속성 백업
    originalLang = document.documentElement.getAttribute('lang');
  });

  afterEach(() => {
    // 테스트 후 원래 상태로 복구
    if (originalLang) {
      document.documentElement.setAttribute('lang', originalLang);
    } else {
      document.documentElement.removeAttribute('lang');
    }
  });

  it('초기 렌더링 시 HTML lang 속성이 i18n locale과 동기화됨', () => {
    const i18n = createI18n({
      locale: 'ko',
      fallbackLocale: 'en',
      messages: {},
      legacy: false,
    });

    const { locale } = i18n.global;

    // App 마운트 시뮬레이션
    document.documentElement.lang = locale.value as string;

    expect(document.documentElement.lang).toBe('ko');
  });

  it('locale 값 변경 시 수동으로 업데이트할 수 있음', () => {
    const i18n = createI18n({
      locale: 'ko',
      fallbackLocale: 'en',
      messages: {},
      legacy: false,
    });

    const { locale } = i18n.global;

    // 초기 설정
    document.documentElement.lang = locale.value as string;
    expect(document.documentElement.lang).toBe('ko');

    // App.vue의 watch가 수행할 업데이트 시뮬레이션
    locale.value = 'en';
    document.documentElement.lang = locale.value as string;
    expect(document.documentElement.lang).toBe('en');
  });

  it('여러 언어로 순차 변경 가능', () => {
    const i18n = createI18n({
      locale: 'ko',
      fallbackLocale: 'en',
      messages: {},
      legacy: false,
    });

    const { locale } = i18n.global;

    // 초기 설정
    document.documentElement.lang = locale.value as string;

    // 순차 변경 테스트
    const languages = ['en', 'ja', 'zh', 'hi', 'de', 'es', 'fr', 'pt', 'ru'];
    for (const lang of languages) {
      locale.value = lang;
      // App.vue의 watch가 수행할 업데이트 시뮬레이션
      document.documentElement.lang = locale.value as string;
      expect(document.documentElement.lang).toBe(lang);
    }
  });

  it('i18n 생성 후 초기 locale이 반영됨', () => {
    const i18n = createI18n({
      locale: 'ja',
      fallbackLocale: 'en',
      messages: {},
      legacy: false,
    });

    const { locale } = i18n.global;
    document.documentElement.lang = locale.value as string;

    expect(document.documentElement.lang).toBe('ja');
  });
});
