/**
 * @file i18n-locale-sync.test.ts
 * @description i18n locale과 HTML lang 속성 동기화 테스트
 *              WCAG 3.1.1 Level A 준수: 언어 변경 시 documentElement.lang 업데이트 확인
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { effectScope, ref } from 'vue';
import { useHtmlLangSync } from '../composables/useHtmlLangSync';

describe('useHtmlLangSync (HTML lang 속성 동기화)', () => {
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

  it('syncNow() 호출 전에는 documentElement.lang을 건드리지 않는다', () => {
    const scope = effectScope();
    scope.run(() => {
      const locale = ref('ko');
      document.documentElement.removeAttribute('lang');
      useHtmlLangSync(locale);
      expect(document.documentElement.hasAttribute('lang')).toBe(false);
    });
    scope.stop();
  });

  it('syncNow() 호출 시 현재 locale 값이 documentElement.lang에 반영된다', () => {
    const scope = effectScope();
    scope.run(() => {
      const locale = ref('ko');
      const { syncNow } = useHtmlLangSync(locale);
      syncNow();
      expect(document.documentElement.lang).toBe('ko');
    });
    scope.stop();
  });

  it('locale.value 변경 시 watch가 documentElement.lang을 자동으로 갱신한다 (syncNow 재호출 없이)', async () => {
    const scope = effectScope();
    await scope.run(async () => {
      const locale = ref('ko');
      const { syncNow } = useHtmlLangSync(locale);
      syncNow();
      expect(document.documentElement.lang).toBe('ko');

      locale.value = 'en';
      // watch는 기본적으로 비동기(pre-flush)로 실행되므로 nextTick 대기
      await import('vue').then((v) => v.nextTick());
      expect(document.documentElement.lang).toBe('en');
    });
    scope.stop();
  });

  it('여러 언어로 순차 변경해도 매번 documentElement.lang이 갱신된다', async () => {
    const scope = effectScope();
    await scope.run(async () => {
      const { nextTick } = await import('vue');
      const locale = ref('ko');
      const { syncNow } = useHtmlLangSync(locale);
      syncNow();

      const languages = ['en', 'ja', 'zh', 'hi', 'de', 'es', 'fr', 'pt', 'ru'];
      for (const lang of languages) {
        locale.value = lang;
        await nextTick();
        expect(document.documentElement.lang).toBe(lang);
      }
    });
    scope.stop();
  });

  it('effectScope 종료(컴포넌트 언마운트 상당) 후에는 locale 변경이 더 이상 반영되지 않는다', async () => {
    const scope = effectScope();
    const locale = ref('ko');
    scope.run(() => {
      const { syncNow } = useHtmlLangSync(locale);
      syncNow();
    });
    expect(document.documentElement.lang).toBe('ko');

    scope.stop();
    locale.value = 'en';
    await import('vue').then((v) => v.nextTick());
    // watch가 scope와 함께 정리되었으므로 lang은 그대로 유지되어야 한다
    expect(document.documentElement.lang).toBe('ko');
  });
});

describe('App.vue가 useHtmlLangSync를 실제로 사용하는지 (배선 회귀 가드)', () => {
  const source = readFileSync(resolve(__dirname, '../App.vue'), 'utf-8');

  it('useHtmlLangSync를 import한다', () => {
    expect(source).toContain("import { useHtmlLangSync } from './composables/useHtmlLangSync'");
  });

  it('locale ref를 넘겨 useHtmlLangSync를 호출한다', () => {
    expect(source).toContain('useHtmlLangSync(locale)');
  });

  it('onMounted 내부에서 syncNow()를 호출해 초기 동기화를 수행한다', () => {
    const onMountedBlock = source.slice(source.indexOf('onMounted(() => {'), source.indexOf('onUnmounted('));
    expect(onMountedBlock).toContain('syncHtmlLang()');
  });
});
