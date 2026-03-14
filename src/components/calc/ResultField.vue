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
  import { ref, computed, onMounted, watch, onUnmounted, onBeforeUnmount, nextTick, useTemplateRef } from 'vue';
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
  import { UnitConverter } from 'src/core/converters/UnitConverter';
  import { toBigNumber } from 'src/core/calculator/CalculatorMath';
  import { Radix } from 'src/core/converters/RadixConverter';
  import { useKeyBinding } from '../../composables/useKeyBinding';

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
  import MenuItem from 'components/common/MenuItem.vue';
  import ToolTip from 'src/components/common/ToolTip.vue';
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
  const fieldElementRef = useTemplateRef<HTMLElement>('fieldElementRef');
  const needFieldTooltip = ref(false);

  /**
   * 필드 툴팁 표시 여부를 결정하는 함수
   *
   * @description
   * - 필드 요소의 실제 너비(offsetWidth)가 내용 너비(scrollWidth)보다 작은 경우 텍스트가 넘친 것으로 판단
   * - DOM 업데이트가 완료된 후 정확한 크기를 측정하기 위해 nextTick 사용
   * - 정확한 측정을 위해 requestAnimationFrame을 사용하여 렌더링 완료 후 체크
   * @returns 넘침 상태 체크 성공 여부
   */
  const checkNeedFieldTooltip = async (): Promise<boolean> => {
    // DOM 업데이트가 완료될 때까지 대기
    await nextTick();

    // 브라우저 렌더링이 완료될 때까지 대기 (레이아웃 계산 완료 보장)
    return new Promise<boolean>((resolve) => {
      requestAnimationFrame(() => {
        const element = fieldElementRef.value || document.getElementById(fieldID);

        if (!element) {
          resolve(false);
          return;
        }

        // 요소의 실제 표시 너비와 스크롤 가능한 전체 너비를 비교
        // offsetWidth: 요소의 표시 너비 (padding 포함, 스크롤바 제외)
        // scrollWidth: 요소의 내용 전체 너비 (스크롤 가능한 너비)
        const isOverflowing = element.offsetWidth < element.scrollWidth;

        // 상태가 실제로 변경된 경우에만 업데이트 (불필요한 반응성 트리거 방지)
        if (needFieldTooltip.value !== isOverflowing) {
          needFieldTooltip.value = isOverflowing;
        }

        resolve(true);
      });
    });
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

      // 소수점 자릿수 설정이 -1이고 소수점이 있는 경우
      const hasSpecialDecimalPlaces = Number(settingsStore.getCurrentDecimalPlaces) === -1 && inputBuffer.includes('.');

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

  /**
   * 표시될 결과 문자열을 생성하는 헬퍼 함수
   * @param value - 표시할 값 (result 또는 memoryValue)
   * @returns 포맷된 결과 문자열
   * @description
   * - 진법 접두사, 통화 기호, 값, 단위를 순서대로 연결
   * - 진법 접미사 조건에 따라 접미사 추가
   */
  const formatDisplayResult = (value: string): string => {
    // 기본 문자열 구성: 접두사 + 기호 + 값 + 단위
    const baseString = `${radixPrefix.value}${symbol.value}${value}${unit.value}`;

    // 진법 접미사 표시 조건 확인
    const shouldShowSuffix = currentTab.value === 'radix' && radixStore.showRadix && radixStore.radixType === 'suffix';

    // 접미사 추가 여부에 따라 최종 문자열 반환
    return shouldShowSuffix ? `${baseString}(${radixSuffix.value})` : baseString;
  };

  /**
   * 일반 결과값을 포함한 표시 문자열
   * @returns 포맷된 결과 문자열
   */
  const displayedResult = computed(() => formatDisplayResult(result.value));

  /**
   * 메모리 값을 포함한 표시 문자열
   * @returns 포맷된 메모리 결과 문자열
   */
  const displayedResultWithMemory = computed(() => formatDisplayResult(memoryValue.value));

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
    // 메모리에서 숫자 가져오기
    const rawMemoryNumber = calc.memory.getNumber();

    // 메모리가 비어있으면 빈 문자열 반환
    if (!rawMemoryNumber || rawMemoryNumber === '') {
      return '';
    }

    if (isMainField) {
      try {
        const convertedNumber = radixStore.convertIfRadix(rawMemoryNumber);
        return calcStore.toFormattedNumber(convertedNumber, radixStore.sourceRadix);
      } catch (error) {
        // 진법 변환 실패 시 빈 문자열 반환
        console.warn('Failed to convert radix for memory value:', error);
        return '';
      }
    } else {
      switch (props.addon) {
        case 'unit': {
          const convertedNumber = UnitConverter.convert(
            unitStore.selectedCategory,
            toBigNumber(rawMemoryNumber), // 메모리 값을 변환 대상으로 사용
            unitStore.sourceUnits[unitStore.selectedCategory] ?? '', // 또는 targetUnit에 맞춰야 할 수도 있음
            unitStore.targetUnits[unitStore.selectedCategory] ?? '',
          );
          return calcStore.toFormattedNumber(convertedNumber);
        }
        case 'currency': {
          const convertedNumber = currencyStore.currencyConverter
            .convert(
              toBigNumber(rawMemoryNumber), // 메모리 값을 변환 대상으로 사용
              currencyStore.sourceCurrency, // 또는 targetCurrency에 맞춰야 할 수도 있음
              currencyStore.targetCurrency,
            )
            .toFixed();
          return calcStore.toFormattedNumber(convertedNumber);
        }
        case 'radix': {
          try {
            const convertedNumber = radixStore.convertRadix(
              radixStore.convertIfRadix(rawMemoryNumber), // 메모리 값을 변환 대상으로 사용
              radixStore.sourceRadix, // 또는 targetRadix에 맞춰야 할 수도 있음
              radixStore.targetRadix,
            );
            return calcStore.toFormattedNumber(convertedNumber, radixStore.targetRadix);
          } catch (error) {
            // 진법 변환 실패 시 빈 문자열 반환
            console.warn('Failed to convert radix for memory value:', error);
            return '';
          }
        }
        default:
          return calcStore.toFormattedNumber(rawMemoryNumber); // 변환 없이 포맷팅만 적용
      }
    }
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
    const lastRecord = calcRecord.getCount() > 0 ? calcRecord.getAllRecords()[0] : null;
    const needsReset = calc.needsBufferReset;

    // 수식 기록: 결과값이 현재 표시값과 일치하면 표시 (needsReset 불문)
    if (lastRecord?.expression && calc.currentNumber === lastRecord.calculationResult.resultNumber) {
      return `${calcStore.getLeftSideInRecord(lastRecord.calculationResult, false, lastRecord.expression)} =`;
    }

    // 일반 기록: needsReset이고 결과값이 현재 표시값과 일치할 때 표시
    if (lastRecord != null && needsReset && calc.currentNumber === lastRecord.calculationResult.resultNumber) {
      return `${calcStore.getLeftSideInRecord(lastRecord.calculationResult)} =`;
    }

    // 연산자 입력 중 (아직 계산 전)
    if (operator.value !== '' && !needsReset) {
      const radix = currentTab.value === 'radix' ? radixStore.sourceRadix : Radix.Decimal;
      const converted = calcStore.toFormattedNumber(radixStore.convertIfRadix(calc.previousNumber), radix);
      return currentTab.value === 'radix' ? getRadixResult(converted) : converted;
    }

    return '';
  });

  // 결과 색상 관련 computed 속성 (themesStore 사용)
  const panelNormalTextColor = computed(() => themesStore.getPanelColor('text', 'normal'));
  const panelNormalTextColorAccent = computed(() => themesStore.getPanelColor('text', 'normal', true));
  const panelWarningTextColor = computed(() => themesStore.getPanelColor('text', 'warning'));
  const panelWarningTextColorAccent = computed(() => themesStore.getPanelColor('text', 'warning', true));
  const panelNormalBackgroundColor = computed(() => themesStore.getPanelColor('background', 'normal'));
  const panelWarningBackgroundColor = computed(() => themesStore.getPanelColor('background', 'warning'));

  // 결과 색상 선택 함수 (실제 색상 값을 반환하도록 수정)
  const panelTextColor = computed(() => {
    return needFieldTooltip.value ? panelWarningTextColor.value : panelNormalTextColor.value; // 텍스트가 넘치면 경고색
  });

  // 메모리 값 표시를 위한 텍스트 색상
  const memoryTextColor = computed(() => {
    return needFieldTooltip.value ? panelWarningTextColorAccent.value : panelNormalTextColorAccent.value;
  });

  const panelBackgroundColor = computed(() => {
    return needFieldTooltip.value ? panelWarningBackgroundColor.value : panelNormalBackgroundColor.value;
  });

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
      // 탭 변경 시 넘침 상태 재확인
      checkNeedFieldTooltip();
    },
    { immediate: true },
  );

  /**
   * 표시된 결과 문자열 변경 시 넘침 상태 확인
   * - displayedResult와 displayedResultWithMemory는 result, symbol, unit, radixPrefix, radixSuffix를 모두 포함하므로
   *   이 두 속성만 감시하면 모든 관련 속성 변경을 감지할 수 있음
   * - 메모리 표시 상태 변경 시에도 확인
   */
  watch(
    [displayedResult, displayedResultWithMemory, () => calcStore.isMemoryVisible],
    () => {
      // 에러가 발생할 수 있으므로 try-catch로 감싸기
      try {
        checkNeedFieldTooltip();
      } catch (error) {
        // 넘침 상태 체크 실패 시 로그만 남기고 계속 진행
        console.warn('Failed to check field tooltip:', error);
      }
    },
    { flush: 'post' }, // DOM 업데이트 후 실행
  );

  // ResizeObserver와 이벤트 리스너 관리
  let resizeObserver: ResizeObserver | null = null;
  let windowResizeHandler: (() => void) | null = null;

  /**
   * ResizeObserver 초기화 함수
   * 필드 요소에 대한 크기 변경 감지 시작
   */
  const initializeResizeObserver = () => {
    // 기존 observer가 있으면 정리
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    const element = fieldElementRef.value || document.getElementById(fieldID);
    if (element) {
      resizeObserver = new ResizeObserver(() => {
        checkNeedFieldTooltip();
      });
      resizeObserver.observe(element);
    }
  };

  // 컴포넌트 마운트 후 초기 설정
  onMounted(async () => {
    // DOM 업데이트 완료 대기
    await nextTick();

    // 초기 넘침 상태 체크 (DOM 렌더링 완료 후 실행)
    requestAnimationFrame(() => {
      checkNeedFieldTooltip();
    });

    // ResizeObserver 초기화
    initializeResizeObserver();

    // 윈도우 리사이즈 이벤트 리스너 등록
    windowResizeHandler = () => {
      checkNeedFieldTooltip();
    };
    window.addEventListener('resize', windowResizeHandler);

    // 창이 포커스를 잃었을 때 메뉴를 닫기 위한 이벤트 리스너 등록
    window.addEventListener('blur', () => {
      // 결과 패널 메뉴가 열려 있다면 닫음
      if (showPanelMenu.value) {
        showPanelMenu.value = false;
      }
    });
  });

  /**
   * fieldElementRef가 설정된 후 ResizeObserver 초기화
   */
  watch(
    () => fieldElementRef.value,
    (newElement) => {
      if (newElement && !resizeObserver) {
        initializeResizeObserver();
      }
    },
    { immediate: true },
  );

  // 컴포넌트 언마운트 시 리소스 정리
  onUnmounted(() => {
    // ResizeObserver 정리
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    // 윈도우 리사이즈 이벤트 리스너 제거
    if (windowResizeHandler) {
      window.removeEventListener('resize', windowResizeHandler);
      windowResizeHandler = null;
    }

    // blur 이벤트 리스너 제거
    window.removeEventListener('blur', () => {
      if (showPanelMenu.value) {
        showPanelMenu.value = false;
      }
    });
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
  const { subscribe, unsubscribe } =
    props.field === 'main'
      ? useKeyBinding([
          [['Control+c', 'Control+Insert', 'Copy'], handleCopy],
          [['Control+v', 'Shift+Insert', 'Paste'], () => handlePaste('main')],
        ])
      : useKeyBinding([
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
        unsubscribe();
      } else {
        subscribe();
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    subscribe();
  });

  onBeforeUnmount(() => {
    unsubscribe();
  });

  // 결과 패널 패딩 설정
  // const resultPanelPadding = computed(() => calcStore.resultPanelPadding);
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
          v-if="operator != '' && !calcStore.isMemoryVisible && currentTab !== 'formula'"
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
          ref="fieldElementRef"
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
          (val: boolean) => {
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
    min-width: 2ch;
    /* 2글자 폭 확보 */
    display: inline-block;
    /* 폭 설정을 위해 필요 */
    text-align: left;
    /* 왼쪽 정렬 (선택사항) */
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
ja:
  copiedDisplayedResult: '表示された結果がコピーされました。<br><center>{result}</center>'
  copiedDisplayedResultSub: 'サブパネルの結果がコピーされました。<br><center>{result}</center>'
  copyDisplayedResult: '表示された結果をコピー'
  copiedOnlyNumber: '結果の数値がコピーされました。<br><center>{result}</center>'
  copiedOnlyNumberSub: 'サブパネルの結果数値がコピーされました。<br><center>{result}</center>'
  copyOnlyNumber: '結果の数値をコピー'
  pastedFromClipboard: 'クリップボードから数値を貼り付けました。'
  pastedFromClipboardToSubPanel: 'クリップボードから数値を<br>サブパネルに貼り付けました。'
  clipboardIsEmptyOrContainsDataThatCannotBePasted: 'クリップボードが空か、貼り付けできないデータが含まれています。'
  failedToPasteFromClipboard: 'クリップボードからの貼り付けに失敗しました。'
  paste: '貼り付け'
  ariaLabel:
    resultField: '{type} 結果フィールド'
    main: 'メイン'
    sub: 'サブ'
    expression: '計算式'
    memory: 'メモリ値表示'
    memoryIcon: 'メモリアイコン'
    operator: '現在の演算子: {operator}'
    operatorIcon: '{operator} 演算子アイコン'
    result: '{type} 結果値'
    value: '計算結果'
    radixPrefix: '基数接頭辞'
    radixSuffix: '基数接尾辞'
    currencySymbol: '通貨記号'
    unit: '単位'
    contextMenu: '結果コピーメニュー'
zh:
  copiedDisplayedResult: '已复制显示的结果。<br><center>{result}</center>'
  copiedDisplayedResultSub: '已复制副面板的结果。<br><center>{result}</center>'
  copyDisplayedResult: '复制显示的结果'
  copiedOnlyNumber: '已复制结果数字。<br><center>{result}</center>'
  copiedOnlyNumberSub: '已复制副面板的结果数字。<br><center>{result}</center>'
  copyOnlyNumber: '复制结果数字'
  pastedFromClipboard: '已从剪贴板粘贴数字。'
  pastedFromClipboardToSubPanel: '已从剪贴板将数字<br>粘贴到副面板。'
  clipboardIsEmptyOrContainsDataThatCannotBePasted: '剪贴板为空或包含无法粘贴的数据。'
  failedToPasteFromClipboard: '从剪贴板粘贴失败。'
  paste: '粘贴'
  ariaLabel:
    resultField: '{type} 结果字段'
    main: '主'
    sub: '副'
    expression: '计算表达式'
    memory: '显示内存值'
    memoryIcon: '内存图标'
    operator: '当前运算符: {operator}'
    operatorIcon: '{operator} 运算符图标'
    result: '{type} 结果值'
    value: '计算结果'
    radixPrefix: '进制前缀'
    radixSuffix: '进制后缀'
    currencySymbol: '货币符号'
    unit: '单位'
    contextMenu: '结果复制菜单'
hi:
  copiedDisplayedResult: 'प्रदर्शित परिणाम कॉपी किया गया।<br><center>{result}</center>'
  copiedDisplayedResultSub: 'उप पैनल का परिणाम कॉपी किया गया।<br><center>{result}</center>'
  copyDisplayedResult: 'प्रदर्शित परिणाम कॉपी करें'
  copiedOnlyNumber: 'परिणाम संख्या कॉपी की गई।<br><center>{result}</center>'
  copiedOnlyNumberSub: 'उप पैनल की परिणाम संख्या कॉपी की गई।<br><center>{result}</center>'
  copyOnlyNumber: 'परिणाम संख्या कॉपी करें'
  pastedFromClipboard: 'क्लिपबोर्ड से संख्या चिपकाई गई।'
  pastedFromClipboardToSubPanel: 'क्लिपबोर्ड से संख्या<br>उप पैनल में चिपकाई गई।'
  clipboardIsEmptyOrContainsDataThatCannotBePasted: 'क्लिपबोर्ड खाली है या ऐसा डेटा है जो चिपकाया नहीं जा सकता।'
  failedToPasteFromClipboard: 'क्लिपबोर्ड से चिपकाने में विफल।'
  paste: 'चिपकाएँ'
  ariaLabel:
    resultField: '{type} परिणाम फ़ील्ड'
    main: 'मुख्य'
    sub: 'उप'
    expression: 'गणना अभिव्यक्ति'
    memory: 'मेमोरी मान दिखाएँ'
    memoryIcon: 'मेमोरी आइकन'
    operator: 'वर्तमान ऑपरेटर: {operator}'
    operatorIcon: '{operator} ऑपरेटर आइकन'
    result: '{type} परिणाम मान'
    value: 'गणना परिणाम'
    radixPrefix: 'आधार उपसर्ग'
    radixSuffix: 'आधार प्रत्यय'
    currencySymbol: 'मुद्रा प्रतीक'
    unit: 'इकाई'
    contextMenu: 'परिणाम कॉपी मेनू'
de:
  copiedDisplayedResult: 'Das angezeigte Ergebnis wurde kopiert.<br><center>{result}</center>'
  copiedDisplayedResultSub: 'Das Ergebnis des Nebenpanels wurde kopiert.<br><center>{result}</center>'
  copyDisplayedResult: 'Angezeigtes Ergebnis kopieren'
  copiedOnlyNumber: 'Die Ergebnisnummer wurde kopiert.<br><center>{result}</center>'
  copiedOnlyNumberSub: 'Die Ergebnisnummer des Nebenpanels wurde kopiert.<br><center>{result}</center>'
  copyOnlyNumber: 'Ergebnisnummer kopieren'
  pastedFromClipboard: 'Nummer aus der Zwischenablage eingefügt.'
  pastedFromClipboardToSubPanel: 'Nummer aus der Zwischenablage<br>in das Nebenpanel eingefügt.'
  clipboardIsEmptyOrContainsDataThatCannotBePasted: 'Die Zwischenablage ist leer oder enthält nicht einfügbare Daten.'
  failedToPasteFromClipboard: 'Einfügen aus der Zwischenablage fehlgeschlagen.'
  paste: 'Einfügen'
  ariaLabel:
    resultField: '{type} Ergebnisfeld'
    main: 'Haupt'
    sub: 'Neben'
    expression: 'Berechnungsausdruck'
    memory: 'Speicherwert anzeigen'
    memoryIcon: 'Speichersymbol'
    operator: 'Aktueller Operator: {operator}'
    operatorIcon: '{operator} Operatorsymbol'
    result: '{type} Ergebniswert'
    value: 'Berechnungsergebnis'
    radixPrefix: 'Zahlensystem-Präfix'
    radixSuffix: 'Zahlensystem-Suffix'
    currencySymbol: 'Währungssymbol'
    unit: 'Einheit'
    contextMenu: 'Ergebnis-Kopiermenü'
es:
  copiedDisplayedResult: 'El resultado mostrado ha sido copiado.<br><center>{result}</center>'
  copiedDisplayedResultSub: 'El resultado del panel secundario ha sido copiado.<br><center>{result}</center>'
  copyDisplayedResult: 'Copiar resultado mostrado'
  copiedOnlyNumber: 'El número del resultado ha sido copiado.<br><center>{result}</center>'
  copiedOnlyNumberSub: 'El número del resultado del panel secundario ha sido copiado.<br><center>{result}</center>'
  copyOnlyNumber: 'Copiar número del resultado'
  pastedFromClipboard: 'Se pegó el número desde el portapapeles.'
  pastedFromClipboardToSubPanel: 'Se pegó el número desde el portapapeles<br>al panel secundario.'
  clipboardIsEmptyOrContainsDataThatCannotBePasted: 'El portapapeles está vacío o contiene datos que no se pueden pegar.'
  failedToPasteFromClipboard: 'Error al pegar desde el portapapeles.'
  paste: 'Pegar'
  ariaLabel:
    resultField: 'Campo de resultado {type}'
    main: 'principal'
    sub: 'secundario'
    expression: 'Expresión de cálculo'
    memory: 'Mostrar valor de memoria'
    memoryIcon: 'Icono de memoria'
    operator: 'Operador actual: {operator}'
    operatorIcon: 'Icono de operador {operator}'
    result: 'Valor de resultado {type}'
    value: 'Resultado del cálculo'
    radixPrefix: 'Prefijo de base'
    radixSuffix: 'Sufijo de base'
    currencySymbol: 'Símbolo de moneda'
    unit: 'Unidad'
    contextMenu: 'Menú de copia de resultado'
fr:
  copiedDisplayedResult: 'Le résultat affiché a été copié.<br><center>{result}</center>'
  copiedDisplayedResultSub: 'Le résultat du panneau secondaire a été copié.<br><center>{result}</center>'
  copyDisplayedResult: 'Copier le résultat affiché'
  copiedOnlyNumber: 'Le nombre du résultat a été copié.<br><center>{result}</center>'
  copiedOnlyNumberSub: 'Le nombre du résultat du panneau secondaire a été copié.<br><center>{result}</center>'
  copyOnlyNumber: 'Copier le nombre du résultat'
  pastedFromClipboard: 'Le nombre a été collé depuis le presse-papiers.'
  pastedFromClipboardToSubPanel: 'Le nombre a été collé depuis le presse-papiers<br>dans le panneau secondaire.'
  clipboardIsEmptyOrContainsDataThatCannotBePasted: 'Le presse-papiers est vide ou contient des données non collables.'
  failedToPasteFromClipboard: 'Échec du collage depuis le presse-papiers.'
  paste: 'Coller'
  ariaLabel:
    resultField: 'Champ de résultat {type}'
    main: 'principal'
    sub: 'secondaire'
    expression: 'Expression de calcul'
    memory: 'Afficher la valeur mémoire'
    memoryIcon: 'Icône mémoire'
    operator: 'Opérateur actuel : {operator}'
    operatorIcon: 'Icône opérateur {operator}'
    result: 'Valeur de résultat {type}'
    value: 'Résultat du calcul'
    radixPrefix: 'Préfixe de base'
    radixSuffix: 'Suffixe de base'
    currencySymbol: 'Symbole de devise'
    unit: 'Unité'
    contextMenu: 'Menu de copie du résultat'
</i18n>
