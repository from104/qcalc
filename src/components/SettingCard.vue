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

  // 스토어 import
  import { useUIStore } from 'stores/uiStore';
  import { useSettingsStore } from 'stores/settingsStore';
  import { useUnitStore } from 'stores/unitStore';
  import { useRadixStore } from 'stores/radixStore';
  import { useCurrencyStore } from 'stores/currencyStore';
  import { useThemesStore } from 'stores/themesStore';
  import { themes, type ThemeType } from 'src/constants/ThemesData';

  // 스토어 인스턴스 생성
  const uiStore = useUIStore();
  const settingsStore = useSettingsStore();
  const unitStore = useUnitStore();
  const radixStore = useRadixStore();
  const currencyStore = useCurrencyStore();
  const themesStore = useThemesStore();

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { locale } = useI18n({ useScope: 'global' });
  const { t } = useI18n();

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
  watch([() => settingsStore.useSystemLocale, () => settingsStore.userLocale], () => {
    settingsStore.locale = locale.value as string;
  });

  // 시스템 로케일을 참조로 저장합니다.
  const systemLocale = ref(navigator.language.substring(0, 2));

  // 로케일을 설정하는 함수입니다.
  const setLanguage = () => {
    if (settingsStore.useSystemLocale) {
      locale.value = systemLocale.value;
    } else {
      locale.value = settingsStore.userLocale;
    }
  };

  // 색상 테마 옵션을 계산합니다.
  const themeOptions = computed(() => {
    return Object.keys(themes).map((themeKey) => {
      const currentLocale = locale.value as 'ko' | 'en';
      const themeName =
        themes[themeKey as ThemeType]?.name?.[currentLocale] || themes[themeKey as ThemeType]?.name?.en || themeKey;
      return {
        label: themeName,
        value: themeKey,
      };
    });
  });

  /**
   * 테마가 변경될 때 호출되는 함수입니다.
   * @param themeName - 선택된 테마 이름
   */
  const onThemeChange = (themeName: ThemeType) => {
    themesStore.setTheme(themeName);
  };

  // themesStore에서 select 색상을 가져오는 computed 속성
  const selectTextColor = computed(() => themesStore.getSelectColor('text', themesStore.isDarkMode()));
  const selectBackgroundColor = computed(() => themesStore.getSelectColor('background', themesStore.isDarkMode()));

  /**
   * 특정 테마의 primary 컬러를 반환하는 함수입니다.
   * @param themeKey - 테마 키 (예: 'default', 'forest', 'ocean' 등)
   * @returns 해당 테마의 primary 컬러 (HEX 형식)
   */
  const getThemePrimaryColor = (themeKey: ThemeType): string => {
    return themes[themeKey]?.ui?.primary || themes.default.ui.primary;
  };

  /**
   * 특정 테마의 라벨을 반환하는 함수입니다.
   * @param themeKey - 테마 키 또는 테마 키 문자열
   * @returns 해당 테마의 번역된 라벨
   */
  const getThemeLabel = (themeKey: ThemeType | string): string => {
    const key = typeof themeKey === 'string' ? themeKey : themeKey;
    const currentLocale = locale.value as 'ko' | 'en';
    return themes[key as ThemeType]?.name?.[currentLocale] || themes[key as ThemeType]?.name?.en || key;
  };

  const primaryAccentColor = computed(() => {
    return themesStore.isDarkMode() ? 'accent' : 'primary';
  });
</script>

