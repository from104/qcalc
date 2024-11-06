<script setup lang="ts">
  import RadixPanel from 'components/RadixPanel.vue';
  import ResultField from 'components/ResultField.vue';
  import CalcButton from 'components/CalcButton.vue';
</script>

<template>
  <q-page>
    <q-card flat class="q-px-md q-pt-xs q-pb-md">
      <ResultField field="main" addon="radix" />
      <RadixPanel />
      <ResultField field="sub" addon="radix" />
      <CalcButton type="currency" />
    </q-card>
  </q-page>
</template>
