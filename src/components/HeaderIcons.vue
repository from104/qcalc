<script setup lang="ts">
  /**
   * @file HeaderIcons.vue
   * @description 이 파일은 QCalc 애플리케이션의 헤더 아이콘을 구성하는 Vue 컴포넌트입니다.
   *              사용자가 다양한 기능에 빠르게 접근할 수 있도록 아이콘을 제공하며,
   *              각 아이콘에 대한 동작을 설정합니다.
   */

  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { onMounted, ref } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // router 관련
  import { useRouter } from 'vue-router';
  const router = useRouter();

  // 계산기 관련 타입과 클래스
  import { KeyBinding } from 'classes/KeyBinding';

  // 도움말 팁 인터페이스 정의
  interface HelpTip {
    icon: string;
    title: string;
    description: string;
  }

  // 전역 window 객체에 접근하기 위한 상수 선언
  const window = globalThis.window;

  // 스토어 인스턴스 생성
  const store = window.store;

  // 스토어에서 필요한 메서드와 속성 추출
  const { calc, copyToClipboard, clickButtonById, swapUnits, swapCurrencies, swapRadixes } = store;

  // 컴포넌트 import
  import ToolTip from './snippets/ToolTip.vue';
  import MenuItem from './snippets/MenuItem.vue';
  import { showError, showMessage } from 'src/classes/utils/NotificationUtils';
  import { UnitConverter } from 'src/classes/UnitConverter';
  import { BigNumber } from 'src/classes/CalculatorMath';

  // 도움말 팝업 상태 관리
  const helpDialog = ref(false);

  /**
   * 도움말 팝업을 표시하고 5초 후에 자동으로 닫는 함수
   */
  const showHelpDialog = () => {
    helpDialog.value = true;
    setTimeout(() => {
      helpDialog.value = false;
    }, 5000);
  };

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
          calc.pasteToBuffer(clipboardText);
          calc.currentNumber = UnitConverter.convert(
            store.selectedCategory,
            BigNumber(calc.currentNumber),
            store.sourceUnits[store.selectedCategory] ?? '',
            store.targetUnits[store.selectedCategory] ?? '',
          );
          swapUnits();
        } else if (store.currentTab === 'currency') {
          swapCurrencies();
          calc.pasteToBuffer(clipboardText);
          calc.currentNumber = store.currencyConverter
            .convert(BigNumber(calc.currentNumber), store.sourceCurrency, store.targetCurrency)
            .toString();
          swapCurrencies();
        } else if (store.currentTab === 'radix') {
          swapRadixes();
          setTimeout(() => {
            calc.pasteToBuffer(clipboardText.replace(/\((?:2|8|10|16)\)/g, ''));
            swapRadixes();
          }, 10);
        }
        showMessage(t('pastedFromClipboardToSubPanel'), 2000, 'bottom');
      } else {
        if (store.currentTab === 'radix') {
          console.log('clipboardText:', clipboardText.replace(/\((?:2|8|10|16)\)/g, ''));
          calc.pasteToBuffer(clipboardText.replace(/\((?:2|8|10|16)\)/g, ''));
        } else {
          calc.pasteToBuffer(clipboardText);
        }
        showMessage(t('pastedFromClipboard'), 2000, 'bottom');
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
    id="btn-help"
    flat
    icon="quiz"
    class="q-ma-none q-pa-none q-pl-sm q-pr-xs"
    :aria-label="t('ariaLabel.help')"
    @click="showHelpDialog"
  >
    <ToolTip :text="t('tooltipHelp')" />
  </q-btn>
  <q-btn
    v-if="!store.isWideWidth()"
    flat
    icon="mdi-history"
    class="q-ma-none q-pa-none q-pl-sm q-pr-sm"
    :aria-label="t('ariaLabel.record')"
    @click="router.push('/record')"
  >
    <ToolTip :text="t('openRecordPage')" />
  </q-btn>

  <!-- 도움말 팝업 다이얼로그 -->
  <q-dialog v-model="helpDialog" persistent>
    <q-card class="help-dialog">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ t('helpTitle') }}</div>
        <q-space />
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-card-section class="q-pt-sm">
        <div class="text-body1">{{ t('helpContent') }}</div>
        <q-list>
          <q-item v-for="(tip, index) in t('helpTips') as unknown as HelpTip[]" :key="index">
            <q-item-section avatar>
              <q-icon :name="tip.icon" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ tip.title }}</q-item-label>
              <q-item-label caption>{{ tip.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
  .help-dialog {
    width: 100%;
    max-width: 500px;
    border-radius: 8px;

    .q-card__section {
      padding: 20px;
    }
  }
</style>

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
  tooltipHelp: '도움말을 표시합니다.'
  openRecordPage: '클릭하면 기록 페이지를 엽니다.'
  helpTitle: 'QCalc 도움말'
  helpContent: 'QCalc는 강력하고 사용하기 쉬운 계산기입니다. 다음은 주요 기능들입니다:'
  helpTips:
    - icon: 'calculate'
      title: '기본 계산'
      description: '사칙연산과 고급 수학 함수를 지원합니다.'
    - icon: 'swap_horiz'
      title: '단위 변환'
      description: '다양한 단위 간 변환이 가능합니다.'
    - icon: 'currency_exchange'
      title: '통화 변환'
      description: '실시간 환율로 통화를 변환합니다.'
    - icon: 'history'
      title: '계산 기록'
      description: '이전 계산 결과를 확인할 수 있습니다.'
  ariaLabel:
    copy: '클립보드에 복사'
    paste: '클립보드에서 붙여넣기'
    record: '기록 페이지 열기'
    menu: '메뉴 열기'
    help: '도움말 보기'
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
  tooltipHelp: 'Show help.'
  openRecordPage: 'Click to open the record page.'
  helpTitle: 'QCalc Help'
  helpContent: 'QCalc is a powerful and easy-to-use calculator. Here are the main features:'
  helpTips:
    - icon: 'calculate'
      title: 'Basic Calculations'
      description: 'Supports arithmetic operations and advanced math functions.'
    - icon: 'swap_horiz'
      title: 'Unit Conversion'
      description: 'Convert between various units of measurement.'
    - icon: 'currency_exchange'
      title: 'Currency Conversion'
      description: 'Convert currencies using real-time exchange rates.'
    - icon: 'history'
      title: 'Calculation History'
      description: 'View your previous calculation results.'
  ariaLabel:
    copy: 'Copy to clipboard'
    paste: 'Paste from clipboard'
    record: 'Open record page'
    menu: 'Open menu'
    help: 'View help'
</i18n>