<template>
  <q-card-section class="full-height noselect column no-wrap">
    <q-list v-auto-blur dense class="full-width" role="list" :aria-label="t('ariaLabel.settingsList')">
      <!-- 항상 위에 표시 -->
      <q-item v-if="$g.isElectron" class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('alwaysOnTop') }} (Alt-T)</q-item-label>
        <q-space />
        <q-toggle
          v-model="settingsStore.alwaysOnTop"
          keep-color
          :color="primaryAccentColor"
          dense
          role="switch"
          :aria-label="t('ariaLabel.alwaysOnTop')"
          @click="settingsStore.setAlwaysOnTop(settingsStore.alwaysOnTop)"
        />
      </q-item>

      <!-- 시작 시 패널 초기화 -->
      <q-item class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('initPanel') }} (Alt-I)</q-item-label>
        <q-space />
        <q-toggle
          v-model="settingsStore.initPanel"
          keep-color
          :color="primaryAccentColor"
          dense
          role="switch"
          :aria-label="t('ariaLabel.initPanel')"
          @click="settingsStore.setInitPanel(settingsStore.initPanel)"
        />
      </q-item>

      <!-- 진동 모드 -->
      <q-item v-if="$g.isCapacitor" class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('hapticsMode') }} (Alt-P)</q-item-label>
        <q-space />
        <q-toggle
          v-model="settingsStore.hapticsMode"
          keep-color
          :color="primaryAccentColor"
          dense
          role="switch"
          :aria-label="t('ariaLabel.hapticsMode')"
          @click="settingsStore.setHapticsMode(settingsStore.hapticsMode)"
        />
      </q-item>

      <!-- 다크 모드 -->
      <q-item class="q-mb-md">
        <q-item-label class="self-center" role="text">{{ t('darkMode.title') }} (Alt-D)</q-item-label>
        <q-space />
        <q-select
          v-model="themesStore.darkMode"
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
          :label-color="selectTextColor"
          :options-selected-class="`text-${selectTextColor}`"
          :popup-content-class="`bg-${selectBackgroundColor} noselect`"
          :class="`bg-${selectBackgroundColor}`"
          :color="selectTextColor"
          :bg-color="selectBackgroundColor"
          @update:model-value="themesStore.setDarkMode"
        />
      </q-item>

      <!-- 색상 테마 선택 추가 -->
      <q-item class="q-mb-md">
        <q-item-label class="self-center" role="text">{{ t('colorTheme') }}</q-item-label>
        <q-space />
        <q-select
          v-model="themesStore.currentTheme"
          :options="themeOptions"
          dense
          options-dense
          emit-value
          map-options
          :label-color="selectTextColor"
          :options-selected-class="`text-${selectTextColor}`"
          :popup-content-class="`bg-${selectBackgroundColor} noselect`"
          :class="`bg-${selectBackgroundColor}`"
          :color="selectTextColor"
          :bg-color="selectBackgroundColor"
          @update:model-value="onThemeChange"
        >
          <template #option="scope">
            <q-item v-bind="scope.itemProps" class="theme-option-item">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div
                  class="theme-color-square"
                  :class="{ 'theme-color-square--dark': themesStore.isDarkMode() }"
                  :style="{ backgroundColor: getThemePrimaryColor(scope.opt.value) }"
                />
              </q-item-section>
            </q-item>
          </template>
          <template #selected-item="scope">
            <div class="selected-theme-item">
              <span>{{ scope.opt.label || getThemeLabel(scope.opt) }}</span>
              <div
                class="theme-color-square q-ml-sm"
                :class="{ 'theme-color-square--dark': themesStore.isDarkMode() }"
                :style="{ backgroundColor: getThemePrimaryColor(scope.opt.value || scope.opt) }"
              />
            </div>
          </template>
        </q-select>
      </q-item>

      <q-separator spaced="md" role="separator" />

      <!-- 버튼 추가 라벨 표시 -->
      <q-item class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('showButtonAddedLabel') }} (;)</q-item-label>
        <q-space />
        <q-toggle
          v-model="settingsStore.showButtonAddedLabel"
          keep-color
          :color="primaryAccentColor"
          dense
          role="switch"
          :aria-label="t('ariaLabel.showButtonAddedLabel')"
        />
      </q-item>

      <!-- 숫자 묶음 표시 -->
      <q-item class="q-mb-xs">
        <q-item-label class="self-center" role="text">{{ t('useGrouping') }} (,)</q-item-label>
        <q-space />
        <q-toggle v-model="settingsStore.useGrouping" keep-color :color="primaryAccentColor" dense />
      </q-item>

      <!-- 숫자 묶음 단위 -->
      <q-item class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('groupingUnit') }} (Alt-,)</q-item-label>
        <q-space />
        <q-slider
          v-model="settingsStore.groupingUnit"
          :min="3"
          :max="4"
          :step="1"
          :disable="!settingsStore.useGrouping"
          dense
          :color="primaryAccentColor"
          class="col-2 q-pr-sm q-pt-xs"
          marker-labels
        />
      </q-item>

      <!-- 소수점 자리수 -->
      <q-item class="q-mb-xs">
        <ToolTip
          :text-color="themesStore.getCurrentThemeColors.ui.dark"
          :bg-color="themesStore.getCurrentThemeColors.ui.warning"
        >
          {{ t('decimalPlacesStat') }}:
          {{
            settingsStore.decimalPlaces == -1
              ? t('noLimit')
              : `${DECIMAL_PLACES[settingsStore.decimalPlaces as keyof typeof DECIMAL_PLACES]} ${t('toNDecimalPlaces')}`
          }}
        </ToolTip>
        <q-item-label class="q-pt-xs self-start">{{ t('decimalPlaces') }} ([,])</q-item-label>
        <q-space />
        <q-slider
          :model-value="Number(settingsStore.decimalPlaces)"
          :min="-1"
          :max="5"
          :step="1"
          :marker-labels="Object.keys(DECIMAL_PLACES)"
          :color="primaryAccentColor"
          class="col-5 q-pr-sm"
          dense
          @update:model-value="(value) => settingsStore.setDecimalPlaces(Number(value))"
        >
          <template #marker-label-group="{ markerList }">
            <div
              v-for="(marker, index) in markerList"
              :key="index"
              class="cursor-pointer"
              :class="marker.classes"
              :style="marker.style as any"
              @click="settingsStore.setDecimalPlaces(Number(marker.value))"
            >
              {{ marker.value.toString() == '-1' ? '∞' : DECIMAL_PLACES[marker.value] }}
            </div>
          </template>
        </q-slider>
      </q-item>

      <!-- 단위 표시 -->
      <template v-if="uiStore.currentTab == 'unit'">
        <q-separator spaced="md" />

        <q-item class="q-mb-sm">
          <q-item-label class="self-center" role="text"> {{ t('showUnit') }} (Alt-\) </q-item-label>
          <q-space />
          <q-toggle v-model="unitStore.showUnit" keep-color :color="primaryAccentColor" dense />
        </q-item>
      </template>

      <!-- 기호 표시 -->
      <template v-else-if="uiStore.currentTab == 'currency'">
        <q-separator spaced="md" />

        <q-item class="q-mb-sm">
          <q-item-label class="self-center" role="text"> {{ t('showSymbol') }} (Alt-\) </q-item-label>
          <q-space />
          <q-toggle v-model="currencyStore.showSymbol" keep-color :color="primaryAccentColor" dense />
        </q-item>
      </template>

      <!-- 진법 표시 -->
      <template v-else-if="uiStore.currentTab == 'radix'">
        <q-separator spaced="md" />

        <q-item class="q-mb-sm">
          <q-item-label class="self-center" role="text"> {{ t('showRadix') }} (Alt-\) </q-item-label>
          <q-space />
          <q-toggle v-model="radixStore.showRadix" keep-color :color="primaryAccentColor" dense />
        </q-item>

        <!-- 진법 형식 -->
        <q-item class="q-mb-md">
          <q-item-label class="self-center" role="text"> {{ t('radixType') }} (Alt-Ctrl-\) </q-item-label>
          <q-space />
          <q-select
            v-model="radixStore.radixType"
            :options="[
              { label: t('prefix'), value: 'prefix' },
              { label: t('suffix'), value: 'suffix' },
            ]"
            dense
            emit-value
            map-options
            options-dense
            :disable="!radixStore.showRadix"
            :label-color="selectTextColor"
            :options-selected-class="`text-${selectTextColor}`"
            :popup-content-class="`bg-${selectBackgroundColor} noselect`"
            :class="`bg-${selectBackgroundColor}`"
            :color="selectTextColor"
          />
        </q-item>
      </template>

      <q-separator spaced="md" />

      <!-- 시스템 언어 사용 -->
      <q-item class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('useSystemLocale') }}</q-item-label>
        <q-space />
        <q-toggle
          v-model="settingsStore.useSystemLocale"
          keep-color
          :color="primaryAccentColor"
          dense
          @click="setLanguage()"
        />
      </q-item>

      <!-- 언어 -->
      <q-item class="q-mb-md">
        <q-item-label class="self-center" role="text">
          {{ t('language') }}
        </q-item-label>
        <q-space />
        <q-select
          v-model="settingsStore.userLocale"
          :disable="settingsStore.useSystemLocale"
          :options="languageOptions"
          role="combobox"
          :aria-label="t('ariaLabel.language')"
          dense
          emit-value
          map-options
          options-dense
          :label-color="selectTextColor"
          :options-selected-class="`text-${selectTextColor}`"
          :popup-content-class="`bg-${selectBackgroundColor} noselect`"
          :class="`bg-${selectBackgroundColor}`"
          :color="selectTextColor"
          @update:model-value="setLanguage()"
        />
      </q-item>

      <q-separator spaced="md" />

      <!-- 자동 업데이트 설정 -->
      <q-item v-if="$g.isElectron && !$g.isSnap" class="q-mb-sm">
        <q-item-label class="self-center" role="text">
          {{ t('autoUpdate') }}
          <HelpIcon
            :text-color="themesStore.getCurrentThemeColors.ui.dark"
            :bg-color="themesStore.getCurrentThemeColors.ui.warning"
            :text="t('autoUpdateHelp')"
          />
        </q-item-label>
        <q-space />
        <q-toggle
          v-model="settingsStore.autoUpdate"
          keep-color
          :color="primaryAccentColor"
          dense
          role="switch"
          :aria-label="t('ariaLabel.autoUpdate')"
          @click="settingsStore.setAutoUpdate(settingsStore.autoUpdate)"
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

  // 테마 컬러 사각형 스타일
  .theme-color-square {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    border: 1px solid rgba(0, 0, 0, 0.3); // 라이트 모드: 검은색 테두리
    flex-shrink: 0;

    // 다크 모드: 흰색 테두리
    &--dark {
      border-color: rgba(255, 255, 255, 0.5);
    }
  }

  // 선택된 테마 아이템 스타일
  .selected-theme-item {
    display: flex;
    align-items: center;
  }

  // 테마 옵션 아이템 스타일
  .theme-option-item {
    .q-item__section--side {
      padding-left: 8px;
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
  colorTheme: '색상 테마'
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
  colorTheme: 'Color Theme'
</i18n>
