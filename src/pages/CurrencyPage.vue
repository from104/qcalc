<script setup lang="ts">
  /**
   * @file CurrencyPage.vue
   * @description 이 파일은 통화 변환 기능을 제공하는 페이지를 정의합니다.
   *              이 페이지는 통화 변환 기능을 수행하는 데 필요한 컴포넌트를 포함합니다.
   *              통화 변환 기능을 수행하는 데 필요한 컴포넌트를 포함합니다.
   */

  import CurrencyPanel from 'components/panels/CurrencyPanel.vue';
  import ResultField from 'components/calc/ResultField.vue';
  import CalcButton from 'components/calc/CalcButton.vue';
</script>

<template>
  <q-page>
    <q-card flat class="q-px-md q-pt-xs q-pb-md">
      <ResultField field="main" addon="currency" />
      <CurrencyPanel />
      <ResultField field="sub" addon="currency" />
      <CalcButton type="currency" />
    </q-card>
  </q-page>
</template>
