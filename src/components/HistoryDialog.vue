<script setup lang="ts">
  import {
    onMounted,
    onBeforeUnmount,
    ref,
    computed,
    watch,
    reactive,
  } from 'vue';

  import { useI18n } from 'vue-i18n';
  import MenuItem from 'components/MenuItem.vue';
  import { useStoreBase } from 'src/stores/store-base';
  import { useStoreUtils } from 'src/stores/store-utils';
  import { useStoreNotifications } from 'src/stores/store-notifications';
  import { useStoreUnit } from 'src/stores/store-unit';
  import { useStoreCurrency } from 'src/stores/store-currency';
  import { KeyBinding } from 'classes/KeyBinding';
  import { copyToClipboard } from 'quasar';

  // i18n 설정
  const { t } = useI18n();

  // 스토어 인스턴스 초기화
  const storeBase = useStoreBase();
  const storeUtils = useStoreUtils();
  const storeNotifications = useStoreNotifications();
  const storeUnit = useStoreUnit();
  const storeCurrency = useStoreCurrency();

  // 스토어에서 필요한 메서드와 속성 추출
  const { calc } = storeBase;
  const { clickButtonById, getRightSideInHistory, getLeftSideInHistory } = storeUtils;
  const { notifyMsg, notifyError } = storeNotifications;
  const { swapUnitValue } = storeUnit;
  const { swapCurrencyValue } = storeCurrency;

  const calcHistory = calc.history;
  
  // 계산 결과 배열 (반응형)
  const histories = computed(() => calcHistory.getHistories());

  // 계산 결과 메뉴의 열림 상태를 관리하는 반응형 객체
  const historyMenu = reactive(Object.fromEntries(histories.value.map((h) => [h.id, false])));

  // histories 변경 감시
  watch(
    () => histories,
    (newHistories) => {
      // 새로운 히스토리 항목에 대한 메뉴 상태 초기화
      newHistories.value.forEach((h) => {
        if (h.id && historyMenu[h.id] === undefined) {
          historyMenu[h.id] = false;
        }
      });

      // 삭제된 히스토리 항목의 메뉴 상태 제거
      for (const id in historyMenu) {
        if (!newHistories.value.some((h) => h.id === parseInt(id))) {
          delete historyMenu[id];
        }
      }
    },
    { deep: true } // 깊은 감시 설정
  );

  // 계산 결과 삭제 확인 다이얼로그 표시 여부
  const doDeleteHistory = ref(false);

  // 계산 결과 맨 위로 가는 아이콘 표시 여부
  const isGoToTopInHistory = ref(false);

  // 계산 결과 창 스크롤 이벤트 핸들러
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

  // 터치 시작 위치 저장 변수
  let touchStartY = 0;

  // 터치 시작 이벤트 핸들러
  const handleTouchStart = (event: TouchEvent) => {
    touchStartY = event.touches[0].clientY;
  };

  // 터치 종료 이벤트 핸들러
  const handleTouchEnd = (event: TouchEvent) => {
    const touchEndY = event.changedTouches[0].clientY;
    // 아래로 30px 이상 끌어내렸을 경우 다이얼로그 닫기
    if (touchEndY - touchStartY > 30) {
      storeBase.isHistoryDialogOpen = false;
    }
  };

  // 스크롤 위치 저장 변수
  let lastScrollPosition = 0;

  // 히스토리 다이얼로그 열림/닫힘 상태 감시
  watch(
    () => storeBase.isHistoryDialogOpen,
    (isOpen) => {
      if (isOpen) {
        // 다이얼로그가 열릴 때 저장된 스크롤 위치로 이동 (약간의 지연 적용)
        setTimeout(() => {
          document.getElementById('history')?.scrollTo({top: lastScrollPosition});
        }, 50);
      } else {
        // 다이얼로그가 닫힐 때 현재 스크롤 위치 저장
        lastScrollPosition = document.getElementById('history')?.scrollTop ?? 0;
        // 최상단으로 가는 아이콘 숨김
        isGoToTopInHistory.value = false;
      }
    },
  );

  // 히스토리 스크롤 함수
  const scrollHistory = (offset: number | 'top' | 'bottom') => {
    if (storeBase.isHistoryDialogOpen) {
      const historyElement = document.getElementById('history');
      if (historyElement) {
        if (offset === 'top') {
          offset = -historyElement.scrollTop;
        } else if (offset === 'bottom') {
          offset = historyElement.scrollHeight - historyElement.scrollTop;
        }
        historyElement.scrollTo({
          top: historyElement.scrollTop + offset,
          behavior: 'smooth',
        });
      }
    }
  };

  // 키 바인딩 설정
  const keyBinding = new KeyBinding([
    [['Alt+h'], () => { !doDeleteHistory.value && clickButtonById('btn-history'); }],
    [['d'], () => { storeBase.isHistoryDialogOpen && clickButtonById('btn-delete-history'); }],
    [['ArrowUp'], () => scrollHistory(-50)],
    [['ArrowDown'], () => scrollHistory(50)],
    [['PageUp'], () => scrollHistory(-400)],
    [['PageDown'], () => scrollHistory(400)],
    [['Home'], () => scrollHistory('top')],
    [['End'], () => scrollHistory('bottom')],
  ]);

  // 입력 포커스 상태에 따른 키 바인딩 활성화/비활성화
  watch(
    () => storeUtils.inputFocused,
    () => {
      if (storeUtils.inputFocused) {
        keyBinding.unsubscribe();
      } else {
        keyBinding.subscribe();
      }
    },
    { immediate: true },
  );

  // 컴포넌트 마운트 시 키 바인딩 활성화
  onMounted(() => {
    keyBinding.subscribe();
  });

  // 컴포넌트 언마운트 시 키 바인딩 비활성화
  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
  });

  // 메모 편집 관련 상태 변수
  const editDialog = ref(false);
  const memo = ref('');
  const editSlide = ref('');
  let slidedID = 0;

  // 메모 다이얼로그 열기 함수
  const memoDialog = (id: number) => {
    slidedID = id;
    memo.value = calcHistory.getMemo(id) as string || '';
    editDialog.value = true;
  };

  // 슬라이드 왼쪽 동작 핸들러
  const onLeft = ({ reset }: { reset: () => void }, id: number) => {
    memoDialog(id);
    setTimeout(reset, 500);
  };

  // 메모 편집 확인 함수
  const editConfirm = () => {
    calcHistory.setMemo(slidedID, memo.value);
    editSlide.value = 'slide-right';
    editDialog.value = false;
    memo.value = '';
    slidedID = 0;
  };

  // 메모 편집 취소 함수
  const editCancel = () => {
    editSlide.value = 'slide-left';
    editDialog.value = false;
    memo.value = '';
    slidedID = 0;
  };

  // 메모 삭제 함수
  const memoDelete = (id: number) => {
    calcHistory.deleteMemo(id);
    memo.value = '';
  };

  // 히스토리 항목 복사 함수
  const historyCopy = async (id: number, copyType: 'formattedNumber' | 'onlyNumber' | 'memo'): Promise<void> => {
    const history = calcHistory.getHistoryByID(id);
    const copyText =
      copyType === 'formattedNumber'
        ? getRightSideInHistory(history.resultSnapshot)
        : copyType === 'onlyNumber'
          ? history.resultSnapshot.resultNumber
          : copyType === 'memo'
            ? (calcHistory.getMemo(id) as string)
            : '';
    try {
      await copyToClipboard(copyText);
      notifyMsg(t('copySuccess'));
    } catch (error) {
      console.error(error);
      notifyError(t('copyFailure'));
    }
  };

  // 메인 결과로 이동 함수
  const toMainResult = (id: number) => {
    const history = calcHistory.getHistoryByID(id);
    calc.setCurrentNumber(history.resultSnapshot.resultNumber);
  };

  // 서브 결과로 이동 함수
  const toSubResult = (id: number) => {
    const history = calcHistory.getHistoryByID(id);
    if (storeBase.cTab === 'unit') {
      swapUnitValue();
      setTimeout(() => {
        calc.setCurrentNumber(history.resultSnapshot.resultNumber);
      }, 5);
      setTimeout(swapUnitValue, 10);
    } else if (storeBase.cTab === 'currency') {
      swapCurrencyValue();
      setTimeout(() => {
        calc.setCurrentNumber(history.resultSnapshot.resultNumber);
      }, 5);
      setTimeout(swapCurrencyValue, 10);
    }
  };

  // 히스토리 항목 삭제 함수
  const deleteHistory = (id: number) => {
    calcHistory.deleteHistory(id);
  };
