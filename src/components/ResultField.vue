<script setup lang="ts">
  import { ref, computed, onBeforeMount, onMounted, watch } from 'vue';
  import { UnitConverter } from 'classes/UnitConverter';
  import MyTooltip from 'components/MyTooltip.vue';
  import MenuItem from 'components/MenuItem.vue';
  import { useI18n } from 'vue-i18n';
  import { useStoreBase } from 'src/stores/store-base';
  import { useStoreSettings } from 'src/stores/store-settings';
  import { useStoreUtils } from 'src/stores/store-utils';
  import { useStoreUnit } from 'src/stores/store-unit';
  import { useStoreCurrency } from 'src/stores/store-currency';

  // i18n 설정
  const { t } = useI18n();

  // props 정의
  const props = withDefaults(defineProps<{ field?: string; addon?: string }>(), {
    field: 'main',
    addon: 'none',
  });

  // 계산된 속성 정의
  const isMainField = computed(() => props.field === 'main');
  const fieldID = computed(() => `${props.field}Field`);

  // 스토어 인스턴스 생성
  const storeBase = useStoreBase();
  const storeSettings = useStoreSettings();
  const storeUtils = useStoreUtils();
  const storeUnit = useStoreUnit();
  const storeCurrency = useStoreCurrency();

  // 스토어에서 필요한 메서드와 속성 추출
  const { calc, showMemoryOff, showMemoryOnWithTimer } = storeBase;
  const { toFormattedNumber, getLeftSideInHistory, copyToClipboard } = storeUtils;
  const { initRecentCategoryAndUnit } = storeUnit;
  const { initRecentCurrency, currencyConverter } = storeCurrency;

  const calcHistory = calc.history;
  const needFieldTooltip = ref(false);

  // 필드 툴팁 필요 여부 설정 함수
  const setNeedFieldTooltip = () => {
    const field = document.getElementById(fieldID.value);
    if (!field) return false;

    needFieldTooltip.value = field.offsetWidth < field.scrollWidth;
    return true;
  };

  // 단위 변환 결과 계산 함수
  const convertedUnitNumber = () => {
    if (props.addon === 'unit') {
      return UnitConverter.convert(
        storeUnit.recentCategory,
        calc.getCurrentNumber(),
        storeUnit.recentUnitFrom[storeUnit.recentCategory],
        storeUnit.recentUnitTo[storeUnit.recentCategory],
      );
    }
    return '';
  };

  // 통화 변환 결과 계산 함수
  const convertedCurrencyNumber = () => {
    if (props.addon === 'currency') {
      return currencyConverter
        .convert(Number(calc.getCurrentNumber()), storeCurrency.recentCurrencyFrom, storeCurrency.recentCurrencyTo)
        .toString();
    }
    return '';
  };

  // 결과 문자열 생성 함수
  const getResult = () => {
    if (isMainField.value) {
      const currentNumber = calc.getCurrentNumber();
      const formattedNumber = toFormattedNumber(currentNumber);
      return storeSettings.decimalPlaces === -2 && currentNumber.includes('.')
        ? `${formattedNumber.split('.')[0]}.${currentNumber.split('.')[1]}`
        : formattedNumber;
    } else {
      if (props.addon === 'unit') {
        initRecentCategoryAndUnit();
        return toFormattedNumber(convertedUnitNumber());
      } else if (props.addon === 'currency') {
        initRecentCurrency();
        return toFormattedNumber(convertedCurrencyNumber());
      }
      return '';
    }
  };

  const result = ref(getResult());

  // 통화 기호 계산된 속성
  const symbol = computed(() => {
    if (storeSettings.showSymbol && props.addon === 'currency') {
      return isMainField.value
        ? currencyConverter.getSymbol(storeCurrency.recentCurrencyFrom)
        : currencyConverter.getSymbol(storeCurrency.recentCurrencyTo);
    }
    return '';
  });

  // 단위 표시 계산된 속성
  const unit = computed(() => {
    if (storeSettings.showUnit && props.addon === 'unit') {
      return isMainField.value
        ? ` ${storeUnit.recentUnitFrom[storeUnit.recentCategory]}`
        : ` ${storeUnit.recentUnitTo[storeUnit.recentCategory]}`;
    }
    return '';
  });

  // 숫자만 표시하는 계산된 속성
  const onlyNumber = computed(() => {
    if (props.field === 'main') {
      return calc.getCurrentNumber();
    } else if (props.addon === 'unit') {
      return convertedUnitNumber();
    } else if (props.addon === 'currency') {
      return convertedCurrencyNumber();
    }
    return '';
  });

  // 연산자 문자열 계산된 속성
  const operator = computed(() => calc.getOperatorString() as string);

  // 연산자 아이콘 매핑
  const operatorIcons: { [key: string]: string } = {
    '+': 'mdi-plus-box',
    '-': 'mdi-minus-box',
    '×': 'mdi-close-box',
    '÷': 'mdi-division-box',
    mod: 'mdi-alpha-m-box',
    pow: 'mdi-chevron-up-box',
    root: 'mdi-square-root-box',
  };

  // 메모리 초기화 여부 계산된 속성
  const isMemoryReset = computed(() => calc.getIsMemoryReset());

  // 이전 결과 문자열 생성 함수
  const getPreResult = () => {
    const lastHistory = calcHistory.getHistorySize() > 0 ? calcHistory.getHistoryByIndex(0) : null;
    const shouldReset = calc.getShouldReset();
    const operatorExists = operator.value !== '';

    if (
      lastHistory !== null &&
      shouldReset &&
      calc.getCurrentNumber() === lastHistory.resultSnapshot.resultNumber
    ) {
      return `${getLeftSideInHistory(lastHistory.resultSnapshot)} =`;
    } else if (operatorExists && !shouldReset) {
      return toFormattedNumber(calc.getPreviousNumber());
    }
    return '';
  };

  const preResult = ref(getPreResult());

  // 결과 색상 정의
  const resultColor = {
    normal: 'text-light-green-8',
    warning: 'text-deep-orange-5',
    normalDark: 'text-light-green-10',
    warningDark: 'text-deep-orange-8',
  };

  // 결과 배경색 정의
  const resultBGColor = {
    normal: 'light-green-3',
    warning: 'deep-orange-2',
  };

  // 결과 색상 선택 함수
  const selectResultColor = () => {
    if (isMainField.value && storeBase.showMemory) {
      return !needFieldTooltip.value ? resultColor.normalDark : resultColor.warningDark;
    }
    return !needFieldTooltip.value ? resultColor.normal : resultColor.warning;
  };

  // 감시자 설정
  watch(
    [
      calc,
      () => storeSettings.useGrouping,
      () => storeSettings.decimalPlaces,
      () => storeSettings.showUnit,
      () => storeUnit.recentCategory,
      () => storeUnit.recentUnitFrom[storeUnit.recentCategory],
      () => storeUnit.recentUnitTo[storeUnit.recentCategory],
      () => storeSettings.showSymbol,
      () => storeCurrency.recentCurrencyFrom,
      () => storeCurrency.recentCurrencyTo,
    ],
    () => {
      result.value = getResult();
      preResult.value = getPreResult();
      setNeedFieldTooltip();
      showMemoryOff();
    },
  );

  // 컴포넌트 마운트 전 이벤트 리스너 등록
  onBeforeMount(() => {
    window.addEventListener('resize', setNeedFieldTooltip);
  });

  // 컴포넌트 마운트 후 초기 설정
  onMounted(() => {
    setNeedFieldTooltip();
  });
