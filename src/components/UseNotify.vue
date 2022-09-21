<script lang="ts">
import { Notify } from 'quasar';

export function useNotify() {
  const notifyMsg = (msg: string, timeout = 500) => {
    Notify.create({
      message: msg,
      position: 'top',
      timeout: timeout,
      color: 'positive',
    });
  };

  const notifyError = (msg: string, timeout = 500) => {
    Notify.create({
      message: msg,
      position: 'top',
      timeout: timeout,
      color: 'negative',
    });
  };

  return { notifyMsg, notifyError };
}
</script>
