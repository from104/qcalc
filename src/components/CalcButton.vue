<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';

import tinykeys, { KeyBindingMap } from 'tinykeys';

import { useCalcStore } from 'stores/calc-store';

const calcStore = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const calc = calcStore.calc;

// 버튼 레이블, 버튼 컬러, 버튼에 해당하는 키, 버튼 클릭 이벤트 핸들러
type Button = [string, string, string[], () => void][];

const buttons: Button = [
  ['x²', 'secondary', ['u'], () => calc.pow2()],
  ['√x', 'secondary', ['r'], () => calc.sqrt()],
  ['C', 'deep-orange', ['Delete', 'Escape', 'c'], () => calc.clear()],
  [
    '@mdi-backspace',
    'deep-orange',
    ['Backspace'],
    () => calc.deleteDigitOrDot(),
  ],
  [
    '@mdi-plus-minus-variant',
    'secondary',
    ['Shift+Minus', 's'],
    () => calc.changeSign(),
  ],
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
  [
    '00',
    'primary',
    [],
    () => {
      calc.addDigit(0);
      calc.addDigit(0);
    },
  ],
  ['0', 'primary', ['0'], () => calc.addDigit(0)],
  ['@mdi-circle-small', 'primary', ['.'], () => calc.addDot()],
  ['@mdi-equal', 'secondary', ['=', 'Enter'], () => calc.equal()],
];

// 계산기 키바인딩 제거하기위한 변수 선언
let keybindingRemoveAtUmount = tinykeys(window, {} as KeyBindingMap);

// dom 요소가 마운트 되었을 때 계산기 키바인딩 설정하기
onMounted(() => {
  // Support keyboard entry
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
</script>

<template>
  <q-card-section
    class="noselect col-3 q-pa-sm"
    v-for="(button, index) in buttons"
    :key="index"
    @focusin="($event.target as HTMLElement).blur()"
  >
    <q-btn
      class="glossy shadow-4 text-h5 full-width"
      id="calc-button"
      no-caps
      :label="button[0].charAt(0) != '@' ? button[0] : undefined"
      :icon="button[0].charAt(0) == '@' ? button[0].slice(1) : undefined"
      :size="button[0].charAt(0) == '@' ? 'md' : 'lg'"
      :color="button[1]"
      @click="button[3]"
    />
  </q-card-section>
</template>

<style scoped lang="scss">
#calc-button {
  overflow: auto;
  min-height: 44px;
  max-height: 44px;
}
</style>