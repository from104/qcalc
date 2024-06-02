<script setup lang="ts">
import UnitPanel from 'components/UnitPanel.vue';
import ResultField from 'components/ResultField.vue';
import CalcButton from 'components/CalcButton.vue';
import CalcHistory from 'components/CalcHistory.vue';
</script>

<template>
  <q-page>
    <q-card flat class="q-px-md q-pt-xs q-pb-md">
      <ResultField field="main" addon="unit" />
      <UnitPanel />
      <ResultField field="sub" addon="unit" />
      <CalcButton type="unit"/>
    </q-card>
  </q-page>
</template>
