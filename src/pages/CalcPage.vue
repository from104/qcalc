<script setup lang="ts">
import CalcPanel from 'components/CalcPanel.vue';
import CalcButton from 'components/CalcButton.vue';
import CalcHistory from 'components/CalcHistory.vue';

</script>

<template>
  <q-page>
    <q-card flat class="row wrap q-px-md q-py-xs">
      <CalcPanel />

      <CalcButton />
    </q-card>
  </q-page>

  <CalcHistory />
</template>
