<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar, colors } from 'quasar';
  import { useThemesStore } from 'src/stores/themesStore';
  import { themes, type ThemeColors } from 'src/constants/ThemesData';
  import QuasarColorPicker from '../common/QuasarColorPicker.vue';
  import HelpIcon from '../common/HelpIcon.vue';

  interface PreviewButton {
    label: string;
    type: keyof ThemeColors['button'];
  }

  const dummySelectModel = ref('Option 1');
  const swapSelectPreview = ref(false);
  const panelPreviewStateIndex = ref(0);
  let isCyclingPanel = false;

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

  const cyclePanelPreview = async () => {
    if (isCyclingPanel) return;
    isCyclingPanel = true;

    const states = [1, 2, 3, 0];
    for (const state of states) {
      panelPreviewStateIndex.value = state;
      if (state !== 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    isCyclingPanel = false;
  };

  const panelPreviewStyle = computed(() => {
    const state = panelPreviewStateIndex.value;
    const { panel } = themeColors;
    switch (state) {
      default: // 기본 배경색 (state 0)
        return {
          backgroundColor: getHexColor(panel.background.normal),
          color: getHexColor(panel.text.normal),
        };
      case 1: // 강조용 글자색
        return {
          backgroundColor: getHexColor(panel.background.normal),
          color: getHexColor(panel.text.normalAccent),
        };
      case 2: // 경고용 배경색
        return {
          backgroundColor: getHexColor(panel.background.warning),
          color: getHexColor(panel.text.warning),
        };
      case 3: // 경고용 강조 글자색
        return {
          backgroundColor: getHexColor(panel.background.warning),
          color: getHexColor(panel.text.warningAccent),
        };
    }
  });

  const swapPreview = () => {
    swapSelectPreview.value = true;
  };

  watch(swapSelectPreview, (newValue) => {
    if (newValue) {
      setTimeout(() => {
        swapSelectPreview.value = false;
      }, 3000);
    }
  });

  const selectPreviewStyle = computed(() => {
    const isBaseDark = themesStore.isDarkMode();
    const showOpposite = swapSelectPreview.value;

    const displayDark = (isBaseDark && !showOpposite) || (!isBaseDark && showOpposite);

    if (displayDark) {
      return {
        label: t('dark'),
        bg: themeColors.select.background.dark,
        text: themeColors.select.text.dark,
      };
    } else {
      return {
        label: t('light'),
        bg: themeColors.select.background.light,
        text: themeColors.select.text.light,
      };
    }
  });

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
    <q-card style="width: 300px; max-height: calc(100vh - 120px); display: flex; flex-direction: column; top: 25px">
      <q-card-section class="q-py-xs">
        <div id="themeEditorTitle" class="text-h6 q-my-xs">{{ t('themeEditor') }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-py-sm">
        <div class="row q-col-gutter-sm">
          <!-- Left: Calculator Preview -->
          <div class="col-5">
            <div class="text-caption text-bold row items-center">
              <span class="q-mr-xs">{{ t('preview') }}</span>
              <HelpIcon
                :text-color="themesStore.getDarkColor()"
                :bg-color="themesStore.getCurrentThemeColors.ui.warning"
                :text="t('panelPreviewHelp')"
              />
            </div>
            <div class="theme-preview-container rounded-borders" style="border: 1px solid #ccc; padding: 4px">
              <!-- Display -->
              <div
                class="preview-display q-mb-xs q-pa-xs rounded-borders text-right"
                :style="{
                  ...panelPreviewStyle,
                  fontFamily: 'digital-7, monospace',
                  fontSize: '1.1em',
                  cursor: 'pointer',
                }"
                @click="cyclePanelPreview"
              >
                1,234.56
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
                :class="['row', 'q-col-gutter-xs', { 'q-mt-none': rowIndex > 0 }]"
              >
                <div v-for="btn in row" :key="btn.label" class="col-4">
                  <div
                    class="preview-button flex flex-center rounded-borders"
                    :style="{
                      backgroundColor: themesStore.isDarkMode()
                        ? colors.lighten(getHexColor(themeColors.button[btn.type]), -30)
                        : getHexColor(themeColors.button[btn.type]),
                      color: themesStore.getTextColorByBackgroundColor(
                        themesStore.isDarkMode()
                          ? colors.lighten(getHexColor(themeColors.button[btn.type]), -30)
                          : getHexColor(themeColors.button[btn.type]),
                      ),
                      height: '22px',
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

            <div class="text-caption text-bold q-mt-sm q-mb-xs row items-center">
              <span class="q-mr-xs">{{ t('selectColors') }}</span>
              <HelpIcon
                :text-color="themesStore.getDarkColor()"
                :bg-color="themesStore.getCurrentThemeColors.ui.warning"
                :text="t('selectPreviewHelp')"
              />
              <q-btn flat dense round icon="mdi-swap-vertical" size="sm" class="q-ml-xs" @click="swapPreview" />
            </div>
            <q-select
              v-model="dummySelectModel"
              :options="['Option 1', 'Option 2']"
              :label="selectPreviewStyle.label"
              dense
              options-dense
              :bg-color="selectPreviewStyle.bg"
              :color="selectPreviewStyle.text"
              :popup-content-class="`bg-${selectPreviewStyle.bg} text-${selectPreviewStyle.text}`"
              style="font-size: 0.8em"
            >
              <template #selected-item="scope">
                <span
                  :style="{
                    color: getHexColor(selectPreviewStyle.text),
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

      <q-card-section
        class="q-pt-none scroll scrollbar-custom"
        style="flex-grow: 1; min-height: 0; align-items: flex-end"
      >
        <q-input v-model="themeName" :label="t('themeName')" />

        <div class="q-mt-xs">
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
          <div class="text-subtitle1">{{ t('buttonColors') }}</div>
          <div class="row q-gutter-sm">
            <div v-for="(color, key) in themeColors.button" :key="key" class="col-5">
              <QuasarColorPicker v-model="themeColors.button[key]" :label="key" dense />
            </div>
          </div>
        </div>

        <div class="q-mt-md">
          <div class="text-subtitle1">{{ t('uiColors') }}</div>
          <div class="row q-gutter-sm">
            <div v-for="(color, key) in themeColors.ui" :key="key" class="col-5">
              <QuasarColorPicker v-model="themeColors.ui[key]" :label="key" dense />
            </div>
          </div>
        </div>

        <div class="q-mt-md">
          <div class="text-subtitle1">{{ t('selectColors') }}</div>
          <div class="text-subtitle2">{{ t('light') }}</div>
          <div class="row q-gutter-sm">
            <div class="col-5">
              <QuasarColorPicker v-model="themeColors.select.text.light" :label="t('text')" dense />
            </div>
            <div class="col-5">
              <QuasarColorPicker v-model="themeColors.select.background.light" :label="t('background')" dense />
            </div>
          </div>
          <div class="text-subtitle2 q-mt-sm">{{ t('dark') }}</div>
          <div class="row q-gutter-sm">
            <div class="col-5">
              <QuasarColorPicker v-model="themeColors.select.text.dark" :label="t('text')" dense />
            </div>
            <div class="col-5">
              <QuasarColorPicker v-model="themeColors.select.background.dark" :label="t('background')" dense />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-close-popup
          flat
          :label="t('cancel')"
          :bg-color="themesStore.isDarkMode() ? 'grey-9' : 'grey-1'"
          :text-color="themesStore.isDarkMode() ? 'grey-1' : 'grey-9'"
        />
        <q-btn
          flat
          :label="t('save')"
          :bg-color="themesStore.isDarkMode() ? 'grey-9' : 'grey-1'"
          :text-color="themesStore.isDarkMode() ? 'grey-1' : 'grey-9'"
          @click="saveTheme"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<i18n lang="yaml">
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
  light: '라이트'
  dark: '다크'
  preview: '미리보기'
  panelPreviewHelp: '패널을 클릭하면 2초 간격으로 강조 및 경고 상태의 글자/배경색을 순차적으로 보여줍니다.'
  selectPreviewHelp: '교체 아이콘을 클릭하면 3초 동안 Light/Dark 모드의 색상을 반대로 보여줍니다.'
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
  light: 'Light'
  dark: 'Dark'
  preview: 'Preview'
  panelPreviewHelp: 'Click the panel to sequentially display accent and warning text/background colors at 2-second intervals.'
  selectPreviewHelp: 'Click the swap icon to show inverted Light/Dark mode colors for 3 seconds.'
ja:
  themeEditor: 'テーマエディタ'
  themeName: 'テーマ名'
  cancel: 'キャンセル'
  save: '保存'
  themeNameRequired: 'テーマ名は必須です。'
  invalidThemeName: 'テーマ名に特殊文字(\\ / : * ? " < > |)は使用できません。'
  duplicateThemeName: 'このテーマ名は既に使用されています。'
  uiColors: 'UIカラー'
  buttonColors: 'ボタンカラー'
  panelColors: 'パネルカラー'
  selectColors: '選択カラー'
  text: 'テキスト'
  background: '背景'
  light: 'ライト'
  dark: 'ダーク'
  preview: 'プレビュー'
  panelPreviewHelp: 'パネルをクリックすると、2秒間隔でアクセントと警告のテキスト/背景色を順番に表示します。'
  selectPreviewHelp: '交換アイコンをクリックすると、3秒間ライト/ダークモードの色を反転表示します。'
zh:
  themeEditor: '主题编辑器'
  themeName: '主题名称'
  cancel: '取消'
  save: '保存'
  themeNameRequired: '主题名称为必填项。'
  invalidThemeName: '主题名称不能包含特殊字符(\\ / : * ? " < > |)。'
  duplicateThemeName: '此主题名称已被使用。'
  uiColors: 'UI 颜色'
  buttonColors: '按钮颜色'
  panelColors: '面板颜色'
  selectColors: '选择颜色'
  text: '文本'
  background: '背景'
  light: '浅色'
  dark: '深色'
  preview: '预览'
  panelPreviewHelp: '点击面板，将以2秒间隔依次显示强调和警告的文字/背景颜色。'
  selectPreviewHelp: '点击交换图标，将在3秒内显示浅色/深色模式的反转颜色。'
hi:
  themeEditor: 'थीम संपादक'
  themeName: 'थीम नाम'
  cancel: 'रद्द करें'
  save: 'सहेजें'
  themeNameRequired: 'थीम नाम आवश्यक है।'
  invalidThemeName: 'थीम नाम में विशेष वर्ण (\\ / : * ? " < > |) का उपयोग नहीं किया जा सकता।'
  duplicateThemeName: 'यह थीम नाम पहले से उपयोग में है।'
  uiColors: 'UI रंग'
  buttonColors: 'बटन रंग'
  panelColors: 'पैनल रंग'
  selectColors: 'चयन रंग'
  text: 'टेक्स्ट'
  background: 'पृष्ठभूमि'
  light: 'लाइट'
  dark: 'डार्क'
  preview: 'पूर्वावलोकन'
  panelPreviewHelp: 'पैनल पर क्लिक करें, 2 सेकंड के अंतराल पर एक्सेंट और चेतावनी टेक्स्ट/पृष्ठभूमि रंग क्रमिक रूप से दिखाए जाएंगे।'
  selectPreviewHelp: 'स्वैप आइकन पर क्लिक करें, 3 सेकंड के लिए लाइट/डार्क मोड रंग उलट कर दिखाए जाएंगे।'
de:
  themeEditor: 'Theme-Editor'
  themeName: 'Theme-Name'
  cancel: 'Abbrechen'
  save: 'Speichern'
  themeNameRequired: 'Theme-Name ist erforderlich.'
  invalidThemeName: 'Theme-Name darf keine Sonderzeichen (\\ / : * ? " < > |) enthalten.'
  duplicateThemeName: 'Dieser Theme-Name wird bereits verwendet.'
  uiColors: 'UI-Farben'
  buttonColors: 'Schaltflächenfarben'
  panelColors: 'Panelfarben'
  selectColors: 'Auswahlfarben'
  text: 'Text'
  background: 'Hintergrund'
  light: 'Hell'
  dark: 'Dunkel'
  preview: 'Vorschau'
  panelPreviewHelp: 'Klicken Sie auf das Panel, um Akzent- und Warntext-/Hintergrundfarben in 2-Sekunden-Intervallen nacheinander anzuzeigen.'
  selectPreviewHelp: 'Klicken Sie auf das Tausch-Symbol, um die Hell-/Dunkelmodus-Farben für 3 Sekunden invertiert anzuzeigen.'
es:
  themeEditor: 'Editor de temas'
  themeName: 'Nombre del tema'
  cancel: 'Cancelar'
  save: 'Guardar'
  themeNameRequired: 'El nombre del tema es obligatorio.'
  invalidThemeName: 'El nombre del tema no puede contener caracteres especiales (\\ / : * ? " < > |).'
  duplicateThemeName: 'Este nombre de tema ya está en uso.'
  uiColors: 'Colores de UI'
  buttonColors: 'Colores de botones'
  panelColors: 'Colores de panel'
  selectColors: 'Colores de selección'
  text: 'Texto'
  background: 'Fondo'
  light: 'Claro'
  dark: 'Oscuro'
  preview: 'Vista previa'
  panelPreviewHelp: 'Haga clic en el panel para mostrar secuencialmente los colores de texto/fondo de acento y advertencia en intervalos de 2 segundos.'
  selectPreviewHelp: 'Haga clic en el icono de intercambio para mostrar los colores del modo claro/oscuro invertidos durante 3 segundos.'
fr:
  themeEditor: 'Éditeur de thèmes'
  themeName: 'Nom du thème'
  cancel: 'Annuler'
  save: 'Enregistrer'
  themeNameRequired: 'Le nom du thème est obligatoire.'
  invalidThemeName: 'Le nom du thème ne peut pas contenir de caractères spéciaux (\\ / : * ? " < > |).'
  duplicateThemeName: 'Ce nom de thème est déjà utilisé.'
  uiColors: 'Couleurs UI'
  buttonColors: 'Couleurs des boutons'
  panelColors: 'Couleurs des panneaux'
  selectColors: 'Couleurs de sélection'
  text: 'Texte'
  background: 'Arrière-plan'
  light: 'Clair'
  dark: 'Sombre'
  preview: 'Aperçu'
  panelPreviewHelp: "Cliquez sur le panneau pour afficher séquentiellement les couleurs d'accentuation et d'avertissement du texte/arrière-plan à intervalles de 2 secondes."
  selectPreviewHelp: "Cliquez sur l'icône d'échange pour afficher les couleurs inversées du mode clair/sombre pendant 3 secondes."
pt:
  themeEditor: 'Editor de temas'
  themeName: 'Nome do tema'
  cancel: 'Cancelar'
  save: 'Salvar'
  themeNameRequired: 'O nome do tema é obrigatório.'
  invalidThemeName: 'O nome do tema não pode conter caracteres especiais (\\ / : * ? " < > |).'
  duplicateThemeName: 'Este nome de tema já está em uso.'
  uiColors: 'Cores da UI'
  buttonColors: 'Cores dos botões'
  panelColors: 'Cores do painel'
  selectColors: 'Cores de seleção'
  text: 'Texto'
  background: 'Fundo'
  light: 'Claro'
  dark: 'Escuro'
  preview: 'Pré-visualização'
  panelPreviewHelp: 'Clique no painel para exibir sequencialmente as cores de destaque e aviso do texto/fundo em intervalos de 2 segundos.'
  selectPreviewHelp: 'Clique no ícone de troca para exibir as cores invertidas do modo claro/escuro por 3 segundos.'
ru:
  themeEditor: 'Редактор тем'
  themeName: 'Название темы'
  cancel: 'Отмена'
  save: 'Сохранить'
  themeNameRequired: 'Название темы обязательно.'
  invalidThemeName: 'Название темы не может содержать специальные символы (\\ / : * ? " < > |).'
  duplicateThemeName: 'Это название темы уже используется.'
  uiColors: 'Цвета интерфейса'
  buttonColors: 'Цвета кнопок'
  panelColors: 'Цвета панели'
  selectColors: 'Цвета выбора'
  text: 'Текст'
  background: 'Фон'
  light: 'Светлая'
  dark: 'Тёмная'
  preview: 'Предпросмотр'
  panelPreviewHelp: 'Нажмите на панель для последовательного отображения цветов акцента и предупреждения текста/фона с интервалом в 2 секунды.'
  selectPreviewHelp: 'Нажмите на значок обмена, чтобы отобразить инвертированные цвета светлого/тёмного режима на 3 секунды.'
</i18n>
