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
  import { reactive, watch, ref, computed, useTemplateRef } from 'vue';
  import { useQuasar } from 'quasar';
  import { SUPPORTED_LANGUAGES } from 'src/i18n/languages';

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
  import { useSettingsManager } from 'src/composables/useSettingsManager';

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
  import ToolTip from 'components/common/ToolTip.vue';
  import HelpIcon from 'components/common/HelpIcon.vue';
  import ThemeEditor from './ThemeEditor.vue';

  const themeEditor = useTemplateRef<InstanceType<typeof ThemeEditor>>('themeEditor');
  const fileInput = useTemplateRef<HTMLInputElement>('fileInput');

  const $q = useQuasar();
  const { applySettings, resetSettings, exportSettings } = useSettingsManager();

  // 설정 초기화 핸들러
  const handleResetSettings = () => {
    $q.dialog({
      title: t('resetSettings.confirmTitle'),
      message: t('resetSettings.confirmMessage'),
      ok: {
        label: t('message.yes'),
        flat: true,
      },
      cancel: {
        label: t('message.no'),
        flat: true,
      },
      persistent: true,
    }).onOk(() => {
      resetSettings();
      $q.notify({ type: 'positive', message: t('resetSettings.success') });
      // 설정을 완전히 적용하기 위해 페이지 새로고침
      window.location.reload();
    });
  };

  // 설정 불러오기 버튼 클릭 핸들러
  const handleImportClick = async () => {
    if (window.showOpenFilePicker) {
      try {
        const [fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              description: 'JSON Files',
              accept: { 'application/json': ['.json'] },
            },
          ],
        });
        if (fileHandle) {
          const file = await fileHandle.getFile();
          processSettingsFile(file);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          $q.notify({ type: 'info', message: t('importSettings.cancelled') });
        } else {
          console.error(error);
          $q.notify({ type: 'negative', message: t('importSettings.fail') });
        }
      }
    } else {
      fileInput.value?.click();
    }
  };

  // 파일 처리 핸들러
  const processSettingsFile = (file: File) => {
    $q.dialog({
      title: t('importSettings.confirmTitle'),
      message: t('importSettings.confirmMessage'),
      ok: {
        label: t('message.yes'),
        flat: true,
      },
      cancel: {
        label: t('message.no'),
        flat: true,
      },
      persistent: true,
    }).onOk(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const newSettings = JSON.parse(content);
          if (applySettings(newSettings)) {
            $q.notify({ type: 'positive', message: t('importSettings.success') });
            window.location.reload();
          } else {
            throw new Error('Invalid settings format');
          }
        } catch (error) {
          console.error(error);
          $q.notify({ type: 'negative', message: t('importSettings.fail') });
        }
      };
      reader.readAsText(file);
    });
  };

  // 파일 변경 핸들러 (설정 불러오기)
  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    processSettingsFile(file);

    // 다음에 같은 파일을 선택해도 change 이벤트가 발생하도록 값 초기화
    target.value = '';
  };

  // 패키지 버전 정보
  import { version } from '../../../package.json';

  // 소수점 자리수 설정 값
  import { DECIMAL_PLACES } from 'src/types/store.d';

  // const isDev = import.meta.env.DEV;

  // 언어 옵션 정의 (SUPPORTED_LANGUAGES에서 자동 생성)
  const languageOptions = reactive(
    SUPPORTED_LANGUAGES.map((lang) => ({
      value: lang.code,
      label: computed(() => t(`message.${lang.code}`)),
    })),
  );

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
    const defaultThemes = Object.keys(themes).map((themeKey) => {
      const currentLocale = locale.value as 'ko' | 'en';
      const themeName =
        themes[themeKey as ThemeType]?.name?.[currentLocale] || themes[themeKey as ThemeType]?.name?.en || themeKey;
      return {
        label: themeName,
        value: themeKey,
        isUserTheme: false,
      };
    });

    const userThemes = Object.keys(themesStore.userThemes).map((themeKey) => ({
      label: themeKey,
      value: themeKey,
      isUserTheme: true,
    }));

    if (userThemes.length > 0) {
      return [...defaultThemes, { isSeparator: true }, ...userThemes];
    }
    return defaultThemes;
  });

  /**
   * 테마가 변경될 때 호출되는 함수입니다.
   * @param themeName - 선택된 테마 이름
   */
  const onThemeChange = (themeName: ThemeType | string) => {
    themesStore.setTheme(themeName);
  };

  /**
   * 사용자 테마를 수정하기 위해 ThemeEditor를 엽니다.
   * @param themeName - 수정할 테마의 이름
   */
  function editTheme(themeName: string) {
    const themeData = themesStore.userThemes[themeName];
    if (themeData && themeEditor.value) {
      themeEditor.value.open({
        isEdit: true,
        themeName: themeName,
        themeData: themeData,
      });
    }
  }

  /**
   * 사용자 테마를 삭제합니다.
   * @param themeName - 삭제할 테마의 이름
   */
  function deleteTheme(themeName: string) {
    $q.dialog({
      title: t('confirmDeleteTitle'),
      message: t('confirmDeleteMessage', { themeName }),
      ok: {
        label: t('yes'),
        flat: true,
      },
      cancel: {
        label: t('no'),
        flat: true,
      },
      persistent: true,
    }).onOk(() => {
      themesStore.removeUserTheme(themeName);
      themesStore.setTheme('default');
    });
  }

  /**
   * 현재 테마를 기반으로 새 테마를 만듭니다.
   */
  function createNewTheme() {
    const baseThemeKey = themesStore.currentTheme;
    const baseTheme = themesStore.userThemes[baseThemeKey] || themes[baseThemeKey as ThemeType];

    if (baseTheme && themeEditor.value) {
      themeEditor.value.open({
        isEdit: false,
        themeName: '', // 새 테마를 위해 이름 비우기
        themeData: baseTheme,
      });
    }
  }

  // themesStore에서 select 색상을 가져오는 computed 속성
  const selectTextColor = computed(() => themesStore.getSelectColor('text', themesStore.isDarkMode()));
  const selectBackgroundColor = computed(() => themesStore.getSelectColor('background', themesStore.isDarkMode()));

  /**
   * 특정 테마의 primary 컬러를 HEX 형식으로 반환하는 함수입니다.
   * @param themeKey - 테마 키 (예: 'default', 'forest', 'ocean' 등)
   * @returns 해당 테마의 primary 컬러 (HEX 형식)
   */
  const getThemePrimaryColor = (themeKey: ThemeType | string): string => {
    const theme = themesStore.userThemes[themeKey] || themes[themeKey as ThemeType];
    const quasarColorName = theme?.ui?.primary || themes.default.ui.primary;
    return themesStore.getQuasarColorToHex(quasarColorName);
  };

  /**
   * 특정 테마의 라벨을 반환하는 함수입니다.
   * @param themeKey - 테마 키 또는 테마 키 문자열
   * @returns 해당 테마의 번역된 라벨
   */
  const getThemeLabel = (themeKey: ThemeType | string): string => {
    const key = typeof themeKey === 'string' ? themeKey : themeKey;
    if (themesStore.userThemes[key]) {
      return key;
    }
    const currentLocale = locale.value as 'ko' | 'en';
    return themes[key as ThemeType]?.name?.[currentLocale] || themes[key as ThemeType]?.name?.en || key;
  };

  const primaryAccentColor = computed(() => {
    return themesStore.isDarkMode() ? 'accent' : 'primary';
  });

  /**
   * 현재 계산기의 포맷 설정을 반환하는 computed 속성
   */
  const currentFormatSettings = computed(() => settingsStore.getCurrentFormatSettings);

  /**
   * 현재 계산기의 useGrouping 설정
   */
  const currentUseGrouping = computed({
    get: () => currentFormatSettings.value.useGrouping,
    set: (value: boolean) => {
      settingsStore.updateCurrentSettings({ useGrouping: value });
    },
  });

  /**
   * 현재 계산기의 groupingUnit 설정
   */
  const currentGroupingUnit = computed({
    get: () => currentFormatSettings.value.groupingUnit,
    set: (value: number) => {
      settingsStore.updateCurrentSettings({ groupingUnit: value as 3 | 4 });
    },
  });

  /**
   * 현재 계산기의 decimalPlaces 설정
   */
  const currentDecimalPlaces = computed({
    get: () => currentFormatSettings.value.decimalPlaces,
    set: (value: number) => {
      settingsStore.updateCurrentSettings({ decimalPlaces: value });
    },
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

      <q-separator spaced="md" role="separator" />

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

      <!-- 색상 테마 선택 -->
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
          :aria-label="t('ariaLabel.colorTheme')"
          @update:model-value="onThemeChange"
        >
          <template #option="scope">
            <q-separator v-if="scope.opt.isSeparator" />
            <q-item v-else v-bind="scope.itemProps" class="theme-option-item">
              <q-item-section>
                <q-item-label class="truncate-clip">{{ scope.opt.label }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row items-center no-wrap">
                  <!-- 사용자 테마를 위한 수정 및 삭제 버튼 -->
                  <div v-if="scope.opt.isUserTheme">
                    <q-btn
                      flat
                      dense
                      round
                      icon="edit"
                      size="sm"
                      class="q-mr-sm"
                      :aria-label="t('ariaLabel.editTheme', { themeName: scope.opt.label })"
                      @click.stop="editTheme(scope.opt.value)"
                    />
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      size="sm"
                      :aria-label="t('ariaLabel.deleteTheme', { themeName: scope.opt.label })"
                      @click.stop="deleteTheme(scope.opt.value)"
                    />
                  </div>
                  <div
                    class="theme-color-square"
                    :class="{ 'theme-color-square--dark': themesStore.isDarkMode() }"
                    :style="{ backgroundColor: getThemePrimaryColor(scope.opt.value) }"
                  />
                </div>
              </q-item-section>
            </q-item>
          </template>
          <template #selected-item="scope">
            <div class="selected-theme-item">
              <span class="selected-label truncate-clip">{{ scope.opt.label || getThemeLabel(scope.opt) }}</span>
              <div
                class="theme-color-square q-ml-sm"
                :class="{ 'theme-color-square--dark': themesStore.isDarkMode() }"
                :style="{ backgroundColor: getThemePrimaryColor(scope.opt.value || scope.opt) }"
              />
            </div>
          </template>
        </q-select>
      </q-item>

      <!-- 새 테마 만들기 버튼 -->
      <q-item>
        <q-btn
          flat
          dense
          :label="t('createNewTheme')"
          class="full-width"
          :color="selectTextColor"
          :class="`bg-${selectBackgroundColor}`"
          :aria-label="t('ariaLabel.createNewTheme')"
          @click="createNewTheme"
        />
      </q-item>

      <!-- 테마 편집기 -->
      <ThemeEditor ref="themeEditor" />

      <q-separator spaced="md" role="separator" />

      <!-- 숫자 형식 계산기별 적용 -->
      <q-item class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('numberFormatPerCalculator') }} (Alt-N)</q-item-label>
        <q-space />
        <q-toggle
          v-model="settingsStore.numberFormatPerCalculator"
          keep-color
          :color="primaryAccentColor"
          dense
          role="switch"
          :aria-label="t('ariaLabel.numberFormatPerCalculator')"
        />
      </q-item>

      <q-separator spaced="sm" role="separator" />

      <!-- 숫자 묶음 표시 -->
      <q-item class="q-mb-xs">
        <q-item-label class="self-center" role="text">{{ t('useGrouping') }} (,)</q-item-label>
        <q-space />
        <q-toggle
          v-model="currentUseGrouping"
          keep-color
          :color="primaryAccentColor"
          dense
          role="switch"
          :aria-label="t('ariaLabel.useGrouping')"
        />
      </q-item>

      <!-- 숫자 묶음 단위 -->
      <q-item class="q-mb-sm">
        <q-item-label class="self-center" role="text">{{ t('groupingUnit') }} (Alt-,)</q-item-label>
        <q-space />
        <q-slider
          v-model="currentGroupingUnit"
          :min="3"
          :max="4"
          :step="1"
          :disable="!currentUseGrouping"
          dense
          :color="primaryAccentColor"
          class="col-2 q-pr-sm q-pt-xs"
          marker-labels
        />
      </q-item>

      <!-- 소수점 자리수 -->
      <q-item class="q-mb-xs">
        <ToolTip :text-color="themesStore.getDarkColor()" :bg-color="themesStore.getCurrentThemeColors.ui.warning">
          {{ t('decimalPlacesStat') }}:
          {{
            currentDecimalPlaces == -1
              ? t('noLimit')
              : `${DECIMAL_PLACES[currentDecimalPlaces as keyof typeof DECIMAL_PLACES]} ${t('toNDecimalPlaces')}`
          }}
        </ToolTip>
        <q-item-label class="q-pt-xs self-start">{{ t('decimalPlaces') }} ([,])</q-item-label>
        <q-space />
        <q-slider
          :model-value="Number(currentDecimalPlaces)"
          :min="-1"
          :max="5"
          :step="1"
          :marker-labels="Object.keys(DECIMAL_PLACES)"
          :color="primaryAccentColor"
          class="col-5 q-pr-sm"
          dense
          @update:model-value="
            (value: number | null) => {
              if (value != null) currentDecimalPlaces = Number(value);
            }
          "
        >
          <template #marker-label-group="{ markerList }">
            <div
              v-for="(marker, index) in markerList"
              :key="index"
              class="cursor-pointer"
              :class="marker.classes"
              :style="marker.style as unknown as import('vue').StyleValue"
              @click="currentDecimalPlaces = Number(marker.value)"
            >
              {{ marker.value.toString() == '-1' ? '∞' : DECIMAL_PLACES[marker.value] }}
            </div>
          </template>
        </q-slider>
      </q-item>

      <!-- 단위 표시 -->
      <template v-if="uiStore.currentTab == 'unit'">
        <q-separator spaced="md" role="separator" />

        <q-item class="q-mb-sm">
          <q-item-label class="self-center" role="text"> {{ t('showUnit') }} (Alt-\\) </q-item-label>
          <q-space />
          <q-toggle v-model="unitStore.showUnit" keep-color :color="primaryAccentColor" dense />
        </q-item>
      </template>

      <!-- 기호 표시 -->
      <template v-else-if="uiStore.currentTab == 'currency'">
        <q-separator spaced="md" role="separator" />

        <q-item class="q-mb-sm">
          <q-item-label class="self-center" role="text"> {{ t('showSymbol') }} (Alt-\) </q-item-label>
          <q-space />
          <q-toggle v-model="currencyStore.showSymbol" keep-color :color="primaryAccentColor" dense />
        </q-item>
      </template>

      <!-- 진법 표시 -->
      <template v-else-if="uiStore.currentTab == 'radix'">
        <q-separator spaced="md" role="separator" />

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

      <q-separator spaced="md" role="separator" />

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

      <q-separator spaced="md" role="separator" />

      <!-- 자동 업데이트 설정 -->
      <q-item v-if="$g.isElectron && !$g.isSnap" class="q-mb-sm">
        <q-item-label class="self-center" role="text">
          {{ t('autoUpdate') }}
          <HelpIcon
            :text-color="themesStore.getDarkColor()"
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

      <q-separator spaced="md" role="separator" />

      <!-- 설정 관리 -->
      <q-item class="q-mb-sm">
        <q-item-label class="q-pt-md">{{ t('settingsManagement') }}</q-item-label>
      </q-item>
      <q-item class="q-mb-sm">
        <div class="full-width q-px-sm q-py-xs">
          <q-btn-group spread class="full-width">
            <q-btn
              flat
              dense
              :label="t('reset')"
              :color="selectTextColor"
              :class="`bg-${selectBackgroundColor}`"
              :aria-label="t('ariaLabel.resetSettings')"
              @click="handleResetSettings"
            />
            <q-btn
              flat
              dense
              :label="t('export')"
              :color="selectTextColor"
              :class="`bg-${selectBackgroundColor}`"
              :aria-label="t('ariaLabel.exportSettings')"
              @click="exportSettings"
            />
            <q-btn
              flat
              dense
              :label="t('import')"
              :color="selectTextColor"
              :class="`bg-${selectBackgroundColor}`"
              :aria-label="t('ariaLabel.importSettings')"
              @click="handleImportClick"
            />
          </q-btn-group>
          <input
            ref="fileInput"
            type="file"
            style="display: none"
            accept="text/json,.json"
            :aria-label="t('ariaLabel.importSettings')"
            @change="handleFileChange"
          />
        </div>
      </q-item>

      <q-separator spaced="xl" role="separator" />

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
    width: 100%; // 너비를 최대로 설정
    overflow: hidden; // 넘치는 부분 숨기기
  }

  .selected-label {
    flex-grow: 1; // 가능한 많은 공간을 차지하도록 설정
  }

  .truncate-clip {
    white-space: nowrap;
    overflow: hidden;
  }

  // 테마 옵션 아이템 스타일
  .theme-option-item {
    .q-item__section--side {
      padding-left: 8px;
    }
  }
