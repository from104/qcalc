// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, type DefineComponent } from 'vue';
import { axe } from 'vitest-axe';
import { readFileSync } from 'fs';
import { resolve } from 'path';
// Calculator는 pinia/window.globalVars에 의존하지 않으므로 정적 import로 충분함
import { Operator } from 'core/calculator/Calculator';
import type { useCalcStore as UseCalcStoreFn } from 'stores/calcStore';
import type { useUIStore as UseUIStoreFn } from 'stores/uiStore';

// Capacitor Haptics는 테스트에서 불필요 → 목 처리
vi.mock('@capacitor/haptics', () => ({
  Haptics: { impact: vi.fn() },
  ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM' },
}));

const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: {} });

// Quasar 컴포넌트 경량 스텁(명명 슬롯을 직접 렌더하여 내부 값/라이브 리전이 실제 DOM에 나옴)
const stubs = {
  QCardSection: { template: '<section><slot/></section>' },
  QField: {
    inheritAttrs: true,
    template: '<div v-bind="$attrs"><slot name="label"/><slot name="prepend"/><slot name="control"/></div>',
  },
  QIcon: { props: ['name'], inheritAttrs: true, template: '<i v-bind="$attrs"></i>' },
  QMenu: { template: '<div style="display:none"><slot/></div>' },
  QList: { template: '<div><slot/></div>' },
  ToolTip: { template: '<span/>' },
  MenuItem: { template: '<div/>' },
};
const directives = { 'auto-blur': {}, mutation: {} };

type ResultFieldComponent = DefineComponent<Record<string, unknown>>;

function mountField(ResultField: ResultFieldComponent) {
  return mount(ResultField, {
    props: { field: 'main', addon: 'none' },
    global: { plugins: [i18n], stubs, directives },
  });
}

describe('ResultField 접근성 (mount)', () => {
  let ResultField: ResultFieldComponent;
  let useCalcStore: typeof UseCalcStoreFn;
  let useUIStore: typeof UseUIStoreFn;

  beforeEach(async () => {
    vi.resetModules();
    setActivePinia(createPinia());
    // jsdom에 없는 브라우저 API 스텁
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = ((cb: FrameRequestCallback) =>
        setTimeout(() => cb(0), 0)) as typeof window.requestAnimationFrame;
    }
    // 컴포넌트가 모듈 로드 시 window.globalVars 참조
    (window as unknown as { globalVars: unknown }).globalVars = {
      isElectron: false,
      isCapacitor: false,
      isWindows: false,
      isDesktop: true,
      isMobile: false,
      isDev: true,
      version: '0.12.0',
    };
    // calcStore는 모듈 레벨에서 store를 사용하므로 pinia 활성화 후 동적 import
    ({ useCalcStore } = await import('stores/calcStore'));
    ({ useUIStore } = await import('stores/uiStore'));
    ResultField = (await import('components/calc/ResultField.vue')).default as unknown as ResultFieldComponent;
  });

  it('계산 확정 시 라이브 리전에 실제 결과 숫자가 낭독된다', async () => {
    const calcStore = useCalcStore();
    useUIStore().currentTab = 'calc';
    calcStore.calc.addDigit(2);
    calcStore.calc.executeBinary(Operator.ADD);
    calcStore.calc.addDigit(3);
    calcStore.calc.equal(); // 2 + 3 = 5

    const wrapper = mountField(ResultField);
    await flushPromises();
    await nextTick();

    const live = wrapper.find('[role="status"]');
    expect(live.exists()).toBe(true);
    expect(live.attributes('aria-live')).toBe('polite');
    expect(live.text()).toContain('5'); // "Result: 5"
  });

  it('결과 값에 실제 숫자가 노출되고 정적 라벨이 덮어쓰지 않는다', async () => {
    const calcStore = useCalcStore();
    useUIStore().currentTab = 'calc';
    calcStore.calc.addDigit(4);
    calcStore.calc.addDigit(2); // 42

    const wrapper = mountField(ResultField);
    await nextTick();

    const result = wrapper.find('#result');
    expect(result.exists()).toBe(true);
    expect(result.text()).toContain('42');
    // role="text" / 정적 aria-label 제거 확인
    expect(result.attributes('role')).toBeUndefined();
    expect(result.attributes('aria-label')).toBeUndefined();
    // 옛 정적 라벨이 DOM 어디에도 없어야 함
    expect(wrapper.html()).not.toContain('Calculation result');
    expect(wrapper.html()).not.toContain('result value');
  });

  it('axe 위반이 없어야 한다', async () => {
    const calcStore = useCalcStore();
    useUIStore().currentTab = 'calc';
    calcStore.calc.addDigit(7);
    const wrapper = mountField(ResultField);
    await nextTick();
    // region 룰은 페이지 전체의 랜드마크 포함 여부를 검사하는 규칙이라
    // 컴포넌트 단독 mount(페이지 밖 조각)에는 적용 대상이 아니므로 비활성화한다.
    const results = await axe(wrapper.element, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
  });

  it('메모리 토글 div가 키보드로 포커스 가능하고 Enter/Space로 showMemoryTemporarily가 발동된다', async () => {
    const calcStore = useCalcStore();
    useUIStore().currentTab = 'calc';
    calcStore.calc.addDigit(9);
    calcStore.calc.memory.save();

    const wrapper = mountField(ResultField);
    await nextTick();

    const memoryToggle = wrapper.find('[role="button"]');
    expect(memoryToggle.exists()).toBe(true);
    expect(memoryToggle.attributes('tabindex')).toBe('0');

    expect(calcStore.isMemoryVisible).toBe(false);
    await memoryToggle.trigger('keydown', { key: 'Enter' });
    expect(calcStore.isMemoryVisible).toBe(true);

    calcStore.hideMemory();
    await memoryToggle.trigger('keydown', { key: ' ' });
    expect(calcStore.isMemoryVisible).toBe(true);
  });

  it('메모리 토글 div에서 v-auto-blur 디렉티브가 제거되었다 (회귀 가드)', () => {
    const source = readFileSync(resolve(__dirname, '../../calc/ResultField.vue'), 'utf-8');
    const match = source.match(/<div\b[^>]*role="button"[^>]*>/);
    expect(match).not.toBeNull();
    expect(match![0]).not.toContain('v-auto-blur');
    expect(match![0]).toContain('tabindex="0"');
  });

  it('메모리 토글 div에 keydown enter/space 핸들러가 소스에 존재한다', () => {
    const source = readFileSync(resolve(__dirname, '../../calc/ResultField.vue'), 'utf-8');
    expect(source).toContain('@keydown.enter.prevent="calcStore.showMemoryTemporarily()"');
    expect(source).toContain('@keydown.space.prevent.stop="calcStore.showMemoryTemporarily()"');
  });
});
