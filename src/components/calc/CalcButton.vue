<script setup lang="ts">
  /**
   * @file CalcButton.vue
   * @description 이 파일은 계산기 버튼을 구성하는 Vue 컴포넌트입니다.
   *              사용자가 다양한 계산 기능을 수행할 수 있도록 버튼을 제공하며,
   *              각 버튼에 대한 동작을 설정합니다.
   *
   * @props {string} type - 버튼의 유형 (기본값: 'calc')
   */

  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { useCalcButtonActions } from '../../composables/useCalcButtonActions';
  import { useCalcButtonStyle } from '../../composables/useCalcButtonStyle';

  import ToolTip from 'src/components/common/ToolTip.vue';

  const props = withDefaults(defineProps<{ type?: string }>(), { type: 'calc' });
  const { t } = useI18n();

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

  const COLUMN_COUNT = 4;

  // 행 수는 버튼 개수에서 그대로 나온다. 예전에는 formula만 7, 나머지는 6으로 적어 두었다.
  const rowCount = computed(() => Math.ceil(Object.keys(activeButtonSet.value).length / COLUMN_COUNT));

  // Android에서는 앱이 WebView 전체의 textZoom(75~125)을 화면 크기에 맞춰 직접 설정한다
  // (DeviceManager.calculateTextZoom). 키패드 레이블은 이미 버튼 상자에 맞춰 커지므로
  // 그 줌을 상쇄하지 않으면 이중으로 확대된다.
  const textZoomCancel = computed(() => (window.globalVars.isCapacitor ? 100 / window.globalVars.textZoom : 1));

  /**
   * 버튼 한 개를 그리는 데 필요한 표시용 값을 한 번에 계산한다.
   * 템플릿에서 같은 조건식을 label/icon/class/style 네 군데에 되풀이하던 것을 모았다.
   */
  const view = computed(() => {
    // 시프트가 켜졌고 보조 레이블 표시가 꺼져 있으면 본 레이블 자리를 확장 기능이 차지한다.
    const shiftActive = calcStore.isShiftPressed && !settingsStore.showButtonAddedLabel;

    return Object.fromEntries(
      Object.entries(activeButtonSet.value).map(([id, button]) => {
        const extended = extendedFunctionSet.value[id];
        const extendedDisabled = resolveDisabled(extended?.isDisabled);
        const swapped = shiftActive && id !== shiftButtonId.value;
        const raw = swapped ? (extended?.label ?? '') : button.label;
        // '@' 접두사는 문자 대신 아이콘으로 그리라는 표시다. 시프트로 바뀐 레이블은 항상 문자.
        const isIcon = !swapped && raw.charAt(0) === '@';
        const style = getFinalButtonStyle(id, button.color as 'important' | 'function' | 'normal', shiftButtonId.value);

        return [
          id,
          {
            isIcon,
            text: isIcon ? raw.slice(1) : raw,
            // 시프트 버튼은 확장 레이블이 빈 문자열이라 보조 레이블을 달지 않는다.
            topLabel: settingsStore.showButtonAddedLabel && extended?.label ? extended.label : '',
            background: style.background,
            color: style.textColor,
            dimmed:
              shiftActive && !extendedDisabled ? false : resolveDisabled(button.isDisabled) || calcStore.isShiftPressed,
            topDimmed: extendedDisabled,
            topShifted: calcStore.isShiftPressed && !extendedDisabled,
          },
        ];
      }),
    );
  });
</script>

