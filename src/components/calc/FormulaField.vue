<script setup lang="ts">
  /**
   * @file FormulaField.vue
   * @description 수식 계산기의 수식 입력 필드 컴포넌트입니다.
   *              표시 모드(읽기 전용)와 편집 모드(인라인 입력)를 전환하며,
   *              편집 모드에서는 ? 아이콘으로 mathjs 참조 메뉴를 제공합니다.
   */

  import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
  import { useTemplateRef } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { useFormulaStore } from 'src/stores/formulaStore';
  import { useThemesStore } from 'stores/themesStore';
  import { useUIStore } from 'stores/uiStore';
  import { useKeyBinding } from 'src/composables/useKeyBinding';
  import { showError } from 'src/utils/NotificationUtils';

  const { t } = useI18n();
  const formulaStore = useFormulaStore();
  const themesStore = useThemesStore();
  const uiStore = useUIStore();

  const inputRef = useTemplateRef<{ focus(): void }>('inputRef');
  const editContainerRef = useTemplateRef<HTMLElement>('editContainer');
  const innerTextRef = useTemplateRef<HTMLElement>('innerText');

  const isEditing = computed(() => formulaStore.isEditDialogOpen);

  // 표시 모드 텍스트 오버플로우 감지 (오른쪽 정렬 → 왼쪽 클리핑)
  const overflowLeft = ref(false);
  const checkOverflow = () => {
    const el = innerTextRef.value;
    overflowLeft.value = !!el && el.scrollWidth > el.clientWidth;
  };

  watch([() => formulaStore.expression, isEditing], () => nextTick(checkOverflow));

  onMounted(() => {
    window.addEventListener('resize', checkOverflow);
    nextTick(checkOverflow);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', checkOverflow);
  });

  const displayExpression = computed(() => formulaStore.expression || t('expressionPlaceholder'));

  const isExpressionEmpty = computed(() => !formulaStore.expression);

  const isWarning = computed(() => !isExpressionEmpty.value && !formulaStore.isExpressionValid());

  const fieldBgColor = computed(() =>
    isWarning.value
      ? themesStore.getPanelColor('background', 'warning')
      : isBrowsingHistory.value
        ? themesStore.isDarkMode()
          ? 'blue-10'
          : 'blue-1'
        : themesStore.getPanelColor('background', 'normal'),
  );
  const fieldTextColor = computed(() =>
    isWarning.value ? themesStore.getPanelColor('text', 'warning') : themesStore.getPanelColor('text', 'normal'),
  );

  const exitEditing = () => {
    formulaStore.closeEditDialog(); // isHelpOpen도 함께 닫힘
    uiStore.inputFocused = false;
  };

  const startEditing = () => {
    formulaStore.openEditDialog();
    uiStore.inputFocused = true;
    nextTick(() => inputRef.value?.focus());
  };

  const evaluateAndClose = () => {
    // Enter keydown으로 편집 모드 진입 직후 Enter keyup 무시
    if (Date.now() - formulaStore._editOpenedAt < 200) return;
    if (!formulaStore.expression.trim()) {
      exitEditing();
      return;
    }
    try {
      formulaStore.evaluate();
    } catch {
      showError(t('formulaEvaluationError'));
    }
    exitEditing();
  };

  const cancelEdit = () => {
    formulaStore.clearExpression();
    exitEditing();
  };

  // 히스토리 탐색 중 여부
  const isBrowsingHistory = computed(() => formulaStore.historyIndex >= 0);

  // 사용자가 수식을 직접 편집하면 히스토리 탐색 리셋
  // flush: 'sync' → expression 변경 즉시 실행 (_isNavigating이 true인 동안 감지)
  watch(
    () => formulaStore.expression,
    () => {
      if (isBrowsingHistory.value && !formulaStore._isNavigating) {
        formulaStore.resetHistory();
      }
    },
    { flush: 'sync' },
  );

  // 편집 모드 키 처리
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === '=') {
      event.preventDefault();
      evaluateAndClose();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      formulaStore.historyUp();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();
      formulaStore.historyDown();
    }
  };

  // 포커스 아웃 시 편집 종료 (평가하지 않음 — 평가는 Enter에서만)
  const handleBlur = (event: Event) => {
    // 편집 모드 진입 직후 blur 무시 (외부에서 openEditDialog 호출 시 포커스 경합 방지)
    if (Date.now() - formulaStore._editOpenedAt < 300) return;
    const relatedTarget = (event as FocusEvent).relatedTarget as Node | null;
    const container = editContainerRef.value;
    // 포커스가 컴포넌트 내부(도움말 버튼 등)로 이동한 경우 유지
    if (relatedTarget && container?.contains(relatedTarget)) return;
    // 도움말 메뉴가 열려 있는 경우 유지 (메뉴는 body에 텔레포트됨)
    if (formulaStore.isHelpOpen) return;
    exitEditing();
  };

  // 도움말 메뉴가 닫힌 후 포커스가 컴포넌트 밖에 있으면 편집 종료
  watch(
    () => formulaStore.isHelpOpen,
    (val) => {
      if (!val && isEditing.value) {
        const container = editContainerRef.value;
        if (!container?.contains(document.activeElement)) {
          exitEditing();
        }
      }
    },
  );

  const helpItems = computed(() => [
    { label: t('help.arithmetic'), items: ['+', '-', '*', '/', '^', '%'] },
    {
      label: t('help.functions'),
      items: [
        'sqrt(x)',
        'nthRoot(x,n)',
        'abs(x)',
        'floor(x)',
        'ceil(x)',
        'round(x)',
        'ln(x)',
        'log(x)',
        'log(x,b)',
        'exp(x)',
      ],
    },
    { label: t('help.trig'), items: ['sin(x)', 'cos(x)', 'tan(x)', 'asin(x)', 'acos(x)', 'atan(x)', 'atan2(y,x)'] },
    { label: t('help.constants'), items: ['pi', 'e', 'phi', 'Infinity'] },
    { label: t('help.other'), items: ['factorial(n)', 'gcd(a,b)', 'lcm(a,b)', 'mod(a,b)', 'sign(x)', 'fix(x)'] },
  ]);

  const appendFromHelp = (item: string) => {
    formulaStore.append(item.endsWith(')') ? item.slice(0, -1) : item);
    nextTick(() => inputRef.value?.focus());
  };

  // Space → 편집 모드 진입
  const { subscribe, unsubscribe } = useKeyBinding([[['Space'], startEditing]]);

  // 편집 상태에 따라 Space 단축키 활성화/비활성화
  watch(
    () => formulaStore.isEditDialogOpen,
    (isOpen) => {
      if (isOpen) {
        unsubscribe();
        // 외부(RecordCard 등)에서 편집 모드 진입 시에도 포커스 보장
        // q-input 렌더링 완료 후 포커스 (이중 nextTick으로 Quasar 내부 초기화 대기)
        nextTick(() => nextTick(() => inputRef.value?.focus()));
      } else {
        subscribe();
      }
    },
    { immediate: true },
  );
