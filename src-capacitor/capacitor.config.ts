import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.atit.qcalc',
  appName: 'Q Calc',
  webDir: 'dist/spa',
  server: { androidScheme: 'https' },
  plugins: {
    Device: {
      // 디바이스 정보 관련 설정
      languageTag: 'ko-KR',
    },
    ScreenReader: {
      // 스크린리더 관련 설정
    },
  },
};

export default config;
