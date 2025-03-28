<script setup lang="ts">
  /**
   * @file UnitPanel.vue
   * @description 이 파일은 단위 패널 컴포넌트를 구성하는 Vue 컴포넌트입니다.
   *              사용자가 다양한 단위를 선택하고 변환할 수 있도록 지원하며,
   *              단위 변환 기능을 통해 계산기와 상호작용합니다.
   *              이 컴포넌트는 사용자 경험을 향상시키기 위해 단위 목록을 동적으로 관리합니다.
   */

  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { onMounted, onBeforeUnmount, reactive, watch, computed } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // 계산기 관련 타입과 클래스
  import { KeyBinding } from 'classes/KeyBinding';
  import { UnitConverter } from 'classes/UnitConverter';
  // import { toBigNumber } from 'classes/CalculatorMath';

  // 전역 window 객체에 접근하기 위한 상수 선언
  const $g = window.globalVars;

  // 스토어 인스턴스 생성
  const $s = $g.store;

  // 스토어에서 필요한 메서드 추출
  const { calc, clickButtonById, swapUnits, initRecentUnits } = $s;

  // 컴포넌트 import
  import ToolTip from 'src/components/snippets/ToolTip.vue';

  // 단위 초기화
  initRecentUnits();

  // 범주 이름을 현재 언어에 맞게 초기화
  const categoryList = reactive(
    UnitConverter.getCategories().map((category) => ({
      value: category,
      label: t(`categories.${category}`),
    })),
  );

  // 언어 변경 시 범주 이름 업데이트
  watch(
    () => $s.locale,
    () => {
      categoryList.forEach((category) => {
        category.label = t(`categories.${category.value}`);
      });
    },
  );

  // 키 바인딩 설정
  const keyBindingManager = new KeyBinding([
    [['Alt+w'], () => clickButtonById('btn-swap-unit')],
    [['Alt+y'], () => $s.toggleShowUnit()],
  ]);

  // 컴포넌트 마운트 시 실행
  onMounted(() => {
    initRecentUnits();
    keyBindingManager.subscribe();
  });

  // 컴포넌트 언마운트 전 실행
  onBeforeUnmount(() => {
    keyBindingManager.unsubscribe();
  });

  // 단위 옵션 타입 정의
  type UnitOption = {
    value: string;
    label: string;
    desc: string;
    disable?: boolean;
  };

  // 사용 가능한 단위 목록을 computed로 관리
  const availableUnits = computed(() => UnitConverter.getUnitLists($s.selectedCategory));

  // 단위 옵션 초기화
  /**
   * 단위 옵션을 생성하는 유틸리티 함수
   * @param unit - 단위 문자열
   * @param isSource - 출발 단위 여부
   * @returns 단위 옵션 객체
   */
  const createUnitOption = (unit: string): UnitOption => ({
    value: unit,
    label: unit,
    desc: UnitConverter.getUnitDesc($s.selectedCategory, unit),
  });

  // 출발 단위 옵션 목록을 computed로 관리
  const sourceUnitOptions = computed(() => availableUnits.value.map((unit) => createUnitOption(unit)));

  // 도착 단위 옵션 목록을 computed로 관리
  const targetUnitOptions = computed(() => availableUnits.value.map((unit) => createUnitOption(unit)));

  const handleUnitSwap = () => {
    // 동일한 단위인 경우 변환하지 않음
    if ($s.sourceUnits[$s.selectedCategory] !== $s.targetUnits[$s.selectedCategory]) {
      swapUnits();
      calc.currentNumber = $s.convertedUnitNumber;
      calc.needsBufferReset = true;
    }
  };
</script>

<template>
  <q-card-section v-auto-blur class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 카테고리 -->
    <q-select
      v-model="$s.selectedCategory"
      :options="categoryList"
      :label="t('category')"
      role="combobox"
      :aria-label="t('ariaLabel.selectCategory')"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      behavior="menu"
      class="col-3 q-pl-sm shadow-2 text-black"
      :class="!$s.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :label-color="!$s.isDarkMode() ? 'primary' : 'grey-1'"
      :popup-content-class="
        [!$s.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6', 'scrollbar-custom', 'q-select-popup'].join(' ')
      "
      :options-selected-class="!$s.isDarkMode() ? 'text-primary' : 'text-grey-1'"
    />

    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" role="img" :aria-label="t('ariaLabel.sourceDirection')" />

    <!-- 원본 단위 -->
    <q-select
      v-model="$s.sourceUnits[$s.selectedCategory]"
      :options="sourceUnitOptions"
      :label="t(`unitDesc.${$s.selectedCategory}.${$s.sourceUnits[$s.selectedCategory]}`)"
      role="combobox"
      :aria-label="t('ariaLabel.sourceUnit')"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      behavior="menu"
      class="col-3 q-pl-sm shadow-2"
      :class="!$s.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="
        [!$s.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6', 'scrollbar-custom', 'q-select-popup'].join(' ')
      "
      :options-selected-class="!$s.isDarkMode() ? 'text-primary' : 'text-grey-1'"
      :label-color="!$s.isDarkMode() ? 'primary' : 'grey-1'"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>
              {{ t(`unitDesc.${$s.selectedCategory}.${scope.opt.label}`) }}
            </q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <ToolTip>
        {{ t(`unitDesc.${$s.selectedCategory}.${$s.sourceUnits[$s.selectedCategory]}`) }}
      </ToolTip>
    </q-select>

    <!-- 원본, 대상 단위 바꾸기 버튼 -->
    <q-btn
      id="btn-swap-unit"
      v-auto-blur
      dense
      round
      flat
      icon="swap_horiz"
      size="md"
      class="col-1 q-mx-none q-px-sm"
      role="button"
      :aria-label="t('ariaLabel.swapUnits')"
      @click="handleUnitSwap()"
    >
      <ToolTip :auto-hide="3000" :text="t('tooltipSwap')" />
    </q-btn>

    <!-- 대상 단위 -->
    <q-select
      v-model="$s.targetUnits[$s.selectedCategory]"
      :options="targetUnitOptions"
      :label="t(`unitDesc.${$s.selectedCategory}.${$s.targetUnits[$s.selectedCategory]}`)"
      role="combobox"
      :aria-label="t('ariaLabel.targetUnit')"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      behavior="menu"
      class="col-3 q-pl-sm shadow-2"
      :class="!$s.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="
        [!$s.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6', 'scrollbar-custom', 'q-select-popup'].join(' ')
      "
      :options-selected-class="!$s.isDarkMode() ? 'text-primary' : 'text-grey-1'"
      :label-color="!$s.isDarkMode() ? 'primary' : 'grey-1'"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>
              {{ t(`unitDesc.${$s.selectedCategory}.${scope.opt.label}`) }}
            </q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <ToolTip>
        {{ t(`unitDesc.${$s.selectedCategory}.${$s.targetUnits[$s.selectedCategory]}`) }}
      </ToolTip>
    </q-select>

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

<style lang="scss">
  .q-select-popup {
    .q-item {
      @media (prefers-color-scheme: dark) {
        border-top: 1px dotted rgba(255, 255, 255, 0.377);
        border-bottom: 1px dotted rgba(255, 255, 255, 0.377);
      }
    }
  }
</style>

<i18n lang="yaml5" src="../i18n/components/UnitPanel.yml" />
