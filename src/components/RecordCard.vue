<script setup lang="ts">
  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { onMounted, onBeforeUnmount, ref, computed, watch, reactive } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // Quasar 관련 설정
  import { useQuasar, copyToClipboard } from 'quasar';
  const $q = useQuasar();

  // 계산기 관련 타입과 클래스
  import { KeyBinding } from 'classes/KeyBinding';

  // 스토어 관련
  import { useStore } from 'src/stores/store';
  // 스토어 인스턴스 초기화
  const store = useStore();
  // 스토어에서 필요한 메서드와 속성 추출
  const { calc, getRightSideInRecord, getLeftSideInRecord, showMessage, showError, swapUnits, swapCurrencies } = store;

  // 컴포넌트 import
  import MenuItem from 'components/snippets/MenuItem.vue';
  import HighlightText from 'components/snippets/HighlightText.vue';

  // 계산 결과 배열 (반응형)
  const records = computed(() => calc.record.getAllRecords());

  // 계산 결과 메뉴의 열림 상태를 관리하는 반응형 객체
  const recordMenu = reactive(Object.fromEntries(records.value.map((h) => [h.id, false])));

  // records 변경 감시
  watch(
    () => records,
    (newRecords) => {
      // 새로운 히스토리 항목에 대한 메뉴 상태 초기화
      newRecords.value.forEach((h) => {
        if (h.id && recordMenu[h.id] === undefined) {
          recordMenu[h.id] = false;
        }
      });

      // 삭제된 히스토리 항목의 메뉴 상태 제거
      for (const id in recordMenu) {
        if (!newRecords.value.some((h) => h.id === parseInt(id))) {
          delete recordMenu[id];
        }
      }
    },
    { deep: true }, // 깊은 감시 설정
  );

  // 계산 결과 맨 위로 가는 아이콘 표시 여부
  const showScrollToTop = ref(false);

  // 계산 결과 창 스크롤 이벤트 핸들러
  const handleScroll = (evt: Event) => {
    showScrollToTop.value = (evt.target as HTMLDivElement).scrollTop > 50;
  };

  // 계산 결과 창 스크롤 위치를 최상단으로 이동
  const scrollToTop = () => {
    document.getElementById('record')?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // 히스토리 스크롤 함수
  const scrollToRecord = (offset: number | 'top' | 'bottom') => {
    const recordElement = document.getElementById('record');
    if (!recordElement) return;

    const currentScroll = recordElement.scrollTop;
    let targetScroll: number;

    if (offset === 'top') {
      targetScroll = 0;
    } else if (offset === 'bottom') {
      targetScroll = recordElement.scrollHeight - recordElement.clientHeight;
    } else {
      targetScroll = Math.max(
        0,
        Math.min(currentScroll + offset, recordElement.scrollHeight - recordElement.clientHeight),
      );
    }

    recordElement.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  };

  const openDeleteRecordConfirmDialog = () => {
    if (calc.record.getAllRecords().length > 0) store.isDeleteRecordConfirmOpen = true;
  };

  const openSearchDialogByKey = () => {
    store.isSearchOpen = !store.isSearchOpen;
    if (store.isSearchOpen) {
      setTimeout(() => {
        // 끝의 s 삭제
        store.searchKeyword = store.searchKeyword.slice(0, -1);
      }, 100);
    }
  };

  // 키 바인딩 설정
  const keyBinding = new KeyBinding([
    [['d'], () => openDeleteRecordConfirmDialog()],
    [['s'], () => openSearchDialogByKey()],
    [['ArrowUp'], () => scrollToRecord(-50)],
    [['ArrowDown'], () => scrollToRecord(50)],
    [['PageUp'], () => scrollToRecord(-400)],
    [['PageDown'], () => scrollToRecord(400)],
    [['Home'], () => scrollToRecord('top')],
    [['End'], () => scrollToRecord('bottom')],
  ]);

  // 입력 포커스 상태에 따른 키 바인딩 활성화/비활성화
  watch(
    () => store.inputFocused,
    () => {
      if (store.inputFocused) {
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
    setTimeout(() => {
      document.getElementById('record')?.scrollTo({ top: store.recordLastScrollPosition });
    }, 50);
    showScrollToTop.value = false;
  });

  // 컴포넌트 언마운트 시 키 바인딩 비활성화
  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
    store.recordLastScrollPosition = document.getElementById('record')?.scrollTop ?? 0;

    store.isDeleteRecordConfirmOpen = false;
  });

  // 메모 편집 관련 상태 변수
  const showMemoDialog = ref(false);
  const memoText = ref('');
  const memoSlideDirection = ref('');
  let selectedMemoId = 0;

  // 메모 다이얼로그 열기 함수
  const openMemoDialog = (id: number) => {
    selectedMemoId = id;
    memoText.value = (calc.record.getMemo(id) as string) || '';
    showMemoDialog.value = true;
  };

  // 슬라이드 왼쪽 동작 핸들러
  const slideToOpenMemoDialog = (reset: QSlideEvent['reset'], id: number) => {
    openMemoDialog(id);
    setTimeout(reset, 500);
  };

  // 메모 편집 확인 함수
  const saveMemo = () => {
    calc.record.setMemo(selectedMemoId, memoText.value);
    memoSlideDirection.value = 'slide-right';
    showMemoDialog.value = false;
    memoText.value = '';
    selectedMemoId = 0;
  };

  // 메모 편집 취소 함수
  const cancelMemo = () => {
    memoSlideDirection.value = 'slide-left';
    showMemoDialog.value = false;
    memoText.value = '';
    selectedMemoId = 0;
  };

  // 메모 삭제 함수
  const deleteMemo = (id: number) => {
    calc.record.deleteMemo(id);
    memoText.value = '';
  };

  // 히스토리 항목 복사 함수
  const copyRecordItem = async (id: number, copyType: 'formattedNumber' | 'onlyNumber' | 'memo'): Promise<void> => {
    const record = calc.record.getRecordById(id);
    const copyText =
      copyType === 'formattedNumber'
        ? getRightSideInRecord(record.calculationResult)
        : copyType === 'onlyNumber'
          ? record.calculationResult.resultNumber
          : copyType === 'memo'
            ? (calc.record.getMemo(id) as string)
            : '';
    try {
      await copyToClipboard(copyText);
      showMessage(t('copySuccess'));
    } catch (error) {
      console.error(error);
      showError(t('copyFailure'));
    }
  };

  // 메인 결과로 이동 함수
  const loadToMainPanel = (id: number) => {
    const record = calc.record.getRecordById(id);
    calc.setCurrentNumber(record.calculationResult.resultNumber);
  };

  // 서브 결과로 이동 함수
  const loadToSubPanel = (id: number) => {
    const record = calc.record.getRecordById(id);
    if (store.currentTab === 'unit') {
      swapUnits();
      setTimeout(() => {
        calc.setCurrentNumber(record.calculationResult.resultNumber);
      }, 5);
      setTimeout(swapUnits, 10);
    } else if (store.currentTab === 'currency') {
      swapCurrencies();
      setTimeout(() => {
        calc.setCurrentNumber(record.calculationResult.resultNumber);
      }, 5);
      setTimeout(swapCurrencies, 10);
    }
  };

  // 히스토리 항목 삭제 함수
  const deleteRecordItem = (id: number) => {
    calc.record.deleteRecord(id);
  };

  // 헤더의 높이를 동적으로 계산하는 computed 속성입니다.
  const calculatedHeaderHeight = computed(() => {
    const headerElement = document.getElementById('header');
    return headerElement ? headerElement.clientHeight + 'px' : '0px';
  });

  const recordStrings = computed<RecordString[]>(() => {
    // 기본 레코드 문자열 생성
    const strings = records.value.map((record) => {
      const displayText = [
        getLeftSideInRecord(record.calculationResult, true),
        '\n= ',
        getRightSideInRecord(record.calculationResult),
      ].join('');

      return {
        id: record.id as number,
        memo: record.memo,
        displayText,
        origResult: record.calculationResult,
      };
    });

    // 검색이 활성화되지 않은 경우 전체 결과 반환
    if (!store.isSearchOpen) return strings;

    // 검색어가 없는 경우 전체 결과 반환
    const searchTerm = store.searchKeyword.trim().toLowerCase();
    if (!searchTerm) return strings;

    // 검색어로 필터링
    return strings.filter((record) => {
      const memoMatch = record.memo?.toLowerCase().includes(searchTerm);
      const displayTextMatch = record.displayText.toLowerCase().includes(searchTerm);
      return memoMatch || displayTextMatch;
    });
  });

  interface QSlideEvent {
    reset: () => void;
  }
