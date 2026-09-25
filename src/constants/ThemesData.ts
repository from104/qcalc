/**
 * @file ThemesData.ts
 * @description 테마 관련 타입 정의와 테마 데이터를 관리하는 파일입니다.
 */

// 다크모드 타입 정의
export type DarkModeType = 'light' | 'dark' | 'system';

// 테마 타입 정의
export type ThemeType =
  | 'default'
  | 'gold'
  | 'redled'
  | 'navy'
  | 'teal'
  | 'chocolate'
  | 'yellow'
  | 'slate'
  | 'highcontrast';

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
  // Braun ET66(1987, 디터 람스) 풍 — 검정·짙은 회색·갈색에 노란 = 키, 회색 액정
  default: {
    name: {
      ko: '기본',
      en: 'Default',
    },
    ui: {
      primary: 'grey-10',
      secondary: 'grey-8',
      accent: 'yellow-8',
      positive: 'green-7',
      negative: 'red-8',
      info: 'blue-grey-6',
      warning: 'amber-8',
    },
    button: {
      important: 'yellow-8',
      function: 'brown-6',
      normal: 'grey-9',
    },
    panel: {
      text: {
        normal: 'grey-10',
        warning: 'brown-10',
        normalAccent: 'grey-10',
        warningAccent: 'brown-10',
      },
      background: {
        normal: 'grey-4',
        warning: 'amber-2',
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

  // HP-12C(1981) 풍 — 짙은 갈색·금색 판, 주황 포인트, 회색 액정
  gold: {
    name: {
      ko: '골드 파이낸셜',
      en: 'Gold Financial',
    },
    ui: {
      primary: 'brown-10',
      secondary: 'amber-8',
      accent: 'orange-8',
      positive: 'green-7',
      negative: 'red-8',
      info: 'blue-7',
      warning: 'amber-8',
    },
    button: {
      important: 'orange-9',
      function: 'amber-8',
      normal: 'brown-9',
    },
    panel: {
      text: {
        normal: 'brown-10',
        warning: 'brown-10',
        normalAccent: 'brown-10',
        warningAccent: 'brown-10',
      },
      background: {
        normal: 'grey-4',
        warning: 'orange-2',
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

  // HP-35(1972) 풍 — 검정 몸체, 파랑 키, 빨간 LED 표시
  redled: {
    name: {
      ko: '레드 LED',
      en: 'Red LED',
    },
    ui: {
      primary: 'grey-10',
      secondary: 'blue-8',
      accent: 'red-4',
      positive: 'green-7',
      negative: 'red-8',
      info: 'blue-6',
      warning: 'amber-8',
    },
    button: {
      important: 'blue-grey-6',
      function: 'blue-8',
      normal: 'grey-10',
    },
    panel: {
      text: {
        normal: 'red-4',
        warning: 'grey-1',
        normalAccent: 'red-4',
        warningAccent: 'grey-1',
      },
      background: {
        normal: 'grey-10',
        warning: 'red-10',
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

  // 카시오 fx 계열 풍 — 남색 몸체, 회청색 키, 주황 AC, 녹회색 액정
  navy: {
    name: {
      ko: '스쿨 네이비',
      en: 'School Navy',
    },
    ui: {
      primary: 'indigo-10',
      secondary: 'blue-7',
      accent: 'orange-8',
      positive: 'green-7',
      negative: 'red-8',
      info: 'blue-6',
      warning: 'amber-8',
    },
    button: {
      important: 'orange-8',
      function: 'blue-7',
      normal: 'blue-grey-7',
    },
    panel: {
      text: {
        normal: 'grey-10',
        warning: 'brown-10',
        normalAccent: 'grey-10',
        warningAccent: 'brown-10',
      },
      background: {
        normal: 'light-green-2',
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

  // 카시오 VFD(형광관) 계열 풍 — 검정 표시창에 청록 글자
  teal: {
    name: {
      ko: '청록 형광',
      en: 'Teal Glow',
    },
    ui: {
      primary: 'blue-grey-10',
      secondary: 'teal-7',
      accent: 'teal-4',
      positive: 'green-7',
      negative: 'red-8',
      info: 'blue-6',
      warning: 'amber-8',
    },
    button: {
      important: 'deep-orange-8',
      function: 'teal-8',
      normal: 'blue-grey-9',
    },
    panel: {
      text: {
        normal: 'teal-11',
        warning: 'grey-1',
        normalAccent: 'teal-11',
        warningAccent: 'grey-1',
      },
      background: {
        normal: 'grey-10',
        warning: 'deep-orange-10',
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

  // TI-30(1976) 풍 — 흑갈색 몸체, 빨간 LED 표시
  chocolate: {
    name: {
      ko: '초콜릿 LED',
      en: 'Chocolate LED',
    },
    ui: {
      primary: 'brown-9',
      secondary: 'brown-5',
      accent: 'red-5',
      positive: 'green-7',
      negative: 'red-8',
      info: 'blue-6',
      warning: 'amber-8',
    },
    button: {
      important: 'red-8',
      function: 'grey-7',
      normal: 'brown-7',
    },
    panel: {
      text: {
        normal: 'red-4',
        warning: 'grey-1',
        normalAccent: 'red-4',
        warningAccent: 'grey-1',
      },
      background: {
        normal: 'grey-10',
        warning: 'red-10',
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

  // 올리베티 Divisumma 18(1972) 풍 — 노랑·주황 고무 키
  yellow: {
    name: {
      ko: '이탈리안 옐로',
      en: 'Italian Yellow',
    },
    ui: {
      primary: 'deep-orange-9',
      secondary: 'amber-7',
      accent: 'amber-6',
      positive: 'green-7',
      negative: 'red-8',
      info: 'blue-6',
      warning: 'amber-8',
    },
    button: {
      important: 'brown-8',
      function: 'orange-8',
      normal: 'amber-3',
    },
    panel: {
      text: {
        normal: 'grey-10',
        warning: 'brown-10',
        normalAccent: 'grey-10',
        warningAccent: 'brown-10',
      },
      background: {
        normal: 'grey-3',
        warning: 'orange-2',
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
        normal: 'blue-grey-9',
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
        normal: 'grey-10',
        warning: 'grey-10',
        normalAccent: 'grey-10',
        warningAccent: 'grey-10',
      },
      background: {
        normal: 'yellow-2',
        warning: 'purple-2',
      },
    },
    select: {
      text: {
        light: 'grey-10',
        dark: 'grey-1',
      },
      background: {
        light: 'grey-1',
        dark: 'grey-10',
      },
    },
  },
};
