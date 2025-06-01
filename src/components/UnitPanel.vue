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

  // 스토어 import
  import { useSettingsStore } from 'stores/settingsStore';
  import { useThemesStore } from 'stores/themesStore';
  import { useUnitStore } from 'stores/unitStore';
  import { useCalcStore } from 'src/stores/calcStore';

  // 스토어 인스턴스 생성
  const settingsStore = useSettingsStore();
  const themesStore = useThemesStore();
  const unitStore = useUnitStore();
  const calcStore = useCalcStore();

  // 컴포넌트 import
  import ToolTip from 'src/components/snippets/ToolTip.vue';

  // 단위 초기화
  unitStore.initRecentUnits();

  // 단위 옵션 타입 정의
  type UnitOption = {
    value: string;
    label: string;
    desc: string;
    isFavorite: boolean;
    disable?: boolean;
  };

  // 카테고리 옵션 타입 정의
  type CategoryOption = {
    value: string;
    label: string;
    isFavorite: boolean;
  };

  // 단위 옵션 초기화
  /**
   * 단위 옵션을 생성하는 유틸리티 함수
   * @param unit - 단위 문자열
   * @returns 단위 옵션 객체
   */
  const createUnitOption = (unit: string): UnitOption => ({
    value: unit,
    label: unit,
    desc: UnitConverter.getUnitDesc(unitStore.selectedCategory, unit),
    isFavorite: unitStore.isFavoriteUnit(unitStore.selectedCategory, unit),
  });

  // 카테고리 옵션을 생성하는 유틸리티 함수
  const createCategoryOption = (category: string): CategoryOption => ({
    value: category,
    label: t(`categories.${category}`),
    isFavorite: unitStore.isFavoriteCategory(category),
  });

  // 정렬된 카테고리 목록 가져오기 (즐겨찾기가 상단에 위치)
  const getSortedCategoryOptions = (): CategoryOption[] => {
    return unitStore.getSortedCategories().map((category: string) => createCategoryOption(category));
  };

  // 정렬된 단위 목록 가져오기 (즐겨찾기가 상단에 위치)
  const getSortedUnitOptions = (): UnitOption[] => {
    return unitStore.getSortedUnits(unitStore.selectedCategory).map((unit: string) => createUnitOption(unit));
  };

  // 범주 이름을 현재 언어에 맞게 초기화
  const categoryList = reactive<CategoryOption[]>(getSortedCategoryOptions());

  // 출발 단위 옵션 목록을 computed로 관리
  const sourceUnitOptions = computed(() => getSortedUnitOptions());

  // 도착 단위 옵션 목록을 computed로 관리
  const targetUnitOptions = computed(() => getSortedUnitOptions());

  // 즐겨찾기 상태 변경 시 옵션 목록 업데이트
  watch(
    () => [unitStore.favoriteCategories, unitStore.favoriteUnits],
    () => {
      const newCategoryOptions = getSortedCategoryOptions();
      categoryList.splice(0, categoryList.length, ...newCategoryOptions);
    },
    { deep: true },
  );

  // 언어 변경 시 범주 이름 업데이트
  watch(
    () => settingsStore.locale,
    () => {
      const newCategoryOptions = getSortedCategoryOptions();
      categoryList.splice(0, categoryList.length, ...newCategoryOptions);
    },
  );

  /**
   * 카테고리 즐겨찾기 토글 핸들러
   * @param category - 토글할 카테고리
   * @param event - 클릭 이벤트 (이벤트 전파 방지용)
   */
  const handleCategoryFavoriteToggle = (category: string, event: Event) => {
    event.stopPropagation();
    event.preventDefault();
    unitStore.toggleFavoriteCategory(category);
  };

  /**
   * 단위 즐겨찾기 토글 핸들러
   * @param unit - 토글할 단위
   * @param event - 클릭 이벤트 (이벤트 전파 방지용)
   */
  const handleUnitFavoriteToggle = (unit: string, event: Event) => {
    event.stopPropagation();
    event.preventDefault();
    unitStore.toggleFavoriteUnit(unitStore.selectedCategory, unit);
  };

  // 키 바인딩 설정
  const keyBindingManager = new KeyBinding([
    [['\\'], () => document.getElementById('btn-swap-unit')?.click()],
    [['Alt+\\'], () => unitStore.toggleShowUnit()],
  ]);

  // 컴포넌트 마운트 시 실행
  onMounted(() => {
    unitStore.initRecentUnits();
    keyBindingManager.subscribe();
  });

  // 컴포넌트 언마운트 전 실행
  onBeforeUnmount(() => {
    keyBindingManager.unsubscribe();
  });

  const handleUnitSwap = () => {
    // 동일한 단위인 경우 변환하지 않음
    if (unitStore.sourceUnits[unitStore.selectedCategory] !== unitStore.targetUnits[unitStore.selectedCategory]) {
      unitStore.swapUnits();
      calcStore.calc.currentNumber = unitStore.convertedUnitNumber;
      calcStore.calc.needsBufferReset = true;
    }
  };

  // themesStore에서 select 색상을 가져오는 computed 속성
  const selectTextColor = computed(() => themesStore.getSelectColor('text', themesStore.isDarkMode()));
  const selectBackgroundColor = computed(() => themesStore.getSelectColor('background', themesStore.isDarkMode()));
