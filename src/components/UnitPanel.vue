<script setup lang="ts">
  import { onMounted, onBeforeUnmount, reactive, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { KeyBinding } from 'classes/KeyBinding';
  import { UnitConverter } from 'classes/UnitConverter';

  import { useStoreBase } from 'src/stores/store-base';
  import { useStoreUnit } from 'src/stores/store-unit';
  import { useStoreSettings } from 'src/stores/store-settings';
  import { useStoreUtils } from 'src/stores/store-utils';

  import MyTooltip from 'components/MyTooltip.vue';

  // i18n 설정
  const { t } = useI18n();

  // 스토어 인스턴스 생성
  const storeBase = useStoreBase();
  const storeUnit = useStoreUnit();
  const storeSettings = useStoreSettings();
  const storeUtils = useStoreUtils();

  // 스토어에서 필요한 메서드 추출
  const { calc } = storeBase;
  const { clickButtonById } = storeUtils;
  const { swapUnits, initRecentUnits } = storeUnit;

  // 단위 초기화
  initRecentUnits();

  // 범주 이름을 현재 언어에 맞게 초기화
  const categoryList = reactive(
    UnitConverter.categories.map((category) => ({
      value: category,
      label: t(`categories.${category}`),
    }))
  );

  // 언어 변경 시 범주 이름 업데이트
  watch(() => storeSettings.locale, () => {
    categoryList.forEach((category) => {
      category.label = t(`categories.${category.value}`);
    });
  });

  // 키 바인딩 설정
  const keyBindingManager = new KeyBinding([
    [['Alt+w'], () => clickButtonById('btn-swap-unit')],
    [['Alt+y'], () => storeSettings.toggleShowUnit()],
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
    [
      () => storeUnit.sourceUnits[storeUnit.selectedCategory],
      () => storeUnit.targetUnits[storeUnit.selectedCategory],
    ],
    () => {
      const currentCategory = storeUnit.selectedCategory;
      const availableUnits = UnitConverter.getUnitLists(currentCategory);

      // 'From' 단위 옵션 설정
      sourceUnitOptions.values = availableUnits.map((unit) => ({
        value: unit,
        label: unit,
        desc: UnitConverter.getUnitDesc(currentCategory, unit),
        disable: storeUnit.targetUnits[currentCategory] === unit,
      }));

      // 'To' 단위 옵션 설정
      targetUnitOptions.values = availableUnits.map((unit) => ({
        value: unit,
        label: unit,
        desc: UnitConverter.getUnitDesc(currentCategory, unit),
        disable: storeUnit.sourceUnits[currentCategory] === unit,
      }));
    },
    { immediate: true }
  );

  const handleUnitSwap = () => {
    calc.setCurrentNumber(UnitConverter.convert(
      storeUnit.selectedCategory,
      calc.currentNumber,
      storeUnit.sourceUnits[storeUnit.selectedCategory],
      storeUnit.targetUnits[storeUnit.selectedCategory]
    ));
    swapUnits();
  };
</script>

<template>
  <q-card-section v-blur class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 카테고리 -->
    <q-select
      v-model="storeUnit.selectedCategory"
      :options="categoryList"
      :label="t('category')"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-3 q-pl-sm shadow-2 text-black"
      :class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :options-selected-class="!storeSettings.darkMode ? 'text-primary' : 'text-grey-1'"
      :label-color="!storeSettings.darkMode ? 'primary' : 'grey-1'"
    />

    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" />

    <!-- 원본 단위 -->
    <q-select
      v-model="storeUnit.sourceUnits[storeUnit.selectedCategory]"
      :options="sourceUnitOptions.values"
      :label="t(`unitDesc.${storeUnit.selectedCategory}.${storeUnit.sourceUnits[storeUnit.selectedCategory]}`)"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-3 q-pl-sm shadow-2"
      :class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :options-selected-class="!storeSettings.darkMode ? 'text-primary' : 'text-grey-1'"
      :label-color="!storeSettings.darkMode ? 'primary' : 'grey-1'"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>
              {{ t(`unitDesc.${storeUnit.selectedCategory}.${scope.opt.label}`) }}
            </q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        {{ t(`unitDesc.${storeUnit.selectedCategory}.${storeUnit.sourceUnits[storeUnit.selectedCategory]}`) }}
      </MyTooltip>
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
      @click="handleUnitSwap()"
    >
      <MyTooltip>{{ t('tooltipSwap') }}</MyTooltip>
    </q-btn>

    <!-- 대상 단위 -->
    <q-select
      v-model="storeUnit.targetUnits[storeUnit.selectedCategory]"
      :options="targetUnitOptions.values"
      :label="t(`unitDesc.${storeUnit.selectedCategory}.${storeUnit.targetUnits[storeUnit.selectedCategory]}`)"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-3 q-pl-sm shadow-2"
      :class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!storeSettings.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :options-selected-class="!storeSettings.darkMode ? 'text-primary' : 'text-grey-1'"
      :label-color="!storeSettings.darkMode ? 'primary' : 'grey-1'"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>
              {{ t(`unitDesc.${storeUnit.selectedCategory}.${scope.opt.label}`) }}
            </q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        {{ t(`unitDesc.${storeUnit.selectedCategory}.${storeUnit.targetUnits[storeUnit.selectedCategory]}`) }}
      </MyTooltip>
    </q-select>

    <!-- 대상 방향 -->
    <q-icon name="keyboard_double_arrow_down" size="xs" class="col-1 q-px-none" />
  </q-card-section>
</template>

<i18n lang="yaml5" src="../i18n/components/UnitPanel.yml" />
