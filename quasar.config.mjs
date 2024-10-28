/* eslint-env node */

/*
 * 이 파일은 Node 환경에서 실행됩니다 (Babel로 트랜스파일되지 않음).
 * 따라서 현재 Node 버전에서 지원하는 ES6 기능만 사용하세요.
 * 지원되는 기능 확인: https://node.green/
 */

// Quasar 앱 구성
// 자세한 내용: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

import { configure } from 'quasar/wrappers';
import path from 'path';
import dotenv from 'dotenv';

export default configure(function (/* ctx */) {
  return {
    // ESLint 설정
    eslint: {
      // fix: true, // 자동 수정 활성화 (주석 처리됨)
      // include: [], // 포함할 파일
      // exclude: [], // 제외할 파일
      // rawOptions: {}, // 추가 ESLint 옵션
      warnings: true, // 경고 표시
      errors: true, // 오류 표시
    },

    // 프리페치 기능 (주석 처리됨)
    // preFetch: true,

    // 앱 부트 파일 (/src/boot)
    // 부트 파일은 "main.js"의 일부입니다
    boot: ['i18n', 'blur', 'android'],

    // CSS 파일
    css: ['app.scss'],

    // Quasar 추가 기능
    extras: [
      'mdi-v5',
      'roboto-font',
      'material-icons',
    ],

    // 빌드 설정
    build: {
      // .env 파일 사용
      env: dotenv.config().parsed,
      
      // 폴더 별칭 설정
      alias: {
        classes: path.join(__dirname, 'src/classes'),
        capacitor: path.join(__dirname, 'src-capacitor/node_modules'),
      },
      
      // 대상 브라우저 및 Node 버전
      target: {
        browser: ['es2020', 'edge79', 'firefox68', 'chrome67', 'safari14'],
        node: 'node20',
      },

      vueRouterMode: 'hash', // 라우터 모드: 'hash' 또는 'history'

      // Vite 플러그인 설정
      vitePlugins: [
        // Vue I18n 플러그인
        ['@intlify/vite-plugin-vue-i18n', {
          compositionOnly: true,
          include: path.resolve(__dirname, './src/i18n/**'),
          defaultSFCLang: 'yml',
        }],
        // 타입스크립트 및 ESLint 검사 플러그인
        ['vite-plugin-checker', {
          vueTsc: {
            tsconfigPath: 'tsconfig.vue-tsc.json',
          },
          eslint: {
            lintCommand: 'eslint "./**/*.{js,ts,mjs,cjs,vue}"',
          },
        }, { server: false }],
      ],
    },

    // 개발 서버 설정
    devServer: {
      open: true, // 브라우저 자동 실행
    },

    // Quasar 프레임워크 설정
    framework: {
      config: {},
      plugins: ['Notify', 'Meta'],
    },

    // 애니메이션 설정
    animations: [],

    // SSR(서버 사이드 렌더링) 설정
    ssr: {
      // SSR 관련 설정 (주석 처리됨)
    },

    // PWA(프로그레시브 웹 앱) 설정
    pwa: {
      // PWA 관련 설정 (주석 처리됨)
    },

    // Cordova 설정
    cordova: {
      // Cordova 관련 설정 (주석 처리됨)
    },

    // Capacitor 설정
    capacitor: {
      hideSplashscreen: true,
    },

    // Electron 설정
    electron: {
      inspectPort: 5858,
      bundler: 'builder', // 'packager' 또는 'builder'

      builder: {
        appId: 'com.atit.qcalc',
        productName: 'QCalc',
        artifactName: '${productName}-${version}-${os}.${ext}',
        linux: {
          target: ['AppImage', 'snap'],
          category: 'Utility',
        },
        win: {
          target: ['nsis'],
        },
      },
    },

    // 브라우저 확장 프로그램(BEX) 설정
    bex: {
      // BEX 관련 설정 (주석 처리됨)
    },
  };
});
