/**
 * @file useHtmlLangSync.ts
 * @description i18n locale과 document.documentElement.lang 속성을 동기화하는 컴포저블입니다.
 *              WCAG 3.1.1 Level A(페이지의 언어) 준수를 위해 사용됩니다.
 */

import { watch, type Ref } from 'vue';

/**
 * i18n locale의 변경을 document.documentElement.lang에 반영하는 watch를 등록합니다.
 * 초기 동기화는 반환된 syncNow()를 호출하는 쪽(App.vue의 onMounted 등)에서 수행합니다.
 * @param locale - vue-i18n의 locale ref
 * @returns syncNow - 현재 locale 값을 documentElement.lang에 즉시 반영하는 함수
 */
export function useHtmlLangSync(locale: Ref<string>): { syncNow: () => void } {
  const syncNow = () => {
    document.documentElement.lang = locale.value;
  };

  watch(locale, (newLocale) => {
    document.documentElement.lang = newLocale;
  });

  return { syncNow };
}
