<script setup lang="ts">
  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { onMounted, onBeforeUnmount, reactive, watch } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // 계산기 관련 타입과 클래스
  import { KeyBinding } from 'classes/KeyBinding';
  import { Radix } from 'classes/RadixConverter';

  // 스토어 관련
  // 스토어 관련
  import { useStore } from 'src/stores/store';
  // 스토어 인스턴스 초기화
  const store = useStore();
  // 스토어에서 필요한 메서드 추출
  const { swapRadixes, initRecentRadix, clickButtonById, setInputBlurred, calc } = store;

  // 컴포넌트 import
  import ToolTip from 'src/components/snippets/ToolTip.vue';

  // 단위 초기화
  initRecentRadix();

  // 언어 변경 시 비트 표시 업데이트
  watch([() => store.locale], () => {
    wordSizeOptions.values.forEach((option, index) => {
      const value = index === 0 ? '∞' : option.value.toString();
      option.label = `${value} ${t('bit')}`;
    });
  });

  // 키 바인딩 설정
  const keyBinding = new KeyBinding([
    [['Alt+w'], () => clickButtonById('btn-swap-radix')],
    [['Alt+y'], () => store.toggleShowRadix()],
    [['Alt+u'], () => store.setRadixType(store.radixType == 'prefix' ? 'suffix' : 'prefix')],
  ]);

  // 입력 포커스에 따른 키 바인딩 활성화/비활성화
  watch(
    () => store.inputFocused,
    () => {
      if (store.inputFocused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
  );

  onMounted(() => {
    initRecentRadix();
    store.updateWordSize(store.wordSize);
    keyBinding.subscribe();
  });

  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
    setInputBlurred();
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

  // 진법 옵션 타입 정의
  type RadixOption = {
    value: string;
    label: string;
    disable?: boolean;
  };

  type ReactiveRadixOptionList = {
    values: RadixOption[];
  };

  // 진법 옵션 초기화
  const sourceRadixOptions = reactive({ values: [] } as ReactiveRadixOptionList);
  const targetRadixOptions = reactive({ values: [] } as ReactiveRadixOptionList);

  // 진법 옵션 업데이트
  watch(
    [() => store.sourceRadix, () => store.targetRadix],
    () => {
      const radixList = Object.values(Radix);

      // 'From' 진법 옵션 설정
      sourceRadixOptions.values = radixList.map((radix) => ({
        value: radix,
        label: t(`radixLabel.${radix}`),
        disable: store.targetRadix === radix,
      }));

      // 'To' 진법 옵션 설정
      targetRadixOptions.values = radixList.map((radix) => ({
        value: radix,
        label: t(`radixLabel.${radix}`),
        disable: store.sourceRadix === radix,
      }));
      calc.currentRadix = store.sourceRadix;
    },
    { immediate: true },
  );
</script>

<template>
  <q-card-section v-auto-blur class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 워드사이즈 선택 -->
    <q-select
      v-model="store.wordSize"
      :options="wordSizeOptions.values"
      role="combobox"
      :aria-label="t('ariaLabel.wordSize')"
      dense
      options-dense
      emit-value
      map-options
      option-value="value"
      option-label="label"
      class="col-3 q-pa-none shadow-2"
      :label="t('radixLabel.wordSize')"
      :label-color="!store.isDarkMode() ? 'primary' : 'grey-1'"
      :class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :options-selected-class="!store.isDarkMode() ? 'text-primary' : 'text-grey-1'"
      @update:model-value="store.updateWordSize($event)"
    />

    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" role="img" :aria-label="t('ariaLabel.sourceDirection')" />

    <!-- 원본 진법 -->
    <q-select
      v-model="store.sourceRadix"
      :options="sourceRadixOptions.values"
      role="combobox"
      :aria-label="t('ariaLabel.sourceRadix')"
      dense
      options-dense
      emit-value
      map-options
      option-value="value"
      option-label="label"
      class="col-3 q-pl-xs-sm shadow-2"
      :label="t('radixLabel.main')"
      :label-color="!store.isDarkMode() ? 'primary' : 'grey-1'"
      :options-selected-class="!store.isDarkMode() ? 'text-primary' : 'text-grey-1'"
      :popup-content-class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
    />

    <!-- 원본, 대상 진법 바꾸기 버튼 -->
    <q-btn
      id="btn-swap-radix"
      dense
      round
      flat
      icon="swap_horiz"
      size="md"
      class="col-1 q-mx-none q-px-sm blur"
      role="button"
      :aria-label="t('ariaLabel.swapRadix')"
      @click="swapRadixes()"
    >
      <ToolTip>{{ t('tooltipSwap') }}</ToolTip>
    </q-btn>

    <!-- 대상 진법 -->
    <q-select
      v-model="store.targetRadix"
      :options="targetRadixOptions.values"
      role="combobox"
      :aria-label="t('ariaLabel.targetRadix')"
      dense
      options-dense
      emit-value
      map-options
      option-value="value"
      option-label="label"
      class="col-3 q-pl-xs-sm shadow-2"
      :label="t('radixLabel.sub')"
      :label-color="!store.isDarkMode() ? 'primary' : 'grey-1'"
      :class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :options-selected-class="!store.isDarkMode() ? 'text-primary' : 'text-grey-1'"
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
