// @vitest-environment jsdom
/**
 * @file ResultField.test.ts
 * @description ResultField의 라이브 입력 표시(result computed, hasSpecialDecimalPlaces 분기) 회귀 테스트.
 *              decimalPlaces=-1(기본값) 상태에서 메인 필드에 소수를 직접 입력할 때,
 *              로케일별 그룹/소수 구분자가 올바르게 조립되는지 검증한다 (W6-intl-number).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, type DefineComponent } from 'vue';
import { createI18n } from 'vue-i18n';

import type { useCalcStore as UseCalcStoreFn } from 'stores/calcStore';
import type { useUIStore as UseUIStoreFn } from 'stores/uiStore';
import type { useSettingsStore as UseSettingsStoreFn } from 'stores/settingsStore';
import type { useRadixStore as UseRadixStoreFn } from 'stores/radixStore';
import { Radix } from 'core/converters/RadixConverter';

import { vi } from 'vitest';

vi.mock('@capacitor/haptics', () => ({
  Haptics: { impact: vi.fn() },
  ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM' },
}));

const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: {} });

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

describe('ResultField 라이브 입력 표시 (로케일별 소수 구분자 회귀)', () => {
  let ResultField: ResultFieldComponent;
  let useCalcStore: typeof UseCalcStoreFn;
  let useUIStore: typeof UseUIStoreFn;
  let useSettingsStore: typeof UseSettingsStoreFn;
  let useRadixStore: typeof UseRadixStoreFn;

  beforeEach(async () => {
    vi.resetModules();
    setActivePinia(createPinia());
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
    (window as unknown as { globalVars: unknown }).globalVars = {
      isElectron: false,
      isCapacitor: false,
      isWindows: false,
      isDesktop: true,
      isMobile: false,
      isDev: true,
      version: '0.12.0',
    };
    ({ useCalcStore } = await import('stores/calcStore'));
    ({ useUIStore } = await import('stores/uiStore'));
    ({ useSettingsStore } = await import('stores/settingsStore'));
    ({ useRadixStore } = await import('stores/radixStore'));
    ResultField = (await import('components/calc/ResultField.vue')).default as unknown as ResultFieldComponent;
  });

  // 계산기 입력 버퍼에 '1234.5'를 타이핑 상태로 만든다 (needsBufferReset=false 유지)
  const typeDecimal = (calcStore: ReturnType<typeof UseCalcStoreFn>) => {
    calcStore.calc.addDigit(1);
    calcStore.calc.addDigit(2);
    calcStore.calc.addDigit(3);
    calcStore.calc.addDigit(4);
    calcStore.calc.addDot();
    calcStore.calc.addDigit(5);
  };

  it('locale=en: 정수부가 소실되지 않고 "1,234.5"로 표시된다', async () => {
    const calcStore = useCalcStore();
    useUIStore().currentTab = 'calc';
    useSettingsStore().locale = 'en';
    typeDecimal(calcStore);

    const wrapper = mountField(ResultField);
    await flushPromises();
    await nextTick();

    expect(wrapper.find('#result').text()).toBe('1,234.5');
  });

  it('locale=de: "1.234,5"로 표시된다 (정수부 소실 회귀 방지)', async () => {
    const calcStore = useCalcStore();
    useUIStore().currentTab = 'calc';
    useSettingsStore().locale = 'de';
    typeDecimal(calcStore);

    const wrapper = mountField(ResultField);
    await flushPromises();
    await nextTick();

    expect(wrapper.find('#result').text()).toBe('1.234,5');
  });

  it('locale=fr: 소수부가 중복되지 않고 그룹 구분자 뒤에 콤마로 한 번만 붙는다', async () => {
    const calcStore = useCalcStore();
    useUIStore().currentTab = 'calc';
    useSettingsStore().locale = 'fr';
    typeDecimal(calcStore);

    const wrapper = mountField(ResultField);
    await flushPromises();
    await nextTick();

    const text = wrapper.find('#result').text();
    // 소수부 '5'가 정확히 한 번만 나타나야 하며(중복 방지), 로케일 소수 구분자는 콤마여야 한다
    expect(text.endsWith(',5')).toBe(true);
    expect(text.split(',5').length - 1).toBe(1);
  });

  it('radix 탭에서 10진수가 아닌 진법(hex)일 때는 여전히 리터럴 "." 구분자를 사용한다', async () => {
    const calcStore = useCalcStore();
    useUIStore().currentTab = 'radix';
    useSettingsStore().locale = 'de';
    useRadixStore().sourceRadix = Radix.Hexadecimal;
    calcStore.calc.currentRadix = Radix.Hexadecimal;
    typeDecimal(calcStore);

    const wrapper = mountField(ResultField);
    await flushPromises();
    await nextTick();

    // 10진수가 아닌 진법은 로케일 표기 대상이 아니므로 '.'가 소수 구분자로 유지되어야 한다
    expect(wrapper.find('#result').text()).toContain('.5');
    expect(wrapper.find('#result').text()).not.toContain(',5');
  });
});
