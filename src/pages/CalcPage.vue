<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, ref, watch } from 'vue';
import tinykeys, { KeyBindingMap } from 'tinykeys';
import { copyToClipboard, useQuasar } from 'quasar';

import { useCalcStore } from 'stores/calc-store';
import MyTooltip from 'components/MyTooltip.vue';

// 스토어 가져오기
const calcStore = useCalcStore();

// 시스템 로케일
const locale = navigator.language;

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const calc = calcStore.calc;

const localeOptions: Intl.NumberFormatOptions = reactive({
  style: 'decimal',
  useGrouping: true,
  minimumFractionDigits: 0,
  maximumFractionDigits: 20,
});

const setUseGrouping = () => {
  localeOptions.useGrouping = calcStore.useGrouping;
};

const setDecimalPlaces = (decimalPlaces: number | undefined = undefined) => {
  if (decimalPlaces !== undefined) {
    calcStore.setDecimalPlaces(decimalPlaces);
  }
  if (calcStore.decimalPlaces === -2) {
    localeOptions.minimumFractionDigits = 0;
    localeOptions.maximumFractionDigits = 20;
  } else {
    localeOptions.minimumFractionDigits = calcStore.decimalPlaces;
    localeOptions.maximumFractionDigits = calcStore.decimalPlaces;
  }
};

const getDisplayNumber = () => {
  return Number(calc.getShownNumber()).toLocaleString(locale, localeOptions);
};

const number = ref(getDisplayNumber());
const operator = ref(calc.getOperatorString());

const setDisplayNumber = () => {
  number.value = getDisplayNumber();
};

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
        message: '결과를 클립보드에 복사했습니다.',
        type: 'positive',
        timeout: 2000,
      });
      // console.log('copied');
    })
    .catch(() => {
      $q.notify({
        position: 'top',
        message: '결과를 클립보드에 복사하지 못했습니다.',
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
        message: '클립보드로부터 숫자를 붙여넣었습니다.',
        type: 'positive',
        timeout: 2000,
      });
    })
    .catch(() => {
      $q.notify({
        position: 'top',
        message: '클립보드로부터 숫자를 붙여넣지 못했습니다.',
        type: 'negative',
        timeout: 2000,
      });
    });
};

const toggleUseGrouping = (): void => {
  calcStore.toggleUseGrouping();
  setUseGrouping();
};

const incDecimalPlaces = (): void => {
  calcStore.incDecimalPlaces();
  setDecimalPlaces();
};

const decDecimalPlaces = (): void => {
  calcStore.decDecimalPlaces();
  setDecimalPlaces();
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
  [[','], toggleUseGrouping],
  [['['], decDecimalPlaces],
  [[']'], incDecimalPlaces],
];

// 계산기 키바인딩 제거하기위한 변수 선언
let keybindingRemoveAtUmount = tinykeys(window, {} as KeyBindingMap);

// dom 요소가 마운트 되었을 때
// 1. 계산기 키바인딩 설정하기
// 2. 스토어에서 값을 가져와서 계산기에 설정하기
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
  keybindingRemoveAtUmount = tinykeys(window, keyBindingMaps);

  //초기 state 에 의한 설정
  setUseGrouping();
  setDecimalPlaces();
});

// dom 요소가 언마운트되기 전에 키바인딩 제거
onBeforeUnmount(() => {
  keybindingRemoveAtUmount();
});
</script>

<template>
  <q-page id="qcalc" @focusin="($event.target as HTMLInputElement).blur()">
    <q-card flat class="row wrap q-px-md q-py-xs">
      <q-card-section
        class="col-9 row no-wrap items-center justify-start q-py-none q-px-xs"
      >
        <q-checkbox
          v-model="calcStore.useGrouping"
          label="쉼표: "
          left-label
          class="q-ml-sm"
          @click="setUseGrouping()"
        >
          <my-tooltip>천 단위 구분 (,)</my-tooltip>
        </q-checkbox>
        <div class="col-7 row no-wrap items-center">
          <my-tooltip>소수점 고정값 선택 ('[',']')</my-tooltip>
          <div>소수점:</div>
          <q-slider
            v-model="calcStore.decimalPlaces"
            :min="-2"
            :step="2"
            :max="6"
            marker-labels
            class="col-6 q-ml-md"
            @change="setDecimalPlaces()"
          >
            <template v-slot:marker-label-group="{ markerList }">
              <q-icon
                v-for="val in [0]"
                :key="val"
                class="cursor-pointer"
                :class="(markerList[val] as any).classes"
                :style="(markerList[val] as any).style"
                size="17px"
                name="mdi-minus-circle-outline"
                @click="setDecimalPlaces((markerList[val] as any).value)"
              />
              <div
                v-for="val in [1, 2, 3, 4]"
                :key="val"
                class="cursor-pointer"
                :class="(markerList[val] as any).classes"
                :style="(markerList[val] as any).style"
                @click="setDecimalPlaces((markerList[val] as any).value)"
              >
                {{ (markerList[val] as any).value }}
              </div>
            </template>
          </q-slider>
        </div>
      </q-card-section>

      <q-card-section class="col-3 row no-wrap justify-end q-py-none q-px-sm">
        <q-btn class="q-pr-xs" flat v-if="operator" :label="operator">
          <my-tooltip>현재 연산자</my-tooltip>
        </q-btn>
        <q-btn
          flat
          icon="content_copy"
          color="primary"
          class="q-ma-none q-pa-none q-pl-xs"
          @click="doCopy"
        >
          <my-tooltip>클릭하면 결과가 복사됩니다.</my-tooltip>
        </q-btn>
        <q-btn
          flat
          icon="content_paste"
          color="primary"
          class="q-ma-none q-pa-none q-pl-xs q-pr-xs"
          @click="doPaste"
        >
          <my-tooltip>클릭하면 숫자를 붙혀넣습니다.</my-tooltip>
        </q-btn>
      </q-card-section>
      <q-card-section class="col-12 q-px-sm q-pt-none q-pb-sm">
        <q-field :model-value="number" class="shadow-2" filled dense>
          <template v-slot:control>
            <div
              class="self-center full-width no-outline text-h4 text-right"
              style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
            >
              {{ number }}
            </div>
          </template>
        </q-field>
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
          @click="button[3]"
        >
          <my-tooltip v-if="button[2].length > 0">
            {{ button[2].join(', ') }} 키
          </my-tooltip>
        </q-btn>
      </q-card-section>
    </q-card>
  </q-page>
</template>
