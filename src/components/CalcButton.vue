<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';

import { KeyBinding, KeyBindings } from 'classes/KeyBinding';
import { useCalcStore } from 'stores/calc-store';
import { useI18n } from 'vue-i18n';

const store = useCalcStore();

const { t } = useI18n();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const calc = store.calc;

// 나눗샘의 에러처리를 위한 함수
const funcWithError = (func: ()=>void) => {
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
          store.notifyError(t('squareRootOfANegativeNumberIsNotAllowed'), 1000);
          break;
        default:
          store.notifyError(e.message);
      }
    }
  }
};
// 버튼 레이블, 버튼 컬러, 버튼에 해당하는 키, 버튼 클릭 이벤트 핸들러
type Button = [id: string, label: string, color: string, keys: string[], handler: () => void][];

// prettier-ignore
const buttons: Button = [
  ['power', 'x²', 'secondary', ['u'], () => calc.pow2()],
  ['root', '√x', 'secondary', ['r'], () => calc.sqrt()],
  ['clear', 'C', 'deep-orange', ['Delete', 'Escape', 'c'], () => calc.clear()],
  ['backspace', '@mdi-backspace', 'deep-orange', ['Backspace'], () => calc.deleteDigitOrDot()],
  ['plusMinus', '@mdi-plus-minus-variant', 'secondary', ['Shift+Minus', 's'], () => calc.changeSign()],
  ['percent', '%', 'secondary', ['%', 'p'], () => calc.percent()],
  ['reciprocal', '1/x', 'secondary', ['i'], () => calc.rec()],
  ['divide', '@mdi-division', 'secondary', ['/'], () => calc.div()  ],
  ['seven', '7', 'primary', ['7'], () => calc.addDigit(7)],
  ['eight', '8', 'primary', ['8'], () => calc.addDigit(8)],
  ['nine', '9', 'primary', ['9'], () => calc.addDigit(9)],
  ['multiply', '@mdi-close', 'secondary', ['*'], () => calc.mul()],
  ['four', '4', 'primary', ['4'], () => calc.addDigit(4)],
  ['five', '5', 'primary', ['5'], () => calc.addDigit(5)],
  ['six', '6', 'primary', ['6'], () => calc.addDigit(6)],
  ['minus', '@mdi-minus', 'secondary', ['-'], () => calc.minus()],
  ['one', '1', 'primary', ['1'], () => calc.addDigit(1)],
  ['two', '2', 'primary', ['2'], () => calc.addDigit(2)],
  ['three', '3', 'primary', ['3'], () => calc.addDigit(3)],
  ['plus', '@mdi-plus', 'secondary', ['+'], () => calc.plus()],
  ['doubleZero', '00', 'primary', [], () => { calc.addDigit(0); calc.addDigit(0); }],
  ['zero', '0', 'primary', ['0'], () => calc.addDigit(0)],
  ['dot', '@mdi-circle-small', 'primary', ['.'], () => calc.addDot()],
  ['equals', '@mdi-equal', 'secondary', ['=', 'Enter'], ()=>calc.equal()],
];

const keyBindings: KeyBindings = buttons.map(([id, , , keys, ]) => [keys, () => store.clickButtonById('btn-'+id)]);

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
  { immediate: true }
);

// props의 기본값 설정
const props = withDefaults(defineProps<{ type?: string }>(), {
  type: 'normal',
});

// 계산기 버튼의 높이를 계산하기 위한 변수 선언
const baseHeight = ref('132px');

// 계산기 타입에 따라 버튼 높이를 다르게 설정
if (props.type === 'unit' || props.type === 'currency') {
  baseHeight.value = '230px';
}
</script>

<template>
  <q-card-section
    class="row wrap justify-center q-pt-xs q-pb-none q-px-none"
    v-blur
  >
    <div
      class="col-3 row wrap justify-center q-pa-sm"
      v-for="(button, index) in buttons"
      :key="index"
    >
      <q-btn
        :id="'btn-'+button[0]"
        class="shadow-4 noselect col-12 button"
        no-caps
        push
        :label="button[1].charAt(0) != '@' ? button[1] : undefined"
        :icon="button[1].charAt(0) == '@' ? button[1].slice(1) : undefined"
        :class="button[1].charAt(0) == '@' ? 'icon' : 'char'"
        :color="button[2]"
        @click="() => funcWithError(button[4])"
      />
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
}

.icon {
  font-size: calc(
    min(
        calc((100vh - v-bind('baseHeight')) / 6 * 0.25),
        calc((100vw - 40px) / 4 * 0.3)
      ) * 0.9
  );
}
.char {
  font-size: calc(
    min(
        calc((100vh - v-bind('baseHeight')) / 6 * 0.26),
        calc((100vw - 40px) / 4 * 0.3)
      ) * 1.2
  );
}
</style>
