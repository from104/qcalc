<script setup lang="ts">
  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { ref, computed, onBeforeMount, onMounted, watch, onUnmounted } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // 계산기 관련 타입과 클래스
  import { UnitConverter } from 'src/classes/UnitConverter';
  import { BigNumber } from 'classes/CalculatorMath';
  import { Radix } from 'classes/RadixConverter';

  // 스토어 관련
  import { useStore } from 'src/stores/store';
  const store = useStore();

  // 컴포넌트 import
  import ToolTip from 'src/components/snippets/ToolTip.vue';
  import MenuItem from 'src/components/snippets/MenuItem.vue';

  // props 정의
  const props = withDefaults(defineProps<{ field?: string; addon?: string }>(), {
    field: 'main',
    addon: 'none',
  });

  // 계산된 속성 정의
  const isMainField = props.field === 'main';
  const fieldID = `${props.field}Field`;

  // 스토어에서 필요한 메서드와 속성 추출
  const {
    calc,
    currentTab,
    showMemoryTemporarily,
    toFormattedNumber,
    convertIfRadix,
    getLeftSideInRecord,
    copyToClipboard,
    initRecentUnits,
    initRecentCurrencies,
    initRecentRadix,
  } = store;

  const calcRecord = calc.record;
  const needFieldTooltip = ref(false);
  // const fieldElement = ref<HTMLElement | null>(null);
  const fieldElement = computed(() => document.getElementById(fieldID));

  /**
   * 필드 툴팁 표시 여부를 결정하는 함수
   *
   * @description
   * - 필드 요소의 너비가 스크롤 너비보다 작은 경우 툴팁 표시 필요
   */
  const checkNeedFieldTooltip = () => {
    // 필드 요소 가져오기
    // fieldElement.value = document.getElementById(fieldID);

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
  const getConvertedUnitNumber = () => {
    const { selectedCategory, sourceUnits, targetUnits } = store;

    return UnitConverter.convert(
      selectedCategory,
      BigNumber(calc.getCurrentNumber()),
      sourceUnits[selectedCategory] ?? '',
      targetUnits[selectedCategory] ?? '',
    );
  };

  /**
   * 통화 변환 결과를 계산하는 함수
   *
   * @returns 통화 변환된 결과 문자열 또는 빈 문자열
   * @description
   * - 현재 숫자를 시작 통화에서 목표 통화로 변환
   */
  const getConvertedCurrencyNumber = () => {
    const currentNumber = BigNumber(calc.getCurrentNumber());
    const fromCurrency = store.sourceCurrency;
    const toCurrency = store.targetCurrency;

    return store.converter.convert(currentNumber, fromCurrency, toCurrency).toString();
  };

  // 진법 변환 결과 계산 함수
  /**
   * 진법 변환 결과를 계산하는 함수
   *
   * @returns 진법 변환된 결과 문자열 또는 빈 문자열
   * @description
   * - 현재 버퍼의 값을 메인 진법에서 서브 진법으로 변환
   */
  const getConvertedRadixNumber = () => {
    return store.convertRadix(calc.getInputBuffer(), store.sourceRadix, store.targetRadix);
  };

  /**
   * 결과 문자열을 생성하는 함수
   *
   * @returns 계산 결과 문자열
   * @description
   * - 메인 필드인 경우: 현재 버퍼값을 포맷팅하여 반환
   * - 서브 필드인 경우: 각 애드온(단위/통화/진법)에 따라 변환된 결과를 반환
   */
  const result = computed(() => {
    // 메인 필드인 경우
    if (isMainField) {
      const inputBuffer = calc.getInputBuffer();

      const formattedNumber = toFormattedNumber(inputBuffer);

      // 소수점 자릿수 설정이 -2이고 소수점이 있는 경우
      const hasSpecialDecimalPlaces = store.decimalPlaces === -2 && inputBuffer.includes('.');

      const result = hasSpecialDecimalPlaces
        ? `${formattedNumber.split('.')[0]}.${inputBuffer.split('.')[1]}`
        : formattedNumber;

      return result;
    } else {
      // 서브 필드인 경우 애드온 타입에 따라 처리
      switch (props.addon) {
        case 'unit':
          initRecentUnits();
          return toFormattedNumber(getConvertedUnitNumber());

        case 'currency':
          initRecentCurrencies();
          return toFormattedNumber(getConvertedCurrencyNumber());

        case 'radix':
          initRecentRadix();
          return toFormattedNumber(getConvertedRadixNumber());

        default:
          return '';
      }
    }
  });

  /**
   * 통화 기호를 표시하는 계산된 속성
   *
   * @returns 통화 기호 문자열
   * @description
   * - 통화 기호 표시 설정이 켜져있고 통화 애드온인 경우에만 기호 표시
   * - 메인 필드면 시작 통화의 기호를, 서브 필드면 대상 통화의 기호를 반환
   */
  const symbol = computed(() => {
    const isShowingCurrencySymbol = store.showSymbol && props.addon === 'currency';
    if (!isShowingCurrencySymbol) return '';

    const currencyCode = isMainField ? store.sourceCurrency : store.targetCurrency;

    return store.converter.getSymbol(currencyCode);
  });

  /**
   * 단위 표시를 위한 계산된 속성
   * 단위 표시 설정이 켜져있고 단위 애드온인 경우에만 단위를 표시
   */
  const unit = computed(() => {
    const shouldShowUnit = store.showUnit && props.addon === 'unit';
    if (!shouldShowUnit) return '';

    const selectedUnit = isMainField
      ? store.sourceUnits[store.selectedCategory]
      : store.targetUnits[store.selectedCategory];

    return ` ${selectedUnit}`;
  });

  /**
   * 진법 표시를 위한 계산된 속성
   * 현재 탭이 radix일 경우에만 진법을 표시
   */
  const radixPrefix = computed(() => {
    const radix = isMainField ? store.sourceRadix : store.targetRadix;
    return currentTab === 'radix' && store.showRadix && store.radixType === 'prefix' ? store.getRadixPrefix(radix) : '';
  });

  const radixSuffix = computed(() => {
    const radix = isMainField ? store.sourceRadix : store.targetRadix;
    return currentTab === 'radix' && store.showRadix && store.radixType === 'suffix' ? store.getRadixSuffix(radix) : '';
  });

  const displayedResult = computed(() => {
    // 진법 접두사, 기호, 결과값, 단위를 순서대로 연결
    const baseString = `${radixPrefix.value}${symbol.value}${result.value}${unit.value}`;

    // 진법 접미사 조건 확인
    const shouldShowSuffix = currentTab === 'radix' && store.showRadix && store.radixType === 'suffix';

    // 진법 접미사 추가 여부에 따라 최종 문자열 반환
    return shouldShowSuffix ? `${baseString}(${radixSuffix.value})` : baseString;
  });

  // 진법 모드에서 접두사/접미사를 포함한 결과 문자열 생성
  const getRadixResult = (number: string) => {
    const prefix = radixPrefix.value;
    const suffix = radixSuffix.value;
    const suffixString = suffix ? `(${suffix})` : '';
    return `${prefix}${number}${suffixString}`;
  };

  /**
   * 숫자만 표시하기 위한 계산된 속성
   * 필드와 애드온 타입에 따라 적절한 숫자를 반환
   */
  const onlyNumber = computed(() => {
    // 메인 필드 처리
    if (props.field === 'main') {
      if (props.addon === 'radix') {
        const convertedNumber = store.convertRadix(calc.getCurrentNumber(), Radix.Decimal, store.sourceRadix);
        return getRadixResult(convertedNumber);
      }
      return calc.getCurrentNumber();
    }

    // 서브 필드 처리
    const converters = {
      unit: getConvertedUnitNumber,
      currency: getConvertedCurrencyNumber,
      radix: getConvertedRadixNumber,
    };

    const converter = converters[props.addon as keyof typeof converters];
    const result = converter?.() || '';

    // 진법 모드인 경우 접두사/접미사 추가
    return props.addon === 'radix' ? getRadixResult(result) : result;
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
    pow: 'mdi-exponent-box',
    root: 'mdi-square-root-box',
    bitSftR: 'mdi-chevron-right-box',
    bitSftL: 'mdi-chevron-left-box',
    bitAnd: 'mdi-numeric-8-box',
    bitOr: 'mdi-zip-box',
    bitXor: 'mdi-chevron-up-box',
    bitNand: 'mdi-numeric-8-box-outline',
    bitNor: 'mdi-zip-box-outline',
    bitXnor: 'mdi-chevron-up-box-outline',
  };

  // 메모리 초기화 여부 계산된 속성
  const isMemoryEmpty = computed(() => calc.isMemoryEmpty);

  // 메모리 값 계산된 속성
  const memoryValue = computed(() => toFormattedNumber(convertIfRadix(calc.getMemoryNumber())));

  /**
   * 계산 인자나 계산 결과에 대한 식을 문자열로 생성하는 함수
   *
   * @returns 이전 결과 문자열
   * - 마지막 계산 기록이 있고 초기화가 필요한 경우: 기록의 좌측 부분 + "="
   * - 연산자가 있고 초기화가 필요없는 경우: 이전 숫자를 포맷팅한 문자열
   * - 그 외의 경우: 빈 문자열
   */
  // const getPreviousResult = () => {
  const calculationExpression = computed(() => {
    // 마지막 계산 기록 가져오기
    const lastRecord = calcRecord.getCount() > 0 ? calcRecord.getAllRecords()[0] : null;

    // 초기화 필요 여부와 연산자 존재 여부 확인
    const needsReset = calc.getNeedsBufferReset();
    const hasOperator = operator.value !== '';

    // 마지막 계산 기록이 있고 초기화가 필요한 경우
    const isLastRecordValid =
      lastRecord !== null && needsReset && calc.getCurrentNumber() === lastRecord?.calculationResult.resultNumber;

    if (isLastRecordValid) {
      return `${getLeftSideInRecord(lastRecord.calculationResult)} =`;
    }

    // 연산자가 있고 초기화가 필요없는 경우
    if (hasOperator && !needsReset) {
      const convrtedPreviousNumber = toFormattedNumber(convertIfRadix(calc.getPreviousNumber()));
      return props.addon === 'radix' ? getRadixResult(convrtedPreviousNumber) : convrtedPreviousNumber;
    }

    return '';
  });

  // 결과 색상 정의
  const resultColors = {
    normal: 'text-light-green-8',
    warning: 'text-deep-orange-5',
    normalDark: 'text-light-green-10',
    warningDark: 'text-deep-orange-8',
  };

  // 결과 배경색 정의
  const resultBackgroundColors = {
    normal: 'light-green-3',
    warning: 'deep-orange-2',
  };

  // 결과 색상 선택 함수
  const getResultColor = () => {
    if (isMainField && store.isMemoryVisible) {
      return !needFieldTooltip.value ? resultColors.normalDark : resultColors.warningDark;
    }
    return !needFieldTooltip.value ? resultColors.normal : resultColors.warning;
  };

  const computedCurrentTab = computed(() => store.currentTab);

  // 감시자 설정
  watch(
    () => store.currentTab,
    () => {
      // UI 업데이트
      checkNeedFieldTooltip();

      if (computedCurrentTab.value === 'radix') {
        calc.currentRadix = store.sourceRadix;
      } else {
        calc.currentRadix = Radix.Decimal;
      }
    },
    { immediate: true },
  );

  // 컴포넌트 마운트 전 이벤트 리스너 등록
  onBeforeMount(() => {
    window.addEventListener('resize', checkNeedFieldTooltip);
  });

  let tooltipInterval: NodeJS.Timeout;
  // 컴포넌트 마운트 후 초기 설정
  onMounted(() => {
    tooltipInterval = setInterval(checkNeedFieldTooltip, 50);
    checkNeedFieldTooltip();
  });

  // 컴포넌트 언마운트 시 이벤트 리스너 제거
  onUnmounted(() => {
    clearInterval(tooltipInterval);
    window.removeEventListener('resize', checkNeedFieldTooltip);
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
      role="textbox"
      :aria-label="t('ariaLabel.resultField', { type: isMainField ? t('ariaLabel.main') : t('ariaLabel.sub') })"
      :bg-color="!needFieldTooltip ? resultBackgroundColors.normal : resultBackgroundColors.warning"
      :label-slot="isMainField"
      :stack-label="isMainField"
    >
      <template v-if="isMainField" #label>
        <div v-auto-blur class="noselect" :class="getResultColor()" role="text" :aria-label="t('ariaLabel.expression')">
          {{ calculationExpression }}
        </div>
      </template>
      <template v-if="isMainField" #prepend>
        <div
          v-if="!isMemoryEmpty"
          v-auto-blur
          class="noselect full-height q-mt-xs q-pt-sm"
          :class="getResultColor()"
          role="button"
          :aria-label="t('ariaLabel.memory')"
          @click="showMemoryTemporarily()"
        >
          <q-icon name="mdi-chip" role="img" :aria-label="t('ariaLabel.memoryIcon')" />
        </div>
        <div
          v-if="operator != ''"
          v-auto-blur
          class="noselect full-height q-mt-xs q-pt-sm"
          :class="getResultColor()"
          role="text"
          :aria-label="t('ariaLabel.operator', { operator })"
        >
          <q-icon :name="operatorIcons[operator]" role="img" :aria-label="t('ariaLabel.operatorIcon', { operator })" />
        </div>
      </template>
      <template #control>
        <div
          :id="fieldID"
          v-mutation="
            () => {
              checkNeedFieldTooltip();
              return true;
            }
          "
          v-mutation.characterData
          class="self-center no-outline full-width full-height ellipsis text-right q-pt-xs noselect"
          :class="[isMainField ? 'text-h5' : '', getResultColor()]"
          :style="`padding-top: ${store.resultPanelPadding}px;`"
          role="text"
          :aria-label="t('ariaLabel.result', { type: isMainField ? t('ariaLabel.main') : t('ariaLabel.sub') })"
        >
          <span v-if="currentTab === 'radix'" id="radixPrefix" role="text" :aria-label="t('ariaLabel.radixPrefix')">{{
            radixPrefix
          }}</span>
          <span v-if="currentTab === 'currency'" id="symbol" role="text" :aria-label="t('ariaLabel.currencySymbol')">{{
            symbol
          }}</span>
          <span
            :id="isMainField ? 'result' : 'subResult'"
            :class="getResultColor()"
            role="text"
            :aria-label="t('ariaLabel.value')"
          >
            {{ isMainField && store.isMemoryVisible ? memoryValue : result }}
          </span>
          <span v-if="currentTab === 'unit'" id="unit" role="text" :aria-label="t('ariaLabel.unit')">{{ unit }}</span>
          <span
            v-if="currentTab === 'radix' && store.showRadix && store.radixType === 'suffix'"
            id="radixSuffix"
            role="text"
            :aria-label="t('ariaLabel.radixSuffix')"
          >
            {{ radixSuffix }}
          </span>
          <q-menu
            context-menu
            auto-close
            touch-position
            class="shadow-6"
            role="menu"
            :aria-label="t('ariaLabel.contextMenu')"
          >
            <q-list class="noselect" dense style="min-width: 150px">
              <MenuItem
                :action="() => copyToClipboard(displayedResult, t('copiedDisplayedResult'))"
                :title="t('copyDisplayedResult')"
                :caption="displayedResult"
              />
              <MenuItem
                :action="() => copyToClipboard(onlyNumber, t('copiedOnlyNumber'))"
                :title="t('copyOnlyNumber')"
                :caption="onlyNumber"
              />
            </q-list>
          </q-menu>
          <ToolTip v-if="needFieldTooltip">
            {{ displayedResult }}
          </ToolTip>
        </div>
      </template>
    </q-field>
  </q-card-section>
</template>

<style scoped lang="scss">
  @font-face {
    font-family: 'resultFont';
    src: url('/digital-7.monoitalic.ttf') format('truetype');
  }

  #symbol {
    font-size: 34px;
    font-family: 'Courier New', Courier, monospace;
    // padding-right: 0.3rem;
  }

  #result,
  #subResult {
    font-family: 'resultFont';
    font-size: 36px;
  }

  #unit {
    font-size: 22px;
  }

  #radixPrefix {
    font-size: 32px;
    padding-right: 0.1rem;
  }

  #radixSuffix {
    font-size: 20px;
    margin-left: 1px;
    position: relative;
    bottom: -3px;
    min-width: 2ch; /* 2글자 폭 확보 */
    display: inline-block; /* 폭 설정을 위해 필요 */
    text-align: left; /* 왼쪽 정렬 (선택사항) */
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
    ariaLabel:
      resultField: '{type} 결과 필드'
      main: '주'
      sub: '보조'
      expression: '계산식'
      memory: '메모리 값 표시'
      memoryIcon: '메모리 아이콘'
      operator: '현재 연산자: {operator}'
      operatorIcon: '{operator} 연산자 아이콘'
      result: '{type} 결과 값'
      value: '계산 결과'
      radixPrefix: '진법 접두사'
      radixSuffix: '진법 접미사'
      currencySymbol: '통화 기호'
      unit: '단위'
      contextMenu: '결과 복사 메뉴'
  en:
    copiedDisplayedResult: 'The displayed result has been copied.'
    copyDisplayedResult: 'Copy displayed result'
    copiedOnlyNumber: 'The result number has been copied.'
    copyOnlyNumber: 'Copy result number'
    ariaLabel:
      resultField: '{type} result field'
      main: 'main'
      sub: 'sub'
      expression: 'Calculation expression'
      memory: 'Show memory value'
      memoryIcon: 'Memory icon'
      operator: 'Current operator: {operator}'
      operatorIcon: '{operator} operator icon'
      result: '{type} result value'
      value: 'Calculation result'
      radixPrefix: 'Radix prefix'
      radixSuffix: 'Radix suffix'
      currencySymbol: 'Currency symbol'
      unit: 'Unit'
      contextMenu: 'Result copy menu'
</i18n>