</script>

<template>
  <q-card-section class="col-12 q-px-sm" :class="field == 'main' ? 'q-pt-md q-pb-sm' : 'q-py-none'">
    <q-field
      class="shadow-2 justify-end self-center"
      :class="[isMainField ? '' : 'q-mt-none q-mb-xs']"
      filled
      dense
      readonly
      :dark="false"
      :bg-color="!needFieldTooltip ? resultBGColor.normal : resultBGColor.warning"
      :label-slot="isMainField"
      :stack-label="isMainField"
    >
      <template v-if="isMainField" #label>
        <div id="preResult" v-blur class="noselect" :class="selectResultColor()">
          {{ preResult }}
        </div>
      </template>
      <template v-if="isMainField" #prepend>
        <div
          v-if="!isMemoryReset"
          v-blur
          class="noselect full-height q-mt-xs q-pt-sm"
          :class="selectResultColor()"
          @click="showMemoryOnWithTimer()"
        >
          <q-icon name="mdi-chip" />
        </div>
        <div v-if="operator != ''" v-blur class="noselect full-height q-mt-xs q-pt-sm" :class="selectResultColor()">
          <q-icon :name="operatorIcons[operator]" />
        </div>
      </template>
      <template #control>
        <div
          :id="fieldID"
          v-mutation="setNeedFieldTooltip"
          v-mutation.characterData
          class="self-center no-outline full-width full-height ellipsis text-right q-pt-xs noselect"
          :class="[isMainField ? 'text-h5' : '', selectResultColor()]"
          :style="`padding-top: ${storeBase.paddingOnResult}px;`"
        >
          <span id="symbol">{{ symbol }}</span>
          <span v-if="isMainField && storeBase.showMemory" id="result" :class="selectResultColor()">
            {{ toFormattedNumber(calc.getMemoryNumber()) }}
          </span>
          <span v-else :id="isMainField ? 'result' : 'subResult'">{{ result }}</span>
          <span id="unit">{{ unit }}</span>
          <q-menu context-menu auto-close touch-position class="shadow-6">
            <q-list class="noselect" dense style="min-width: 150px">
              <MenuItem
                :action="() => copyToClipboard(symbol + result + unit, t('copiedDisplayedResult'))"
                :title="t('copyDisplayedResult')"
                :caption="symbol + result + unit"
              />
              <MenuItem
                :action="() => copyToClipboard(onlyNumber, t('copiedOnlyNumber'))"
                :title="t('copyOnlyNumber')"
                :caption="onlyNumber"
              />
            </q-list>
          </q-menu>
          <MyTooltip v-if="needFieldTooltip">
            {{ symbol + result + unit }}
          </MyTooltip>
        </div>
      </template>
    </q-field>
  </q-card-section>
</template>

<style scoped lang="scss">
  @font-face {
    font-family: 'digital-7-mono-italic';
    src: url('/digital-7.monoitalic.ttf') format('truetype');
  }

  #symbol {
    font-size: 36px;
    font-family: 'Courier New', Courier, monospace;
    padding-right: 0.3rem;
  }

  #result,
  #subResult {
    font-family: 'digital-7-mono-italic';
    font-size: 38px;
  }

  #unit {
    font-size: 22px;
  }

  .q-field {
    :deep(.q-field__label) {
      right: -100%;
      text-align: right;
      font-size: 20px;
      top: 10px;
    }
  }
</style>

<i18n>
  ko:
    copiedDisplayedResult: '표시된 결과가 복사되었습니다.'
    copyDisplayedResult: '표시된 결과 복사'
    copiedOnlyNumber: '결과 숫자가 복사되었습니다.'
    copyOnlyNumber: '결과 숫자 복사'    
  en:
    copiedDisplayedResult: 'The displayed result has been copied.'
    copyDisplayedResult: 'Copy displayed result'
    copiedOnlyNumber: 'The result number has been copied.'
    copyOnlyNumber: 'Copy result number'
</i18n>