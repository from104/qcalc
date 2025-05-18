<script setup lang="ts">
  /**
   * @file ShowTips.vue
   * @description QCalc 애플리케이션의 도움말 다이얼로그를 표시하는 컴포넌트입니다.
   *              사용자에게 애플리케이션 사용법에 대한 빠른 도움말을 제공합니다.
   */

  // Vue 핵심 기능 가져오기
  import { defineProps, defineEmits, computed, ref } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();
  const { locale } = useI18n({ useScope: 'global' });

  // 스토어 import
  import { useUIStore } from 'stores/uiStore';
  import { useSettingsStore } from 'stores/settingsStore';

  // 스토어 인스턴스 생성
  const uiStore = useUIStore();
  const settingsStore = useSettingsStore();

  // tips 폴더 내의 모든 .md 파일을 동적으로 import
  const koTipModules = import.meta.glob('./tips/ko/*.md', { eager: true });
  const enTipModules = import.meta.glob('./tips/en/*.md', { eager: true });

  /**
   * tips 폴더 내의 .md 파일을 파일명 기준으로 정렬하여 배열로 반환합니다.
   * @param modules - import.meta.glob으로 가져온 모듈 객체
   * @returns 정렬된 마크다운 파일 배열
   */
  function getSortedTips(modules: Record<string, { default: string }>): string[] {
    // 파일명만 추출하여 정렬
    return Object.entries(modules)
      .map(([path, mod]) => ({
        // './tips/ko/01-basic-calc.md' -> '01-basic-calc.md'
        filename: path.split('/').pop() ?? '',
        src: mod.default,
      }))
      .sort((a, b) => a.filename.localeCompare(b.filename))
      .map((item) => item.src);
  }

  // 한글, 영어 팁 배열 생성
  const koTips = getSortedTips(koTipModules as Record<string, { default: string }>);
  const enTips = getSortedTips(enTipModules as Record<string, { default: string }>);

  // tips 배열을 현재 언어에 따라 선택
  const tips = computed(() => {
    const isKorean = locale.value.substring(0, 2) === 'ko';
    // 한/영 팁 개수가 다르면 오류 발생
    if (koTips.length !== enTips.length) {
      throw new Error('The number of Korean and English tips does not match.');
    }
    return isKorean ? koTips : enTips;
  });

  // Props 정의
  const props = defineProps<{
    modelValue: boolean;
  }>();

  // Emits 정의
  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
  }>();

  // 다이얼로그 상태를 computed 속성으로 관리
  const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  });

  // 현재 팁 인덱스
  const currentIndex = ref(0);

  // 슬라이드 방향
  const slideDirection = ref<'left' | 'right'>('right');

  // 현재 팁 가져오기
  const currentTip = computed(() => tips.value[currentIndex.value]);

  // 페이지 표시 텍스트
  const pageText = computed(() => `${currentIndex.value + 1}/${tips.value.length}`);

  // 이전 팁으로 이동
  const prevTip = () => {
    slideDirection.value = 'right';
    currentIndex.value = currentIndex.value > 0 ? currentIndex.value - 1 : tips.value.length - 1;
  };

  // 다음 팁으로 이동
  const nextTip = () => {
    slideDirection.value = 'left';
    currentIndex.value = currentIndex.value < tips.value.length - 1 ? currentIndex.value + 1 : 0;
  };

  // 트랜지션 클래스 계산
  const transitionClasses = computed(() => ({
    enterActiveClass: `animated slide-${slideDirection.value}-enter`,
    leaveActiveClass: `animated slide-${slideDirection.value}-leave`,
    enterFromClass: '',
    leaveToClass: '',
  }));

  // 스와이프 설정
  const swipeConfig = (details: {
    evt?: Event;
    touch?: boolean;
    mouse?: boolean;
    direction?: 'up' | 'right' | 'down' | 'left';
    duration?: number;
    distance?: { x?: number; y?: number };
  }) => {
    if (details.direction === 'left') {
      nextTip();
    } else if (details.direction === 'right') {
      prevTip();
    }
  };
</script>

