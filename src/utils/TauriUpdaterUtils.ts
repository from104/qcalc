/**
 * @file TauriUpdaterUtils.ts
 * @description tauri-plugin-updater의 다운로드 진행 이벤트(Started/Progress/Finished)로부터
 *              전달되는 청크 크기를 누적해 진행률(%)을 계산하는 순수 함수를 제공합니다.
 *              src/boot/tauri-shim.ts가 이 함수로 electron-updater 호환 progress 이벤트를 만든다.
 */

/**
 * 누적 다운로드 바이트와 전체 크기로부터 진행률(0~100)을 계산합니다.
 * @param downloadedBytes - 지금까지 누적된 다운로드 바이트 수
 * @param totalBytes - 전체 다운로드 크기(바이트). 0 이하(알 수 없음)면 0을 반환합니다.
 * @returns 0~100 범위의 진행률(%)
 */
export const computeDownloadPercent = (downloadedBytes: number, totalBytes: number): number => {
  if (totalBytes <= 0) return 0;
  return Math.min(100, (downloadedBytes / totalBytes) * 100);
};
