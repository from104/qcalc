<script setup lang="ts">
  /**
   * @file RadixPanel.vue
   * @description 이 파일은 진법 변환 패널을 구성하는 Vue 컴포넌트입니다.
   *              사용자가 다양한 진법(2진수, 8진수, 10진수, 16진수 등) 간의 변환을 수행할 수 있도록
   *              진법 선택 및 변환 기능을 제공합니다.
   *              또한, 진법 스왑 및 최근 사용한 진법 초기화 기능을 포함하고 있습니다.
   */

  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import type { ComputedRef } from 'vue';
  import { onMounted, onBeforeUnmount, reactive, watch, computed } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // 계산기 관련 타입과 클래스
  import { KeyBinding } from 'classes/KeyBinding';
  import { Radix } from 'classes/RadixConverter';

  // 스토어 import
  import { useUIStore } from 'stores/uiStore';
  import { useSettingsStore } from 'stores/settingsStore';
  import { useRadixStore } from 'stores/radixStore';
  import { useCalcStore } from 'src/stores/calcStore';

  // 스토어 인스턴스 생성
  const uiStore = useUIStore();
  const settingsStore = useSettingsStore();
  const radixStore = useRadixStore();
  const calcStore = useCalcStore();

  // 컴포넌트 import
  import ToolTip from 'src/components/snippets/ToolTip.vue';

  // 단위 초기화
  radixStore.initRecentRadix();

  // 언어 변경 시 비트 표시 업데이트
  watch([() => settingsStore.locale], () => {
    wordSizeOptions.values.forEach((option, index) => {
      const value = index === 0 ? '∞' : option.value.toString();
      option.label = `${value} ${t('bit')}`;
    });
  });

  // 키 바인딩 설정
  const keyBinding = new KeyBinding([
    [['\\'], () => document.getElementById('btn-swap-radix')?.click()],
    [['Alt+\\'], () => radixStore.toggleShowRadix()],
    [['Alt+Control+\\'], () => radixStore.setRadixType(radixStore.radixType == 'prefix' ? 'suffix' : 'prefix')],
  ]);

  // 입력 포커스에 따른 키 바인딩 활성화/비활성화
  watch(
    () => uiStore.inputFocused,
    () => {
      if (uiStore.inputFocused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
  );

  onMounted(() => {
    radixStore.initRecentRadix();
    calcStore.calc.wordSize = radixStore.wordSize;
    keyBinding.subscribe();
  });

  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
    uiStore.setInputBlurred();
  });

  // 워드사이즈 옵션 타입 정의
  type WordSizeOption = {
    value: number;
    label: string;
  };

  // 워드사이즈 옵션 초기화
  const wordSizeOptions = reactive({
    values: [0, 4, 8, 16, 32, 64].map((value) => ({
      value,
      label: `${value || '∞'}${t('bit')}`,
    })),
  } as { values: WordSizeOption[] });

  // RadixOption 인터페이스 수정
  interface RadixOption {
    value: Radix;
    label: ComputedRef<string>;
  }

  interface ReactiveRadixOptionList {
    values: RadixOption[];
  }

  const radixList = Object.values(Radix);

  // 진법 옵션 초기화 시 computed 사용
  const createRadixOptions = () =>
    radixList.map((radix) => ({
      value: radix,
      label: computed(() => t(`radixLabel.${radix}`)),
    }));

  const sourceRadixOptions = reactive<ReactiveRadixOptionList>({
    values: createRadixOptions(),
  });

  const targetRadixOptions = reactive<ReactiveRadixOptionList>({
    values: createRadixOptions(),
  });

  watch(
    () => radixStore.sourceRadix,
    () => (calcStore.calc.currentRadix = radixStore.sourceRadix),
  );

  // 단순화된 컴퓨티드 속성
  const sourceSelectOptions = computed(() => sourceRadixOptions.values);

  const targetSelectOptions = computed(() => targetRadixOptions.values);

  const handleRadixSwap = () => {
    radixStore.swapRadixes();
    calcStore.calc.needsBufferReset = true;
  };

  // settingsStore에서 select 색상을 가져오는 computed 속성
  const selectTextColor = computed(() => settingsStore.getSelectColor('text'));
  const selectBackgroundColor = computed(() => settingsStore.getSelectColor('background'));
</script>

