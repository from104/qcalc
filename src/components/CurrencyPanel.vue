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
  import { useKeyBinding } from '../composables/useKeyBinding';

  // 전역 변수 import
  const $g = window.globalVars;

  // 컴포넌트 import
  import ToolTip from 'src/components/snippets/ToolTip.vue';
  import { clickButtonById, blurElement } from 'src/utils/GlobalHelpers';

  // 키 바인딩 설정
  useKeyBinding([
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

    // 통화 옵션 목록도 업데이트
    updateCurrencyOptions();
  });

  // 환율 업데이트 타이머 참조
  let rateUpdateTimer: number | null = null;

  onMounted(() => {
    currencyStore.initRecentCurrencies();

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
    uiStore.setInputBlurred();
    if (rateUpdateTimer) {
      clearInterval(rateUpdateTimer);
    }
  });

  // 통화 옵션 타입 정의
  type CurrencyOptions = {
    value: string;
    label: string;
    desc: string;
    isFavorite: boolean;
    disable?: boolean;
  };

  /**
   * 통화 옵션 객체를 생성합니다.
   * @param currency - 통화 코드
   * @returns 통화 옵션 객체
   */
  const createCurrencyOption = (currency: string) => ({
    value: currency,
    label: currency,
    desc: currencyDescriptions[currency] ?? '',
    isFavorite: currencyStore.isFavorite(currency),
  });

  /**
   * 정렬된 통화 옵션 목록을 반환합니다 (즐겨찾기 우선).
   * @returns 정렬된 통화 옵션 배열
   */
  const getSortedCurrencyOptions = (): CurrencyOptions[] => {
    return currencyStore.getSortedCurrencies().map(createCurrencyOption);
  };

  // 통화 옵션 목록
  const sourceCurrencyOptions = reactive<CurrencyOptions[]>(getSortedCurrencyOptions());
  const targetCurrencyOptions = reactive<CurrencyOptions[]>(getSortedCurrencyOptions());

  /**
   * 통화 옵션 목록을 업데이트합니다.
   */
  const updateCurrencyOptions = () => {
    const newOptions = getSortedCurrencyOptions();
    sourceCurrencyOptions.splice(0, sourceCurrencyOptions.length, ...newOptions);
    targetCurrencyOptions.splice(0, targetCurrencyOptions.length, ...newOptions);
  };

  // 즐겨찾기 또는 베이스 통화 변경 시 옵션 목록 업데이트
  watch(() => currencyStore.favoriteCurrencies, updateCurrencyOptions, { deep: true });
  watch(
    () => currencyStore.sourceCurrency,
    () => currencyStore.currencyConverter.setBase(currencyStore.sourceCurrency),
  );

  /**
   * 즐겨찾기 상태를 토글합니다.
   * @param currency - 토글할 통화 코드
   * @param event - 이벤트 객체 (전파 방지)
   */
  const handleFavoriteToggle = async (currency: string, event: Event) => {
    event.stopPropagation();
    event.preventDefault();

    currencyStore.toggleFavorite(currency);

    // 시각적 피드백
    const target = event.target as HTMLElement;
    if (target) {
      target.style.transform = 'scale(0.9)';
      await new Promise((resolve) => setTimeout(resolve, 100));
      target.style.transform = '';
    }
  };

  /**
   * 통화 선택을 위한 필터 함수를 생성합니다.
   * @param options - 필터링된 옵션을 담을 ref
   * @param reactiveOptions - 원본 옵션 배열
   * @returns 필터 함수
   */
  const createFilterFn = (options: Ref<CurrencyOptions[]>, reactiveOptions: CurrencyOptions[]) => {
    return (val: string, update: (fn: () => void) => void) => {
      if (val === '') {
        update(() => {
          options.value = reactiveOptions;
        });
        return;
      }
      const searchTerm = val.toLowerCase();
      update(() => {
        options.value = reactiveOptions.filter(
          (v) => v.label.toLowerCase().includes(searchTerm) || v.desc.toLowerCase().includes(searchTerm),
        );
      });
    };
  };

  // 필터링된 통화 옵션
  const filteredSourceCurrencyOptions = ref<CurrencyOptions[]>(sourceCurrencyOptions);
  const sourceFilterFn = createFilterFn(filteredSourceCurrencyOptions, sourceCurrencyOptions);

  const filteredTargetCurrencyOptions = ref<CurrencyOptions[]>(targetCurrencyOptions);
  const targetFilterFn = createFilterFn(filteredTargetCurrencyOptions, targetCurrencyOptions);

  /**
   * 출발 통화와 도착 통화를 교환합니다.
   */
  const handleCurrencySwap = () => {
    if (currencyStore.sourceCurrency !== currencyStore.targetCurrency) {
      currencyStore.swapCurrencies();
      calcStore.calc.currentNumber = currencyStore.convertedCurrencyNumber;
      calcStore.calc.needsBufferReset = true;
    }
  };

  // 테마에 따른 select 색상
  const selectTextColor = computed(() => themesStore.getSelectColor('text', themesStore.isDarkMode()));
  const selectBackgroundColor = computed(() => themesStore.getSelectColor('background', themesStore.isDarkMode()));
</script>

