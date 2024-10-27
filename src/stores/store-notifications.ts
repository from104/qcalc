import { defineStore } from 'pinia';
import { Notify } from 'quasar';

// 알림 관련 기능을 제공하는 스토어 정의
export const useStoreNotifications = defineStore('notifications', {
  actions: {
    // 일반 메시지 알림을 표시하는 함수
    notifyMsg(
      msg: string,                // 표시할 메시지 내용
      timeout = 500,              // 알림 표시 시간 (기본값: 500ms)
      position: 'top' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom' | 'left' | 'right' | 'center' | undefined = 'top'  // 알림 위치 (기본값: 'top')
    ): void {
      Notify.create({
        message: msg,             // 메시지 내용
        position,                 // 알림 위치
        timeout,                  // 표시 시간
        color: 'positive'         // 알림 색상 (긍정적인 메시지)
      });
    },

    // 오류 메시지 알림을 표시하는 함수
    notifyError(
      msg: string,                // 표시할 오류 메시지 내용
      timeout = 500,              // 알림 표시 시간 (기본값: 500ms)
      position: 'top' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom' | 'left' | 'right' | 'center' | undefined = 'top'  // 알림 위치 (기본값: 'top')
    ): void {
      Notify.create({
        message: msg,             // 오류 메시지 내용
        position,                 // 알림 위치
        timeout,                  // 표시 시간
        color: 'negative'         // 알림 색상 (부정적인 메시지)
      });
    },
  },
});