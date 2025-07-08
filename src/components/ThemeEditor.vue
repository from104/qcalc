<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useThemesStore } from 'src/stores/themesStore';
  import { themes, type ThemeColors } from 'src/constants/ThemesData';
  import QuasarColorPicker from './snippets/QuasarColorPicker.vue';

  const { t } = useI18n();
  const themesStore = useThemesStore();

  const dialog = ref(false);
  const isEditMode = ref(false);
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
    themeColors.name = { ko: themeName.value, en: themeName.value };
    themesStore.addUserTheme(themeName.value, JSON.parse(JSON.stringify(themeColors)));
    dialog.value = false;
  };

  defineExpose({
    open,
  });
</script>

<template>
  <q-dialog v-model="dialog" persistent>
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ t('themeEditor') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none scroll" style="max-height: 60vh">
        <q-input v-model="themeName" :label="t('themeName')" :readonly="isEditMode" />

        <div class="q-mt-md">
          <div class="text-subtitle1">UI Colors</div>
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
          <div class="text-subtitle1">Button Colors</div>
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
          <div class="text-subtitle1">Panel Colors</div>
          <div class="text-subtitle2">Text</div>
          <div class="row q-gutter-sm">
            <QuasarColorPicker
              v-for="(color, key) in themeColors.panel.text"
              :key="key"
              v-model="themeColors.panel.text[key]"
              :label="key"
              dense
            />
          </div>
          <div class="text-subtitle2 q-mt-sm">Background</div>
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
          <div class="text-subtitle1">Select Colors</div>
          <div class="text-subtitle2">Text</div>
          <div class="row q-gutter-sm">
            <QuasarColorPicker
              v-for="(color, key) in themeColors.select.text"
              :key="key"
              v-model="themeColors.select.text[key]"
              :label="key"
              dense
            />
          </div>
          <div class="text-subtitle2 q-mt-sm">Background</div>
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
en:
  themeEditor: 'Theme Editor'
  themeName: 'Theme Name'
  cancel: 'Cancel'
  save: 'Save'
</i18n>
