<script setup lang="ts">
import { onMounted } from 'vue';
import { copyToClipboard } from 'quasar';

import MyTooltip from 'components/MyTooltip.vue';

import MenuPanel from './MenuPanel.vue';

// Quasar의 $q 객체를 사용하기 위한 변수 선언
import { useQuasar } from 'quasar';
const $q = useQuasar();

// i18n을 사용하기 위한 변수 선언
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

// 스토어 가져오기
import { useCalcStore } from 'stores/calc-store';
const store = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const { calc } = store;

// 창에서 선택한 내용이 있으면 선택한 내용을 클립보드에 복사하고
// 아니면 계산 결과를 클립보드에 복사한다.
const doCopy = () => {
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
    store.copyToClipboard(textToClipboard, t('copiedToClipboard', { target: targetToBeCopied }));
}

const doPaste = async (target: 'main' | 'sub' = 'main'): Promise<void> => {
  let text = ''; 
  try {
    if ($q.platform.is.capacitor) { // Capacitor 플랫폼인 경우
      // WebAppInterface를 통해 클립보드에서 텍스트를 가져옵니다.
      text = await AndroidInterface.getFromClipboard();
    } else {
      // navigator.clipboard를 통해 클립보드에서 텍스트를 가져옵니다.
      text = await navigator.clipboard.readText();
    }

    if (text === '') {
      // 클립보드에 텍스트가 없는 경우, 알림 스토어를 통해 사용자에게 클립보드에 텍스트가 없다는 메시지를 보냅니다.
      store.notifyError(t('clipboardIsEmptyOrContainsDataThatCannotBePasted.'));
      return;
    }

    if (target === 'sub') {
      // 보조 디스플레이에 붙여넣기를 한 경우, calc 객체의 보조 숫자로 설정합니다.
      if (store.cTab === 'unit') {
        store.swapUnitValue();
        setTimeout( () => { calc.setCurrentNumber(text); }, 5 );
        setTimeout( () => { store.swapUnitValue(); }, 10 );
      } else if (store.cTab === 'currency') {
        store.swapCurrencyValue();
        setTimeout( () => { calc.setCurrentNumber(text); }, 5 );
        setTimeout( () => { store.swapCurrencyValue(); }, 10 );
      }
      store.notifyMsg(t('pastedFromClipboardToSubPanel'));
    } else {
      // 메인 디스플레이에 붙여넣기를 한 경우, calc 객체의 현재 숫자로 설정합니다.
      calc.setCurrentNumber(text);
      // 알림 스토어를 통해 사용자에게 클립보드에서 성공적으로 붙여넣었다는 메시지를 보냅니다.
      store.notifyMsg(t('pastedFromClipboard'));
    }
  } catch (error) {
    // 에러가 발생한 경우, 콘솔에 에러 메시지를 출력합니다.
    console.error(error);

    // 사용자에게 클립보드 붙여넣기 실패를 알립니다.
    store.notifyError(t('failedToPasteFromClipboard'));
  }
}

import { KeyBinding } from 'classes/KeyBinding';
const keyBinding = new KeyBinding([
  [['Control+c', 'Control+Insert', 'Copy'], () => store.clickButtonById('btn-copy')],
  [['Control+v', 'Shift+Insert', 'Paste'], () => store.clickButtonById('btn-paste')],
]);

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
    :disable="store.isSettingDialogOpen"
    @click="doCopy"
  >
    <MyTooltip>{{ t('tooltipCopy') }}</MyTooltip>
  </q-btn>
  <q-btn
    id="btn-paste"
    flat
    icon="content_paste"
    class="q-ma-none q-pa-none q-pl-xs"
    :disable="store.isSettingDialogOpen"
    @click="doPaste()"
  >
    <q-menu
      v-if="store.cTab !== 'calc'"
      context-menu
      auto-close
      touch-position
    >
      <q-list dense style="max-width: 200px;">
        <q-item
          v-ripple
          clickable
          @click="doPaste('main')"
        >
          <q-item-section>
            <q-item-label>{{ t('pasteToMainPanel') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          v-ripple
          clickable
          @click="doPaste('sub')"
        >
          <q-item-section>
            <q-item-label>{{ t('pasteToSubPanel') }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
    <MyTooltip>{{ t('tooltipPaste') }}</MyTooltip>
  </q-btn>
  <q-btn
    id="btn-history"
    flat
    icon="history"
    class="q-ma-none q-pa-none q-pl-xs"
    :disable="store.isSettingDialogOpen"
    @click="store.isHistoryDialogOpen = !store.isHistoryDialogOpen"
  >
    <MyTooltip>{{ t('openHistoryDialog') }}</MyTooltip>
  </q-btn>
  <q-btn
    id="btn-menu"
    flat
    icon="more_vert"
    class="q-ma-none q-pa-none q-pl-xs"
    :disable="store.isSettingDialogOpen"
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
