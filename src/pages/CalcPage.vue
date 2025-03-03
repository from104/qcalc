<script setup lang="ts">
  /**
   * @file CalcPage.vue
   * @description 이 파일은 계산기 페이지를 정의합니다.
   *              이 페이지는 사용자가 계산을 수행할 수 있도록 결과 필드와 계산 버튼을 제공합니다.
   *              결과 필드는 계산 결과를 표시하고, 계산 버튼은 계산 기능을 수행합니다.
   */
  
  import ResultField from 'components/ResultField.vue';
  import CalcButton from 'components/CalcButton.vue';
</script>

<template>
  <q-page>
    <q-card flat class="q-px-md q-pt-xs q-pb-md">
      <ResultField field="main" />
      <CalcButton type="calc" />
    </q-card>
  </q-page>
</template>
