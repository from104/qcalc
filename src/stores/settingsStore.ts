/**
 * @file settingsStore.ts
 * @description 설정 관련 상태와 액션을 관리하는 스토어입니다.
 */

import { defineStore } from 'pinia';
import { Dark, setCssVar, colors } from 'quasar';

import type { DecimalPlacesType, GroupingUnitType, ButtonType } from '../types/store';
import { DECIMAL_PLACES } from '../types/store.d';

type DarkModeType = 'light' | 'dark' | 'system';

// 추가: 테마 타입 정의
export type ThemeType = 'default' | 'forest' | 'ocean' | 'autumn' | 'amethyst' | 'slate' | 'highcontrast';

// 추가: 테마 색상 인터페이스 정의
export interface ThemeColors {
  ui: {
    primary: string;
    secondary: string;
    accent: string;
    positive: string;
    negative: string;
    info: string;
    warning: string;
    dark: string; // 다크 모드 배경색 등
  };
  button: {
    important: string;
    function: string;
    normal: string;
  };
  panel: {
    text: {
      normal: string;
      warning: string;
      normalAccent: string;
      warningAccent: string;
    };
    background: {
      normal: string;
      warning: string;
    };
  };
  select: {
    text: {
      light: string;
      dark: string;
    };
    background: {
      light: string;
      dark: string;
    };
  };
}

