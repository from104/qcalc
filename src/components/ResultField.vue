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
  import { Haptics, ImpactStyle } from '@capacitor/haptics';
  import { copyToClipboard } from 'quasar';

  // Quasar 관련 설정
  import { colors } from 'quasar';
  // Quasar 인스턴스 및 색상 유틸리티 초기화
  const { lighten } = colors;

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // Store import
  import { useCalcStore } from 'src/stores/calcStore';
  import { useUnitStore } from 'src/stores/unitStore';
  import { useRadixStore } from 'src/stores/radixStore';
  import { useCurrencyStore } from 'src/stores/currencyStore';
  import { useSettingsStore } from 'stores/settingsStore';
  import { useUIStore } from 'src/stores/uiStore';
  import { useThemesStore } from 'stores/themesStore';

  // 계산기 관련 타입과 클래스
  import { UnitConverter } from 'src/classes/UnitConverter';
  import { toBigNumber } from 'src/classes/CalculatorMath';
  import { Radix } from 'src/utils/RadixConverter';
  import { useKeyBinding } from '../composables/useKeyBinding';

  // 전역 window 객체에 접근하기 위한 상수 선언
  const $g = window.globalVars;

  // Store 인스턴스 생성
  const calcStore = useCalcStore();
  const unitStore = useUnitStore();
  const radixStore = useRadixStore();
  const currencyStore = useCurrencyStore();
  const settingsStore = useSettingsStore();
  const themesStore = useThemesStore();
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
   * 필드 내용이 넘칠 경우 툴팁을 표시할지 여부를 결정합니다.
   */
  const checkNeedFieldTooltip = () => {
    if (!fieldElement.value) return;
    needFieldTooltip.value = fieldElement.value.offsetWidth < fieldElement.value.scrollWidth;
  };

  /**
   * 가벼운 햅틱 피드백을 트리거합니다.
   */
  const hapticFeedbackLight = async () => {
    if ($g.isCapacitor && settingsStore.hapticsMode) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  /**
   * 중간 강도의 햅틱 피드백을 트리거합니다.
   */
  const hapticFeedbackMedium = async () => {
    if ($g.isCapacitor && settingsStore.hapticsMode) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  };

  /**
   * 현재 숫자를 다른 단위로 변환합니다.
   * @returns 단위 변환 결과 문자열
   */
  const getConvertedUnitNumber = () => {
    const convertedNumber = UnitConverter.convert(
      unitStore.selectedCategory,
      toBigNumber(calc.currentNumber),
      unitStore.sourceUnits[unitStore.selectedCategory] ?? '',
      unitStore.targetUnits[unitStore.selectedCategory] ?? '',
    );
    unitStore.convertedUnitNumber = convertedNumber;
    return convertedNumber;
  };

  /**
   * 현재 숫자를 다른 통화로 변환합니다.
   * @returns 통화 변환 결과 문자열
   */
  const getConvertedCurrencyNumber = () => {
    const convertedNumber = currencyStore.currencyConverter
      .convert(toBigNumber(calc.currentNumber), currencyStore.sourceCurrency, currencyStore.targetCurrency)
      .toFixed();
    currencyStore.convertedCurrencyNumber = convertedNumber;
    return convertedNumber;
  };

  /**
   * 현재 숫자를 다른 진법으로 변환합니다.
   * @returns 진법 변환 결과 문자열
   */
  const getConvertedRadixNumber = () => {
    return radixStore.convertRadix(calc.inputBuffer, radixStore.sourceRadix, radixStore.targetRadix);
  };

  /**
   * 현재 필드에 표시될 계산 결과를 계산합니다.
   * 메인 필드는 현재 입력 버퍼를, 서브 필드는 변환된 결과를 표시합니다.
   */
  const result = computed(() => {
    if (isMainField) {
      const inputBuffer = calc.inputBuffer;
      const formattedNumber = calcStore.toFormattedNumber(inputBuffer, radixStore.sourceRadix);
      const hasSpecialDecimalPlaces = settingsStore.decimalPlaces === -1 && inputBuffer.includes('.');
      return hasSpecialDecimalPlaces && !calc.needsBufferReset
        ? `${formattedNumber.split('.')[0]}.${inputBuffer.split('.')[1]}`
        : formattedNumber;
    } else {
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
          return calcStore.toFormattedNumber(convertedNumber, radixStore.targetRadix);
        }
        default:
          return '';
      }
    }
  });

  /**
   * 현재 통화 기호를 반환합니다.
   */
  const symbol = computed(() => {
    if (props.addon !== 'currency' || !currencyStore.showSymbol) {
      return '';
    }
    const currencyCode = isMainField ? currencyStore.sourceCurrency : currencyStore.targetCurrency;
    return currencyStore.currencyConverter.getSymbol(currencyCode);
  });

  /**
   * 현재 단위 기호를 반환합니다.
   */
  const unit = computed(() => {
    if (props.addon !== 'unit' || !unitStore.showUnit) return '';
    const selectedUnit = isMainField
      ? unitStore.sourceUnits[unitStore.selectedCategory]
      : unitStore.targetUnits[unitStore.selectedCategory];
    return ` ${selectedUnit}`;
  });

  /**
   * 현재 진법 접두사를 반환합니다.
   */
  const radixPrefix = computed(() => {
    const radix = isMainField ? radixStore.sourceRadix : radixStore.targetRadix;
    return currentTab.value === 'radix' && radixStore.showRadix && radixStore.radixType === 'prefix'
      ? radixStore.getRadixPrefix(radix)
      : '';
  });

  /**
   * 현재 진법 접미사를 반환합니다.
   */
  const radixSuffix = computed(() => {
    const radix = isMainField ? radixStore.sourceRadix : radixStore.targetRadix;
    return currentTab.value === 'radix' && radixStore.showRadix && radixStore.radixType === 'suffix'
      ? radixStore.getRadixSuffix(radix)
      : '';
  });

  /**
   * 기호, 단위, 진법 표시를 포함하여 표시될 최종 결과 문자열을 포맷합니다.
   * @param value - 포맷할 숫자 값
   * @returns 포맷된 전체 결과 문자열
   */
  const formatDisplayResult = (value: string): string => {
    const baseString = `${radixPrefix.value}${symbol.value}${value}${unit.value}`;
    const shouldShowSuffix = currentTab.value === 'radix' && radixStore.showRadix && radixStore.radixType === 'suffix';
    return shouldShowSuffix ? `${baseString}(${radixSuffix.value})` : baseString;
  };

  /**
   * 현재 계산 결과를 기반으로 포맷된 표시 문자열입니다.
   */
  const displayedResult = computed(() => formatDisplayResult(result.value));

  /**
   * 메모리 값을 기반으로 포맷된 표시 문자열입니다.
   */
  const displayedResultWithMemory = computed(() => formatDisplayResult(memoryValue.value));

  /**
   * 진법 표시(접두사/접미사)를 포함한 숫자 문자열을 반환합니다.
   * @param number - 포맷할 숫자 문자열
   * @param isOnly - 접미사 괄호를 생략할지 여부
   * @returns 포맷된 진법 결과 문자열
   */
  const getRadixResult = (number: string, isOnly = false) => {
    const prefix = radixPrefix.value;
    const suffix = radixSuffix.value;
    const suffixString = suffix && !isOnly ? `(${suffix})` : '';
    return `${prefix}${number}${suffixString}`;
  };

  /**
   * 변환 및 포맷팅되지 않은 순수 숫자 값을 반환합니다.
   */
  const onlyNumber = computed(() => {
    if (props.field === 'main') {
      if (props.addon === 'radix') {
        const convertedNumber = radixStore.convertRadix(calc.currentNumber, Radix.Decimal, radixStore.sourceRadix);
        return getRadixResult(convertedNumber, true);
      }
      return calc.currentNumber;
    }

    const converters = {
      unit: getConvertedUnitNumber,
      currency: getConvertedCurrencyNumber,
      radix: getConvertedRadixNumber,
    };
    const converter = converters[props.addon as keyof typeof converters];
    const result = converter?.() || '';

    return props.addon === 'radix' ? getRadixResult(result, true) : result;
  });

  /**
   * 현재 활성화된 연산자 기호를 반환합니다.
   */
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

  /**
   * 메모리가 비어있는지 여부를 나타냅니다.
   */
  const isMemoryEmpty = computed(() => calc.memory.isEmpty);

  /**
   * 현재 필드에 표시될 메모리 값을 계산합니다.
   */
  const memoryValue = computed(() => {
    const rawMemoryNumber = calc.memory.getNumber();
    if (!rawMemoryNumber) return '';

    if (isMainField) {
      const convertedNumber = radixStore.convertIfRadix(rawMemoryNumber);
      return calcStore.toFormattedNumber(convertedNumber, radixStore.sourceRadix);
    } else {
      switch (props.addon) {
        case 'unit': {
          const convertedNumber = UnitConverter.convert(
            unitStore.selectedCategory,
            toBigNumber(rawMemoryNumber),
            unitStore.sourceUnits[unitStore.selectedCategory] ?? '',
            unitStore.targetUnits[unitStore.selectedCategory] ?? '',
          );
          return calcStore.toFormattedNumber(convertedNumber);
        }
        case 'currency': {
          const convertedNumber = currencyStore.currencyConverter
            .convert(toBigNumber(rawMemoryNumber), currencyStore.sourceCurrency, currencyStore.targetCurrency)
            .toFixed();
          return calcStore.toFormattedNumber(convertedNumber);
        }
        case 'radix': {
          const convertedNumber = radixStore.convertRadix(
            radixStore.convertIfRadix(rawMemoryNumber),
            radixStore.sourceRadix,
            radixStore.targetRadix,
          );
          return calcStore.toFormattedNumber(convertedNumber, radixStore.targetRadix);
        }
        default:
          return calcStore.toFormattedNumber(rawMemoryNumber);
      }
    }
  });

  /**
   * 현재 계산 표현식을 반환합니다 (예: "1 + 2 =").
   */
  const calculationExpression = computed(() => {
    const lastRecord = calcRecord.getCount() > 0 ? calcRecord.getAllRecords()[0] : null;
    const needsReset = calc.needsBufferReset;
    const hasOperator = operator.value !== '';
    const isLastRecordValid =
      lastRecord && needsReset && calc.currentNumber === lastRecord.calculationResult.resultNumber;

    if (isLastRecordValid) {
      return `${calcStore.getLeftSideInRecord(lastRecord.calculationResult)} =`;
    }

    if (hasOperator && !needsReset) {
      const radix = currentTab.value === 'radix' ? radixStore.sourceRadix : Radix.Decimal;
      const convertedPreviousNumber = calcStore.toFormattedNumber(radixStore.convertIfRadix(calc.previousNumber), radix);
      return currentTab.value === 'radix' ? getRadixResult(convertedPreviousNumber) : convertedPreviousNumber;
    }

    return '';
  });

  // UI 색상
  const panelTextColor = computed(() =>
    themesStore.getPanelColor('text', needFieldTooltip.value ? 'warning' : 'normal'),
  );
  const memoryTextColor = computed(() =>
    themesStore.getPanelColor('text', needFieldTooltip.value ? 'warning' : 'normal', true),
  );
  const panelBackgroundColor = computed(() =>
    themesStore.getPanelColor('background', needFieldTooltip.value ? 'warning' : 'normal'),
  );

  // 현재 탭 변경 감시
  watch(
    () => currentTab.value,
    (newTab) => {
      calc.currentRadix = newTab === 'radix' ? radixStore.sourceRadix : Radix.Decimal;
    },
    { immediate: true },
  );

  let tooltipInterval: NodeJS.Timeout;

  /**
   * 현재 활성화된 탭(단위, 통화, 진법)의 상태를 스왑합니다.
   */
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

  const handleBlur = () => {
    if (showPanelMenu.value) {
      showPanelMenu.value = false;
    }
  };

  // 컴포넌트 라이프사이클 훅
  onMounted(() => {
    // 초기 툴팁 상태 확인
    tooltipInterval = setTimeout(() => {
      swapCurrentTabState();
      setTimeout(() => {
        swapCurrentTabState();
        checkNeedFieldTooltip();
      }, 200);
    }, 200);

    // 이벤트 리스너 등록
    window.addEventListener('resize', checkNeedFieldTooltip);
    window.addEventListener('blur', handleBlur);
  });

  onUnmounted(() => {
    // 이벤트 리스너 및 타이머 정리
    window.removeEventListener('resize', checkNeedFieldTooltip);
    window.removeEventListener('blur', handleBlur);
    clearTimeout(tooltipInterval);
  });

  /**
   * 결과를 클립보드에 복사합니다.
   * @param isOnlyNumber - 'number'인 경우 숫자만 복사, 'result'인 경우 표시된 전체 결과 복사
   */
  const handleCopy = (isOnlyNumber: 'number' | 'result' = 'result') => {
    hapticFeedbackLight();
    const valueToCopy = isOnlyNumber === 'number' ? onlyNumber.value : displayedResult.value;
    const messageKey =
      isOnlyNumber === 'number'
        ? props.field === 'main'
          ? 'copiedOnlyNumber'
          : 'copiedOnlyNumberSub'
        : props.field === 'main'
          ? 'copiedDisplayedResult'
          : 'copiedDisplayedResultSub';

    copyToClipboard(valueToCopy)
      .then(() => showMessage(t(messageKey, { result: valueToCopy })))
      .catch(() => showError(t('failedToPasteFromClipboard')));
  };

  const numberToPaste = ref('');
  const showPanelMenu = ref(false);

  /**
   * 클립보드에서 텍스트를 가져옵니다.
   * @returns 클립보드의 텍스트
   */
  const getClipboardText = async (): Promise<string> => {
    try {
      return $g.isCapacitor
        ? (await window.androidInterface?.getFromClipboard()) ?? ''
        : await navigator.clipboard.readText();
    } catch (error) {
      console.error('클립보드 내용을 가져오는 데 실패했습니다:', error);
      return '';
    }
  };

  /**
   * 메뉴가 열릴 때 클립보드에서 붙여넣을 수 있는 숫자를 업데이트합니다.
   */
  const updateClipboardValue = async () => {
    const clipboardText = await getClipboardText();
    if (currentTab.value === 'radix') {
      const radix = props.field === 'main' ? radixStore.sourceRadix : radixStore.targetRadix;
      numberToPaste.value = calc.filterNumberCharacters(clipboardText, radix);
    } else {
      numberToPaste.value = calc.filterNumberCharacters(clipboardText);
    }
  };

  // 메뉴 열림/닫힘 감시
  watch(showPanelMenu, async (isOpen) => {
    if (isOpen) {
      await updateClipboardValue();
    }
  });

  /**
   * 클립보드의 내용을 결과 필드에 붙여넣습니다.
   * @param target - 붙여넣기 대상 필드 ('main' 또는 'sub')
   */
  const handlePaste = async (target: 'main' | 'sub' = 'main'): Promise<void> => {
    try {
      const clipboardText = await getClipboardText();
      if (!clipboardText) {
        showError(t('clipboardIsEmptyOrContainsDataThatCannotBePasted.'));
        return;
      }
      hapticFeedbackMedium();

      const pasteLogic = {
        unit: () => {
          unitStore.swapUnits();
          calc.pasteToBuffer(clipboardText);
          calc.currentNumber = UnitConverter.convert(
            unitStore.selectedCategory,
            toBigNumber(calc.currentNumber),
            unitStore.sourceUnits[unitStore.selectedCategory] ?? '',
            unitStore.targetUnits[unitStore.selectedCategory] ?? '',
          );
          unitStore.swapUnits();
        },
        currency: () => {
          currencyStore.swapCurrencies();
          calc.pasteToBuffer(clipboardText);
          calc.currentNumber = currencyStore.currencyConverter
            .convert(toBigNumber(calc.currentNumber), currencyStore.sourceCurrency, currencyStore.targetCurrency)
            .toString();
          currencyStore.swapCurrencies();
        },
        radix: () => {
          radixStore.swapRadixes();
          setTimeout(() => {
            calc.pasteToBuffer(clipboardText.replace(/\((?:2|8|10|16)\)/g, ''));
            radixStore.swapRadixes();
          }, 10);
        },
      };

      if (target === 'sub' && currentTab.value in pasteLogic) {
        pasteLogic[currentTab.value as 'unit' | 'currency' | 'radix']();
        showMessage(t('pastedFromClipboardToSubPanel'));
      } else {
        if (currentTab.value === 'radix') {
          setTimeout(() => calc.pasteToBuffer(clipboardText.replace(/\((?:2|8|10|16)\)/g, '')), 10);
        } else {
          calc.pasteToBuffer(clipboardText);
        }
        showMessage(t('pastedFromClipboard'));
      }
    } catch (error) {
      console.error('클립보드 붙여넣기 실패:', error);
      showError(t('failedToPasteFromClipboard'));
    }
  };

  /**
   * @description
   * 현재 필드(메인/서브)에 따라 복사/붙여넣기 키 바인딩을 설정합니다.
   * `uiStore.inputFocused` 상태에 따라 키 바인딩을 동적으로 활성화/비활성화합니다.
   */
  const { subscribe, unsubscribe } =
    props.field === 'main'
      ? useKeyBinding([
          [['Control+c', 'Control+Insert', 'Copy'], () => handleCopy()],
          [['Control+v', 'Shift+Insert', 'Paste'], () => handlePaste('main')],
        ])
      : useKeyBinding([
          [['Shift+Control+c', 'Alt+Control+Insert', 'Shift+Copy'], () => handleCopy()],
          [['Shift+Control+v', 'Alt+Shift+Insert', 'Shift+Paste'], () => handlePaste('sub')],
        ]);

  watch(
    () => uiStore.inputFocused,
    (isFocused) => {
      if (isFocused) {
        unsubscribe();
      } else {
        subscribe();
      }
    },
    { immediate: true },
  );

  const panelPaddingBase = computed(() => {
    if ($g.isWindows) {
      return 14;
    }
    return 8;
  });

  const mainPanelPaddingTop = computed(() => {
    return `${panelPaddingBase.value}px`;
  });

  const mainPanelPaddingBottom = computed(() => {
    return `${Math.floor((panelPaddingBase.value - 4) / 2)}px`;
  });

  const subPanelPaddingTop = computed(() => {
    return `${Math.floor(panelPaddingBase.value - 4)}px`;
  });

  const subPanelPaddingBottom = computed(() => {
    return `${Math.floor((panelPaddingBase.value - 8) / 2)}px`;
  });
  // const resultPanelPadding = computed(() => 12);

  // 메뉴 배경색
  const menuBackgroundColor = computed(() => {
    return themesStore.isDarkMode()
      ? lighten(themesStore.getDarkColor(), 10)
      : lighten(themesStore.getCurrentThemeColors.ui.primary, 90);
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
      :bg-color="panelBackgroundColor"
      :label-slot="isMainField"
      :stack-label="isMainField"
    >
      <template v-if="isMainField && !calcStore.isMemoryVisible" #label>
        <div
          v-auto-blur
          class="noselect"
          :class="[`text-${panelTextColor}`]"
          role="text"
          :aria-label="t('ariaLabel.expression')"
        >
          {{ calculationExpression }}
        </div>
      </template>
      <template v-if="isMainField" #prepend>
        <div
          v-if="!isMemoryEmpty"
          v-auto-blur
          class="noselect full-height q-mt-xs q-pt-sm"
          role="button"
          :aria-label="t('ariaLabel.memory')"
          @click="calcStore.showMemoryTemporarily()"
        >
          <q-icon
            :color="isMainField && calcStore.isMemoryVisible ? memoryTextColor : panelTextColor"
            name="mdi-chip"
            role="img"
            :aria-label="t('ariaLabel.memoryIcon')"
          />
        </div>
        <div
          v-if="operator != '' && !calcStore.isMemoryVisible"
          v-auto-blur
          class="noselect full-height q-mt-xs q-pt-sm"
          :class="[`text-${isMainField && calcStore.isMemoryVisible ? memoryTextColor : panelTextColor}`]"
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
          :class="[`text-${calcStore.isMemoryVisible ? memoryTextColor : panelTextColor}`]"
          :style="
            isMainField
              ? `padding-top: ${mainPanelPaddingTop}; padding-bottom: ${mainPanelPaddingBottom};`
              : `padding-top: ${subPanelPaddingTop}; padding-bottom: ${subPanelPaddingBottom};`
          "
          role="text"
          :aria-label="t('ariaLabel.result', { type: isMainField ? t('ariaLabel.main') : t('ariaLabel.sub') })"
          @click="
            () => {
              showPanelMenu = !showPanelMenu;
              hapticFeedbackLight();
            }
          "
          @contextmenu.prevent="
            () => {
              // 마우스 오른쪽 버튼 클릭 시 메뉴 열기
              showPanelMenu = !showPanelMenu;
            }
          "
        >
          <span v-if="currentTab === 'radix'" id="radixPrefix" role="text" :aria-label="t('ariaLabel.radixPrefix')">{{
            radixPrefix
          }}</span>
          <span v-if="currentTab === 'currency'" id="symbol" role="text" :aria-label="t('ariaLabel.currencySymbol')">{{
            symbol
          }}</span>
          <span :id="isMainField ? 'result' : 'subResult'" role="text" :aria-label="t('ariaLabel.value')">
            {{ calcStore.isMemoryVisible ? memoryValue : result }}
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
          <ToolTip
            v-if="needFieldTooltip"
            :text-color="themesStore.getDarkColor()"
            :bg-color="themesStore.getCurrentThemeColors.ui.warning"
            :text="calcStore.isMemoryVisible ? displayedResultWithMemory : displayedResult"
          />
        </div>
      </template>
      <q-menu
        :model-value="showPanelMenu"
        class="shadow-6"
        auto-close
        no-parent-event
        anchor="bottom right"
        self="top right"
        @update:model-value="
          (val) => {
            showPanelMenu = val;
          }
        "
      >
        <q-list
          dense
          class="noselect q-py-sm"
          style="max-width: 200px"
          :style="{
            backgroundColor: menuBackgroundColor,
          }"
          role="list"
          :dark="themesStore.isDarkMode()"
        >
          <MenuItem :title="t('copyDisplayedResult')" :action="() => handleCopy()" :caption="displayedResult" />
          <MenuItem :title="t('copyOnlyNumber')" :action="() => handleCopy('number')" :caption="onlyNumber" />
          <MenuItem separator />
          <MenuItem :title="t('paste')" :action="() => handlePaste(props.field)" :caption="numberToPaste" />
        </q-list>
      </q-menu>
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

  // 메인 필드의 결과 영역 커서를 기본 커서로 설정
  #mainField,
  #subField {
    cursor: context-menu !important;
  }

  .q-field {
    :deep(.q-field__label) {
      right: -100%;
      text-align: right;
      font-size: 20px;
    }
    :deep(.q-field__control) {
      padding-top: 0px;
    }
  }
</style>

<i18n lang="yaml">
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