</style>

<i18n lang="yaml">
ko:
  alwaysOnTop: '항상 위'
  initPanel: '시작 시 패널 초기화'
  darkMode:
    title: '다크 모드'
    light: '밝은'
    dark: '어두운'
    system: '시스템'
  hapticsMode: '진동 모드'
  showButtonAddedLabel: '버튼 추가 라벨 표시'
  numberFormatPerCalculator: '숫자 형식 계산기별 적용'
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
  prefix: '숫자 앞에'
  suffix: '숫자 뒤에'
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
    numberFormatPerCalculator: '숫자 형식 계산기별 적용 설정'
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
    editTheme: '{themeName} 테마 편집'
    deleteTheme: '{themeName} 테마 삭제'
    createNewTheme: '새 테마 만들기'
    resetSettings: '설정 초기화'
    exportSettings: '설정 내보내기'
    importSettings: '설정 불러오기'
  colorTheme: '색상 테마'
  createNewTheme: '새 테마 만들기'
  reset: '초기화'
  export: '내보내기'
  import: '불러오기'
  settingsManagement: '설정 관리'
  resetSettings:
    confirmTitle: '설정 초기화 확인'
    confirmMessage: '정말로 모든 설정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
    success: '설정이 성공적으로 초기화되었습니다.'
  exportSettings:
    exportMethodTitle: '내보내기 방법'
    exportMethodMessage: '설정을 어떻게 내보내시겠습니까?'
    saveToDevice: '기기에 저장'
    shareFile: '파일 공유'
    successMobile: '설정이 {fileName}(으)로 내보내졌습니다.'
    mobileSaveLocation: 'Documents 폴더에 저장되었습니다.'
    fail: '설정 내보내기에 실패했습니다.'
    shareTitle: 'QCalc 설정'
    shareText: 'QCalc 설정 파일을 공유합니다.'
    shareDialogTitle: '설정 공유'
    cancelled: '설정 내보내기가 취소되었습니다.'
    success: '설정을 성공적으로 내보냈습니다.'
  importSettings:
    confirmTitle: '설정 불러오기 확인'
    confirmMessage: '현재 설정을 덮어쓰고 선택한 파일의 설정으로 교체하시겠습니까?'
    success: '설정을 성공적으로 불러왔습니다.'
    fail: '설정 불러오기에 실패했습니다. 파일이 손상되었거나 형식이 올바르지 않습니다.'
    cancelled: '설정 불러오기를 취소했습니다.'
  confirmDeleteTitle: '테마 삭제 확인'
  confirmDeleteMessage: '정말로 \''{themeName}\'' 테마를 삭제하시겠습니까?'
