<script setup lang="ts">
import { 
  onMounted, 
  onBeforeUnmount, 
  ref, 
  computed, 
  watch 
} from 'vue';

// import MyTooltip from 'components/MyTooltip.vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

// 스토어 가져오기
import { useCalcStore } from 'stores/calc-store';
const store = useCalcStore();

// 계산기 오브젝트를 스토어에서 가져오기 위한 변수 선언
const { calc } = store;

// 계산 결과 배열
const histories = calc.getHistories()

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

// 상태를 저장할 변수를 함수 외부에 선언
let touchStartY = 0;

// 이벤트 처리 함수의 타입을 명시적으로 선언
const handleTouchStart = (event: TouchEvent) => {
  touchStartY = event.touches[0].clientY;
};

const handleTouchEnd = (event: TouchEvent) => {
  const touchEndY = event.changedTouches[0].clientY;
  // 아래로 100px 이상 끌어내렸을 경우 다이얼로그 닫기
  if (touchEndY - touchStartY > 30) {
    // store의 타입이 명시적으로 선언되어 있지 않으므로, 이 부분은 가정에 따라 달라질 수 있습니다.
    // 여기서는 store가 이미 적절한 타입으로 선언되어 있고, isHistoryDialogOpen이 boolean 타입의 속성이라고 가정합니다.
    store.isHistoryDialogOpen = false;
  }
};

// 스크롤 위치를 저장할 변수
let lastScrollPosition = 0;

watch(
  () => store.isHistoryDialogOpen,
  (isOpen) => {
    if (isOpen) {
      // 다이얼로그가 열릴 때 시간을 약간 지연하여 저장된 스크롤 위치로 이동
      setTimeout(() => {
        document.getElementById('history')?.scrollTo({ top: lastScrollPosition });
      }, 50);
    } else {
      // 다이얼로그가 닫힐 때 현재 스크롤 위치를 저장
      lastScrollPosition = document.getElementById('history')?.scrollTop ?? 0;
      // 최상단으로 가는 아이콘을 히스토리 숨길 때 함께 숨김
      isGoToTopInHistory.value = false;
    }
  }
);

