<script setup lang="ts">
import { ref, onBeforeMount, onMounted, onBeforeUnmount, reactive, watch } from 'vue';

import MyTooltip from 'components/MyTooltip.vue';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 스토어 가져오기
import { useCalcStore } from 'stores/calc-store';

const store = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const calc = store.calc;

import UnitConverter from 'classes/UnitConverter';

// 범주와 단위를 초기화
const initRecentCategoryAndUnit = () => {
  // 범주 초기화
  if (!UnitConverter.categories.includes(store.recentCategory)) {
    store.recentCategory = UnitConverter.categories[0];
  }

  // 단위 초기화
  if (!UnitConverter.getUnitLists(store.recentCategory).includes(store.recentUnitFrom[store.recentCategory])) {
    store.recentUnitFrom[store.recentCategory] = UnitConverter.getUnitLists(store.recentCategory)[0];
  }

  if (!UnitConverter.getUnitLists(store.recentCategory).includes(store.recentUnitTo[store.recentCategory])) {
    store.recentUnitTo[store.recentCategory] = UnitConverter.getUnitLists(store.recentCategory)[0];
    if (store.recentUnitTo[store.recentCategory] == store.recentUnitFrom[store.recentCategory]) {
      store.recentUnitTo[store.recentCategory] = UnitConverter.getUnitLists(store.recentCategory)[1];
    }
  }
};

// 단위 이름과 값을 바꾸기 위한 함수
const swapUnitValue = () => {
  // 변환 결과를 원본 값으로 바꾸기
  // (computed로 선언된 unitResult로 인해 값이 바뀌면 자동으로 변환 결과가 바뀜)
  calc.setCurrentNumber(unitResult.value);

  // 단위도 바꾸기
  const temp = store.recentUnitFrom[store.recentCategory];
  store.recentUnitFrom[store.recentCategory] = store.recentUnitTo[store.recentCategory];
  store.recentUnitTo[store.recentCategory] = temp;
};

// 단위 초기화
initRecentCategoryAndUnit();