en:
  alwaysOnTop: 'Always on top'
  initPanel: 'Init panel at startup'
  darkMode:
    title: 'Dark mode'
    light: 'Light'
    dark: 'Dark'
    system: 'System'
  hapticsMode: 'Haptics mode'
  showButtonAddedLabel: 'Show button added label'
  numberFormatPerCalculator: 'Apply number format per calculator'
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
    numberFormatPerCalculator: 'Apply number format per calculator setting'
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
    editTheme: 'Edit {themeName} theme'
    deleteTheme: 'Delete {themeName} theme'
    createNewTheme: 'Create a new theme'
    resetSettings: 'Reset settings'
    exportSettings: 'Export settings'
    importSettings: 'Import settings'
  colorTheme: 'Color Theme'
  createNewTheme: 'Create New Theme'
  reset: 'Reset'
  export: 'Export'
  import: 'Import'
  settingsManagement: 'Settings Management'
  resetSettings:
    confirmTitle: 'Confirm Reset'
    confirmMessage: 'Are you sure you want to reset all settings? This action cannot be undone.'
    success: 'Settings have been successfully reset.'
  exportSettings:
    exportMethodTitle: 'Export Method'
    exportMethodMessage: 'How would you like to export the settings?'
    saveToDevice: 'Save to Device'
    shareFile: 'Share File'
    successMobile: 'Settings exported to {fileName}.'
    mobileSaveLocation: 'Saved in the Documents folder.'
    fail: 'Failed to export settings.'
    shareTitle: 'QCalc Settings'
    shareText: 'Here are my QCalc settings.'
    shareDialogTitle: 'Share Settings'
    cancelled: 'Settings export cancelled.'
    success: 'Settings have been successfully exported.'
  importSettings:
    confirmTitle: 'Confirm Import'
    confirmMessage: 'Are you sure you want to overwrite current settings with the ones from the selected file?'
    success: 'Settings have been successfully imported.'
    fail: 'Failed to import settings. The file may be corrupt or in the wrong format.'
    cancelled: 'Settings import cancelled.'
  confirmDeleteTitle: 'Confirm Theme Deletion'
  confirmDeleteMessage: 'Are you sure you want to delete the theme \''{themeName}\''?'