</script>

<template>
  <q-card-section class="q-py-xs q-px-sm">
    <!-- mathjs 참조 메뉴 (FC ? 버튼으로 토글, q-card-section에 앵커) -->
    <q-menu
      v-model="formulaStore.isHelpOpen"
      anchor="bottom left"
      self="top left"
      :offset="[0, 4]"
      no-parent-event
      class="formula-help-menu"
    >
      <q-card flat class="q-pa-sm">
        <div class="text-caption text-weight-bold q-mb-sm">{{ t('help.title') }}</div>
        <!-- @/$ 변수 안내 -->
        <div class="row items-center q-gutter-xs q-mb-xs">
          <q-chip dense square outline size="sm" label="@" clickable @click="appendFromHelp('@')" />
          <span class="text-caption help-group-label">{{ t('help.atHint') }}</span>
        </div>
        <div class="row items-center q-gutter-xs q-mb-sm">
          <q-chip dense square outline size="sm" label="$" clickable @click="appendFromHelp('$')" />
          <span class="text-caption help-group-label">{{ t('help.dollarHint') }}</span>
        </div>
        <div class="text-caption help-group-label q-mb-sm">
          <a href="https://mathjs.org/docs/expressions/syntax.html" target="_blank" class="text-primary">
            {{ t('help.docsLink') }}
          </a>
        </div>
        <q-separator class="q-mb-sm" />
        <div v-for="group in helpItems" :key="group.label" class="q-mb-xs">
          <div class="text-caption text-weight-medium q-mb-xs help-group-label">
            {{ group.label }}
          </div>
          <div class="row wrap q-gutter-xs q-mb-xs">
            <q-chip
              v-for="item in group.items"
              :key="item"
              dense
              square
              outline
              size="sm"
              :label="item"
              clickable
              @click="appendFromHelp(item)"
            />
          </div>
        </div>
      </q-card>
    </q-menu>

    <!-- 표시 모드 -->
    <div v-if="!isEditing" class="cursor-pointer" :title="t('editExpression')" @click="startEditing">
      <q-field
        class="shadow-1 formula-expression-field"
        filled
        dense
        readonly
        :dark="false"
        :bg-color="fieldBgColor"
        :aria-label="t('ariaLabel.expressionField')"
      >
        <template #prepend>
          <q-btn
            v-if="!isExpressionEmpty"
            flat
            round
            dense
            icon="close"
            size="sm"
            class="formula-clear-btn"
            :color="fieldTextColor"
            :title="t('clearExpression')"
            @click.stop="formulaStore.clearExpression()"
          />
        </template>
        <template #control>
          <div class="row items-center no-wrap full-width full-height overflow-hidden q-pt-xs">
            <span v-if="overflowLeft" class="formula-overflow-indicator">...</span>
            <div
              ref="innerText"
              class="col no-outline text-right noselect formula-expression-text"
              :class="[isExpressionEmpty ? 'formula-expression-placeholder' : '', `text-${fieldTextColor}`]"
            >
              {{ displayExpression }}
            </div>
          </div>
        </template>
      </q-field>
    </div>

    <!-- 편집 모드 -->
    <div v-else ref="editContainer">
      <q-input
        ref="inputRef"
        v-model="formulaStore.expression"
        class="shadow-1 formula-expression-field"
        input-class="text-right"
        filled
        dense
        autofocus
        :dark="false"
        :bg-color="fieldBgColor"
        :color="fieldTextColor"
        :aria-label="t('ariaLabel.expressionField')"
        @keyup.enter="evaluateAndClose"
        @keyup.esc="cancelEdit"
        @keydown="handleKeydown"
        @blur="handleBlur"
      >
        <template v-if="!isExpressionEmpty || isBrowsingHistory" #prepend>
          <q-btn
            v-if="!isExpressionEmpty"
            flat
            round
            dense
            icon="close"
            size="sm"
            class="formula-clear-btn"
            :color="fieldTextColor"
            :title="t('clearExpression')"
            @mousedown.prevent
            @click="formulaStore.clearExpression()"
          />
          <q-icon v-if="isBrowsingHistory" name="history" size="xs" :color="fieldTextColor" />
        </template>
      </q-input>
    </div>
  </q-card-section>
