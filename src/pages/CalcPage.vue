<script setup lang="ts">
import { useCalcStore } from 'src/stores/calc-store';
import MyTooltip from 'components/MyTooltip.vue';
import { onMounted, reactive, ref, watch } from 'vue';
import tinykeys, { KeyBindingMap } from 'tinykeys';
import { copyToClipboard, useQuasar } from 'quasar';

const locale = navigator.language

// const calc = reactive(new Calculator());
const calc = useCalcStore().$state.calc;

const localeOptions: Intl.NumberFormatOptions = reactive({
  style: 'decimal',
  useGrouping: false,
  minimumFractionDigits: 0,
  maximumFractionDigits: 20,
})

const fixedPointFormat = ref(0);

const setFixedPointFormat = (fixedPointDecEdit=0) => {
  if (fixedPointDecEdit != 0) {
    fixedPointFormat.value = fixedPointDecEdit < 0 ?
      Math.max(0, fixedPointFormat.value + fixedPointDecEdit) :
      Math.min(fixedPointFormat.value + fixedPointDecEdit, 6);
  }

  if (fixedPointFormat.value === 0) {
    localeOptions.minimumFractionDigits = 0;
    localeOptions.maximumFractionDigits = 20;
  } else {
    localeOptions.minimumFractionDigits = fixedPointFormat.value;
    localeOptions.maximumFractionDigits = fixedPointFormat.value;
  }
}

const getDisplayNumber = () => {
  return Number(calc.getShownNumber()).toLocaleString(locale, localeOptions);
}

const number = ref(getDisplayNumber());
const operator = ref(calc.getOperatorString());

const setDisplayNumber = () => {
  number.value = getDisplayNumber();
}

watch(calc, () => {
  setDisplayNumber();
  operator.value = calc.getOperatorString();
});
watch(localeOptions, () => {
  setDisplayNumber();
});

const $q = useQuasar();

const doCopy = (): void => {
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

const doPaste = (): void => {
  navigator.clipboard
    .readText()
    .then((text) => {
      calc.setShownNumber(text);
      $q.notify({
        position: 'top',
        message: 'Pasted from clipboard',
        type: 'positive',
        timeout: 2000,
      });
    })
    .catch(() => {
      $q.notify({
        position: 'top',
        message: 'Failed to paste from clipboard',
        type: 'negative',
        timeout: 2000,
      });
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

type Shortcut = [string[], () => void][];

const shortcuts: Shortcut = [
  [['Control+c', 'Control+Insert', 'Copy'], doCopy],
  [['Control+v', 'Shift+Insert', 'Paste'], doPaste],
  [[','], () => localeOptions.useGrouping = !localeOptions.useGrouping],
  [['['], () => setFixedPointFormat(-2)],
  [[']'], () => setFixedPointFormat(2)],
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
  shortcuts.forEach((shortcut) => {
    const [keys, handler] = shortcut;
    keys.forEach((key) => {
      keyBindingMaps[key] = handler;
    });
  });

  // 키바인딩하고 제거할 수 있는 메서드 백업;
  useCalcStore().$state.keybindingRemoveFromCalc = tinykeys(window, keyBindingMaps);
});
</script>

<template>
  <q-page id="qcalc">
    <q-card flat class="row wrap q-pa-md">
      <q-card-section class="col-2 row justify-start q-py-none q-px-sm">
        <q-checkbox v-model="localeOptions.useGrouping" checked-icon="mdi-comma-circle"
          unchecked-icon="mdi-comma-circle-outline" @focusin="($event.target as HTMLInputElement).blur()">
          <my-tooltip>use grouping</my-tooltip>
        </q-checkbox>
      </q-card-section>

      <q-card-section class="col-3 row justify-start q-py-none q-px-sm">
        <my-tooltip>select fixed point format</my-tooltip>
        <q-slider v-model="fixedPointFormat" :min="0" :step="2" :max="6" marker-labels @change='setFixedPointFormat'
          @focusin="($event.target as HTMLInputElement).blur()" />
      </q-card-section>

      <q-card-section class="col-7 row justify-end q-py-none q-px-sm">
        <q-btn class="q-pl-sm" flat v-if="operator" :label="operator" />
        <q-btn flat icon="content_copy" class="q-ma-none q-pa-none q-pl-xs" @click="doCopy()"
          @focusin="($event.target as HTMLInputElement).blur()">
          <my-tooltip>Click to copy</my-tooltip>
        </q-btn>
        <q-btn flat icon="content_paste" class="q-ma-none q-pa-none q-pl-xs q-pr-xs" @click="doPaste()"
          @focusin="($event.target as HTMLInputElement).blur()">
          <my-tooltip>Click to paste</my-tooltip>
        </q-btn>
      </q-card-section>
      <q-card-section class="col-12 q-px-sm q-pt-none q-pb-sm">
        <q-input v-model="number" type="number" readonly class="q-ma-none q-pa-none"
          input-class="q-pt-none text-right text-h4" input-style="padding-top: 6px; line-height: 1.1" autogrow
          outlined />
      </q-card-section>

      <q-card-section class="col-3 q-pa-sm" v-for="(button, index) in buttons" :key="index">
        <q-btn class="text-h6 full-width" :label="button[0]" :color="button[1]" @click="button[3]()"
          @focusin="($event.target as HTMLInputElement).blur()">
          <my-tooltip v-if="button[2].length > 0">
            {{ button[2].join(', ') }} key to use
          </my-tooltip>
        </q-btn>
      </q-card-section>
    </q-card>
  </q-page>
</template>
