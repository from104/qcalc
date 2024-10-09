import { defineStore } from 'pinia';
import { Dark } from 'quasar';

export const useStoreSettings = defineStore('settings', {
  state: () => ({
    darkMode: false,
    alwaysOnTop: false,
    useGrouping: true,
    decimalPlaces: -2,
    useSystemLocale: true,
    locale: '',
    userLocale: '',
    initPanel: false,
    showUnit: true,
    showSymbol: true,
    paddingOnResult: 20,
    showButtonAddedLabel: true,
    hapticsMode: true,
  }),
  actions: {
    setDarkMode(darkMode: boolean) {
      this.darkMode = darkMode;
      Dark.set(this.darkMode);
    },
    toggleDarkMode() {
      this.setDarkMode(!this.darkMode);
    },
    setAlwaysOnTop(alwaysOnTop: boolean) {
      this.alwaysOnTop = alwaysOnTop;
      window.myAPI.setAlwaysOnTop(this.alwaysOnTop);
    },
    toggleAlwaysOnTop() {
      this.setAlwaysOnTop(!this.alwaysOnTop);
    },
    setInitPanel(initPanel: boolean) {
      this.initPanel = initPanel;
    },
    toggleInitPanel() {
      this.setInitPanel(!this.initPanel);
    },
    toggleUseGrouping() {
      this.useGrouping = !this.useGrouping;
    },
    toggleButtonAddedLabel() {
      this.showButtonAddedLabel = !this.showButtonAddedLabel;
    },
    setDecimalPlaces(decimalPlaces: number) {
      if ([-2, 0, 2, 4, 6].includes(decimalPlaces)) {
        this.decimalPlaces = decimalPlaces;
      }
    },
    incDecimalPlaces() {
      this.setDecimalPlaces(this.decimalPlaces + 2);
    },
    decDecimalPlaces() {
      this.setDecimalPlaces(this.decimalPlaces - 2);
    },
    toggleShowUnit(): void {
      this.showUnit = !this.showUnit;
    },
    toggleShowSymbol(): void {
      this.showSymbol = !this.showSymbol;
    },
    setHapticsMode(hapticsMode: boolean): void {
      this.hapticsMode = hapticsMode;
    },
  },
  persist: true,
});