<script setup lang="ts">
  /**
   * @file SettingPage.vue
   * @description 이 파일은 설정 페이지를 정의합니다.
   *              이 페이지는 설정 기능을 수행하는 데 필요한 컴포넌트를 포함합니다.
   *              설정 기능을 수행하는 데 필요한 컴포넌트를 포함합니다.
   */
  
  import SettingCard from 'components/SettingCard.vue';
</script>

<template>
  <q-page class="scrollbar-custom">
    <q-card flat square>
      <SettingCard />
    </q-card>
  </q-page>
</template>

<style scoped>
.full-height {
  height: 100%;
}
</style>
