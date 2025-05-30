<script setup lang="ts">
  /**
   * @file CurrencyPanel.vue
   * @description 이 파일은 통화 패널을 구성하는 Vue 컴포넌트입니다.
   *              사용자가 다양한 통화 간의 변환을 수행할 수 있도록 통화 선택 및 필터링 기능을 제공합니다.
   *              또한, 통화 스왑 및 최근 통화 초기화 기능을 포함하고 있습니다.
   *              통화 심볼 표시 여부를 토글할 수 있으며, 키보드 단축키를 통한 빠른 조작이 가능합니다.
   *              최근 사용한 통화 목록을 관리하고 초기화할 수 있습니다.
   */

  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { ref, onMounted, onBeforeUnmount, reactive, watch, computed } from 'vue';
  import type { Ref } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // 스토어 import
  import { useUIStore } from 'stores/uiStore';
  import { useCurrencyStore } from 'stores/currencyStore';
  import { useSettingsStore } from 'stores/settingsStore';
  import { useCalcStore } from 'src/stores/calcStore';
  import { useThemesStore } from 'stores/themesStore';

  // 스토어 인스턴스 생성
  const uiStore = useUIStore();
  const currencyStore = useCurrencyStore();
  const settingsStore = useSettingsStore();
  const themesStore = useThemesStore();
  const calcStore = useCalcStore();

  // 계산기 관련 타입과 클래스
  import { KeyBinding } from 'classes/KeyBinding';

  // 전역 변수 import
  const $g = window.globalVars;

  // 컴포넌트 import
  import ToolTip from 'src/components/snippets/ToolTip.vue';
  import { clickButtonById, blurElement } from 'src/utils/GlobalHelpers';

  // 키 바인딩 설정
  const keyBinding = new KeyBinding([
    [['\\'], () => clickButtonById('btn-swap-currency')],
    [['Alt+\\'], () => currencyStore.toggleShowSymbol()],
  ]);

  // 단위 초기화
  currencyStore.initRecentCurrencies();

  // 통화 설명을 위한 인터페이스 정의
  interface CurrencyDescription {
    [key: string]: string; // 키 타입을 명시적으로 string으로 지정
  }

  // 통화 이름을 현재 언어에 맞게 초기화
  const currencyDescriptions = reactive<CurrencyDescription>(
    currencyStore.currencyConverter.getAvailableItems().reduce((acc: CurrencyDescription, currency: string) => {
      acc[currency] = t(`currencyDesc.${currency}`);
      return acc;
    }, {}),
  );

  // 언어 변경 시 통화 이름 업데이트
  watch([() => settingsStore.locale], () => {
    currencyStore.currencyConverter.getAvailableItems().forEach((currency: string) => {
      currencyDescriptions[currency] = t(`currencyDesc.${currency}`);
    });
  });

  // 입력 포커스에 따른 키 바인딩 활성화/비활성화
  watch(
    () => uiStore.inputFocused,
    () => {
      if (uiStore.inputFocused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
  );

  let rateUpdateTimer: number | undefined;

  onMounted(() => {
    currencyStore.initRecentCurrencies();
    keyBinding.subscribe();

    // 초기 환율 정보 업데이트
    (async () => {
      await currencyStore.currencyConverter.updateRates();
    })();

    // 주기적으로 환율 정보 업데이트 (1시간마다)
    rateUpdateTimer = window.setInterval(
      async () => {
        await currencyStore.currencyConverter.updateRates();
      },
      1000 * 60 * 60 * 1,
    );
  });

  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
    uiStore.setInputBlurred();
    clearInterval(rateUpdateTimer);
  });

  // 통화 옵션 타입 정의
  type CurrencyOptions = {
    value: string;
    label: string;
    desc: string;
    disable?: boolean;
  };

  const currencyList = currencyStore.currencyConverter.getAvailableItems();

  // 통화 옵션 초기화
  /**
   * 통화 옵션을 생성하는 유틸리티 함수
   * @param currency - 통화 코드
   * @param isSource - 출발 통화 여부
   * @returns 통화 옵션 객체
   */
  const createCurrencyOption = (currency: string) => ({
    value: currency,
    label: currency,
    desc: currencyDescriptions[currency] ?? '',
  });

  // 출발 통화 옵션 목록
  const sourceCurrencyOptions = reactive<CurrencyOptions[]>(
    currencyList.map((currency: string) => createCurrencyOption(currency)),
  );

  // 도착 통화 옵션 목록
  const targetCurrencyOptions = reactive<CurrencyOptions[]>(
    currencyList.map((currency: string) => createCurrencyOption(currency)),
  );

  // 통화 옵션 업데이트
  watch(
    () => currencyStore.sourceCurrency,
    () => currencyStore.currencyConverter.setBase(currencyStore.sourceCurrency),
  );

  // 통화 선택 필터 함수 생성
  const createFilterFn = (options: Ref<CurrencyOptions[]>, reactiveOptions: CurrencyOptions[]) => {
    return (val: string, update: (fn: () => void) => void, abort: () => void) => {
      if (val.length < 1) {
        update(() => {
          options.value = reactiveOptions;
        });
        abort();
        return;
      }

      const searchTerm = val.toLowerCase();
      update(() => {
        options.value = reactiveOptions.filter((v) => {
          const labelMatch = v.label.toLowerCase().indexOf(searchTerm) > -1;
          const descMatch = v.desc.toLowerCase().indexOf(searchTerm) > -1;
          return labelMatch || descMatch;
        });
      });
    };
  };

  // 'From' 통화 필터 설정
  const filteredSourceCurrencyOptions = ref<CurrencyOptions[]>(sourceCurrencyOptions);
  const sourceFilterFn = createFilterFn(filteredSourceCurrencyOptions, sourceCurrencyOptions);

  // 'To' 통화 필터 설정
  const filteredTargetCurrencyOptions = ref<CurrencyOptions[]>(targetCurrencyOptions);
  const targetFilterFn = createFilterFn(filteredTargetCurrencyOptions, targetCurrencyOptions);

  const handleCurrencySwap = () => {
    if (currencyStore.sourceCurrency !== currencyStore.targetCurrency) {
      // 첫 번째 변환 수행
      currencyStore.swapCurrencies();
      calcStore.calc.currentNumber = currencyStore.convertedCurrencyNumber;
      calcStore.calc.needsBufferReset = true;
    }
  };

  // themesStore에서 select 색상을 가져오는 computed 속성
  const selectTextColor = computed(() => themesStore.getSelectColor('text', themesStore.isDarkMode()));
  const selectBackgroundColor = computed(() => themesStore.getSelectColor('background', themesStore.isDarkMode()));