ja:
  alwaysOnTop: '常に最前面'
  initPanel: '起動時にパネルを初期化'
  darkMode:
    title: 'ダークモード'
    light: 'ライト'
    dark: 'ダーク'
    system: 'システム'
  hapticsMode: '振動モード'
  showButtonAddedLabel: 'ボタン追加ラベルを表示'
  numberFormatPerCalculator: '数値形式を計算機ごとに適用'
  useGrouping: '数値グループ表示'
  groupingUnit: '数値グループ単位'
  decimalPlaces: '小数点'
  decimalPlacesStat: '小数点以下の桁数'
  noLimit: '制限なし'
  toNDecimalPlaces: '桁'
  showUnit: '単位を表示'
  showSymbol: '記号を表示'
  showRadix: '基数を表示'
  radixType: '基数形式'
  prefix: 'プレフィックス'
  suffix: 'サフィックス'
  useSystemLocale: 'システム言語を使用'
  language: '言語'
  autoUpdate: '自動アップデート'
  autoUpdateHelp: 'アップデートを適用するには、設定で自動アップデートを有効にしてアプリを再起動してください。'
  ariaLabel:
    settingsList: '設定リスト'
    alwaysOnTop: '常に最前面設定'
    initPanel: '起動時パネル初期化設定'
    hapticsMode: '振動モード設定'
    darkMode: 'ダークモード設定'
    showButtonAddedLabel: 'ボタン追加ラベル表示設定'
    numberFormatPerCalculator: '数値形式計算機別適用設定'
    useGrouping: '数値グループ表示設定'
    groupingUnit: '数値グループ単位設定'
    decimalPlaces: '小数点桁数設定'
    showUnit: '単位表示設定'
    showSymbol: '記号表示設定'
    showRadix: '基数表示設定'
    radixType: '基数形式設定'
    useSystemLocale: 'システム言語使用設定'
    language: '言語設定'
    autoUpdate: '自動アップデート設定'
    colorTheme: 'カラーテーマ'
    editTheme: '{themeName}テーマを編集'
    deleteTheme: '{themeName}テーマを削除'
    createNewTheme: '新しいテーマを作成'
    resetSettings: '設定をリセット'
    exportSettings: '設定をエクスポート'
    importSettings: '設定をインポート'
  colorTheme: 'カラーテーマ'
  createNewTheme: '新しいテーマを作成'
  reset: 'リセット'
  export: 'エクスポート'
  import: 'インポート'
  settingsManagement: '設定管理'
  resetSettings:
    confirmTitle: 'リセットの確認'
    confirmMessage: 'すべての設定をリセットしてもよろしいですか？この操作は元に戻せません。'
    success: '設定が正常にリセットされました。'
  exportSettings:
    exportMethodTitle: 'エクスポート方法'
    exportMethodMessage: '設定をどのようにエクスポートしますか？'
    saveToDevice: 'デバイスに保存'
    shareFile: 'ファイルを共有'
    successMobile: '設定が{fileName}にエクスポートされました。'
    mobileSaveLocation: 'Documentsフォルダに保存されました。'
    fail: '設定のエクスポートに失敗しました。'
    shareTitle: 'QCalc設定'
    shareText: 'QCalcの設定ファイルを共有します。'
    shareDialogTitle: '設定を共有'
    cancelled: '設定のエクスポートがキャンセルされました。'
    success: '設定が正常にエクスポートされました。'
  importSettings:
    confirmTitle: 'インポートの確認'
    confirmMessage: '現在の設定を選択したファイルの設定で上書きしてもよろしいですか？'
    success: '設定が正常にインポートされました。'
    fail: '設定のインポートに失敗しました。ファイルが破損しているか、形式が正しくない可能性があります。'
    cancelled: '設定のインポートがキャンセルされました。'
  confirmDeleteTitle: 'テーマ削除の確認'
  confirmDeleteMessage: '本当に\''{themeName}\''テーマを削除しますか？'
