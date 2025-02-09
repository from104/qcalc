import { Notify } from 'quasar';

/**
 * 성공 메시지를 표시합니다.
 * @param message - 표시할 메시지 내용
 * @param duration - 알림 표시 시간 (기본값: 1000ms)
 * @param position - 알림 위치 (기본값: 'top')
 */
export function showMessage(
  message: string,
  duration = 2000,
  position:
    | 'top'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom'
    | 'left'
    | 'right'
    | 'center'
    | undefined = 'top',
): void {
  Notify.create({
    message,
    position,
    timeout: duration,
    color: 'positive',
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
  position:
    | 'top'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom'
    | 'left'
    | 'right'
    | 'center'
    | undefined = 'top',
): void {
  Notify.create({
    message,
    position,
    timeout: duration,
    color: 'negative',
  });
}