// 추가: 테마 팔레트 정의 (ThemeColors 인터페이스에 맞게 수정)
export const themes: Record<ThemeType, ThemeColors> = {
  default: {
    ui: {
      primary: '#16743f', // 기존 primary-light
      secondary: '#4abf89', // 기존 secondary-light
      accent: '#3fce97', // primary를 30% 밝게: #16743f -> #3fce97
      positive: '#1d8fb6', // 기존 positive-light
      negative: '#c71818', // 기존 negative-light
      info: '#34a9e0', // 기존 info-light
      warning: '#d1a527', // 기존 warning-light
      dark: '#1d1d1d', // 기존 dark
    },
    button: {
      important: '#cb9247',
      function: '#1d8fb6',
      normal: '#5e9e7d',
    },
    panel: {
      text: {
        normal: 'light-green-8',
        warning: 'deep-orange-5',
        normalAccent: 'light-green-10',
        warningAccent: 'deep-orange-8',
      },
      background: {
        normal: 'light-green-3',
        warning: 'deep-orange-2',
      },
    },
    select: {
      text: {
        light: 'primary',
        dark: 'grey-1',
      },
      background: {
        light: 'blue-grey-2',
        dark: 'blue-grey-6',
      },
    },
  },
  forest: {
    ui: {
      primary: '#355e3b',
      secondary: '#6b8e23',
      accent: '#5a8a62', // primary를 30% 밝게: #355e3b -> #5a8a62
      positive: '#4e944f',
      negative: '#a0522d',
      info: '#7fb77e',
      warning: '#e2c275',
      dark: '#11160d',
    },
    button: {
      important: '#355e3b',
      function: '#4F8B50',
      normal: '#69b36a',
    },
    panel: {
      text: {
        normal: 'green-8',
        warning: 'purple-8',
        normalAccent: 'green-10',
        warningAccent: 'purple-10',
      },
      background: {
        normal: 'green-3',
        warning: 'purple-3',
      },
    },
    select: {
      text: {
        light: 'green-10',
        dark: 'grey-1',
      },
      background: {
        light: 'green-2',
        dark: 'green-9',
      },
    },
  },
  ocean: {
    ui: {
      primary: '#176087',
      secondary: '#4ecdc4',
      accent: '#3d8bb5', // primary를 30% 밝게: #176087 -> #3d8bb5
      positive: '#1ca9c9',
      negative: '#ff6b6b',
      info: '#34a9e0',
      warning: '#ffe66d',
      dark: '#0f1e21',
    },
    button: {
      important: '#0078b8', // #0078b8
      function: '#3886ba', // #3886ba
      normal: '#5ca6cd', // #5ca6cd
    },
    panel: {
      text: {
        normal: 'light-blue-8',
        warning: 'amber-9',
        normalAccent: 'light-blue-10',
        warningAccent: 'amber-10',
      },
      background: {
        normal: 'light-blue-3',
        warning: 'amber-3',
      },
    },
    select: {
      text: {
        light: 'light-blue-10',
        dark: 'light-blue-1',
      },
      background: {
        light: 'light-blue-2',
        dark: 'light-blue-9',
      },
    },
  },
  autumn: {
    ui: {
      primary: '#A0522D',
      secondary: '#ffb562',
      accent: '#d07a54', // primary를 30% 밝게: #A0522D -> #d07a54
      positive: '#ff7f51',
      negative: '#a72608',
      info: '#fca311',
      warning: '#f7b267',
      dark: '#1d0f0f',
    },
    button: {
      important: '#754520', // #8a5226
      function: '#9c6d4a', // #b88157
      normal: '#c68f63', // #e9a875
    },
    panel: {
      text: {
        normal: 'brown-7',
        warning: 'blue-8',
        normalAccent: 'brown-9',
        warningAccent: 'blue-10',
      },
      background: {
        normal: 'brown-3',
        warning: 'blue-3',
      },
    },
    select: {
      text: {
        light: 'brown-10',
        dark: 'brown-1',
      },
      background: {
        light: 'brown-2',
        dark: 'brown-9',
      },
    },
  },
  amethyst: {
    ui: {
      primary: '#6a1b9a',
      secondary: '#ab47bc',
      accent: '#9548c8', // primary를 30% 밝게: #6a1b9a -> #9548c8
      positive: '#4caf50',
      negative: '#f44336',
      info: '#2196f3',
      warning: '#ff9800',
      dark: '#12051a',
    },
    button: {
      important: '#6a1b9a',
      function: '#8e24aa',
      normal: '#ab47bc',
    },
    panel: {
      text: {
        normal: 'deep-purple-7',
        warning: 'yellow-9',
        normalAccent: 'deep-purple-9',
        warningAccent: 'yellow-10',
      },
      background: {
        normal: 'deep-purple-3',
        warning: 'yellow-3',
      },
    },
    select: {
      text: {
        light: 'deep-purple-10',
        dark: 'deep-purple-1',
      },
      background: {
        light: 'deep-purple-2',
        dark: 'deep-purple-9',
      },
    },
  },
  slate: {
    ui: {
      primary: '#546e7a',
      secondary: '#78909c',
      accent: '#7a95a3', // primary를 30% 밝게: #546e7a -> #7a95a3
      positive: '#4caf50',
      negative: '#f44336',
      info: '#2196f3',
      warning: '#ff9800',
      dark: '#263238',
    },
    button: {
      important: '#546e7a',
      function: '#455a64',
      normal: '#78909c',
    },
    panel: {
      text: {
        normal: 'blue-grey-7',
        warning: 'brown-8',
        normalAccent: 'blue-grey-9',
        warningAccent: 'brown-10',
      },
      background: {
        normal: 'blue-grey-3',
        warning: 'brown-3',
      },
    },
    select: {
      text: {
        light: 'blue-grey-10',
        dark: 'blue-grey-1',
      },
      background: {
        light: 'blue-grey-2',
        dark: 'blue-grey-8',
      },
    },
  },
  highcontrast: {
    ui: {
      primary: '#a52a2a',
      secondary: '#ffff00',
      accent: '#d55555', // primary를 30% 밝게: #a52a2a -> #d55555
      positive: '#00ff00',
      negative: '#ff0000',
      info: '#0000ff',
      warning: '#ffa500',
      dark: '#0f0f0f',
    },
    button: {
      important: '#a52a2a', // 붉은 계열 색상 (갈색)
      function: '#008080', // 50% 어둡게 조정된 시안색
      normal: '#808000', // 노란색 계열 색상
    },
    panel: {
      text: {
        normal: 'white',
        warning: 'black',
        normalAccent: 'grey-4',
        warningAccent: 'black',
      },
      background: {
        normal: 'black',
        warning: 'yellow',
      },
    },
    select: {
      text: {
        light: 'black',
        dark: 'white',
      },
      background: {
        light: 'grey-4',
        dark: 'black',
      },
    },
  },
};