</script>

<template>
  <q-card-section
    id="record"
    square
    class="full-width row justify-center items-start relative-position scrollbar-custom q-py-none q-pt-md"
    @scroll="handleScroll"
  >
    <transition name="slide-fade">
      <q-btn
        v-if="showScrollToTop"
        round
        glossy
        color="secondary"
        icon="publish"
        class="fixed"
        :class="store.isSearchOpen ? 'q-ma-xl' : 'q-ma-md'"
        style="z-index: 15"
        :aria-label="t('ariaLabel.scrollToTop')"
        @click="scrollToTop"
      />
    </transition>
    <transition name="slide-fade">
      <q-bar
        v-if="store.isSearchOpen"
        class="search-bar"
        :class="{
          'input-focused': store.inputFocused,
        }"
      >
        <q-input
          v-model="store.searchKeyword"
          :placeholder="t('search')"
          borderless
          filled
          dense
          autofocus
          class="search-input"
          :aria-label="t('ariaLabel.searchInput')"
          role="searchbox"
          @focus="store.setInputFocused"
          @blur="store.setInputBlurred"
          @keyup.enter="$event.target.blur()"
          @keyup.escape="
            () => {
              store.isSearchOpen = false;
              store.setInputBlurred();
            }
          "
        >
          <template #append>
            <q-btn
              round
              flat
              dense
              size="sm"
              icon="mdi-arrow-collapse-up"
              style="top: -3px"
              :aria-label="t('ariaLabel.closeSearch')"
              @click="
                () => {
                  store.isSearchOpen = false;
                  store.setInputBlurred();
                }
              "
            />
          </template>
        </q-input>
      </q-bar>
    </transition>

    <div v-if="store.isSearchOpen" class="q-ma-md q-pa-xs" />

    <transition name="slide-fade" mode="out-in">
      <q-item v-if="recordStrings.length == 0" class="text-center">
        <q-item-section role="listitem">
          <q-item-label>
            <span>{{
              store.isSearchOpen && store.searchKeyword.trim() !== '' ? t('noSearchResult') : t('noRecord')
            }}</span>
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-list v-else id="record-list" separator class="full-width" role="list">
        <transition-group name="record-list">
          <q-slide-item
            v-for="record in recordStrings"
            :key="record.id"
            left-color="negative"
            right-color="positive"
            role="listitem"
            @left="deleteRecordItem(record.id as number)"
            @right="(event: QSlideEvent) => slideToOpenMemoDialog(event.reset, record.id)"
          >
            <template #left>
              <q-icon name="delete_outline" :aria-label="t('ariaLabel.deleteRecord')" role="button" />
            </template>
            <template #right>
              <q-icon name="edit_note" :aria-label="t('ariaLabel.editMemo')" role="button" />
            </template>
            <q-item
              v-touch-hold.mouse="() => (recordMenu[record.id as number] = true)"
              class="text-right q-pa-sm"
              role="listitem"
            >
              <q-item-section class="q-mr-none q-px-none">
                <q-item-label v-if="record.memo">
                  <u><HighlightText :text="record.memo" :search-term="store.searchKeyword" /></u>
                </q-item-label>
                <q-item-label style="white-space: pre-wrap">
                  <HighlightText :text="record.displayText" :search-term="store.searchKeyword" />
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-menu
              v-model="recordMenu[record.id as number]"
              class="shadow-6"
              :context-menu="$q.platform.is.desktop"
              auto-close
              anchor="center left"
              self="top left"
            >
              <q-list dense class="noselect" style="max-width: 200px" role="list">
                <MenuItem
                  v-if="!record.memo"
                  :title="t('addMemo')"
                  :action="() => openMemoDialog(record.id as number)"
                />
                <MenuItem
                  v-if="record.memo"
                  :title="t('editMemo')"
                  :action="() => openMemoDialog(record.id as number)"
                />
                <MenuItem
                  v-if="record.memo"
                  :title="t('copyMemo')"
                  :action="() => copyRecordItem(record.id as number, 'memo')"
                />
                <MenuItem v-if="record.memo" :title="t('deleteMemo')" :action="() => deleteMemo(record.id as number)" />
                <MenuItem separator />
                <MenuItem
                  :title="t('copyDisplayedResult')"
                  :action="() => copyRecordItem(record.id as number, 'formattedNumber')"
                  :caption="getRightSideInRecord(record.origResult)"
                />
                <MenuItem
                  :title="t('copyResultNumber')"
                  :action="() => copyRecordItem(record.id as number, 'onlyNumber')"
                  :caption="record.origResult.resultNumber"
                />
                <MenuItem separator />
                <MenuItem :title="t('loadToMainPanel')" :action="() => loadToMainPanel(record.id as number)" />
                <MenuItem
                  v-if="!store.isDefaultCalculator()"
                  :title="t('loadToSubPanel')"
                  :action="() => loadToSubPanel(record.id as number)"
                />
                <MenuItem separator />
                <MenuItem :title="t('deleteResult')" :action="() => deleteRecordItem(record.id as number)" />
              </q-list>
            </q-menu>
          </q-slide-item>
        </transition-group>
      </q-list>
    </transition>
  </q-card-section>

  <!-- 기록 전체 삭제 다이얼로그 -->
  <q-dialog
    v-model="store.isDeleteRecordConfirmOpen"
    transition-show="scale"
    transition-hide="scale"
    style="z-index: 15"
  >
    <q-card class="noselect text-center text-white bg-negative" style="width: 240px">
      <q-card-section>{{ t('doYouDeleteRecord') }} </q-card-section>
      <q-card-actions align="center" class="text-negative bg-white">
        <q-btn v-close-popup flat :label="t('message.no')" autofocus />
        <q-btn v-close-popup flat :label="t('message.yes')" @click="calc.record.clearRecords()" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- 기록의 메모 수정 다이얼로그 -->
  <q-dialog
    v-model="showMemoDialog"
    persistent
    transition-show="slide-right"
    :transition-hide="memoSlideDirection"
    style="z-index: 15"
  >
    <q-card class="noselect text-center" style="width: 250px">
      <q-bar v-auto-blur dark class="full-width justify-between nnoselect text-body1 text-white bg-primary">
        <q-btn dense flat icon="replay" size="sm" @click="cancelMemo" />
        <div>{{ t('memo') }}</div>
        <q-btn dense flat icon="check" size="sm" @click="saveMemo" />
      </q-bar>
      <q-card-section>
        <q-input
          v-model="memoText"
          clearable
          filled
          dense
          autofocus
          clear-icon="close"
          color="primary"
          @focus="store.setInputFocused"
          @blur="store.setInputBlurred"
          @keyup.enter="
            () => {
              store.setInputBlurred;
              saveMemo();
            }
          "
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
  #record {
    max-height: calc(100vh - v-bind('calculatedHeaderHeight'));
    overflow: auto;
  }

  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease-out;
  }

  .slide-fade-enter-from {
    opacity: 0;
    transform: translateY(-100%);
  }

  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-100%);
  }

  .record-list-move,
  .record-list-enter-active,
  .record-list-leave-active {
    transition: all 0.3s ease;
  }

  .record-list-leave-active {
    position: absolute;
  }

  .record-list-enter-from,
  .record-list-leave-to {
    opacity: 0;
    transform: translateY(-50%);
    width: 100%;
  }

  #record-list {
    -ms-overflow-style: none;
    scrollbar-width: none;
    overflow: hidden;
    position: relative;
  }

  .hidden {
    display: none;
  }

  .search-bar {
    position: fixed;
    width: 100%;
    height: 50px;
    top: 0;
    z-index: 2000;
    background: var(--q-primary);
    transition: all 0.3s ease-out;

    .search-input {
      position: absolute;
      padding: 8px;
      padding-left: 8px;
      top: 0;
      left: 0;
      width: 100%;
      color: var(--q-light-text);

      :deep(.q-field__control) {
        background: white;
        color: black;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        height: 34px;
      }

      :deep(.q-field__before) {
        padding-right: 0;
        min-width: auto;
      }

      :deep(.q-field__native) {
        color: black;
        &::placeholder {
          color: rgba(0, 0, 0, 0.7);
          opacity: 0.7;
        }
      }

      :deep(.q-field__marginal) {
        color: black;
      }
    }
  }
</style>

<i18n>
ko:
  record: '계산 기록'
  noRecord: '계산 기록이 없습니다.'
  noSearchResult: '검색 결과가 없습니다.'
  search: '검색'
  doYouDeleteRecord: '모든 계산 기록을 지우겠어요?'
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
  ariaLabel:
    scrollToTop: '맨 위로 스크롤'
    editMemo: '메모 편집'
    deleteRecord: '기록 삭제'
    searchInput: '검색'
    dragHandle: '검색창 이동'
    closeSearch: '검색창 닫기'
en:
  record: 'record'
  noRecord: 'No record.'
  noSearchResult: 'No search results.'
  search: 'Search'
  doYouDeleteRecord: 'Do you want to delete all record?'
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
  ariaLabel:
    scrollToTop: 'Scroll to top'
    editMemo: 'Edit memo'
    deleteRecord: 'Delete record'
    searchInput: 'Search'
    dragHandle: 'Move search window'
    closeSearch: 'Close search window'
</i18n>
