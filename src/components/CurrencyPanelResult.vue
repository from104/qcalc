<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  reactive,
  watch,
} from 'vue';
import tinykeys, { KeyBindingMap } from 'tinykeys';
import { useI18n } from 'vue-i18n';

// import {CurrencyConverter} from 'classes/CurrencyConverter';

import { useCalcStore } from 'stores/calc-store';

import MyTooltip from 'components/MyTooltip.vue';

const { t } = useI18n();

// 스토어 가져오기
const store = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const calc = store.calc;

const currencyConverter = store.currencyConverter;

// 환율 정보 업데이트

// 단위 이름과 값을 바꾸기 위한 함수
function swapCurrencyValue() {
  // 변환 결과를 원본 값으로 바꾸기
  // (computed로 선언된 CurrencyResult로 인해 값이 바뀌면 자동으로 변환 결과가 바뀜)
  calc.setShownNumber(currencyResult.value);

  // 단위도 바꾸기
  const temp = store.recentCurrencyFrom;
  store.recentCurrencyFrom = store.recentCurrencyTo;
  store.recentCurrencyTo = temp;
}

// 선택할 통화 초기화
function initRecentCurrency() {
  // 저장된 통화가 잘못됐으면 초기화
  if (
    !currencyConverter.getCurrencyLists().includes(store.recentCurrencyFrom)
  ) {
    store.recentCurrencyFrom = currencyConverter.getCurrencyLists()[0];
    if (store.recentCurrencyFrom == store.recentCurrencyTo) {
      store.recentCurrencyFrom = currencyConverter.getCurrencyLists()[1];
    }
  }
}

// 단위 초기화
initRecentCurrency();

// 통화 이름을 언어에 맞게 초기화
const NamesOfCurrency = reactive(
  currencyConverter.getCurrencyLists().map((currency) => ({
    value: currency,
    label: t(`currencyDesc.${currency}`),
  }))
);

// 통화 이름을 언어에 맞게 바꾸기 위한 감시
watch([() => store.useSystemLocale, () => store.userLocale], () => {
  NamesOfCurrency.forEach((currency) => {
    currency.label = t(`currencyDesc.${currency.value}`);
  });
});

// 변환 결과 툴팁 표시 상태 변수
const needCurrencyResultTooltip = ref(false);

// 변환 결과가 길 경우 툴팁 표시 상태 셋팅
function setNeedCurrencyResultTooltip() {
  // 원래 결과 칸 길이
  const ow = document.getElementById('currencyResult')?.offsetWidth ?? 0;
  // 결과 문자열의 크기
  // (원래 칸에 결과 길이가 넘치면 스크롤 해야하는데 ...로 대체 시킨 경우 스크롤해야할 폭 값만 커진다.)
  const sw = document.getElementById('currencyResult')?.scrollWidth ?? 0;
  // 원래의 칸 크기보다 결과 문자열 길이가 길면 툴팁을 표시
  needCurrencyResultTooltip.value = ow < sw;
}

// 변환 결과 계산 (computed로 선언하여 값이 바뀔 때마다 자동으로 계산)
const currencyResult = computed(() => {
  // 저장된 범주와 단위가 잘못됐으면 초기화
  initRecentCurrency();

  // 변환 결과를 반환
  return store.toLocale(
    currencyConverter.convert(
      Number(calc.getShownNumber()),
      store.recentCurrencyFrom,
      store.recentCurrencyTo
    )
  );
});

// 키바인딩 제거하기위한 변수 선언
let keybindingRemoveAtUmount = tinykeys(window, {} as KeyBindingMap);

onMounted(() => {
  initRecentCurrency();

  type Shortcut = [string[], () => void][];

  const shortcuts: Shortcut = [[['v'], () => swapCurrencyValue()]];

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

  // 변환 결과 툴팁 표시 상태 셋팅
  setNeedCurrencyResultTooltip();

  // 환율 정보 업데이트
  (async () => {
    await currencyConverter.updateRates();
  })();
});

onBeforeUnmount(() => {
  // dom 요소가 언마운트되기 전에 키바인딩 제거
  keybindingRemoveAtUmount();
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
    const CurrencyList = currencyConverter.getCurrencyLists();

    fromCurrencyOptions.values = CurrencyList.map((currency) => ({
      value: currency,
      label: currency,
      desc: NamesOfCurrency.find((c) => c.value === currency)?.label ?? '',
      disable: store.recentCurrencyTo === currency,
    }));

    toCurrencyOptions.values = CurrencyList.map((currency) => ({
      value: currency,
      label: currency,
      desc: NamesOfCurrency.find((c) => c.value === currency)?.label ?? '',
      disable: store.recentCurrencyFrom === currency,
    }));

    // 변환기에 기준 통화 설정
    currencyConverter.setBase(store.recentCurrencyFrom);
  },
  { immediate: true }
);
</script>

<template>
  <q-card-section class="row q-px-sm q-pt-none q-pb-sm" v-blur>
    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" />

    <!-- 원본 통화 -->
    <q-select
      v-model="store.recentCurrencyFrom"
      :options="fromCurrencyOptions.values"
      :label="t(`currencyDesc.${store.recentCurrencyFrom}`)"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-4 q-pl-sm shadow-4"
      :class="store.darkMode ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <q-item-label caption>{{
              t(`currencyDesc.${scope.opt.label}`)
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip
        ><div
          class="text-left"
          v-html="
            t(`currencyDesc.${store.recentCurrencyFrom}`) +
            `<br/>${store.recentCurrencyFrom}`
          "
      /></MyTooltip>
    </q-select>

    <!-- 원본, 대상 통화 바꾸기 버튼 -->
    <q-btn
      dense
      round
      flat
      icon="swap_horiz"
      size="md"
      class="col-2 q-mx-none q-px-sm"
      :color="store.getDarkColor('primary')"
      @click="swapCurrencyValue"
    >
      <MyTooltip>{{ t('tooltipSwap') }}</MyTooltip>
    </q-btn>

    <!-- 대상 통화 -->
    <q-select
      v-model="store.recentCurrencyTo"
      :options="toCurrencyOptions.values"
      :label="t(`currencyDesc.${store.recentCurrencyTo}`)"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-4 q-pl-sm shadow-4"
      :class="store.darkMode ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label>{{
              `${scope.opt.label}, ${currencyConverter
                .getRate(scope.opt.label)
                .toFixed(6)}`
            }}</q-item-label>
            <q-item-label caption>{{
              t(`currencyDesc.${scope.opt.label}`)
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip
        ><div
          class="text-left"
          v-html="
            t(`currencyDesc.${store.recentCurrencyTo}`) +
            `<br/>${store.recentCurrencyTo}`
          "
      /></MyTooltip>
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
      :model-value="currencyResult"
      class="shadow-4 justify-end self-center"
      filled
      dense
      readonly
      :bg-color="
        needCurrencyResultTooltip
          ? store.darkMode
            ? 'blue-grey-9'
            : 'amber-2'
          : undefined
      "
    >
      <template v-slot:control>
        <div
          id="currencyResult"
          v-mutation="setNeedCurrencyResultTooltip"
          v-mutation.characterData
          class="self-center full-width no-outline ellipsis text-h4 text-right"
        >
          {{ currencyResult }}
          <MyTooltip v-if="needCurrencyResultTooltip">{{
            currencyResult
          }}</MyTooltip>
        </div>
      </template>
    </q-field>
  </q-card-section>
</template>

<i18n lang="yaml5" src="./CurrencyPanelResult_i18n.yaml5" />
