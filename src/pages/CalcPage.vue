<script setup lang="ts">
import { useCalcStore } from 'src/stores/calc-store';
import { onMounted, ref, watch } from 'vue';
import tinykeys, { KeyBindingMap } from 'tinykeys';
import { copyToClipboard, useQuasar } from 'quasar';

// const calc = reactive(new Calculator());
const calc = useCalcStore().$state.calc;
const number = ref(calc.getShownNumber());

watch(calc, () => {
  number.value = calc.getShownNumber();
});

const $q = useQuasar();

const toCopy = (): void => {
  copyToClipboard(number.value)
    .then(() => {
      $q.notify({
        position: 'top',
        message: 'Copied to clipboard',
        type: 'positive',
        timeout: 2000,
      });
      // console.log('copied');
    })
    .catch(() => {
      $q.notify({
        position: 'top',
        message: 'Failed to copy to clipboard',
        type: 'negative',
        timeout: 2000,
      });
      // console.log('failed');
    });
};

// 버튼 레이블, 버튼 컬러, 버튼에 해당하는 키, 버튼 클릭 이벤트 핸들러
type Button = [string, string, string[], () => void][];

const buttons: Button = [
  ['%', 'secondary', ['%', 'p'], () => calc.percent()],
  ['±', 'secondary', ['Shift+Minus', 's'], () => calc.changeSign()],
  ['C', 'dark', ['Delete', 'Escape', 'c'], () => calc.clear()],
  ['←', 'dark', ['Backspace'], () => calc.deleteDigitOrDot()],
  ['7', 'primary', ['7'], () => calc.addDigit(7)],
  ['8', 'primary', ['8'], () => calc.addDigit(8)],
  ['9', 'primary', ['9'], () => calc.addDigit(9)],
  ['÷', 'secondary', ['/'], () => calc.div()],
  ['4', 'primary', ['4'], () => calc.addDigit(4)],
  ['5', 'primary', ['5'], () => calc.addDigit(5)],
  ['6', 'primary', ['6'], () => calc.addDigit(6)],
  ['×', 'secondary', ['*'], () => calc.mul()],
  ['1', 'primary', ['1'], () => calc.addDigit(1)],
  ['2', 'primary', ['2'], () => calc.addDigit(2)],
  ['3', 'primary', ['3'], () => calc.addDigit(3)],
  ['-', 'secondary', ['-'], () => calc.minus()],
  ['0', 'primary', ['0'], () => calc.addDigit(0)],
  ['.', 'primary', ['.'], () => calc.addDot()],
  ['=', 'secondary', ['=', 'Enter'], () => calc.equal()],
  ['+', 'secondary', ['+'], () => calc.plus()],
];

onMounted(() => {
  // Support keyboard entry
  const keyBindingMaps: KeyBindingMap = {};

  buttons.forEach((button) => {
    const [, , keys, handler] = button;
    keys.forEach((key) => {
      keyBindingMaps[key] = handler;
    });
  });

  tinykeys(window, keyBindingMaps);
});
</script>

<template>
  <q-page>
    <q-card flat class="row wrap q-pa-md">
      <q-card-section class="col-12 text-h4 q-pa-sm">
        <q-input
          v-model="number"
          type="number"
          readonly
          color="primary"
          input-class="text-right"
          class="col-12 text-h4"
          outlined
        >
          <template v-slot:prepend>
            <q-btn flat class="q-ma-none q-ma-none" @click="toCopy()">
              <q-icon name="content_copy" />
            </q-btn>
          </template>
        </q-input>
      </q-card-section>

      <q-card-section
        class="col-3 q-pa-sm"
        v-for="(button, index) in buttons"
        :key="index"
      >
        <q-btn
          class="text-h6 full-width"
          :label="button[0]"
          :color="button[1]"
          @click="button[3]()"
          @focusin="($event.target as HTMLInputElement).blur()"
        >
          <q-tooltip
            class="text-dark bg-yellow text-body2 fa-border-all"
            anchor="top middle"
            self="bottom middle"
            style="border: 1px solid black"
            :delay="500"
            v-if="button[2].length > 0"
          >
            {{ button[2].join(', ') }} key to use
          </q-tooltip>
        </q-btn>
      </q-card-section>
    </q-card>
  </q-page>
</template>
