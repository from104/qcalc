<script setup lang="ts">
  /**
   * @file RecordPage.vue
   * @description 이 파일은 기록 페이지를 정의합니다.
   *              이 페이지는 기록 기능을 수행하는 데 필요한 컴포넌트를 포함합니다.
   *              기록 기능을 수행하는 데 필요한 컴포넌트를 포함합니다.
   */
  
  import RecordCard from 'components/RecordCard.vue';
</script>

<template>
  <q-page id="record-page" class="full-width q-mt-none q-pa-none">
    <q-card flat square>
      <RecordCard />
    </q-card>
  </q-page>
</template>

