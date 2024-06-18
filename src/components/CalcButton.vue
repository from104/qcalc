<script setup lang="ts">
  import {onMounted, onBeforeUnmount, ref, watch, reactive} from 'vue';

  import {useI18n} from 'vue-i18n';
  const {t} = useI18n();

  // 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
  import {useCalcStore} from 'stores/calc-store';
  const store = useCalcStore();
  const {calc} = store;

  // 에러처리를 위한 함수
  const funcWithError = (func: () => void) => {
    try {
      func();
    } catch (e: unknown) {
      if (e instanceof Error) {
        // console.error(e.message);
        switch (e.message) {
          case 'Cannot divide by zero':
            store.notifyError(t('cannotDivideByZero'), 1000);
            break;
          case 'The square root of a negative number is not allowed.':
            store.notifyError(
              t('squareRootOfANegativeNumberIsNotAllowed'),
              1000,
            );
            break;
          default:
            store.notifyError(e.message);
        }
      }
    }
  };

  // 버튼 레이블, 버튼 컬러, 버튼에 해당하는 키, 버튼 클릭 이벤트 핸들러
  type Button = {
    [id: string]: [
      isIcon: boolean,
      label: string,
      color: string,
      keys: string[],
      handler: () => void,
    ];
  };

  // prettier-ignore
  const buttons: Button = {
  a1: [false, 'x²', 'function', ['u'], () => calc.pow2()],
  b1: [false, '√x', 'function', ['r'], () => calc.sqrt()],
  c1: [false, 'C', 'important', ['Delete', 'Escape', 'c'], () => calc.clear()],
  d1: [true,  'mdi-backspace', 'important', ['Backspace'], () => calc.deleteDigitOrDot()],
  a2: [true,  'mdi-plus-minus-variant', 'function', ['Shift+Minus', 's'], () => calc.changeSign()],
  b2: [false, '%', 'function', ['%', 'p'], () => calc.percent()],
  c2: [false, '1/x', 'function', ['i'], () => calc.rec()],
  d2: [true,  'mdi-division', 'function', ['/'], () => calc.div()],
  a3: [false, '7', 'normal', ['7'], () => calc.addDigit(7)],
  b3: [false, '8', 'normal', ['8'], () => calc.addDigit(8)],
  c3: [false, '9', 'normal', ['9'], () => calc.addDigit(9)],
  d3: [true,  'mdi-close', 'function', ['*'], () => calc.mul()],
  a4: [false, '4', 'normal', ['4'], () => calc.addDigit(4)],
  b4: [false, '5', 'normal', ['5'], () => calc.addDigit(5)],
  c4: [false, '6', 'normal', ['6'], () => calc.addDigit(6)],
  d4: [true,  'mdi-minus', 'function', ['-'], () => calc.minus()],
  a5: [false, '1', 'normal', ['1'], () => calc.addDigit(1)],
  b5: [false, '2', 'normal', ['2'], () => calc.addDigit(2)],
  c5: [false, '3', 'normal', ['3'], () => calc.addDigit(3)],
  d5: [true,  'mdi-plus', 'function', ['+'], () => calc.plus()],
  a6: [true,  'keyboard_capslock', 'important', ['\\'], () => store.toggleButtonShift()],
  b6: [false, '0', 'normal', ['0'], () => calc.addDigit(0)],
  c6: [true,  'mdi-circle-small', 'normal', ['.'], () => calc.addDot()],
  d6: [true,  'mdi-equal', 'important', ['=', 'Enter'], () => calc.equal()],
};

  /*
x^y, x의 y제곱근, MC, MR
10^x, x mod y, x!, M/
sin, cos, tan, M*
Pi/2, ln(10), ln(2) M-
Pi, 황금비(φ),log e,  M+
shift, int, frac, MS
*/

  type ButtonAddedFunc = {
    [id: string]: [label: string, keys: string[], handler: () => void];
  };

  // 계산기 버튼에 2번째 기능에 대한 레이블 정의
  // prettier-ignore
  const buttonsAddedFunc: ButtonAddedFunc = {
  a1: ['xⁿ', [], () => calc.pow()],
  b1: ['ⁿ√x', [], () => calc.root()],
  c1: ['MC', [], () => calc.memoryClear()],
  d1: ['MR', [], () => calc.memoryRecall()],
  a2: ['10ⁿ', [], () => calc.exp10()],
  b2: ['x%y', [], () => calc.mod()],
  c2: ['x!', [], () => calc.fct()],
  d2: ['M÷', [], () => calc.memoryDiv()],
  a3: ['sin', [], () => calc.sin()],
  b3: ['cos', [], () => calc.cos()],
  c3: ['tan', [], () => calc.tan()],
  d3: ['M×', [], () => calc.memoryMul()],
  a4: ['Pi/2', [], () => calc.setConstant('pi2')],
  b4: ['ln10', [], () => calc.setConstant('ln10')],
  c4: ['ln2', [], () => calc.setConstant('ln2')],
  d4: ['M-', [], () => calc.memoryMinus()],
  a5: ['Pi', [], () => calc.setConstant('pi')],
  b5: ['phi', [], () => calc.setConstant('phi')],
  c5: ['e', [], () => calc.setConstant('e')],
  d5: ['M+', [], () => calc.memoryPlus()],
  a6: ['', [], () => null],
  b6: ['int', [], () => calc.int()],
  c6: ['frac', [], () => calc.frac()],
  d6: ['MS', [], () => calc.memorySave()],
};

  const showTooltips: {[id: string]: boolean} = reactive(
    Object.fromEntries(Object.keys(buttons).map((id) => [id, false])),
  );

  // 버튼 시프트 상태에 따라 기능 실행
  const shiftFunc = (id: string | number) => {
    if (store.buttonShift) {
      funcWithError(buttonsAddedFunc[id][2]);
      if (id === 'a6') {
        store.offButtonShift();
        store.offButtonShiftLock();
        return;
      }
      if (store.buttonShiftLock) return;
      store.offButtonShift();
    } else {
      funcWithError(buttons[id][4]);
    }
  };

  const holdFunc = (id: string | number) => {
    if (id === 'a6') {
      if (store.buttonShiftLock) {
        store.offButtonShiftLock();
        store.offButtonShift();
      } else {
        store.onButtonShiftLock();
        store.onButtonShift();
      }
      return;
    }
    if (store.buttonShift) {
      funcWithError(buttons[id][4]);
      if (store.buttonShiftLock) return;
      store.offButtonShift();
      return;
    } else {
      funcWithError(buttonsAddedFunc[id][2]);
      showTooltips[id] = true;
      setTimeout(() => {
        showTooltips[id] = false;
      }, 1000);
    }
  };

  import {KeyBinding, KeyBindings} from 'classes/KeyBinding';
  const keyBindings: KeyBindings = Object.entries(buttons).map(
    ([id, [, , , keys]]) => [keys, () => store.clickButtonById('btn-' + id)],
  );
  const keyBinding = new KeyBinding(keyBindings);

  // dom 요소가 마운트 되었을 때 계산기 키바인딩 설정하기
  onMounted(() => {
    keyBinding.subscribe();
  });

  // dom 요소가 언마운트되기 전에 키바인딩 제거
  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
  });

  // inputFocused 값이 바뀌면 키바인딩을 추가하거나 제거합니다.
  watch(
    () => store.inputFocused,
    () => {
      // console.log('buttons inputFocused', store.inputFocused);
      if (store.inputFocused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
    {immediate: true},
  );

  // props의 기본값 설정
  const props = withDefaults(defineProps<{type?: string}>(), {
    type: 'normal',
  });

  // 계산기 버튼의 높이를 계산하기 위한 변수 선언
  const baseHeight = ref('136px');

  // 계산기 타입에 따라 버튼 높이를 다르게 설정
  if (props.type === 'unit' || props.type === 'currency') {
    baseHeight.value = '234px';
  }
</script>

<template>
  <q-card-section
    v-blur
    class="row wrap justify-center q-pt-xs q-pb-none q-px-none"
  >
    <div
      v-for="(button, id) in buttons"
      :key="id"
      class="col-3 row wrap justify-center q-pa-sm"
    >
      <q-btn
        :id="'btn-' + id"
        v-touch-hold.mouse="() => holdFunc(id)"
        class="shadow-2 noselect col-12 button"
        no-caps
        push
        :label="
          store.buttonShift && !store.showButtonAddedLabel && id !== 'a6'
            ? buttonsAddedFunc[id][0]
            : button[0]
              ? undefined
              : button[1]
        "
        :icon="
          store.buttonShift && !store.showButtonAddedLabel && id !== 'a6'
            ? undefined
            : button[0]
              ? button[1]
              : undefined
        "
        :class="[
          store.buttonShift && !store.showButtonAddedLabel && id !== 'a6'
            ? 'char'
            : button[0]
              ? 'icon'
              : 'char',
          id === 'a6' && store.buttonShift ? 'button-shift' : '',
        ]"
        :style="
          !store.showButtonAddedLabel || !buttonsAddedFunc[id][0]
            ? {paddingTop: '4px'}
            : {}
        "
        :color="`btn-${button[2]}`"
        @click="() => shiftFunc(id)"
      >
        <span
          v-if="store.showButtonAddedLabel && buttonsAddedFunc[id]"
          class="top-label"
          :class="[
            `top-label-${button[0] ? 'icon' : 'char'}`,
            `top-label-${button[2]}`,
          ]"
        >
          {{ buttonsAddedFunc[id][0] }}
        </span>
        <q-tooltip
          :model-value="showTooltips[id]"
          no-parent-event
          anchor="top middle"
          self="center middle"
          transition-show="jump-up"
          transition-hide="jump-down"
          transition-duration="50"
        >
          {{ buttonsAddedFunc[id][0] }}
        </q-tooltip>
      </q-btn>
    </div>
  </q-card-section>
