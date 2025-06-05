import { defineStore } from 'pinia';

export const useAdmobStore = defineStore('admob', {
  state: () => ({
    isAdVisible: true, // Ads are visible by default
  }),
  actions: {
    hideAds() {
      this.isAdVisible = false;
    },
    showAds() {
      // Optional: if you need a way to show ads again (e.g., for testing)
      this.isAdVisible = true;
    },
  },
});
