import { defineStore } from 'pinia';
import { Calculator } from '../Calculator';
import tinykeys, { KeyBindingMap } from 'tinykeys';


export const useCalcStore = defineStore('calc', {
  state: () => ({
    calc: new Calculator(),
    keybindingRemoveFromCalc: tinykeys(window, {} as KeyBindingMap),
  }),
  getters: {},
  actions: {},
  persist: true,
});
