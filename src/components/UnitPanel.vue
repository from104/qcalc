<script setup lang="ts">
  import {onMounted, onBeforeUnmount, reactive, watch} from 'vue';

  import {UnitConverter} from 'classes/UnitConverter';

  import MyTooltip from 'components/MyTooltip.vue';

  import {useI18n} from 'vue-i18n';
  const {t} = useI18n();

  // 스토어 가져오기
  import {useStoreCalc} from 'src/stores/store-calc';
  const store = useStoreCalc();
  const {swapUnitValue, initRecentCategoryAndUnit, clickButtonById, showUnitToggle} = store;

  // 단위 초기화
  initRecentCategoryAndUnit();

  // 범주 이름을 언어에 맞게 초기화
  const categories = reactive(
    UnitConverter.categories.map((category) => ({
      value: category,
      label: t(`categories.${category}`),
    })),
  );

  // 범주 이름을 언어에 맞게 바꾸기 위한 감시
  watch([() => store.locale], () => {
    categories.forEach((category) => {
      category.label = t(`categories.${category.value}`);
    });
  });

  import {KeyBinding} from 'classes/KeyBinding';
  // prettier-ignore
  const keyBinding = new KeyBinding([
    [['Alt+w'], () => clickButtonById('btn-swap-unit')],
    [['Alt+y'], () => showUnitToggle()],
  ]);

  onMounted(() => {
    initRecentCategoryAndUnit();

    // 키바인딩 추가
    keyBinding.subscribe();
  });

  onBeforeUnmount(() => {
    // 키바인딩 제거
    keyBinding.unsubscribe();
  });

  type UnitOptions = {
    value: string;
    label: string;
    disable?: boolean;
  };

  type ReactiveUnitOptions = {
    values: UnitOptions[];
  };

  const fromUnitOptions = reactive({values: []} as ReactiveUnitOptions);
  const toUnitOptions = reactive({values: []} as ReactiveUnitOptions);

  watch(
    [() => store.recentUnitFrom[store.recentCategory], () => store.recentUnitTo[store.recentCategory]],
    () => {
      const category = store.recentCategory;
      const unitList = UnitConverter.getUnitLists(category);

      fromUnitOptions.values = unitList.map((unit) => ({
        value: unit,
        label: unit,
        desc: UnitConverter.getUnitDesc(category, unit),
        disable: store.recentUnitTo[category] === unit,
      }));

      toUnitOptions.values = unitList.map((unit) => ({
        value: unit,
        label: unit,
        desc: UnitConverter.getUnitDesc(category, unit),
        disable: store.recentUnitFrom[category] === unit,
      }));
    },
    {immediate: true},
  );
</script>

<template>
  <q-card-section v-blur class="row q-px-sm q-pt-none q-pb-sm">
    <!-- 카테고리 -->
    <q-select
      v-model="store.recentCategory"
      :options="categories"
      :label="t('category')"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-3 q-pl-sm shadow-2 text-black"
      :class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :options-selected-class="!store.darkMode ? 'text-primary' : 'text-grey-1'"
      :label-color="!store.darkMode ? 'primary' : 'grey-1'"
    />

    <!-- 원본 방향 -->
    <q-icon name="keyboard_double_arrow_up" class="col-1" />

    <!-- 원본 단위 -->
    <q-select
      v-model="store.recentUnitFrom[store.recentCategory]"
      :options="fromUnitOptions.values"
      :label="t(`unitDesc.${store.recentCategory}.${store.recentUnitFrom[store.recentCategory]}`)"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-3 q-pl-sm shadow-2"
      :class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :options-selected-class="!store.darkMode ? 'text-primary' : 'text-grey-1'"
      :label-color="!store.darkMode ? 'primary' : 'grey-1'"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>
              {{ t(`unitDesc.${store.recentCategory}.${scope.opt.label}`) }}
            </q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        {{ t(`unitDesc.${store.recentCategory}.${store.recentUnitFrom[store.recentCategory]}`) }}
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
      v-model="store.recentUnitTo[store.recentCategory]"
      :options="toUnitOptions.values"
      :label="t(`unitDesc.${store.recentCategory}.${store.recentUnitTo[store.recentCategory]}`)"
      stack-label
      dense
      options-dense
      emit-value
      map-options
      class="col-3 q-pl-sm shadow-2"
      :class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :popup-content-class="!store.darkMode ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
      :options-selected-class="!store.darkMode ? 'text-primary' : 'text-grey-1'"
      :label-color="!store.darkMode ? 'primary' : 'grey-1'"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label caption>
              {{ t(`unitDesc.${store.recentCategory}.${scope.opt.label}`) }}
            </q-item-label>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <MyTooltip>
        {{ t(`unitDesc.${store.recentCategory}.${store.recentUnitTo[store.recentCategory]}`) }}
      </MyTooltip>
    </q-select>

    <!-- 대상 방향 -->
    <q-icon name="keyboard_double_arrow_down" size="xs" class="col-1 q-px-none" />
  </q-card-section>
</template>

<i18n lang="yaml5" src="../i18n/components/UnitPanel.yml" />
