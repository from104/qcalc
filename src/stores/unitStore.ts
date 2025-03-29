/**
 * @file unitConverterStore.ts
 * @description 단위 변환 관련 상태와 액션을 관리하는 스토어입니다.
 */

import { defineStore } from 'pinia';
import { UnitConverter } from 'classes/UnitConverter';

interface UnitState {
  selectedCategory: string;
  sourceUnits: Record<string, string>;
  targetUnits: Record<string, string>;
  showUnit: boolean;
  showSymbol: boolean;
  convertedUnitNumber: string;
}

export const useUnitStore = defineStore('unit', {
  state: (): UnitState => ({
    selectedCategory: '',
    sourceUnits: {},
    targetUnits: {},
    showUnit: true,
    showSymbol: true,
    convertedUnitNumber: '',
  }),

  actions: {
    // 단위 변환 관련
    initRecentUnits(): void {
      // 최근 카테고리가 설정되지 않은 경우, 첫 번째 카테고리로 설정
      if (this.selectedCategory === '') {
        this.selectedCategory = UnitConverter.getCategories()[0] ?? '';
      }

      // 변환 출발 단위가 설정되지 않은 경우, 각 카테고리의 첫 번째 단위로 설정
      if (Object.keys(this.sourceUnits).length === 0) {
        UnitConverter.getCategories().forEach((category) => {
          const units = UnitConverter.getUnitLists(category);
          this.sourceUnits[category] = units[0] ?? '';
        });
      }

      // 변환 도착 단위가 설정되지 않은 경우, 각 카테고리의 두 번째 단위(없으면 첫 번째)로 설정
      if (Object.keys(this.targetUnits).length === 0) {
        UnitConverter.getCategories().forEach((category) => {
          const units = UnitConverter.getUnitLists(category);
          this.targetUnits[category] = units[1] || units[0] || '';
        });
      }
    },

    swapUnits(): void {
      const temp = this.sourceUnits[this.selectedCategory];
      this.sourceUnits[this.selectedCategory] = this.targetUnits[this.selectedCategory] || '';
      this.targetUnits[this.selectedCategory] = temp || '';
    },

    // UI 표시 설정
    toggleShowUnit(): void {
      this.showUnit = !this.showUnit;
    },

    toggleShowSymbol(): void {
      this.showSymbol = !this.showSymbol;
    },
  },

  persist: true,
});
