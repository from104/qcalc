/**
 * @file ExternalLinkUtils.ts
 * @description 외부 URL을 플랫폼에 맞는 방식으로 여는 유틸리티 함수를 제공합니다.
 *              Tauri 환경의 webview는 `window.open`으로 외부 링크를 열 수 없으므로
 *              (opener 플러그인 없이는 무동작), tauri-plugin-opener의 openUrl로 시스템
 *              기본 브라우저를 연다. 그 외(Electron/브라우저) 환경에서는 기존과 동일하게
 *              `window.open`을 사용한다.
 */

/**
 * 외부 URL을 시스템 기본 브라우저(또는 새 창)로 엽니다.
 * @param url - 열고자 하는 외부 URL
 * @param isTauri - Tauri 환경 여부 (호출부에서 `window.globalVars.isTauri`를 전달)
 */
export const openExternalLink = (url: string, isTauri: boolean): void => {
  if (isTauri) {
    void import('@tauri-apps/plugin-opener').then(({ openUrl }) => openUrl(url));
  } else {
    window.open(url, '_blank', 'noopener');
  }
};
