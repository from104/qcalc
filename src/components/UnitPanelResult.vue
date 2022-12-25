<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeMount,
  onBeforeUnmount,
  reactive,
  watch,
} from 'vue';
import tinykeys, { KeyBindingMap } from 'tinykeys';
import { useI18n } from 'vue-i18n';

import UnitConverter from 'classes/UnitConverter';

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
  }
}

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

  // 변환 결과를 반환
  return store.toLocale(
    UnitConverter.convert(
      store.recentCategory,
      Number(calc.getShownNumber()),
      store.recentUnitFrom[store.recentCategory],
      store.recentUnitTo[store.recentCategory]
    )
  );
});

// 라우팅 위치가 달라지면 변환 패널 닫기
onBeforeMount(() => {
  store.unitPanel = false;
});

// 키바인딩 제거하기위한 변수 선언
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
          :label="t('src')"
          stack-label
          dense
          options-dense
          filled
          class="col-3 shadow-4"
        />
        <q-select
          v-model="store.recentCategory"
          :options="categories"
          :label="t('category')"
          stack-label
          dense
          options-dense
          filled
          emit-value
          map-options
          class="col-6 shadow-4 text-no-wrap"
        >
          <template v-slot:after>
            <q-icon
              name="swap_vert"
              class="q-mr-sm cursor-pointer"
              @click="swapUnitValue"
              @click.stop.prevent
            >
              <MyTooltip>{{ t('tooltipSwap') }}</MyTooltip>
            </q-icon>
          </template>
        </q-select>
        <q-select
          v-model="store.recentUnitTo[store.recentCategory]"
          :options="UnitConverter.getUnitLists(store.recentCategory)"
          :label="t('dest')"
          stack-label
          dense
          options-dense
          filled
          class="col-3 shadow-4"
        />
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

<i18n>
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
    bytes: '바이트'
  src: '원본'
  dest: '대상'
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
    bytes: 'Bytes'
  src: 'src'
  dest: 'dest'
  tooltipSwap: 'Swap source and destination.'
</i18n>

<style scoped lang="scss">
#unit {
  max-width: calc(100vw - 15px);
  position: fixed;
  top: 140px;
}
</style>
