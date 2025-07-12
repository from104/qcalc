<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar, colors } from 'quasar';
  import { useThemesStore } from 'src/stores/themesStore';
  import { themes, type ThemeColors } from 'src/constants/ThemesData';
  import QuasarColorPicker from './snippets/QuasarColorPicker.vue';

  interface PreviewButton {
    label: string;
    type: keyof ThemeColors['button'];
  }

  const dummySelectModel = ref('Option 1');

  const { t } = useI18n();
  const themesStore = useThemesStore();
  const $q = useQuasar();

  const dialog = ref(false);
  const isEditMode = ref(false);
  const originalThemeName = ref('');
  const themeName = ref('');
  const themeColors = reactive<ThemeColors>(JSON.parse(JSON.stringify(themes.default)));

  /**
   * 테마 편집기 대화상자를 엽니다.
   * @param {object} options - 대화상자를 열기 위한 옵션입니다.
   * @param {boolean} options.isEdit - 기존 테마를 편집하는 경우 true, 새 테마를 만드는 경우(복제) false입니다.
   * @param {string} options.themeName - 테마의 이름입니다(편집 시 사용).
   * @param {ThemeColors} options.themeData - 테마의 색상 데이터입니다.
   */
  const open = (options: { isEdit: boolean; themeName: string; themeData: ThemeColors }) => {
    isEditMode.value = options.isEdit;
    originalThemeName.value = options.isEdit ? options.themeName : '';
    themeName.value = options.themeName;

    // 반응성 문제와 저장소의 직접적인 변경을 피하기 위해 테마 데이터를 깊은 복사하여 사용합니다.
    const dataToEdit = JSON.parse(JSON.stringify(options.themeData));

    // 반응형 themeColors 객체를 새 데이터로 덮어씁니다.
    themeColors.ui = dataToEdit.ui;
    themeColors.button = dataToEdit.button;
    themeColors.panel = dataToEdit.panel;
    themeColors.select = dataToEdit.select;
    // `name` 속성은 별도로 처리합니다.
    themeColors.name = { ko: options.themeName, en: options.themeName };

    dialog.value = true;
  };

  const getHexColor = (colorName: string): string => {
    return colors.getPaletteColor(colorName);
  };

  const saveTheme = () => {
    const trimmedThemeName = themeName.value.trim();

    if (!trimmedThemeName) {
      $q.notify({
        type: 'negative',
        message: t('themeNameRequired'),
      });
      return;
    }

    // 이스케이프 문자 및 특수문자 유효성 검사
    const invalidCharsRegex = /[\\/:*?"<>|]/;
    if (invalidCharsRegex.test(trimmedThemeName)) {
      $q.notify({
        type: 'negative',
        message: t('invalidThemeName'),
      });
      return;
    }

    // 테마 이름 중복 검사 (기본 테마 및 다른 사용자 테마)
    const allThemeNames = [...Object.keys(themes), ...Object.keys(themesStore.userThemes)];
    if (
      trimmedThemeName !== originalThemeName.value && // 이름이 변경되었을 경우에만 중복 검사
      allThemeNames.includes(trimmedThemeName)
    ) {
      $q.notify({
        type: 'negative',
        message: t('duplicateThemeName'),
      });
      return;
    }

    // 편집 모드이고 이름이 변경된 경우, 이전 테마를 삭제합니다.
    if (isEditMode.value && trimmedThemeName !== originalThemeName.value) {
      themesStore.removeUserTheme(originalThemeName.value);
    }

    themeColors.name = { ko: trimmedThemeName, en: trimmedThemeName };
    themesStore.addUserTheme(trimmedThemeName, JSON.parse(JSON.stringify(themeColors)));
    dialog.value = false;
  };

  defineExpose({
    open,
  });
</script>

<template>
  <q-dialog v-model="dialog" persistent aria-modal="true" aria-labelledby="themeEditorTitle">
    <q-card style="width: 300px; max-height: calc(100vh - 120px); display: flex; flex-direction: column">
      <q-card-section class="q-py-xs">
        <div id="themeEditorTitle" class="text-h6 q-my-xs">{{ t('themeEditor') }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-py-sm">
        <div class="row q-col-gutter-sm">
          <!-- Left: Calculator Preview -->
          <div class="col-5">
            <div class="theme-preview-container rounded-borders" style="border: 1px solid #ccc; padding: 4px">
              <!-- Display -->
              <div
                class="preview-display q-mb-sm q-pa-xs rounded-borders text-right"
                :style="{
                  backgroundColor: getHexColor(themeColors.panel.background.normal),
                  color: getHexColor(themeColors.panel.text.normal),
                  fontFamily: 'digital-7, monospace',
                  fontSize: '1.2em',
                }"
              >
                123,456.78
              </div>

              <!-- Buttons -->
              <div
                v-for="(row, rowIndex) in [
                  [
                    { label: '%', type: 'function' },
                    { label: 'x', type: 'function' },
                    { label: 'C', type: 'important' },
                  ],
                  [
                    { label: '2', type: 'normal' },
                    { label: '3', type: 'normal' },
                    { label: '+', type: 'important' },
                  ],
                  [
                    { label: '0', type: 'normal' },
                    { label: '1', type: 'normal' },
                    { label: '=', type: 'important' },
                  ],
                ] as PreviewButton[][]"
                :key="rowIndex"
                :class="['row', 'q-col-gutter-xs', { 'q-mt-xs': rowIndex > 0 }]"
              >
                <div v-for="btn in row" :key="btn.label" class="col-4">
                  <div
                    class="preview-button flex flex-center rounded-borders"
                    :style="{
                      backgroundColor: getHexColor(themeColors.button[btn.type]),
                      color: themesStore.getTextColorByBackgroundColor(getHexColor(themeColors.button[btn.type])),
                      height: '24px',
                      fontSize: '0.8em',
                    }"
                  >
                    {{ btn.label }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Color Palette Preview -->
          <div class="col-7">
            <div class="text-caption text-bold q-mb-xs">{{ t('uiColors') }}</div>
            <div class="row q-gutter-xs">
              <div v-for="(color, key) in themeColors.ui" :key="`ui-${key}`" class="col-auto">
                <div
                  :style="{ backgroundColor: getHexColor(color), width: '18px', height: '18px' }"
                  class="rounded-borders cursor-pointer"
                >
                  <q-tooltip>{{ key }}</q-tooltip>
                </div>
              </div>
            </div>

            <div class="text-caption text-bold q-mt-sm q-mb-xs">{{ t('selectColors') }}</div>
            <q-select
              v-model="dummySelectModel"
              :options="['Option 1', 'Option 2']"
              :label="t('selectColors')"
              dense
              options-dense
              :bg-color="themeColors.select.background.light"
              :label-color="themeColors.select.text.light"
              :color="themeColors.select.text.light"
              :popup-content-class="`bg-${themeColors.select.background.light} text-${themeColors.select.text.light}`"
              style="font-size: 0.8em"
            >
              <template #selected-item="scope">
                <span
                  :style="{
                    color: getHexColor(themeColors.select.text.light),
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }"
                >
                  {{ scope.opt }}
                </span>
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-none scroll scrollbar-custom" style="flex-grow: 1; min-height: 0">
        <q-input v-model="themeName" :label="t('themeName')" :readonly="isEditMode" />

        <div class="q-mt-md">
          <div class="text-subtitle1">{{ t('uiColors') }}</div>
          <div class="row q-gutter-sm">
            <QuasarColorPicker
              v-for="(color, key) in themeColors.ui"
              :key="key"
              v-model="themeColors.ui[key]"
              :label="key"
              dense
            />
          </div>
        </div>

        <div class="q-mt-md">
          <div class="text-subtitle1">{{ t('buttonColors') }}</div>
          <div class="row q-gutter-sm">
            <QuasarColorPicker
              v-for="(color, key) in themeColors.button"
              :key="key"
              v-model="themeColors.button[key]"
              :label="key"
              dense
            />
          </div>
        </div>

        <div class="q-mt-md">
          <div class="text-subtitle1">{{ t('panelColors') }}</div>
          <div class="text-subtitle2">{{ t('text') }}</div>
          <div class="row q-gutter-sm">
            <QuasarColorPicker
              v-for="(color, key) in themeColors.panel.text"
              :key="key"
              v-model="themeColors.panel.text[key]"
              :label="key"
              dense
            />
          </div>
          <div class="text-subtitle2 q-mt-sm">{{ t('background') }}</div>
          <div class="row q-gutter-sm">
            <QuasarColorPicker
              v-for="(color, key) in themeColors.panel.background"
              :key="key"
              v-model="themeColors.panel.background[key]"
              :label="key"
              dense
            />
          </div>
        </div>

        <div class="q-mt-md">
          <div class="text-subtitle1">{{ t('selectColors') }}</div>
          <div class="text-subtitle2">{{ t('text') }}</div>
          <div class="row q-gutter-sm">
            <QuasarColorPicker
              v-for="(color, key) in themeColors.select.text"
              :key="key"
              v-model="themeColors.select.text[key]"
              :label="key"
              dense
            />
          </div>
          <div class="text-subtitle2 q-mt-sm">{{ t('background') }}</div>
          <div class="row q-gutter-sm">
            <QuasarColorPicker
              v-for="(color, key) in themeColors.select.background"
              :key="key"
              v-model="themeColors.select.background[key]"
              :label="key"
              dense
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat :label="t('cancel')" color="primary" />
        <q-btn flat :label="t('save')" color="primary" @click="saveTheme" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<i18n>
ko:
  themeEditor: '테마 편집기'
  themeName: '테마 이름'
  cancel: '취소'
  save: '저장'
  themeNameRequired: '테마 이름은 필수 항목입니다.'
  invalidThemeName: '테마 이름에 특수문자(\\ / : * ? " < > |)를 사용할 수 없습니다.'
  duplicateThemeName: '이미 사용 중인 테마 이름입니다.'
  uiColors: 'UI 색상'
  buttonColors: '버튼 색상'
  panelColors: '패널 색상'
  selectColors: '선택 색상'
  text: '텍스트'
  background: '배경'
en:
  themeEditor: 'Theme Editor'
  themeName: 'Theme Name'
  cancel: 'Cancel'
  save: 'Save'
  themeNameRequired: 'Theme name is required.'
  invalidThemeName: 'Theme name cannot contain special characters (\\ / : * ? " < > |).'
  duplicateThemeName: 'This theme name is already in use.'
  uiColors: 'UI Colors'
  buttonColors: 'Button Colors'
  panelColors: 'Panel Colors'
  selectColors: 'Select Colors'
  text: 'Text'
  background: 'Background'
</i18n>
