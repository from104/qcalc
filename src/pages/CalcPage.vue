<script setup lang="ts">
import UnitPanelResult from 'components/UnitPanelResult.vue';
import CalcPanelResult from 'components/CalcPanelResult.vue';
import CalcButton from 'components/CalcButton.vue';
import CalcHistory from 'components/CalcHistory.vue';

import { useCalcStore } from 'stores/calc-store';

const store = useCalcStore();

</script>

<template>
  <q-page>
    <q-card flat class="q-px-md q-pt-xs q-pb-md">
      <CalcPanelResult />
      <transition name="fade-out-in" mode="out-in">
        <div v-if="store.unitPanel">
          <UnitPanelResult />
          <CalcButton type="unit"/>
        </div>
        <div v-else>
          <CalcButton type="normal"/>
        </div>
      </transition>
    </q-card>
  </q-page>
  <CalcHistory />
</template>

<style scoped lang="scss">
.fade-out-in-enter-active,
.fade-out-in-leave-active {
  transition: all 0.2s ease;
}
.fade-out-in-enter-from,
.fade-out-in-leave-to {
  opacity: 0;
}
</style>
