<script setup lang="ts">
  /**
   * @file RecordCard.vue
   * @description 이 파일은 기록 결과 컴포넌트를 구성하는 Vue 컴포넌트입니다.
   *              사용자가 계산 결과를 기록하고, 메모를 추가하거나 삭제할 수 있는 기능을 제공합니다.
   *              또한, 기록된 항목을 복사하거나 메인 패널로 로드하는 기능도 포함되어 있습니다.
   *              이 컴포넌트는 계산기와 상호작용을 통해 다양한 기능을 수행합니다.
   */

  // Vue 핵심 기능 및 컴포지션 API 가져오기
  import { onMounted, onBeforeUnmount, ref, computed, watch, reactive } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // Quasar 관련 설정
  import { copyToClipboard } from 'quasar';

  import { useRouter, useRoute } from 'vue-router';
  import type { RouteLocationNormalizedLoaded } from 'vue-router';

  // router 인스턴스 가져오기
  const router = useRouter();
  const route = useRoute() as RouteLocationNormalizedLoaded & { meta: RouteTransitionMeta };

  import { navigateToPath } from 'src/utils/NavigationUtils';

  // 계산기 관련 타입과 클래스
  import { KeyBinding } from 'classes/KeyBinding';

  // 알림 관련 유틸리티 함수
  import { showMessage, showError } from 'src/utils/NotificationUtils';

  // 전역 window 객체에 접근하기 위한 상수 선언
  const $g = window.globalVars;

  // 스토어 import
  import { useUIStore } from 'stores/uiStore';
  import { useThemesStore } from 'stores/themesStore';
  import { useCalcStore } from 'src/stores/calcStore';
  import { useCurrencyStore } from 'stores/currencyStore';
  import { useUnitStore } from 'stores/unitStore';

  // 스토어 인스턴스 생성
  const uiStore = useUIStore();
  const themesStore = useThemesStore();
  const calcStore = useCalcStore();
  const currencyStore = useCurrencyStore();
  const unitStore = useUnitStore();

  // 컴포넌트 import
  import MenuItem from 'components/snippets/MenuItem.vue';
  import ToolTip from 'components/snippets/ToolTip.vue';
  import HighlightText from 'components/snippets/HighlightText.vue';
  import { UnitConverter } from 'src/classes/UnitConverter';
  import { toBigNumber } from 'src/classes/CalculatorMath';

  // 기존 코드 상단에 인터페이스 추가
  interface Record {
    id?: number;
    calculationResult: CalculationResult;
    timestamp: number;
    memo?: string | undefined;
  }

  interface CalculationResult {
    resultNumber: string;
    previousNumber: string;
    operator: string;
  }

  interface RecordString {
    id: number;
    memo?: string;
    timestamp: number;
    displayText: string;
    origResult: CalculationResult;
  }

  // records 계산 속성 수정
  const records = computed(() => calcStore.calc.record.getAllRecords());

  // 화면 너비가 특정 값보다 큰지 확인하는 함수
  const isWideWidth = () => window.innerWidth > 768;

  // 계산 결과 메뉴의 열림 상태를 관리하는 반응형 객체
  const recordMenu = reactive(Object.fromEntries(records.value.map((h: Record) => [h.id, false])));

  // records 변경 감시
  watch(
    () => records,
    (newRecords) => {
      // 새로운 히스토리 항목에 대한 메뉴 상태 초기화
      newRecords.value.forEach((record: Record) => {
        if (record.id && recordMenu[record.id] === undefined) {
          recordMenu[record.id] = false;
        }
      });

      // 삭제된 히스토리 항목의 메뉴 상태 제거
      for (const id in recordMenu) {
        if (!newRecords.value.some((record: Record) => record.id === parseInt(id))) {
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
    if (calcStore.calc.record.getAllRecords().length > 0) uiStore.isDeleteRecordConfirmOpen = true;
  };

  const openSearchDialogByKey = () => {
    uiStore.isSearchOpen = !uiStore.isSearchOpen;
    if (uiStore.isSearchOpen) {
      setTimeout(() => {
        // 끝의 s 삭제
        uiStore.searchKeyword = uiStore.searchKeyword.slice(0, -1);
      }, 100);
    }
  };

  // 키 바인딩 설정
  const keyBinding = new KeyBinding([
    [['Control+d'], () => openDeleteRecordConfirmDialog()],
    [['Control+f'], () => openSearchDialogByKey()],
    [['ArrowUp'], () => scrollToRecord(-50)],
    [['ArrowDown'], () => scrollToRecord(50)],
    [['PageUp'], () => scrollToRecord(-400)],
    [['PageDown'], () => scrollToRecord(400)],
    [['Home'], () => scrollToRecord('top')],
    [['End'], () => scrollToRecord('bottom')],
  ]);

  // 입력 포커스 상태에 따른 키 바인딩 활성화/비활성화
  watch(
    () => uiStore.inputFocused,
    () => {
      if (uiStore.inputFocused) {
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
      document.getElementById('record')?.scrollTo({ top: uiStore.recordLastScrollPosition });
      if (uiStore.isSearchOpen) {
        uiStore.setInputFocused();
      }
    }, 50);
    showScrollToTop.value = false;
  });

  // 컴포넌트 언마운트 시 키 바인딩 비활성화
  onBeforeUnmount(() => {
    keyBinding.unsubscribe();
    uiStore.recordLastScrollPosition = document.getElementById('record')?.scrollTop ?? 0;

    uiStore.isDeleteRecordConfirmOpen = false;
  });

  // 메모 편집 관련 상태 변수
  const showMemoDialog = ref(false);
  const memoText = ref('');
  const memoSlideDirection = ref('');
  let selectedMemoId = 0;

  // 메모 다이얼로그 열기 함수
  const openMemoDialog = (id: number) => {
    selectedMemoId = id;
    memoText.value = (calcStore.calc.record.getMemo(id) as string) || '';
    showMemoDialog.value = true;
  };

  // 슬라이드 왼쪽 동작 핸들러
  const slideToOpenMemoDialog = (reset: QSlideEvent['reset'], id: number) => {
    openMemoDialog(id);
    setTimeout(reset, 500);
  };

  // 메모 편집 확인 함수
  const saveMemo = () => {
    calcStore.calc.record.setMemo(selectedMemoId, memoText.value);
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

  // 히스토리 항목 복사 함수
  const copyRecordItem = async (
    id: number,
    copyType: 'formattedNumber' | 'onlyNumber' | 'memo' | 'time',
  ): Promise<void> => {
    const record = calcStore.calc.record.getRecordById(id);
    const copyText =
      copyType === 'formattedNumber'
        ? calcStore.getRightSideInRecord(record.calculationResult)
        : copyType === 'onlyNumber'
          ? record.calculationResult.resultNumber
          : copyType === 'memo'
            ? (calcStore.calc.record.getMemo(id) as string)
            : copyType === 'time'
              ? formatDateTime(record.timestamp)
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
    const record = calcStore.calc.record.getRecordById(id);
    calcStore.calc.currentNumber = record.calculationResult.resultNumber;
    calcStore.calc.offBufferReset();
    if (!isWideWidth()) navigateToPath('/', route, router);
  };

  const loadToSubPanel = (id: number) => {
    const record = calcStore.calc.record.getRecordById(id);
    if (uiStore.currentTab === 'unit') {
      unitStore.swapUnits();
      calcStore.calc.currentNumber = UnitConverter.convert(
        unitStore.selectedCategory,
        toBigNumber(record.calculationResult.resultNumber),
        unitStore.sourceUnits[unitStore.selectedCategory] ?? '',
        unitStore.targetUnits[unitStore.selectedCategory] ?? '',
      );
      unitStore.swapUnits();
    } else if (uiStore.currentTab === 'currency') {
      currencyStore.swapCurrencies();
      calcStore.calc.currentNumber = currencyStore.currencyConverter
        .convert(
          toBigNumber(record.calculationResult.resultNumber),
          currencyStore.sourceCurrency,
          currencyStore.targetCurrency,
        )
        .toString();
      currencyStore.swapCurrencies();
    }
    calcStore.calc.offBufferReset();
    if (!isWideWidth()) navigateToPath('/', route, router);
  };

  // 히스토리 항목 삭제 함수
  const deleteRecordItem = (id: number) => {
    calcStore.calc.record.deleteRecord(id);
  };

  // 헤더의 높이를 동적으로 계산하는 computed 속성입니다.
  const calculatedHeaderHeight = computed(() => {
    const headerElement = document.getElementById('header');
    return headerElement ? headerElement.clientHeight + 'px' : '0px';
  });

  // 날짜/시간 포맷 함수
  const formatDateTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  const recordStrings = computed<RecordString[]>(() => {
    // 기본 레코드 문자열 생성
    const strings = records.value.map((record: Record) => {
      const displayText = [
        calcStore.getLeftSideInRecord(record.calculationResult, true),
        '\n= ',
        calcStore.getRightSideInRecord(record.calculationResult),
      ].join('');

      return {
        id: record.id as number,
        memo: record.memo as string,
        timestamp: record.timestamp,
        displayText,
        origResult: record.calculationResult,
      };
    });

    // 검색이 활성화되지 않은 경우 전체 결과 반환
    if (!uiStore.isSearchOpen) return strings;

    // 검색어가 없는 경우 전체 결과 반환
    const searchTerm = uiStore.searchKeyword.trim().toLowerCase();
    if (!searchTerm) return strings;

    // 검색어로 필터링
    return strings.filter((record: RecordString) => {
      const memoMatch = record.memo?.toLowerCase().includes(searchTerm);
      const displayTextMatch = record.displayText.toLowerCase().includes(searchTerm);
      const timeMatch = formatDateTime(record.timestamp).toLowerCase().includes(searchTerm);
      return memoMatch || displayTextMatch || timeMatch;
    });
  });

  // 검색바 높이를 저장하는 ref 추가
  const searchBarHeight = ref(50); // 기본 높이 50px

  // 계산된 상단 여백 추가
  const calculatedTopMargin = computed(() => {
    return uiStore.isSearchOpen ? `${searchBarHeight.value}px` : '0px';
  });

  interface QSlideEvent {
    reset: () => void;
  }

  // 툴크 상태를 위한 인터페이스 정의
  interface TooltipState {
    [key: number]: boolean | null;
  }

  const isShowResultTooltip = reactive<TooltipState>({});
  const handleResultTooltip = (id: number, isShow: boolean) => {
    isShowResultTooltip[id] = isShow;
  };

  const isShowMemoTooltip = reactive<TooltipState>({});
  const handleMemoTooltip = (id: number, isShow: boolean) => {
    isShowMemoTooltip[id] = isShow;
  };

  // 메뉴 상태 관리를 위한 함수 추가
  const openRecordMenu = (id: number) => {
    recordMenu[id] = true;
  };

  // Quasar 관련 설정
  import { colors } from 'quasar';
  // Quasar 인스턴스 및 색상 유틸리티 초기화
  const { lighten } = colors;

  // 메뉴 배경색
  const menuBackgroundColor = computed(() => {
    return themesStore.isDarkMode()
      ? lighten(themesStore.getCurrentThemeColors.ui.dark, 10)
      : lighten(themesStore.getCurrentThemeColors.ui.primary, 90);
  });
</script>

<template>
  <q-card-section
    id="record"
    square
    class="full-width row justify-center items-start relative-position scrollbar-custom"
    :style="{
      paddingTop: calculatedTopMargin,
    }"
    @scroll="handleScroll"
  >
    <!-- 맨 위로 스크롤 하는 아이콘 -->
    <transition name="slide-fade">
      <q-btn
        v-if="showScrollToTop"
        round
        glossy
        color="secondary"
        icon="publish"
        class="fixed"
        :class="uiStore.isSearchOpen ? 'q-ma-xl' : 'q-ma-md'"
        style="z-index: 15"
        :aria-label="t('ariaLabel.scrollToTop')"
        @click="scrollToTop"
      />
    </transition>

    <!---검색 바 -->
    <transition name="search-bar">
      <q-bar
        v-if="uiStore.isSearchOpen"
        class="search-bar"
        :class="{
          'input-focused': uiStore.inputFocused,
        }"
      >
        <q-input
          v-model="uiStore.searchKeyword"
          :placeholder="t('search')"
          borderless
          filled
          dense
          autofocus
          class="search-input"
          :aria-label="t('ariaLabel.searchInput')"
          role="searchbox"
          @focus="uiStore.setInputFocused"
          @blur="uiStore.setInputBlurred"
          @keyup.enter="$event.target.blur()"
          @keyup.escape="
            () => {
              uiStore.isSearchOpen = false;
              uiStore.setInputBlurred();
            }
          "
        >
          <template #append>
            <q-btn
              round
              flat
              dense
              size="sm"
              icon="close"
              style="top: -3px"
              :aria-label="t('ariaLabel.closeSearch')"
              @click="
                () => {
                  uiStore.isSearchOpen = false;
                  uiStore.setInputBlurred();
                }
              "
            />
          </template>
        </q-input>
      </q-bar>
    </transition>

    <!-- 기록 목록 -->
    <transition name="slide-fade" mode="out-in">
      <!-- 기록이 없는 경우 -->
      <q-item v-if="recordStrings.length == 0" class="text-center q-pt-xl noselect">
        <q-item-section role="listitem">
          <q-item-label>
            <span class="text-h6">{{
              uiStore.isSearchOpen && uiStore.searchKeyword.trim() !== '' ? t('noSearchResult') : t('noRecord')
            }}</span>
          </q-item-label>
        </q-item-section>
      </q-item>
      <!-- 기록이 있을 경우 -->
      <q-list v-else id="record-list" separator class="full-width q-pt-md" role="list">
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
            <template v-if="$g.isMobile" #left>
              <q-icon name="delete_outline" :aria-label="t('ariaLabel.deleteRecord')" role="button" />
            </template>
            <template v-if="$g.isMobile" #right>
              <q-icon name="edit_note" :aria-label="t('ariaLabel.editMemo')" role="button" />
            </template>
            <q-item
              v-touch-hold.mouse="() => (recordMenu[record.id as number] = true)"
              class="text-right q-pa-sm record-item"
              role="listitem"
            >
              <q-item-section class="q-mr-none q-px-none">
                <q-item-label v-if="record.memo" class="memo-text">
                  <HighlightText
                    :text="record.memo"
                    :search-term="uiStore.searchKeyword"
                    @show-tooltip="(isShow) => handleMemoTooltip(record.id, isShow)"
                  />
                  <ToolTip
                    v-if="isShowMemoTooltip[record.id]"
                    :text-color="themesStore.getCurrentThemeColors.ui.primary"
                    :bg-color="themesStore.getCurrentThemeColors.ui.warning"
                    :delay="1000"
                    :text="record.memo"
                  />
                </q-item-label>
                <q-item-label class="record-text">
                  <HighlightText
                    :text="record.displayText"
                    :search-term="uiStore.searchKeyword"
                    allow-line-break
                    @show-tooltip="(isShow) => handleResultTooltip(record.id, isShow)"
                  />
                  <ToolTip
                    v-if="isShowResultTooltip[record.id]"
                    :text-color="themesStore.getCurrentThemeColors.ui.primary"
                    :bg-color="themesStore.getCurrentThemeColors.ui.warning"
                    :delay="1000"
                    :text="record.displayText"
                  />
                </q-item-label>
                <q-item-label class="row justify-between q-pa-none q-ma-none">
                  <div class="col-6 text-left record-menu-btn">
                    <q-btn
                      class="q-px-xs q-py-none menu-btn"
                      :class="themesStore.darkMode ? 'body--dark' : 'body--light'"
                      icon="more_vert"
                      size="sm"
                      flat
                      rounded
                      @click="() => $g.isDesktop && openRecordMenu(record.id as number)"
                    >
                      <q-menu
                        :model-value="recordMenu[record.id] ?? false"
                        class="shadow-6"
                        :context-menu="$g.isDesktop"
                        auto-close
                        anchor="bottom left"
                        self="top left"
                        @update:model-value="
                          (val) => {
                            recordMenu[record.id] = val;
                          }
                        "
                      >
                        <q-list
                          dense
                          class="noselect q-py-sm"
                          :style="{
                            backgroundColor: menuBackgroundColor,
                          }"
                          style="max-width: 200px"
                          role="list"
                          :dark="themesStore.isDarkMode()"
                        >
                          <MenuItem
                            v-if="record.memo"
                            :title="t('copyMemo')"
                            :action="() => copyRecordItem(record.id as number, 'memo')"
                          />
                          <MenuItem v-if="record.memo" separator />
                          <MenuItem
                            :title="t('copyDisplayedResult')"
                            :action="() => copyRecordItem(record.id as number, 'formattedNumber')"
                            :caption="calcStore.getRightSideInRecord(record.origResult)"
                          />
                          <MenuItem
                            :title="t('copyResultNumber')"
                            :action="() => copyRecordItem(record.id as number, 'onlyNumber')"
                            :caption="record.origResult.resultNumber"
                          />
                          <MenuItem separator />
                          <MenuItem
                            :title="t('copyTime')"
                            :action="() => copyRecordItem(record.id as number, 'time')"
                            :caption="formatDateTime(record.timestamp)"
                          />
                          <MenuItem separator />
                          <MenuItem
                            :title="t('loadToMainPanel')"
                            :action="() => loadToMainPanel(record.id as number)"
                          />
                          <MenuItem
                            v-if="uiStore.currentTab === 'unit' || uiStore.currentTab === 'currency'"
                            :title="t('loadToSubPanel')"
                            :action="() => loadToSubPanel(record.id as number)"
                          />
                          <MenuItem v-if="$g.isDesktop" separator />
                          <MenuItem
                            v-if="$g.isDesktop"
                            :title="t('deleteResult')"
                            :action="() => deleteRecordItem(record.id as number)"
                          />
                        </q-list>
                      </q-menu>
                    </q-btn>
                    <q-btn
                      v-if="$g.isDesktop"
                      class="q-px-xs menu-btn"
                      :class="themesStore.darkMode ? 'body--dark' : 'body--light'"
                      icon="edit_note"
                      size="sm"
                      flat
                      rounded
                      @click="() => openMemoDialog(record.id as number)"
                    />
                  </div>
                  <div class="col-6 text-right text-caption record-timestamp">
                    <HighlightText
                      class="self-center"
                      :class="themesStore.darkMode ? 'body--dark' : 'body--light'"
                      :text="formatDateTime(record.timestamp)"
                      :search-term="uiStore.searchKeyword"
                    />
                  </div>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-slide-item>
        </transition-group>
      </q-list>
    </transition>
  </q-card-section>

  <!-- 기록 전체 삭제 다이얼로그 -->
  <q-dialog
    v-model="uiStore.isDeleteRecordConfirmOpen"
    transition-show="scale"
    transition-hide="scale"
    style="z-index: 15"
  >
    <q-card class="noselect text-center text-white bg-negative" style="width: 240px">
      <q-card-section>{{ t('doYouDeleteRecord') }} </q-card-section>
      <q-card-actions align="center" class="text-negative bg-white">
        <q-btn v-close-popup flat :label="t('message.no')" autofocus />
        <q-btn v-close-popup flat :label="t('message.yes')" @click="calcStore.calc.record.clearRecords()" />
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
    @show="uiStore.setInputFocused"
    @hide="uiStore.setInputBlurred"
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
          @focus="uiStore.setInputFocused"
          @blur="uiStore.setInputBlurred"
          @keyup.enter="
            () => {
              uiStore.setInputBlurred;
              saveMemo();
            }
          "
          @keyup.escape="
            () => {
              uiStore.setInputBlurred;
              cancelMemo();
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
    transition: padding-top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .record-text {
    white-space: pre-wrap;
    font-size: 0.8rem;
  }

  .memo-text {
    font-size: 0.9rem;
    text-decoration: underline;

    :deep(span) {
      text-decoration: underline;
    }
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
    height: v-bind('searchBarHeight + "px"');
    top: 0;
    left: 0;
    z-index: 2000;
    background: var(--q-primary);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

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

  .search-bar-enter-active,
  .search-bar-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .search-bar-enter-from,
  .search-bar-leave-to {
    opacity: 0;
    transform: translateY(-100%);
  }

  .search-bar-enter-to,
  .search-bar-leave-from {
    opacity: 1;
    transform: translateY(0);
  }

  .record-item {
    &:hover {
      .menu-btn {
        opacity: 1;
        visibility: visible;
      }
    }
  }

  @mixin dark-mode-fg-colors {
    .body--dark {
      color: $grey-6;
    }
    .body--light {
      color: $grey-7;
    }
  }

  .record-menu-btn {
    margin-top: -8px;
    margin-bottom: -17px;
    margin-left: -5px;
    @include dark-mode-fg-colors;

    .menu-btn {
      opacity: v-bind('$g.isMobile ? 1 : 0');
      visibility: v-bind('$g.isMobile ? "visible" : "hidden"');
      transition: all 0.3s ease-in-out;
    }
  }

  .record-timestamp {
    margin-top: -5px;
    margin-bottom: -12px;
    @include dark-mode-fg-colors;
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
  copyTime: '시간 복사'
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
  copyTime: 'Copy time'
  ariaLabel:
    scrollToTop: 'Scroll to top'
    editMemo: 'Edit memo'
    deleteRecord: 'Delete record'
    searchInput: 'Search'
    dragHandle: 'Move search window'
    closeSearch: 'Close search window'
</i18n>
