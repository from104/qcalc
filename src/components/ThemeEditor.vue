<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useThemesStore } from 'src/stores/themesStore';
  import { themes, type ThemeColors } from 'src/constants/ThemesData';
  import QuasarColorPicker from './snippets/QuasarColorPicker.vue';

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
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div id="themeEditorTitle" class="text-h6">{{ t('themeEditor') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none scroll" style="max-height: 60vh">
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