</template>

<style scoped lang="scss">
  .formula-expression-field {
    :deep(.q-field__control) {
      min-height: 36px;
    }

    :deep(.q-field__native),
    :deep(.q-field__input) {
      font-size: 1rem;
      letter-spacing: 0.02em;
    }
  }

  .formula-expression-text {
    font-size: 1rem;
    letter-spacing: 0.02em;
    overflow: hidden;
    white-space: nowrap;
  }

  .formula-clear-btn {
    margin-left: -8px;
  }

  .formula-overflow-indicator {
    font-size: 0.9rem;
    opacity: 0.5;
    flex-shrink: 0;
    padding-right: 2px;
    letter-spacing: 0;
  }

  .formula-expression-placeholder {
    opacity: 0.45;
    font-style: italic;
  }

  .formula-help-menu {
    min-width: 240px;
    max-width: 300px;
  }

  .help-group-label {
    opacity: 0.7;
  }
</style>

<i18n lang="yaml">
ko:
  expressionPlaceholder: '수식을 입력하세요 (예: (1+3)*5)'
  editExpression: '수식 편집 (Space)'
  clearExpression: '수식 지우기'
  formulaEvaluationError: '수식 평가 오류. 수식을 확인해 주세요.'
  ariaLabel:
    expressionField: '수식 입력 필드'
  help:
    title: 'mathjs 참조'
    atHint: '현재 계산기 값으로 치환'
    dollarHint: '메모리 값으로 치환'
    docsLink: 'mathjs 공식 문서'
    arithmetic: '산술'
    functions: '함수'
    trig: '삼각함수'
    constants: '상수'
    other: '기타'
en:
  expressionPlaceholder: 'Enter expression (e.g. (1+3)*5)'
  editExpression: 'Edit expression (Space)'
  clearExpression: 'Clear expression'
  formulaEvaluationError: 'Formula evaluation error. Please check your expression.'
  ariaLabel:
    expressionField: 'Formula input field'
  help:
    title: 'mathjs Reference'
    atHint: 'Current calculator value'
    dollarHint: 'Memory value'
    docsLink: 'mathjs Documentation'
    arithmetic: 'Arithmetic'
    functions: 'Functions'
    trig: 'Trigonometry'
    constants: 'Constants'
    other: 'Other'
