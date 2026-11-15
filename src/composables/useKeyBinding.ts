import { onUnmounted } from 'vue';
import { tinykeys } from 'tinykeys';
import type { KeyBindingMap } from 'tinykeys';

/** 핸들러는 keydown 이벤트를 받는다 — 기본 동작을 막아야 하는 단축키(복사 등)용 */
export type KeyBindings = [string[], (event: KeyboardEvent) => void][];

export function useKeyBinding(keybindings: KeyBindings) {
  let unsubscribe: (() => void) | null = null;

  const subscribe = () => {
    if (unsubscribe) {
      unsubscribe();
    }

    const keyBindingMap: KeyBindingMap = {};
    keybindings.forEach(([keys, handler]) => {
      keys.forEach((key) => {
        keyBindingMap[key] = handler;
      });
    });

    unsubscribe = tinykeys(window, keyBindingMap);
  };

  const unsubscribeAll = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  onUnmounted(() => {
    unsubscribeAll();
  });

  return {
    subscribe,
    unsubscribe: unsubscribeAll,
  };
}
