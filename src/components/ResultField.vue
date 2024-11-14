<script setup lang="ts">
  import { ref, computed, onBeforeMount, onMounted, watch, nextTick, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { useStoreBase } from 'src/stores/store-base';
  import { useStoreSettings } from 'src/stores/store-settings';
  import { useStoreUtils } from 'src/stores/store-utils';
  import { useStoreUnit } from 'src/stores/store-unit';
  import { useStoreCurrency } from 'src/stores/store-currency';
  import { useStoreRadix } from 'src/stores/store-radix';

  import { UnitConverter } from 'src/classes/UnitConverter';
  import { Radix } from 'src/classes/RadixConverter';

  import MyTooltip from 'components/MyTooltip.vue';
  import MenuItem from 'components/MenuItem.vue';

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
  const storeRadix = useStoreRadix();

  // 스토어에서 필요한 메서드와 속성 추출
  const { calc, cTab, showMemoryOff, showMemoryOnWithTimer } = storeBase;
  const { toFormattedNumber, getLeftSideInHistory, copyToClipboard } = storeUtils;
  const { initRecentCategoryAndUnit } = storeUnit;
  const { initRecentCurrency, currencyConverter } = storeCurrency;
  const { convertRadix, initRecentRadix } = storeRadix;

  const calcHistory = calc.history;
  const needFieldTooltip = ref(false);
  const fieldElement = ref<HTMLElement | null>(null);

  /**
   * 필드 툴팁 표시 여부를 결정하는 함수
   *
   * @description
   * - 필드 요소의 너비가 스크롤 너비보다 작은 경우 툴팁 표시 필요
   */
  const setNeedFieldTooltip = () => {
    // 필드 요소 가져오기
    fieldElement.value = document.getElementById(fieldID.value);

    // 필드가 없으면 종료
    if (!fieldElement.value) return false;

    // 필드의 실제 너비가 콘텐츠 너비보다 작으면 툴팁 필요
    needFieldTooltip.value = fieldElement.value.offsetWidth < fieldElement.value.scrollWidth;
    return true;
  };

  /**
   * 단위 변환 결과를 계산하는 함수
   *
   * @returns 단위 변환된 결과 문자열 또는 빈 문자열
   * @description
   * - 현재 카테고리의 시작 단위에서 목표 단위로 변환
   */
  const convertedUnitNumber = () => {
    const { recentCategory, recentUnitFrom, recentUnitTo } = storeUnit;

    return UnitConverter.convert(
      recentCategory,
      calc.getCurrentNumber(),
      recentUnitFrom[recentCategory],
      recentUnitTo[recentCategory],
    );
  };

  /**
   * 통화 변환 결과를 계산하는 함수
   *
   * @returns 통화 변환된 결과 문자열 또는 빈 문자열
   * @description
   * - 현재 숫자를 시작 통화에서 목표 통화로 변환
   */
  const convertedCurrencyNumber = () => {
    const currentNumber = Number(calc.getCurrentNumber());
    const fromCurrency = storeCurrency.recentCurrencyFrom;
    const toCurrency = storeCurrency.recentCurrencyTo;

    return currencyConverter.convert(currentNumber, fromCurrency, toCurrency).toString();
  };

  // 진법 변환 결과 계산 함수
  /**
   * 진법 변환 결과를 계산하는 함수
   *
   * @returns 진법 변환된 결과 문자열 또는 빈 문자열
   * @description
   * - 현재 버퍼의 값을 메인 진법에서 서브 진법으로 변환
   */
  const convertedRadixNumber = () => {
    return convertRadix(calc.getBuffer(), storeRadix.mainRadix, storeRadix.subRadix);
  };

  /**
   * 결과 문자열을 생성하는 함수
   *
   * @returns 계산 결과 문자열
   * @description
   * - 메인 필드인 경우: 현재 버퍼값을 포맷팅하여 반환
   * - 서브 필드인 경우: 각 애드온(단위/통화/진법)에 따라 변환된 결과를 반환
   */
  const getResult = () => {
    // 메인 필드인 경우
    if (isMainField.value) {
      const currentNumber = calc.getBuffer();
      const formattedNumber = toFormattedNumber(currentNumber);

      // 소수점 자릿수 설정이 -2이고 소수점이 있는 경우
      const hasSpecialDecimalPlaces = storeSettings.decimalPlaces === -2 && currentNumber.includes('.');

      return hasSpecialDecimalPlaces
        ? `${formattedNumber.split('.')[0]}.${currentNumber.split('.')[1]}`
        : formattedNumber;
    } else {
      // 서브 필드인 경우 애드온 타입에 따라 처리
      switch (props.addon) {
        case 'unit':
          initRecentCategoryAndUnit();
          return toFormattedNumber(convertedUnitNumber());

        case 'currency':
          initRecentCurrency();
          return toFormattedNumber(convertedCurrencyNumber());

        case 'radix':
          initRecentRadix();
          return toFormattedNumber(convertedRadixNumber());

        default:
          return '';
      }
    }
  };

  const result = ref(getResult());

  /**
   * 통화 기호를 표시하는 계산된 속성
   *
   * @returns 통화 기호 문자열
   * @description
   * - 통화 기호 표시 설정이 켜져있고 통화 애드온인 경우에만 기호 표시
   * - 메인 필드면 시작 통화의 기호를, 서브 필드면 대상 통화의 기호를 반환
   */
  const symbol = computed(() => {
    const isShowingCurrencySymbol = storeSettings.showSymbol && props.addon === 'currency';
    if (!isShowingCurrencySymbol) return '';

    const currencyCode = isMainField.value ? storeCurrency.recentCurrencyFrom : storeCurrency.recentCurrencyTo;

    return currencyConverter.getSymbol(currencyCode);
  });

  /**
   * 단위 표시를 위한 계산된 속성
   * 단위 표시 설정이 켜져있고 단위 애드온인 경우에만 단위를 표시
   */
  const unit = computed(() => {
    const shouldShowUnit = storeSettings.showUnit && props.addon === 'unit';
    if (!shouldShowUnit) return '';

    const selectedUnit = isMainField.value
      ? storeUnit.recentUnitFrom[storeUnit.recentCategory]
      : storeUnit.recentUnitTo[storeUnit.recentCategory];

    return ` ${selectedUnit}`;
  });

  /**
   * 진법 표시를 위한 계산된 속성
   * 현재 탭이 radix일 경우에만 진법을 표시
   */
  const radix = computed(() => {
    if (cTab !== 'radix') return '';

    const selectedRadix = isMainField.value ? storeRadix.mainRadix : storeRadix.subRadix;

    switch (selectedRadix) {
      case Radix.Binary:
        return '2';
      case Radix.Octal:
        return '8';
      case Radix.Hexadecimal:
        return '16';
      case Radix.Decimal:
        return '10';
      default:
        return '';
    }
  });

  /**
   * 숫자만 표시하기 위한 계산된 속성
   * 필드와 애드온 타입에 따라 적절한 숫자를 반환
   */
  const onlyNumber = computed(() => {
    // 메인 필드인 경우 현재 입력된 숫자 반환
    if (props.field === 'main') {
      return calc.getCurrentNumber();
    }

    // 애드온 타입에 따른 변환된 숫자 반환
    const addonTypeMap = {
      unit: convertedUnitNumber,
      currency: convertedCurrencyNumber,
      radix: convertedRadixNumber,
    };

    const converter = addonTypeMap[props.addon as keyof typeof addonTypeMap];
    return converter ? converter() : '';
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
    bitSftR: 'mdi-chevron-right-box',
    bitSftL: 'mdi-chevron-left-box',
    bitAnd: 'mdi-alpha-a-box',
    bitOr: 'mdi-alpha-o-box',
    bitXor: 'mdi-alpha-x-box',
  };

  // 메모리 초기화 여부 계산된 속성
  const isMemoryReset = computed(() => calc.isMemoryReset);

  /**
   * 이전 결과 문자열을 생성하는 함수
   *
   * @returns 이전 결과 문자열
   * - 마지막 계산 기록이 있고 초기화가 필요한 경우: 기록의 좌측 부분 + "="
   * - 연산자가 있고 초기화가 필요없는 경우: 이전 숫자를 포맷팅한 문자열
   * - 그 외의 경우: 빈 문자열
   */
  const getPreResult = () => {
    // 마지막 계산 기록 가져오기
    const lastHistory = calcHistory.getHistorySize() > 0 ? calcHistory.getHistoryByIndex(0) : null;

    // 초기화 필요 여부와 연산자 존재 여부 확인
    const shouldReset = calc.getShouldReset();
    const hasOperator = operator.value !== '';

    // 마지막 계산 기록이 있고 초기화가 필요한 경우
    const isLastHistoryValid =
      lastHistory !== null && shouldReset && calc.getCurrentNumber() === lastHistory.calculationResult.resultNumber;

    if (isLastHistoryValid) {
      return `${getLeftSideInHistory(lastHistory.calculationResult)} =`;
    }

    // 연산자가 있고 초기화가 필요없는 경우
    if (hasOperator && !shouldReset) {
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

  const currentTab = computed(() => storeBase.cTab);

  // 감시자 설정
  watch(
    [
      () => calc.getBuffer(),
      () => calc.getOperatorString(),
      () => calcHistory.getHistorySize(),
      () => storeSettings.useGrouping,
      () => storeSettings.decimalPlaces,
      () => storeSettings.showUnit,
      () => storeUnit.recentCategory,
      () => storeUnit.recentUnitFrom[storeUnit.recentCategory],
      () => storeUnit.recentUnitTo[storeUnit.recentCategory],
      () => storeSettings.showSymbol,
      () => storeCurrency.recentCurrencyFrom,
      () => storeCurrency.recentCurrencyTo,
      () => storeRadix.mainRadix,
      () => storeRadix.subRadix,
      () => fieldElement.value,
    ],
    () => {
      // 결과값 업데이트
      result.value = getResult();
      preResult.value = getPreResult();

      // UI 업데이트
      setNeedFieldTooltip();
      showMemoryOff();

      if (currentTab.value === 'radix') {
        calc.radix = storeRadix.mainRadix;
      } else {
        calc.radix = Radix.Decimal;
      }
    },
  );

  // 컴포넌트 마운트 전 이벤트 리스너 등록
  onBeforeMount(() => {
    window.addEventListener('resize', setNeedFieldTooltip);
  });

  let tooltipInterval: NodeJS.Timeout;
  // 컴포넌트 마운트 후 초기 설정
  onMounted(() => {
    tooltipInterval = setInterval(setNeedFieldTooltip, 100);
  });

  // 컴포넌트 언마운트 시 이벤트 리스너 제거
  onUnmounted(() => {
    clearInterval(tooltipInterval);
    window.removeEventListener('resize', setNeedFieldTooltip);
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
          v-mutation="() => { setNeedFieldTooltip(); return true; }"
          v-mutation.characterData
          class="self-center no-outline full-width full-height ellipsis text-right q-pt-xs noselect"
          :class="[isMainField ? 'text-h5' : '', selectResultColor()]"
          :style="`padding-top: ${storeBase.paddingOnResult}px;`"
        >
          <span v-if="currentTab === 'currency'" id="symbol">{{ symbol }}</span>
          <span v-if="isMainField && storeBase.showMemory" id="result" :class="selectResultColor()">
            {{ toFormattedNumber(calc.getMemoryNumber()) }}
          </span>
          <span v-else :id="isMainField ? 'result' : 'subResult'">{{ result }}</span>
          <span v-if="currentTab === 'unit'" id="unit">{{ unit }}</span>
          <span v-if="currentTab === 'radix'" id="radix">{{ radix }}</span>
          <q-menu context-menu auto-close touch-position class="shadow-6">
            <q-list class="noselect" dense style="min-width: 150px">
              <MenuItem
                :action="
                  () =>
                    copyToClipboard(
                      `${symbol}${result}${unit}${cTab === 'radix' ? '(' + radix + ')' : ''}`,
                      t('copiedDisplayedResult'),
                    )
                "
                :title="t('copyDisplayedResult')"
                :caption="`${symbol}${result}${unit}${cTab === 'radix' ? '(' + radix + ')' : ''}`"
              />
              <MenuItem
                :action="() => copyToClipboard(onlyNumber, t('copiedOnlyNumber'))"
                :title="t('copyOnlyNumber')"
                :caption="onlyNumber"
              />
            </q-list>
          </q-menu>
          <MyTooltip v-if="needFieldTooltip">
            {{ symbol + result + unit + (cTab === 'radix' ? '(' + radix + ')' : '') }}
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

  #radix {
    font-size: 20px;
    margin-left: 1px;
    position: relative;
    bottom: -3px;
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
