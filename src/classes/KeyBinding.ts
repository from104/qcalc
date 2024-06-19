import {tinykeys, KeyBindingMap} from 'tinykeys';

export type KeyBindings = [string[], () => void][]; // [keybinding, callback][]

export class KeyBinding {
  private isSubscribe = false;
  private keyBindings: KeyBindings = [];
  private unsubscribeMethod: ()=>void = ()=>{};

  constructor(keybindings: KeyBindings, subscribe = false) {
    this.addKeyBindings(keybindings);
    if (subscribe) {
      this.subscribe();
    }
  }

  addKeyBindings(keybindings: KeyBindings) {
    if (this.isSubscribe) {
      this.unsubscribe();
    }
    this.keyBindings = keybindings;
  }

  subscribe() {
    if (this.isSubscribe) return;

    const keyBindingMaps: KeyBindingMap = {};

    this.keyBindings.forEach((keybinding) => {
      const [keys, handler] = keybinding;
      keys.forEach((key) => {
        keyBindingMaps[key] = handler;
      });
    });

    // 키바인딩하고 제거할 수 있는 메서드 백업;
    this.unsubscribeMethod = tinykeys(window, keyBindingMaps);

    this.isSubscribe = true;
  }

  unsubscribe() {
    if (this.isSubscribe) {

    this.unsubscribeMethod();
    this.unsubscribeMethod = ()=>{};

    this.isSubscribe = false;
    }
  }

  toggle() {
    if (this.isSubscribe) {
      this.unsubscribe();
    } else {
      this.subscribe();
    }
  }

  clear() {
    this.unsubscribe();
    this.keyBindings = [];
  }

  getSubscribe() {
    return this.isSubscribe;
  }
}
