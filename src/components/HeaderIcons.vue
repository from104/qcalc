<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { copyToClipboard } from 'quasar';
import { useI18n } from 'vue-i18n';

import { useCalcStore } from 'stores/calc-store';

import MyTooltip from 'components/MyTooltip.vue';

const { t } = useI18n();

// 스토어 가져오기
const store = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const calc = store.calc;

const result = computed(() => {
  const currentNumbers = calc.getCurrentNumber().split('.');
  const toLocaleNumbers = store.toLocale(currentNumbers.join('.')).split('.');
  const baseResult = (store.decimalPlaces == -2 && currentNumbers.length > 1)
    ? toLocaleNumbers[0]+'.'+currentNumbers[1]
    : toLocaleNumbers.join('.');
  return baseResult;
});

// 창에서 선택한 내용이 있으면 선택한 내용을 클립보드에 복사하고
// 아니면 계산 결과를 클립보드에 복사한다.
const doCopy = (): void => {
  const selectedText = document.getSelection()?.toString() ?? '';
  const textToClipboard = selectedText == '' ? result.value : selectedText;
  const targetToBeCopied =
    selectedText == ''
      ? t('targetToBeCopiedResult')
      : t('targetToBeCopiedSelected');
  copyToClipboard(textToClipboard)
    .then(() => {
      store.notifyMsg(t('copiedToClipboard', { target: targetToBeCopied }));
    })
    .catch(() => {
      store.notifyError(
        t('failedToCopyToClipboard', { target: targetToBeCopied })
      );
    });
}

// 클립보드에 있는 숫자를 계산 결과에 추가하는 함수
const doPaste = (): void => {
  navigator.clipboard
    .readText()
    .then((text) => {
      calc.setCurrentNumber(text);
      store.notifyMsg(t('pastedFromClipboard'));
    })
    .catch(() => {
      store.notifyError(t('failedToPasteFromClipboard'));
    });
}

import { KeyBinding } from 'classes/KeyBinding';

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
    :disable="pasteDisabledPath.includes($route.path)"
    @click="doPaste"
  >
    <MyTooltip>{{ t('tooltipPaste') }}</MyTooltip>
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