</script>

<template>
  <q-dialog v-model="storeBase.isHistoryDialogOpen" style="z-index: 10" position="bottom" transition-duration="300">
    <q-bar v-blur dark class="full-width noselect text-white bg-primary">
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
      <q-btn icon="close" size="md" dense flat @click="storeBase.isHistoryDialogOpen = false" />
    </q-bar>
    <q-card
      id="history"
      v-touch-swipe:9e-2:12:50.down="() => (storeBase.isHistoryDialogOpen = false)"
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
      <q-card-section class="full-width q-pt-xs">
        <transition name="slide-fade" mode="out-in">
          <q-item v-if="histories.length == 0" class="text-center">
            <q-item-section>
              <q-item-label>
                <span>{{ t('noHistory') }}</span>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-list v-else separator>
            <transition-group name="history-list">
              <q-slide-item
                v-for="history in histories"
                :key="history.id"
                left-color="positive"
                right-color="negative"
                @left="({reset}) => onLeft({reset}, history.id as number)"
                @right="calcHistory.deleteHistory(history.id as number)"
              >
                <template #left>
                  <q-icon name="edit_note" />
                </template>
                <template #right>
                  <q-icon name="delete_outline" />
                </template>
                <q-item
                  v-touch-hold.mouse="() => (historyMenu[history.id as number] = true)"
                  class="text-right q-pa-sm"
                >
                  <q-item-section class="q-mr-none q-px-none">
                    <q-item-label v-if="history.memo">
                      <u>{{ history.memo }}</u>
                    </q-item-label>
                    <q-item-label style="white-space: pre-wrap">
                      {{ getLeftSideInHistory(history.resultSnapshot, true) }}
                    </q-item-label>
                    <q-item-label>
                      {{ ['=', getRightSideInHistory(history.resultSnapshot)].join(' ') }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-menu
                  v-model="historyMenu[history.id as number]"
                  class="shadow-6"
                  :context-menu="$q.platform.is.desktop"
                  auto-close
                  anchor="center left"
                  self="top left"
                >
                  <q-list dense class="noselect" style="max-width: 200px">
                    <MenuItem
                      v-if="!history.memo"
                      :title="t('addMemo')"
                      :action="() => memoDialog(history.id as number)"
                    />
                    <MenuItem
                      v-if="history.memo"
                      :title="t('editMemo')"
                      :action="() => memoDialog(history.id as number)"
                    />
                    <MenuItem
                      v-if="history.memo"
                      :title="t('copyMemo')"
                      :action="() => historyCopy(history.id as number, 'memo')"
                    />
                    <MenuItem
                      v-if="history.memo"
                      :title="t('deleteMemo')"
                      :action="() => memoDelete(history.id as number)"
                    />
                    <MenuItem separator />
                    <MenuItem
                      :title="t('copyDisplayedResult')"
                      :action="() => historyCopy(history.id as number, 'formattedNumber')"
                      :caption="['=', getRightSideInHistory(history.resultSnapshot)].join(' ')"
                    />
                    <MenuItem
                      :title="t('copyResultNumber')"
                      :action="() => historyCopy(history.id as number, 'onlyNumber')"
                      :caption="history.resultSnapshot.resultNumber"
                    />
                    <MenuItem separator />
                    <MenuItem :title="t('loadToMainPanel')" :action="() => toMainResult(history.id as number)" />
                    <MenuItem
                      v-if="storeBase.cTab === 'unit' || storeBase.cTab === 'currency'"
                      :title="t('loadToSubPanel')"
                      :action="() => toSubResult(history.id as number)"
                    />
                    <MenuItem separator />
                    <MenuItem :title="t('deleteResult')" :action="() => deleteHistory(history.id as number)" />
                  </q-list>
                </q-menu>
              </q-slide-item>
            </transition-group>
          </q-list>
        </transition>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- 기록 전체 삭제 다이얼로그 -->
  <q-dialog v-model="doDeleteHistory" persistent transition-show="scale" transition-hide="scale" style="z-index: 15">
    <q-card class="noselect text-center text-white bg-negative" style="width: 200px">
      <q-card-section>{{ t('doYouDeleteHistory') }} </q-card-section>
      <q-card-actions align="center" class="text-negative bg-white">
        <q-btn v-close-popup flat :label="t('message.no')" />
        <q-btn v-close-popup flat :label="t('message.yes')" autofocus @click="calcHistory.clearHistory()" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- 기록의 메모 수정 다이얼로그 -->
  <q-dialog
    v-model="editDialog"
    persistent
    transition-show="slide-right"
    :transition-hide="editSlide"
    style="z-index: 15"
  >
    <q-card class="noselect text-center" style="width: 250px">
      <q-bar v-blur dark class="full-width justify-between nnoselect text-body1 text-white bg-primary">
        <q-btn dense flat icon="replay" size="sm" @click="editCancel" />
        <div>{{ t('memo') }}</div>
        <q-btn dense flat icon="check" size="sm" @click="editConfirm" />
      </q-bar>
      <q-card-section>
        <q-input
          v-model="memo"
          clearable
          filled
          dense
          autofocus
          clear-icon="close"
          color="primary"
          @focus="storeUtils.setInputFocused"
          @blur="storeUtils.setInputBlurred"
          @keyup.enter="
            {
              storeUtils.setInputBlurred;
              editConfirm();
            }
          "
        />
      </q-card-section>
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
  memo: '메모'
  copySuccess: '클립보드에 복사되었습니다.'
  copyFailure: '클립보드 복사에 실패했습니다.'
  addMemo: '메모 추가'
  editMemo: '메모 수정'
  copyMemo: '메모 복사'
  deleteMemo: '메모 삭제'
  copyDisplayedResult: '표시된 결과 복사'
  copyResultNumber: '결과 숫자 복사'
  loadToMainPanel: '메인 패널에 불러오기'
  loadToSubPanel: '서브 패널에 불러오기'
  deleteResult: '결과 삭제'
en:
  history: 'History'
  noHistory: 'No history.'
  doYouDeleteHistory: 'Do you want to delete all history?'
  memo: 'Memo'
  copySuccess: 'Copied to clipboard.'
  copyFailure: 'Failed to copy to clipboard.'
  addMemo: 'Add memo'
  editMemo: 'Edit memo'
  copyMemo: 'Copy memo'
  deleteMemo: 'Delete memo'    
  copyDisplayedResult: 'Copy displayed result'
  copyResultNumber: 'Copy result number'
  loadToMainPanel: 'Load to main panel'
  loadToSubPanel: 'Load to sub panel'
  deleteResult: 'Delete result'
</i18n>
