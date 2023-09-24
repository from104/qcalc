<script setup lang="ts">
import { ref, computed, onBeforeMount, onMounted, watch } from 'vue';

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
const setNeedResultTooltip = () => {
  // 원래 결과 칸 길이
  const ow = document.getElementById('result')?.offsetWidth ?? 0;
  // 결과 문자열의 크기
  // (원래 칸에 결과 길이가 넘치면 스크롤 해야하는데 ...로 대체 시킨 경우 스크롤해야할 폭 값만 커진다.)
  const sw = document.getElementById('result')?.scrollWidth ?? 0;
  // 원래의 칸 크기보다 결과 문자열 길이가 길면 툴팁을 표시
  needResultTooltip.value = ow < sw;

  return true;
}


const getResult = () => {
  const currentNumber = calc.getCurrentNumber();
  const currentNumbers = currentNumber.split('.');
  const toLocaleNumber = store.toLocale(currentNumber);
  const toLocaleNumbers = toLocaleNumber.split('.');
  const hasDecimalPlaces = store.decimalPlaces === -2 && currentNumbers.length > 1;
  const baseResult =
    hasDecimalPlaces
      ? `${toLocaleNumbers[0]}.${currentNumbers[1]}`
      : toLocaleNumbers.join('.');

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
}

const result = ref(getResult());

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

const getPreResult = () => {
  // 'history'는 계산의 직전 결과 기록을 가져옵니다.
  const history = resultHistory.value;
  // 'shouldReset'은 다음 입력시 계산기가 초기화 될지 판단합니다.
  const shouldReset = calc.getShouldReset();

  // 'operatorExists'는 현재 입력된 연산자의 존재 여부를 확인합니다.
  const operatorExists = operator.value != '';

  // 계산 기록이 있고, 초기화 될 예정이며, 직전의 history의 결과와 현재의 결과와 같다면
  if (
    history.length > 0
    && shouldReset
    && calc.getCurrentNumber() == history[0].resultNumber
    //  && prevHistoryId != (history[0].id as number)
  ) {
    // 이전 이력의 ID를 현재 이력의 ID로 설정하고 계산 이력의 왼쪽 값을 가져온 후 '='으로 결합해서 출력합니다.
    return [store.getLeftSideInHistory(history[0]), '='].join(' ');
  }
  // 입력된 연산자가 있고 초기화 예정이 아니라면
  else if (operatorExists && !shouldReset) {
    // 백업된 숫자를 현재 지역의 표기법으로 변환하여 반환합니다.
    return store.toLocale(calc.getPreviousNumber());
  } else {
    // 위의 조건에 해당하지 않는 경우, 빈 문자열을 반환합니다.
    return '';
  }
}

const preResult = ref(getPreResult());

watch([calc, () => store.useGrouping, () => store.decimalPlaces, () => store.showUnit, () => store.showSymbol], () => {
  result.value = getResult();
  preResult.value = getPreResult();
  setNeedResultTooltip();
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
      class="shadow-2 justify-end self-center"
      filled
      dense
      readonly
      :bg-color="!needResultTooltip ? 'light-green-3' : 'deep-orange-2'"
      label-slot
      stack-label
    >
      <template v-slot:prepend v-if="operator != ''">
        <div class="text-black noselect full-height q-mt-xs q-pt-sm" v-blur>
          <q-icon :name="operatorIcons[operator]" />
        </div>
      </template>
      <template v-slot:label>
        <div id="preResult" class="text-black noselect" v-blur>
          {{ preResult }}
        </div>
      </template>
      <template v-slot:control>
        <div
          id="result"
          v-mutation="setNeedResultTooltip"
          v-mutation.characterData
          class="self-center full-width no-outline ellipsis text-right text-h5 text-black"
        >
          {{ result }}
          <MyTooltip v-if="needResultTooltip">{{ result }}</MyTooltip>
        </div>
      </template>
    </q-field>
  </q-card-section>
</template>

<style scoped lang="scss">
@font-face {
  font-family: 'digital-7-mono-italic';
    src: url('../../public/digital-7.monoitalic.ttf') format('truetype');
}

#result {
  font-family: 'digital-7-mono-italic';
  font-size: 40px;
  padding-bottom: 10px;
}
.q-field {
  &::v-deep {
    .q-field__label {
      right: -100%;
      text-align: right;
      font-size: 20px;
      top: 10px;
    }
  }
}

</style>