interface SettingsState {
  darkMode: DarkModeType;
  currentTheme: ThemeType; // 현재 테마 상태 추가
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

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    darkMode: 'system',
    currentTheme: 'default', // 기본 테마 설정
    alwaysOnTop: false,
    initPanel: false,
    showButtonAddedLabel: true,
    hapticsMode: true,
    useGrouping: true,
    groupingUnit: 3,
    decimalPlaces: -1,
    useSystemLocale: true,
    locale: '',
    userLocale: '',
    autoUpdate: true,
  }),

  getters: {
    getDecimalPlaces: (state: SettingsState) => DECIMAL_PLACES[state.decimalPlaces ?? -1] ?? -1,
    // 현재 테마의 색상 객체를 반환하는 getter 추가
    getCurrentThemeColors: (state: SettingsState): ThemeColors => {
      return themes[state.currentTheme] || themes.default;
    },
  },

  actions: {
    // 테마/디스플레이 설정
    setDarkMode(mode: DarkModeType): void {
      this.darkMode = mode;
      this.updateDarkMode();
      this.updateDarkModeAndTheme();
    },

    // 다크모드 상태 업데이트
    updateDarkMode(): void {
      if (this.darkMode === 'system') {
        // 시스템 다크모드 상태 감지
        const isDark = this.isDarkMode();
        Dark.set(isDark);
      } else {
        Dark.set(this.darkMode === 'dark');
      }
    },

    toggleDarkMode(): void {
      const modes: DarkModeType[] = ['light', 'dark', 'system'];
      const currentIndex = modes.indexOf(this.darkMode);
      const nextMode = modes[(currentIndex + 1) % modes.length] as DarkModeType;
      this.setDarkMode(nextMode);
    },

    isDarkMode(): boolean {
      if (this.darkMode === 'system') {
        // 시스템 다크모드 상태 감지
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isDark;
      } else {
        return this.darkMode === 'dark';
      }
    },
    // 추가: 테마 설정 액션
    setTheme(themeName: ThemeType): void {
      if (themes[themeName]) {
        this.currentTheme = themeName;
        this.updateDarkModeAndTheme();
      }
    },

    // 추가: 다크모드 및 테마 업데이트 통합 함수
    updateDarkModeAndTheme(): void {
      const isDark = this.isDarkMode();
      Dark.set(isDark);

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
     * @returns {string} Quasar 색상 이름 또는 HEX 색상 코드
     */
    getSelectColor(type: 'text' | 'background'): string {
      const isDark = this.isDarkMode();
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

    setAlwaysOnTop(isAlwaysOnTop: boolean): void {
      this.alwaysOnTop = isAlwaysOnTop;
      window.electron.setAlwaysOnTop(this.alwaysOnTop);
    },

    toggleAlwaysOnTop(): void {
      this.setAlwaysOnTop(!this.alwaysOnTop);
    },

    setInitPanel(isInitPanel: boolean): void {
      this.initPanel = isInitPanel;
    },

    toggleInitPanel(): void {
      this.setInitPanel(!this.initPanel);
    },

    toggleButtonAddedLabel(): void {
      this.showButtonAddedLabel = !this.showButtonAddedLabel;
    },

    // 햅틱 피드백 설정
    setHapticsMode(isEnabled: boolean): void {
      this.hapticsMode = isEnabled;
    },

    toggleHapticsMode(): void {
      this.setHapticsMode(!this.hapticsMode);
    },

    // 숫자 표시 설정
    toggleUseGrouping(): void {
      this.useGrouping = !this.useGrouping;
    },

    setGroupingUnit(digitCount: GroupingUnitType): void {
      this.groupingUnit = digitCount;
    },

    setDecimalPlaces(places: DecimalPlacesType): void {
      this.decimalPlaces = places;
    },

    incrementDecimalPlaces(): void {
      this.decimalPlaces = Math.min(this.decimalPlaces + 1, Math.max(...Object.keys(DECIMAL_PLACES).map(Number)));
    },

    decrementDecimalPlaces(): void {
      this.decimalPlaces = Math.max(this.decimalPlaces - 1, Math.min(...Object.keys(DECIMAL_PLACES).map(Number)));
    },

    // 자동 업데이트 관련
    setAutoUpdate(value: boolean): void {
      this.autoUpdate = value;
    },

    toggleAutoUpdate(): void {
      this.setAutoUpdate(!this.autoUpdate);
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
    },
  },

  persist: true,
});
