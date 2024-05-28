<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue';

import { useI18n } from 'vue-i18n';

import type { History } from 'classes/Calculator';

import { KeyBinding } from 'classes/KeyBinding';
import { useCalcStore } from 'stores/calc-store';

import MyTooltip from 'components/MyTooltip.vue';

const { t } = useI18n();

// 스토어 가져오기
const store = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const { calc } = store;

// 계산 결과 배열
const resultHistory = computed(() => calc.getHistory() as unknown as History[]);

// 계산 결과 기록 열기 여부
const isHistoryOpen = ref(false);

// 계산 결과를 지울지 묻는 다이얼로그 표시 여부
const doDeleteHistory = ref(false);

// 계산 결과 맨 위로 가는 아이콘 표시 여부
const isGoToTopInHistory = ref(false);

// 계산 결과 창 스크롤 위치에 따라 아이콘 표시 설정
const onScroll = (evt: Event) => {
  isGoToTopInHistory.value = (evt.target as HTMLDivElement).scrollTop > 50;
};

// 계산 결과 창 스크롤 위치를 최상단으로 이동
const goToTopInHistory = () => {
  document.getElementById('history')?.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

// 최상단으로 가는 아이콘을 히스토리 숨길 때 함께 숨김
watch(
  () => isHistoryOpen,
  (isHistoryOpen) => {
    if (!isHistoryOpen.value) {
      isGoToTopInHistory.value = false;
    }
  }
);

const keyBinding = new KeyBinding([
  [['h'], () => { !doDeleteHistory.value && store.clickButtonById('btn-history'); }],
  [['d'], () => { isHistoryOpen.value && store.clickButtonById('btn-delete-history'); }]
]);

// inputFocused 값이 바뀌면 키바인딩을 추가하거나 제거합니다.
watch(
  () => store.inputFocused,
  () => {
    if (store.inputFocused) {
      keyBinding.unsubscribe();
    } else {
      keyBinding.subscribe();
    }
  },
  { immediate: true }
);

// dom 요소가 마운트 되었을 때
onMounted(() => {
  keyBinding.subscribe();
});

// dom 요소가 언마운트되기 전에 키바인딩 제거
onBeforeUnmount(() => {
  keyBinding.unsubscribe();
});
</script>

<template>
  <div class="absolute-bottom justify-center row">
    <transition name="fade">
      <q-btn
        v-if="!isHistoryOpen"
        id="btn-history"
        class="self-center shadow-4 q-ma-sm show-history-icon"
        padding="sm"
        round
        color="info"
        size="md"
        icon="mdi-arrow-up-bold"
        @click="isHistoryOpen = true"
      >
        <my-tooltip>
          {{ t('onClickMsg', { act: t('actShow') }) }}
        </my-tooltip>
      </q-btn>
      <q-btn
        v-else
        id="btn-history"
        class="self-center shadow-4 q-ma-sm hide-history-icon"
        padding="sm"
        round
        color="info"
        size="md"
        icon="mdi-arrow-down-bold"
        @click="isHistoryOpen = false"
      >
        <my-tooltip>
          {{ t('onClickMsg', { act: t('actHide') }) }}
        </my-tooltip>
      </q-btn>
    </transition>
  </div>
  <q-dialog
    v-model="isHistoryOpen"
    style="z-index: 10"
    position="bottom"
    transition-duration="300"
  >
    <q-bar
      dark
      class="full-width noselect text-white bg-primary"
      v-blur
    >
      <q-icon name="history" size="sm" />
      <div>{{ t('history') }}</div>
      <q-space />
      <q-btn
        id="btn-delete-history"
        dense
        flat
        icon="delete_outline"
        size="md"
        :disable="doDeleteHistory || resultHistory.length == 0"
        @click="doDeleteHistory = true"
      />
      <q-btn dense flat icon="close" size="md" @click="isHistoryOpen = false" />
    </q-bar>

    <q-card
      @scroll="onScroll"
      square
      class="full-width row justify-center items-start relative-position scrollbar-custom"
      id="history"
    >
      <transition name="slide-fade">
        <q-btn
          round
          glossy
          color="secondary"
          icon="publish"
          class="fixed q-ma-md"
          v-if="isGoToTopInHistory"
          style="z-index: 12"
          @click="goToTopInHistory"
        />
      </transition>
      <q-card-section class="full-width">
        <transition name="slide-fade" mode="out-in">
          <q-item v-if="resultHistory.length == 0" class="text-center">
            <q-item-section>
              <q-item-label>
                <span>{{ t('noHistory') }}</span>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-list v-else separator>
            <transition-group name="history-list">
              <q-item
                v-for="history in resultHistory"
                :key="history.id"
                class="history-list-item text-right q-pa-sm"
              >
                <q-item-section>
                  <q-item-label style="white-space: pre-wrap;">
                    {{ store.getLeftSideInHistory(history, true) }}
                  </q-item-label>
                  <q-item-label>
                    {{ ['=', store.getRightSideInHistory(history)].join(' ') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </transition-group>
          </q-list>
        </transition>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="doDeleteHistory"
    persistent
    transition-show="scale"
    transition-hide="scale"
    style="z-index: 15"
  >
    <q-card
      class="noselect text-center text-white bg-negative"
      style="width: 200px"
    >
      <q-card-section>{{ t('doYouDeleteHistory') }} </q-card-section>
      <q-card-actions
        align="center"
        class="text-negative bg-white"
      >
        <q-btn flat :label="t('message.no')" v-close-popup />
        <q-btn
          flat
          :label="t('message.yes')"
          @click="calc.clearHistory()"
          autofocus
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<i18n>
ko:
  onClickMsg: '클릭하면 계산 결과 기록을 {act}.'
  actShow: '보여줍니다'
  actHide: '숨깁니다'
  history: '계산 결과'
  noHistory: '계산 결과가 없습니다.'
  doYouDeleteHistory: '계산 기록을 지우겠어요?'
en:
  onClickMsg: 'Click to {act} calculation history.'
  actShow: 'show'
  actHide: 'hide'
  history: 'History'
  noHistory: 'No history.'
  doYouDeleteHistory: 'Do you want to delete the history?'
</i18n>

<style scoped lang="scss">
.q-bar {
  max-width: calc(100vw - 45px);
}

#history {
  max-height: calc(100vh - 170px);
  min-height: calc(100vh - 170px);
  max-width: calc(100vw - 45px);
  overflow: overlay;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  transform: translateY(22px);
}

.history-list-item {
  transition: all 0.3s ease;
}

.history-list-enter-from {
  opacity: 0;
  transform: translateY(-55px);
}

.history-list-leave-active {
  position: absolute;
}

@mixin history-icon {
  z-index: 14;
  position: fixed;
}

.show-history-icon {
  @include history-icon;
  bottom: -28px;
}

.hide-history-icon {
  @include history-icon;
  bottom: -14px;
  &:hover {
    opacity: 50%;
  }
}
</style>
