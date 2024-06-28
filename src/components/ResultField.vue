<script setup lang="ts">
  import {ref, computed, onBeforeMount, onMounted, watch} from 'vue';

  import {UnitConverter} from 'classes/UnitConverter';

  import MyTooltip from 'components/MyTooltip.vue';

  import MenuItem from 'components/MenuItem.vue';

  import {useI18n} from 'vue-i18n';
  const {t} = useI18n();

  const props = withDefaults(defineProps<{field?: string; addon?: string}>(), {
    field: 'main',
    addon: 'none',
  });

  const isMainField = computed(() => props.field == 'main');

  const fieldID = computed(() => props.field + 'Field');

  // 스토어 가져오기
  import {useCalcStore} from 'stores/calc-store';
  const store = useCalcStore();

  // 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
  const {calc} = store;

  // 계산 결과 툴팁 표시 상태 변수
  const needFieldTooltip = ref(false);

  // 계산 결과가 길 경우 툴팁 표시 상태 셋팅
  const setNeedFieldTooltip = () => {
    const field = document.getElementById(fieldID.value);
    if (!field) return false;

    needFieldTooltip.value = field.offsetWidth < field.scrollWidth;
    return true;
  };

  const convertedUnitNumber = () => {
    if (props.addon == 'unit') {
      return UnitConverter.convert(
        store.recentCategory,
        calc.getCurrentNumber(),
        store.recentUnitFrom[store.recentCategory],
        store.recentUnitTo[store.recentCategory],
      );
    } else {
      return '';
    }
  };

  const convertedCurrencyNumber = () => {
    if (props.addon == 'currency') {
      return store.currencyConverter
        .convert(Number(calc.getCurrentNumber()), store.recentCurrencyFrom, store.recentCurrencyTo)
        .toString();
    } else {
      return '';
    }
  };

  const getResult = () => {
    if (isMainField.value) {
      const currentNumber = calc.getCurrentNumber();
      const toFormattedNumber = store.toFormattedNumber(currentNumber);
      return store.decimalPlaces === -2 && currentNumber.includes('.')
        ? `${toFormattedNumber.split('.')[0]}.${currentNumber.split('.')[1]}`
        : toFormattedNumber;
    } else {
      if (props.addon == 'unit') {
        // 저장된 범주와 단위가 잘못됐으면 초기화
        store.initRecentCategoryAndUnit();

        // 변환 결과를 반환
        return store.toFormattedNumber(convertedUnitNumber());
      } else if (props.addon == 'currency') {
        // 저장된 환율이 잘못됐으면 초기화
        store.initRecentCurrency();

        // 변환 결과를 반환
        return store.toFormattedNumber(convertedCurrencyNumber());
      } else {
        return '';
      }
    }
  };

  const result = ref(getResult());

  // 화폐 기호를 앞에 붙일지 여부
  const symbol = computed(() => {
    if (store.showSymbol && props.addon == 'currency') {
      if (isMainField.value) {
        return store.currencyConverter?.getSymbol(store.recentCurrencyFrom);
      } else {
        return store.currencyConverter?.getSymbol(store.recentCurrencyTo);
      }
    } else {
      return '';
    }
  });

  // 단위를 뒤에 붙일지 여부
  const unit = computed(() => {
    if (store.showUnit && props.addon == 'unit') {
      if (isMainField.value) {
        return ' ' + store.recentUnitFrom[store.recentCategory];
      } else {
        return ' ' + store.recentUnitTo[store.recentCategory];
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

  // 사칙연산 표시 아이콘 배열
  const operatorIcons: {[key: string]: string} = {
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
    // 'history'는 계산의 직전 결과 기록을 가져옵니다.
    const lastHistory = calc.getHistorySize() > 0 ? calc.getHistoryByIndex(0) : null;
    // 'shouldReset'은 다음 입력시 계산기가 초기화 될지 판단합니다.
    const shouldReset = calc.getShouldReset();

    // 'operatorExists'는 현재 입력된 연산자의 존재 여부를 확인합니다.
    const operatorExists = operator.value != '';

    // 계산 기록이 있고, 초기화 될 예정이며, 직전의 history의 결과와 현재의 결과와 같다면
    if (
      lastHistory !== null &&
      shouldReset &&
      calc.getCurrentNumber() == lastHistory.resultNumber
      //  && prevHistoryId != (history[0].id as number)
    ) {
      // 이전 이력의 ID를 현재 이력의 ID로 설정하고 계산 이력의 왼쪽 값을 가져온 후 '='으로 결합해서 출력합니다.
      return [store.getLeftSideInHistory(lastHistory), '='].join(' ');
    }
    // 입력된 연산자가 있고 초기화 예정이 아니라면
    else if (operatorExists && !shouldReset) {
      // 백업된 숫자를 현재 지역의 표기법으로 변환하여 반환합니다.
      return store.toFormattedNumber(calc.getPreviousNumber());
    } else {
      // 위의 조건에 해당하지 않는 경우, 빈 문자열을 반환합니다.
      return '';
    }
  };

  const preResult = ref(getPreResult());

  watch(
    [
      calc,
      () => store.useGrouping,
      () => store.decimalPlaces,
      () => store.showUnit,
      () => store.recentCategory,
      () => store.recentUnitFrom[store.recentCategory],
      () => store.recentUnitTo[store.recentCategory],
      () => store.showSymbol,
      () => store.recentCurrencyFrom,
      () => store.recentCurrencyTo,
    ],
    () => {
      result.value = getResult();
      preResult.value = getPreResult();
      setNeedFieldTooltip();
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
      :bg-color="!needFieldTooltip ? 'light-green-3' : 'deep-orange-2'"
      :label-slot="isMainField"
      :stack-label="isMainField"
    >
      <template v-if="isMainField" #label>
        <div
          id="preResult"
          v-blur
          class="noselect"
          :class="[!needFieldTooltip ? 'text-light-green-10' : 'text-deep-orange-8']"
        >
          {{ preResult }}
        </div>
      </template>
      <template v-if="isMainField" #prepend>
        <div
          v-if="!isMemoryReset"
          v-blur
          class="noselect full-height q-mt-xs q-pt-sm"
          :class="[!needFieldTooltip ? 'text-light-green-10' : 'text-deep-orange-8']"
        >
          <q-icon name="mdi-chip">
            <q-tooltip
              v-model="store.showMemoryTooltip"
              :hide-delay="2000"
              class="text-green-10 bg-green-2 text-body2 text-center fa-border-all"
              style="border: 1px solid black; word-break: break-all; word-wrap: break-word"
              anchor="bottom middle"
              self="center middle"
            >
              {{ store.toFormattedNumber(calc.getMemoryNumber()) }}
            </q-tooltip>
          </q-icon>
        </div>
        <div
          v-if="operator != ''"
          v-blur
          class="noselect full-height q-mt-xs q-pt-sm"
          :class="[!needFieldTooltip ? 'text-light-green-10' : 'text-deep-orange-8']"
        >
          <q-icon :name="operatorIcons[operator]" />
        </div>
      </template>
      <template #control>
        <div
          :id="fieldID"
          v-mutation="setNeedFieldTooltip"
          v-mutation.characterData
          class="self-center no-outline full-width full-height ellipsis text-right q-pt-xs noselect"
          :class="[isMainField ? 'text-h5' : '', !needFieldTooltip ? 'text-light-green-10' : 'text-deep-orange-8']"
          :style="`padding-top: ${store.paddingOnResult}px;`"
        >
          <span id="symbol">{{ symbol }}</span>
          <span :id="isMainField ? 'result' : 'subResult'">{{ result }}</span>
          <span id="unit">{{ unit }}</span>
          <q-menu context-menu auto-close touch-position class="shadow-6">
            <q-list class="noselect" dense style="min-width: 150px">
              <MenuItem
                :action="() => store.copyToClipboard(symbol + result + unit, t('copiedDisplayedResult'))"
                :title="t('copyDisplayedResult')"
                :caption="symbol + result + unit"
              />
              <MenuItem
                :action="() => store.copyToClipboard(onlyNumber, t('copiedOnlyNumber'))"
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
