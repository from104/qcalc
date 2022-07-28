<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, ref, watch, computed } from 'vue';
import tinykeys, { KeyBindingMap } from 'tinykeys';
import { copyToClipboard, useQuasar } from 'quasar';

import { useCalcStore } from 'stores/calc-store';
import MyTooltip from 'components/MyTooltip.vue';
import type { History } from 'classes/Calculator';

// 스토어 가져오기
const calcStore = useCalcStore();

// 시스템 로케일
const locale = navigator.language;

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const calc = calcStore.calc;

// 쉼표, 소수점 표시를 위한 옵션
const localeOptions: Intl.NumberFormatOptions = reactive({
  style: 'decimal',
  useGrouping: true,
  minimumFractionDigits: 0,
  maximumFractionDigits: 20,
});

// 쉼표 표시를 위한 옵션을 설정하는 함수
function setUseGrouping () {
  localeOptions.useGrouping = calcStore.useGrouping;
}

// 소수점 표시를 위한 옵션을 설정하는 함수
// 인자가 있으면 인자로 설정하고 없으면 스토어에서 가져온 값으로 설정한다.
function setDecimalPlaces (decimalPlaces: number | undefined = undefined) {
  if (decimalPlaces !== undefined) {
    calcStore.setDecimalPlaces(decimalPlaces);
  }
  if (calcStore.decimalPlaces === -2) {
    // -2은 소수점 표시 제한 없음을 의미한다.
    localeOptions.minimumFractionDigits = 0;
    localeOptions.maximumFractionDigits = 20;
  } else {
    localeOptions.minimumFractionDigits = calcStore.decimalPlaces;
    localeOptions.maximumFractionDigits = calcStore.decimalPlaces;
  }
}

// 숫자를 표준 로케일 문자열로 변환하는 함수
function toLocale (value: number): string {
  return value.toLocaleString(locale, localeOptions);
}

// 계산 결과를 표시하는 변수 선언
const result = ref('');
// const resultRef = ref<HTMLDivElement | null>(null);

// 연산자를 표시하는 변수 선언
const operator = ref('');

// 계산 결과가 길 경우 툴팁 표시 상태 변수 선언
const needResultTooltip = ref(false);

function setNeedResultTooltip () {
  // 원래 결과 칸 길이
  const ow = document.getElementById('result')?.offsetWidth ?? 0;
  // 결과 문자열의 크기
  // (원래 칸에 결과 길이가 넘치면 스크롤 해야하는데 ...로 대체 시킨 경우 스크롤해야할 폭 값만 커진다.)
  const sw = document.getElementById('result')?.scrollWidth ?? 0;
  // 원래의 칸 크기보다 결과 문자열 길이가 길면 툴팁을 표시
  needResultTooltip.value = ow < sw;
  // if (ow < sw) console.log(historyRef.value)
}

// 계산 결과, 연산자, 툴팁을 갱신하는 함수
function refreshDisplay () {
  // 소수점 고정이 아니고 결과에 수소점이 있으면 소수점 표시를 해야한다.
  if (calcStore.decimalPlaces === -2 && calc.getShownNumber().indexOf('.') !== -1) {
    const [integer, decimal] = calc.getShownNumber().split('.');
    result.value = `${toLocale(Number(integer))}.${decimal}`;
  } else {
    result.value = toLocale(Number(calc.getShownNumber()));
  }
  operator.value = calc.getOperatorString() as string;
}

// 두 변수를 감시하여 달라지면 결과를 갱신하여 표시
watch([calc, localeOptions], () => {
  refreshDisplay();
});

const $q = useQuasar();

// TODO: 창에서 선택한 내용이 있으면 선택한 내용을 클립보드에 복사하고
//       아니면 계산 결과를 클립보드에 복사하는 기능으로 수정 필요
function doCopy (): void {
  copyToClipboard(result.value)
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
}

function doPaste (): void {
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
}

function toggleUseGrouping (): void {
  calcStore.toggleUseGrouping();
  setUseGrouping();
}

function incDecimalPlaces (): void {
  calcStore.incDecimalPlaces();
  setDecimalPlaces();
}

function decDecimalPlaces (): void {
  calcStore.decDecimalPlaces();
  setDecimalPlaces();
}

// 버튼 레이블, 버튼 컬러, 버튼에 해당하는 키, 버튼 클릭 이벤트 핸들러
type Button = [string, string, string[], () => void][];

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

