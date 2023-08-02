<script setup lang="ts">
import { ref, computed, onBeforeMount, onMounted } from 'vue';

import type { History } from 'classes/Calculator';

import { useCalcStore } from 'stores/calc-store';

import MyTooltip from 'components/MyTooltip.vue';

// 스토어 가져오기
const store = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const calc = store.calc;

// 계산 결과 툴팁 표시 상태 변수
const needResultTooltip = ref(false);

// 계산 결과가 길 경우 툴팁 표시 상태 셋팅
function setNeedResultTooltip() {
  // 원래 결과 칸 길이
  const ow = document.getElementById('result')?.offsetWidth ?? 0;
  // 결과 문자열의 크기
  // (원래 칸에 결과 길이가 넘치면 스크롤 해야하는데 ...로 대체 시킨 경우 스크롤해야할 폭 값만 커진다.)
  const sw = document.getElementById('result')?.scrollWidth ?? 0;
  // 원래의 칸 크기보다 결과 문자열 길이가 길면 툴팁을 표시
  needResultTooltip.value = ow < sw;
}

const result = computed(() => {
  if (store.decimalPlaces == -2 && calc.getShownNumber().indexOf('.') !== -1) {
    const [integer, decimal] = calc.getShownNumber().split('.');
    return `${store.toLocale(Number(integer))}.${decimal}`;
  } else {
    return store.toLocale(Number(calc.getShownNumber()));
  }
});

// 계산 결과 배열
const resultHistory = computed(() => calc.getHistory() as History[]);

const operator = computed(() => calc.getOperatorString() as string);

// 사칙연산 표시 아이콘 배열
const operatorIcons: { [key: string]: string } = {
  '+': 'mdi-plus-box',
  '-': 'mdi-minus-box',
  '×': 'mdi-close-box',
  '÷': 'mdi-division-box',
};

let prevHistoryId = 0;

const preResult = computed(() => {
  const history = resultHistory.value;
  if (history.length > 0 && calc.getWillReset()) {
    // 이전 결과가 있고, 계산기가 리셋될 예정이면
    if (prevHistoryId != history[0].id as number) {
      // 이전 결과의 id와 현재 결과의 id가 다르면
      if (result.value == store.toLocale(history[0].resultNumber)) {
        // 현재 결과가 이전 결과와 같으면
        prevHistoryId = history[0].id as number;
        return [store.getLeftSideInHistory(history[0]), '='].join(' ');
      }
    }
  } else if (operator.value != '' && !calc.getWillReset()) {
    // 연산자가 있고, 계산기가 리셋되지 않을 예정이면
    return store.toLocale(calc.getBackupNumber());
  }
  return '';
});

onBeforeMount(() => {
  window.addEventListener('resize', setNeedResultTooltip);
  if (store.initPanel) {
    calc.clear();
  }
});

onMounted(() => {
  setNeedResultTooltip();
});
</script>

<template>
  <q-card-section class="col-12 q-px-sm q-pt-md q-pb-sm">
    <q-field
      :model-value="result"
      class="shadow-4 justify-end self-center"
      filled
      dense
      readonly
      :bg-color="
        needResultTooltip
          ? store.darkMode
            ? 'blue-grey-9'
            : 'amber-2'
          : undefined
      "
      label-slot
      stack-label
    >
      <template v-slot:prepend v-if="operator != ''">
        <div
          class="noselect full-height q-mt-xs q-pt-xs"
          v-blur
        >
          <q-icon :name="operatorIcons[operator]" />
        </div>
      </template>
      <template v-slot:label>
        <div class="noselect" v-blur>
          {{ preResult }}
        </div>
      </template>
      <template v-slot:control>
        <div
          id="result"
          v-mutation="setNeedResultTooltip"
          v-mutation.characterData
          class="self-center full-width no-outline ellipsis text-h4 text-right"
        >
          {{ result }}
          <MyTooltip v-if="needResultTooltip">{{ result }}</MyTooltip>
        </div>
      </template>
    </q-field>
  </q-card-section>
</template>

<style scoped lang="scss">
.q-field {
  &::v-deep {
    .q-field__label {
      right: -100%;
      text-align: right;
      font-size: 20px;
      top: 8px;
    }
  }
}
</style>
