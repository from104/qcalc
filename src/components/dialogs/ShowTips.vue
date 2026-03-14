<script setup lang="ts">
  /**
   * @file ShowTips.vue
   * @description QCalc 애플리케이션의 도움말 다이얼로그를 표시하는 컴포넌트입니다.
   *              사용자에게 애플리케이션 사용법에 대한 빠른 도움말을 제공합니다.
   */

  // Vue 핵심 기능 가져오기
  import { computed, ref } from 'vue';

  // i18n 설정
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();
  const { locale } = useI18n({ useScope: 'global' });

  // 스토어 import
  import { useUIStore } from 'stores/uiStore';

  // 스토어 인스턴스 생성
  const uiStore = useUIStore();

  // tips 폴더 내의 모든 .md 파일을 동적으로 import
  const koTipModules = import.meta.glob('../../content/tips/ko/*.md', { eager: true });
  const enTipModules = import.meta.glob('../../content/tips/en/*.md', { eager: true });
  const jaTipModules = import.meta.glob('../../content/tips/ja/*.md', { eager: true });
  const zhTipModules = import.meta.glob('../../content/tips/zh/*.md', { eager: true });
  const hiTipModules = import.meta.glob('../../content/tips/hi/*.md', { eager: true });
  const deTipModules = import.meta.glob('../../content/tips/de/*.md', { eager: true });
  const esTipModules = import.meta.glob('../../content/tips/es/*.md', { eager: true });
  const frTipModules = import.meta.glob('../../content/tips/fr/*.md', { eager: true });

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

  // 언어별 팁 배열 생성
  const tipsByLang: Record<string, string[]> = {
    ko: getSortedTips(koTipModules as Record<string, { default: string }>),
    en: getSortedTips(enTipModules as Record<string, { default: string }>),
    ja: getSortedTips(jaTipModules as Record<string, { default: string }>),
    zh: getSortedTips(zhTipModules as Record<string, { default: string }>),
    hi: getSortedTips(hiTipModules as Record<string, { default: string }>),
    de: getSortedTips(deTipModules as Record<string, { default: string }>),
    es: getSortedTips(esTipModules as Record<string, { default: string }>),
    fr: getSortedTips(frTipModules as Record<string, { default: string }>),
  };

  // tips 배열을 현재 언어에 따라 선택
  const tips = computed(() => {
    const lang = locale.value.substring(0, 2);
    return tipsByLang[lang] ?? tipsByLang['en']!;
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
    <q-card class="tips-dialog" role="article">
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
        role="main"
        :aria-label="t('mainContentAriaLabel')"
      >
        <transition v-bind="transitionClasses">
          <div :key="currentIndex" class="tip-container scrollbar-custom" role="region" :aria-label="t('tipContent')">
            <q-markdown :src="currentTip" no-linkify no-heading-anchor-links class="q-px-md q-pt-sm" />
          </div>
        </transition>
      </q-card-section>
      <q-card-actions align="between" class="q-px-md" role="group" :aria-label="t('navigationAriaLabel')">
        <q-btn
          flat
          round
          icon="chevron_left"
          class="tips-nav-btn"
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
          class="tips-checkbox"
          role="checkbox"
          :aria-label="t('showTipsOnStart')"
        />
        <q-btn
          flat
          round
          icon="chevron_right"
          class="tips-nav-btn"
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

    .body--dark & {
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

      .body--dark & {
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

    .tips-nav-btn {
      color: var(--q-primary);

      .body--dark & {
        color: rgba(255, 255, 255, 0.9);
      }
    }

    .tips-checkbox {
      color: var(--q-primary);

      .body--dark & {
        color: rgba(255, 255, 255, 0.85);
      }
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

<i18n lang="yaml">
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
ja:
  tipsTitle: 'ヒント'
  prevTip: '前のヒント'
  nextTip: '次のヒント'
  showTipsOnStart: '起動時にヒントを表示'
  closeTips: 'ヒントを閉じる'
  tipContent: 'ヒント内容'
  dialogAriaLabel: 'ヘルプダイアログ'
  mainContentAriaLabel: 'ヒントメインコンテンツ'
  navigationAriaLabel: 'ヒントナビゲーション'
zh:
  tipsTitle: '小提示'
  prevTip: '上一条提示'
  nextTip: '下一条提示'
  showTipsOnStart: '启动时显示提示'
  closeTips: '关闭提示'
  tipContent: '提示内容'
  dialogAriaLabel: '帮助对话框'
  mainContentAriaLabel: '提示主要内容'
  navigationAriaLabel: '提示导航'
hi:
  tipsTitle: 'त्वरित सुझाव'
  prevTip: 'पिछला सुझाव'
  nextTip: 'अगला सुझाव'
  showTipsOnStart: 'शुरू में सुझाव दिखाएं'
  closeTips: 'सुझाव बंद करें'
  tipContent: 'सुझाव सामग्री'
  dialogAriaLabel: 'सहायता संवाद'
  mainContentAriaLabel: 'सुझाव मुख्य सामग्री'
  navigationAriaLabel: 'सुझाव नेविगेशन'
de:
  tipsTitle: 'Schnelltipps'
  prevTip: 'Vorheriger Tipp'
  nextTip: 'Nächster Tipp'
  showTipsOnStart: 'Tipps beim Start anzeigen'
  closeTips: 'Tipps schließen'
  tipContent: 'Tipp-Inhalt'
  dialogAriaLabel: 'Hilfedialog'
  mainContentAriaLabel: 'Tipp-Hauptinhalt'
  navigationAriaLabel: 'Tipp-Navigation'
es:
  tipsTitle: 'Consejos rápidos'
  prevTip: 'Consejo anterior'
  nextTip: 'Siguiente consejo'
  showTipsOnStart: 'Mostrar consejos al iniciar'
  closeTips: 'Cerrar consejos'
  tipContent: 'Contenido del consejo'
  dialogAriaLabel: 'Diálogo de ayuda'
  mainContentAriaLabel: 'Contenido principal del consejo'
  navigationAriaLabel: 'Navegación de consejos'
fr:
  tipsTitle: 'Astuces rapides'
  prevTip: 'Astuce précédente'
  nextTip: 'Astuce suivante'
  showTipsOnStart: 'Afficher les astuces au démarrage'
  closeTips: 'Fermer les astuces'
  tipContent: "Contenu de l'astuce"
  dialogAriaLabel: "Dialogue d'aide"
  mainContentAriaLabel: "Contenu principal de l'astuce"
  navigationAriaLabel: 'Navigation des astuces'
</i18n>
