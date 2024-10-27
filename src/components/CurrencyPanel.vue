<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, reactive, watch, Ref } from 'vue';
  import MyTooltip from 'components/MyTooltip.vue';
  import { useI18n } from 'vue-i18n';
  import { useStoreSettings } from 'src/stores/store-settings';
  import { useStoreCurrency } from 'src/stores/store-currency';
  import { useStoreUtils } from 'src/stores/store-utils';
  import { KeyBinding } from 'classes/KeyBinding';

  // i18n 설정
  const { t } = useI18n();

  // 스토어 인스턴스 초기화
  const storeSettings = useStoreSettings();
  const storeCurrency = useStoreCurrency();
  const storeUtils = useStoreUtils();

  // 스토어에서 필요한 메서드 추출
  const { currencyConverter, swapCurrencyValue, initRecentCurrency } = storeCurrency;
  const { clickButtonById, setInputBlurred, setInputFocused, blurElement } = storeUtils;

  // 단위 초기화
  initRecentCurrency();

  // 통화 설명을 위한 인터페이스 정의
  interface CurrencyDescription {
    [key: string]: string;
  }

  // 통화 이름을 현재 언어에 맞게 초기화
  const descOfCurrency = reactive<CurrencyDescription>(
    currencyConverter.getCurrencyLists().reduce((acc: CurrencyDescription, currency) => {
      acc[currency] = t(`currencyDesc.${currency}`);
      return acc;
    }, {}),
  );

  // 언어 변경 시 통화 이름 업데이트
  watch([() => storeSettings.locale], () => {
    currencyConverter.getCurrencyLists().forEach((currency) => {
      descOfCurrency[currency] = t(`currencyDesc.${currency}`);
    });
  });

  // 키 바인딩 설정
  const keyBinding = new KeyBinding([
    [['Alt+w'], () => clickButtonById('btn-swap-currency')],
    [['Alt+y'], () => storeSettings.toggleShowSymbol()],
  ]);

  // 입력 포커스에 따른 키 바인딩 활성화/비활성화
  watch(
    () => storeUtils.inputFocused,
    () => {
      if (storeUtils.inputFocused) {
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

    // 초기 환율 정보 업데이트
    (async () => {
      await currencyConverter.updateRates();
    })();

    // 주기적으로 환율 정보 업데이트 (1시간마다)
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

  // 통화 옵션 타입 정의
  type CurrencyOptions = {
    value: string;
    label: string;
    desc: string;
    disable?: boolean;
  };

  type ReactiveCurrencyOptions = {
    values: CurrencyOptions[];
  };

  // 통화 옵션 초기화
  const fromCurrencyOptions = reactive({ values: [] } as ReactiveCurrencyOptions);
  const toCurrencyOptions = reactive({ values: [] } as ReactiveCurrencyOptions);

  // 통화 옵션 업데이트
  watch(
    [() => storeCurrency.recentCurrencyFrom, () => storeCurrency.recentCurrencyTo],
    () => {
      const currencyList = currencyConverter.getCurrencyLists();

      // 'From' 통화 옵션 설정
      fromCurrencyOptions.values = currencyList.map((currency) => ({
        value: currency,
        label: currency,
        desc: descOfCurrency[currency],
        disable: storeCurrency.recentCurrencyTo === currency,
      }));

      // 'To' 통화 옵션 설정
      toCurrencyOptions.values = currencyList.map((currency) => ({
        value: currency,
        label: currency,
        desc: descOfCurrency[currency],
        disable: storeCurrency.recentCurrencyFrom === currency,
      }));

      // 변환기에 기준 통화 설정
      currencyConverter.setBase(storeCurrency.recentCurrencyFrom);
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

  // 'From' 통화 필터 설정
  const fromFilteredCurrencyOptions = ref<CurrencyOptions[]>(fromCurrencyOptions.values);
  const filterFnFrom = createFilterFn(fromFilteredCurrencyOptions, fromCurrencyOptions);

  // 'To' 통화 필터 설정
  const toFilteredCurrencyOptions = ref<CurrencyOptions[]>(toCurrencyOptions.values);
  const filterFnTo = createFilterFn(toFilteredCurrencyOptions, toCurrencyOptions);
</script>

<template>
  <q-card-section class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" />

    <!-- 원본 통화 -->
    <q-select
      v-model="storeCurrency.recentCurrencyFrom"
      :options="fromFilteredCurrencyOptions"
      :label="descOfCurrency[storeCurrency.recentCurrencyFrom]"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      input-debounce="0"
      use-input
      fill-input
      hide-selected
      :label-color="!storeSettings.darkMode ? 'primary' : 'grey-1'"
      :options-selected-class="!storeSettings.darkMode ? 'text-primary' : 'text-grey-1'"
      class="col-4 q-pl-sm shadow-2"
      :popup-content-class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
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
          {{ `${descOfCurrency[storeCurrency.recentCurrencyFrom]}\n${storeCurrency.recentCurrencyFrom}` }}
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
      v-model="storeCurrency.recentCurrencyTo"
      :options="toFilteredCurrencyOptions"
      :label="descOfCurrency[storeCurrency.recentCurrencyTo]"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      input-debounce="0"
      use-input
      fill-input
      hide-selected
      :label-color="!storeSettings.darkMode ? 'primary' : 'grey-1'"
      :class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      class="col-4 q-pl-sm shadow-2"
      :options-selected-class="!storeSettings.darkMode ? 'text-primary' : 'text-grey-1'"
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
            `${descOfCurrency[storeCurrency.recentCurrencyTo]}\n${storeCurrency.recentCurrencyTo}, ${currencyConverter.getRate(storeCurrency.recentCurrencyTo).toFixed(4)}`
          }}
        </div>
      </MyTooltip>
    </q-select>

    <!-- 대상 방향 -->
    <q-icon name="keyboard_double_arrow_down" size="xs" class="col-1 q-px-none" />
  </q-card-section>
</template>

<i18n lang="yaml5" src="../i18n/components/CurrencyPanel.yml" />