<script setup lang="ts">
  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { onMounted, onBeforeUnmount, reactive, watch } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // 계산기 관련 타입과 클래스
  import { KeyBinding } from 'classes/KeyBinding';
  import { UnitConverter } from 'classes/UnitConverter';
  import { BigNumber } from 'classes/CalculatorMath';

  // 스토어 관련
  import { useStore } from 'src/stores/store';
  // 스토어 인스턴스 생성
  const store = useStore();
  // 스토어에서 필요한 메서드 추출
  const { calc, clickButtonById, swapUnits, initRecentUnits } = store;

  // 컴포넌트 import
  import ToolTip from 'src/components/snippets/ToolTip.vue';

  // 단위 초기화
  initRecentUnits();

  // 범주 이름을 현재 언어에 맞게 초기화
  const categoryList = reactive(
    UnitConverter.categories.map((category) => ({
      value: category,
      label: t(`categories.${category}`),
    })),
  );

  // 언어 변경 시 범주 이름 업데이트
  watch(
    () => store.locale,
    () => {
      categoryList.forEach((category) => {
        category.label = t(`categories.${category.value}`);
      });
    },
  );

  // 키 바인딩 설정
  const keyBindingManager = new KeyBinding([
    [['Alt+w'], () => clickButtonById('btn-swap-unit')],
    [['Alt+y'], () => store.toggleShowUnit()],
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
    disable?: boolean;
  };

  type ReactiveUnitOptionList = {
    values: UnitOption[];
  };

  // 단위 옵션 초기화
  const sourceUnitOptions = reactive({ values: [] } as ReactiveUnitOptionList);
  const targetUnitOptions = reactive({ values: [] } as ReactiveUnitOptionList);

  // 단위 변경 시 옵션 업데이트
  watch(
    [() => store.sourceUnits[store.selectedCategory], () => store.targetUnits[store.selectedCategory]],
    () => {
      const currentCategory = store.selectedCategory;
      const availableUnits = UnitConverter.getUnitLists(currentCategory);

      // 'From' 단위 옵션 설정
      sourceUnitOptions.values = availableUnits.map((unit) => ({
        value: unit,
        label: unit,
        desc: UnitConverter.getUnitDesc(currentCategory, unit),
        disable: store.targetUnits[currentCategory] === unit,
      }));

      // 'To' 단위 옵션 설정
      targetUnitOptions.values = availableUnits.map((unit) => ({
        value: unit,
        label: unit,
        desc: UnitConverter.getUnitDesc(currentCategory, unit),
        disable: store.sourceUnits[currentCategory] === unit,
      }));
    },
    { immediate: true },
  );

  const handleUnitSwap = () => {
    calc.setCurrentNumber(
      UnitConverter.convert(
        store.selectedCategory,
        BigNumber(calc.currentNumber),
        store.sourceUnits[store.selectedCategory] ?? '',
        store.targetUnits[store.selectedCategory] ?? '',
      ),
    );
    swapUnits();
  };
</script>

<template>
  <q-card-section v-auto-blur class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 카테고리 -->
    <q-select
      v-model="store.selectedCategory"
      :options="categoryList"
      :label="t('category')"
      role="combobox"
      :aria-label="t('ariaLabel.selectCategory')"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-3 q-pl-sm shadow-2 text-black"
      :class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :options-selected-class="!store.isDarkMode() ? 'text-primary' : 'text-grey-1'"
      :label-color="!store.isDarkMode() ? 'primary' : 'grey-1'"
    />

    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" role="img" :aria-label="t('ariaLabel.sourceDirection')" />

    <!-- 원본 단위 -->
    <q-select
      v-model="store.sourceUnits[store.selectedCategory]"
      :options="sourceUnitOptions.values"
      :label="t(`unitDesc.${store.selectedCategory}.${store.sourceUnits[store.selectedCategory]}`)"
      role="combobox"
      :aria-label="t('ariaLabel.sourceUnit')"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-3 q-pl-sm shadow-2"
      :class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :options-selected-class="!store.isDarkMode() ? 'text-primary' : 'text-grey-1'"
      :label-color="!store.isDarkMode() ? 'primary' : 'grey-1'"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>
              {{ t(`unitDesc.${store.selectedCategory}.${scope.opt.label}`) }}
            </q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <ToolTip>
        {{ t(`unitDesc.${store.selectedCategory}.${store.sourceUnits[store.selectedCategory]}`) }}
      </ToolTip>
    </q-select>

    <!-- 원본, 대상 단위 바꾸기 버튼 -->
    <q-btn
      id="btn-swap-unit"
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
      <ToolTip>{{ t('tooltipSwap') }}</ToolTip>
    </q-btn>

    <!-- 대상 단위 -->
    <q-select
      v-model="store.targetUnits[store.selectedCategory]"
      :options="targetUnitOptions.values"
      :label="t(`unitDesc.${store.selectedCategory}.${store.targetUnits[store.selectedCategory]}`)"
      role="combobox"
      :aria-label="t('ariaLabel.targetUnit')"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-3 q-pl-sm shadow-2"
      :class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :options-selected-class="!store.isDarkMode() ? 'text-primary' : 'text-grey-1'"
      :label-color="!store.isDarkMode() ? 'primary' : 'grey-1'"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>
              {{ t(`unitDesc.${store.selectedCategory}.${scope.opt.label}`) }}
            </q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <ToolTip>
        {{ t(`unitDesc.${store.selectedCategory}.${store.targetUnits[store.selectedCategory]}`) }}
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

<i18n lang="yaml5" src="../i18n/components/UnitPanel.yml" />
