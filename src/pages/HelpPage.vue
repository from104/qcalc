<script setup lang="ts">

const title = 'Help for Calc';
const author = 'Seo Kihyun';
const content = `
Here's a quick tip.
You can use basic arithmetic operations.
If you press the '+-*/' buttons consecutively, the calculation is repeated.
The '%' button calculates the percentage.
(Example: Pressing 2 / 10 % in sequence gives 20.)
`.trim().replace(/\n/g, '<br>');

</script>

<template>
  <q-page>
    <q-card flat class="q-pa-md">
      <q-card-section class="q-pa-sm">
        <div class="" style="font-size: 1.3rem">{{ title }}</div>
        by {{ author }}
      </q-card-section>
      <q-card-section class="q-pa-sm">
        <div v-html="content" />
      </q-card-section>
    </q-card>
  </q-page>
</template>
