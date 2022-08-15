<script setup lang="ts">
import { onMounted, computed } from 'vue';
import tinykeys, { KeyBindingMap } from 'tinykeys';
import { copyToClipboard, useQuasar } from 'quasar';

import { useCalcStore } from 'stores/calc-store';

import MyTooltip from 'components/MyTooltip.vue';

// 스토어 가져오기
const store = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const calc = store.calc;

const result = computed(() => {
  return store.toLocale(Number(calc.getShownNumber()));
});

// quasar 유틸 변수 선언
const $q = useQuasar();

// notify 표시 시간 설정 ㅜms0
const notifyDuration = 500;

// 창에서 선택한 내용이 있으면 선택한 내용을 클립보드에 복사하고
// 아니면 계산 결과를 클립보드에 복사한다.
function doCopy(): void {
  const selectedText = document.getSelection()?.toString() ?? '';
  const textToClipboard = selectedText == '' ? result.value : selectedText;
  const targetToBeCopied = selectedText == '' ? '계산 결과를' : '선택한 내용을';
  copyToClipboard(textToClipboard)
    .then(() => {
      $q.notify({
        position: 'top',
        message: targetToBeCopied + ' 클립보드에 복사했습니다.',
        type: 'positive',
        timeout: notifyDuration,
      });
    })
    .catch(() => {
      $q.notify({
        position: 'top',
        message: targetToBeCopied + ' 클립보드에 복사하지 못했습니다.',
        type: 'negative',
        timeout: notifyDuration,
      });
    });
}

// 클립보드에 있는 숫자를 계산 결과에 추가하는 함수
function doPaste(): void {
  navigator.clipboard
    .readText()
    .then((text) => {
      calc.setShownNumber(text);
      $q.notify({
        position: 'top',
        message: '클립보드로부터 숫자를 붙여넣었습니다.',
        type: 'positive',
        timeout: notifyDuration,
      });
    })
    .catch(() => {
      $q.notify({
        position: 'top',
        message: '클립보드로부터 숫자를 붙여넣지 못했습니다.',
        type: 'negative',
        timeout: notifyDuration,
      });
    });
}

// dom 요소가 마운트 되었을 때
// 1. 계산기 키바인딩 설정하기
// 2. 스토어에서 값을 가져와서 계산기에 설정하기
onMounted(() => {
  type Shortcut = [string[], () => void][];

  const shortcuts: Shortcut = [
    [['Control+c', 'Control+Insert', 'Copy'], doCopy],
    [['Control+v', 'Shift+Insert', 'Paste'], doPaste],
  ];

  // Support keyboard entry
  const keyBindingMaps: KeyBindingMap = {};

  shortcuts.forEach((shortcut) => {
    const [keys, handler] = shortcut;
    keys.forEach((key) => {
      keyBindingMaps[key] = handler;
    });
  });

  tinykeys(window, keyBindingMaps);
});
</script>

<template>
  <q-btn
    flat
    icon="content_copy"
    class="q-ma-none q-pa-none q-pl-xs"
    @click="doCopy"
  >
    <MyTooltip>클릭하면 결과가 복사됩니다.</MyTooltip>
  </q-btn>
  <q-btn
    flat
    icon="content_paste"
    class="q-ma-none q-pa-none q-pl-xs"
    @click="doPaste"
  >
    <MyTooltip>클릭하면 숫자를 붙혀넣습니다.</MyTooltip>
  </q-btn>
</template>
