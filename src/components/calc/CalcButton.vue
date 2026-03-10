<script setup lang="ts">
  /**
   * @file CalcButton.vue
   * @description 이 파일은 계산기 버튼을 구성하는 Vue 컴포넌트입니다.
   *              사용자가 다양한 계산 기능을 수행할 수 있도록 버튼을 제공하며,
   *              각 버튼에 대한 동작을 설정합니다.
   *
   * @props {string} type - 버튼의 유형 (기본값: 'calc')
   */

  import { useI18n } from 'vue-i18n';

  import { useCalcButtonLayout } from '../../composables/useCalcButtonLayout';
  import { useCalcButtonActions } from '../../composables/useCalcButtonActions';
  import { useCalcButtonStyle } from '../../composables/useCalcButtonStyle';

  import { useUIStore } from 'stores/uiStore';

  import ToolTip from 'src/components/common/ToolTip.vue';

  const props = withDefaults(defineProps<{ type?: string }>(), { type: 'calc' });
  const { t } = useI18n();
  const uiStore = useUIStore();

  // 컴포저블 사용
  const { baseHeight, labelScalingFactor, labelSizeAdjustmentRatio, rowCount } = useCalcButtonLayout(
    () => props.type,
    () => uiStore.currentTab,
  );

  const {
    activeButtonSet,
    extendedFunctionSet,
    shiftButtonId,
    tooltipTimers,
    hapticFeedbackLight,
    handleClickBtn,
    handleLongPress,
    displayDisabledButtonNotification,
    getAriaLabel,
    getTooltipsOfKeys,
    resolveDisabled,
  } = useCalcButtonActions(() => props.type, t);

  const { themesStore, calcStore, settingsStore, getFinalButtonStyle } = useCalcButtonStyle();

  const getFinalStyle = (id: string, colorType: 'important' | 'function' | 'normal') =>
    getFinalButtonStyle(id, colorType, shiftButtonId.value);
</script>

<template>
  <q-card-section
    v-auto-blur
    class="row wrap justify-center q-pt-xs q-pb-none q-px-none"
    :style="{
      '--base-height': baseHeight,
      '--label-size-ratio': labelSizeAdjustmentRatio,
      '--label-scale': labelScalingFactor,
      '--row-count': rowCount,
    }"
  >
    <div v-for="(button, id) in activeButtonSet" :key="id" class="col-3 row wrap justify-center q-pa-sm">
      <q-btn
        :id="'btn-' + id"
        v-touch-hold.mouse="() => handleLongPress(id)"
        class="shadow-2 noselect col-12 button"
        no-caps
        push
        :label="
          calcStore.isShiftPressed && !settingsStore.showButtonAddedLabel && id !== shiftButtonId
            ? (extendedFunctionSet[id]?.label ?? '')
            : button.label.charAt(0) === '@'
              ? undefined
              : button.label
        "
        :icon="
          calcStore.isShiftPressed && !settingsStore.showButtonAddedLabel && id !== shiftButtonId
            ? undefined
            : button.label.charAt(0) === '@'
              ? button.label.slice(1)
              : undefined
        "
        :class="[
          calcStore.isShiftPressed && !settingsStore.showButtonAddedLabel && id !== shiftButtonId
            ? 'char'
            : button.label.charAt(0) === '@'
              ? 'icon'
              : 'char',
          calcStore.isShiftPressed &&
          !settingsStore.showButtonAddedLabel &&
          !resolveDisabled(extendedFunctionSet[id]?.isDisabled)
            ? ''
            : resolveDisabled(button.isDisabled) || calcStore.isShiftPressed
              ? 'disabled-button'
              : '',
        ]"
        :style="{
          background: getFinalStyle(String(id), button.color as 'important' | 'function' | 'normal').background,
          color: getFinalStyle(String(id), button.color as 'important' | 'function' | 'normal').textColor,
          paddingTop:
            !settingsStore.showButtonAddedLabel || !(extendedFunctionSet[id]?.label ?? '') ? '4px' : undefined,
        }"
        :aria-label="getAriaLabel(id, button)"
        @click="() => (resolveDisabled(button.isDisabled) ? displayDisabledButtonNotification() : handleClickBtn(id))"
        @touchstart="() => hapticFeedbackLight()"
      >
        <span
          v-if="settingsStore.showButtonAddedLabel && extendedFunctionSet[id]"
          class="top-label"
          :class="[
            `top-label-${button.label.charAt(0) === '@' ? 'icon' : 'char'}`,
            resolveDisabled(extendedFunctionSet[id]?.isDisabled) ? 'disabled-button-added-label' : '',
            calcStore.isShiftPressed && !resolveDisabled(extendedFunctionSet[id]?.isDisabled)
              ? 'shifted-button-added-label'
              : '',
          ]"
        >
          {{ extendedFunctionSet[id].label }}
        </span>
        <q-tooltip
          :model-value="tooltipTimers[id] ?? false"
          no-parent-event
          class="noselect"
          :style="`background: ${themesStore.getButtonColor(button.color as 'normal' | 'important' | 'function')}; border: 2px outset ${themesStore.getButtonColor(button.color as 'normal' | 'important' | 'function')}; border-radius: 10px;`"
          anchor="top middle"
          self="center middle"
          transition-show="jump-up"
          transition-hide="jump-down"
          transition-duration="200"
        >
          {{ extendedFunctionSet[id]?.label ?? '' }}
        </q-tooltip>
        <ToolTip
          :text-color="themesStore.getDarkColor()"
          :bg-color="themesStore.getCurrentThemeColors.ui.warning"
          :text="
            calcStore.isShiftPressed
              ? resolveDisabled(extendedFunctionSet[id]?.isDisabled)
                ? t('disabledButton')
                : getTooltipsOfKeys(id, true)
              : resolveDisabled(activeButtonSet[id]?.isDisabled)
                ? t('disabledButton')
                : getTooltipsOfKeys(id, false)
          "
        />
      </q-btn>
    </div>
  </q-card-section>