<template>
  <q-card-section v-auto-blur class="keypad" :style="{ '--row-count': rowCount, '--text-zoom-cancel': textZoomCancel }">
    <q-btn
      v-for="(button, id) in activeButtonSet"
      :id="'btn-' + id"
      :key="id"
      v-touch-hold.mouse="() => handleLongPress(id)"
      class="shadow-2 noselect button"
      :class="{ 'is-dimmed': view[id]?.dimmed }"
      no-caps
      push
      :style="{ background: view[id]?.background, color: view[id]?.color }"
      :aria-label="getAriaLabel(id, button)"
      @click="() => (resolveDisabled(button.isDisabled) ? displayDisabledButtonNotification() : handleClickBtn(id))"
      @touchstart="() => hapticFeedbackLight()"
    >
      <span
        v-if="view[id]?.topLabel"
        class="top-label"
        :class="{
          'top-label--dimmed': view[id]?.topDimmed,
          'top-label--shifted': view[id]?.topShifted,
        }"
        >{{ view[id]?.topLabel }}</span
      >
      <span class="main-label" :class="{ 'main-label--icon': view[id]?.isIcon }">
        <q-icon v-if="view[id]?.isIcon" :name="view[id]?.text ?? ''" />
        <template v-else>{{ view[id]?.text }}</template>
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
  </q-card-section>
</template>

