<script lang="ts" setup>
  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { reactive, watch, ref } from 'vue';

  // Quasar 프레임워크 관련
  import { useQuasar } from 'quasar';
  const $q = useQuasar();

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { locale } = useI18n({ useScope: 'global' });
  const { t } = useI18n();

  // 스토어 관련
  import { useStore } from 'src/stores/store';
  const store = useStore();
  const { setInitPanel, setDarkMode, setAlwaysOnTop, setHapticsMode, setDecimalPlaces } = store;

  // 컴포넌트 import
  import Tooltip from 'components/snippets/ToolTip.vue';

  // 패키지 버전 정보
  import { version } from '../../package.json';

  // 언어 옵션 정의
  const languageOptions = reactive([
    { value: 'ko', label: t('message.ko') },
    { value: 'en', label: t('message.en') },
  ]);

  // 시스템 로케일 사용 여부와 사용자 로케일이 변경될 때마다 언어 옵션 라벨을 업데이트합니다.
  watch([() => store.useSystemLocale, () => store.userLocale], () => {
    languageOptions.forEach((option) => {
      option.label = t('message.' + option.value);
    });
    store.locale = locale.value as string;
  });

  // 시스템 로케일을 참조로 저장합니다.
  const systemLocale = ref(navigator.language.substring(0, 2));

  // 로케일을 설정하는 함수입니다.
  const setLanguage = () => {
    if (store.useSystemLocale) {
      locale.value = systemLocale.value;
    } else {
      locale.value = store.userLocale;
    }
  };
</script>