</script>

<template>
  <q-card-section class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" role="img" :aria-label="t('ariaLabel.sourceDirection')" />

    <!-- 원본 통화 -->
    <q-select
      v-model="currencyStore.sourceCurrency"
      :options="filteredSourceCurrencyOptions"
      :label="currencyDescriptions[currencyStore.sourceCurrency]"
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
      behavior="menu"
      class="col-4 q-pl-sm shadow-2"
      :class="`bg-${selectBackgroundColor}`"
      :label-color="selectTextColor"
      :popup-content-class="
        [`bg-${selectBackgroundColor}`, 'scrollbar-custom', 'q-select-popup', $g.isMobile ? 'popup-mobile' : ''].join(
          ' ',
        )
      "
      :options-selected-class="`text-${selectTextColor}`"
      @filter="sourceFilterFn"
      @focus="uiStore.setInputFocused()"
      @blur="uiStore.setInputBlurred()"
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
          {{ `${currencyDescriptions[currencyStore.sourceCurrency]}\n${currencyStore.sourceCurrency}` }}
        </div>
      </ToolTip>
    </q-select>

    <!-- 원본, 대상 통화 바꾸기 버튼 -->
    <q-btn
      id="btn-swap-currency"
      v-auto-blur
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
      <ToolTip :auto-hide="3000" :text="t('tooltipSwap')" />
    </q-btn>

    <!-- 대상 통화 -->
    <q-select
      v-model="currencyStore.targetCurrency"
      :options="filteredTargetCurrencyOptions"
      :label="currencyDescriptions[currencyStore.targetCurrency]"
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
      behavior="menu"
      class="col-4 q-pl-sm shadow-2"
      :class="`bg-${selectBackgroundColor}`"
      :label-color="selectTextColor"
      :popup-content-class="
        [`bg-${selectBackgroundColor}`, 'scrollbar-custom', 'q-select-popup', $g.isMobile ? 'popup-mobile' : ''].join(
          ' ',
        )
      "
      :options-selected-class="`text-${selectTextColor}`"
      @filter="targetFilterFn"
      @keyup.enter="blurElement()"
      @update:model-value="blurElement()"
      @focus="uiStore.setInputFocused()"
      @blur="uiStore.setInputBlurred()"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>{{ currencyDescriptions[scope.opt.label] }}</q-item-label>
            <q-item-label>
              {{ `${scope.opt.label}, ${currencyStore.currencyConverter.getRate(scope.opt.label).toFixed(4)}` }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <ToolTip>
        <div class="text-left" style="white-space: pre-wrap">
          {{
            `${currencyDescriptions[currencyStore.targetCurrency]}\n${currencyStore.targetCurrency}, ${currencyStore.currencyConverter.getRate(currencyStore.targetCurrency).toFixed(4)}`
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

<style lang="scss">
  .q-select-popup {
    .q-item {
      @media (prefers-color-scheme: dark) {
        border-top: 1px dotted rgba(255, 255, 255, 0.377);
        border-bottom: 1px dotted rgba(255, 255, 255, 0.377);
      }
    }
  }

  .popup-mobile {
    height: 100% !important;
    max-height: 180px !important;
  }
</style>

<i18n lang="yaml5" src="../i18n/components/CurrencyPanel.yml" />
