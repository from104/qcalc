<script lang="ts" setup>
  /**
   * @file SettingCard.vue
   * @description 이 파일은 설정 카드 컴포넌트를 구성하는 Vue 컴포넌트입니다.
   *              사용자가 애플리케이션의 다양한 설정을 조정할 수 있도록
   *              언어, 다크 모드, 항상 위에 표시, 햅틱 모드, 소수점 자리수 및 자동 업데이트와 같은
   *              설정 옵션을 제공합니다.
   *              이 컴포넌트는 사용자 경험을 향상시키기 위해 다양한 설정을 관리합니다.
   */

  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { reactive, watch, ref, computed } from 'vue';

  // 전역 globalVars 객체에 접근하기 위한 상수 선언
  const $g = window.globalVars;
  const $s = $g.store;
  
  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { locale } = useI18n({ useScope: 'global' });
  const { t } = useI18n();

  // 스토어 관련
  const { setInitPanel, setDarkMode, setAlwaysOnTop, setHapticsMode, setDecimalPlaces, setAutoUpdate } = $s;

  // 컴포넌트 import
  import ToolTip from 'components/snippets/ToolTip.vue';
  import HelpIcon from 'components/snippets/HelpIcon.vue';

  // 패키지 버전 정보
  import { version } from '../../package.json';

  // 소수점 자리수 설정 값
  import { DECIMAL_PLACES } from 'src/types/store.d';

  // const isDev = import.meta.env.DEV;

  // 언어 옵션 정의
  const languageOptions = reactive([
    { value: 'ko', label: computed(() => t('message.ko')) },
    { value: 'en', label: computed(() => t('message.en')) },
  ]);

  // 시스템 로케일 사용 여부와 사용자 로케일이 변경될 때마다 언어 옵션 라벨을 업데이트합니다.
  watch([() => $s.useSystemLocale, () => $s.userLocale], () => {
    $s.locale = locale.value as string;
  });

  // 시스템 로케일을 참조로 저장합니다.
  const systemLocale = ref(navigator.language.substring(0, 2));

  // 로케일을 설정하는 함수입니다.
  const setLanguage = () => {
    if ($s.useSystemLocale) {
      locale.value = systemLocale.value;
    } else {
      locale.value = $s.userLocale;
    }
  };
</script>

