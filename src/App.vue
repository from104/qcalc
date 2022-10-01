<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { useMeta, useQuasar } from 'quasar';
  import { ref, watch } from 'vue';

  import { useCalcStore } from 'src/stores/calc-store';

  const store = useCalcStore();

  const { locale } = useI18n({ useScope: 'global' });
  const { t } = useI18n();

  const q = useQuasar();

  const title = ref(t('appTitle'));

  if (q.platform.is.electron) {
    store.setAlwaysOnTop(store.alwaysOnTop);
  }

  useMeta(() => {
    return {
      title: title.value,
    };
  });

  watch(locale, () => {
    title.value = t('appTitle');
  });
  </script>

  <template>
    <router-view />
  </template>
