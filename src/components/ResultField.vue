<script setup lang="ts">
  /**
   * @file ResultField.vue
   * @description 이 파일은 계산 결과를 표시하는 Vue 컴포넌트입니다.
   *              사용자가 선택한 필드와 애드온에 따라 결과를 동적으로 렌더링하며,
   *              진법 변환, 단위 변환 및 통화 변환 기능 패널과 연동됩니다.
   *              또한, 메모리 기능을 통해 이전 계산 결과를 관리할 수 있습니다.
   *
   * @props {string} field - 결과를 표시할 필드 (기본값: 'main')
   * @props {string} addon - 추가 기능 (기본값: 'none')
   */

  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { ref, computed, onBeforeMount, onMounted, watch, onUnmounted, onBeforeUnmount } from 'vue';
  import { Haptics, ImpactStyle } from 'capacitor/haptics';
  import { copyToClipboard } from 'quasar';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // Store import
  import { useCalcStore } from 'src/stores/calcStore';
  import { useUnitStore } from 'src/stores/unitStore';
  import { useRadixStore } from 'src/stores/radixStore';
  import { useCurrencyStore } from 'src/stores/currencyStore';
  import { useSettingsStore } from 'src/stores/settingsStore';
  import { useUIStore } from 'src/stores/uiStore';

  // 계산기 관련 타입과 클래스
  import { UnitConverter } from 'src/classes/UnitConverter';
  import { toBigNumber } from 'src/classes/CalculatorMath';
  import { Radix } from 'src/classes/RadixConverter';
  import { KeyBinding } from 'src/classes/KeyBinding';

  // 전역 window 객체에 접근하기 위한 상수 선언
  const $g = window.globalVars;

  // Store 인스턴스 생성
  const calcStore = useCalcStore();
  const unitStore = useUnitStore();
  const radixStore = useRadixStore();
  const currencyStore = useCurrencyStore();
  const settingsStore = useSettingsStore();
  const uiStore = useUIStore();

  // 컴포넌트 import
  import MenuItem from 'components/snippets/MenuItem.vue';
  import ToolTip from 'src/components/snippets/ToolTip.vue';
  import { showError, showMessage } from 'src/utils/NotificationUtils';

  type PropsType = {
    field?: 'main' | 'sub';
    addon?: 'none' | 'unit' | 'currency' | 'radix';
  };

  // props 정의
  const props = withDefaults(defineProps<PropsType>(), {
    field: 'main',
    addon: 'none',
  });

  // 계산된 속성 정의
  const isMainField = props.field === 'main';
  const fieldID = `${props.field}Field`;

  // 스토어에서 필요한 메서드와 속성 추출
  const { calc } = calcStore;

  const currentTab = computed(() => uiStore.currentTab);

  const calcRecord = calc.record;

  // 필드 요소와 툴팁 상태 관리
  const fieldElement = computed(() => document.getElementById(fieldID));
  const needFieldTooltip = ref(false);

  /**
   * 필드 툴팁 표시 여부를 결정하는 함수
   *
   * @description
   * - 필드 요소의 너비가 스크롤 너비보다 작은 경우 툴팁 표시 필요
   */
  const checkNeedFieldTooltip = () => {
    if (!fieldElement.value) return false;
    needFieldTooltip.value = fieldElement.value.offsetWidth < fieldElement.value.scrollWidth;
    return true;
  };

  // 햅틱 피드백 함수
  const hapticFeedbackLight = async () => {
    if ($g.isCapacitor && settingsStore.hapticsMode) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const hapticFeedbackMedium = async () => {
    if ($g.isCapacitor && settingsStore.hapticsMode) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  };

  /**
   * 단위 변환 결과를 계산하는 함수
   *
   * @returns 단위 변환된 결과 문자열 또는 빈 문자열
   * @description
   * - 현재 카테고리의 시작 단위에서 목표 단위로 변환
   */
  const getConvertedUnitNumber = () => {
    const convertedNumber = UnitConverter.convert(
      unitStore.selectedCategory,
      toBigNumber(calc.currentNumber),
      unitStore.sourceUnits[unitStore.selectedCategory] ?? '',
      unitStore.targetUnits[unitStore.selectedCategory] ?? '',
    );

    // 단위 변환 결과 저장
    unitStore.convertedUnitNumber = convertedNumber;

    // 단위 변환 결과 반환
    return convertedNumber;
  };

  /**
   * 통화 변환 결과를 계산하는 함수
   *
   * @returns 통화 변환된 결과 문자열 또는 빈 문자열
   * @description
   * - 현재 숫자를 시작 통화에서 목표 통화로 변환
   */
  const getConvertedCurrencyNumber = () => {
    const currentNumber = toBigNumber(calc.currentNumber);
    const fromCurrency = currencyStore.sourceCurrency;
    const toCurrency = currencyStore.targetCurrency;

    const convertedNumber = currencyStore.currencyConverter.convert(currentNumber, fromCurrency, toCurrency).toFixed();

    // 통화 변환 결과 저장
    currencyStore.convertedCurrencyNumber = convertedNumber;

    // 통화 변환 결과 반환
    return convertedNumber;
  };

  /**
   * 진법 변환 결과를 계산하는 함수
   *
   * @returns 진법 변환된 결과 문자열 또는 빈 문자열
   * @description
   * - 현재 버퍼의 값을 메인 진법에서 서브 진법으로 변환
   */
  const getConvertedRadixNumber = () => {
    const convertedNumber = radixStore.convertRadix(calc.inputBuffer, radixStore.sourceRadix, radixStore.targetRadix);

    // console.log('convertedNumber', convertedNumber);
    // 진법 변환 결과 반환
    return convertedNumber;
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
      const inputBuffer = calc.inputBuffer;

      const formattedNumber = calcStore.toFormattedNumber(inputBuffer, radixStore.sourceRadix);

      // 소수점 자릿수 설정이 -2이고 소수점이 있는 경우
      const hasSpecialDecimalPlaces = settingsStore.decimalPlaces === -1 && inputBuffer.includes('.');

      const result =
        hasSpecialDecimalPlaces && !calc.needsBufferReset
          ? `${formattedNumber.split('.')[0]}.${inputBuffer.split('.')[1]}`
          : formattedNumber;

      return result;
    } else {
      // 서브 필드인 경우 애드온 타입에 따라 처리
      switch (props.addon) {
        case 'unit':
          unitStore.initRecentUnits();
          return calcStore.toFormattedNumber(getConvertedUnitNumber());

        case 'currency':
          currencyStore.initRecentCurrencies();
          return calcStore.toFormattedNumber(getConvertedCurrencyNumber());

        case 'radix': {
          radixStore.initRecentRadix();

          const convertedNumber = getConvertedRadixNumber();

          const formattedNumber = calcStore.toFormattedNumber(convertedNumber, radixStore.targetRadix);
          return formattedNumber;
        }

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
    // 통화 기호 표시가 비활성화된 경우 빈 문자열 반환
    if (props.addon !== 'currency' || !currencyStore.showSymbol) {
      return '';
    }

    // 현재 필드에 따른 통화 코드의 기호 반환
    const currencyCode = isMainField ? currencyStore.sourceCurrency : currencyStore.targetCurrency;
    return currencyStore.currencyConverter.getSymbol(currencyCode);
  });

  /**
   * 단위 표시를 위한 계산된 속성
   * 단위 표시 설정이 켜져있고 단위 애드온인 경우에만 단위를 표시
   */
  const unit = computed(() => {
    const shouldShowUnit = props.addon === 'unit' && unitStore.showUnit;
    if (!shouldShowUnit) return '';

    const selectedUnit = isMainField
      ? unitStore.sourceUnits[unitStore.selectedCategory]
      : unitStore.targetUnits[unitStore.selectedCategory];

    return ` ${selectedUnit}`;
  });

  /**
   * 진법 표시를 위한 계산된 속성
   * 현재 탭이 radix일 경우에만 진법을 표시
   */
  const radixPrefix = computed(() => {
    const radix = isMainField ? radixStore.sourceRadix : radixStore.targetRadix;
    return currentTab.value === 'radix' && radixStore.showRadix && radixStore.radixType === 'prefix'
      ? radixStore.getRadixPrefix(radix)
      : '';
  });

  const radixSuffix = computed(() => {
    const radix = isMainField ? radixStore.sourceRadix : radixStore.targetRadix;
    return currentTab.value === 'radix' && radixStore.showRadix && radixStore.radixType === 'suffix'
      ? radixStore.getRadixSuffix(radix)
      : '';
  });

  const displayedResult = computed(() => {
    // 진법 접두사, 기호, 결과값, 단위를 순서대로 연결
    const baseString = `${radixPrefix.value}${symbol.value}${result.value}${unit.value}`;

    // 진법 접미사 조건 확인
    const shouldShowSuffix = currentTab.value === 'radix' && radixStore.showRadix && radixStore.radixType === 'suffix';

    // 진법 접미사 추가 여부에 따라 최종 문자열 반환
    return shouldShowSuffix ? `${baseString}(${radixSuffix.value})` : baseString;
  });

  // 진법 모드에서 접두사/접미사를 포함한 결과 문자열 생성
  const getRadixResult = (number: string, isOnly = false) => {
    const prefix = radixPrefix.value;
    const suffix = radixSuffix.value;
    const suffixString = suffix && !isOnly ? `(${suffix})` : '';
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
        const convertedNumber = radixStore.convertRadix(calc.currentNumber, Radix.Decimal, radixStore.sourceRadix);
        return getRadixResult(convertedNumber, true);
      }
      return calc.currentNumber;
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
    return props.addon === 'radix' ? getRadixResult(result, true) : result;
  });

  // 연산자 문자열 계산된 속성
  const operator = computed(() => calc.getOperatorString());

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
  const isMemoryEmpty = computed(() => calc.memory.isEmpty);

  // 메모리 값 계산된 속성
  const memoryValue = computed(() => {
    const convertedNumber = radixStore.convertIfRadix(calc.memory.getNumber());
    return calcStore.toFormattedNumber(convertedNumber, radixStore.sourceRadix);
  });

  /**
   * 계산 인자나 계산 결과에 대한 식을 문자열로 생성하는 함수
   *
   * @returns 이전 결과 문자열
   * - 마지막 계산 기록이 있고 초기화가 필요한 경우: 기록의 좌측 부분 + "="
   * - 연산자가 있고 초기화가 필요없는 경우: 이전 숫자를 포맷팅한 문자열
   * - 그 외의 경우: 빈 문자열
   */
  const calculationExpression = computed(() => {
    // 마지막 계산 기록 가져오기
    const lastRecord = calcRecord.getCount() > 0 ? calcRecord.getAllRecords()[0] : null;

    // 초기화 필요 여부와 연산자 존재 여부 확인
    const needsReset = calc.needsBufferReset;
    const hasOperator = operator.value !== '';

    // 마지막 계산 기록이 있고 초기화가 필요한 경우
    const isLastRecordValid =
      lastRecord !== null && needsReset && calc.currentNumber === lastRecord?.calculationResult.resultNumber;

    if (isLastRecordValid) {
      return `${calcStore.getLeftSideInRecord(lastRecord.calculationResult)} =`;
    }

    // 연산자가 있고 초기화가 필요없는 경우
    if (hasOperator && !needsReset) {
      const radix = currentTab.value === 'radix' ? radixStore.sourceRadix : Radix.Decimal;
      const convrtedPreviousNumber = calcStore.toFormattedNumber(radixStore.convertIfRadix(calc.previousNumber), radix);
      return currentTab.value === 'radix' ? getRadixResult(convrtedPreviousNumber) : convrtedPreviousNumber;
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
    if (isMainField && calcStore.isMemoryVisible) {
      return !needFieldTooltip.value ? resultColors.normalDark : resultColors.warningDark;
    }
    return !needFieldTooltip.value ? resultColors.normal : resultColors.warning;
  };

  // 감시자 설정
  watch(
    () => currentTab.value,
    () => {
      // UI 업데이트
      if (currentTab.value === 'radix') {
        calc.currentRadix = radixStore.sourceRadix;
      } else {
        calc.currentRadix = Radix.Decimal;
      }
    },
    { immediate: true },
  );

  // 컴포넌트 마운트 전 이벤트 리스너 등록
  onBeforeMount(() => {
    window.addEventListener('resize', () => checkNeedFieldTooltip());
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let tooltipInterval: NodeJS.Timeout;

  // 현재 탭에 따른 상태 스왑 함수
  const swapCurrentTabState = () => {
    switch (currentTab.value) {
      case 'unit':
        unitStore.swapUnits();
        break;
      case 'currency':
        currencyStore.swapCurrencies();
        break;
      case 'radix':
        radixStore.swapRadixes();
        break;
    }
  };

  // 컴포넌트 마운트 후 초기 설정
  onMounted(() => {
    tooltipInterval = setTimeout(() => {
      swapCurrentTabState();
      setTimeout(() => {
        swapCurrentTabState();
        checkNeedFieldTooltip();
      }, 200);
    }, 200);
  });

  // 컴포넌트 언마운트 시 이벤트 리스너 제거
  onUnmounted(() => {
    // clearInterval(tooltipInterval);
    window.removeEventListener('resize', () => checkNeedFieldTooltip());
  });

  // 결과 복사, 숫자 복사
  const handleCopy = (isOnlyNumber: 'number' | 'result' = 'result') => {
    // 햅틱 피드백
    hapticFeedbackLight();

    // 이미 복사 중인 경우 숫자 복사
    if (isOnlyNumber === 'number') {
      copyToClipboard(onlyNumber.value)
        .then(() => {
          showMessage(
            t(props.field === 'main' ? 'copiedOnlyNumber' : 'copiedOnlyNumberSub', { result: onlyNumber.value }),
          );
        })
        .catch(() => {
          showError(t('failedToPasteFromClipboard'));
        });
    } else {
      // 결과 복사
      copyToClipboard(displayedResult.value)
        .then(() => {
          showMessage(
            t(props.field === 'main' ? 'copiedDisplayedResult' : 'copiedDisplayedResultSub', {
              result: displayedResult.value,
            }),
          );
        })
        .catch(() => {
          showError(t('failedToPasteFromClipboard'));
        });
    }
  };

  // 붙여넣을 수 있는 숫자 계산
  const numberToPaste = ref('');

  // 결과 패널 메뉴 표시 여부
  const showPanelMenu = ref(false);

  // 클립보드에서 텍스트 가져오기 함수
  const getClipboardText = async (): Promise<string> => {
    try {
      let clipboardText = '';
      if ($g.isCapacitor) {
        clipboardText = (await window.androidInterface?.getFromClipboard()) ?? '';
      } else {
        clipboardText = await navigator.clipboard.readText();
      }
      return clipboardText;
    } catch (error) {
      console.error('Failed to get clipboard content:', error);
      return '';
    }
  };

  // 클립보드에서 값 가져오기
  const updateClipboardValue = async () => {
    const clipboardText = await getClipboardText();
    if (currentTab.value === 'radix') {
      if (props.field === 'main') {
        numberToPaste.value = calc.filterNumberCharacters(clipboardText, radixStore.sourceRadix);
      } else {
        numberToPaste.value = calc.filterNumberCharacters(clipboardText, radixStore.targetRadix);
      }
    } else {
      numberToPaste.value = calc.filterNumberCharacters(clipboardText);
    }
  };

  // 메뉴가 열릴 때 클립보드 값 업데이트
  watch(
    () => showPanelMenu.value,
    async (newVal) => {
      if (newVal) {
        await updateClipboardValue();
      }
    },
  );

  // 클립보드 붙여넣기 처리
  const handlePaste = async (target: 'main' | 'sub' = 'main'): Promise<void> => {
    // 클립보드 읽기 시도
    try {
      const clipboardText = await getClipboardText();

      // 클립보드가 비어있거나 붙여넣을 수 없는 데이터가 포함되어 있는 경우
      if (!clipboardText) {
        showError(t('clipboardIsEmptyOrContainsDataThatCannotBePasted.'));
        return;
      }

      // 햅틱 피드백
      hapticFeedbackMedium();

      // 보조 필드 처리
      if (target === 'sub') {
        if (currentTab.value === 'unit') {
          // 단위 탭 스왑
          unitStore.swapUnits();
          // 버퍼에 붙여넣기
          calc.pasteToBuffer(clipboardText);
          // 현재 숫자 변환
          calc.currentNumber = UnitConverter.convert(
            unitStore.selectedCategory,
            toBigNumber(calc.currentNumber),
            unitStore.sourceUnits[unitStore.selectedCategory] ?? '',
            unitStore.targetUnits[unitStore.selectedCategory] ?? '',
          );
          // 단위 탭 스왑
          unitStore.swapUnits();
        } else if (currentTab.value === 'currency') {
          // 통화 탭 스왑
          currencyStore.swapCurrencies();
          // 버퍼에 붙여넣기
          calc.pasteToBuffer(clipboardText);
          // 현재 숫자 변환
          calc.currentNumber = currencyStore.currencyConverter
            .convert(toBigNumber(calc.currentNumber), currencyStore.sourceCurrency, currencyStore.targetCurrency)
            .toString();
          // 통화 탭 스왑
          currencyStore.swapCurrencies();
        } else if (currentTab.value === 'radix') {
          // 진법 탭 스왑
          radixStore.swapRadixes();
          // 버퍼에 붙여넣기
          setTimeout(() => {
            calc.pasteToBuffer(clipboardText.replace(/\((?:2|8|10|16)\)/g, ''));
            // 진법 탭 스왑
            radixStore.swapRadixes();
          }, 10);
        }
        showMessage(t('pastedFromClipboardToSubPanel'));
      } else {
        if (currentTab.value === 'radix') {
          // 진법 탭 스왑
          radixStore.swapRadixes();
          // 버퍼에 붙여넣기
          setTimeout(() => {
            calc.pasteToBuffer(clipboardText.replace(/\((?:2|8|10|16)\)/g, ''));
            // 진법 탭 스왑
            radixStore.swapRadixes();
          }, 10);
        } else {
          // 버퍼에 붙여넣기
          calc.pasteToBuffer(clipboardText);
        }

        // 클립보드 붙여넣기 메시지 표시
        showMessage(t('pastedFromClipboard'));
      }
    } catch (error) {
      // 클립보드 붙여넣기 실패 메시지 표시
      console.error('Failed to paste from clipboard:', error);
      showError(t('failedToPasteFromClipboard'));
    }
  };

  // 키 바인딩 설정
  const keyBinding =
    props.field === 'main'
      ? new KeyBinding([
          [['Control+c', 'Control+Insert', 'Copy'], handleCopy],
          [['Control+v', 'Shift+Insert', 'Paste'], () => handlePaste('main')],
        ])
      : new KeyBinding([
          [['Shift+Control+c', 'Alt+Control+Insert', 'Shift+Copy'], handleCopy],
          [['Shift+Control+v', 'Alt+Shift+Insert', 'Shift+Paste'], () => handlePaste('sub')],
        ]);

  /**
   * 입력 필드 포커스 상태에 따라 키 바인딩을 활성화/비활성화합니다.
   */
  watch(
    () => uiStore.inputFocused,
    () => {
      if (uiStore.inputFocused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    keyBinding.subscribe();
  });

  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
  });

  // 결과 패널 패딩 설정
  const resultPanelPadding = computed(() => calcStore.resultPanelPadding);
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
          @click="calcStore.showMemoryTemporarily()"
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
          :style="`padding-top: ${resultPanelPadding}px;`"
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
            {{ isMainField && calcStore.isMemoryVisible ? memoryValue : result }}
          </span>
          <span v-if="currentTab === 'unit'" id="unit" role="text" :aria-label="t('ariaLabel.unit')">{{ unit }}</span>
          <span
            v-if="currentTab === 'radix' && radixStore.showRadix && radixStore.radixType === 'suffix'"
            id="radixSuffix"
            role="text"
            :aria-label="t('ariaLabel.radixSuffix')"
          >
            {{ radixSuffix }}
          </span>
          <ToolTip v-if="needFieldTooltip">
            {{ displayedResult }}
          </ToolTip>
        </div>
        <q-menu
          :model-value="showPanelMenu"
          class="shadow-6"
          :context-menu="$g.isDesktop"
          auto-close
          anchor="bottom left"
          self="top left"
          @update:model-value="
            (val) => {
              showPanelMenu = val;
            }
          "
        >
          <q-list dense class="noselect" style="max-width: 200px" role="list">
            <MenuItem :title="t('copyDisplayedResult')" :action="() => handleCopy()" :caption="displayedResult" />
            <MenuItem :title="t('copyOnlyNumber')" :action="() => handleCopy('number')" :caption="onlyNumber" />
            <MenuItem separator />
            <MenuItem
              :title="t('paste')"
              :action="() => handlePaste(props.field)"
              :caption="numberToPaste"
            />
          </q-list>
        </q-menu>
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
    copiedDisplayedResult: '표시된 결과가 복사되었습니다.<br><center>{result}</center>'
    copiedDisplayedResultSub: '보조 패널에 표시된 결과가 복사되었습니다.<br><center>{result}</center>'
    copyDisplayedResult: '표시된 결과 복사'
    copiedOnlyNumber: '결과 숫자가 복사되었습니다.<br><center>{result}</center>'
    copiedOnlyNumberSub: '보조 패널에 표시된 결과 숫자가 복사되었습니다.<br><center>{result}</center>'
    copyOnlyNumber: '결과 숫자 복사'
    pastedFromClipboard: '클립보드로부터 숫자를 붙여넣었습니다.'
    pastedFromClipboardToSubPanel: '클립보드로부터 숫자를 <br> 보조 패널에 붙여넣었습니다.'
    clipboardIsEmptyOrContainsDataThatCannotBePasted: '클립보드가 비어있거나 붙여넣을 수 없는 데이터가 포함되어 있습니다.'
    failedToPasteFromClipboard: '클립보드로부터 붙여넣기에 실패했습니다.'
    paste: '붙여넣기'
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
    copiedDisplayedResult: 'The displayed result has been copied.<br><center>{result}</center>'
    copiedDisplayedResultSub: 'The sub panel result has been copied.<br><center>{result}</center>'
    copyDisplayedResult: 'Copy displayed result'
    copiedOnlyNumber: 'The result number has been copied.<br><center>{result}</center>'
    copiedOnlyNumberSub: 'The sub panel result number has been copied.<br><center>{result}</center>'
    copyOnlyNumber: 'Copy result number'
    pastedFromClipboard: 'The number has been pasted from the clipboard.'
    pastedFromClipboardToSubPanel: 'The number has been pasted <br>from the clipboard to the sub panel.'
    clipboardIsEmptyOrContainsDataThatCannotBePasted: 'The clipboard is empty or contains data that cannot be pasted.'
    failedToPasteFromClipboard: 'Failed to paste from clipboard.'
    paste: 'Paste'
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
