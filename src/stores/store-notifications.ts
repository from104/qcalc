import {defineStore} from 'pinia';
import {Notify} from 'quasar';

export const useStoreNotifications = defineStore('notifications', {
  actions: {
    notifyMsg(
      msg: string,
      timeout = 500,
      position: 'top' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom' | 'left' | 'right' | 'center' | undefined = 'top'
    ): void {
      Notify.create({
        message: msg,
        position,
        timeout,
        color: 'positive'
      });
    },

    notifyError(
      msg: string, 
      timeout = 500,
      position: 'top' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom' | 'left' | 'right' | 'center' | undefined = 'top'
    ): void {
      Notify.create({
        message: msg,
        position,
        timeout,
        color: 'negative'
      });
    },
  },
});