<template>
  <q-card-section class="full-height column no-wrap">
    <q-list v-auto-blur dense class="full-width" role="list" :aria-label="t('ariaLabel.settingsList')">
      <q-item v-if="$q.platform.is.electron" class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('alwaysOnTop') }} (Alt-T)</q-item-label>
        <q-space />
        <q-toggle
          v-model="store.alwaysOnTop"
          keep-color
          dense
          role="switch"
          :aria-label="t('ariaLabel.alwaysOnTop')"
          @click="setAlwaysOnTop(store.alwaysOnTop)"
        />
      </q-item>

      <q-item class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('initPanel') }} (Alt-I)</q-item-label>
        <q-space />
        <q-toggle
          v-model="store.initPanel"
          keep-color
          dense
          role="switch"
          :aria-label="t('ariaLabel.initPanel')"
          @click="setInitPanel(store.initPanel)"
        />
      </q-item>

      <q-item v-if="$q.platform.is.capacitor" class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('hapticsMode') }} (Alt-P)</q-item-label>
        <q-space />
        <q-toggle
          v-model="store.hapticsMode"
          keep-color
          dense
          role="switch"
          :aria-label="t('ariaLabel.hapticsMode')"
          @click="setHapticsMode(store.hapticsMode)"
        />
      </q-item>

      <q-item class="q-mb-md">
        <q-item-label class="self-center" role="text">{{ t('darkMode.title') }} (Alt-D)</q-item-label>
        <q-space />
        <q-select
          v-model="store.darkMode"
          :options="[
            { label: t('darkMode.light'), value: 'light' },
            { label: t('darkMode.dark'), value: 'dark' },
            { label: t('darkMode.system'), value: 'system' },
          ]"
          role="combobox"
          :aria-label="t('ariaLabel.darkMode')"
          dense
          options-dense
          emit-value
          map-options
          :label-color="!store.isDarkMode() ? 'primary' : 'grey-1'"
          :options-selected-class="!store.isDarkMode() ? 'text-primary' : 'text-grey-1'"
          :popup-content-class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
          :class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
          @update:model-value="setDarkMode"
        />
      </q-item>

      <q-separator spaced="md" role="separator" />

      <q-item class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('showButtonAddedLabel') }} (;)</q-item-label>
        <q-space />
        <q-toggle
          v-model="store.showButtonAddedLabel"
          keep-color
          dense
          role="switch"
          :aria-label="t('ariaLabel.showButtonAddedLabel')"
        />
      </q-item>

      <q-item class="q-mb-xs">
        <q-item-label class="self-center" role="text">{{ t('useGrouping') }} (,)</q-item-label>
        <q-space />
        <q-toggle v-model="store.useGrouping" keep-color dense />
      </q-item>

      <q-item class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('groupingUnit') }} (Alt-,)</q-item-label>
        <q-space />
        <q-slider
          v-model="store.groupingUnit"
          :min="3"
          :max="4"
          :step="1"
          :disable="!store.useGrouping"
          dense
          class="col-2 q-pr-sm q-pt-xs"
          marker-labels
        />
      </q-item>

      <q-item class="q-mb-xs">
        <Tooltip>
          {{ t('decimalPlacesStat') }}:
          {{ store.decimalPlaces == -2 ? t('noLimit') : `${store.decimalPlaces} ${t('toNDecimalPlaces')}` }}
        </Tooltip>
        <q-item-label class="q-pt-xs self-start">{{ t('decimalPlaces') }} ([,])</q-item-label>
        <q-space />
        <q-slider
          v-model="store.decimalPlaces"
          :min="-2"
          :step="2"
          :max="6"
          marker-labels
          class="col-5 q-pr-sm"
          dense
          @change="setDecimalPlaces(store.decimalPlaces)"
        >
          <template #marker-label-group="{ markerList }">
            <div
              class="cursor-pointer"
              :class="(markerList[0] as any).classes"
              :style="(markerList[0] as any).style"
              @click="setDecimalPlaces((markerList[0] as any).value)"
            >
              x
            </div>
            <div
              v-for="val in [1, 2, 3, 4]"
              :key="val"
              class="cursor-pointer"
              :class="(markerList[val] as any).classes"
              :style="(markerList[val] as any).style"
              @click="setDecimalPlaces((markerList[val] as any).value)"
            >
              {{ (markerList[val] as any).value }}
            </div>
          </template>
        </q-slider>
      </q-item>

      <template v-if="store.currentTab == 'unit'">
        <q-separator spaced="md" />

        <q-item class="q-mb-sm">
          <q-item-label class="self-center" role="text"> {{ t('showUnit') }} (Alt-Y) </q-item-label>
          <q-space />
          <q-toggle v-model="store.showUnit" keep-color dense />
        </q-item>
      </template>

      <template v-else-if="store.currentTab == 'currency'">
        <q-separator spaced="md" />

        <q-item class="q-mb-sm">
          <q-item-label class="self-center" role="text"> {{ t('showSymbol') }} (Alt-Y) </q-item-label>
          <q-space />
          <q-toggle v-model="store.showSymbol" keep-color dense />
        </q-item>
      </template>

      <template v-else-if="store.currentTab == 'radix'">
        <q-separator spaced="md" />

        <q-item class="q-mb-sm">
          <q-item-label class="self-center" role="text"> {{ t('showRadix') }} (Alt-Y) </q-item-label>
          <q-space />
          <q-toggle v-model="store.showRadix" keep-color dense />
        </q-item>

        <q-item class="q-mb-md">
          <q-item-label class="self-center" role="text"> {{ t('radixType') }} (Alt-U) </q-item-label>
          <q-space />
          <q-select
            v-model="store.radixType"
            :options="[
              { label: t('prefix'), value: 'prefix' },
              { label: t('suffix'), value: 'suffix' },
            ]"
            dense
            emit-value
            map-options
            options-dense
            :disable="!store.showRadix"
            :label-color="!store.isDarkMode() ? 'primary' : 'grey-1'"
            :options-selected-class="!store.isDarkMode() ? 'text-primary' : 'text-grey-1'"
            :popup-content-class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
            :class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
          />
        </q-item>
      </template>

      <q-separator spaced="md" />

      <q-item class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('useSystemLocale') }}</q-item-label>
        <q-space />
        <q-toggle v-model="store.useSystemLocale" keep-color dense @click="setLanguage()" />
      </q-item>

      <q-item class="q-mb-md">
        <q-item-label class="self-center" role="text">
          {{ t('language') }}
        </q-item-label>
        <q-space />
        <q-select
          v-model="store.userLocale"
          :disable="store.useSystemLocale"
          :options="languageOptions"
          role="combobox"
          :aria-label="t('ariaLabel.language')"
          dense
          emit-value
          map-options
          options-dense
          :label-color="!store.isDarkMode() ? 'primary' : 'grey-1'"
          :options-selected-class="!store.isDarkMode() ? 'text-primary' : 'text-grey-1'"
          :popup-content-class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
          :class="!store.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
          @update:model-value="setLanguage()"
        />
      </q-item>

      <q-separator spaced="md" />

      <q-item>
        <q-item-label class="self-center">
          {{ t('message.version') }}
        </q-item-label>
        <q-space />
        <q-item-label class="self-center">{{ version }}</q-item-label>
      </q-item>
    </q-list>
  </q-card-section>
