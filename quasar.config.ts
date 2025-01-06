/* eslint-env node */

/*
 * 이 파일은 Node 환경에서 실행됩니다 (Babel로 트랜스파일되지 않음).
 * 따라서 현재 Node 버전에서 지원하는 ES6 기능만 사용하세요.
 * 지원되는 기능 확인: https://node.green/
 */

// Quasar 앱 구성
// 자세한 내용: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

import { defineConfig } from '#q-app/wrappers';
import { join } from 'node:path';
// import dotenv from 'dotenv';

export default defineConfig((/* ctx */) => {
  return {
    sourceFiles: {
      // bexManifestFile: '',
    },
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
    boot: ['i18n', 'auto-blur', 'android'],

    // CSS 파일
    css: ['app.scss'],

    // Quasar 추가 기능
    extras: ['mdi-v5', 'roboto-font', 'material-icons'],

    // 빌드 설정
    build: {
      // .env 파일 사용
      // env: dotenv.config().parsed,

      /**
       * Automatically open remote Vue Devtools when running in development mode.
       */
      vueDevtools: true,

      /**
       * Folder where Quasar CLI should look for .env* files.
       * Can be an absolute path or a relative path to project root directory.
       *
       * @default project root directory
       */
      envFolder: '',

      /**
       * Additional .env* files to be loaded.
       * Each entry can be an absolute path or a relative path to quasar.config > build > envFolder.
       *
       * @example ['.env.somefile', '../.env.someotherfile']
       */
      envFiles: [],

      // 폴더 별칭 설정
      alias: {
        classes: join(__dirname, 'src/classes'),
        types: join(__dirname, 'src/types'),
        constants: join(__dirname, 'src/constants'),
        capacitor: join(__dirname, 'src-capacitor/node_modules/@capacitor'),
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
        [
          '@intlify/vite-plugin-vue-i18n',
          {
            compositionOnly: true,
            include: join(__dirname, './src/i18n/**'),
            defaultSFCLang: 'yml',
          },
        ],
        // 타입스크립트 및 ESLint 검사 플러그인
        [
          'vite-plugin-checker',
          {
            vueTsc: true,
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
      typescript: {
        strict: true, // (recommended) enables strict settings for TypeScript
        vueShim: true, // required when using ESLint with type-checked rules, will generate a shim file for `*.vue` files
        extendTsConfig() {
          // You can use this hook to extend tsConfig dynamically
          // For basic use cases, you can still update the usual tsconfig.json file to override some settings
        },
      },
    },

    // 개발 서버 설정
    devServer: {
      open: true,
    },

    // Quasar 프레임워크 설정
    framework: {
      config: {},
      plugins: ['Notify', 'Meta'],

      /**
       * Auto import - how to detect components in your vue files
       *   "kebab": q-carousel q-page
       *   "pascal": QCarousel QPage
       *   "combined": q-carousel QPage
       * @default 'kebab'
       */
      autoImportComponentCase: 'kebab',

      /**
       * Auto import - which file extensions should be interpreted as referring to Vue SFC?
       * @default [ 'vue' ]
       */
      autoImportVueExtensions: ['vue'],

      /**
       * Auto import - which file extensions should be interpreted as referring to script files?
       * Treeshake Quasar's UI on dev too?
       * Recommended to leave this as false for performance reasons.
       * @default false
       */
      devTreeshaking: false,
      // was previously under /quasar.conf > build
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
      // Electron preload scripts (if any) from /src-electron, WITHOUT file extension
      preloadScripts: ['electron-preload'],

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
          signAndEditExecutable: false,
          signtoolOptions: {
            publisherName: 'ATIT',
            sign: '',
          },
        },
        snap: {
          confinement: 'strict',
          grade: 'devel',
        },
      },
    },

    // 브라우저 확장 프로그램(BEX) 설정
    bex: {
      // BEX 관련 설정 (주석 처리됨)
    },
  };
});
