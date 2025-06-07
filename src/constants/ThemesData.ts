/**
 * @file ThemesData.ts
 * @description 테마 관련 타입 정의와 테마 데이터를 관리하는 파일입니다.
 */

// 다크모드 타입 정의
export type DarkModeType = 'light' | 'dark' | 'system';

// 테마 타입 정의
export type ThemeType = 'default' | 'azalea' | 'autumn' | 'forest' | 'ocean' | 'amethyst' | 'slate' | 'highcontrast';

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
      primary: 'green-10', // #16743f
      secondary: 'green-6', // #04b060
      accent: 'light-green-5', // #3fce97
      positive: 'cyan-7', // #1d8fb6
      negative: 'red-9', // #c71818
      info: 'light-blue-5', // #34a9e0
      warning: 'amber-7', // #d1a527
    },
    button: {
      important: 'deep-orange-8', // #cb9247
      function: 'cyan-8', // #1d8fb6
      normal: 'green-8', // #5e9e7d
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
        light: 'green-2',
        dark: 'green-8',
      },
    },
  },
  azalea: {
    name: {
      ko: '진달래',
      en: 'Azalea',
    },
    ui: {
      primary: 'pink-8', // #c2185b
      secondary: 'pink-4', // #f06292
      accent: 'pink-6', // #e91e63
      positive: 'green-6', // #4caf50
      negative: 'red-6', // #f44336
      info: 'blue-6', // #2196f3
      warning: 'orange-6', // #ff9800
    },
    button: {
      important: 'pink-8', // #c2185b
      function: 'pink-6', // #e91e63
      normal: 'pink-4', // #f06292
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
        dark: 'pink-7',
      },
    },
  },
  autumn: {
    name: {
      ko: '가을',
      en: 'Autumn',
    },
    ui: {
      primary: 'brown-7', // #A0522D
      secondary: 'orange-4', // #ffb562
      accent: 'brown-5', // #d07a54
      positive: 'deep-orange-5', // #ff7f51
      negative: 'red-10', // #a72608
      info: 'amber-6', // #fca311
      warning: 'amber-5', // #f7b267
    },
    button: {
      important: 'brown-8', // #754520
      function: 'brown-6', // #9c6d4a
      normal: 'brown-4', // #c68f63
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
      primary: 'green-9', // #355e3b
      secondary: 'green-7', // #6b8e23
      accent: 'green-7', // #5a8a62
      positive: 'green-6', // #4e944f
      negative: 'brown-7', // #a0522d
      info: 'green-5', // #7fb77e
      warning: 'amber-5', // #e2c275
    },
    button: {
      important: 'green-9', // #355e3b
      function: 'green-7', // #4F8B50
      normal: 'green-5', // #69b36a
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
        dark: 'green-7',
      },
    },
  },
  ocean: {
    name: {
      ko: '바다',
      en: 'Ocean',
    },
    ui: {
      primary: 'blue-8', // #176087
      secondary: 'teal-4', // #4ecdc4
      accent: 'blue-6', // #3d8bb5
      positive: 'cyan-6', // #1ca9c9
      negative: 'red-5', // #ff6b6b
      info: 'light-blue-5', // #34a9e0
      warning: 'yellow-4', // #ffe66d
    },
    button: {
      important: 'blue-8', // #0078b8
      function: 'blue-6', // #3886ba
      normal: 'blue-4', // #5ca6cd
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
        dark: 'light-blue-7',
      },
    },
  },
  amethyst: {
    name: {
      ko: '자수정',
      en: 'Amethyst',
    },
    ui: {
      primary: 'purple-8', // #6a1b9a
      secondary: 'purple-5', // #ab47bc
      accent: 'purple-6', // #9548c8
      positive: 'green-6', // #4caf50
      negative: 'red-6', // #f44336
      info: 'blue-6', // #2196f3
      warning: 'orange-6', // #ff9800
    },
    button: {
      important: 'purple-8', // #6a1b9a
      function: 'purple-6', // #8e24aa
      normal: 'purple-5', // #ab47bc
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
        dark: 'deep-purple-7',
      },
    },
  },
  slate: {
    name: {
      ko: '잿빛',
      en: 'Slate',
    },
    ui: {
      primary: 'blue-grey-7', // #546e7a
      secondary: 'blue-grey-5', // #78909c
      accent: 'blue-grey-5', // #7a95a3
      positive: 'green-6', // #4caf50
      negative: 'red-6', // #f44336
      info: 'blue-6', // #2196f3
      warning: 'orange-6', // #ff9800
    },
    button: {
      important: 'blue-grey-8', // #455a64
      function: 'blue-grey-7', // #546e7a
      normal: 'blue-grey-5', // #78909c
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
        dark: 'blue-grey-7',
      },
    },
  },
  highcontrast: {
    name: {
      ko: '고대비',
      en: 'High Contrast',
    },
    ui: {
      primary: 'red', // #a52a2a
      secondary: 'yellow-8', // #ffff00
      accent: 'red-7', // #d55555
      positive: 'green-8', // #00ff00
      negative: 'red', // #ff0000
      info: 'blue', // #0000ff
      warning: 'orange-5', // #ffa500
    },
    button: {
      important: 'orange-8', // #a52a2a
      function: 'teal-7', // #008080
      normal: 'purple-7', // #808000
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
