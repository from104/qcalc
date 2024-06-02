<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { copyToClipboard } from 'quasar';
import { useQuasar } from 'quasar';

import { useCalcStore } from 'stores/calc-store';
import { KeyBinding } from 'classes/KeyBinding';
import MyTooltip from 'components/MyTooltip.vue';

import MenuPanel from './MenuPanel.vue';

// Quasar의 $q 객체를 사용하기 위한 변수 선언
const $q = useQuasar();

// i18n을 사용하기 위한 변수 선언
const { t } = useI18n();

// 스토어 가져오기
const store = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const { calc } = store;

// 창에서 선택한 내용이 있으면 선택한 내용을 클립보드에 복사하고
// 아니면 계산 결과를 클립보드에 복사한다.
const doCopy = async (): Promise<void> => {
  // 계산 결과에 있는 내용을 가져온다.
  const resultText = document.getElementById('result')?.textContent ?? '';
  // 선택한 내용을 가져온다.
  const selectedText = document.getSelection()?.toString() ?? '';
  // 선택한 내용이 없으면 계산 결과에 있는 내용을 가져온다.
  const textToClipboard = selectedText == '' ? resultText: selectedText;
  // 복사할 대상이 디스플레이에 있는 내용인지 선택한 내용인지에 따라
  // 복사할 대상을 표시한다.
  const targetToBeCopied =
    selectedText == ''
      ? t('targetToBeCopiedResult')
      : t('targetToBeCopiedSelected');

  // 클립보드에 복사한다.
  try {
    await copyToClipboard(textToClipboard);
    store.notifyMsg(t('copiedToClipboard', { target: targetToBeCopied }));
  } catch (error) {
    console.error(error); // 에러 메시지를 콘솔에 출력
    store.notifyError(t('failedToCopyToClipboard', { target: targetToBeCopied }));
  }
}

const doPaste = async (): Promise<void> => {
  let text = '';
  try {
    if ($q.platform.is.capacitor) { // Capacitor 플랫폼인 경우
      // WebAppInterface를 통해 클립보드에서 텍스트를 가져옵니다.
      text = await AndroidInterface.getFromClipboard();
    } else {
      // navigator.clipboard를 통해 클립보드에서 텍스트를 가져옵니다.
      text = await navigator.clipboard.readText();
    }

    // 가져온 텍스트를 calc 객체의 현재 숫자로 설정합니다.
    calc.setCurrentNumber(text);

    // 알림 스토어를 통해 사용자에게 클립보드에서 성공적으로 붙여넣었다는 메시지를 보냅니다.
    store.notifyMsg(t('pastedFromClipboard'));
  } catch (error) {
    // 에러가 발생한 경우, 콘솔에 에러 메시지를 출력합니다.
    console.error(error);

    // 사용자에게 클립보드 붙여넣기 실패를 알립니다.
    store.notifyError(t('failedToPasteFromClipboard'));
  }
}

const keyBinding = new KeyBinding([
  [['Control+c', 'Control+Insert', 'Copy'], () => store.clickButtonById('btn-copy')],
  [['Control+v', 'Shift+Insert', 'Paste'], () => store.clickButtonById('btn-paste')],
]);

onMounted(() => {
  keyBinding.subscribe();
});

const pasteDisabledPath = ['/', '/help', '/about'];
</script>

<template>
  <q-btn
    id="btn-copy"
    flat
    icon="content_copy"
    class="q-ma-none q-pa-none q-pl-xs"
    @click="doCopy"
  >
    <MyTooltip>{{ t('tooltipCopy') }}</MyTooltip>
  </q-btn>
  <q-btn
    id="btn-paste"
    flat
    icon="content_paste"
    class="q-ma-none q-pa-none q-pl-xs"
    @click="doPaste"
  >
    <MyTooltip>{{ t('tooltipPaste') }}</MyTooltip>
  </q-btn>
  <q-btn
    id="btn-history"
    flat
    icon="history"
    class="q-ma-none q-pa-none q-pl-xs"
    @click="store.isHistoryDialogOpen = !store.isHistoryDialogOpen"
  >
    <MyTooltip>{{ t('tooltipPaste') }}</MyTooltip>
  </q-btn>
  <q-btn
    id="btn-menu"
    flat
    icon="more_vert"
    class="q-ma-none q-pa-none q-pl-xs"
  >
    <q-menu 
      auto-close
      transition-show="slide-down"
      transition-hide="slide-up"
      :offset="[0, 20]"
    >
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
  pastedFromClipboard: '클립보드로부터 숫자를 붙여넣었습니다.'
  failedToPasteFromClipboard: '클립보드로부터 숫자를 붙여넣지 못했습니다.'
  tooltipCopy: '내용을 복사합니다.'
  tooltipPaste: '숫자를 붙혀넣습니다.'
en:
  targetToBeCopiedResult: 'the calculation result'
  targetToBeCopiedSelected: 'the selected content'
  copiedToClipboard: 'Copied {target} to the clipboard.'
  failedToCopyToClipboard: 'Failed to copy {target} to the clipboard.'
  pastedFromClipboard: 'Pasted the number from the clipboard.'
  failedToPasteFromClipboard: 'Failed to paste the number from the clipboard.'
  tooltipCopy: 'Copy the content.'
  tooltipPaste: 'Paste the number.'
</i18n>