ja:
  expressionPlaceholder: '数式を入力 (例: (1+3)*5)'
  editExpression: '数式編集 (Space)'
  clearExpression: '数式をクリア'
  formulaEvaluationError: '数式の評価エラー。数式を確認してください。'
  ariaLabel:
    expressionField: '数式入力フィールド'
  help:
    title: 'mathjs 参照'
    atHint: '現在の計算機の値に置換'
    dollarHint: 'メモリの値に置換'
    docsLink: 'mathjs 公式ドキュメント'
    arithmetic: '算術'
    functions: '関数'
    trig: '三角関数'
    constants: '定数'
    other: 'その他'
zh:
  expressionPlaceholder: '输入表达式 (例: (1+3)*5)'
  editExpression: '编辑表达式 (Space)'
  clearExpression: '清除表达式'
  formulaEvaluationError: '公式求值错误。请检查您的表达式。'
  ariaLabel:
    expressionField: '公式输入字段'
  help:
    title: 'mathjs 参考'
    atHint: '替换为当前计算器值'
    dollarHint: '替换为内存值'
    docsLink: 'mathjs 官方文档'
    arithmetic: '算术'
    functions: '函数'
    trig: '三角函数'
    constants: '常数'
    other: '其他'
hi:
  expressionPlaceholder: 'अभिव्यक्ति दर्ज करें (उदा: (1+3)*5)'
  editExpression: 'अभिव्यक्ति संपादित करें (Space)'
  clearExpression: 'अभिव्यक्ति साफ़ करें'
  formulaEvaluationError: 'सूत्र मूल्यांकन त्रुटि। कृपया अपनी अभिव्यक्ति जाँचें।'
  ariaLabel:
    expressionField: 'सूत्र इनपुट फ़ील्ड'
  help:
    title: 'mathjs संदर्भ'
    atHint: 'वर्तमान कैलकुलेटर मान से प्रतिस्थापित'
    dollarHint: 'मेमोरी मान से प्रतिस्थापित'
    docsLink: 'mathjs दस्तावेज़ीकरण'
    arithmetic: 'अंकगणित'
    functions: 'फ़ंक्शन'
    trig: 'त्रिकोणमिति'
    constants: 'स्थिरांक'
    other: 'अन्य'
de:
  expressionPlaceholder: 'Ausdruck eingeben (z.B. (1+3)*5)'
  editExpression: 'Ausdruck bearbeiten (Space)'
  clearExpression: 'Ausdruck löschen'
  formulaEvaluationError: 'Formelauswertungsfehler. Bitte überprüfen Sie Ihren Ausdruck.'
  ariaLabel:
    expressionField: 'Formeleingabefeld'
  help:
    title: 'mathjs Referenz'
    atHint: 'Aktueller Rechnerwert'
    dollarHint: 'Speicherwert'
    docsLink: 'mathjs Dokumentation'
    arithmetic: 'Arithmetik'
    functions: 'Funktionen'
    trig: 'Trigonometrie'
    constants: 'Konstanten'
    other: 'Sonstige'
es:
  expressionPlaceholder: 'Ingrese expresión (ej: (1+3)*5)'
  editExpression: 'Editar expresión (Space)'
  clearExpression: 'Borrar expresión'
  formulaEvaluationError: 'Error de evaluación de fórmula. Verifique su expresión.'
  ariaLabel:
    expressionField: 'Campo de entrada de fórmula'
  help:
    title: 'Referencia mathjs'
    atHint: 'Valor actual de la calculadora'
    dollarHint: 'Valor de memoria'
    docsLink: 'Documentación de mathjs'
    arithmetic: 'Aritmética'
    functions: 'Funciones'
    trig: 'Trigonometría'
    constants: 'Constantes'
    other: 'Otros'
fr:
  expressionPlaceholder: 'Entrez une expression (ex: (1+3)*5)'
  editExpression: "Modifier l'expression (Space)"
  clearExpression: "Effacer l'expression"
  formulaEvaluationError: "Erreur d'évaluation de formule. Veuillez vérifier votre expression."
  ariaLabel:
    expressionField: 'Champ de saisie de formule'
  help:
    title: 'Référence mathjs'
    atHint: 'Valeur actuelle de la calculatrice'
    dollarHint: 'Valeur mémoire'
    docsLink: 'Documentation mathjs'
    arithmetic: 'Arithmétique'
    functions: 'Fonctions'
    trig: 'Trigonométrie'
    constants: 'Constantes'
    other: 'Autres'
</i18n>