</script>

<template>
  <q-card-section v-auto-blur class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 카테고리 -->
    <q-select
      v-model="unitStore.selectedCategory"
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
      :class="`bg-${selectBackgroundColor}`"
      :label-color="selectTextColor"
      :popup-content-class="[`bg-${selectBackgroundColor}`, 'scrollbar-custom', 'q-select-popup', 'noselect'].join(' ')"
      :options-selected-class="`text-${selectTextColor}`"
      :color="selectTextColor"
      :bg-color="selectBackgroundColor"
      :popup-content-style="{ backgroundColor: selectBackgroundColor, color: selectTextColor }"
    >
      <template #option="scope">
        <transition-group name="select-option-">
          <q-item v-bind="scope.itemProps" :key="scope.opt.value" class="q-px-sm">
            <q-item-section side class="q-pr-sm">
              <q-btn
                :icon="scope.opt.isFavorite ? 'star' : 'star_border'"
                flat
                round
                dense
                size="md"
                :color="scope.opt.isFavorite ? (themesStore.isDarkMode() ? 'amber' : 'brown-4') : 'grey'"
                :aria-label="scope.opt.isFavorite ? t('ariaLabel.removeFromFavorites') : t('ariaLabel.addToFavorites')"
                class="q-pa-none q-ma-none"
                @click="handleCategoryFavoriteToggle(scope.opt.value, $event)"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </transition-group>
      </template>
    </q-select>

    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" role="img" :aria-label="t('ariaLabel.sourceDirection')" />

    <!-- 원본 단위 -->
    <q-select
      v-model="unitStore.sourceUnits[unitStore.selectedCategory]"
      :options="sourceUnitOptions"
      :label="t(`unitDesc.${unitStore.selectedCategory}.${unitStore.sourceUnits[unitStore.selectedCategory]}`)"
      role="combobox"
      :aria-label="t('ariaLabel.sourceUnit')"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      behavior="menu"
      class="col-3 q-pl-sm shadow-2"
      :class="`bg-${selectBackgroundColor}`"
      :popup-content-class="[`bg-${selectBackgroundColor}`, 'scrollbar-custom', 'q-select-popup', 'noselect'].join(' ')"
      :options-selected-class="`text-${selectTextColor}`"
      :label-color="selectTextColor"
      :color="selectTextColor"
      :bg-color="selectBackgroundColor"
      :popup-content-style="{ backgroundColor: selectBackgroundColor, color: selectTextColor }"
    >
      <template #option="scope">
        <transition-group name="select-option-">
          <q-item v-bind="scope.itemProps" :key="scope.opt.value" class="q-px-sm">
            <q-item-section side class="q-pr-sm">
              <q-btn
                :icon="scope.opt.isFavorite ? 'star' : 'star_border'"
                flat
                round
                dense
                size="md"
                :color="scope.opt.isFavorite ? (themesStore.isDarkMode() ? 'amber' : 'brown-4') : 'grey'"
                :aria-label="scope.opt.isFavorite ? t('ariaLabel.removeFromFavorites') : t('ariaLabel.addToFavorites')"
                class="q-pa-none q-ma-none"
                @click="handleUnitFavoriteToggle(scope.opt.value, $event)"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>
                {{ t(`unitDesc.${unitStore.selectedCategory}.${scope.opt.label}`) }}
              </q-item-label>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </transition-group>
      </template>
      <ToolTip
        :text-color="themesStore.getCurrentThemeColors.ui.dark"
        :bg-color="themesStore.getCurrentThemeColors.ui.warning"
        :text="t(`unitDesc.${unitStore.selectedCategory}.${unitStore.sourceUnits[unitStore.selectedCategory]}`)"
      />
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
      :style="{ color: selectTextColor, backgroundColor: selectBackgroundColor }"
      @click="handleUnitSwap()"
    >
      <ToolTip
        :text-color="themesStore.getCurrentThemeColors.ui.dark"
        :bg-color="themesStore.getCurrentThemeColors.ui.warning"
        :auto-hide="3000"
        :text="t('tooltipSwap')"
      />
    </q-btn>

    <!-- 대상 단위 -->
    <q-select
      v-model="unitStore.targetUnits[unitStore.selectedCategory]"
      :options="targetUnitOptions"
      :label="t(`unitDesc.${unitStore.selectedCategory}.${unitStore.targetUnits[unitStore.selectedCategory]}`)"
      role="combobox"
      :aria-label="t('ariaLabel.targetUnit')"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      behavior="menu"
      class="col-3 q-pl-sm shadow-2"
      :class="`bg-${selectBackgroundColor}`"
      :popup-content-class="[`bg-${selectBackgroundColor}`, 'scrollbar-custom', 'q-select-popup', 'noselect'].join(' ')"
      :options-selected-class="`text-${selectTextColor}`"
      :label-color="selectTextColor"
      :color="selectTextColor"
      :bg-color="selectBackgroundColor"
      :popup-content-style="{ backgroundColor: selectBackgroundColor, color: selectTextColor }"
    >
      <template #option="scope">
        <transition-group name="select-option-">
          <q-item v-bind="scope.itemProps" :key="scope.opt.value" class="q-px-sm">
            <q-item-section side class="q-pr-sm">
              <q-btn
                :icon="scope.opt.isFavorite ? 'star' : 'star_border'"
                flat
                round
                dense
                size="md"
                :color="scope.opt.isFavorite ? (themesStore.isDarkMode() ? 'amber' : 'brown-4') : 'grey'"
                :aria-label="scope.opt.isFavorite ? t('ariaLabel.removeFromFavorites') : t('ariaLabel.addToFavorites')"
                class="q-pa-none q-ma-none"
                @click="handleUnitFavoriteToggle(scope.opt.value, $event)"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>
                {{ t(`unitDesc.${unitStore.selectedCategory}.${scope.opt.label}`) }}
              </q-item-label>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </transition-group>
      </template>
      <ToolTip
        :text-color="themesStore.getCurrentThemeColors.ui.dark"
        :bg-color="themesStore.getCurrentThemeColors.ui.warning"
        :text="t(`unitDesc.${unitStore.selectedCategory}.${unitStore.targetUnits[unitStore.selectedCategory]}`)"
      />
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

  .select-option--move,
  .select-option--enter-active,
  .select-option--leave-active {
    transition: all 3s ease;
  }

  .select-option--leave-active {
    position: absolute;
  }

  .select-option--enter-from,
  .select-option--leave-to {
    opacity: 0;
    transform: translateY(100%);
  }

  // 옵션 목록 전체의 부드러운 재정렬 효과
  .q-select-popup .q-item {
    transition: all 0.3s ease;
    will-change: transform, opacity;

    // 호버 효과
    &:hover {
      background-color: rgba(var(--q-primary), 0.05);
      transform: translateX(2px);
    }
  }

  // 다크 모드에서 더 나은 시각적 피드백
  @media (prefers-color-scheme: dark) {
    .q-select-popup .q-item:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }
  }
</style>

<i18n lang="yaml5" src="../i18n/components/UnitPanel.yml" />
