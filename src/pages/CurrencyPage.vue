<script setup lang="ts">
import CurrencyPanel from 'components/CurrencyPanel.vue';
import ResultField from 'components/ResultField.vue';
import CalcButton from 'components/CalcButton.vue';
import CalcHistory from 'components/CalcHistory.vue';
</script>

<template>
  <q-page>
    <q-card flat class="q-px-md q-pt-xs q-pb-md">
      <ResultField field="main" addon="currency" />
      <CurrencyPanel />
      <ResultField field="sub" addon="currency" />
      <CalcButton type="currency"/>
    </q-card>
  </q-page>
  <CalcHistory />
</template>
