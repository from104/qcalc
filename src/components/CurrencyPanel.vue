<script setup lang="ts">
  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { ref, onMounted, onBeforeUnmount, reactive, watch, Ref } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // 계산기 관련 타입과 클래스
  import { BigNumber } from 'classes/CalculatorMath';
  import { KeyBinding } from 'classes/KeyBinding';

  // 스토어 관련
  import { useStore } from 'src/stores/store';
  // 스토어 인스턴스 초기화
  const store = useStore();
  // 스토어에서 필요한 메서드 추출
  const {
    calc,
    converter,
    swapCurrencies,
    initRecentCurrencies,
    clickButtonById,
    setInputBlurred,
    setInputFocused,
    blurElement,
  } = store;

  // 컴포넌트 import
  import ToolTip from 'src/components/snippets/ToolTip.vue';

  // 키 바인딩 설정
  const keyBinding = new KeyBinding([
    [['Alt+w'], () => clickButtonById('btn-swap-currency')],
    [['Alt+y'], () => store.toggleShowSymbol()],
  ]);

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
  watch([() => store.locale], () => {
    converter.getCurrencyLists().forEach((currency) => {
      currencyDescriptions[currency] = t(`currencyDesc.${currency}`);
    });
  });

  // 입력 포커스에 따른 키 바인딩 활성화/비활성화
  watch(
    () => store.inputFocused,
    () => {
      if (store.inputFocused) {
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
    [() => store.sourceCurrency, () => store.targetCurrency],
    () => {
      const currencyList = converter.getCurrencyLists();

      // 'From' 통화 옵션 설정
      sourceCurrencyOptions.values = currencyList.map((currency) => ({
        value: currency,
        label: currency,
        desc: currencyDescriptions[currency],
        disable: store.targetCurrency === currency,
      }));

      // 'To' 통화 옵션 설정
      targetCurrencyOptions.values = currencyList.map((currency) => ({
        value: currency,
        label: currency,
        desc: currencyDescriptions[currency],
        disable: store.sourceCurrency === currency,
      }));

      // 변환기에 기준 통화 설정
      converter.setBase(store.sourceCurrency);
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
    const convertedValue = converter.convert(BigNumber(calc.currentNumber), store.sourceCurrency, store.targetCurrency);
    calc.setCurrentNumber(convertedValue.toString());
    swapCurrencies();
  };
</script>

<template>
  <q-card-section class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" role="img" :aria-label="t('ariaLabel.sourceDirection')" />

    <!-- 원본 통화 -->
    <q-select
      v-model="store.sourceCurrency"
      :options="filteredSourceCurrencyOptions"
      :label="currencyDescriptions[store.sourceCurrency]"
      role="combobox"
      :aria-label="t('ariaLabel.sourceCurrency')"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      input-debounce="0"
      use-input
      fill-input
      hide-selected
      class="col-4 q-pl-sm shadow-2"
      :label-color="!store.isDarkMode() ? 'primary' : 'grey-1'"
      :options-selected-class="!store.isDarkMode() ? 'text-primary' : 'text-grey-1'"
      :popup-content-class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
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
      <ToolTip>
        <div class="text-left" style="white-space: pre-wrap">
          {{ `${currencyDescriptions[store.sourceCurrency]}\n${store.sourceCurrency}` }}
        </div>
      </ToolTip>
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
      role="button"
      :aria-label="t('ariaLabel.swapCurrencies')"
      @click="handleCurrencySwap()"
    >
      <ToolTip>{{ t('tooltipSwap') }}</ToolTip>
    </q-btn>

    <!-- 대상 통화 -->
    <q-select
      v-model="store.targetCurrency"
      :options="filteredTargetCurrencyOptions"
      :label="currencyDescriptions[store.targetCurrency]"
      role="combobox"
      :aria-label="t('ariaLabel.targetCurrency')"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      input-debounce="0"
      use-input
      fill-input
      hide-selected
      class="col-4 q-pl-sm shadow-2"
      :label-color="!store.isDarkMode() ? 'primary' : 'grey-1'"
      :class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :options-selected-class="!store.isDarkMode() ? 'text-primary' : 'text-grey-1'"
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
      <ToolTip>
        <div class="text-left" style="white-space: pre-wrap">
          {{
            `${currencyDescriptions[store.targetCurrency]}\n${store.targetCurrency}, ${converter.getRate(store.targetCurrency).toFixed(4)}`
          }}
        </div>
      </ToolTip>
    </q-select>

    <!-- 대상 방향 -->
    <q-icon
      name="keyboard_double_arrow_down"
      size="xs"
      class="col-1 q-px-none"
      role="img"
      :aria-label="t('ariaLabel.targetDirection')"
    />
  </q-card-section>
</template>

<i18n lang="yaml5" src="../i18n/components/CurrencyPanel.yml" />
