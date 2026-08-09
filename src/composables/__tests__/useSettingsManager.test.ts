import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('src/i18n/initLocale', () => ({
  i18n: { global: { t: (key: string) => key } },
}));

vi.mock('quasar', () => ({
  useQuasar: () => ({ dialog: vi.fn(), notify: vi.fn() }),
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: { writeFile: vi.fn() },
  Directory: { Documents: 'DOCUMENTS', Cache: 'CACHE' },
  Encoding: { UTF8: 'utf8' },
}));

vi.mock('@capacitor/share', () => ({
  Share: { share: vi.fn() },
}));

vi.stubGlobal('window', { globalVars: { isCapacitor: false, isTauri: false } });

describe('useSettingsManager', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  let useSettingsManager: (typeof import('../useSettingsManager'))['useSettingsManager'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  let useCalcStore: (typeof import('src/stores/calcStore'))['useCalcStore'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  let useFormulaStore: (typeof import('src/stores/formulaStore'))['useFormulaStore'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  let useSettingsStore: (typeof import('src/stores/settingsStore'))['useSettingsStore'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  let Operator: (typeof import('core/calculator/Calculator'))['Operator'];

  const t = (key: string) => key;

  beforeEach(async () => {
    vi.resetModules();
    setActivePinia(createPinia());
    useSettingsManager = (await import('../useSettingsManager')).useSettingsManager;
    useCalcStore = (await import('src/stores/calcStore')).useCalcStore;
    useFormulaStore = (await import('src/stores/formulaStore')).useFormulaStore;
    useSettingsStore = (await import('src/stores/settingsStore')).useSettingsStore;
    Operator = (await import('core/calculator/Calculator')).Operator;
  });

  it('v2 라운드트립: gatherSettings로 만든 payload를 applySettings로 복원(계산 기록 + formula 포함)', () => {
    const { gatherSettings, applySettings } = useSettingsManager(t);

    const calcStore = useCalcStore();
    calcStore.calc.record.addRecord({
      previousNumber: '1',
      operator: Operator.ADD,
      argumentNumber: '2',
      resultNumber: '3',
    });
    calcStore.isMemoryVisible = true;

    const formulaStore = useFormulaStore();
    formulaStore.expression = '1+2*3';
    formulaStore.lastExpression = '1+2';

    const payload = gatherSettings();
    expect(payload.schemaVersion).toBe(2);
    expect(payload.app).toBe('qcalc');
    expect(typeof payload.exportedAt).toBe('number');
    const calcPayload = payload.calc as { records: unknown[]; isMemoryVisible: boolean };
    expect(calcPayload.records).toHaveLength(1);
    expect(calcPayload.isMemoryVisible).toBe(true);
    const formulaPayload = payload.formula as { expression: string; lastExpression: string };
    expect(formulaPayload.expression).toBe('1+2*3');
    expect(formulaPayload.lastExpression).toBe('1+2');

    // 상태 초기화 후 복원 검증
    calcStore.calc.record.clearRecords();
    calcStore.isMemoryVisible = false;
    formulaStore.expression = '';
    formulaStore.lastExpression = '';

    const ok = applySettings(payload);
    expect(ok).toBe(true);

    expect(useCalcStore().calc.record.getAllRecords()).toHaveLength(1);
    expect(useCalcStore().calc.record.getAllRecords()[0]!.calculationResult.resultNumber).toBe('3');
    expect(useCalcStore().isMemoryVisible).toBe(true);
    expect(useFormulaStore().expression).toBe('1+2*3');
    expect(useFormulaStore().lastExpression).toBe('1+2');
  });

  it('v1 하위호환: records/formula/metadata 없는 구버전 파일도 오류 없이 적용', () => {
    const { applySettings } = useSettingsManager(t);

    const v1Payload = {
      settings: { alwaysOnTop: true },
      calc: { isMemoryVisible: true, isShiftLocked: true },
    };

    const ok = applySettings(v1Payload);
    expect(ok).toBe(true);

    expect(useSettingsStore().alwaysOnTop).toBe(true);
    const calcStore = useCalcStore();
    expect(calcStore.isMemoryVisible).toBe(true);
    expect(calcStore.isShiftLocked).toBe(true);
    // 기록은 v1 페이로드에 없으므로 변경되지 않아야 함
    expect(calcStore.calc.record.getAllRecords()).toHaveLength(0);
  });

  it('알 수 없는 최상위 키(schemaVersion 등)는 무시하고 나머지는 정상 적용', () => {
    const { applySettings } = useSettingsManager(t);

    const payload = {
      schemaVersion: 2,
      app: 'qcalc',
      exportedAt: Date.now(),
      unknownKey: { foo: 'bar' },
      settings: { alwaysOnTop: true },
    };

    const ok = applySettings(payload);
    expect(ok).toBe(true);
    expect(useSettingsStore().alwaysOnTop).toBe(true);
  });

  it('object가 아닌 입력은 false를 반환하고 던지지 않음', () => {
    const { applySettings } = useSettingsManager(t);
    // @ts-expect-error 잘못된 입력 방어 테스트
    expect(applySettings(null)).toBe(false);
    // @ts-expect-error 잘못된 입력 방어 테스트
    expect(applySettings(undefined)).toBe(false);
  });
});
