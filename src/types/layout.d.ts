/**
 * @file layout.d.ts
 * @description 레이아웃 컴포넌트에서 사용되는 공통 타입과 인터페이스를 정의합니다.
 *              탭, 서브페이지 설정, 버튼 등의 구조를 포함하여
 *              레이아웃 관련 기능을 구현하는 데 필요한 타입 정보를 제공합니다.
 */

import type { ComputedRef } from 'vue';

/**
 * 탭 인터페이스
 */
export interface Tab {
  name: string;
  title: ComputedRef<string> | string;
  icon: string;
  component: unknown;
}

/**
 * 서브페이지 버튼 인터페이스
 */
export interface SubPageButton {
  label: string;
  icon: string;
  path: string;
  tooltip: ComputedRef<string>;
}

/**
 * 서브페이지 설정 버튼 인터페이스
 */
export interface SubPageButtonConfig {
  icon: string;
  disabled: ComputedRef<boolean>;
  action: () => void;
  tooltip: ComputedRef<string>;
}

/**
 * 서브페이지 설정 인터페이스
 */
export interface SubPageConfigItem {
  component: unknown;
  title: ComputedRef<string>;
  showClose?: boolean;
  buttons?: SubPageButtonConfig[];
}

/**
 * 서브페이지 설정 전체 인터페이스
 */
export interface SubPageConfig {
  [key: string]: SubPageConfigItem;
}