// 범주 이름을 언어에 맞게 초기화
const categories = reactive(
  UnitConverter.categories.map((category) => ({
    value: category,
    label: t(`categories.${category}`)
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
const setNeedUnitResultTooltip = () => {
  // 원래 결과 칸 길이
  const ow = document.getElementById('unitResult')?.offsetWidth ?? 0;

  // 결과 문자열의 크기
  // (원래 칸에 결과 길이가 넘치면 스크롤 해야하는데 ...로 대체 시킨 경우 스크롤해야할 폭 값만 커진다.)
  const sw = document.getElementById('unitResult')?.scrollWidth ?? 0;

  // 원래의 칸 크기보다 결과 문자열 길이가 길면 툴팁을 표시
  needUnitResultTooltip.value = ow < sw;

  return true;
};

const getUnitResult = () => {
  // 저장된 범주와 단위가 잘못됐으면 초기화
  initRecentCategoryAndUnit();

  const unit = store.showUnit ? store.recentUnitTo[store.recentCategory] : '';

  // 변환 결과를 반환
  return [
    store.toLocale(
      UnitConverter.convert(
        store.recentCategory,
        calc.getCurrentNumber(),
        store.recentUnitFrom[store.recentCategory],
        store.recentUnitTo[store.recentCategory]
      )
    ),
    unit
  ].join(' ');
};

const unitResult = ref(getUnitResult());

// 계산 결과가 바뀌면 변환 결과도 바뀌도록 감시
watch(
  [
    calc,
    () => store.recentCategory,
    () => store.recentUnitFrom[store.recentCategory],
    () => store.recentUnitTo[store.recentCategory],
    () => store.useGrouping,
    () => store.decimalPlaces,
    () => store.showUnit
  ],
  () => {
    unitResult.value = getUnitResult();
  }
);

import { KeyBinding } from 'classes/KeyBinding';

const keyBinding = new KeyBinding([
  [['v'], () => store.clickButtonById('btn-swap-unit')],
  [['b'], () => store.showUnitToggle()]
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

onBeforeMount(() => {
  window.addEventListener('resize', setNeedUnitResultTooltip);
});

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
      class="col-3 q-pl-sm shadow-4"
      :class=" store.darkMode ? 'bg-grey-9' : 'bg-grey-3' "
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
      class="col-3 q-pl-sm shadow-4"
      :class=" store.darkMode ? 'bg-grey-9' : 'bg-grey-3' "
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
      :color=" store.getDarkColor( 'primary' ) "
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
      class="col-3 q-pl-sm shadow-4"
      :class=" store.darkMode ? 'bg-grey-9' : 'bg-grey-3' "
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

  <q-card-section class="col-12 q-px-sm q-pt-none q-pb-none">
    <!-- 대상 값 -->
    <q-field
      :model-value=" unitResult "
      class="shadow-4 justify-end self-center"
      filled
      dense
      readonly
      :bg-color=" needUnitResultTooltip
        ? store.darkMode
          ? 'blue-grey-9'
          : 'amber-2'
        : undefined
        "
    >
      <template v-slot:control>
        <div
          id="unitResult"
          v-mutation=" setNeedUnitResultTooltip "
          v-mutation.characterData
          class="self-center full-width no-outline ellipsis text-h4 text-right"
        >
          {{ unitResult }}
          <MyTooltip v-if=" needUnitResultTooltip ">{{ unitResult }}</MyTooltip>
        </div>
      </template>
    </q-field>
  </q-card-section>
</template>

<i18n lang="yaml5">
ko:
  category: '범주'
  categories:
    length: '길이'
    area: '넓이'
    volume: '부피'
    weight: '무게'
    temp: '온도'
    time: '시간'
    speed: '속도'
    pressure: '압력'
    data: '자료'
  unitDesc:
    length:
      m: '미터'
      km: '킬로미터'
      cm: '센티미터'
      mm: '밀리미터'
      in: '인치'
      ft: '피트'
      yd: '야드'
      mi: '마일'
    area:
      py: '평'
      'm²': '제곱미터'
      'km²': '제곱킬로미터'
      'cm²': '제곱센티미터'
      'mm²': '제곱밀리미터'
      'in²': '제곱인치'
      'ft²': '제곱피트'
      'yd²': '제곱야드'
      'mi²': '제곱마일'
      ha: '헥타르'
      a: '아르'
      ac: '에이커'
    volume:
      'm³': '큐브미터'
      'km³': '큐브킬로미터'
      'cm³': '큐브센티미터'
      'mm³': '큐브밀리미터'
      'in³': '큐브인치'
      'ft³': '큐브피트'
      'yd³': '큐브야드'
      'mi³': '큐브마일'
      l: '리터'
      ml: '밀리리터'
      kl: '킬로리터'
      gal: '갤런'
    weight:
      g: '그램'
      kg: '킬로그램'
      mg: '밀리그램'
      oz: '온스'
      lb: '파운드'
      ton: '톤'
    temp:
      '°C': '섭씨'
      '°F': '화씨'
      K: '켈빈'
      '°R': '랭킨'
    time:
      sec: '초'
      min: '분'
      hour: '시간'
      day: '일'
      week: '주'
      month: '월'
      year: '년'
    speed:
      'km/h': '시간당 킬로미터'
      'm/s': '시간당 미터'
      'ft/s': '시간당 피트'
      'mi/h': '시간당 마일'
      knot: '노트'
    pressure:
      Pa: '파스칼'
      kPa: '킬로파스칼'
      MPa: '메가파스칼'
      hPa: '헥토파스칼'
      bar: '바'
      psi: '파운드당 제곱인치'
      ksi: '킬로파운드당 제곱인치'
    data:
      B: '바이트'
      KB: '킬로바이트'
      MB: '메가바이트'
      GB: '기가바이트'
      TB: '테라바이트'
      PB: '페타바이트'
  tooltipSwap: '원본과 대상을 바꿉니다.'
en:
  category: 'Category'
  categories:
    length: 'Length'
    area: 'Area'
    volume: 'Volume'
    weight: 'Weight'
    temp: 'Temp'
    time: 'Time'
    speed: 'Speed'
    pressure: 'Pressure'
    data: 'Data'
  unitDesc:
    length:
      m: 'Meter'
      km: 'Kilometer'
      cm: 'Centimeter'
      mm: 'Millimeter'
      in: 'Inch'
      ft: 'Foot'
      yd: 'Yard'
      mi: 'Mile'
    area:
      py: 'Pyeong'
      'm²': 'Square Meter'
      'km²': 'Square Kilometer'
      'cm²': 'Square Centimeter'
      'mm²': 'Square Millimeter'
      'in²': 'Square Inch'
      'ft²': 'Square Foot'
      'yd²': 'Square Yard'
      'mi²': 'Square Mile'
      ha: 'Hectare'
      a: 'Are'
      ac: 'Acre'
    volume:
      'm³': 'Cubic Meter'
      'km³': 'Cubic Kilometer'
      'cm³': 'Cubic Centimeter'
      'mm³': 'Cubic Millimeter'
      'in³': 'Cubic Inch'
      'ft³': 'Cubic Foot'
      'yd³': 'Cubic Yard'
      'mi³': 'Cubic Mile'
      l: 'Liter'
      ml: 'Milliliter'
      kl: 'Kiloliter'
      gal: 'Gallon'
    weight:
      g: 'Gram'
      kg: 'Kilogram'
      mg: 'Milligram'
      oz: 'Ounce'
      lb: 'Pound'
      ton: 'Ton'
    temp:
      '°C': 'Celsius'
      '°F': 'Fahrenheit'
      K: 'Kelvin'
      '°R': 'Rankine'
    time:
      sec: 'Second'
      min: 'Minute'
      hour: 'Hour'
      day: 'Day'
      week: 'Week'
      month: 'Month'
      year: 'Year'
    speed:
      'km/h': 'Kilometer per Hour'
      'm/s': 'Meter per Second'
      'ft/s': 'Foot per Second'
      'mi/h': 'Mile per Hour'
      knot: 'Knot'
    pressure:
      Pa: 'Pascal'
      kPa: 'Kilopascal'
      MPa: 'Megapascal'
      hPa: 'Hectopascal'
      bar: 'Bar'
      psi: 'Pound per Square Inch'
      ksi: 'Kilopound per Square Inch'
    data:
      B: 'Byte'
      KB: 'Kilobyte'
      MB: 'Megabyte'
      GB: 'Gigabyte'
      TB: 'Terabyte'
      PB: 'Petabyte'
  tooltipSwap: 'Swap source and destination.'
</i18n>