zh:
  alwaysOnTop: '置顶'
  initPanel: '启动时初始化面板'
  darkMode:
    title: '深色模式'
    light: '浅色'
    dark: '深色'
    system: '系统'
  hapticsMode: '振动模式'
  showButtonAddedLabel: '显示按钮附加标签'
  numberFormatPerCalculator: '按计算器应用数字格式'
  useGrouping: '数字分组显示'
  groupingUnit: '数字分组单位'
  decimalPlaces: '小数点'
  decimalPlacesStat: '小数位数'
  noLimit: '无限制'
  toNDecimalPlaces: '位'
  showUnit: '显示单位'
  showSymbol: '显示符号'
  showRadix: '显示进制'
  radixType: '进制格式'
  prefix: '前缀'
  suffix: '后缀'
  useSystemLocale: '使用系统语言'
  language: '语言'
  autoUpdate: '自动更新'
  autoUpdateHelp: '要应用更新，请在设置中启用自动更新并重启应用。'
  ariaLabel:
    settingsList: '设置列表'
    alwaysOnTop: '置顶设置'
    initPanel: '启动时初始化面板设置'
    hapticsMode: '振动模式设置'
    darkMode: '深色模式设置'
    showButtonAddedLabel: '显示按钮附加标签设置'
    numberFormatPerCalculator: '按计算器应用数字格式设置'
    useGrouping: '数字分组显示设置'
    groupingUnit: '数字分组单位设置'
    decimalPlaces: '小数位数设置'
    showUnit: '显示单位设置'
    showSymbol: '显示符号设置'
    showRadix: '显示进制设置'
    radixType: '进制格式设置'
    useSystemLocale: '使用系统语言设置'
    language: '语言设置'
    autoUpdate: '自动更新设置'
    colorTheme: '颜色主题'
    editTheme: '编辑{themeName}主题'
    deleteTheme: '删除{themeName}主题'
    createNewTheme: '创建新主题'
    resetSettings: '重置设置'
    exportSettings: '导出设置'
    importSettings: '导入设置'
  colorTheme: '颜色主题'
  createNewTheme: '创建新主题'
  reset: '重置'
  export: '导出'
  import: '导入'
  settingsManagement: '设置管理'
  resetSettings:
    confirmTitle: '确认重置'
    confirmMessage: '确定要重置所有设置吗？此操作无法撤消。'
    success: '设置已成功重置。'
  exportSettings:
    exportMethodTitle: '导出方式'
    exportMethodMessage: '您想如何导出设置？'
    saveToDevice: '保存到设备'
    shareFile: '共享文件'
    successMobile: '设置已导出到{fileName}。'
    mobileSaveLocation: '已保存到Documents文件夹。'
    fail: '导出设置失败。'
    shareTitle: 'QCalc设置'
    shareText: '共享QCalc设置文件。'
    shareDialogTitle: '共享设置'
    cancelled: '设置导出已取消。'
    success: '设置已成功导出。'
  importSettings:
    confirmTitle: '确认导入'
    confirmMessage: '确定要用所选文件的设置覆盖当前设置吗？'
    success: '设置已成功导入。'
    fail: '导入设置失败。文件可能已损坏或格式不正确。'
    cancelled: '设置导入已取消。'
  confirmDeleteTitle: '确认删除主题'
  confirmDeleteMessage: '确定要删除\''{themeName}\''主题吗？'
