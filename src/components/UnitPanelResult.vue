<script setup lang="ts">
import { ref, computed, onMounted, onBeforeMount, onBeforeUnmount } from 'vue';
import tinykeys, { KeyBindingMap } from 'tinykeys';

import UnitConverter from 'classes/UnitConverter';

import { useCalcStore } from 'stores/calc-store';

import MyTooltip from 'components/MyTooltip.vue';

// 스토어 가져오기
const store = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const calc = store.calc;

// 단위 이름과 값을 바꾸기 위한 함수
function swapUnitValue() {
  calc.setShownNumber(unitResult.value);

  const temp = store.recentUnitFrom[store.recentCategory];
  store.recentUnitFrom[store.recentCategory] =
    store.recentUnitTo[store.recentCategory];
  store.recentUnitTo[store.recentCategory] = temp;
}

function initRecentCategoryAndUnit() {
  if (!UnitConverter.categories.includes(store.recentCategory)) {
    store.recentCategory = UnitConverter.categories[0];
  }

  if (
    !UnitConverter.getUnitLists(store.recentCategory).includes(
      store.recentUnitFrom[store.recentCategory]
    )
  ) {
    store.recentUnitFrom[store.recentCategory] = UnitConverter.getUnitLists(
      store.recentCategory
    )[0];
  }

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
  initRecentCategoryAndUnit();

  return store.toLocale(
    UnitConverter.convert(
      store.recentCategory,
      Number(calc.getShownNumber()),
      store.recentUnitFrom[store.recentCategory],
      store.recentUnitTo[store.recentCategory]
    )
  );
});

onBeforeMount(() => {
  store.unitPanel = false;
});

// 계산기 키바인딩 제거하기위한 변수 선언
let keybindingRemoveAtUmount = tinykeys(window, {} as KeyBindingMap);

onMounted(() => {
  initRecentCategoryAndUnit();

  type Shortcut = [string[], () => void][];

  const shortcuts: Shortcut = [
    [['v'], () => store.unitPanelToggle()],
    [['Shift+v'], () => (store.unitPanel ? swapUnitValue() : null)],
  ];

  // Support keyboard entry
  const keyBindingMaps: KeyBindingMap = {};

  shortcuts.forEach((shortcut) => {
    const [keys, handler] = shortcut;
    keys.forEach((key) => {
      keyBindingMaps[key] = handler;
    });
  });

  // 키바인딩하고 제거할 수 있는 메서드 백업;
  keybindingRemoveAtUmount = tinykeys(window, keyBindingMaps);

});

onBeforeUnmount(() => {
  store.unitPanel = false;

  // dom 요소가 언마운트되기 전에 키바인딩 제거
  keybindingRemoveAtUmount();
});
</script>

<template>
  <q-dialog
    v-model="store.unitPanel"
    style="z-index: 5"
    seamless
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card id="unit" class="full-width q-px-none q-mx-sm" v-blur>
      <q-card-section class="row q-pt-sm">
        <q-select
          v-model="store.recentUnitFrom[store.recentCategory]"
          :options="UnitConverter.getUnitLists(store.recentCategory)"
          dense
          options-dense
          filled
          class="col-4 shadow-4"
        >
          <template v-slot:before>
            <q-icon name="arrow_upward" class="q-ml-sm" @click.stop.prevent />
          </template>
        </q-select>
        <q-select
          v-model="store.recentCategory"
          :options="UnitConverter.categories"
          dense
          options-dense
          filled
          class="col-4 shadow-4 text-no-wrap"
        >
          <template v-slot:after>
            <q-icon
              name="swap_vert"
              class="q-mr-sm cursor-pointer"
              @click="swapUnitValue"
              @click.stop.prevent
            />
          </template>
        </q-select>
        <q-select
          v-model="store.recentUnitTo[store.recentCategory]"
          :options="UnitConverter.getUnitLists(store.recentCategory)"
          dense
          options-dense
          filled
          class="col-4 shadow-4"
        >
          <template v-slot:after>
            <q-icon name="arrow_downward" class="q-mr-sm" @click.stop.prevent />
          </template>
        </q-select>
      </q-card-section>

      <q-card-section class="q-pt-none q-pb-md">
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
              : undefined
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
              <MyTooltip v-if="needUnitResultTooltip">{{
                unitResult
              }}</MyTooltip>
            </div>
          </template>
        </q-field>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
#unit {
  max-width: calc(100vw - 15px);
  position: fixed;
  top: 140px;
}
</style>