<template>
  <q-card-section class="row q-px-sm q-pt-none q-pb-sm">
    <!-- From (출발) -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" role="img" :aria-label="t('ariaLabel.sourceDirection')" />

    <!-- From 통화 선택 -->
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
        [
          `bg-${selectBackgroundColor}`,
          'scrollbar-custom',
          'q-select-popup',
          $g.isMobile ? 'popup-mobile' : '',
          'noselect',
        ].join(' ')
      "
      :options-selected-class="`text-${selectTextColor}`"
      @filter="sourceFilterFn"
      @focus="uiStore.setInputFocused()"
      @blur="uiStore.setInputBlurred()"
      @keyup.enter="blurElement()"
      @update:model-value="blurElement()"
    >
      <template #option="scope">
        <transition-group name="select-option-">
          <q-item v-bind="scope.itemProps" :key="scope.opt.value" class="q-px-sm">
            <q-item-section side class="q-pr-sm">
              <q-btn
                :icon="scope.opt.isFavorite ? 'star' : 'star_border'"
                flat
                round
                dense
                size="md"
                :color="scope.opt.isFavorite ? (themesStore.isDarkMode() ? 'amber' : 'brown-4') : 'grey'"
                :aria-label="scope.opt.isFavorite ? t('ariaLabel.removeFromFavorites') : t('ariaLabel.addToFavorites')"
                class="q-pa-none q-ma-none"
                @click="handleFavoriteToggle(scope.opt.value, $event)"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>{{ currencyDescriptions[scope.opt.label] }}</q-item-label>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </transition-group>
      </template>
      <ToolTip
        :text-color="themesStore.getDarkColor()"
        :bg-color="themesStore.getCurrentThemeColors.ui.warning"
        :text="`${currencyDescriptions[currencyStore.sourceCurrency]}\n${currencyStore.sourceCurrency}`"
      />
    </q-select>

    <!-- 통화 스왑 버튼 -->
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
      <ToolTip
        :text-color="themesStore.getDarkColor()"
        :bg-color="themesStore.getCurrentThemeColors.ui.warning"
        :auto-hide="3000"
        :text="t('tooltipSwap')"
      />
    </q-btn>

    <!-- To 통화 선택 -->
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
        [
          `bg-${selectBackgroundColor}`,
          'scrollbar-custom',
          'q-select-popup',
          $g.isMobile ? 'popup-mobile' : '',
          'noselect',
        ].join(' ')
      "
      :options-selected-class="`text-${selectTextColor}`"
      @filter="targetFilterFn"
      @keyup.enter="blurElement()"
      @update:model-value="blurElement()"
      @focus="uiStore.setInputFocused()"
      @blur="uiStore.setInputBlurred()"
    >
      <template #option="scope">
        <transition-group name="select-option-">
          <q-item v-bind="scope.itemProps" :key="scope.opt.value" class="q-px-sm">
            <q-item-section side class="q-pr-sm">
              <q-btn
                :icon="scope.opt.isFavorite ? 'star' : 'star_border'"
                flat
                round
                dense
                size="md"
                :color="scope.opt.isFavorite ? (themesStore.isDarkMode() ? 'amber' : 'brown-4') : 'grey'"
                :aria-label="scope.opt.isFavorite ? t('ariaLabel.removeFromFavorites') : t('ariaLabel.addToFavorites')"
                class="q-pa-none q-ma-none"
                @click="handleFavoriteToggle(scope.opt.value, $event)"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>{{ currencyDescriptions[scope.opt.label] }}</q-item-label>
              <q-item-label>
                {{ `${scope.opt.label}, ${currencyStore.currencyConverter.getRate(scope.opt.label).toFixed(4)}` }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </transition-group>
      </template>
      <ToolTip :text-color="themesStore.getDarkColor()" :bg-color="themesStore.getCurrentThemeColors.ui.warning">
        <div class="text-left" style="white-space: pre-wrap">
          {{
            `${currencyDescriptions[currencyStore.targetCurrency]}\n${currencyStore.targetCurrency}, ${currencyStore.currencyConverter.getRate(currencyStore.targetCurrency).toFixed(4)}`
          }}
        </div>
      </ToolTip>
    </q-select>

    <!-- To (도착) -->
    <q-icon
      name="keyboard_double_arrow_down"
      size="xs"
      class="col-1 q-px-none"
      role="img"
      :aria-label="t('ariaLabel.targetDirection')"
    />
  </q-card-section>
</template>

<style scoped lang="scss">
  .q-select-popup {
    .q-item {
      @media (prefers-color-scheme: dark) {
        border-top: 1px dotted rgba(255, 255, 255, 0.377);
        border-bottom: 1px dotted rgba(255, 255, 255, 0.377);
      }
    }
  }

  /* 모바일 팝업 높이 조정 */
  .popup-mobile {
    height: 100% !important;
    max-height: 180px !important;
  }

  .select-option--move,
  .select-option--enter-active,
  .select-option--leave-active {
    transition: all 3s ease;
  }

  .select-option--leave-active {
    position: absolute;
  }

  .select-option--enter-from,
  .select-option--leave-to {
    opacity: 0;
    transform: translateY(100%);
  }

  /* 옵션 목록 재정렬 효과 */
  .q-select-popup .q-item {
    transition: all 0.3s ease;
    will-change: transform, opacity;

    &:hover {
      background-color: rgba(var(--q-primary), 0.05);
      transform: translateX(2px);
    }
  }

  @media (prefers-color-scheme: dark) {
    .q-select-popup .q-item:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }
  }
</style>

<i18n lang="yaml" src="../i18n/components/CurrencyPanel.yml" />
