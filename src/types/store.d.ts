/**
 * @file store.d.ts
 * @description 이 파일은 Pinia 스토어의 상태 및 타입을 정의합니다.
 *              계산기, 통화 변환, 단위 변환 등 다양한 기능을 포함하며,
 *              애플리케이션의 상태를 관리하는 데 필요한 타입 정보를 제공합니다.
 *              상태 정의, 액션, 변이 등을 포함하여 UI와 비즈니스 로직을 연결합니다.
 */

import type { Calculator } from '../classes/Calculator';
import type { CurrencyConverter } from '../classes/CurrencyConverter';
import type { RadixType } from '../classes/RadixConverter';
import type { StoreDefinition } from 'pinia';
import type { WordSize } from './calculator';
import type { CalculationResult } from './calculator';

/**
 * 다크모드 설정 타입
 */
export type DarkModeType = 'system' | 'light' | 'dark';

/**
 * 그룹핑 단위 설정 타입
 */
export type GroupingUnitType = 3 | 4;

// 소수점 자릿수를 위한 상수 배열 정의
// export const DECIMAL_PLACES = [-1, 0, 2, 4, 6, 8, 16] as const;
// -1 => -1
// 0 => 0
// 1 => 2
// 2 => 4
// 3 => 6
// 4 => 8
// 5 => 16
export const DECIMAL_PLACES: { [key: number]: number } = {
  '-1': -1,
  '0': 0,
  '1': 2,
  '2': 4,
  '3': 6,
  '4': 8,
  5: 16,
} as const;

// DecimalPlacesType을 배열로부터 생성
// -1 | 0 | 1 | 2 | 3 | 4 | 5

export type DecimalPlacesType = (typeof DECIMAL_PLACES)[number];

/**
 * 스토어의 상태 인터페이스
 */
export interface StoreState {
  // 계산기 관련
  calc: Calculator;
  currentTab: string;
  isMemoryVisible: boolean;
  resultPanelPadding: number;
  paddingOnResult: number;

  // UI 상태 관련
  isShiftPressed: boolean;
  isShiftLocked: boolean;
  inputFocused: boolean;
  initPanel: boolean;
  showButtonAddedLabel: boolean;
  hapticsMode: boolean;
  isAppStarted: boolean;
  showTips: boolean;
  showTipsDialog: boolean;
  
  // 테마/디스플레이 관련
  darkMode: DarkModeType;
  alwaysOnTop: boolean;

  // 계산 결과 관련
  isDeleteRecordConfirmOpen: boolean;
  recordLastScrollPosition: number;
  isSearchOpen: boolean;
  searchKeyword: string;

  // 숫자 표시 관련
  useGrouping: boolean;
  groupingUnit: GroupingUnitType;
  decimalPlaces: DecimalPlacesType;

  // 언어 관련
  useSystemLocale: boolean;
  locale: string;
  userLocale: string;

  // 단위 변환 관련
  selectedCategory: string;
  sourceUnits: { [key: string]: string };
  targetUnits: { [key: string]: string };
  showUnit: boolean;
  showSymbol: boolean;

  // 통화 변환 관련
  currencyConverter: CurrencyConverter;
  sourceCurrency: string;
  targetCurrency: string;

  // 진법 변환 관련
  wordSize: WordSize;
  radixList: RadixType[];
  sourceRadix: RadixType;
  targetRadix: RadixType;
  showRadix: boolean;
  radixType: 'prefix' | 'suffix';

  // 자동 업데이트 관련
  autoUpdate: boolean;

  // Snap 관련
  isSnapFirstRun: boolean;
}

/**
 * 스토어의 액션 인터페이스
 */
export interface StoreActions {
  // 탭 관리
  setCurrentTab(tab: string): void;
  updateCalculatorRadix(): void;

  // Shift 키 관련
  toggleShift(): void;
  enableShift(): void;
  disableShift(): void;
  toggleShiftLock(): void;
  enableShiftLock(): void;
  disableShiftLock(): void;

  // 메모리 표시 관련
  hideMemory(): void;
  showMemoryTemporarily(): void;

  // 숫자 포맷팅 관련
  toFormattedNumber(value: string): string;

  // 진법 변환 관련
  convertIfRadix(value: string): string;
  convertRadix(value: string, fromRadix: RadixType, toRadix: RadixType): string;
  validateRadixNumber(value: string, radix: RadixType): boolean;
  getRadixPrefix(radix: RadixType): string;
  getRadixSuffix(radix: RadixType): string;
  initRecentRadix(): void;
  swapRadixes(): void;
  updateWordSize(value: WordSize): void;

  // 계산 기록 관련
  getLeftSideInRecord(result: CalculationResult, useLineBreak?: boolean): string;
  getRightSideInRecord(result: CalculationResult): string;

  // UI 포커스 관련
  blurElement(): void;
  clickButtonById(buttonId: string): void;
  setInputFocused(): void;
  setInputBlurred(): void;

  // 클립보드 관련
  copyToClipboard(text: string, message: string): void;

  // 단위 변환 관련
  initRecentUnits(): void;
  swapUnits(): void;

  // 다크모드 관련
  isDarkMode(): boolean;
  setDarkMode(mode: DarkModeType): void;
  updateDarkMode(): void;
  toggleDarkMode(): void;

  // 디스플레이 설정 관련
  setAlwaysOnTop(isAlwaysOnTop: boolean): void;
  toggleAlwaysOnTop(): void;
  setInitPanel(isInitPanel: boolean): void;
  toggleInitPanel(): void;

  // 숫자 표시 설정
  toggleUseGrouping(): void;
  setGroupingUnit(digitCount: 3 | 4): void;
  setDecimalPlaces(places: number): void;
  incrementDecimalPlaces(): void;
  decrementDecimalPlaces(): void;

  // UI 표시 설정
  toggleShowUnit(): void;
  toggleShowSymbol(): void;
  toggleShowRadix(): void;
  setRadixType(displayType: 'prefix' | 'suffix'): void;
  toggleButtonAddedLabel(): void;

  // 햅틱 피드백 설정
  setHapticsMode(isEnabled: boolean): void;
  toggleHapticsMode(): void;

  // 통화 변환 관련
  initRecentCurrencies(): void;
  swapCurrencies(): void;

  // 기타
  setDeleteRecordConfirmOpen(value: boolean): void;
  isWideWidth(): boolean;
  isDefaultCalculator(): boolean;
  setSubPageAnimating(value: boolean): void;

  // 자동 업데이트 관련
  setAutoUpdate(value: boolean): void;
  toggleAutoUpdate(): void;
}

/**
 * 스토어 인터페이스
 */
export type Store = StoreDefinition<'store', StoreState, Record<never, never>, StoreActions>;