<template>
  <q-card-section class="full-height noselect column no-wrap">
    <q-list v-auto-blur dense class="full-width" role="list" :aria-label="t('ariaLabel.settingsList')">
      <!-- 항상 위에 표시 -->
      <q-item v-if="$g.isElectron" class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('alwaysOnTop') }} (Alt-T)</q-item-label>
        <q-space />
        <q-toggle
          v-model="$s.alwaysOnTop"
          keep-color
          dense
          role="switch"
          :aria-label="t('ariaLabel.alwaysOnTop')"
          @click="setAlwaysOnTop($s.alwaysOnTop)"
        />
      </q-item>

      <!-- 시작 시 패널 초기화 -->
      <q-item class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('initPanel') }} (Alt-I)</q-item-label>
        <q-space />
        <q-toggle
          v-model="$s.initPanel"
          keep-color
          dense
          role="switch"
          :aria-label="t('ariaLabel.initPanel')"
          @click="setInitPanel($s.initPanel)"
        />
      </q-item>

      <!-- 진동 모드 -->
      <q-item v-if="$g.isCapacitor" class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('hapticsMode') }} (Alt-P)</q-item-label>
        <q-space />
        <q-toggle
          v-model="$s.hapticsMode"
          keep-color
          dense
          role="switch"
          :aria-label="t('ariaLabel.hapticsMode')"
          @click="setHapticsMode($s.hapticsMode)"
        />
      </q-item>

      <!-- 다크 모드 -->
      <q-item class="q-mb-md">
        <q-item-label class="self-center" role="text">{{ t('darkMode.title') }} (Alt-D)</q-item-label>
        <q-space />
        <q-select
          v-model="$s.darkMode"
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
          :label-color="!$s.isDarkMode() ? 'primary' : 'grey-1'"
          :options-selected-class="!$s.isDarkMode() ? 'text-primary' : 'text-grey-1'"
          :popup-content-class="!$s.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
          :class="!$s.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
          @update:model-value="setDarkMode"
        />
      </q-item>

      <q-separator spaced="md" role="separator" />

      <!-- 버튼 추가 라벨 표시 -->
      <q-item class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('showButtonAddedLabel') }} (;)</q-item-label>
        <q-space />
        <q-toggle
          v-model="$s.showButtonAddedLabel"
          keep-color
          dense
          role="switch"
          :aria-label="t('ariaLabel.showButtonAddedLabel')"
        />
      </q-item>

      <!-- 숫자 묶음 표시 -->
      <q-item class="q-mb-xs">
        <q-item-label class="self-center" role="text">{{ t('useGrouping') }} (,)</q-item-label>
        <q-space />
        <q-toggle v-model="$s.useGrouping" keep-color dense />
      </q-item>

      <!-- 숫자 묶음 단위 -->
      <q-item class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('groupingUnit') }} (Alt-,)</q-item-label>
        <q-space />
        <q-slider
          v-model="$s.groupingUnit"
          :min="3"
          :max="4"
          :step="1"
          :disable="!$s.useGrouping"
          dense
          class="col-2 q-pr-sm q-pt-xs"
          marker-labels
        />
      </q-item>

      <!-- 소수점 자리수 -->
      <q-item class="q-mb-xs">
        <ToolTip>
          {{ t('decimalPlacesStat') }}:
          {{
            $s.decimalPlaces == -1
              ? t('noLimit')
              : `${DECIMAL_PLACES[$s.decimalPlaces as keyof typeof DECIMAL_PLACES]} ${t('toNDecimalPlaces')}`
          }}
        </ToolTip>
        <q-item-label class="q-pt-xs self-start">{{ t('decimalPlaces') }} ([,])</q-item-label>
        <q-space />
        <q-slider
          :model-value="Number($s.decimalPlaces)"
          :min="-1"
          :max="5"
          :step="1"
          :marker-labels="Object.keys(DECIMAL_PLACES)"
          class="col-5 q-pr-sm"
          dense
          @update:model-value="(value) => setDecimalPlaces(Number(value))"
        >
          <template #marker-label-group="{ markerList }">
            <div
              v-for="(marker, index) in markerList"
              :key="index"
              class="cursor-pointer"
              :class="marker.classes"
              :style="marker.style as any"
              @click="setDecimalPlaces(Number(marker.value))"
            >
              {{ marker.value.toString() == '-1' ? '∞' : DECIMAL_PLACES[marker.value] }}
            </div>
          </template>
        </q-slider>
      </q-item>

      <!-- 단위 표시 -->
      <template v-if="$s.currentTab == 'unit'">
        <q-separator spaced="md" />

        <q-item class="q-mb-sm">
          <q-item-label class="self-center" role="text"> {{ t('showUnit') }} (Alt-Y) </q-item-label>
          <q-space />
          <q-toggle v-model="$s.showUnit" keep-color dense />
        </q-item>
      </template>

      <!-- 기호 표시 -->
      <template v-else-if="$s.currentTab == 'currency'">
        <q-separator spaced="md" />

        <q-item class="q-mb-sm">
          <q-item-label class="self-center" role="text"> {{ t('showSymbol') }} (Alt-Y) </q-item-label>
          <q-space />
          <q-toggle v-model="$s.showSymbol" keep-color dense />
        </q-item>
      </template>

      <!-- 진법 표시 -->
      <template v-else-if="$s.currentTab == 'radix'">
        <q-separator spaced="md" />

        <q-item class="q-mb-sm">
          <q-item-label class="self-center" role="text"> {{ t('showRadix') }} (Alt-Y) </q-item-label>
          <q-space />
          <q-toggle v-model="$s.showRadix" keep-color dense />
        </q-item>

        <!-- 진법 형식 -->
        <q-item class="q-mb-md">
          <q-item-label class="self-center" role="text"> {{ t('radixType') }} (Alt-U) </q-item-label>
          <q-space />
          <q-select
            v-model="$s.radixType"
            :options="[
              { label: t('prefix'), value: 'prefix' },
              { label: t('suffix'), value: 'suffix' },
            ]"
            dense
            emit-value
            map-options
            options-dense
            :disable="!$s.showRadix"
            :label-color="!$s.isDarkMode() ? 'primary' : 'grey-1'"
            :options-selected-class="!$s.isDarkMode() ? 'text-primary' : 'text-grey-1'"
            :popup-content-class="!$s.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
            :class="!$s.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
          />
        </q-item>
      </template>

      <q-separator spaced="md" />

      <!-- 시스템 언어 사용 -->
      <q-item class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('useSystemLocale') }}</q-item-label>
        <q-space />
        <q-toggle v-model="$s.useSystemLocale" keep-color dense @click="setLanguage()" />
      </q-item>

      <!-- 언어 -->
      <q-item class="q-mb-md">
        <q-item-label class="self-center" role="text">
          {{ t('language') }}
        </q-item-label>
        <q-space />
        <q-select
          v-model="$s.userLocale"
          :disable="$s.useSystemLocale"
          :options="languageOptions"
          role="combobox"
          :aria-label="t('ariaLabel.language')"
          dense
          emit-value
          map-options
          options-dense
          :label-color="!$s.isDarkMode() ? 'primary' : 'grey-1'"
          :options-selected-class="!$s.isDarkMode() ? 'text-primary' : 'text-grey-1'"
          :popup-content-class="!$s.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
          :class="!$s.isDarkMode() ? 'bg-blue-grey-2' : 'bg-blue-grey-6'"
          @update:model-value="setLanguage()"
        />
      </q-item>

      <q-separator spaced="md" />

      <!-- 자동 업데이트 설정 -->
      <q-item v-if="$g.isElectron && !$g.isSnap" class="q-mb-sm">
        <q-item-label class="self-center" role="text">
          {{ t('autoUpdate') }}
          <HelpIcon :text="t('autoUpdateHelp')" />
        </q-item-label>
        <q-space />
        <q-toggle
          v-model="$s.autoUpdate"
          keep-color
          dense
          role="switch"
          :aria-label="t('ariaLabel.autoUpdate')"
          @click="setAutoUpdate($s.autoUpdate)"
        />
      </q-item>

      <!-- 버전 -->
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
  autoUpdate: '자동 업데이트'
  autoUpdateHelp: '업데이트를 위해서는 설정에서 자동 업데이트를 활성화하고 앱을 재시작해야 합니다.'
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
    autoUpdate: '자동 업데이트 설정'
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
  autoUpdate: 'Auto update'
  autoUpdateHelp: 'To apply the update, you need to enable automatic updates in the settings and restart the app.'
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
    autoUpdate: 'Auto update setting'
</i18n>
