/**
 * @file themesStore.ts
 * @description 테마 관련 상태와 액션을 관리하는 스토어입니다.
 */

import { defineStore } from 'pinia';
import { setCssVar, colors, Dark, Platform } from 'quasar';
import { StatusBar, Style } from '@capacitor/status-bar';

import type { ButtonType } from '../types/store';
import { themes, type DarkModeType, type ThemeType, type ThemeColors } from '../constants/ThemesData';

interface ThemesState {
  currentTheme: ThemeType;
  darkMode: DarkModeType;
}

export const useThemesStore = defineStore('themes', {
  state: (): ThemesState => ({
    currentTheme: 'default',
    darkMode: 'system',
  }),

  getters: {
    /**
     * 현재 테마의 색상 객체를 반환하는 getter
     */
    getCurrentThemeColors: (state: ThemesState): ThemeColors => {
      return themes[state.currentTheme] || themes.default;
    },
  },

  actions: {
    /**
     * 테마 설정 액션
     * @param themeName - 설정할 테마 이름
     */
    setTheme(themeName: ThemeType): void {
      if (themes[themeName]) {
        this.currentTheme = themeName;
        this.updateTheme();
      }
    },

    // 다크모드 관련 액션들
    /**
     * 다크모드 설정
     * @param mode - 설정할 다크모드 ('light' | 'dark' | 'system')
     */
    setDarkMode(mode: DarkModeType): void {
      this.darkMode = mode;
      this.updateDarkMode();
      this.updateDarkModeAndTheme();
    },

    /**
     * 다크모드 상태 업데이트
     */
    updateDarkMode(): void {
      if (this.darkMode === 'system') {
        // 시스템 다크모드 상태 감지
        const isDark = this.isDarkMode();
        Dark.set(isDark);
      } else {
        Dark.set(this.darkMode === 'dark');
      }
    },

    /**
     * 다크모드 토글 (light -> dark -> system -> light)
     */
    toggleDarkMode(): void {
      const modes: DarkModeType[] = ['light', 'dark', 'system'];
      const currentIndex = modes.indexOf(this.darkMode);
      const nextMode = modes[(currentIndex + 1) % modes.length] as DarkModeType;
      this.setDarkMode(nextMode);
    },

    /**
     * 현재 다크모드 상태 확인
     * @returns 다크모드 활성화 여부
     */
    isDarkMode(): boolean {
      if (this.darkMode === 'system') {
        // 시스템 다크모드 상태 감지
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isDark;
      } else {
        return this.darkMode === 'dark';
      }
    },

    /**
     * 다크모드 및 테마 업데이트 통합 함수
     */
    updateDarkModeAndTheme(): void {
      const isDark = this.isDarkMode();
      Dark.set(isDark);

      // 테마 업데이트
      this.updateTheme(isDark);
    },

    /**
     * 상태바 배경색을 설정합니다.
     * @param color - 설정할 색상 (HEX 형식)
     */
    async setStatusBarColor(color: string): Promise<void> {
      if (Platform.is.capacitor) {
        try {
          // 상태바가 웹뷰와 겹치지 않게 설정
          await StatusBar.setOverlaysWebView({ overlay: false });
          // 상태바 텍스트 색상 설정
          await StatusBar.setStyle({ style: Style.Dark });
          // 상태바 배경색 설정
          await StatusBar.setBackgroundColor({ color });
          console.log('상태바 설정 완료:', { color, overlay: false });
        } catch (error) {
          console.error('상태바 설정 실패:', error);
        }
      }
    },

    /**
     * 테마 업데이트 함수
     * @param isDark - 다크 모드 활성화 여부
     */
    updateTheme(isDark: boolean = false): void {
      const themeColors: ThemeColors = this.getCurrentThemeColors;

      /**
       * ThemeColors.ui 객체의 색상들을 CSS 변수('ui-primary', 'ui-secondary' 등)로 설정합니다.
       * @param uiColors - 테마의 UI 색상 객체 (ThemeColors['ui'])
       * @param isDarkValue - 다크 모드 활성화 여부
       */
      function setUiVariables(uiColors: ThemeColors['ui'], isDarkValue: boolean): void {
        Object.entries(uiColors).forEach(([key, value]) => {
          const finalColor = isDarkValue ? colors.lighten(value, -30) : value;
          setCssVar(`${key}`, finalColor);
        });
      }

      // UI 관련 색상에 대해서만 CSS 변수를 설정합니다.
      setUiVariables(themeColors.ui, isDark);

      // Quasar 다크 모드 기본 배경색 등을 위해 'dark' CSS 변수를 테마의 ui.dark 값으로 설정합니다.
      // 이는 setUiVariables에서 설정된 'ui-dark'와는 별개로 Quasar에 의해 사용될 수 있습니다.
      if (isDark && 'dark' in themeColors.ui) {
        setCssVar('dark', themeColors.ui.dark);
      }

      // 스크롤바 색상 설정 (ui.primary 기반)
      this.setScrollbarColors(themeColors.ui.primary, isDark);

      // 상태바 배경색을 테마의 primary 색상으로 설정
      this.setStatusBarColor(themeColors.ui.dark);
    },

    /**
     * 스크롤바 색상을 설정합니다.
     * @param primaryColor - 기본 primary 색상
     * @param isDarkValue - 다크 모드 활성화 여부
     */
    setScrollbarColors(primaryColor: string, isDarkValue: boolean): void {
      try {
        // 라이트 모드: primary 색상을 더 밝게 (투명도 적용)
        // 다크 모드: primary 색상을 약간 밝게 (투명도 적용)
        const scrollbarThumbColor = isDarkValue
          ? colors.lighten(primaryColor, 20) // 다크 모드에서는 20% 밝게
          : colors.lighten(primaryColor, -10); // 라이트 모드에서는 10% 어둡게

        // 투명도를 적용한 스크롤바 색상 (rgba 형태로 변환)
        const scrollbarThumbColorWithOpacity = this.hexToRgba(scrollbarThumbColor, isDarkValue ? 0.6 : 0.4);

        // 호버 시 더 진한 색상
        const scrollbarThumbHoverColor = isDarkValue
          ? colors.lighten(primaryColor, 30)
          : colors.lighten(primaryColor, -20);

        const scrollbarThumbHoverColorWithOpacity = this.hexToRgba(scrollbarThumbHoverColor, isDarkValue ? 0.8 : 0.6);

        // CSS 변수 설정
        setCssVar('scrollbar-thumb-color', scrollbarThumbColorWithOpacity);
        setCssVar('scrollbar-thumb-hover-color', scrollbarThumbHoverColorWithOpacity);
        setCssVar('scrollbar-track-color', 'transparent');
      } catch (error) {
        console.error('스크롤바 색상 설정 중 오류 발생:', error);
        // 기본값으로 폴백
        setCssVar('scrollbar-thumb-color', isDarkValue ? 'rgba(159, 159, 159, 0.53)' : 'rgba(0, 0, 0, 0.3)');
        setCssVar('scrollbar-thumb-hover-color', isDarkValue ? 'rgba(159, 159, 159, 0.7)' : 'rgba(0, 0, 0, 0.5)');
        setCssVar('scrollbar-track-color', 'transparent');
      }
    },

    /**
     * HEX 색상을 RGBA로 변환합니다.
     * @param hex - HEX 색상 코드 (#RRGGBB 또는 #RGB)
     * @param alpha - 투명도 (0-1)
     * @returns RGBA 색상 문자열
     */
    hexToRgba(hex: string, alpha: number): string {
      try {
        // # 제거
        const cleanHex = hex.replace('#', '');

        // 3자리 HEX를 6자리로 확장
        const fullHex =
          cleanHex.length === 3
            ? cleanHex
                .split('')
                .map((char) => char + char)
                .join('')
            : cleanHex;

        // RGB 값 추출
        const r = parseInt(fullHex.substring(0, 2), 16);
        const g = parseInt(fullHex.substring(2, 4), 16);
        const b = parseInt(fullHex.substring(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      } catch (error) {
        console.error('HEX to RGBA 변환 중 오류 발생:', error);
        return `rgba(128, 128, 128, ${alpha})`; // 기본 회색으로 폴백
      }
    },

    /**
     * 지정된 타입의 버튼 색상을 반환합니다.
     * @param type - 반환할 버튼의 타입 ('normal', 'important', 'function')
     * @returns {string} HEX 색상 코드
     */
    getButtonColor(type: ButtonType): string {
      const currentThemePalette = this.getCurrentThemeColors;
      return currentThemePalette.button[type];
    },

    /**
     * 현재 활성화된 패널의 텍스트 또는 배경 색상을 반환합니다.
     * @param element - 'text' 또는 'background'
     * @param type - 'normal' 또는 'warning'
     * @param accent - 강조 색상 사용 여부 (텍스트 전용)
     * @returns {string} Quasar 색상 이름 또는 HEX 색상 코드
     */
    getPanelColor(element: 'text' | 'background', type: 'normal' | 'warning', accent: boolean = false): string {
      const currentThemePalette = this.getCurrentThemeColors;

      if (element === 'text') {
        if (type === 'normal') {
          return accent ? currentThemePalette.panel.text.normalAccent : currentThemePalette.panel.text.normal;
        } else {
          // type === 'warning'
          return accent ? currentThemePalette.panel.text.warningAccent : currentThemePalette.panel.text.warning;
        }
      } else {
        // element === 'background'
        return currentThemePalette.panel.background[type];
      }
    },

    /**
     * 현재 활성화된 선택(select) 요소의 텍스트 색상 (다크모드에 따라 dark 또는 light)을 반환합니다.
     * @param type - 'text' 또는 'background'
     * @param isDark - 다크 모드 활성화 여부
     * @returns {string} Quasar 색상 이름 또는 HEX 색상 코드
     */
    getSelectColor(type: 'text' | 'background', isDark: boolean): string {
      const currentThemePalette = this.getCurrentThemeColors;
      return isDark ? currentThemePalette.select[type].dark : currentThemePalette.select[type].light;
    },

    /**
     * Quasar 색상 이름을 HEX 값으로 변환합니다.
     * 오류 발생 또는 유효하지 않은 색상 이름인 경우 #000000을 반환합니다.
     *
     * @param colorName - 변환할 Quasar 색상 이름
     * @returns HEX 색상 값 또는 #000000
     */
    getQuasarColorToHex(colorName: string): string {
      if (!colorName || typeof colorName !== 'string') {
        return '#000000';
      }
      try {
        const hexColor = colors.getPaletteColor(colorName);
        // getPaletteColor가 유효하지 않은 이름을 받으면 undefined를 반환하거나,
        // 때로는 입력값을 그대로 반환할 수 있으므로, 반환값이 실제 hex 코드 형식인지 간단히 확인합니다.
        // 더 정확한 hex 검증이 필요하면 정규식을 사용할 수 있습니다.
        if (hexColor && typeof hexColor === 'string' && /^#([0-9A-Fa-f]{3}){1,2}$/.test(hexColor)) {
          return hexColor;
        } else {
          console.warn(`Invalid color name or no hex value found for: ${colorName}. Returning #000000.`);
          return '#000000';
        }
      } catch (error) {
        console.error(`Error converting color name ${colorName} to hex: ${error}. Returning #000000.`);
        return '#000000';
      }
    },

    /**
     * 애플리케이션 초기화 시 테마와 다크모드를 설정합니다.
     * 이 함수는 앱이 시작될 때 한 번 호출되어야 합니다.
     */
    initializeTheme(): void {
      // 시스템 다크모드 변경 감지 리스너 등록
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = (): void => {
          // 시스템 모드일 때만 업데이트
          if (this.darkMode === 'system') {
            this.updateDarkModeAndTheme();
          }
        };

        // 초기 설정
        this.updateDarkModeAndTheme();

        // 시스템 테마 변경 감지
        mediaQuery.addEventListener('change', handleSystemThemeChange);
      } else {
        // 브라우저 환경이 아닌 경우 기본 설정만 적용
        this.updateDarkModeAndTheme();
      }

      // Capacitor 환경에서 상태바 겹침 방지 설정
      if (Platform.is.capacitor) {
        StatusBar.setOverlaysWebView({ overlay: false }).catch((error) => {
          console.error('상태바 겹침 방지 설정 실패:', error);
        });
      }
    },
  },

  persist: true,
});

// 타입들을 다시 export (하위 호환성을 위해)
export type { DarkModeType, ThemeType, ThemeColors };
export { themes };
