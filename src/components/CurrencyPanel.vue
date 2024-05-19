<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  reactive,
  watch,
  Ref,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { KeyBinding } from 'classes/KeyBinding';
import { useCalcStore } from 'stores/calc-store';
import MyTooltip from 'components/MyTooltip.vue';

const { t } = useI18n();

const store = useCalcStore();

const { calc, currencyConverter } = store;

// 단위 이름과 값을 바꾸기 위한 함수
const swapCurrencyValue = () => {
  // 변환 결과를 원본 값으로 바꾸기
  calc.setCurrentNumber(document.getElementById('subResult')?.textContent ?? '0');

  // 화폐도 바꾸기
  const temp = store.recentCurrencyFrom;
  store.recentCurrencyFrom = store.recentCurrencyTo;
  store.recentCurrencyTo = temp;
}

// 단위 초기화
store.initRecentCurrency();

// 통화 이름을 언어에 맞게 초기화
interface CurrencyDescription {
  [key: string]: string;
}

const descOfCurrency = reactive<CurrencyDescription>(
  currencyConverter
    .getCurrencyLists()
    .reduce((acc: CurrencyDescription, currency) => {
      acc[currency] = t(`currencyDesc.${currency}`);
      return acc;
    }, {}),
);

// 통화 이름을 언어에 맞게 바꾸기 위한 감시
watch([()=>store.locale], () => {
  // 통화 이름을 언어에 맞게 초기화
  currencyConverter.getCurrencyLists().forEach((currency) => {
    descOfCurrency[currency] = t(`currencyDesc.${currency}`);
  });
});

// 키바인딩 생성
const keyBinding = new KeyBinding([
  [['v'], () => store.clickButtonById('btn-swap-currency')],
  [['b'], () => store.showSymbolToggle()],
]);

// inputFocused 값이 바뀌면 키바인딩을 추가하거나 제거합니다.
watch(
  () => store.inputFocused,
  () => {
    if (store.inputFocused) {
      keyBinding.unsubscribe();
    } else {
      keyBinding.subscribe();
    }
  },
  // { immediate: true }
);
let updateRatesTimer: number | undefined;

onMounted(() => {
  store.initRecentCurrency();

  keyBinding.subscribe();

  // 환율 정보 업데이트
  (async () => {
    await currencyConverter.updateRates();
  })();

  // 환율 정보 업데이트 주기마다 환율 정보 업데이트
  updateRatesTimer = window.setInterval(async () => {
    await currencyConverter.updateRates();
  }, 1000 * 60 * 60 * 1);
});

// dom 요소가 언마운트되기 전에 키바인딩 제거
onBeforeUnmount(() => {
  keyBinding.unsubscribe();
  store.setInputBlurred();
  clearInterval(updateRatesTimer);
});

type CurrencyOptions = {
  value: string;
  label: string;
  desc: string;
  disable?: boolean;
};

type ReactiveCurrencyOptions = {
  values: CurrencyOptions[];
};

const fromCurrencyOptions = reactive({ values: [] } as ReactiveCurrencyOptions);
const toCurrencyOptions = reactive({ values: [] } as ReactiveCurrencyOptions);

watch(
  [() => store.recentCurrencyFrom, () => store.recentCurrencyTo],
  () => {
    const currencyList = currencyConverter.getCurrencyLists();

    fromCurrencyOptions.values = currencyList.map((currency) => ({
      value: currency,
      label: currency,
      desc: descOfCurrency[currency],
      disable: store.recentCurrencyTo === currency,
    }));

    toCurrencyOptions.values = currencyList.map((currency) => ({
      value: currency,
      label: currency,
      desc: descOfCurrency[currency],
      disable: store.recentCurrencyFrom === currency,
    }));

    // 변환기에 기준 통화 설정
    currencyConverter.setBase(store.recentCurrencyFrom);
  },
  { immediate: true },
);

