<script setup lang="ts">
import { ref, computed, onBeforeMount, onMounted } from 'vue';

import type { History } from 'classes/Calculator';

import { useCalcStore } from 'stores/calc-store';

import MyTooltip from 'components/MyTooltip.vue';

const props = withDefaults(defineProps<{ addon?: string }>(), {
  addon: 'none',
});

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

// 이 코드는 계산한 결과를 나타내는 상수입니다.
const result = computed(() => {
  // 표시된 숫자를 받아옵니다.
  const shownNumber = calc.getShownNumber();

  // integer는 정수 부분, decimal은 소수 부분으로 shownNumber를 분리합니다.
  const [integer, decimal] = shownNumber.split('.');

  // baseResult는 조건에 따라 두가지 형식 중 하나로 표시된 숫자를 변환합니다.
  // 만약 store의 decimalPlaces가 -2이며, decimal 부분이 있으면 소수점 표현으로, 그 외의 경우는 일반적으로 소수 변환으로 표현합니다.
  const baseResult =
    store.decimalPlaces == -2 && decimal
      ? `${store.toLocale(Number(integer))}.${decimal}`
      : store.toLocale(Number(shownNumber));

  // store에서 단위 표시가 활성화되어 있고, 애드온이 'unit'일 경우
  if (store.showUnit && props.addon == 'unit') {
    // 사용할 단위를 결정합니다.
    const unit = store.recentUnitFrom[store.recentCategory];
    // 이 단위와 baseResult를 결합하여 반환합니다.
    return [baseResult, unit].join(' ');
  }
  // store에서 기호 표시가 활성화되어 있고, 애드온이 'currency'일 경우
  else if (store.showSymbol && props.addon == 'currency') {
    // 기호를 가져옵니다. 또한 현재 환율로부터 해당 기호를 찾을 수 없는 경우에 대비하여 기본값을 설정합니다.
    const symbol = store.currencyConverter?.getSymbol(store.recentCurrencyFrom) ?? '';
    // 이 기호와 baseResult를 결합하여 반환합니다.
    return [symbol, baseResult].join(' ');
  } else {
    // 둘 다 아닌 경우, 조건에 해당하는 'else'에서는 baseResult를 그대로 반환합니다.
    return baseResult;
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
