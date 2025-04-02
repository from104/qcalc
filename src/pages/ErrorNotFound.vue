<script lang="ts">
  /**
   * @file ErrorNotFound.vue
   * @description 이 파일은 404 오류 페이지를 정의합니다.
   *              사용자가 요청한 페이지를 찾을 수 없을 때 표시됩니다.
   *              페이지는 간단한 메시지와 함께 홈으로 돌아가는 버튼을 제공합니다.
   */

  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'ErrorNotFound',
  });
</script>

<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2" style="opacity: 0.4">Oops. Nothing here...</div>

      <q-btn class="q-mt-xl" color="white" text-color="blue" unelevated to="/" label="Go Home" no-caps />
    </div>
  </div>
</template>
