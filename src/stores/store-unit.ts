import { defineStore } from 'pinia';
import { UnitConverter } from 'classes/UnitConverter';

// 단위 변환 관련 상태 및 동작을 관리하는 스토어 정의
export const useStoreUnit = defineStore('unit', {
  // 상태 정의
  state: () => ({
    selectedCategory: '',  // 최근 선택한 카테고리
    sourceUnits: {} as { [key: string]: string },  // 각 카테고리별 최근 선택한 변환 출발 단위
    targetUnits: {} as { [key: string]: string },  // 각 카테고리별 최근 선택한 변환 도착 단위
  }),

  // 액션 정의
  actions: {
    // 최근 카테고리와 단위 초기화
    initRecentUnits(): void {
      // 최근 카테고리가 설정되지 않은 경우, 첫 번째 카테고리로 설정
      if (this.selectedCategory === '') {
        this.selectedCategory = UnitConverter.categories[0];
      }

      // 변환 출발 단위가 설정되지 않은 경우, 각 카테고리의 첫 번째 단위로 설정
      if (Object.keys(this.sourceUnits).length === 0) {
        UnitConverter.categories.forEach(category => {
          const units = UnitConverter.getUnitLists(category);
          this.sourceUnits[category] = units[0];
        });
      }

      // 변환 도착 단위가 설정되지 않은 경우, 각 카테고리의 두 번째 단위(없으면 첫 번째)로 설정
      if (Object.keys(this.targetUnits).length === 0) {
        UnitConverter.categories.forEach(category => {
          const units = UnitConverter.getUnitLists(category);
          this.targetUnits[category] = units[1] || units[0];
        });
      }
    },

    // 현재 카테고리의 변환 출발 단위와 도착 단위 교환
    swapUnits(): void {
      const temp = this.sourceUnits[this.selectedCategory];
      this.sourceUnits[this.selectedCategory] = this.targetUnits[this.selectedCategory];
      this.targetUnits[this.selectedCategory] = temp;
    },
  },

  // 상태 지속성 설정 (페이지 새로고침 후에도 상태 유지)
  persist: true,
});
