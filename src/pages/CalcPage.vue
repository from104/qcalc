<script setup lang="ts">
// import CalcPanelResult from 'components/CalcPanelResult.vue';
import ResultField from 'components/ResultField.vue';

import CalcButton from 'components/CalcButton.vue';
import CalcHistory from 'components/CalcHistory.vue';
</script>

<template>
  <q-page>
    <q-card flat class="q-px-md q-pt-xs q-pb-md">
      <ResultField field="main" />
      <CalcButton type="normal"/>
    </q-card>
  </q-page>
</template>