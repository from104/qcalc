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
  const mainField = document.getElementById('mainField');
  if (!mainField) return false;

  needResultTooltip.value = mainField.offsetWidth < mainField.scrollWidth;
  return true;
}

const getResult = () => {
  const currentNumber = calc.getCurrentNumber();
  const toFormattedNumber = store.toFormattedNumber(currentNumber);
  return store.decimalPlaces === -2 && currentNumber.includes('.')
    ? `${toFormattedNumber.split('.')[0]}.${currentNumber.split('.')[1]}`
    : toFormattedNumber;
}

const result = ref(getResult());

// 화폐 기호를 앞에 붙일지 여부
const symbol = computed(() =>
  props.addon == 'currency' && store.showSymbol
    ? store.currencyConverter?.getSymbol(store.recentCurrencyFrom) ?? ''
    : ''
);

// 단위를 뒤에 붙일지 여부
const unit = computed(() =>
  props.addon == 'unit' && store.showUnit ? ' '+store.recentUnitFrom[store.recentCategory] ?? '' : ''
);

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
    return store.toFormattedNumber(calc.getPreviousNumber());
  } else {
    // 위의 조건에 해당하지 않는 경우, 빈 문자열을 반환합니다.
    return '';
  }
}

const preResult = ref(getPreResult());

watch(
  [
    calc,
    () => store.useGrouping,
    () => store.decimalPlaces,
    () => store.showUnit,
    () => store.recentCategory,
    () => store.recentUnitFrom[store.recentCategory],
    () => store.recentUnitTo[store.recentCategory],
    () => store.showSymbol,
    () => store.recentCurrencyFrom,
    () => store.recentCurrencyTo,
  ],
  () => {
    result.value = getResult();
    preResult.value = getPreResult();
    setNeedResultTooltip();
  }
);

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
      <template v-slot:label>
        <div id="preResult" class="text-black noselect" v-blur>
          {{ preResult }}
        </div>
      </template>
      <template v-slot:prepend v-if="operator != ''">
        <div class="text-black noselect full-height q-mt-xs q-pt-sm" v-blur>
          <q-icon :name="operatorIcons[operator]" />
        </div>
      </template>
      <template v-slot:control>
        <div
          id="mainField"
          v-mutation="setNeedResultTooltip"
          v-mutation.characterData
          class="self-center no-outline full-width ellipsis text-right text-h5 text-black"
        >
        <span id="symbol">{{ symbol }}</span>
        <span id="result">{{ result }}</span>
        <span id="unit">{{ unit }}</span>
          <MyTooltip v-if="needResultTooltip">{{ symbol+result+unit }}</MyTooltip>
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

#symbol {
  font-size: 35px;
}

#result {
  font-family: 'digital-7-mono-italic';
  font-size: 38px;
  padding-bottom: 8px;
}

#unit {
  font-size: 22px;
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
