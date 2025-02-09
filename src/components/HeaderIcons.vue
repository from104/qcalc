<script setup lang="ts">
  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { onMounted } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // router 관련
  import { useRouter } from 'vue-router';
  const router = useRouter();

  // 계산기 관련 타입과 클래스
  import { KeyBinding } from 'classes/KeyBinding';

  // 전역 window 객체에 접근하기 위한 상수 선언
  const window = globalThis.window;

  // 스토어 인스턴스 생성
  const store = window.store;

  // 스토어에서 필요한 메서드와 속성 추출
  const { calc, copyToClipboard, clickButtonById, swapUnits, swapCurrencies, swapRadixes } = store;

  // 컴포넌트 import
  import ToolTip from './snippets/ToolTip.vue';
  import MenuItem from './snippets/MenuItem.vue';
  import MenuPanel from './MenuPanel.vue';
  import { showError, showMessage } from 'src/classes/utils/NotificationUtils';

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
      if (window.isCapacitor) {
        clipboardText = await AndroidInterface.getFromClipboard();
      } else {
        clipboardText = await navigator.clipboard.readText();
      }

      if (!clipboardText) {
        showError(t('clipboardIsEmptyOrContainsDataThatCannotBePasted.'));
        return;
      }

      if (target === 'sub') {
        if (store.currentTab === 'unit') {
          swapUnits();
          setTimeout(() => calc.setCurrentNumber(clipboardText), 5);
          setTimeout(swapUnits, 10);
        } else if (store.currentTab === 'currency') {
          swapCurrencies();
          setTimeout(() => calc.setCurrentNumber(clipboardText), 5);
          setTimeout(swapCurrencies, 10);
        } else if (store.currentTab === 'radix') {
          swapRadixes();
          setTimeout(() => calc.setCurrentNumber(clipboardText), 5);
          setTimeout(swapRadixes, 10);
        }
        showMessage(t('pastedFromClipboardToSubPanel'));
      } else {
        calc.setCurrentNumber(clipboardText);
        showMessage(t('pastedFromClipboard'));
      }
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
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
    :aria-label="t('ariaLabel.copy')"
    @click="handleCopy"
  >
    <ToolTip :text="t('tooltipCopy')" />
  </q-btn>
  <q-btn
    id="btn-paste"
    flat
    icon="content_paste"
    class="q-ma-none q-pa-none q-pl-xs"
    :aria-label="t('ariaLabel.paste')"
    @click="handlePaste()"
  >
    <q-menu v-if="!store.isDefaultCalculator()" context-menu auto-close class="z-max shadow-6">
      <q-list dense style="max-width: 200px">
        <MenuItem :action="() => handlePaste('main')" :title="t('pasteToMainPanel')" />
        <MenuItem :action="() => handlePaste('sub')" :title="t('pasteToSubPanel')" />
      </q-list>
    </q-menu>
    <ToolTip :text="t('tooltipPaste')" />
  </q-btn>
  <q-btn
    v-if="!store.isAtLeastDoubleWidth()"
    flat
    icon="mdi-history"
    class="q-ma-none q-pa-none q-pl-xs"
    :aria-label="t('ariaLabel.record')"
    @click="router.push('/record')"
  >
    <ToolTip :text="t('openRecordPage')" />
  </q-btn>
  <q-btn id="btn-menu" flat icon="more_vert" class="q-ma-none q-pa-none q-pl-xs" :aria-label="t('ariaLabel.menu')">
    <q-menu auto-close transition-show="slide-down" transition-hide="slide-up" :offset="[140, 10]" class="shadow-6">
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
  openRecordPage: '클릭하면 기록 페이지를 엽니다.'
  ariaLabel:
    copy: '클립보드에 복사'
    paste: '클립보드에서 붙여넣기'
    record: '기록 페이지 열기'
    menu: '메뉴 열기'
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
  openRecordPage: 'Click to open the record page.'
  ariaLabel:
    copy: 'Copy to clipboard'
    paste: 'Paste from clipboard'
    record: 'Open record page'
    menu: 'Open menu'
</i18n>
