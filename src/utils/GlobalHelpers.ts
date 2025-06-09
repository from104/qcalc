/**
 * @file GlobalHelpers.ts
 * @description 전역적으로 사용되는 유틸리티 함수들을 제공합니다.
 */

import { Screen } from 'quasar';

/**
 * 전역 객체에 불변 속성을 정의하는 유틸리티 함수
 * @param obj - 속성을 정의할 객체
 * @param key - 속성 키
 * @param value - 속성 값
 */
export function defineImmutableProperty<T extends object, K extends PropertyKey>(obj: T, key: K, value: unknown): void {
  Object.defineProperty(obj, key, { value, writable: false, configurable: false, enumerable: true });
}

/**
 * 화면이 세로 모드인지 확인합니다.
 * @returns {boolean} 세로 모드 여부
 */
export const isPortrait = (): boolean => {
  return Screen.width < Screen.height;
};

/**
 * 화면이 가로 모드인지 확인합니다.
 * @returns {boolean} 가로 모드 여부
 */
export const isLandscape = (): boolean => {
  return !isPortrait();
};

/**
 * 화면이 넓은 너비인지 확인합니다.
 * @returns {boolean} 넓은 너비 여부
 */
export const isWideWidth = (): boolean => {
  const $g = globalThis.window.globalVars;
  if ($g.isTablet) {
    // 태블릿은 가로 모드만 지원
    return isLandscape();
  } else if ($g.isPhone) {
    // 폰은 넓은 너비 지원 안함
    return false;
  } else {
    // 데스크탑은 넓은 너비 여부 확인
    return Screen.width >= 330 * 2;
  }
};

/**
 * 현재 포커스된 요소의 포커스를 해제합니다.
 */
export const blurElement = (): void => {
  const element = document.activeElement as HTMLElement;
  element?.blur();
};

/**
 * 주어진 ID를 가진 버튼을 클릭합니다.
 * @param {string} buttonId - 클릭할 버튼의 ID
 */
export const clickButtonById = (buttonId: string): void => {
  const button = document.getElementById(buttonId);
  if (button) {
    button.click();
  }
};

// 개발 모드에서만 콘솔 로그 출력
export const logDev = (message: string, ...args: unknown[]): void => {
  if (import.meta.env.DEV) {
    console.log(message, ...args);
  }
};