</template>

<style scoped lang="scss">
  $height: 26px;
  $left: 4px;
  :deep(.q-field__control) {
    min-height: $height !important;
    height: auto !important;
    padding-left: $left !important;
    .q-field__native {
      min-height: $height !important;
      height: auto !important;
      padding-left: $left !important;
    }
    .q-field__append {
      min-height: $height !important;
      height: auto !important;
      padding-left: $left !important;
    }
  }
</style>

<i18n>
ko:
  alwaysOnTop: '항상 위'
  alwaysOnTopOn: '항상 위 켜짐'
  alwaysOnTopOff: '항상 위 꺼짐'
  initPanel: '시작 시 패널 초기화'
  darkMode:
    title: '다크 모드'
    light: '밝은'
    dark: '어두운'
    system: '시스템'
    message:
      system: '다크 모드를 시스템에 따릅니다.'
      dark: '다크 모드를 켭니다.'
      light: '다크 모드를 끕니다.'
  hapticsMode: '진동 모드'
  showButtonAddedLabel: '버튼 추가 라벨 표시'
  useGrouping: '숫자 묶음 표시'
  groupingUnit: '숫자 묶음 단위'
  decimalPlaces: '소수점'
  decimalPlacesStat: '소수점 자리수'
  noLimit: '제한 없음'
  toNDecimalPlaces: '자리'
  showUnit: '단위 표시'
  showSymbol: '기호 표시'
  showRadix: '진법 표시'
  radixType: '진법 형식'
  prefix: '앞에'
  suffix: '뒤에'
  useSystemLocale: '시스템 언어 사용'
  language: '언어'
  ariaLabel:
    settingsList: '설정 목록'
    alwaysOnTop: '항상 위에 표시 설정'
    initPanel: '시작 시 패널 초기화 설정'
    hapticsMode: '진동 모드 설정'
    darkMode: '다크 모드 설정'
    showButtonAddedLabel: '버튼 추가 라벨 표시 설정'
    useGrouping: '숫자 묶음 표시 설정'
    groupingUnit: '숫자 묶음 단위 설정'
    decimalPlaces: '소수점 자리수 설정'
    showUnit: '단위 표시 설정'
    showSymbol: '기호 표시 설정'
    showRadix: '진법 표시 설정'
    radixType: '진법 형식 설정'
    useSystemLocale: '시스템 언어 사용 설정'
    language: '언어 설정'
en:
  alwaysOnTop: 'Always on top'
  alwaysOnTopOn: 'Always on top ON'
  alwaysOnTopOff: 'Always on top OFF'
  initPanel: 'Init panel at startup'
  darkMode:
    title: 'Dark mode'
    light: 'Light'
    dark: 'Dark'
    system: 'System'
    message:
      system: 'Dark mode follows system.'
      dark: 'Dark mode ON.'
      light: 'Dark mode OFF.'
  hapticsMode: 'Haptics mode'
  showButtonAddedLabel: 'Show button added label'
  useGrouping: 'Use grouping'
  groupingUnit: 'Grouping unit'
  decimalPlaces: 'Decimal'
  decimalPlacesStat: 'Decimal places (stat)'
  noLimit: 'No limit'
  toNDecimalPlaces: 'decimal places'
  showUnit: 'Show unit'
  showSymbol: 'Show symbol'
  showRadix: 'Show radix'
  radixType: 'Radix type'
  prefix: 'Prefix'
  suffix: 'Suffix'
  useSystemLocale: 'Use system locale'
  language: 'Language'
  ariaLabel:
    settingsList: 'Settings list'
    alwaysOnTop: 'Always on top setting'
    initPanel: 'Initialize panel at startup setting'
    hapticsMode: 'Haptics mode setting'
    darkMode: 'Dark mode setting'
    showButtonAddedLabel: 'Show button added label setting'
    useGrouping: 'Use grouping setting'
    groupingUnit: 'Grouping unit setting'
    decimalPlaces: 'Decimal places setting'
    showUnit: 'Show unit setting'
    showSymbol: 'Show symbol setting'
    showRadix: 'Show radix setting'
    radixType: 'Radix type setting'
    useSystemLocale: 'Use system locale setting'
    language: 'Language setting'
</i18n>
