<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, reactive, watch, Ref } from 'vue';
  import MyTooltip from 'components/MyTooltip.vue';
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();
  import { useStoreCalc } from 'src/stores/store-calc';
  const storeCalc = useStoreCalc();
  const {
    currencyConverter,
    initRecentCurrency,
    clickButtonById,
    showSymbolToggle,
    setInputBlurred,
    setInputFocused,
    blurElement,
    swapCurrencyValue,
  } = storeCalc;

  // 단위 초기화
  initRecentCurrency();

  // 통화 이름을 언어에 맞게 초기화
  interface CurrencyDescription {
    [key: string]: string;
  }

  const descOfCurrency = reactive<CurrencyDescription>(
    currencyConverter.getCurrencyLists().reduce((acc: CurrencyDescription, currency) => {
      acc[currency] = t(`currencyDesc.${currency}`);
      return acc;
    }, {}),
  );

  // 통화 이름을 언어에 맞게 바꾸기 위한 감시
  watch([() => storeCalc.locale], () => {
    currencyConverter.getCurrencyLists().forEach((currency) => {
      descOfCurrency[currency] = t(`currencyDesc.${currency}`);
    });
  });

  // 키바인딩 생성
  import { KeyBinding } from 'classes/KeyBinding';
  const keyBinding = new KeyBinding([
    [['Alt+w'], () => clickButtonById('btn-swap-currency')],
    [['Alt+y'], () => showSymbolToggle()],
  ]);

  watch(
    () => storeCalc.inputFocused,
    () => {
      if (storeCalc.inputFocused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
  );

  let updateRatesTimer: number | undefined;

  onMounted(() => {
    initRecentCurrency();
    keyBinding.subscribe();

    // 환율 정보 업데이트
    (async () => {
      await currencyConverter.updateRates();
    })();

    // 환율 정보 업데이트 주기마다 환율 정보 업데이트
    updateRatesTimer = window.setInterval(
      async () => {
        await currencyConverter.updateRates();
      },
      1000 * 60 * 60 * 1,
    );
  });

  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
    setInputBlurred();
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
    [() => storeCalc.recentCurrencyFrom, () => storeCalc.recentCurrencyTo],
    () => {
      const currencyList = currencyConverter.getCurrencyLists();

      fromCurrencyOptions.values = currencyList.map((currency) => ({
        value: currency,
        label: currency,
        desc: descOfCurrency[currency],
        disable: storeCalc.recentCurrencyTo === currency,
      }));

      toCurrencyOptions.values = currencyList.map((currency) => ({
        value: currency,
        label: currency,
        desc: descOfCurrency[currency],
        disable: storeCalc.recentCurrencyFrom === currency,
      }));

      // 변환기에 기준 통화 설정
      currencyConverter.setBase(storeCalc.recentCurrencyFrom);
    },
    { immediate: true },
  );

  // 통화 선택 필터 함수 생성
  const createFilterFn = (options: Ref<CurrencyOptions[]>, reactiveOptions: ReactiveCurrencyOptions) => {
    return (val: string, update: (fn: () => void) => void, abort: () => void) => {
      if (val.length < 1) {
        update(() => {
          options.value = reactiveOptions.values;
        });
        abort();
        return;
      }

      const needle = val.toLowerCase();
      update(() => {
        options.value = reactiveOptions.values.filter((v) => {
          const labelMatch = v.label.toLowerCase().indexOf(needle) > -1;
          const descMatch = v.desc.toLowerCase().indexOf(needle) > -1;
          return labelMatch || descMatch;
        });
      });
    };
  };

  const fromFilteredCurrencyOptions = ref<CurrencyOptions[]>(fromCurrencyOptions.values);
  const filterFnFrom = createFilterFn(fromFilteredCurrencyOptions, fromCurrencyOptions);

  const toFilteredCurrencyOptions = ref<CurrencyOptions[]>(toCurrencyOptions.values);
  const filterFnTo = createFilterFn(toFilteredCurrencyOptions, toCurrencyOptions);
</script>

<template>
  <q-card-section class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" />

    <!-- 원본 통화 -->
    <q-select
      v-model="storeCalc.recentCurrencyFrom"
      :options="fromFilteredCurrencyOptions"
      :label="descOfCurrency[storeCalc.recentCurrencyFrom]"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      input-debounce="0"
      use-input
      fill-input
      hide-selected
      :label-color="!storeCalc.darkMode ? 'primary' : 'grey-1'"
      :options-selected-class="!storeCalc.darkMode ? 'text-primary' : 'text-grey-1'"
      class="col-4 q-pl-sm shadow-2"
      :popup-content-class="!storeCalc.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :class="!storeCalc.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      @filter="filterFnFrom"
      @focus="setInputFocused()"
      @blur="setInputBlurred()"
      @keyup.enter="blurElement()"
      @update:model-value="blurElement()"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>{{ descOfCurrency[scope.opt.label] }}</q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        <div class="text-left" style="white-space: pre-wrap">
          {{ `${descOfCurrency[storeCalc.recentCurrencyFrom]}\n${storeCalc.recentCurrencyFrom}` }}
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
      @click="swapCurrencyValue()"
    >
      <MyTooltip>{{ t('tooltipSwap') }}</MyTooltip>
    </q-btn>

    <!-- 대상 통화 -->
    <q-select
      v-model="storeCalc.recentCurrencyTo"
      :options="toFilteredCurrencyOptions"
      :label="descOfCurrency[storeCalc.recentCurrencyTo]"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      input-debounce="0"
      use-input
      fill-input
      hide-selected
      :label-color="!storeCalc.darkMode ? 'primary' : 'grey-1'"
      :class="!storeCalc.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!storeCalc.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      class="col-4 q-pl-sm shadow-2"
      :options-selected-class="!storeCalc.darkMode ? 'text-primary' : 'text-grey-1'"
      @filter="filterFnTo"
      @keyup.enter="blurElement()"
      @update:model-value="blurElement()"
      @focus="setInputFocused()"
      @blur="setInputBlurred()"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>{{ descOfCurrency[scope.opt.label] }}</q-item-label>
            <q-item-label>
              {{ `${scope.opt.label}, ${currencyConverter.getRate(scope.opt.label).toFixed(4)}` }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        <div class="text-left" style="white-space: pre-wrap">
          {{
            `${descOfCurrency[storeCalc.recentCurrencyTo]}\n${storeCalc.recentCurrencyTo}, ${currencyConverter.getRate(storeCalc.recentCurrencyTo).toFixed(4)}`
          }}
        </div>
      </MyTooltip>
    </q-select>

    <!-- 대상 방향 -->
    <q-icon name="keyboard_double_arrow_down" size="xs" class="col-1 q-px-none" />
  </q-card-section>
</template>

<i18n lang="yaml5" src="../i18n/components/CurrencyPanel.yml" />