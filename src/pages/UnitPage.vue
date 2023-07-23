<script setup lang="ts">
import UnitPanelResult from 'components/UnitPanelResult.vue';
import CalcButton from 'components/CalcButton.vue';
import CalcHistory from 'components/CalcHistory.vue';
</script>

<template>
  <q-page>
    <q-card flat class="q-px-md q-pt-xs q-pb-md">
      <UnitPanelResult />
      <CalcButton />
    </q-card>
  </q-page>
  <CalcHistory />
</template>
