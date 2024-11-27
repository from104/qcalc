<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import MyTooltip from 'components/MyTooltip.vue';
  import MenuItem from 'components/MenuItem.vue';
  import MenuPanel from './MenuPanel.vue';
  import { useStoreBase } from 'src/stores/store-base';
  import { useStoreUtils } from 'src/stores/store-utils';
  import { useStoreNotifications } from 'src/stores/store-notifications';
  import { useStoreUnit } from 'src/stores/store-unit';
  import { useStoreCurrency } from 'src/stores/store-currency';
  import { KeyBinding } from 'classes/KeyBinding';

  // Quasar 인스턴스 초기화
  const quasar = useQuasar();

  // i18n 설정
  const { t } = useI18n();

  // 스토어 인스턴스 초기화
  const storeBase = useStoreBase();
  const storeUtils = useStoreUtils();
  const storeNotifications = useStoreNotifications();
  const storeUnit = useStoreUnit();
  const storeCurrency = useStoreCurrency();

  // 스토어에서 필요한 메서드와 속성 추출
  const { calc } = storeBase;
  const { copyToClipboard, clickButtonById } = storeUtils;
  const { showError, showMessage } = storeNotifications;
  const { swapUnits } = storeUnit;
  const { swapCurrencies } = storeCurrency;

  /**
   * 선택된 텍스트 또는 계산 결과를 클립보드에 복사하는 함수
   */
  const handleCopy = () => {
    const resultText = document.getElementById('result')?.textContent ?? '';
    const selectedText = document.getSelection()?.toString() ?? '';
    const textToClipboard = selectedText || resultText;
    const targetToBeCopied = selectedText ? t('targetToBeCopiedSelected') : t('targetToBeCopiedResult');

    copyToClipboard(textToClipboard, t('copiedToClipboard', { target: targetToBeCopied }));
  };

  /**
   * 클립보드의 내용을 메인 또는 서브 패널에 붙여넣는 함수
   * @param {('main'|'sub')} target - 붙여넣을 대상 패널
   */
  const handlePaste = async (target: 'main' | 'sub' = 'main'): Promise<void> => {
    try {
      let clipboardText = '';
      if (quasar.platform.is.capacitor) {
        clipboardText = await AndroidInterface.getFromClipboard();
      } else {
        clipboardText = await navigator.clipboard.readText();
      }

      if (!clipboardText) {
        showError(t('clipboardIsEmptyOrContainsDataThatCannotBePasted.'));
        return;
      }

      if (target === 'sub') {
        if (storeBase.currentTab === 'unit') {
          swapUnits();
          setTimeout(() => calc.setCurrentNumber(clipboardText), 5);
          setTimeout(swapUnits, 10);
        } else if (storeBase.currentTab === 'currency') {
          swapCurrencies();
          setTimeout(() => calc.setCurrentNumber(clipboardText), 5);
          setTimeout(swapCurrencies, 10);
        }
        showMessage(t('pastedFromClipboardToSubPanel'));
      } else {
        calc.setCurrentNumber(clipboardText);
        showMessage(t('pastedFromClipboard'));
      }
    } catch (error) {
      showError(t('failedToPasteFromClipboard'));
    }
  };

  // 키 바인딩 설정
  const keyBinding = new KeyBinding([
    [['Control+c', 'Control+Insert', 'Copy'], () => clickButtonById('btn-copy')],
    [['Control+v', 'Shift+Insert', 'Paste'], () => clickButtonById('btn-paste')],
  ]);

  // 컴포넌트 마운트 시 키 바인딩 활성화
  onMounted(() => {
    keyBinding.subscribe();
  });
</script>

<template>
  <q-btn
    id="btn-copy"
    flat
    icon="content_copy"
    class="q-ma-none q-pa-none q-pl-xs"
    :disable="storeBase.isSettingDialogOpen"
    @click="handleCopy"
  >
    <MyTooltip>{{ t('tooltipCopy') }}</MyTooltip>
  </q-btn>
  <q-btn
    id="btn-paste"
    flat
    icon="content_paste"
    class="q-ma-none q-pa-none q-pl-xs"
    :disable="storeBase.isSettingDialogOpen"
    @click="handlePaste()"
  >
    <q-menu v-if="storeBase.currentTab !== 'calc'" context-menu auto-close class="z-max shadow-6">
      <q-list dense style="max-width: 200px">
        <MenuItem :action="() => handlePaste('main')" :title="t('pasteToMainPanel')" />
        <MenuItem :action="() => handlePaste('sub')" :title="t('pasteToSubPanel')" />
      </q-list>
    </q-menu>
    <MyTooltip>{{ t('tooltipPaste') }}</MyTooltip>
  </q-btn>
  <q-btn
    id="btn-history"
    flat
    icon="history"
    class="q-ma-none q-pa-none q-pl-xs"
    :disable="storeBase.isSettingDialogOpen"
    @click="storeBase.isHistoryDialogOpen = !storeBase.isHistoryDialogOpen"
  >
    <MyTooltip>{{ t('openHistoryDialog') }}</MyTooltip>
  </q-btn>
  <q-btn id="btn-menu" flat icon="more_vert" class="q-ma-none q-pa-none q-pl-xs" :disable="storeBase.isSettingDialogOpen">
    <q-menu auto-close transition-show="slide-left" transition-hide="slide-right" :offset="[0, 10]" class="shadow-6">
      <MenuPanel />
    </q-menu>
  </q-btn>
</template>

<i18n>
ko:
  targetToBeCopiedResult: '계산 결과를'
  targetToBeCopiedSelected: '선택한 내용을'
  copiedToClipboard: '{target} 클립보드에 복사했습니다.'
  failedToCopyToClipboard: '{target} 클립보드에 복사하지 못했습니다.'
  clipboardIsEmptyOrContainsDataThatCannotBePasted: '클립보드가 비어있거나 붙혀넣을 수 없는 자료입니다.'
  pastedFromClipboard: '클립보드로부터 숫자를 붙여넣었습니다.'
  pastedFromClipboardToSubPanel: '클립보드로부터 숫자를 보조 패널에 붙여넣었습니다.'
  failedToPasteFromClipboard: '클립보드로부터 숫자를 붙여넣지 못했습니다.'
  pasteToMainPanel: '메인 패널에 붙여넣기'
  pasteToSubPanel: '보조 패널에 붙여넣기'
  tooltipCopy: '내용을 복사합니다.'
  tooltipPaste: '숫자를 붙혀넣습니다.'
  openHistoryDialog: '클릭하면 기록을 열거나 닫습니다.'
en:
  targetToBeCopiedResult: 'the calculation result'
  targetToBeCopiedSelected: 'the selected content'
  copiedToClipboard: 'Copied {target} to the clipboard.'
  failedToCopyToClipboard: 'Failed to copy {target} to the clipboard.'
  clipboardIsEmptyOrContainsDataThatCannotBePasted: 'The clipboard is empty or contains data that cannot be pasted.'
  pastedFromClipboard: 'Pasted the number from the clipboard.'
  pastedFromClipboardToSubPanel: 'Pasted the number from the clipboard to the sub panel.'
  failedToPasteFromClipboard: 'Failed to paste the number from the clipboard.'
  pasteToMainPanel: 'Paste to the main panel'
  pasteToSubPanel: 'Paste to the sub panel'
  tooltipCopy: 'Copy the content.'
  tooltipPaste: 'Paste the number.'
  openHistoryDialog: 'Click to open or close the history.'
</i18n>