<template>
  <q-card-section v-auto-blur class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 워드사이즈 선택 -->
    <q-select
      v-model="radixStore.wordSize"
      :options="wordSizeOptions.values"
      role="combobox"
      :aria-label="t('ariaLabel.wordSize')"
      dense
      options-dense
      emit-value
      map-options
      option-value="value"
      option-label="label"
      behavior="menu"
      class="col-3 q-pa-none shadow-2"
      :label="t('radixLabel.wordSize')"
      :label-color="selectTextColor"
      :class="`bg-${selectBackgroundColor}`"
      :popup-content-class="[`bg-${selectBackgroundColor}`, 'scrollbar-custom', 'q-select-popup'].join(' ')"
      :options-selected-class="`text-${selectTextColor}`"
      :color="selectTextColor"
      :bg-color="selectBackgroundColor"
      :popup-content-style="{ backgroundColor: selectBackgroundColor, color: selectTextColor }"
      @update:model-value="() => (calcStore.calc.wordSize = radixStore.wordSize)"
    />

    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" role="img" :aria-label="t('ariaLabel.sourceDirection')" />

    <!-- 원본 진법 -->
    <q-select
      v-model="radixStore.sourceRadix"
      :options="sourceSelectOptions"
      role="combobox"
      :aria-label="t('ariaLabel.sourceRadix')"
      dense
      options-dense
      emit-value
      map-options
      option-value="value"
      option-label="label"
      behavior="menu"
      class="col-3 q-pl-xs-sm shadow-2"
      :label="t('radixLabel.main')"
      :label-color="selectTextColor"
      :options-selected-class="`text-${selectTextColor}`"
      :popup-content-class="[`bg-${selectBackgroundColor}`, 'scrollbar-custom', 'q-select-popup'].join(' ')"
      :class="`bg-${selectBackgroundColor}`"
      :color="selectTextColor"
      :bg-color="selectBackgroundColor"
      :popup-content-style="{ backgroundColor: selectBackgroundColor, color: selectTextColor }"
    />

    <!-- 원본, 대상 진법 바꾸기 버튼 -->
    <q-btn
      id="btn-swap-radix"
      v-auto-blur
      dense
      round
      flat
      icon="swap_horiz"
      size="md"
      class="col-1 q-mx-none q-px-sm blur"
      role="button"
      :aria-label="t('ariaLabel.swapRadix')"
      :style="{ color: selectTextColor, backgroundColor: selectBackgroundColor }"
      @click="handleRadixSwap"
    >
      <ToolTip :auto-hide="3000" :text="t('tooltipSwap')" />
    </q-btn>

    <!-- 대상 진법 -->
    <q-select
      v-model="radixStore.targetRadix"
      :options="targetSelectOptions"
      role="combobox"
      :aria-label="t('ariaLabel.targetRadix')"
      dense
      options-dense
      emit-value
      map-options
      option-value="value"
      option-label="label"
      behavior="menu"
      class="col-3 q-pl-xs-sm shadow-2"
      :label="t('radixLabel.sub')"
      :label-color="selectTextColor"
      :class="`bg-${selectBackgroundColor}`"
      :popup-content-class="[`bg-${selectBackgroundColor}`, 'scrollbar-custom', 'q-select-popup'].join(' ')"
      :options-selected-class="`text-${selectTextColor}`"
      :color="selectTextColor"
      :bg-color="selectBackgroundColor"
      :popup-content-style="{ backgroundColor: selectBackgroundColor, color: selectTextColor }"
    />

    <!-- 대상 방향 -->
    <q-icon
      name="keyboard_double_arrow_down"
      size="xs"
      class="col-1 q-px-none"
      role="img"
      :aria-label="t('ariaLabel.targetDirection')"
    />
  </q-card-section>
</template>

<style scoped lang="scss">
  $left: 2px;
  :deep(.q-field__control) {
    padding-left: $left !important;
    font-size: 0.81rem;
    .q-field__native {
      padding-left: $left !important;
    }
    .q-field__append {
      padding-left: $left !important;
    }
  }

  .q-select-popup {
    .q-item {
      @media (prefers-color-scheme: dark) {
        border-top: 1px dotted rgba(255, 255, 255, 0.377);
        border-bottom: 1px dotted rgba(255, 255, 255, 0.377);
      }
    }
  }
</style>

<i18n lang="yaml5">
  ko:
    tooltipSwap: 진법 바꾸기
    radixLabel:
      bin: 2진수
      oct: 8진수
      dec: 10진수
      hex: 16진수
      main: 변환 전
      sub: 변환 후
      wordSize: 워드크기
    bit: 비트
    ariaLabel:
      wordSize: '워드 크기 선택'
      sourceDirection: '원본 진법 방향'
      targetDirection: '대상 진법 방향'
      sourceRadix: '원본 진법 선택'
      targetRadix: '대상 진법 선택'
      swapRadix: '원본과 대상 진법 바꾸기'
  en:
    tooltipSwap: Swap Radix
    radixLabel:
      bin: Binary
      oct: Octal
      dec: Decimal
      hex: Hexadecimal
      main: Before
      sub: After
      wordSize: Word Size
    bit: Bit
    ariaLabel:
      wordSize: 'Select word size'
      sourceDirection: 'Source radix direction'
      targetDirection: 'Target radix direction'
      sourceRadix: 'Select source radix'
      targetRadix: 'Select target radix'
      swapRadix: 'Swap source and target radix'
</i18n>
