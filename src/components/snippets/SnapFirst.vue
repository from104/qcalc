<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const window = globalThis.window;
  const store = window.store;
</script>

<template>
  <q-dialog v-if="window.isSnap" v-model="store.isSnapFirstRun" persistent>
    <q-card>
      <q-card-section class="text-body1 text-center">
        {{ t('snapFirstRun') }}
      </q-card-section>
      <q-card-actions class="justify-center">
        <q-btn label="확인" @click="store.isSnapFirstRun = false" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<i18n lang="yaml">
ko:
  snapFirstRun: 'Snap 환경에서 처음 실행되었습니다. 폰트 캐싱 때문에 처음 실행 시 약간의 지연이 발생할 수 있습니다. 절대 강제 종료를 하지 마세요. 이후 실행 시 지연이 발생하지 않습니다.'
en:
  snapFirstRun: 'Snap environment first run. Due to font caching, there may be a slight delay when first run. Do not force close. There will be no delay on subsequent runs.'
</i18n>
