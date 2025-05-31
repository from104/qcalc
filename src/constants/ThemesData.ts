/**
 * @file ThemesData.ts
 * @description 테마 관련 타입 정의와 테마 데이터를 관리하는 파일입니다.
 */

// 다크모드 타입 정의
export type DarkModeType = 'light' | 'dark' | 'system';

// 테마 타입 정의
export type ThemeType = 'default' | 'forest' | 'ocean' | 'autumn' | 'amethyst' | 'slate' | 'highcontrast';

// 테마 색상 인터페이스 정의
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

// 테마 팔레트 정의 (ThemeColors 인터페이스에 맞게 수정)
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
      primary: '#355e3b', // #355e3b
      secondary: '#6b8e23', // #6b8e23
      accent: '#5a8a62', // primary를 30% 밝게: #355e3b -> #5a8a62
      positive: '#4e944f', // #4e944f
      negative: '#a0522d', // #a0522d
      info: '#7fb77e', // #7fb77e
      warning: '#e2c275', // #e2c275
      dark: '#11160d', // #11160d
    },
    button: {
      important: '#355e3b', // #355e3b
      function: '#4F8B50', // #4F8B50
      normal: '#69b36a', // #69b36a
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
      primary: '#176087', // #176087
      secondary: '#4ecdc4', // #4ecdc4
      accent: '#3d8bb5', // primary를 30% 밝게: #176087 -> #3d8bb5
      positive: '#1ca9c9', // #1ca9c9
      negative: '#ff6b6b', // #ff6b6b
      info: '#34a9e0', // #34a9e0
      warning: '#ffe66d', // #ffe66d
      dark: '#0f1e21', // #0f1e21
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
      primary: '#A0522D', // #A0522D
      secondary: '#ffb562', // #ffb562
      accent: '#d07a54', // primary를 30% 밝게: #A0522D -> #d07a54
      positive: '#ff7f51', // #ff7f51
      negative: '#a72608', // #a72608
      info: '#fca311', // #fca311
      warning: '#f7b267', // #f7b267
      dark: '#1d0f0f', // #1d0f0f
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
      primary: '#6a1b9a', // #6a1b9a
      secondary: '#ab47bc', // #ab47bc
      accent: '#9548c8', // primary를 30% 밝게: #6a1b9a -> #9548c8
      positive: '#4caf50', // #4caf50
      negative: '#f44336', // #f44336
      info: '#2196f3', // #2196f3
      warning: '#ff9800', // #ff9800
      dark: '#12051a', // #12051a
    },
    button: {
      important: '#6a1b9a', // #6a1b9a
      function: '#8e24aa', // #8e24aa
      normal: '#ab47bc', // #ab47bc
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
      primary: '#546e7a', // #546e7a
      secondary: '#78909c', // #78909c
      accent: '#7a95a3', // primary를 30% 밝게: #546e7a -> #7a95a3
      positive: '#4caf50', // #4caf50
      negative: '#f44336', // #f44336
      info: '#2196f3', // #2196f3
      warning: '#ff9800', // #ff9800
      dark: '#263238', // #263238
    },
    button: {
      important: '#546e7a', // #546e7a
      function: '#455a64', // #455a64
      normal: '#78909c', // #78909c
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
      primary: '#a52a2a', // #a52a2a
      secondary: '#ffff00', // #ffff00
      accent: '#d55555', // primary를 30% 밝게: #a52a2a -> #d55555
      positive: '#00ff00', // #00ff00
      negative: '#ff0000', // #ff0000
      info: '#0000ff', // #0000ff
      warning: '#ffa500', // #ffa500
      dark: '#0f0f0f', // #0f0f0f
    },
    button: {
      important: '#a52a2a', // #a52a2a
      function: '#008080', // #008080
      normal: '#808000', // #808000
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