// 통화 선택 필터 함수 생성
// 검색어를 사용하여 통화 목록을 필터링하는 함수를 생성합니다.
// options 매개변수는 Ref<CurrencyOptions[]> 타입으로 선언되어 있으며, reactiveOptions 매개변수는 ReactiveCurrencyOptions 타입으로 선언되어 있습니다.
const createFilterFn = (
  options: Ref<CurrencyOptions[]>,
  reactiveOptions: ReactiveCurrencyOptions,
) => {
  // 검색어(val), 업데이트 함수(update), 중단 함수(abort)를 매개변수로 받는 함수를 반환합니다.
  return (val: string, update: (fn: () => void) => void, abort: () => void) => {
    // 검색어의 길이가 1보다 작으면 검색을 중단하고, 검색어의 길이가 1 이상이면 검색을 시작합니다.
    if (val.length < 1) {
      // 검색어가 없으면 options 배열에 모든 값을 저장합니다.
      update(() => {
        options.value = reactiveOptions.values;
      });
      abort();
      return;
    }

    // 검색어를 소문자로 변환하여 needle 변수에 저장합니다.
    const needle = val.toLowerCase();

    // options 배열에서 검색어가 포함된 항목만 필터링하여 options 배열에 저장합니다.
    update(() => {
      options.value = reactiveOptions.values
        .filter((v) => {
          const labelMatch = v.label.toLowerCase().indexOf(needle) > -1;
          const descMatch = v.desc.toLowerCase().indexOf(needle) > -1;
          return labelMatch || descMatch;
        });
    });
  };
};

// fromCurrencyOptions.values 배열을 사용하여 fromFilteredCurrencyOptions 배열을 생성합니다.
const fromFilteredCurrencyOptions = ref<CurrencyOptions[]>(fromCurrencyOptions.values);
// createFilterFn 함수를 사용하여 filterFnFrom 함수를 생성합니다.
const filterFnFrom = createFilterFn(fromFilteredCurrencyOptions, fromCurrencyOptions);

// toCurrencyOptions.values 배열을 사용하여 toFilteredCurrencyOptions 배열을 생성합니다.
const toFilteredCurrencyOptions = ref<CurrencyOptions[]>(toCurrencyOptions.values);
// createFilterFn 함수를 사용하여 filterFnTo 함수를 생성합니다.
const filterFnTo = createFilterFn(toFilteredCurrencyOptions, toCurrencyOptions);
</script>

<template>
  <q-card-section class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" />

    <!-- 원본 통화 -->
    <q-select
      v-model="store.recentCurrencyFrom"
      :options="fromFilteredCurrencyOptions"
      :label="descOfCurrency[store.recentCurrencyFrom]"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      input-debounce="0"
      use-input
      fill-input
      hide-selected
      @filter="filterFnFrom"
      @keyup.enter="store.blurElement"
      @update:model-value="store.blurElement"
      @focus="store.setInputFocused"
      @blur="store.setInputBlurred"
      class="col-4 q-pl-sm shadow-2"
      :class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6' "
      :popup-content-class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :options-selected-class="!store.darkMode ? 'text-primary' : 'text-grey-1'"
      :label-color="!store.darkMode ? 'primary' : 'grey-1'"
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>{{ descOfCurrency[scope.opt.label] }}</q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        <div class="text-left" style="white-space: pre-wrap;">
          {{ `${descOfCurrency[store.recentCurrencyFrom]}\n${store.recentCurrencyFrom}` }}
        </div>
      </MyTooltip>
    </q-select>

    <!-- 원본, 대상 통화 바꾸기 버튼 -->
    <q-btn
      id="btn-swap-currency"
      dense
      round
      flat
      icon="swap_horiz"
      size="md"
      class="col-2 q-mx-none q-px-sm"
      @click="swapCurrencyValue"
    >
      <MyTooltip>{{ t('tooltipSwap') }}</MyTooltip>
    </q-btn>

    <!-- 대상 통화 -->
    <q-select
      v-model="store.recentCurrencyTo"
      :options="toFilteredCurrencyOptions"
      :label="descOfCurrency[store.recentCurrencyTo]"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      input-debounce="0"
      use-input
      fill-input
      hide-selected
      @filter="filterFnTo"
      @keyup.enter="store.blurElement"
      @update:model-value="store.blurElement"
      @focus="store.setInputFocused"
      @blur="store.setInputBlurred"
      class="col-4 q-pl-sm shadow-2"
      :class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :options-selected-class="!store.darkMode ? 'text-primary' : 'text-grey-1'"
      :label-color="!store.darkMode ? 'primary' : 'grey-1'"
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>{{ descOfCurrency[scope.opt.label] }}</q-item-label>
            <q-item-label>
              {{ `${scope.opt.label}, ${currencyConverter.getRate(scope.opt.label)}` }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        <div class="text-left" style="white-space: pre-wrap;">
          {{ `${descOfCurrency[store.recentCurrencyTo]}\n${store.recentCurrencyTo}, ${currencyConverter.getRate(store.recentCurrencyTo)}` }}
        </div>
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

<i18n lang="yaml5" src="../i18n/components/CurrencyPanel.yml" />
