import { onUnmounted } from 'vue';
import { tinykeys } from 'tinykeys';
import type { KeyBindingMap } from 'tinykeys';

export type KeyBindings = [string[], () => void][];

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
