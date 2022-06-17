import { defineStore } from 'pinia';
import { Calculator } from '../Calculator';

export const useCalcStore = defineStore('calc', {
  state: () => ({
    calc: new Calculator(),
  }),
  getters: {},
  actions: {},
  persist: true,
});
