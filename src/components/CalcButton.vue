<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';

import tinykeys, { KeyBindingMap } from 'tinykeys';

import { useCalcStore } from 'stores/calc-store';

const store = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const calc = store.calc;

// 버튼 레이블, 버튼 컬러, 버튼에 해당하는 키, 버튼 클릭 이벤트 핸들러
type Button = [string, string, string[], () => void][];

// prettier-ignore
const buttons: Button = [
    ['x²', 'secondary', ['u'], () => calc.pow2()],
    ['√x', 'secondary', ['r'], () => calc.sqrt()],
    ['C', 'deep-orange', ['Delete', 'Escape', 'c'], () => calc.clear()],
    ['@mdi-backspace', 'deep-orange', ['Backspace'], () => calc.deleteDigitOrDot()],
    ['@mdi-plus-minus-variant', 'secondary', ['Shift+Minus', 's'], () => calc.changeSign()],
    ['%', 'secondary', ['%', 'p'], () => calc.percent()],
    ['1/x', 'secondary', ['i'], () => calc.rec()],
    ['@mdi-division', 'secondary', ['/'], () => calc.div()],
    ['7', 'primary', ['7'], () => calc.addDigit(7)],
    ['8', 'primary', ['8'], () => calc.addDigit(8)],
    ['9', 'primary', ['9'], () => calc.addDigit(9)],
    ['@mdi-close', 'secondary', ['*'], () => calc.mul()],
    ['4', 'primary', ['4'], () => calc.addDigit(4)],
    ['5', 'primary', ['5'], () => calc.addDigit(5)],
    ['6', 'primary', ['6'], () => calc.addDigit(6)],
    ['@mdi-minus', 'secondary', ['-'], () => calc.minus()],
    ['1', 'primary', ['1'], () => calc.addDigit(1)],
    ['2', 'primary', ['2'], () => calc.addDigit(2)],
    ['3', 'primary', ['3'], () => calc.addDigit(3)],
    ['@mdi-plus', 'secondary', ['+'], () => calc.plus()],
    ['00', 'primary', [], () => { calc.addDigit(0); calc.addDigit(0); }],
    ['0', 'primary', ['0'], () => calc.addDigit(0)],
    ['@mdi-circle-small', 'primary', ['.'], () => calc.addDot()],
    ['@mdi-equal', 'secondary', ['=', 'Enter'], () => calc.equal()],
  ];

// 계산기 키바인딩 제거하기위한 변수 선언
let keybindingRemoveAtUmount = tinykeys(window, {} as KeyBindingMap);

// dom 요소가 마운트 되었을 때 계산기 키바인딩 설정하기
onMounted(() => {
  // 키바인딩 맵 생성
  const keyBindingMaps: KeyBindingMap = {};

  buttons.forEach((button) => {
    const [, , keys, handler] = button;
    keys.forEach((key) => {
      keyBindingMaps[key] = handler;
    });
  });

  // 키바인딩하고 제거할 수 있는 메서드 백업;
  keybindingRemoveAtUmount = tinykeys(window, keyBindingMaps);
});

// dom 요소가 언마운트되기 전에 키바인딩 제거
onBeforeUnmount(() => {
  keybindingRemoveAtUmount();
});

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
        class="glossy shadow-4 noselect col-12 button"
        no-caps
        :label="button[0].charAt(0) != '@' ? button[0] : undefined"
        :icon="button[0].charAt(0) == '@' ? button[0].slice(1) : undefined"
        :id="button[0].charAt(0) == '@' ? 'icon' : 'char'"
        :color="button[1]"
        @click="button[3]"
      />
      <!-- :size="button[0].charAt(0) == '@' ? '1rem' : '1.2rem'" -->
    </div>
  </q-card-section>
</template>

<style scoped lang="scss">
.button {
  border-radius: 0.5rem;
  min-height: calc((100vh - v-bind('baseHeight')) / 6 - 20px);
  max-height: calc((100vh - v-bind('baseHeight')) / 6 - 20px);
  font-weight: 700;
}

#icon {
  font-size: calc(
    min(
        calc((100vh - v-bind('baseHeight')) / 6 * 0.25),
        calc((100vw - 40px) / 4 * 0.3)
      ) * 0.9
  );
}
#char {
  font-size: calc(
    min(
        calc((100vh - v-bind('baseHeight')) / 6 * 0.26),
        calc((100vw - 40px) / 4 * 0.3)
      ) * 1.2
  );
}
</style>
