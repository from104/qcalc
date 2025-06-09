/**
 * @file store.d.ts
 * @description 이 파일은 Pinia 스토어의 상태 및 타입을 정의합니다.
 *              계산기, 통화 변환, 단위 변환 등 다양한 기능을 포함하며,
 *              애플리케이션의 상태를 관리하는 데 필요한 타입 정보를 제공합니다.
 *              상태 정의, 액션, 변이 등을 포함하여 UI와 비즈니스 로직을 연결합니다.
 */

import type { Calculator } from '../classes/Calculator';
import type { CurrencyConverter } from '../classes/CurrencyConverter';
import type { Radix } from '../classes/RadixConverter';
import type { DefineStore } from 'pinia';
import type { CalculationResult } from './calculator';

/**
 * 계산기 버튼 색상/종류 타입
 */
export type ButtonType = 'normal' | 'important' | 'function';

/**
 * 그룹핑 단위 설정 타입
 */
export type GroupingUnitType = 3 | 4;

/**
 * 워드 크기 설정 타입
 */
export type WordSize = 8 | 16 | 32 | 64;

/**
 * 진법 표시 타입
 */
export type RadixDisplayType = 'prefix' | 'suffix';

// 소수점 자릿수를 위한 상수 정의
export const DECIMAL_PLACES: { [key: number]: number } = {
  '-1': -1,
  '0': 0,
  '1': 2,
  '2': 4,
  '3': 6,
  '4': 8,
  '5': 16,
} as const;

// DecimalPlacesType을 객체 키로부터 생성
export type DecimalPlacesType = keyof typeof DECIMAL_PLACES;

/**
 * 계산기 스토어 상태 인터페이스
 */
export interface CalcState {
  calc: Calculator;
  isMemoryVisible: boolean;
  isShiftPressed: boolean;
  isShiftLocked: boolean;
  needButtonNotification: boolean;
}

/**
 * 단위 변환 스토어 상태 인터페이스
 */
export interface UnitState {
  selectedCategory: string;
  sourceUnits: Record<string, string>;
  targetUnits: Record<string, string>;
  showUnit: boolean;
  convertedUnitNumber: string;
}

/**
 * 통화 변환 스토어 상태 인터페이스
 */
export interface CurrencyState {
  currencyConverter: CurrencyConverter;
  sourceCurrency: string;
  targetCurrency: string;
  showSymbol: boolean;
  convertedCurrencyNumber: string;
}

/**
 * 진법 변환 스토어 상태 인터페이스
 */
export interface RadixState {
  wordSize: WordSize;
  radixList: Radix[];
  sourceRadix: Radix;
  targetRadix: Radix;
  showRadix: boolean;
  radixType: RadixDisplayType;
}

/**
 * UI 스토어 상태 인터페이스
 */
export interface UIState {
  isAppStarted: boolean;
  showTips: boolean;
  showTipsDialog: boolean;
  currentTab: string;
  inputFocused: boolean;
  isDeleteRecordConfirmOpen: boolean;
  recordLastScrollPosition: number;
  isSearchOpen: boolean;
  searchKeyword: string;
  isSnapFirstRun: boolean;
}

/**
 * 설정 스토어 상태 인터페이스
 */
export interface SettingsState {
  alwaysOnTop: boolean;
  initPanel: boolean;
  showButtonAddedLabel: boolean;
  hapticsMode: boolean;
  useGrouping: boolean;
  groupingUnit: GroupingUnitType;
  decimalPlaces: DecimalPlacesType;
  useSystemLocale: boolean;
  locale: string;
  userLocale: string;
  autoUpdate: boolean;
}

/**
 * 계산기 스토어 액션 인터페이스
 */
export interface CalcActions {
  toggleShift(): void;
  enableShift(): void;
  disableShift(): void;
  toggleShiftLock(): void;
  enableShiftLock(): void;
  disableShiftLock(): void;
  hideMemory(): void;
  showMemoryTemporarily(): void;
  onNeedButtonNotification(): void;
  offNeedButtonNotification(): void;
  toFormattedNumber(value: string, radix?: Radix): string;
  getLeftSideInRecord(result: CalculationResult, useLineBreak?: boolean): string;
  getRightSideInRecord(result: CalculationResult): string;
}

/**
 * 단위 변환 스토어 액션 인터페이스
 */
export interface UnitActions {
  initRecentUnits(): void;
  swapUnits(): void;
  toggleShowUnit(): void;
}

/**
 * 통화 변환 스토어 액션 인터페이스
 */
export interface CurrencyActions {
  initRecentCurrencies(): void;
  swapCurrencies(): void;
  toggleShowSymbol(): void;
}

/**
 * 진법 변환 스토어 액션 인터페이스
 */
export interface RadixActions {
  convertIfRadix(value: string): string;
  convertRadix(value: string, fromRadix: Radix, toRadix: Radix): string;
  validateRadixNumber(value: string, radix: Radix): boolean;
  radixEnumToNumber(radix: Radix): number;
  getRadixNumberToOrder(number: number): number;
  getRadixPrefix(radix: Radix): string;
  getRadixSuffix(radix: Radix): string;
  initRecentRadix(): void;
  swapRadixes(): void;
  updateWordSize(value: WordSize): void;
  toggleShowRadix(): void;
  setRadixType(displayType: RadixDisplayType): void;
}

/**
 * UI 스토어 액션 인터페이스
 */
export interface UIActions {
  setCurrentTab(tab: string): void;
  setInputFocused(): void;
  setInputBlurred(): void;
  setDeleteRecordConfirmOpen(value: boolean): void;
}

/**
 * 설정 스토어 액션 인터페이스
 */
export interface SettingsActions {
  setAlwaysOnTop(isAlwaysOnTop: boolean): void;
  toggleAlwaysOnTop(): void;
  setInitPanel(isInitPanel: boolean): void;
  toggleInitPanel(): void;
  toggleButtonAddedLabel(): void;
  setHapticsMode(isEnabled: boolean): void;
  toggleHapticsMode(): void;
  toggleUseGrouping(): void;
  setGroupingUnit(digitCount: GroupingUnitType): void;
  setDecimalPlaces(places: DecimalPlacesType): void;
  incrementDecimalPlaces(): void;
  decrementDecimalPlaces(): void;
  setAutoUpdate(value: boolean): void;
  toggleAutoUpdate(): void;
}

/**
 * 스토어 타입 정의
 */
export type CalcStore = DefineStore<'calc', CalcState, Record<string, never>, CalcActions>;
export type UnitStore = DefineStore<'unit', UnitState, Record<string, never>, UnitActions>;
export type CurrencyStore = DefineStore<'currency', CurrencyState, Record<string, never>, CurrencyActions>;
export type RadixStore = DefineStore<'radix', RadixState, Record<string, never>, RadixActions>;
export type UIStore = DefineStore<'ui', UIState, Record<string, never>, UIActions>;
export type SettingsStore = DefineStore<
  'settings',
  SettingsState,
  {
    getDecimalPlaces: (state: SettingsState) => number;
  },
  SettingsActions
>;
