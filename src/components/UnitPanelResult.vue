<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  reactive,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import UnitConverter from 'classes/UnitConverter';
import { KeyBinding } from 'classes/KeyBinding';
import { useCalcStore } from 'stores/calc-store';

import MyTooltip from 'components/MyTooltip.vue';

const { t } = useI18n();

// 스토어 가져오기
const store = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const calc = store.calc;

// 단위 이름과 값을 바꾸기 위한 함수
function swapUnitValue() {
  // 변환 결과를 원본 값으로 바꾸기
  // (computed로 선언된 unitResult로 인해 값이 바뀌면 자동으로 변환 결과가 바뀜)
  calc.setShownNumber(unitResult.value);

  // 단위도 바꾸기
  const temp = store.recentUnitFrom[store.recentCategory];
  store.recentUnitFrom[store.recentCategory] =
    store.recentUnitTo[store.recentCategory];
  store.recentUnitTo[store.recentCategory] = temp;
}

// 범주와 단위를 초기화
function initRecentCategoryAndUnit() {
  // 범주 초기화
  if (!UnitConverter.categories.includes(store.recentCategory)) {
    store.recentCategory = UnitConverter.categories[0];
  }

  // 단위 초기화
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
    if (
      store.recentUnitTo[store.recentCategory] ==
      store.recentUnitFrom[store.recentCategory]
    ) {
      store.recentUnitTo[store.recentCategory] = UnitConverter.getUnitLists(
        store.recentCategory
      )[1];
    }
  }
}

// 단위 초기화
initRecentCategoryAndUnit();

// 범주 이름을 언어에 맞게 초기화
const categories = reactive(
  UnitConverter.categories.map((category) => ({
    value: category,
    label: t(`categories.${category}`),
  }))
);

// 범주 이름을 언어에 맞게 바꾸기 위한 감시
watch([() => store.useSystemLocale, () => store.userLocale], () => {
  categories.forEach((category) => {
    category.label = t(`categories.${category.value}`);
  });
});

// 변환 결과 툴팁 표시 상태 변수
const needUnitResultTooltip = ref(false);

// 변환 결과가 길 경우 툴팁 표시 상태 셋팅
function setNeedUnitResultTooltip() {
  // 원래 결과 칸 길이
  const ow = document.getElementById('unitResult')?.offsetWidth ?? 0;
  // 결과 문자열의 크기
  // (원래 칸에 결과 길이가 넘치면 스크롤 해야하는데 ...로 대체 시킨 경우 스크롤해야할 폭 값만 커진다.)
  const sw = document.getElementById('unitResult')?.scrollWidth ?? 0;
  // 원래의 칸 크기보다 결과 문자열 길이가 길면 툴팁을 표시
  needUnitResultTooltip.value = ow < sw;
}

// 변환 결과 계산 (computed로 선언하여 값이 바뀔 때마다 자동으로 계산)
const unitResult = computed(() => {
  // 저장된 범주와 단위가 잘못됐으면 초기화
  initRecentCategoryAndUnit();

  const unit = store.showUnit ? store.recentUnitTo[store.recentCategory] : '';
  // 변환 결과를 반환
  return [store.toLocale(
    UnitConverter.convert(
      store.recentCategory,
      Number(calc.getShownNumber()),
      store.recentUnitFrom[store.recentCategory],
      store.recentUnitTo[store.recentCategory]
    )
  ), unit].join(' ');
});

const keyBinding = new KeyBinding([
  [['v'], () => swapUnitValue()],
  [['b'], () => store.showUnitToggle()],
]);

onMounted(() => {
  initRecentCategoryAndUnit();

  // 키바인딩 추가
  keyBinding.subscribe();
  // 변환 결과 툴팁 표시 상태 셋팅
  setNeedUnitResultTooltip();
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
  [
    () => store.recentUnitFrom[store.recentCategory],
    () => store.recentUnitTo[store.recentCategory],
  ],
  () => {
    const category = store.recentCategory;
    const unitList = UnitConverter.getUnitLists(category);

    fromUnitOptions.values = unitList.map((unit) => ({
      value: unit,
      label: unit,
      desc: UnitConverter.getUnitDesc(category, unit),
      disable: store.recentUnitTo[category] === unit,
    }));

    toUnitOptions.values = unitList.map((unit) => ({
      value: unit,
      label: unit,
      desc: UnitConverter.getUnitDesc(category, unit),
      disable: store.recentUnitFrom[category] === unit,
    }));
  },
  { immediate: true }
);
</script>

<template>
  <q-card-section class="row q-px-sm q-pt-none q-pb-sm" v-blur>
    <!-- 카테고리 -->
    <q-select
      v-model="store.recentCategory"
      :options="categories"
      :label="t('category')"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-3 q-pl-sm shadow-4"
      :class="store.darkMode ? 'bg-grey-9' : 'bg-grey-3'"
    />

    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" />

    <!-- 원본 단위 -->
    <q-select
      v-model="store.recentUnitFrom[store.recentCategory]"
      :options="fromUnitOptions.values"
      :label="t(`unitDesc.${store.recentCategory}.${store.recentUnitFrom[store.recentCategory]}`)"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-3 q-pl-sm shadow-4"
      :class="store.darkMode ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <q-item-label caption>{{
              t(`unitDesc.${store.recentCategory}.${scope.opt.label}`)
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        {{  t(`unitDesc.${store.recentCategory}.${store.recentUnitFrom[store.recentCategory]}`) }}
      </MyTooltip>
    </q-select>

    <!-- 원본, 대상 단위 바꾸기 버튼 -->
    <q-btn
      dense
      round
      flat
      icon="swap_horiz"
      size="md"
      class="col-1 q-mx-none q-px-sm"
      :color="store.getDarkColor('primary')"
      @click="swapUnitValue"
    >
      <MyTooltip>{{ t('tooltipSwap') }}</MyTooltip>
    </q-btn>

    <!-- 대상 단위 -->
    <q-select
      v-model="store.recentUnitTo[store.recentCategory]"
      :options="toUnitOptions.values"
      :label="t(`unitDesc.${store.recentCategory}.${store.recentUnitTo[store.recentCategory]}`)"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-3 q-pl-sm shadow-4"
      :class="store.darkMode ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <q-item-label caption>{{
              t(`unitDesc.${store.recentCategory}.${scope.opt.label}`)
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        {{ t( `unitDesc.${store.recentCategory}.${ store.recentUnitTo[store.recentCategory] }` ) }}
      </MyTooltip>
    </q-select>

    <!-- 대상 방향 -->
    <q-icon
      name="keyboard_double_arrow_down"
      size="xs"
      class="col-1 q-px-none"
    />
  </q-card-section>

  <q-card-section class="col-12 q-px-sm q-pt-none q-pb-none">
    <!-- 대상 값 -->
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
          <MyTooltip v-if="needUnitResultTooltip">{{ unitResult }}</MyTooltip>
        </div>
      </template>
    </q-field>
  </q-card-section>
</template>

<i18n lang="yaml5" src="./UnitPanelResult_i18n.yaml" />
