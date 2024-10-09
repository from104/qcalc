import {defineStore} from 'pinia';
import {UnitConverter} from 'classes/UnitConverter';
export const useStoreUnit = defineStore('unit', {
  state: () => ({
    recentCategory: '',
    recentUnitFrom: {} as {[key: string]: string},
    recentUnitTo: {} as {[key: string]: string},
  }),
  actions: {
    initRecentCategoryAndUnit(): void {
      const unitConverter = new UnitConverter();
      if (this.recentCategory === '') {
        this.recentCategory = UnitConverter.categories[0]; // 첫 번째 카테고리로 설정
      }
      if (Object.keys(this.recentUnitFrom).length === 0) {
        UnitConverter.categories.forEach(category => {
          const units = UnitConverter.getUnitLists(category);
          this.recentUnitFrom[category] = units[0]; // 각 카테고리의 첫 번째 단위로 설정
        });
      }
      if (Object.keys(this.recentUnitTo).length === 0) {
        UnitConverter.categories.forEach(category => {
          const units = UnitConverter.getUnitLists(category);
          this.recentUnitTo[category] = units[1] || units[0]; // 각 카테고리의 두 번째 단위 (없으면 첫 번째)로 설정
        });
      }
    },
    swapUnitValue(): void {
      const temp = this.recentUnitFrom[this.recentCategory];
      this.recentUnitFrom[this.recentCategory] = this.recentUnitTo[this.recentCategory];
      this.recentUnitTo[this.recentCategory] = temp;
    },
  },
  persist: true,
});
