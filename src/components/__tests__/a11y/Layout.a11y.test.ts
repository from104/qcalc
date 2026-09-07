// @vitest-environment jsdom
/**
 * @file Layout.a11y.test.ts
 * @description WideLayout/NarrowLayout 탭 오버플로 메뉴의 실제 mount 기반 접근성 테스트.
 *              소스 grep만으로는 q-btn이 실제로 aria-* attrs를 DOM에 forward하는지,
 *              오버플로 메뉴 상태(overflowMenuOpen)와 aria-expanded가 실제로 연동되는지
 *              검증할 수 없으므로 mount하여 렌더링 결과를 직접 확인한다.
 *              Quasar 컴포넌트(q-btn 등)는 vitest 환경에서 자동 등록되지 않아 미해석
 *              커스텀 엘리먼트로 그대로 렌더링되며(attrs/슬롯은 그대로 전달됨),
 *              이 특성을 이용해 실제 컴포넌트를 stub 없이 mount한다.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { mount } from '@vue/test-utils';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { DefineComponent } from 'vue';

import type { useUIStore as UseUIStoreFn } from 'stores/uiStore';
import type { Tab, SubPageConfig } from 'src/types/layout';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ path: '/calc', name: undefined, meta: {} }),
}));

vi.mock('src/composables/useRecordManager', () => ({
  useRecordManager: () => ({
    recordFileInput: { value: null },
    handleRecordFileChange: vi.fn(),
    isRecordDisabled: { value: true },
  }),
}));

const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: {} });

const stubs = {
  ToolTip: { template: '<span/>' },
  MenuPanel: { template: '<div/>' },
  HelpIcon: { template: '<span/>' },
};
const directives = { 'auto-blur': {}, 'close-popup': {} };

type LayoutComponent = DefineComponent<Record<string, unknown>>;

// 각 레이아웃의 MAX_VISIBLE_TABS(Wide:5, Narrow:5)보다 많은 탭을 제공해 오버플로 메뉴를 활성화한다
const makeTabs = (count: number): Tab[] =>
  Array.from({ length: count }, (_, i) => ({
    name: `tab${i}`,
    title: `Tab ${i}`,
    icon: 'calculate',
    component: { template: '<div/>' },
  }));

const subPageConfig: SubPageConfig = {};

describe.each([
  ['WideLayout', () => import('../../../layouts/WideLayout.vue'), 6],
  ['NarrowLayout', () => import('../../../layouts/NarrowLayout.vue'), 6],
])('%s 탭 오버플로 메뉴 접근성 (mount)', (name, loadComponent, tabCount) => {
  let Layout: LayoutComponent;

  beforeEach(async () => {
    vi.resetModules();
    setActivePinia(createPinia());
    // jsdom에는 matchMedia가 구현되어 있지 않음 (themesStore.isDarkMode에서 사용)
    window.matchMedia =
      window.matchMedia ||
      ((query: string) =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList);
    (window as unknown as { globalVars: unknown }).globalVars = {
      isElectron: false,
      isAndroid: false,
      isCapacitor: false,
      isMobile: false,
      isDesktop: true,
      isPhone: false,
      isTablet: false,
      isDev: true,
      apiLevel: 0,
      version: '0.12.0',
    };
    Layout = (await loadComponent()).default as unknown as LayoutComponent;
  });

  const mountLayout = (tabs: Tab[]) =>
    mount(Layout, {
      props: {
        leftDrawerOpen: false,
        tabs,
        subPageConfig,
        ...(name === 'WideLayout' ? { subPageButtons: [] } : {}),
      },
      global: { plugins: [i18n], stubs, directives },
    });

  it('오버플로 q-btn이 실제로 aria-haspopup="menu"를 DOM에 forward한다', () => {
    const wrapper = mountLayout(makeTabs(tabCount));
    const overflowBtn = wrapper.find('.overflow-menu-btn');
    expect(overflowBtn.exists()).toBe(true);
    expect(overflowBtn.attributes('aria-haspopup')).toBe('menu');
  });

  it('오버플로 q-btn의 aria-expanded가 overflowMenuOpen 상태와 실제로 연동된다', () => {
    const wrapper = mountLayout(makeTabs(tabCount));
    const overflowBtn = wrapper.find('.overflow-menu-btn');
    // 초기 상태: 메뉴가 닫혀 있음
    expect(overflowBtn.attributes('aria-expanded')).toBe('false');

    // q-menu는 vitest 환경에서 미해석 커스텀 엘리먼트로 렌더링되며 v-model이 modelvalue 속성으로 바인딩된다.
    const menuEl = overflowBtn.find('q-menu');
    expect(menuEl.exists()).toBe(true);
    // q-btn의 aria-expanded와 q-menu의 v-model이 동일한 ref(overflowMenuOpen)를 참조하므로
    // 값이 서로 일치해야 한다 (배선 회귀 가드).
    expect(menuEl.attributes('modelvalue')).toBe(overflowBtn.attributes('aria-expanded'));
  });

  it('오버플로 q-btn에 지역화된 aria-label이 실제로 렌더링된다', () => {
    const wrapper = mountLayout(makeTabs(tabCount));
    const overflowBtn = wrapper.find('.overflow-menu-btn');
    expect(overflowBtn.attributes('aria-label')).toBe('More calculators');
  });

  it('overflowTabs가 비어있으면 오버플로 q-btn을 렌더링하지 않는다', () => {
    // MAX_VISIBLE_TABS보다 작은 탭 수 → overflowTabs 비어있음
    const wrapper = mountLayout(makeTabs(1));
    expect(wrapper.find('.overflow-menu-btn').exists()).toBe(false);
  });

  it('오버플로 메뉴의 q-item 클릭 시 uiStore.setCurrentTab이 실제로 호출된다 (실제 상호작용)', async () => {
    const wrapper = mountLayout(makeTabs(tabCount));
    const { useUIStore } = (await import('stores/uiStore')) as { useUIStore: typeof UseUIStoreFn };
    const uiStore = useUIStore();
    const spy = vi.spyOn(uiStore, 'setCurrentTab');

    // overflowTabs의 첫 항목(MAX_VISIBLE_TABS 이후)을 클릭
    const items = wrapper.findAll('q-item');
    expect(items.length).toBeGreaterThan(0);
    await items[0]!.trigger('click');

    expect(spy).toHaveBeenCalled();
  });
});

describe('Layout.yml에 overflowTabs 키가 10개 언어 전부 존재해야 한다', () => {
  it('overflowTabs 키가 10개 존재', () => {
    const yml = readFileSync(resolve(__dirname, '../../../i18n/components/Layout.yml'), 'utf-8');
    expect(yml.match(/overflowTabs:/g)?.length).toBe(10);
  });
});
