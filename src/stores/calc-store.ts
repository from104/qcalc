import { defineStore } from 'pinia';
import { Calculator } from 'classes/Calculator';

export const useCalcStore = defineStore('calc', {
  state: () => ({
    alwaysOnTop: false,
    calc: new Calculator(),
    useGrouping: true,
    decimalPlaces: -2
  }),
  getters: {},
  actions: {
    toggleAlwaysOnTop () {
      this.alwaysOnTop = !this.alwaysOnTop;
    },
    toggleUseGrouping () {
      this.useGrouping = !this.useGrouping;
    },
    setDecimalPlaces (decimalPlaces: number) {
      const allowValues = [-2, 0, 2, 4, 6];
      if (allowValues.includes(decimalPlaces)) {
        this.decimalPlaces = decimalPlaces;
      }
    },
    incDecimalPlaces () {
      this.setDecimalPlaces(this.decimalPlaces + 2);
    },
    decDecimalPlaces () {
      this.setDecimalPlaces(this.decimalPlaces - 2);
    }
  },
  persist: true,
});