import { KeyBinding } from 'classes/KeyBinding';
const keyBinding = new KeyBinding([
  [['h'], () => { !doDeleteHistory.value && store.clickButtonById('btn-history'); }],
  [['d'], () => { store.isHistoryDialogOpen && store.clickButtonById('btn-delete-history'); }]
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

const editDialog = ref(false);
const memo = ref('');

let slidedID = 0;
const onLeft = ({reset}: {reset: () => void}, id: number) => {
  console.log('onLeft', id);
  slidedID = id;

  if (calc.getMemo(id)) {
    memo.value = calc.getMemo(id) as string;
  } else {
    memo.value = '';
  }
  editDialog.value = true;

  setTimeout(() => {
    reset();
  }, 500);
}

const editConfirm = () => {
  console.log('editConfirm', slidedID, memo.value);
  calc.setMemo(slidedID, memo.value);
  editDialog.value = false;
  memo.value = '';
  slidedID = 0;
}

const editCancel = () => {
  console.log('editCancel', slidedID);
  editDialog.value = false;
  memo.value = '';
  slidedID = 0;
}

import { copyToClipboard } from 'quasar';
import { e } from 'mathjs';

const historyCopy = async (): Promise<void> => {
  if (slidedID) {
    console.log('historyCopy', slidedID)
    const history = calc.getHistoryByID(slidedID);
    const copyText = store.getRightSideInHistory(history);
    try {
      await copyToClipboard(copyText);
      store.notifyMsg('복사 성공');
    } catch (error) {
      console.error(error);
      store.notifyError('복사 실패');
    }
    slidedID = 0;
  }
}

const toResult = () => {
  console.log('toResult')
  if (slidedID) {
    console.log('toResult', slidedID)
    calc.setCurrentNumber(calc.getHistoryByID(slidedID).resultNumber);
    slidedID = 0;
  }
}
</script>

<template>
  <q-dialog
    v-model="store.isHistoryDialogOpen"
    style="z-index: 10"
    position="bottom"
    transition-duration="300"
  >
    <q-bar
      v-blur
      dark
      class="full-width noselect text-white bg-primary"
      @touchstart.passive="handleTouchStart"
      @touchend.passive="handleTouchEnd"
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
        :disable="doDeleteHistory || histories.length == 0"
        @click="doDeleteHistory = true"
      />
      <q-btn dense flat icon="close" size="md" @click="store.isHistoryDialogOpen = false" />
    </q-bar>

    <q-card
      id="history"
      square
      class="full-width row justify-center items-start relative-position scrollbar-custom"
      @scroll="onScroll"
    >
      <transition name="slide-fade">
        <q-btn
          v-if="isGoToTopInHistory"
          round
          glossy
          color="secondary"
          icon="publish"
          class="fixed q-ma-md"
          style="z-index: 12"
          @click="goToTopInHistory"
        />
      </transition>
      <q-card-section class="full-width">
        <transition name="slide-fade" mode="out-in">
          <q-item v-if="histories.length == 0" class="text-center">
            <q-item-section>
              <q-item-label>
                <span>{{ t('noHistory') }}</span>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-list v-else separator>
            <transition-group name="history-list" appear>
              <q-slide-item
                v-for="history in histories"
                :key="history.id"
                left-color="positive"
                right-color="negative"
                @left="({reset}) => onLeft({ reset }, history.id as number)"
                @right="calc.deleteHistory(history.id as number)"
              >
                <template #left>
                    <q-btn flat dense icon="edit_note" />
                </template>                  
                <template #right>
                  <q-icon name="delete_outline" />
                </template>
                <q-item class="text-right q-pa-sm">
                  <q-item-section class="q-mr-none q-px-none">
                    <q-item-label v-if="history.memo">
                      <u>{{ history.memo }}</u>
                    </q-item-label>
                    <q-item-label style="white-space: pre-wrap;">
                      {{ store.getLeftSideInHistory(history, true) }}
                    </q-item-label>
                    <q-item-label>
                      {{ ['=', store.getRightSideInHistory(history)].join(' ') }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-slide-item>
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
        <q-btn 
          v-close-popup 
          flat 
          :label="t('message.no')" 
        />
        <q-btn
          v-close-popup
          flat
          :label="t('message.yes')"
          autofocus
          @click="calc.clearHistory()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="editDialog"
    persistent
    transition-show="scale"
    transition-hide="scale"
    style="z-index: 15"
  >
    <q-card
      class="noselect text-center"
      style="width: 250px"
    >
      <q-card-section class="q-pb-none">      
        <q-input
          v-model="memo"
          clearable
          filled
          dense
          autofocus
          clear-icon="close"
          color="primary"
          label="메모"
          @focus="store.setInputFocused"
          @blur="store.setInputBlurred"
          @keyup.enter="{store.blurElement(); editConfirm();}"
        />
      </q-card-section>
      <q-card-actions
        align="center"
        class="text-negative bg-white"
      >
        <q-btn 
          flat 
          icon="replay"
          @click="editCancel"
        />
        <q-btn
          flat
          icon="check"
          @click="editConfirm"
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

.history-list-move,
.history-list-enter-active, 
.history-list-leave-active {
  transition: all 0.3s ease;
}

.history-list-enter-from,
.history-list-leave-to {
  opacity: 0;
}

.history-list-enter-from {
  transform: translateY(-20px);
}

.history-list-leave-to {
  transform: translateX(-20px);
}
</style>

<i18n>
  ko:
    history: '계산 결과'
    noHistory: '계산 결과가 없습니다.'
    doYouDeleteHistory: '모든 계산 기록을 지우겠어요?'
  en:
    history: 'History'
    noHistory: 'No history.'
    doYouDeleteHistory: 'Do you want to delete all history?'
</i18n>
    
