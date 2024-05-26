/* eslint-disable */

declare module NodeJS {
  interface ProcessEnv {
      QUASAR_PUBLIC_FOLDER: string;
      QUASAR_ELECTRON_PRELOAD_FOLDER: string;
      QUASAR_ELECTRON_PRELOAD_EXTENSION: string;
      APP_URL: string;
  }
}
