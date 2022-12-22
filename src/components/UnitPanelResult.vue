<script setup lang="ts">
import { ref, computed } from 'vue';

import UnitConverter from 'classes/UnitConverter';

import { useCalcStore } from 'stores/calc-store';

import MyTooltip from 'components/MyTooltip.vue';

// 스토어 가져오기
const store = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const calc = store.calc;

// 최근 사용한 카테고리, 단위가 비어있거나 잘못된 값이면 초기화
if (store.recentCategory == '') {
  if (!UnitConverter.categories.includes(store.recentCategory)) {
    store.recentCategory = UnitConverter.categories[0];
  }
}

if (store.recentUnitFrom[store.recentCategory] == '') {
  if (
    !UnitConverter.getUnitLists(store.recentCategory).includes(
      store.recentUnitFrom[store.recentCategory]
    )
  ) {
    store.recentUnitFrom[store.recentCategory] = UnitConverter.getUnitLists(
      store.recentCategory
    )[0];
  }
}

if (store.recentUnitTo[store.recentCategory] == '') {
  if (
    !UnitConverter.getUnitLists(store.recentCategory).includes(
      store.recentUnitTo[store.recentCategory]
    )
  ) {
    store.recentUnitTo[store.recentCategory] = UnitConverter.getUnitLists(
      store.recentCategory
    )[0];
  }
}

// 계산 결과 툴팁 표시 상태 변수
const needUnitResultTooltip = ref(false);

// 계산 결과가 길 경우 툴팁 표시 상태 셋팅
function setNeedUnitResultTooltip() {
  // 원래 결과 칸 길이
  const ow = document.getElementById('unitResult')?.offsetWidth ?? 0;
  // 결과 문자열의 크기
  // (원래 칸에 결과 길이가 넘치면 스크롤 해야하는데 ...로 대체 시킨 경우 스크롤해야할 폭 값만 커진다.)
  const sw = document.getElementById('unitResult')?.scrollWidth ?? 0;
  // 원래의 칸 크기보다 결과 문자열 길이가 길면 툴팁을 표시
  needUnitResultTooltip.value = ow < sw;
}

const unitResult = computed(() => {
  if (store.decimalPlaces == -2 && calc.getShownNumber().indexOf('.') !== -1) {
    const [integer, decimal] = calc.getShownNumber().split('.');
    return `${store.toLocale(Number(integer))}.${decimal}`;
  } else {
    return store.toLocale(Number(calc.getShownNumber()));
  }
});
</script>

<template>
    <q-card-section id="unit" class="">
      <q-field
        :model-value="unitResult"
        class="shadow-4 justify-end self-center"
        filled
        dense
        readonly
        :bg-color="
          needUnitResultTooltip
            ? store.darkMode
              ? 'blue-grey-9'
              : 'amber-2'
            : store.darkMode
              ? 'blue-grey-8'
              : 'grey-2'
        "
      >
        <template v-slot:control>
          <div
            id="unitResult"
            v-mutation="setNeedUnitResultTooltip"
            v-mutation.characterData
            class="self-center full-width no-outline ellipsis text-h4 text-right"
          >
            {{ unitResult }}
            <MyTooltip v-if="needUnitResultTooltip">{{ unitResult }}</MyTooltip>
          </div>
        </template>
      </q-field>
    </q-card-section>
</template>

<style scoped lang="scss">
#unit {
  max-width: calc(100vw - 12px);
  position: fixed;
  top: 150px;
}
</style>