</template>

<i18n>
ko:
  cannotDivideByZero: '0으로 나눌 수 없습니다.'
  squareRootOfANegativeNumberIsNotAllowed: '음수의 제곱근은 허용되지 않습니다.'
en:
  cannotDivideByZero: 'Cannot divide by zero'
  squareRootOfANegativeNumberIsNotAllowed: 'The square root of a negative number is not allowed.'
</i18n>

<style scoped lang="scss">
  .button {
    min-height: calc((100vh - v-bind('baseHeight')) / 6 - 20px);
    max-height: calc((100vh - v-bind('baseHeight')) / 6 - 20px);
    font-weight: 700;
    position: relative;
  }

  .icon {
    font-size: calc(
      min(
          calc((100vh - v-bind('baseHeight')) / 6 * 0.25),
          calc((100vw - 40px) / 4 * 0.3)
        ) * 0.8
    );
    padding-top: calc(
      ((100vh - v-bind('baseHeight')) / 6 - 15px) * 0.3
    ); /* Lower the content by 4px */
  }

  .char {
    font-size: calc(
      min(
          calc((100vh - v-bind('baseHeight')) / 6 * 0.26),
          calc((100vw - 40px) / 4 * 0.3)
        ) * 1.2
    );
    padding-top: calc(
      ((100vh - v-bind('baseHeight')) / 6 - 25px) * 0.3
    ); /* Lower the content by 4px */
  }

  .top-label {
    text-align: center;
    position: absolute;
    font-size: calc(
      min(
          calc((100vh - v-bind('baseHeight')) / 6 * 0.26),
          calc((100vw - 40px) / 4 * 0.3)
        ) * 1.2 * 0.7
    );
  }

  .top-label-icon {
    top: calc(((100vh - v-bind('baseHeight')) / 6) * 0.15 - 9px);
  }

  .top-label-char {
    top: calc(((100vh - v-bind('baseHeight')) / 6) * 0.15 - 17px);
  }

  .bg-btn-important {
    background: #cb9247 !important; // 아이콘의 밝은 녹색
  }

  .bg-btn-function {
    background: #1d8fb6 !important; // 아이콘의 밝은 파란색과 어울리게 조정
  }

  .bg-btn-normal {
    background: #5e9e7d !important; // 어두운 색
  }

  .top-label-important {
    color: #e6d8c6 !important; // 아이콘의 밝은 녹색
  }

  .top-label-function {
    color: #b8dfed !important; // 아이콘의 밝은 파란색과 어울리게 조정
  }

  .top-label-normal {
    color: #bcddcc !important; // 어두운 색
  }

  .button-shift {
    background: #cb4747 !important;
  }
</style>
