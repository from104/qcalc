<script setup lang="ts">
  import { ref, computed, onBeforeMount, onMounted, watch } from 'vue';
  import { UnitConverter } from 'classes/UnitConverter';
  import MyTooltip from 'components/MyTooltip.vue';
  import MenuItem from 'components/MenuItem.vue';
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  const props = withDefaults(defineProps<{ field?: string; addon?: string }>(), {
    field: 'main',
    addon: 'none',
  });

  const isMainField = computed(() => props.field == 'main');
  const fieldID = computed(() => props.field + 'Field');

  // 스토어 가져오기
  import { useStoreCalc } from 'src/stores/store-calc';
  const storeCalc = useStoreCalc();
  const {
    calc,
    toFormattedNumber,
    initRecentCategoryAndUnit,
    initRecentCurrency,
    getLeftSideInHistory,
    showMemoryOff,
    copyToClipboard,
    showMemoryOnWithTimer,
  } = storeCalc;

  const needFieldTooltip = ref(false);

  const setNeedFieldTooltip = () => {
    const field = document.getElementById(fieldID.value);
    if (!field) return false;

    needFieldTooltip.value = field.offsetWidth < field.scrollWidth;
    return true;
  };

  const convertedUnitNumber = () => {
    if (props.addon == 'unit') {
      return UnitConverter.convert(
        storeCalc.recentCategory,
        calc.getCurrentNumber(),
        storeCalc.recentUnitFrom[storeCalc.recentCategory],
        storeCalc.recentUnitTo[storeCalc.recentCategory],
      );
    } else {
      return '';
    }
  };

  const convertedCurrencyNumber = () => {
    if (props.addon == 'currency') {
      return storeCalc.currencyConverter
        .convert(Number(calc.getCurrentNumber()), storeCalc.recentCurrencyFrom, storeCalc.recentCurrencyTo)
        .toString();
    } else {
      return '';
    }
  };

  const getResult = () => {
    if (isMainField.value) {
      const currentNumber = calc.getCurrentNumber();
      const formattedNumber = toFormattedNumber(currentNumber);
      return storeCalc.decimalPlaces === -2 && currentNumber.includes('.')
        ? `${formattedNumber.split('.')[0]}.${currentNumber.split('.')[1]}`
        : formattedNumber;
    } else {
      if (props.addon == 'unit') {
        initRecentCategoryAndUnit();
        return toFormattedNumber(convertedUnitNumber());
      } else if (props.addon == 'currency') {
        initRecentCurrency();
        return toFormattedNumber(convertedCurrencyNumber());
      } else {
        return '';
      }
    }
  };

  const result = ref(getResult());

  const symbol = computed(() => {
    if (storeCalc.showSymbol && props.addon == 'currency') {
      if (isMainField.value) {
        return storeCalc.currencyConverter?.getSymbol(storeCalc.recentCurrencyFrom);
      } else {
        return storeCalc.currencyConverter?.getSymbol(storeCalc.recentCurrencyTo);
      }
    } else {
      return '';
    }
  });

  const unit = computed(() => {
    if (storeCalc.showUnit && props.addon == 'unit') {
      if (isMainField.value) {
        return ' ' + storeCalc.recentUnitFrom[storeCalc.recentCategory];
      } else {
        return ' ' + storeCalc.recentUnitTo[storeCalc.recentCategory];
      }
    } else {
      return '';
    }
  });

  const onlyNumber = computed(() => {
    return props.field == 'main'
      ? calc.getCurrentNumber()
      : props.addon == 'unit'
        ? convertedUnitNumber()
        : props.addon == 'currency'
          ? convertedCurrencyNumber()
          : '';
  });

  const operator = computed(() => calc.getOperatorString() as string);

  const operatorIcons: { [key: string]: string } = {
    '+': 'mdi-plus-box',
    '-': 'mdi-minus-box',
    '×': 'mdi-close-box',
    '÷': 'mdi-division-box',
    mod: 'mdi-alpha-m-box',
    pow: 'mdi-chevron-up-box',
    root: 'mdi-square-root-box',
  };

  const isMemoryReset = computed(() => calc.getIsMemoryReset());

  const getPreResult = () => {
    const lastHistory = calc.getHistorySize() > 0 ? calc.getHistoryByIndex(0) : null;
    const shouldReset = calc.getShouldReset();
    const operatorExists = operator.value != '';

    if (
      lastHistory !== null &&
      shouldReset &&
      calc.getCurrentNumber() == lastHistory.resultNumber
    ) {
      return [getLeftSideInHistory(lastHistory), '='].join(' ');
    } else if (operatorExists && !shouldReset) {
      return toFormattedNumber(calc.getPreviousNumber());
    } else {
      return '';
    }
  };

  const preResult = ref(getPreResult());

  const resultColor = {
    normal: 'text-light-green-8',
    warning: 'text-deep-orange-5',
    normalDark: 'text-light-green-10',
    warningDark: 'text-deep-orange-8',
  };

  const resultBGColor = {
    normal: 'light-green-3',
    warning: 'deep-orange-2',
  };

  const selectResultColor = () => {
    return isMainField.value && storeCalc.showMemory
      ? !needFieldTooltip.value
        ? resultColor.normalDark
        : resultColor.warningDark
      : !needFieldTooltip.value
        ? resultColor.normal
        : resultColor.warning;
  };

  watch(
    [
      calc,
      () => storeCalc.useGrouping,
      () => storeCalc.decimalPlaces,
      () => storeCalc.showUnit,
      () => storeCalc.recentCategory,
      () => storeCalc.recentUnitFrom[storeCalc.recentCategory],
      () => storeCalc.recentUnitTo[storeCalc.recentCategory],
      () => storeCalc.showSymbol,
      () => storeCalc.recentCurrencyFrom,
      () => storeCalc.recentCurrencyTo,
    ],
    () => {
      result.value = getResult();
      preResult.value = getPreResult();
      setNeedFieldTooltip();
      showMemoryOff();
    },
  );

  onBeforeMount(() => {
    window.addEventListener('resize', setNeedFieldTooltip);
  });

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
          :style="`padding-top: ${storeCalc.paddingOnResult}px;`"
        >
          <span id="symbol">{{ symbol }}</span>
          <span v-if="isMainField && storeCalc.showMemory" id="result" :class="selectResultColor()">
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