<script setup lang="ts">
import CurrencyPanelResult from 'components/CurrencyPanelResult.vue';
import CalcPanelResult from 'components/CalcPanelResult.vue';
import CalcButton from 'components/CalcButton.vue';
import CalcHistory from 'components/CalcHistory.vue';
</script>

<template>
  <q-page>
    <q-card flat class="q-px-md q-pt-xs q-pb-md">
      <CalcPanelResult />
      <CurrencyPanelResult />
      <CalcButton type="currency"/>
    </q-card>
  </q-page>
  <CalcHistory />
</template>
