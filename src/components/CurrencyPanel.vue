<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, reactive, watch, Ref } from 'vue';
  import MyTooltip from 'components/MyTooltip.vue';
  import { useI18n } from 'vue-i18n';
  import { useStoreBase } from 'src/stores/store-base';
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
  const storeBase = useStoreBase();
  // 스토어에서 필요한 메서드 추출
  const { calc } = storeBase;
  const { converter, swapCurrencies, initRecentCurrencies } = storeCurrency;
  const { clickButtonById, setInputBlurred, setInputFocused, blurElement } = storeUtils;

  // 단위 초기화
  initRecentCurrencies();

  // 통화 설명을 위한 인터페이스 정의
  interface CurrencyDescription {
    [key: string]: string;
  }

  // 통화 이름을 현재 언어에 맞게 초기화
  const currencyDescriptions = reactive<CurrencyDescription>(
    converter.getCurrencyLists().reduce((acc: CurrencyDescription, currency) => {
      acc[currency] = t(`currencyDesc.${currency}`);
      return acc;
    }, {}),
  );

  // 언어 변경 시 통화 이름 업데이트
  watch([() => storeSettings.locale], () => {
    converter.getCurrencyLists().forEach((currency) => {
      currencyDescriptions[currency] = t(`currencyDesc.${currency}`);
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

  let rateUpdateTimer: number | undefined;

  onMounted(() => {
    initRecentCurrencies();
    keyBinding.subscribe();

    // 초기 환율 정보 업데이트
    (async () => {
      await converter.updateRates();
    })();

    // 주기적으로 환율 정보 업데이트 (1시간마다)
    rateUpdateTimer = window.setInterval(
      async () => {
        await converter.updateRates();
      },
      1000 * 60 * 60 * 1,
    );
  });

  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
    setInputBlurred();
    clearInterval(rateUpdateTimer);
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
  const sourceCurrencyOptions = reactive({ values: [] } as ReactiveCurrencyOptions);
  const targetCurrencyOptions = reactive({ values: [] } as ReactiveCurrencyOptions);

  // 통화 옵션 업데이트
  watch(
    [() => storeCurrency.sourceCurrency, () => storeCurrency.targetCurrency],
    () => {
      const currencyList = converter.getCurrencyLists();

      // 'From' 통화 옵션 설정
      sourceCurrencyOptions.values = currencyList.map((currency) => ({
        value: currency,
        label: currency,
        desc: currencyDescriptions[currency],
        disable: storeCurrency.targetCurrency === currency,
      }));

      // 'To' 통화 옵션 설정
      targetCurrencyOptions.values = currencyList.map((currency) => ({
        value: currency,
        label: currency,
        desc: currencyDescriptions[currency],
        disable: storeCurrency.sourceCurrency === currency,
      }));

      // 변환기에 기준 통화 설정
      converter.setBase(storeCurrency.sourceCurrency);
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

      const searchTerm = val.toLowerCase();
      update(() => {
        options.value = reactiveOptions.values.filter((v) => {
          const labelMatch = v.label.toLowerCase().indexOf(searchTerm) > -1;
          const descMatch = v.desc.toLowerCase().indexOf(searchTerm) > -1;
          return labelMatch || descMatch;
        });
      });
    };
  };

  // 'From' 통화 필터 설정
  const filteredSourceCurrencyOptions = ref<CurrencyOptions[]>(sourceCurrencyOptions.values);
  const sourceFilterFn = createFilterFn(filteredSourceCurrencyOptions, sourceCurrencyOptions);

  // 'To' 통화 필터 설정
  const filteredTargetCurrencyOptions = ref<CurrencyOptions[]>(targetCurrencyOptions.values);
  const targetFilterFn = createFilterFn(filteredTargetCurrencyOptions, targetCurrencyOptions);
  
  const handleCurrencySwap = () => {
    const convertedValue = converter.convert(
      Number(calc.currentNumber), 
      storeCurrency.sourceCurrency,
      storeCurrency.targetCurrency
    );
    calc.setCurrentNumber(convertedValue.toString());
    swapCurrencies();
  };
</script>

<template>
  <q-card-section class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" />

    <!-- 원본 통화 -->
    <q-select
      v-model="storeCurrency.sourceCurrency"
      :options="filteredSourceCurrencyOptions"
      :label="currencyDescriptions[storeCurrency.sourceCurrency]"
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
      @filter="sourceFilterFn"
      @focus="setInputFocused()"
      @blur="setInputBlurred()"
      @keyup.enter="blurElement()"
      @update:model-value="blurElement()"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>{{ currencyDescriptions[scope.opt.label] }}</q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        <div class="text-left" style="white-space: pre-wrap">
          {{ `${currencyDescriptions[storeCurrency.sourceCurrency]}\n${storeCurrency.sourceCurrency}` }}
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
      @click="handleCurrencySwap()"
    >
      <MyTooltip>{{ t('tooltipSwap') }}</MyTooltip>
    </q-btn>

    <!-- 대상 통화 -->
    <q-select
      v-model="storeCurrency.targetCurrency"
      :options="filteredTargetCurrencyOptions"
      :label="currencyDescriptions[storeCurrency.targetCurrency]"
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
      @filter="targetFilterFn"
      @keyup.enter="blurElement()"
      @update:model-value="blurElement()"
      @focus="setInputFocused()"
      @blur="setInputBlurred()"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>{{ currencyDescriptions[scope.opt.label] }}</q-item-label>
            <q-item-label>
              {{ `${scope.opt.label}, ${converter.getRate(scope.opt.label).toFixed(4)}` }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        <div class="text-left" style="white-space: pre-wrap">
          {{
            `${currencyDescriptions[storeCurrency.targetCurrency]}\n${storeCurrency.targetCurrency}, ${converter.getRate(storeCurrency.targetCurrency).toFixed(4)}`
          }}
        </div>
      </MyTooltip>
    </q-select>

    <!-- 대상 방향 -->
    <q-icon name="keyboard_double_arrow_down" size="xs" class="col-1 q-px-none" />
  </q-card-section>
</template>

<i18n lang="yaml5" src="../i18n/components/CurrencyPanel.yml" />