<style scoped lang="scss">
  // 키패드는 카드에 남은 높이를 그대로 가져가고, 버튼은 그리드 칸을 채운다.
  //
  // 예전에는 JS가 형제 요소들의 높이를 합산해 --base-height를 만들고, CSS가
  // (100vh - base) / 행수 로 버튼 높이를 역산했다. 100vh는 키패드가 실제로 쓸 수
  // 있는 높이가 아니어서 그 차이를 매번 재야 했고(계산기 페이지 5종이 헤더 구성이
  // 제각각이다), 어긋난 값이 글자 크기까지 그대로 전파됐다. 레이아웃 계산을 통째로
  // 브라우저에 넘겨 그 경로를 없앴다.
  .keypad {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(var(--row-count), 1fr);
    gap: 16px;
    padding: 4px 8px 8px;
  }

  .button {
    // 버튼 자신이 글자 크기의 기준 상자가 된다(cqh/cqw). 크기는 그리드 칸에서
    // 오므로 내용이 크기에 영향을 주지 않는 size 컨테인먼트가 안전하다.
    container-type: size;
    min-width: 0;
    min-height: 0;
    padding: 0;
    font-weight: 700;

    :deep(.q-btn__content) {
      height: 100%;
      flex-direction: column;
      flex-wrap: nowrap;
      justify-content: center;
      gap: 2cqh;
    }
  }

  // 글자 크기는 버튼의 높이와 폭을 모두 본다. 높이만 보면 넓은 레이아웃에서 계산기
  // 페인이 창 폭의 절반으로 줄어들 때 글자가 버튼을 넘긴다.
  //
  // 계수는 옛 높이 역산 방식이 실제로 그리던 크기에 맞춰 잡았다(352x604에서 22/15px,
  // 1111x765 넓은 레이아웃에서 33/21px). clamp의 바닥은 가독성을 지키고, 천장은 그보다
  // 큰 창에서 글자만 계속 비대해지는 것을 막는다. 보조 레이블 천장을 본 레이블보다
  // 낮게 둬서 힌트가 본 레이블만큼 커지지 않게 했다.
  .main-label {
    line-height: 1.1;
    font-size: clamp(14px, calc(min(34cqh, 34cqw) * var(--text-zoom-cancel)), 36px);
  }

  // 아이콘은 같은 font-size에서 문자보다 크게 보이므로 계수를 낮춘다.
  .main-label--icon {
    font-size: clamp(12px, calc(min(22cqh, 22cqw) * var(--text-zoom-cancel)), 24px);

    :deep(.q-icon) {
      font-size: inherit;
    }
  }

  .top-label {
    line-height: 1.1;
    color: inherit;
    opacity: 0.7;
    font-size: clamp(9px, calc(min(22cqh, 23cqw) * var(--text-zoom-cancel)), 20px);
  }

  .top-label--dimmed {
    opacity: 0.5;
  }

  .top-label--shifted {
    opacity: 0.85;
  }

  .is-dimmed {
    opacity: 0.6;
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
  ariaLabel:
    backspace: '削除'
    plusMinus: '符号切替'
    divide: '割る'
    multiply: '掛ける'
    subtract: '引く'
    add: '足す'
    equals: '計算する'
    decimal: '小数点'
    shift: 'シフト'
zh:
  cannotDivideByZero: '不能除以零。'
  squareRootOfANegativeNumberIsNotAllowed: '不允许负数的平方根。'
  factorialOfANegativeNumberIsNotAllowed: '不允许负数的阶乘。'
  bitOperationPreprocessingCompleted: '已完成位运算的绝对值整数计算。'
  bitOperationPreprocessingReady: '已准备好位运算的绝对值整数计算。'
  memoryCleared: '已清除内存。'
  memoryRecalled: '已调出内存。'
  memorySaved: '已保存到内存。'
  noMemoryToRecall: '没有可调出的内存。'
  disabledButton: '已禁用的按钮'
  ariaLabel:
    backspace: '退格'
    plusMinus: '切换符号'
    divide: '除'
    multiply: '乘'
    subtract: '减'
    add: '加'
    equals: '计算'
    decimal: '小数点'
    shift: '切换'
hi:
  cannotDivideByZero: 'शून्य से भाग नहीं दिया जा सकता।'
  squareRootOfANegativeNumberIsNotAllowed: 'ऋणात्मक संख्या का वर्गमूल अनुमत नहीं है।'
  factorialOfANegativeNumberIsNotAllowed: 'ऋणात्मक संख्या का क्रमगुणन अनुमत नहीं है।'
  bitOperationPreprocessingCompleted: 'बिट संक्रिया के लिए निरपेक्ष मान पूर्णांक गणना पूरी हुई।'
  bitOperationPreprocessingReady: 'बिट संक्रिया के लिए निरपेक्ष मान पूर्णांक गणना तैयार।'
  memoryCleared: 'मेमोरी साफ़ की गई।'
  memoryRecalled: 'मेमोरी से लोड किया गया।'
  memorySaved: 'मेमोरी में सहेजा गया।'
  noMemoryToRecall: 'लोड करने के लिए कोई मेमोरी नहीं।'
  disabledButton: 'अक्षम बटन'
  ariaLabel:
    backspace: 'मिटाएँ'
    plusMinus: 'चिह्न बदलें'
    divide: 'भाग'
    multiply: 'गुणा'
    subtract: 'घटाएँ'
    add: 'जोड़ें'
    equals: 'गणना करें'
    decimal: 'दशमलव बिंदु'
    shift: 'शिफ्ट'
de:
  cannotDivideByZero: 'Division durch Null ist nicht möglich.'
  squareRootOfANegativeNumberIsNotAllowed: 'Die Quadratwurzel einer negativen Zahl ist nicht erlaubt.'
  factorialOfANegativeNumberIsNotAllowed: 'Die Fakultät einer negativen Zahl ist nicht erlaubt.'
  bitOperationPreprocessingCompleted: 'Vorverarbeitung für Bitoperation als Absolutwert-Ganzzahl abgeschlossen.'
  bitOperationPreprocessingReady: 'Vorverarbeitung für Bitoperation als Absolutwert-Ganzzahl bereit.'
  memoryCleared: 'Speicher gelöscht.'
  memoryRecalled: 'Speicher abgerufen.'
  memorySaved: 'Im Speicher gespeichert.'
  noMemoryToRecall: 'Kein Speicher zum Abrufen.'
  disabledButton: 'Deaktivierte Taste'
  ariaLabel:
    backspace: 'Löschen'
    plusMinus: 'Vorzeichen wechseln'
    divide: 'Dividieren'
    multiply: 'Multiplizieren'
    subtract: 'Subtrahieren'
    add: 'Addieren'
    equals: 'Berechnen'
    decimal: 'Dezimalpunkt'
    shift: 'Umschalten'
es:
  cannotDivideByZero: 'No se puede dividir por cero.'
  squareRootOfANegativeNumberIsNotAllowed: 'La raíz cuadrada de un número negativo no está permitida.'
  factorialOfANegativeNumberIsNotAllowed: 'El factorial de un número negativo no está permitido.'
  bitOperationPreprocessingCompleted: 'Preprocesamiento de operación de bits completado.'
  bitOperationPreprocessingReady: 'Preprocesamiento de operación de bits listo.'
  memoryCleared: 'Memoria borrada.'
  memoryRecalled: 'Memoria recuperada.'
  memorySaved: 'Guardado en memoria.'
  noMemoryToRecall: 'No hay memoria para recuperar.'
  disabledButton: 'Botón desactivado'
  ariaLabel:
    backspace: 'Borrar'
    plusMinus: 'Cambiar signo'
    divide: 'Dividir'
    multiply: 'Multiplicar'
    subtract: 'Restar'
    add: 'Sumar'
    equals: 'Calcular'
    decimal: 'Punto decimal'
    shift: 'Cambiar'
fr:
  cannotDivideByZero: 'Impossible de diviser par zéro.'
  squareRootOfANegativeNumberIsNotAllowed: "La racine carrée d'un nombre négatif n'est pas autorisée."
  factorialOfANegativeNumberIsNotAllowed: "La factorielle d'un nombre négatif n'est pas autorisée."
  bitOperationPreprocessingCompleted: "Prétraitement de l'opération binaire terminé."
  bitOperationPreprocessingReady: "Prétraitement de l'opération binaire prêt."
  memoryCleared: 'Mémoire effacée.'
  memoryRecalled: 'Mémoire rappelée.'
  memorySaved: 'Enregistré en mémoire.'
  noMemoryToRecall: 'Aucune mémoire à rappeler.'
  disabledButton: 'Bouton désactivé'
  ariaLabel:
    backspace: 'Effacer'
    plusMinus: 'Changer le signe'
    divide: 'Diviser'
    multiply: 'Multiplier'
    subtract: 'Soustraire'
    add: 'Ajouter'
    equals: 'Calculer'
    decimal: 'Point décimal'
    shift: 'Basculer'
pt:
  cannotDivideByZero: 'Não é possível dividir por zero.'
  squareRootOfANegativeNumberIsNotAllowed: 'A raiz quadrada de um número negativo não é permitida.'
  factorialOfANegativeNumberIsNotAllowed: 'O fatorial de um número negativo não é permitido.'
  bitOperationPreprocessingCompleted: 'Pré-processamento de operação de bits concluído.'
  bitOperationPreprocessingReady: 'Pré-processamento de operação de bits pronto.'
  memoryCleared: 'Memória limpa.'
  memoryRecalled: 'Memória recuperada.'
  memorySaved: 'Salvo na memória.'
  noMemoryToRecall: 'Nenhuma memória para recuperar.'
  disabledButton: 'Botão desativado'
  ariaLabel:
    backspace: 'Apagar'
    plusMinus: 'Trocar sinal'
    divide: 'Dividir'
    multiply: 'Multiplicar'
    subtract: 'Subtrair'
    add: 'Adicionar'
    equals: 'Calcular'
    decimal: 'Ponto decimal'
    shift: 'Alternar'
ru:
  cannotDivideByZero: 'Деление на ноль невозможно.'
  squareRootOfANegativeNumberIsNotAllowed: 'Квадратный корень из отрицательного числа не допускается.'
  factorialOfANegativeNumberIsNotAllowed: 'Факториал отрицательного числа не допускается.'
  bitOperationPreprocessingCompleted: 'Предварительная обработка для битовой операции завершена.'
  bitOperationPreprocessingReady: 'Предварительная обработка для битовой операции готова.'
  memoryCleared: 'Память очищена.'
  memoryRecalled: 'Память восстановлена.'
  memorySaved: 'Сохранено в память.'
  noMemoryToRecall: 'Нет сохранённой памяти.'
  disabledButton: 'Неактивная кнопка'
  ariaLabel:
    backspace: 'Удалить'
    plusMinus: 'Сменить знак'
    divide: 'Разделить'
    multiply: 'Умножить'
    subtract: 'Вычесть'
    add: 'Сложить'
    equals: 'Вычислить'
    decimal: 'Десятичная точка'
    shift: 'Переключить'
</i18n>