<template>
  <q-dialog v-model="dialogVisible" role="dialog" :aria-label="t('dialogAriaLabel')">
    <q-card class="tips-dialog" :class="{ 'bg-dark': settingsStore.darkMode }" role="article">
      <q-bar class="bg-primary text-white" role="banner">
        <q-space />
        <div class="text-subtitle1" role="heading" aria-level="1">{{ t('tipsTitle') }} ({{ pageText }})</div>
        <q-space />
        <q-btn
          dense
          flat
          icon="close"
          class="q-ml-sm"
          :aria-label="t('closeTips')"
          role="button"
          @click="dialogVisible = false"
        />
      </q-bar>
      <q-card-section
        v-touch-swipe.horizontal="swipeConfig"
        class="tips-content"
        :class="{ 'bg-dark': settingsStore.darkMode }"
        role="main"
        :aria-label="t('mainContentAriaLabel')"
      >
        <transition v-bind="transitionClasses">
          <div :key="currentIndex" class="tip-container scrollbar-custom" role="region" :aria-label="t('tipContent')">
            <q-markdown
              :src="currentTip"
              no-linkify
              no-heading-anchor-links
              class="q-px-md q-pt-sm"
              :class="{ 'text-white': settingsStore.darkMode }"
            />
          </div>
        </transition>
      </q-card-section>
      <q-card-actions
        align="between"
        :class="['q-px-md', settingsStore.darkMode ? 'bg-dark' : 'bg-white']"
        role="group"
        :aria-label="t('navigationAriaLabel')"
      >
        <q-btn
          flat
          round
          :color="settingsStore.darkMode ? 'white' : 'primary'"
          icon="chevron_left"
          :aria-label="t('prevTip')"
          role="button"
          @click="prevTip"
        >
          <q-tooltip>{{ t('prevTip') }}</q-tooltip>
        </q-btn>
        <q-checkbox
          v-model="uiStore.showTips"
          :label="t('showTipsOnStart')"
          dense
          :class="settingsStore.darkMode ? 'text-white' : 'text-primary'"
          role="checkbox"
          :aria-label="t('showTipsOnStart')"
        />
        <q-btn
          flat
          round
          :color="settingsStore.darkMode ? 'white' : 'primary'"
          icon="chevron_right"
          :aria-label="t('nextTip')"
          role="button"
          @click="nextTip"
        >
          <q-tooltip>{{ t('nextTip') }}</q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
  .tips-dialog {
    top: 4%;
    width: 100%;
    height: 100%;
    max-width: 400px;
    max-height: 350px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &.bg-dark {
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    :deep(.q-markdown) {
      ul {
        padding-left: 25px;
        line-height: 1.8em;
      }
      h5 {
        line-height: 0.8em;
      }

      // 다크모드에서의 마크다운 스타일 조정
      .body--dark & {
        color: #fff;

        a {
          color: #7dabf8;

          &:hover {
            color: #adc8f8;
          }
        }

        code {
          background: rgba(255, 255, 255, 0.1);
          color: #e0e0e0;
        }
      }
    }

    .tips-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      touch-action: pan-y pinch-zoom;
      position: relative;

      &.bg-dark {
        background: #1d1d1d;
      }

      // 스크롤바 숨기기
      &::-webkit-scrollbar {
        display: none;
      }
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .tip-container {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
    }
  }

  // 애니메이션 클래스
  .animated {
    animation-duration: 0.3s;
    animation-fill-mode: both;
    position: absolute;
    width: 100%;
  }

  // 왼쪽으로 슬라이드 (다음)
  @keyframes slideLeftEnter {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideLeftLeave {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(-100%);
      opacity: 0;
    }
  }

  // 오른쪽으로 슬라이드 (이전)
  @keyframes slideRightEnter {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideRightLeave {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .slide-left-enter {
    animation-name: slideLeftEnter;
  }

  .slide-left-leave {
    animation-name: slideLeftLeave;
  }

  .slide-right-enter {
    animation-name: slideRightEnter;
  }

  .slide-right-leave {
    animation-name: slideRightLeave;
  }
</style>

<i18n>
ko:
  tipsTitle: '짧은 팁'
  prevTip: '이전 팁'
  nextTip: '다음 팁'
  showTipsOnStart: '시작 시 팁 보이기'
  closeTips: '팁 닫기'
  tipContent: '팁 내용'
  dialogAriaLabel: '도움말 다이얼로그'
  mainContentAriaLabel: '팁 메인 콘텐츠'
  navigationAriaLabel: '팁 네비게이션'
en:
  tipsTitle: 'Quick Tips'
  prevTip: 'Previous tip'
  nextTip: 'Next tip'
  showTipsOnStart: 'Show tips on start'
  closeTips: 'Close tips'
  tipContent: 'Tip content'
  dialogAriaLabel: 'Help dialog'
  mainContentAriaLabel: 'Tip main content'
  navigationAriaLabel: 'Tip navigation'
</i18n>
