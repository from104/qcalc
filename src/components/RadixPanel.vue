<script setup lang="ts">
  import { onMounted, onBeforeUnmount, reactive, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { KeyBinding } from 'classes/KeyBinding';
  import { Radix } from 'classes/RadixConverter';
  import { useStoreSettings } from 'src/stores/store-settings';
  import { useStoreRadix } from 'src/stores/store-radix';
  import { useStoreUtils } from 'src/stores/store-utils';

  import MyTooltip from 'components/MyTooltip.vue';

  // i18n 설정
  const { t } = useI18n();

  // 스토어 인스턴스 초기화
  const storeSettings = useStoreSettings();
  const storeRadix = useStoreRadix();
  const storeUtils = useStoreUtils();

  // 스토어에서 필요한 메서드 추출
  const { swapRadix, initRecentRadix } = storeRadix;
  const { clickButtonById, setInputBlurred } = storeUtils;

  // 단위 초기화
  initRecentRadix();


  // 언어 변경 시 통화 이름 업데이트
  watch([() => storeSettings.locale], () => {
  });

  // 키 바인딩 설정
  const keyBinding = new KeyBinding([
    [['Alt+w'], () => clickButtonById('btn-swap-radix')],
    [['Alt+y'], () => storeSettings.toggleShowSymbol()],
  ]);

  // 입력 포커스에 따른 키 바인딩 활성화/비활성화
  watch(
    () => storeUtils.inputFocused,
    () => {
      if (storeUtils.inputFocused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
  );

  onMounted(() => {
    initRecentRadix();
    keyBinding.subscribe();

  });

  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
    setInputBlurred();
  });

  // 통화 옵션 타입 정의
  type RadixOptions = {
    value: string;
    label: string;
    disable?: boolean;
  };

  type ReactiveRadixOptions = {
    values: RadixOptions[];
  };

  // 통화 옵션 초기화
  const fromRadixOptions = reactive({ values: [] } as ReactiveRadixOptions);
  const toRadixOptions = reactive({ values: [] } as ReactiveRadixOptions);

  // 통화 옵션 업데이트
  watch(
    [() => storeRadix.mainRadix, () => storeRadix.subRadix],
    () => {
      const radixList = Object.values(Radix);

      // 'From' 통화 옵션 설정
      fromRadixOptions.values = radixList.map((radix) => ({
        value: radix,
        label: t(`radixLabel.${radix}`),
        disable: storeRadix.subRadix === radix,
      }));

      // 'To' 통화 옵션 설정
      toRadixOptions.values = radixList.map((radix) => ({
        value: radix,
        label: t(`radixLabel.${radix}`),
        disable: storeRadix.mainRadix === radix,
      }));

    },
    { immediate: true },
  );

  const swapRadixValue = () => {
    swapRadix();
  };
</script>

<template>
  <q-card-section class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" />

    <!-- 원본 진법 -->
    <q-select
      v-model="storeRadix.mainRadix"
      :options="fromRadixOptions.values"
      dense
      options-dense
      emit-value
      map-options
      option-value="value"
      option-label="label"
      :label-color="!storeSettings.darkMode ? 'primary' : 'grey-1'"
      :options-selected-class="!storeSettings.darkMode ? 'text-primary' : 'text-grey-1'"
      class="col-4 q-pl-sm shadow-2"
      :popup-content-class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
    />

    <!-- 원본, 대상 진법 바꾸기 버튼 -->
    <q-btn
      id="btn-swap-radix"
      dense
      round
      flat
      icon="swap_horiz"
      size="md"
      class="col-2 q-mx-none q-px-sm blur"
      @click="swapRadixValue()"
    >
      <MyTooltip>{{ t('tooltipSwap') }}</MyTooltip>
    </q-btn>

    <!-- 대상 진법 -->
    <q-select
      v-model="storeRadix.subRadix"
      :options="toRadixOptions.values"
      dense
      options-dense
      emit-value
      map-options
      option-value="value"
      option-label="label"
      :label-color="!storeSettings.darkMode ? 'primary' : 'grey-1'"
      :class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      class="col-4 q-pl-sm shadow-2"
      :options-selected-class="!storeSettings.darkMode ? 'text-primary' : 'text-grey-1'"
    />

    <!-- 대상 방향 -->
    <q-icon name="keyboard_double_arrow_down" size="xs" class="col-1 q-px-none" />
  </q-card-section>
</template>

<i18n lang="yaml5">
  ko:
    tooltipSwap: 진법 방향 바꾸기
    radixLabel:
      bin: 2진수
      oct: 8진수
      dec: 10진수
      hex: 16진수
  en:
    tooltipSwap: Swap Radix
    radixLabel:
      bin: Binary
      oct: Octal
      dec: Decimal
      hex: Hexadecimal
</i18n>