hi:
  alwaysOnTop: 'हमेशा ऊपर'
  initPanel: 'शुरू में पैनल प्रारंभ करें'
  darkMode:
    title: 'डार्क मोड'
    light: 'लाइट'
    dark: 'डार्क'
    system: 'सिस्टम'
  hapticsMode: 'कंपन मोड'
  showButtonAddedLabel: 'बटन अतिरिक्त लेबल दिखाएं'
  numberFormatPerCalculator: 'प्रति कैलकुलेटर संख्या प्रारूप लागू करें'
  useGrouping: 'संख्या समूहन दिखाएं'
  groupingUnit: 'संख्या समूहन इकाई'
  decimalPlaces: 'दशमलव'
  decimalPlacesStat: 'दशमलव स्थान'
  noLimit: 'कोई सीमा नहीं'
  toNDecimalPlaces: 'स्थान'
  showUnit: 'इकाई दिखाएं'
  showSymbol: 'प्रतीक दिखाएं'
  showRadix: 'आधार दिखाएं'
  radixType: 'आधार प्रकार'
  prefix: 'उपसर्ग'
  suffix: 'प्रत्यय'
  useSystemLocale: 'सिस्टम भाषा उपयोग करें'
  language: 'भाषा'
  autoUpdate: 'स्वचालित अपडेट'
  autoUpdateHelp: 'अपडेट लागू करने के लिए, सेटिंग्स में स्वचालित अपडेट सक्षम करें और ऐप को पुनरारंभ करें।'
  ariaLabel:
    settingsList: 'सेटिंग्स सूची'
    alwaysOnTop: 'हमेशा ऊपर सेटिंग'
    initPanel: 'शुरू में पैनल प्रारंभ सेटिंग'
    hapticsMode: 'कंपन मोड सेटिंग'
    darkMode: 'डार्क मोड सेटिंग'
    showButtonAddedLabel: 'बटन अतिरिक्त लेबल दिखाएं सेटिंग'
    numberFormatPerCalculator: 'प्रति कैलकुलेटर संख्या प्रारूप सेटिंग'
    useGrouping: 'संख्या समूहन सेटिंग'
    groupingUnit: 'संख्या समूहन इकाई सेटिंग'
    decimalPlaces: 'दशमलव स्थान सेटिंग'
    showUnit: 'इकाई दिखाएं सेटिंग'
    showSymbol: 'प्रतीक दिखाएं सेटिंग'
    showRadix: 'आधार दिखाएं सेटिंग'
    radixType: 'आधार प्रकार सेटिंग'
    useSystemLocale: 'सिस्टम भाषा सेटिंग'
    language: 'भाषा सेटिंग'
    autoUpdate: 'स्वचालित अपडेट सेटिंग'
    colorTheme: 'रंग थीम'
    editTheme: '{themeName} थीम संपादित करें'
    deleteTheme: '{themeName} थीम हटाएं'
    createNewTheme: 'नई थीम बनाएं'
    resetSettings: 'सेटिंग्स रीसेट करें'
    exportSettings: 'सेटिंग्स निर्यात करें'
    importSettings: 'सेटिंग्स आयात करें'
  colorTheme: 'रंग थीम'
  createNewTheme: 'नई थीम बनाएं'
  reset: 'रीसेट'
  export: 'निर्यात'
  import: 'आयात'
  settingsManagement: 'सेटिंग्स प्रबंधन'
  resetSettings:
    confirmTitle: 'रीसेट की पुष्टि'
    confirmMessage: 'क्या आप वाकई सभी सेटिंग्स रीसेट करना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।'
    success: 'सेटिंग्स सफलतापूर्वक रीसेट की गईं।'
  exportSettings:
    exportMethodTitle: 'निर्यात विधि'
    exportMethodMessage: 'आप सेटिंग्स कैसे निर्यात करना चाहते हैं?'
    saveToDevice: 'डिवाइस में सहेजें'
    shareFile: 'फ़ाइल साझा करें'
    successMobile: 'सेटिंग्स {fileName} में निर्यात की गईं।'
    mobileSaveLocation: 'Documents फ़ोल्डर में सहेजा गया।'
    fail: 'सेटिंग्स निर्यात करने में विफल।'
    shareTitle: 'QCalc सेटिंग्स'
    shareText: 'QCalc सेटिंग्स फ़ाइल साझा करें।'
    shareDialogTitle: 'सेटिंग्स साझा करें'
    cancelled: 'सेटिंग्स निर्यात रद्द।'
    success: 'सेटिंग्स सफलतापूर्वक निर्यात की गईं।'
  importSettings:
    confirmTitle: 'आयात की पुष्टि'
    confirmMessage: 'क्या आप वाकई वर्तमान सेटिंग्स को चयनित फ़ाइल की सेटिंग्स से बदलना चाहते हैं?'
    success: 'सेटिंग्स सफलतापूर्वक आयात की गईं।'
    fail: 'सेटिंग्स आयात करने में विफल। फ़ाइल दूषित हो सकती है या प्रारूप गलत हो सकता है।'
    cancelled: 'सेटिंग्स आयात रद्द।'
  confirmDeleteTitle: 'थीम हटाने की पुष्टि'
  confirmDeleteMessage: 'क्या आप वाकई \''{themeName}\'' थीम हटाना चाहते हैं?'
