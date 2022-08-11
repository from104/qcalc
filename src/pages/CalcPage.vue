<script setup lang="ts">
import CalcPanelSwitches from 'components/CalcPanelSwitches.vue';
import CalcPanelIcons from 'components/CalcPanelIcons.vue';
import CalcPanelResult from 'components/CalcPanelResult.vue';
import CalcButton from 'components/CalcButton.vue';
import CalcHistory from 'components/CalcHistory.vue';
</script>

<template>
  <q-page>
    <q-card flat class="row wrap q-px-md q-pt-xs q-pb-md">
      <CalcPanelSwitches />
      <CalcPanelIcons />
      <CalcPanelResult />

      <CalcButton />
    </q-card>
  </q-page>

  <CalcHistory />
</template>