type Shortcut = [string[], () => void][];

const shortcuts: Shortcut = [
  [['Control+c', 'Control+Insert', 'Copy'], doCopy],
  [['Control+v', 'Shift+Insert', 'Paste'], doPaste],
  [[','], toggleUseGrouping],
  [['['], decDecimalPlaces],
  [[']'], incDecimalPlaces],
  [
    ['h'],
    () => {
      if (!doDeleteHistory.value) {
        showHistory.value = !showHistory.value;
      }
    },
  ],
  [
    ['d'],
    () => {
      if (showHistory.value) {
        doDeleteHistory.value = true;
      }
    },
  ],
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

  // 초기 화면 갱신
  refreshDisplay();
});

// dom 요소가 언마운트되기 전에 키바인딩 제거
onBeforeUnmount(() => {
  keybindingRemoveAtUmount();
});

const showHistory = ref(false);

const resultHistory = computed(() => (calc.getHistory() as unknown) as History[]);

const doDeleteHistory = ref(false);

const operatorIcon: { [key: string]: string } = {
  '+': 'mdi-plus-box',
  '-': 'mdi-minus-box',
  '×': 'mdi-close-box',
  '÷': 'mdi-division-box',
}

const isGoTopInHistory = ref(false);

function onScroll (evt: Event) {
  // console.log((evt.target as HTMLDivElement).scrollTop);
  if ((evt.target as HTMLDivElement).scrollTop > 50) {
    isGoTopInHistory.value = true;
  } else {
    isGoTopInHistory.value = false;
  }
}

