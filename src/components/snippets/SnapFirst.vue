<script setup lang="ts">
  /**
   * @file SnapFirst.vue
   * @description 이 파일은 Snap 환경에서 첫 실행 시 표시되는 다이얼로그를 구현한 Vue 컴포넌트입니다.
   *              Snap 환경에서 폰트 캐싱 문제로 인한 초기 실행 시 지연을 사용자에게 안내하고,
   *              강제 종료를 방지하기 위한 경고 메시지를 표시합니다. 이후 실행 시에는
   *              이 다이얼로그가 표시되지 않습니다.
   */

  import { useI18n } from 'vue-i18n';

  const $g = window.globalVars;

  import { useUIStore } from 'stores/uiStore';

  const uiStore = useUIStore();

  const { t } = useI18n();
</script>

<template>
  <q-dialog v-if="$g.isSnap" v-model="uiStore.isSnapFirstRun" persistent>
    <q-card>
      <q-card-section class="text-body1 text-center">
        {{ t('snapFirstRun') }}
      </q-card-section>
      <q-card-actions class="justify-center">
        <q-btn :label="t('confirm')" @click="uiStore.isSnapFirstRun = false" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<i18n>
  ko:
    snapFirstRun: 'Snap 환경에서 처음 실행되었습니다. 폰트 캐싱 문제 때문에 처음 실행 시 약간의 지연이 발생할 수 있습니다. 절대 강제 종료를 하지 마세요. 이후 실행 시 지연이 발생하지 않습니다.'
    confirm: '확인'
  en:
    snapFirstRun: 'This is the first run in Snap environment. Due to font caching issues, there may be a slight delay during the initial launch. Please do not force quit. Subsequent launches will not experience this delay.'
    confirm: 'Confirm'
</i18n>
