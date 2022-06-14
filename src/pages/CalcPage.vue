<script setup lang="ts">
import { useCalcStore } from 'src/stores/calc-store';
import { onMounted, ref, watch } from 'vue';
// import { Calculator } from '../Calculator';

// const calc = reactive(new Calculator());
const calc = useCalcStore().$state.calc;
const number = ref(calc.getShownNumber());

watch(calc, () => {
  number.value = calc.getShownNumber();
})

type Button = [string, string, () => void][];

const buttons: Button = [
  ['%', 'secondary', () => calc.percent()],
  ['±', 'secondary', () => calc.changeSign()],
  ['C', 'dark', () => calc.clear()],
  ['←', 'dark', () => calc.deleteDigitOrDot()],
  ['7', 'primary', () => calc.addDigit(7)],
  ['8', 'primary', () => calc.addDigit(8)],
  ['9', 'primary', () => calc.addDigit(9)],
  ['÷', 'secondary', () => calc.div()],
  ['4', 'primary', () => calc.addDigit(4)],
  ['5', 'primary', () => calc.addDigit(5)],
  ['6', 'primary', () => calc.addDigit(6)],
  ['×', 'secondary', () => calc.mul()],
  ['1', 'primary', () => calc.addDigit(1)],
  ['2', 'primary', () => calc.addDigit(2)],
  ['3', 'primary', () => calc.addDigit(3)],
  ['-', 'secondary', () => calc.minus()],
  ['0', 'primary', () => calc.addDigit(0)],
  ['.', 'primary', () => calc.addDot()],
  ['=', 'secondary', () => calc.equal()],
  ['+', 'secondary', () => calc.plus()],
];

onMounted(() => {
  // Support keyboard entry
  window.addEventListener('keyup', (event) => {
    if (event.key === '+') return calc.plus();
    if (event.key === '-') return calc.minus();
    if (event.key === '*') return calc.mul();
    if (event.key === '/') return calc.div();
    if (event.key === '_') return calc.changeSign();
    if (event.key === '=') return calc.equal();
    if (event.key === 'Delete') return calc.clear();
    if (event.key === 'Backspace') return calc.deleteDigitOrDot();
    if (event.key === 'Enter') return calc.equal();
    if (event.key.match(/^[\d]$/)) return calc.addDigit(event.key);
    if (event.key.match(/^[pP%]$/)) return calc.percent();
  });
});

const toBlur = (e: any) => {
  e.target.blur()
}
</script>

<template>
  <q-page>
    <q-card flat class="row wrap q-pa-md">
      <q-card-section class="col-12 text-h4 q-pa-sm">
        <q-input v-model="number" type="number" readonly color="primary" input-class="text-right" class="col-12 text-h4"
          outlined />
      </q-card-section>

      <q-card-section class="col-3 q-pa-sm" v-for="(button, index) in buttons" :key="index">
        <q-btn class="text-h6 full-width" :label="button[0]" :color="button[1]" @click="button[2]()" @focus="toBlur" manualFocus />
      </q-card-section>
    </q-card>
  </q-page>
</template>
