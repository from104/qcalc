<script setup lang="ts">
  /**
   * @file UnitPage.vue
   * @description 이 파일은 단위 변환 기능을 제공하는 페이지를 정의합니다.
   *              이 페이지는 단위 변환 기능을 수행하는 데 필요한 컴포넌트를 포함합니다.
   *              단위 변환 기능을 수행하는 데 필요한 컴포넌트를 포함합니다.
   */
  
  import UnitPanel from 'components/UnitPanel.vue';
  import ResultField from 'components/ResultField.vue';
  import CalcButton from 'components/CalcButton.vue';
</script>

<template>
  <q-page>
    <q-card flat class="q-px-md q-pt-xs q-pb-md">
      <ResultField field="main" addon="unit" />
      <UnitPanel />
      <ResultField field="sub" addon="unit" />
      <CalcButton type="unit" />
    </q-card>
  </q-page>
</template>
