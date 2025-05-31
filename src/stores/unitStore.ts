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
  convertedUnitNumber: string;
  favoriteCategories: string[];
  favoriteUnits: Record<string, string[]>;
}

export const useUnitStore = defineStore('unit', {
  state: (): UnitState => ({
    selectedCategory: '',
    sourceUnits: {},
    targetUnits: {},
    showUnit: true,
    convertedUnitNumber: '',
    favoriteCategories: [],
    favoriteUnits: {},
  }),

  getters: {
    /**
     * 특정 카테고리가 즐겨찾기에 포함되어 있는지 확인
     * @param category - 확인할 카테고리
     * @returns 즐겨찾기 여부
     */
    isFavoriteCategory:
      (state) =>
      (category: string): boolean => {
        return state.favoriteCategories.includes(category);
      },

    /**
     * 특정 단위가 즐겨찾기에 포함되어 있는지 확인
     * @param category - 카테고리
     * @param unit - 확인할 단위
     * @returns 즐겨찾기 여부
     */
    isFavoriteUnit:
      (state) =>
      (category: string, unit: string): boolean => {
        return state.favoriteUnits[category]?.includes(unit) ?? false;
      },

    /**
     * 즐겨찾기 카테고리와 일반 카테고리를 분리하여 정렬된 목록 반환
     * @returns 정렬된 카테고리 목록 (즐겨찾기가 상단에 위치, 원래 순서 유지)
     */
    getSortedCategories: (state) => (): string[] => {
      const availableCategories = UnitConverter.getCategories();
      const favorites = availableCategories.filter((category) => state.favoriteCategories.includes(category));
      const nonFavorites = availableCategories.filter((category) => !state.favoriteCategories.includes(category));

      return [...favorites, ...nonFavorites];
    },

    /**
     * 특정 카테고리의 즐겨찾기 단위와 일반 단위를 분리하여 정렬된 목록 반환
     * @param category - 카테고리
     * @returns 정렬된 단위 목록 (즐겨찾기가 상단에 위치, 원래 순서 유지)
     */
    getSortedUnits:
      (state) =>
      (category: string): string[] => {
        const availableUnits = UnitConverter.getUnitLists(category);
        const favoriteUnits = state.favoriteUnits[category] ?? [];
        const favorites = availableUnits.filter((unit) => favoriteUnits.includes(unit));
        const nonFavorites = availableUnits.filter((unit) => !favoriteUnits.includes(unit));

        return [...favorites, ...nonFavorites];
      },
  },

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

    /**
     * 카테고리를 즐겨찾기에 추가하거나 제거
     * @param category - 토글할 카테고리
     */
    toggleFavoriteCategory(category: string): void {
      const index = this.favoriteCategories.indexOf(category);
      if (index > -1) {
        // 이미 즐겨찾기에 있으면 제거
        this.favoriteCategories.splice(index, 1);
      } else {
        // 즐겨찾기에 없으면 추가
        this.favoriteCategories.push(category);
      }
    },

    /**
     * 단위를 즐겨찾기에 추가하거나 제거
     * @param category - 카테고리
     * @param unit - 토글할 단위
     */
    toggleFavoriteUnit(category: string, unit: string): void {
      if (!this.favoriteUnits[category]) {
        this.favoriteUnits[category] = [];
      }

      const index = this.favoriteUnits[category].indexOf(unit);
      if (index > -1) {
        // 이미 즐겨찾기에 있으면 제거
        this.favoriteUnits[category].splice(index, 1);
      } else {
        // 즐겨찾기에 없으면 추가
        this.favoriteUnits[category].push(unit);
      }
    },

    /**
     * 카테고리를 즐겨찾기에 추가
     * @param category - 추가할 카테고리
     */
    addToFavoriteCategories(category: string): void {
      if (!this.favoriteCategories.includes(category)) {
        this.favoriteCategories.push(category);
      }
    },

    /**
     * 카테고리를 즐겨찾기에서 제거
     * @param category - 제거할 카테고리
     */
    removeFromFavoriteCategories(category: string): void {
      const index = this.favoriteCategories.indexOf(category);
      if (index > -1) {
        this.favoriteCategories.splice(index, 1);
      }
    },

    /**
     * 단위를 즐겨찾기에 추가
     * @param category - 카테고리
     * @param unit - 추가할 단위
     */
    addToFavoriteUnits(category: string, unit: string): void {
      if (!this.favoriteUnits[category]) {
        this.favoriteUnits[category] = [];
      }
      if (!this.favoriteUnits[category].includes(unit)) {
        this.favoriteUnits[category].push(unit);
      }
    },

    /**
     * 단위를 즐겨찾기에서 제거
     * @param category - 카테고리
     * @param unit - 제거할 단위
     */
    removeFromFavoriteUnits(category: string, unit: string): void {
      if (this.favoriteUnits[category]) {
        const index = this.favoriteUnits[category].indexOf(unit);
        if (index > -1) {
          this.favoriteUnits[category].splice(index, 1);
        }
      }
    },

    /**
     * 모든 카테고리 즐겨찾기 초기화
     */
    clearFavoriteCategories(): void {
      this.favoriteCategories = [];
    },

    /**
     * 모든 단위 즐겨찾기 초기화
     */
    clearFavoriteUnits(): void {
      this.favoriteUnits = {};
    },

    /**
     * 특정 카테고리의 단위 즐겨찾기 초기화
     * @param category - 초기화할 카테고리
     */
    clearFavoriteUnitsForCategory(category: string): void {
      if (this.favoriteUnits[category]) {
        this.favoriteUnits[category] = [];
      }
    },
  },

  persist: true,
});
