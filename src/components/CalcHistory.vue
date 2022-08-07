<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import tinykeys, { KeyBindingMap } from 'tinykeys';

import type { History } from 'classes/Calculator';

import { useCalcStore } from 'stores/calc-store';

// 스토어 가져오기
const store = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const calc = store.calc;

// 계산 결과 배열
const resultHistory = computed(() => calc.getHistory() as unknown as History[]);

// 계산 결과를 지울지 묻는 다이얼로그 표시 여부
const doDeleteHistory = ref(false);

// 계산 결과 맨 위로 가는 아이콘 표시 여부
const isGoToTopInHistory = ref(false);

// 계산 결과 창 스크롤 위치에 따라 아이콘 표시 설정
function onScroll(evt: Event) {
  if ((evt.target as HTMLDivElement).scrollTop > 50) {
    isGoToTopInHistory.value = true;
  } else {
    isGoToTopInHistory.value = false;
  }
}

// 계산 결과 창 스크롤 위치를 최상단으로 이동
function goToTopInHistory() {
  document.getElementById('history')?.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

// 계산기 키바인딩 제거하기위한 변수 선언
let keybindingRemoveAtUmount = tinykeys(window, {} as KeyBindingMap);

// dom 요소가 마운트 되었을 때
// 1. 계산기 키바인딩 설정하기
// 2. 스토어에서 값을 가져와서 계산기에 설정하기
onMounted(() => {
  type Shortcut = [string[], () => void][];

  const shortcuts: Shortcut = [
    [
      ['h'],
      () => {
        if (!doDeleteHistory.value) {
          store.showHistory = !store.showHistory;
        }
      },
    ],
    [
      ['d'],
      () => {
        if (store.showHistory) {
          doDeleteHistory.value = true;
        }
      },
    ],
  ];

  // Support keyboard entry
  const keyBindingMaps: KeyBindingMap = {};

  shortcuts.forEach((shortcut) => {
    const [keys, handler] = shortcut;
    keys.forEach((key) => {
      keyBindingMaps[key] = handler;
    });
  });

  // 키바인딩하고 제거할 수 있는 메서드 백업;
  keybindingRemoveAtUmount = tinykeys(window, keyBindingMaps);
});

// dom 요소가 언마운트되기 전에 키바인딩 제거
onBeforeUnmount(() => {
  keybindingRemoveAtUmount();
});
</script>

<template>
  <q-dialog
    v-model="store.showHistory"
    style="z-index: 10"
    position="bottom"
    transition-duration="300"
  >
    <q-bar
      dark
      class="noselect bg-primary text-white"
      @focusin="($event.target as HTMLElement).blur()"
    >
      <q-icon name="history" size="sm" />
      <div>계산 결과</div>
      <q-space />
      <q-btn
        dense
        flat
        icon="delete_outline"
        size="md"
        @click="doDeleteHistory = true"
      />
      <q-btn
        dense
        flat
        icon="close"
        size="md"
        @click="store.showHistory = false"
      />
    </q-bar>

    <q-card
      @scroll="onScroll"
      square
      class="row justify-center items-start scroll relative-position"
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
                <span>계산 결과가 없습니다.</span>
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
                  <q-item-label
                    v-html="store.getLeftSideInHistory(history, true)"
                  ></q-item-label>
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
    <q-card class="noselect bg-teal text-white" style="width: 200px">
      <q-card-section> 계산 기록을 지우겠어요? </q-card-section>
      <q-card-actions align="center" class="bg-white text-teal">
        <q-btn flat label="아니오" v-close-popup />
        <q-btn
          flat
          label="예"
          @click="calc.clearHistory()"
          autofocus
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.q-bar {
  max-width: calc(100vw - 45px);
}

#history {
  max-height: calc(100vh - 200px);
  min-height: calc(100vh - 200px);
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
</style>
