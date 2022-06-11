<script setup lang="ts">

const title = 'About Calc';
const author = 'Seo Kihyun';
const content = `
This is App is made by Vue+Quasar.
Contact: Seo Kihyun &lt;from104@gmail.com&gt;, +82 10-3080+2912
Copyright © 2022 Seo Kihyun. All rights reserved.
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
