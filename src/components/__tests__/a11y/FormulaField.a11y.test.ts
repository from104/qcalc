// @vitest-environment jsdom
/**
 * @file FormulaField.a11y.test.ts
 * @description FormulaField 표시 모드의 실제 mount 기반 접근성 테스트.
 *              소스 grep만으로는 런타임 동작(키보드 활성화, 중첩 인터랙티브 여부)을
 *              검증할 수 없으므로 ResultField.a11y.test.ts와 동일한 mount 패턴을 사용한다.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, type DefineComponent } from 'vue';
import { axe } from 'vitest-axe';

import type { useFormulaStore as UseFormulaStoreFn } from 'src/stores/formulaStore';
import type { useUIStore as UseUIStoreFn } from 'stores/uiStore';

vi.mock('src/utils/NotificationUtils', () => ({
  showMessage: vi.fn(),
  showError: vi.fn(),
}));

const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: {} });

// Quasar 컴포넌트 경량 스텁 (명명 슬롯과 attrs를 실제 DOM에 그대로 노출)
const stubs = {
  QCardSection: { template: '<section><slot/></section>' },
  QCard: { template: '<div><slot/></div>' },
  QMenu: { template: '<div style="display:none"><slot/></div>' },
  QChip: { template: '<span><slot/></span>' },
  QSeparator: { template: '<hr/>' },
  QField: {
    inheritAttrs: true,
    template: '<div v-bind="$attrs"><slot name="prepend"/><slot name="control"/></div>',
  },
  QInput: {
    inheritAttrs: true,
    props: ['modelValue'],
    emits: ['update:modelValue'],
    // FormulaField.vue가 useTemplateRef로 inputRef.value.focus()를 호출하므로 노출해야 한다.
    methods: { focus() {} },
    template:
      '<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  QIcon: { props: ['name'], inheritAttrs: true, template: '<i v-bind="$attrs"></i>' },
  // QBtn을 실제 <button>으로 렌더링해 nested-interactive 구조 검증을 가능하게 한다.
  QBtn: { inheritAttrs: true, template: '<button v-bind="$attrs"><slot/></button>' },
};
const directives = { 'auto-blur': {} };

type FormulaFieldComponent = DefineComponent<Record<string, unknown>>;

function mountField(FormulaField: FormulaFieldComponent) {
  return mount(FormulaField, {
    global: { plugins: [i18n], stubs, directives },
  });
}

describe('FormulaField 표시 모드 접근성 (mount)', () => {
  let FormulaField: FormulaFieldComponent;
  let useFormulaStore: typeof UseFormulaStoreFn;
  let useUIStore: typeof UseUIStoreFn;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    setActivePinia(createPinia());
    (window as unknown as { globalVars: unknown }).globalVars = {
      isElectron: false,
      isCapacitor: false,
      isDesktop: true,
      isMobile: false,
      isDev: true,
      version: '0.12.0',
    };

    ({ useFormulaStore } = await import('src/stores/formulaStore'));
    ({ useUIStore } = await import('stores/uiStore'));
    FormulaField = (await import('components/calc/FormulaField.vue')).default as unknown as FormulaFieldComponent;
  });

  it('표시 모드 텍스트 요소가 role="button"과 tabindex="0"을 가진다', async () => {
    const wrapper = mountField(FormulaField);
    await nextTick();

    const displayButton = wrapper.find('[role="button"]');
    expect(displayButton.exists()).toBe(true);
    expect(displayButton.attributes('tabindex')).toBe('0');
  });

  it('Enter 키로 startEditing이 호출되어 편집 모드로 전환된다', async () => {
    const formulaStore = useFormulaStore();
    const uiStore = useUIStore();
    const wrapper = mountField(FormulaField);
    await nextTick();

    expect(formulaStore.isEditDialogOpen).toBe(false);
    await wrapper.find('[role="button"]').trigger('keydown', { key: 'Enter' });

    expect(formulaStore.isEditDialogOpen).toBe(true);
    expect(uiStore.inputFocused).toBe(true);
  });

  it('Space 키로도 startEditing이 호출된다', async () => {
    const formulaStore = useFormulaStore();
    const wrapper = mountField(FormulaField);
    await nextTick();

    await wrapper.find('[role="button"]').trigger('keydown', { key: ' ' });
    expect(formulaStore.isEditDialogOpen).toBe(true);
  });

  it('수식이 비어있지 않으면 clear 버튼(q-btn)이 렌더링되지만 role="button" 요소 내부에는 없다 (중첩 인터랙티브 방지)', async () => {
    const formulaStore = useFormulaStore();
    formulaStore.expression = '1+2';
    const wrapper = mountField(FormulaField);
    await nextTick();
    await flushPromises();

    const clearBtn = wrapper.find('.formula-clear-btn');
    expect(clearBtn.exists()).toBe(true);

    const displayButton = wrapper.find('[role="button"]');
    expect(displayButton.exists()).toBe(true);
    // role="button" 요소 자신은 clear 버튼을 하위에 포함하지 않아야 한다 (axe nested-interactive 회귀 가드)
    expect(displayButton.find('button').exists()).toBe(false);
    expect(displayButton.find('.formula-clear-btn').exists()).toBe(false);
  });

  it('axe 위반(특히 nested-interactive)이 없어야 한다', async () => {
    const formulaStore = useFormulaStore();
    formulaStore.expression = '1+2';
    const wrapper = mountField(FormulaField);
    await nextTick();
    await flushPromises();

    const results = await axe(wrapper.element, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
