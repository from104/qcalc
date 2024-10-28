<script setup lang="ts">
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