</template>

<style scoped lang="scss">
  .button {
    min-height: calc((100vh - var(--base-height)) / var(--row-count) - 20px);
    max-height: calc((100vh - var(--base-height)) / var(--row-count) - 20px);
    font-weight: 700;
    position: relative;
  }

  .icon {
    font-size: calc(((100vh - var(--base-height)) / var(--row-count) - 20px) * 0.25 * var(--label-size-ratio));
    padding-top: calc(
      ((100vh - var(--base-height)) / var(--row-count) - 13px) * 0.27 * var(--label-scale) * var(--label-size-ratio)
    );
  }

  .char {
    font-size: calc(((100vh - var(--base-height)) / var(--row-count) - 20px) * 0.38 * var(--label-size-ratio));
    padding-top: calc(
      ((100vh - var(--base-height)) / var(--row-count) - 13px) * 0.26 * var(--label-scale) * var(--label-size-ratio)
    );
  }

  .top-label {
    text-align: center;
    position: absolute;
    font-size: calc(((100vh - var(--base-height)) / var(--row-count) - 20px) * 0.25 * var(--label-size-ratio));
    color: inherit;
    opacity: 0.7;
    width: 100%;
  }

  .top-label-icon {
    top: 6%;
  }

  .top-label-char {
    top: -6%;
  }

  .disabled-button {
    opacity: 0.6;
  }

  .disabled-button-added-label {
    opacity: 0.5 !important;
  }

  .shifted-button-added-label {
    opacity: 0.85 !important;
  }
</style>

<i18n lang="yaml">
ko:
  cannotDivideByZero: '0으로 나눌 수 없습니다.'
  squareRootOfANegativeNumberIsNotAllowed: '음수의 제곱근은 허용되지 않습니다.'
  factorialOfANegativeNumberIsNotAllowed: '음수의 팩토리얼은 허용되지 않습니다.'
  bitOperationPreprocessingCompleted: '비트 연산을 위해 절대값 정수로 계산을 완료되었습니다.'
  bitOperationPreprocessingReady: '비트 연산을 위해 절대값 정수로 계산을 준비하였습니다.'
  memoryCleared: '메모리를 초기화했습니다.'
  memoryRecalled: '메모리를 불러왔습니다.'
  memorySaved: '메모리에 저장되었습니다.'
  noMemoryToRecall: '불러올 메모리가 없습니다.'
  disabledButton: '비활성화된 버튼'
  formulaEvaluationError: '수식 평가 오류. 수식을 확인해 주세요.'
  ariaLabel:
    backspace: '지우기'
    plusMinus: '부호 바꾸기'
    divide: '나누기'
    multiply: '곱하기'
    subtract: '빼기'
    add: '더하기'
    equals: '계산하기'
    decimal: '소수점'
    shift: '시프트'
en:
  cannotDivideByZero: 'Cannot divide by zero'
  squareRootOfANegativeNumberIsNotAllowed: 'The square root of a negative number is not allowed.'
  factorialOfANegativeNumberIsNotAllowed: 'The factorial of a negative number is not allowed.'
  bitOperationPreprocessingCompleted: 'Bit operation preprocessing completed.'
  bitOperationPreprocessingReady: 'Bit operation preprocessing ready.'
  memoryCleared: 'Memory cleared.'
  memoryRecalled: 'Memory recalled.'
  memorySaved: 'Memory saved.'
  noMemoryToRecall: 'No memory to recall.'
  disabledButton: 'Disabled button'
  formulaEvaluationError: 'Formula evaluation error. Please check your expression.'
  ariaLabel:
    backspace: 'Backspace'
    plusMinus: 'Change sign'
    divide: 'Divide'
    multiply: 'Multiply'
    subtract: 'Subtract'
    add: 'Add'
    equals: 'Calculate'
    decimal: 'Decimal point'
    shift: 'Shift'
ja:
  cannotDivideByZero: 'ゼロで割ることはできません。'
  squareRootOfANegativeNumberIsNotAllowed: '負の数の平方根は許可されていません。'
  factorialOfANegativeNumberIsNotAllowed: '負の数の階乗は許可されていません。'
  bitOperationPreprocessingCompleted: 'ビット演算のために絶対値整数として計算が完了しました。'
  bitOperationPreprocessingReady: 'ビット演算のために絶対値整数として計算を準備しました。'
  memoryCleared: 'メモリをリセットしました。'
  memoryRecalled: 'メモリを読み込みました。'
  memorySaved: 'メモリに保存しました。'
  noMemoryToRecall: '読み込むメモリがありません。'
  disabledButton: '無効なボタン'
  formulaEvaluationError: '数式評価エラー。数式を確認してください。'
</i18n>
