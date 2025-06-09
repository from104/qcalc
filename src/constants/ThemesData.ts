/**
 * @file ThemesData.ts
 * @description 테마 관련 타입 정의와 테마 데이터를 관리하는 파일입니다.
 */

// 다크모드 타입 정의
export type DarkModeType = 'light' | 'dark' | 'system';

// 테마 타입 정의
export type ThemeType = 'default' | 'azalea' | 'autumn' | 'forest' | 'ocean' | 'amethyst' | 'slate' | 'grey' | 'highcontrast';

// 테마 이름 다국어 인터페이스 정의
export interface ThemeName {
  ko: string;
  en: string;
}

// 테마 색상 인터페이스 정의 (dark 제거)
export interface ThemeColors {
  name: ThemeName;
  ui: {
    primary: string;
    secondary: string;
    accent: string;
    positive: string;
    negative: string;
    info: string;
    warning: string;
    // dark는 primary 기반으로 90% 어둡게 동적 계산됨
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

// 테마 팔레트 정의 (dark 속성 제거)
export const themes: Record<ThemeType, ThemeColors> = {
  default: {
    name: {
      ko: '기본',
      en: 'Default',
    },
    ui: {
      primary: 'green-10',
      secondary: 'green-6',
      accent: 'light-green-5',
      positive: 'cyan-7',
      negative: 'red-9',
      info: 'light-blue-5',
      warning: 'amber-7',
    },
    button: {
      important: 'orange-8',
      function: 'cyan-7',
      normal: 'grey-6',
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
        light: 'grey-10',
        dark: 'grey-1',
      },
      background: {
        light: 'grey-4',
        dark: 'grey-9',
      },
    },
  },
  azalea: {
    name: {
      ko: '진달래',
      en: 'Azalea',
    },
    ui: {
      primary: 'pink-8',
      secondary: 'pink-4',
      accent: 'pink-6',
      positive: 'green-6',
      negative: 'red-6',
      info: 'blue-6',
      warning: 'orange-6',
    },
    button: {
      important: 'pink-8',
      function: 'pink-6',
      normal: 'pink-4',
    },
    panel: {
      text: {
        normal: 'pink-8',
        warning: 'cyan-8',
        normalAccent: 'pink-10',
        warningAccent: 'cyan-10',
      },
      background: {
        normal: 'pink-2',
        warning: 'cyan-2',
      },
    },
    select: {
      text: {
        light: 'pink-10',
        dark: 'pink-1',
      },
      background: {
        light: 'pink-1',
        dark: 'pink-9',
      },
    },
  },
  autumn: {
    name: {
      ko: '가을',
      en: 'Autumn',
    },
    ui: {
      primary: 'brown-7',
      secondary: 'orange-4',
      accent: 'brown-5',
      positive: 'deep-orange-5',
      negative: 'red-10',
      info: 'amber-6',
      warning: 'amber-5',
    },
    button: {
      important: 'brown-8',
      function: 'brown-6',
      normal: 'brown-4',
    },
    panel: {
      text: {
        normal: 'brown-7',
        warning: 'blue-8',
        normalAccent: 'brown-9',
        warningAccent: 'blue-10',
      },
      background: {
        normal: 'brown-2',
        warning: 'blue-2',
      },
    },
    select: {
      text: {
        light: 'brown-10',
        dark: 'brown-1',
      },
      background: {
        light: 'brown-1',
        dark: 'brown-7',
      },
    },
  },
  forest: {
    name: {
      ko: '숲',
      en: 'Forest',
    },
    ui: {
      primary: 'green-9',
      secondary: 'green-7',
      accent: 'green-7',
      positive: 'green-6',
      negative: 'brown-7',
      info: 'green-5',
      warning: 'amber-5',
    },
    button: {
      important: 'green-9',
      function: 'green-7',
      normal: 'green-5',
    },
    panel: {
      text: {
        normal: 'green-8',
        warning: 'purple-8',
        normalAccent: 'green-10',
        warningAccent: 'purple-10',
      },
      background: {
        normal: 'green-2',
        warning: 'purple-2',
      },
    },
    select: {
      text: {
        light: 'green-10',
        dark: 'grey-1',
      },
      background: {
        light: 'green-1',
        dark: 'green-9',
      },
    },
  },
  ocean: {
    name: {
      ko: '바다',
      en: 'Ocean',
    },
    ui: {
      primary: 'blue-8',
      secondary: 'teal-4',
      accent: 'blue-6',
      positive: 'cyan-6',
      negative: 'red-5',
      info: 'light-blue-5',
      warning: 'yellow-4',
    },
    button: {
      important: 'blue-8',
      function: 'blue-6',
      normal: 'blue-4',
    },
    panel: {
      text: {
        normal: 'light-blue-8',
        warning: 'amber-9',
        normalAccent: 'light-blue-10',
        warningAccent: 'amber-10',
      },
      background: {
        normal: 'light-blue-2',
        warning: 'amber-2',
      },
    },
    select: {
      text: {
        light: 'light-blue-10',
        dark: 'light-blue-1',
      },
      background: {
        light: 'light-blue-1',
        dark: 'light-blue-9',
      },
    },
  },
  amethyst: {
    name: {
      ko: '자수정',
      en: 'Amethyst',
    },
    ui: {
      primary: 'purple-8',
      secondary: 'purple-5',
      accent: 'purple-6',
      positive: 'green-6',
      negative: 'red-6',
      info: 'blue-6',
      warning: 'orange-6',
    },
    button: {
      important: 'purple-8',
      function: 'purple-6',
      normal: 'purple-5',
    },
    panel: {
      text: {
        normal: 'deep-purple-7',
        warning: 'yellow-9',
        normalAccent: 'deep-purple-9',
        warningAccent: 'yellow-10',
      },
      background: {
        normal: 'deep-purple-2',
        warning: 'yellow-2',
      },
    },
    select: {
      text: {
        light: 'deep-purple-10',
        dark: 'deep-purple-1',
      },
      background: {
        light: 'deep-purple-1',
        dark: 'deep-purple-9',
      },
    },
  },
  slate: {
    name: {
      ko: '잿빛',
      en: 'Slate',
    },
    ui: {
      primary: 'blue-grey-7',
      secondary: 'blue-grey-5',
      accent: 'blue-grey-5',
      positive: 'green-6',
      negative: 'red-6',
      info: 'blue-6',
      warning: 'orange-6',
    },
    button: {
      important: 'blue-grey-8',
      function: 'blue-grey-7',
      normal: 'blue-grey-5',
    },
    panel: {
      text: {
        normal: 'blue-grey-7',
        warning: 'brown-8',
        normalAccent: 'blue-grey-9',
        warningAccent: 'brown-10',
      },
      background: {
        normal: 'blue-grey-2',
        warning: 'brown-2',
      },
    },
    select: {
      text: {
        light: 'blue-grey-10',
        dark: 'blue-grey-1',
      },
      background: {
        light: 'blue-grey-1',
        dark: 'blue-grey-9',
      },
    },
  },
  grey: {
    name: {
      ko: '회색',
      en: 'Grey',
    },
    ui: {
      primary: 'grey-9',
      secondary: 'grey-7',
      accent: 'grey-5',
      positive: 'green-6',
      negative: 'red-6',
      info: 'blue-6',
      warning: 'orange-6',
    },
    button: {
      important: 'grey-8',
      function: 'grey-7',
      normal: 'grey-6',
    },
    panel: {
      text: {
        normal: 'grey-8',
        warning: 'brown-8',
        normalAccent: 'grey-10',
        warningAccent: 'brown-10',
      },
      background: {
        normal: 'grey-4',
        warning: 'brown-2',
      },
    },
    select: {
      text: {
        light: 'grey-10',
        dark: 'grey-1',
      },
      background: {
        light: 'grey-3',
        dark: 'grey-9',
      },
    },
  },
  highcontrast: {
    name: {
      ko: '고대비',
      en: 'High Contrast',
    },
    ui: {
      primary: 'red',
      secondary: 'yellow-8',
      accent: 'red-7',
      positive: 'green-8',
      negative: 'red',
      info: 'blue',
      warning: 'orange-5',
    },
    button: {
      important: 'orange-8',
      function: 'teal-7',
      normal: 'purple-7',
    },
    panel: {
      text: {
        normal: 'grey-7',
        warning: 'grey-9',
        normalAccent: 'grey-10',
        warningAccent: 'grey-7',
      },
      background: {
        normal: 'yellow-2',
        warning: 'purple-2',
      },
    },
    select: {
      text: {
        light: 'grey-10',
        dark: 'grey-4',
      },
      background: {
        light: 'red-2',
        dark: 'red-6',
      },
    },
  },
};