de:
  alwaysOnTop: 'Immer im Vordergrund'
  initPanel: 'Panel beim Start initialisieren'
  darkMode:
    title: 'Dunkelmodus'
    light: 'Hell'
    dark: 'Dunkel'
    system: 'System'
  hapticsMode: 'Vibrationsmodus'
  showButtonAddedLabel: 'Zusätzliches Button-Label anzeigen'
  numberFormatPerCalculator: 'Zahlenformat pro Rechner anwenden'
  useGrouping: 'Zahlengruppierung anzeigen'
  groupingUnit: 'Gruppierungseinheit'
  decimalPlaces: 'Dezimal'
  decimalPlacesStat: 'Dezimalstellen'
  noLimit: 'Keine Begrenzung'
  toNDecimalPlaces: 'Stellen'
  showUnit: 'Einheit anzeigen'
  showSymbol: 'Symbol anzeigen'
  showRadix: 'Basis anzeigen'
  radixType: 'Basisformat'
  prefix: 'Präfix'
  suffix: 'Suffix'
  useSystemLocale: 'Systemsprache verwenden'
  language: 'Sprache'
  autoUpdate: 'Automatische Updates'
  autoUpdateHelp: 'Um das Update anzuwenden, aktivieren Sie automatische Updates in den Einstellungen und starten Sie die App neu.'
  ariaLabel:
    settingsList: 'Einstellungsliste'
    alwaysOnTop: 'Immer im Vordergrund Einstellung'
    initPanel: 'Panel beim Start initialisieren Einstellung'
    hapticsMode: 'Vibrationsmodus Einstellung'
    darkMode: 'Dunkelmodus Einstellung'
    showButtonAddedLabel: 'Zusätzliches Button-Label Einstellung'
    numberFormatPerCalculator: 'Zahlenformat pro Rechner Einstellung'
    useGrouping: 'Zahlengruppierung Einstellung'
    groupingUnit: 'Gruppierungseinheit Einstellung'
    decimalPlaces: 'Dezimalstellen Einstellung'
    showUnit: 'Einheit anzeigen Einstellung'
    showSymbol: 'Symbol anzeigen Einstellung'
    showRadix: 'Basis anzeigen Einstellung'
    radixType: 'Basisformat Einstellung'
    useSystemLocale: 'Systemsprache Einstellung'
    language: 'Sprache Einstellung'
    autoUpdate: 'Automatische Updates Einstellung'
    colorTheme: 'Farbthema'
    editTheme: '{themeName}-Theme bearbeiten'
    deleteTheme: '{themeName}-Theme löschen'
    createNewTheme: 'Neues Theme erstellen'
    resetSettings: 'Einstellungen zurücksetzen'
    exportSettings: 'Einstellungen exportieren'
    importSettings: 'Einstellungen importieren'
  colorTheme: 'Farbthema'
  createNewTheme: 'Neues Theme erstellen'
  reset: 'Zurücksetzen'
  export: 'Exportieren'
  import: 'Importieren'
  settingsManagement: 'Einstellungsverwaltung'
  resetSettings:
    confirmTitle: 'Zurücksetzen bestätigen'
    confirmMessage: 'Möchten Sie wirklich alle Einstellungen zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.'
    success: 'Einstellungen wurden erfolgreich zurückgesetzt.'
  exportSettings:
    exportMethodTitle: 'Exportmethode'
    exportMethodMessage: 'Wie möchten Sie die Einstellungen exportieren?'
    saveToDevice: 'Auf Gerät speichern'
    shareFile: 'Datei teilen'
    successMobile: 'Einstellungen wurden nach {fileName} exportiert.'
    mobileSaveLocation: 'Im Documents-Ordner gespeichert.'
    fail: 'Export der Einstellungen fehlgeschlagen.'
    shareTitle: 'QCalc-Einstellungen'
    shareText: 'QCalc-Einstellungsdatei teilen.'
    shareDialogTitle: 'Einstellungen teilen'
    cancelled: 'Export der Einstellungen abgebrochen.'
    success: 'Einstellungen wurden erfolgreich exportiert.'
  importSettings:
    confirmTitle: 'Import bestätigen'
    confirmMessage: 'Möchten Sie die aktuellen Einstellungen mit den Einstellungen aus der ausgewählten Datei überschreiben?'
    success: 'Einstellungen wurden erfolgreich importiert.'
    fail: 'Import der Einstellungen fehlgeschlagen. Die Datei ist möglicherweise beschädigt oder hat ein falsches Format.'
    cancelled: 'Import der Einstellungen abgebrochen.'
  confirmDeleteTitle: 'Theme-Löschung bestätigen'
  confirmDeleteMessage: 'Möchten Sie das Theme \''{themeName}\'' wirklich löschen?'
es:
  alwaysOnTop: 'Siempre visible'
  initPanel: 'Inicializar panel al inicio'
  darkMode:
    title: 'Modo oscuro'
    light: 'Claro'
    dark: 'Oscuro'
    system: 'Sistema'
  hapticsMode: 'Modo de vibración'
  showButtonAddedLabel: 'Mostrar etiqueta adicional del botón'
  numberFormatPerCalculator: 'Aplicar formato de número por calculadora'
  useGrouping: 'Mostrar agrupación de números'
  groupingUnit: 'Unidad de agrupación'
  decimalPlaces: 'Decimal'
  decimalPlacesStat: 'Lugares decimales'
  noLimit: 'Sin límite'
  toNDecimalPlaces: 'lugares'
  showUnit: 'Mostrar unidad'
  showSymbol: 'Mostrar símbolo'
  showRadix: 'Mostrar base'
  radixType: 'Tipo de base'
  prefix: 'Prefijo'
  suffix: 'Sufijo'
  useSystemLocale: 'Usar idioma del sistema'
  language: 'Idioma'
  autoUpdate: 'Actualización automática'
  autoUpdateHelp: 'Para aplicar la actualización, habilite las actualizaciones automáticas en la configuración y reinicie la aplicación.'
  ariaLabel:
    settingsList: 'Lista de configuración'
    alwaysOnTop: 'Configuración siempre visible'
    initPanel: 'Configuración inicializar panel al inicio'
    hapticsMode: 'Configuración modo de vibración'
    darkMode: 'Configuración modo oscuro'
    showButtonAddedLabel: 'Configuración etiqueta adicional del botón'
    numberFormatPerCalculator: 'Configuración formato de número por calculadora'
    useGrouping: 'Configuración agrupación de números'
    groupingUnit: 'Configuración unidad de agrupación'
    decimalPlaces: 'Configuración lugares decimales'
    showUnit: 'Configuración mostrar unidad'
    showSymbol: 'Configuración mostrar símbolo'
    showRadix: 'Configuración mostrar base'
    radixType: 'Configuración tipo de base'
    useSystemLocale: 'Configuración idioma del sistema'
    language: 'Configuración de idioma'
    autoUpdate: 'Configuración actualización automática'
    colorTheme: 'Tema de color'
    editTheme: 'Editar tema {themeName}'
    deleteTheme: 'Eliminar tema {themeName}'
    createNewTheme: 'Crear nuevo tema'
    resetSettings: 'Restablecer configuración'
    exportSettings: 'Exportar configuración'
    importSettings: 'Importar configuración'
  colorTheme: 'Tema de color'
  createNewTheme: 'Crear nuevo tema'
  reset: 'Restablecer'
  export: 'Exportar'
  import: 'Importar'
  settingsManagement: 'Gestión de configuración'
  resetSettings:
    confirmTitle: 'Confirmar restablecimiento'
    confirmMessage: '¿Está seguro de que desea restablecer toda la configuración? Esta acción no se puede deshacer.'
    success: 'La configuración se ha restablecido correctamente.'
  exportSettings:
    exportMethodTitle: 'Método de exportación'
    exportMethodMessage: '¿Cómo desea exportar la configuración?'
    saveToDevice: 'Guardar en dispositivo'
    shareFile: 'Compartir archivo'
    successMobile: 'Configuración exportada a {fileName}.'
    mobileSaveLocation: 'Guardado en la carpeta Documents.'
    fail: 'Error al exportar la configuración.'
    shareTitle: 'Configuración de QCalc'
    shareText: 'Compartir archivo de configuración de QCalc.'
    shareDialogTitle: 'Compartir configuración'
    cancelled: 'Exportación de configuración cancelada.'
    success: 'La configuración se ha exportado correctamente.'
  importSettings:
    confirmTitle: 'Confirmar importación'
    confirmMessage: '¿Está seguro de que desea sobrescribir la configuración actual con la del archivo seleccionado?'
    success: 'La configuración se ha importado correctamente.'
    fail: 'Error al importar la configuración. El archivo puede estar dañado o tener un formato incorrecto.'
    cancelled: 'Importación de configuración cancelada.'
  confirmDeleteTitle: 'Confirmar eliminación de tema'
  confirmDeleteMessage: '¿Está seguro de que desea eliminar el tema \''{themeName}\''?'