function goTopInHistory () {
  document.getElementById('history')?.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
  <q-page id="qcalc" @focusin="($event.target as HTMLElement).blur()">
    <q-card flat class="row wrap q-px-md q-py-xs">
      <q-card-section
        class="noselect col-9 row no-wrap items-center justify-start q-py-none q-px-xs"
      >
        <q-checkbox
          v-model="calcStore.useGrouping"
          label="쉼표: "
          left-label
          class="q-ml-sm"
          @click="setUseGrouping()"
        />
        <div class="col-7 row no-wrap items-center">
          <my-tooltip>
            소수점 고정 상태:
            {{
              calcStore.decimalPlaces == -2
                ? '제한 없음'
                : `${calcStore.decimalPlaces} 자리`
            }}
          </my-tooltip>
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
              <div
                class="cursor-pointer"
                :class="(markerList[0] as any).classes"
                :style="(markerList[0] as any).style"
                @click="setDecimalPlaces((markerList[0] as any).value)"
              >
                x
              </div>
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

      <q-card-section
        class="noselect col-3 row no-wrap justify-end q-py-none q-px-sm"
      >
        <!-- <q-btn class="q-pr-xs" flat v-if="operator" :label="operator">
          <my-tooltip>현재 연산자</my-tooltip>
        </q-btn> -->
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
          class="q-ma-none q-pa-none q-pl-xs"
          @click="doPaste"
        >
          <my-tooltip>클릭하면 숫자를 붙혀넣습니다.</my-tooltip>
        </q-btn>
        <q-btn
          flat
          icon="history"
          color="primary"
          class="q-ma-none q-pa-none q-pl-xs q-pr-xs"
          @click="showHistory = true"
        >
          <my-tooltip>클릭하면 계산 결과 기록을 봅니다.</my-tooltip>
        </q-btn>
      </q-card-section>
      <q-card-section class="col-12 q-px-sm q-pt-none q-pb-sm">
        <q-field
          :model-value="result"
          class="shadow-4 self-center"
          filled
          dense
          :bg-color="needResultTooltip ? 'amber-2' : 'grey-2'"
        >
          <template v-slot:prepend v-if="operator != ''">
            <div class="full-height q-mt-xs q-pt-xs">
              <q-icon :name="operatorIcon[operator]" />
            </div>
          </template>
          <template v-slot:control>
<<<<<<< HEAD
            <div
              ref="resultRef"
              v-mutation="setNeedResultTooltip"
              v-mutation.characterData
              class="self-center full-width no-outline ellipsis text-h4 text-right"
            >
=======
            <div id="result" ref="resultRef" v-mutation="setNeedResultTooltip" v-mutation.characterData
              class="self-center full-width no-outline ellipsis text-h4 text-right">
>>>>>>> ff3fbca (히스토리에서 맨위로 가기 기능 추가)
              {{ result }}
              <my-tooltip v-if="needResultTooltip">{{ result }}</my-tooltip>
            </div>
          </template>
        </q-field>
      </q-card-section>

      <q-card-section
        class="noselect col-3 q-pa-sm"
        v-for="(button, index) in buttons"
        :key="index"
      >
        <q-btn
          class="glossy shadow-4 text-h5 full-width"
          style="overflow: auto; min-height: 44px; max-height: 44px"
          no-caps
          :label="button[0].charAt(0) != '@' ? button[0] : undefined"
          :icon="button[0].charAt(0) == '@' ? button[0].slice(1) : undefined"
          :color="button[1]"
          @click="button[3]"
        />
      </q-card-section>
    </q-card>
  </q-page>

  <q-dialog
    v-model="showHistory"
    style="z-index: 10"
    position="bottom"
    transition-duration="300"
  >
    <q-bar
      dark
      class="noselect bg-primary text-white"
      @focusin="($event.target as HTMLElement).blur()"
    >
      <q-icon name="history" />
      <div>계산 결과</div>

      <q-space />

      <q-btn dense flat icon="delete_outline" @click="doDeleteHistory = true" />
      <q-btn dense flat icon="close" @click="showHistory = false" />
    </q-bar>
<<<<<<< HEAD
    <q-card @scroll="onScroll" class="scroll relative-position" id="history">
      <q-bar
        id="goTop"
        class="row justify-around full-width fixed dark bg-teal text-white cursor-pointer"
        v-show="isGoTopInHistory"
        style="z-index: 12"
        @click="goTopInHistory"
      >
        <q-btn dense flat icon="publish" />
      </q-bar>
      <q-card-section>
        <q-list separator>
          <q-item
            v-for="(item, index) in resultHistory"
            :key="index"
            class="text-right q-pa-sm"
          >
=======
    <q-card @scroll="onScroll" class="row justify-center items-start scroll relative-position" id="history">
      <!-- <q-bar id='goTop' class="row justify-around full-width fixed dark bg-teal text-white cursor-pointer"
        v-show="isGoTopInHistory" style="z-index: 12" @click="goTopInHistory">
        <q-btn dense flat icon="publish" />
      </q-bar> -->
      <transition name="slide-fade">
        <q-btn round glossy color="secondary" icon="publish" id="goTop" class="fixed q-ma-md" v-if="isGoTopInHistory"
          style="z-index: 12" @click="goTopInHistory" transition-show="slide-down" transition-hide="slide-down" />
      </transition>
      <q-card-section class='full-width'>
        <q-item v-if="resultHistory.length == 0" class="text-center">
          <q-item-section>
            <q-item-label>
              <span>계산 결과가 없습니다.</span>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-list v-else separator>
          <q-separator />
          <q-item v-for=" (item, index) in resultHistory" :key="index" class="text-right q-pa-sm">
>>>>>>> ff3fbca (히스토리에서 맨위로 가기 기능 추가)
            <q-item-section>
              <q-item-label>
                {{
                  ['+', '-', '×', '÷'].includes(item.operator)
                    ? `${toLocale(item.preNumber)} ${item.operator} ${toLocale(
                        item.argNumber as number
                      )}`
                    : ['%'].includes(item.operator)
                    ? `${toLocale(item.preNumber)} / ${toLocale(
                        item.argNumber as number
                      )} * 100`
                    : ['rec', 'pow2', 'sqrt'].includes(item.operator)
                    ? `${item.operator} ( ${toLocale(item.preNumber)} )`
                    : toLocale(item.preNumber)
                }}
              </q-item-label>
              <q-item-label>
                {{ `= ${toLocale(item.resultNumber)}` }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="doDeleteHistory"
    persistent
    transition-show="scale"
    transition-hide="scale"
    style="z-index: 15"
  >
    <q-card class="noselect bg-teal text-white" style="width: 200px">
      <q-card-section> 계산 기록을 지우겠어요? </q-card-section>

      <q-card-actions align="center" class="bg-white text-teal">
        <q-btn flat label="아니" v-close-popup />
        <q-btn
          flat
          label="ㅇㅇ"
          @click="calc.clearHistory()"
          autofocus
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-btn >>> .q-icon {
  font-size: 24px;
}

#history {
  max-height: calc(100vh - 195px);
  min-height: calc(100vh - 195px);
  max-width: calc(100vw - 45px);
}

.q-bar {
  max-width: calc(100vw - 45px);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
