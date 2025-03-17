/**
 * @file NotificationUtils.ts
 * @description 이 파일은 애플리케이션에서 알림 메시지를 표시하는 유틸리티 함수들을 정의합니다.
 *              성공 메시지와 오류 메시지를 사용자에게 시각적으로 전달하여,
 *              사용자 경험을 향상시키고, 애플리케이션의 피드백을 효과적으로 관리하는 데 도움을 줍니다.
 */

import { Notify } from 'quasar';

type NotificationPosition = 'top' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom' | 'left' | 'right' | 'center' | undefined;

/**
 * 성공 메시지를 표시합니다.
 * @param message - 표시할 메시지 내용
 * @param duration - 알림 표시 시간 (기본값: 1000ms)
 * @param position - 알림 위치 (기본값: 'top')
 */
export function showMessage(
  message: string,
  duration = 2000,
  position: NotificationPosition = 'top',
): void {
  Notify.create({
    message,
    position,
    timeout: duration,
    color: 'positive',
    html: true,
  });
}

/**
 * 에러 메시지를 표시합니다.
 * @param message - 표시할 오류 메시지 내용
 * @param duration - 알림 표시 시간 (기본값: 500ms)
 * @param position - 알림 위치 (기본값: 'top')
 */
export function showError(
  message: string,
  duration = 2000,
  position: NotificationPosition = 'top',
): void {
  Notify.create({
    message,
    position,
    timeout: duration,
    color: 'negative',
    html: true,
  });
}
