<script setup lang="ts">
  import { onMounted, onBeforeUnmount, reactive, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { UnitConverter } from 'classes/UnitConverter';
  import MyTooltip from 'components/MyTooltip.vue';
  import { useStoreUnit } from 'src/stores/store-unit';
  import { useStoreSettings } from 'src/stores/store-settings';
  import { useStoreUtils } from 'src/stores/store-utils';
  import { KeyBinding } from 'classes/KeyBinding';

  // i18n 설정
  const { t } = useI18n();

  // 스토어 인스턴스 생성
  const storeUnit = useStoreUnit();
  const storeSettings = useStoreSettings();
  const storeUtils = useStoreUtils();

  // 스토어에서 필요한 메서드 추출
  const { clickButtonById } = storeUtils;
  const { swapUnitValue, initRecentCategoryAndUnit } = storeUnit;

  // 단위 초기화
  initRecentCategoryAndUnit();

  // 범주 이름을 현재 언어에 맞게 초기화
  const categories = reactive(
    UnitConverter.categories.map((category) => ({
      value: category,
      label: t(`categories.${category}`),
    }))
  );

  // 언어 변경 시 범주 이름 업데이트
  watch(() => storeSettings.locale, () => {
    categories.forEach((category) => {
      category.label = t(`categories.${category.value}`);
    });
  });

  // 키 바인딩 설정
  const keyBinding = new KeyBinding([
    [['Alt+w'], () => clickButtonById('btn-swap-unit')],
    [['Alt+y'], () => storeSettings.toggleShowUnit()],
  ]);

  // 컴포넌트 마운트 시 실행
  onMounted(() => {
    initRecentCategoryAndUnit();
    keyBinding.subscribe();
  });

  // 컴포넌트 언마운트 전 실행
  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
  });

  // 단위 옵션 타입 정의
  type UnitOptions = {
    value: string;
    label: string;
    disable?: boolean;
  };

  type ReactiveUnitOptions = {
    values: UnitOptions[];
  };

  // 단위 옵션 초기화
  const fromUnitOptions = reactive({ values: [] } as ReactiveUnitOptions);
  const toUnitOptions = reactive({ values: [] } as ReactiveUnitOptions);

  // 단위 변경 시 옵션 업데이트
  watch(
    [
      () => storeUnit.recentUnitFrom[storeUnit.recentCategory],
      () => storeUnit.recentUnitTo[storeUnit.recentCategory],
    ],
    () => {
      const category = storeUnit.recentCategory;
      const unitList = UnitConverter.getUnitLists(category);

      // 'From' 단위 옵션 설정
      fromUnitOptions.values = unitList.map((unit) => ({
        value: unit,
        label: unit,
        desc: UnitConverter.getUnitDesc(category, unit),
        disable: storeUnit.recentUnitTo[category] === unit,
      }));

      // 'To' 단위 옵션 설정
      toUnitOptions.values = unitList.map((unit) => ({
        value: unit,
        label: unit,
        desc: UnitConverter.getUnitDesc(category, unit),
        disable: storeUnit.recentUnitFrom[category] === unit,
      }));
    },
    { immediate: true }
  );
</script>

<template>
  <q-card-section v-blur class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 카테고리 -->
    <q-select
      v-model="storeUnit.recentCategory"
      :options="categories"
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
      v-model="storeUnit.recentUnitFrom[storeUnit.recentCategory]"
      :options="fromUnitOptions.values"
      :label="t(`unitDesc.${storeUnit.recentCategory}.${storeUnit.recentUnitFrom[storeUnit.recentCategory]}`)"
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
              {{ t(`unitDesc.${storeUnit.recentCategory}.${scope.opt.label}`) }}
            </q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        {{ t(`unitDesc.${storeUnit.recentCategory}.${storeUnit.recentUnitFrom[storeUnit.recentCategory]}`) }}
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
      @click="swapUnitValue()"
    >
      <MyTooltip>{{ t('tooltipSwap') }}</MyTooltip>
    </q-btn>

    <!-- 대상 단위 -->
    <q-select
      v-model="storeUnit.recentUnitTo[storeUnit.recentCategory]"
      :options="toUnitOptions.values"
      :label="t(`unitDesc.${storeUnit.recentCategory}.${storeUnit.recentUnitTo[storeUnit.recentCategory]}`)"
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
              {{ t(`unitDesc.${storeUnit.recentCategory}.${scope.opt.label}`) }}
            </q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        {{ t(`unitDesc.${storeUnit.recentCategory}.${storeUnit.recentUnitTo[storeUnit.recentCategory]}`) }}
      </MyTooltip>
    </q-select>

    <!-- 대상 방향 -->
    <q-icon name="keyboard_double_arrow_down" size="xs" class="col-1 q-px-none" />
  </q-card-section>
</template>

<i18n lang="yaml5" src="../i18n/components/UnitPanel.yml" />
