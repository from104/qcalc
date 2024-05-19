<script setup lang="ts">
// import { ref, onBeforeMount, onMounted, onBeforeUnmount, reactive, watch, computed } from 'vue';
import { onMounted, onBeforeUnmount, reactive, watch,  } from 'vue';

import { UnitConverter } from 'classes/UnitConverter';

import MyTooltip from 'components/MyTooltip.vue';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 스토어 가져오기
import { useCalcStore } from 'stores/calc-store';

const store = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const { calc } = store;

// 단위 이름과 값을 바꾸기 위한 함수
const swapUnitValue = () => {
  // 변환 결과를 원본 값으로 바꾸기
  // (computed로 선언된 unitResult로 인해 값이 바뀌면 자동으로 변환 결과가 바뀜)
  calc.setCurrentNumber(document.getElementById('subResult')?.textContent ?? '0');

  // 단위도 바꾸기
  const temp = store.recentUnitFrom[store.recentCategory];
  store.recentUnitFrom[store.recentCategory] = store.recentUnitTo[store.recentCategory];
  store.recentUnitTo[store.recentCategory] = temp;
};

// 단위 초기화
store.initRecentCategoryAndUnit();

// 범주 이름을 언어에 맞게 초기화
const categories = reactive(
  UnitConverter.categories.map((category) => ({
    value: category,
    label: t(`categories.${category}`)
  }))
);

// 범주 이름을 언어에 맞게 바꾸기 위한 감시
watch([()=>store.locale], () => {
  categories.forEach((category) => {
    category.label = t(`categories.${category.value}`);
  });
});

import { KeyBinding } from 'classes/KeyBinding';

const keyBinding = new KeyBinding([
  [['v'], () => store.clickButtonById('btn-swap-unit')],
  [['b'], () => store.showUnitToggle()]
]);

onMounted(() => {
  store.initRecentCategoryAndUnit();

  // 키바인딩 추가
  keyBinding.subscribe();
});

onBeforeUnmount(() => {
  // 키바인딩 제거
  keyBinding.unsubscribe();
});

type UnitOptions = {
  value: string;
  label: string;
  disable?: boolean;
};

type ReactiveUnitOptions = {
  values: UnitOptions[];
};

const fromUnitOptions = reactive({ values: [] } as ReactiveUnitOptions);
const toUnitOptions = reactive({ values: [] } as ReactiveUnitOptions);

watch(
  [() => store.recentUnitFrom[store.recentCategory], () => store.recentUnitTo[store.recentCategory]],
  () => {
    const category = store.recentCategory;
    const unitList = UnitConverter.getUnitLists(category);

    fromUnitOptions.values = unitList.map((unit) => ({
      value: unit,
      label: unit,
      desc: UnitConverter.getUnitDesc(category, unit),
      disable: store.recentUnitTo[category] === unit
    }));

    toUnitOptions.values = unitList.map((unit) => ({
      value: unit,
      label: unit,
      desc: UnitConverter.getUnitDesc(category, unit),
      disable: store.recentUnitFrom[category] === unit
    }));
  },
  { immediate: true }
);
</script>

<template>
  <q-card-section class="row q-px-sm q-pt-none q-pb-sm" v-blur>
    <!-- 카테고리 -->
    <q-select
      v-model=" store.recentCategory "
      :options=" categories "
      :label=" t( 'category' ) "
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-3 q-pl-sm shadow-2 text-black"
      :class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6' "
      :popup-content-class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6' "
      :options-selected-class="!store.darkMode ? 'text-primary' : 'text-grey-1'"
      :label-color="!store.darkMode ? 'primary' : 'grey-1'"
    />

    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" />

    <!-- 원본 단위 -->
    <q-select
      v-model=" store.recentUnitFrom[ store.recentCategory ] "
      :options=" fromUnitOptions.values "
      :label=" t( `unitDesc.${ store.recentCategory }.${ store.recentUnitFrom[ store.recentCategory ] }` ) "
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-3 q-pl-sm shadow-2"
      :class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6' "
      :popup-content-class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6' "
      :options-selected-class="!store.darkMode ? 'text-primary' : 'text-grey-1'"
      :label-color="!store.darkMode ? 'primary' : 'grey-1'"
    >
      <template v-slot:option=" scope ">
        <q-item v-bind=" scope.itemProps ">
          <q-item-section>
            <q-item-label caption>
              {{ t( `unitDesc.${ store.recentCategory }.${ scope.opt.label }` ) }}
            </q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        {{ t( `unitDesc.${ store.recentCategory }.${ store.recentUnitFrom[ store.recentCategory ] }` ) }}
      </MyTooltip>
    </q-select>

    <!-- 원본, 대상 단위 바꾸기 버튼 -->
    <q-btn
      id="btn-swap-unit"
      dense
      round
      flat
      icon="swap_horiz"
      size="md"
      class="col-1 q-mx-none q-px-sm"
      @click="swapUnitValue()"
    >
      <MyTooltip>{{ t( 'tooltipSwap' ) }}</MyTooltip>
    </q-btn>

    <!-- 대상 단위 -->
    <q-select
      v-model=" store.recentUnitTo[ store.recentCategory ] "
      :options=" toUnitOptions.values "
      :label=" t( `unitDesc.${ store.recentCategory }.${ store.recentUnitTo[ store.recentCategory ] }` ) "
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-3 q-pl-sm shadow-2"
      :class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6' "
      :popup-content-class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6' "
      :options-selected-class="!store.darkMode ? 'text-primary' : 'text-grey-1'"
      :label-color="!store.darkMode ? 'primary' : 'grey-1'"
    >
      <template v-slot:option=" scope ">
        <q-item v-bind=" scope.itemProps ">
          <q-item-section>
            <q-item-label caption>
              {{ t( `unitDesc.${ store.recentCategory }.${ scope.opt.label }` ) }}
            </q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        {{ t( `unitDesc.${ store.recentCategory }.${ store.recentUnitTo[ store.recentCategory ] }` ) }}
      </MyTooltip>
    </q-select>

    <!-- 대상 방향 -->
    <q-icon
      name="keyboard_double_arrow_down"
      size="xs"
      class="col-1 q-px-none"
    />
  </q-card-section>
</template>

<i18n lang="yaml5" src="../i18n/components/UnitPanel.yml" />