fr:
  alwaysOnTop: 'Toujours au premier plan'
  initPanel: 'Initialiser le panneau au démarrage'
  darkMode:
    title: 'Mode sombre'
    light: 'Clair'
    dark: 'Sombre'
    system: 'Système'
  hapticsMode: 'Mode vibration'
  showButtonAddedLabel: "Afficher l'étiquette supplémentaire du bouton"
  numberFormatPerCalculator: 'Appliquer le format numérique par calculatrice'
  useGrouping: 'Afficher le groupement des nombres'
  groupingUnit: 'Unité de groupement'
  decimalPlaces: 'Décimales'
  decimalPlacesStat: 'Nombre de décimales'
  noLimit: 'Sans limite'
  toNDecimalPlaces: 'décimales'
  showUnit: "Afficher l'unité"
  showSymbol: 'Afficher le symbole'
  showRadix: 'Afficher la base'
  radixType: 'Type de base'
  prefix: 'Préfixe'
  suffix: 'Suffixe'
  useSystemLocale: 'Utiliser la langue du système'
  language: 'Langue'
  autoUpdate: 'Mise à jour automatique'
  autoUpdateHelp: "Pour appliquer la mise à jour, activez les mises à jour automatiques dans les paramètres et redémarrez l'application."
  ariaLabel:
    settingsList: 'Liste des paramètres'
    alwaysOnTop: 'Paramètre toujours au premier plan'
    initPanel: 'Paramètre initialisation du panneau au démarrage'
    hapticsMode: 'Paramètre mode vibration'
    darkMode: 'Paramètre mode sombre'
    showButtonAddedLabel: 'Paramètre étiquette supplémentaire du bouton'
    numberFormatPerCalculator: 'Paramètre format numérique par calculatrice'
    useGrouping: 'Paramètre groupement des nombres'
    groupingUnit: 'Paramètre unité de groupement'
    decimalPlaces: 'Paramètre nombre de décimales'
    showUnit: "Paramètre afficher l'unité"
    showSymbol: 'Paramètre afficher le symbole'
    showRadix: 'Paramètre afficher la base'
    radixType: 'Paramètre type de base'
    useSystemLocale: 'Paramètre langue du système'
    language: 'Paramètre de langue'
    autoUpdate: 'Paramètre mise à jour automatique'
    colorTheme: 'Thème de couleur'
    editTheme: 'Modifier le thème {themeName}'
    deleteTheme: 'Supprimer le thème {themeName}'
    createNewTheme: 'Créer un nouveau thème'
    resetSettings: 'Réinitialiser les paramètres'
    exportSettings: 'Exporter les paramètres'
    importSettings: 'Importer les paramètres'
  colorTheme: 'Thème de couleur'
  createNewTheme: 'Créer un nouveau thème'
  reset: 'Réinitialiser'
  export: 'Exporter'
  import: 'Importer'
  settingsManagement: 'Gestion des paramètres'
  resetSettings:
    confirmTitle: 'Confirmer la réinitialisation'
    confirmMessage: 'Êtes-vous sûr de vouloir réinitialiser tous les paramètres ? Cette action est irréversible.'
    success: 'Les paramètres ont été réinitialisés avec succès.'
  exportSettings:
    exportMethodTitle: "Méthode d'exportation"
    exportMethodMessage: 'Comment souhaitez-vous exporter les paramètres ?'
    saveToDevice: "Enregistrer sur l'appareil"
    shareFile: 'Partager le fichier'
    successMobile: 'Paramètres exportés vers {fileName}.'
    mobileSaveLocation: 'Enregistré dans le dossier Documents.'
    fail: "Échec de l'exportation des paramètres."
    shareTitle: 'Paramètres QCalc'
    shareText: 'Partager le fichier de paramètres QCalc.'
    shareDialogTitle: 'Partager les paramètres'
    cancelled: "L'exportation des paramètres a été annulée."
    success: 'Les paramètres ont été exportés avec succès.'
  importSettings:
    confirmTitle: "Confirmer l'importation"
    confirmMessage: 'Êtes-vous sûr de vouloir remplacer les paramètres actuels par ceux du fichier sélectionné ?'
    success: 'Les paramètres ont été importés avec succès.'
    fail: "Échec de l'importation des paramètres. Le fichier est peut-être corrompu ou dans un format incorrect."
    cancelled: "L'importation des paramètres a été annulée."
  confirmDeleteTitle: 'Confirmer la suppression du thème'
  confirmDeleteMessage: 'Êtes-vous sûr de vouloir supprimer le thème \''{themeName}\'' ?'
</i18n>
