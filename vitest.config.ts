import { defineConfig } from 'vitest/config';
import { join } from 'node:path';
import yamlPlugin from '@modyfi/vite-plugin-yaml';
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';

export default defineConfig({
  plugins: [
    // exclude: SFC `<i18n>` 커스텀 블록의 가상 모듈(id가 '...lang.yaml'로 끝남)은
    // VueI18nPlugin이 이미 JS로 변환하므로 yamlPlugin이 다시 YAML로 파싱하면 충돌한다.
    yamlPlugin({ exclude: [/\?vue&type=i18n/] }),
    vue(),
    // include는 지정하지 않는다: src/i18n/messages, src/i18n/errors의 *.yml은
    // 이미 yamlPlugin이 일반 객체로 처리하므로(앱 전역 메시지), 여기서 VueI18nPlugin이
    // 같은 파일을 다시 가로채면 이중 변환 충돌이 발생한다. 이 플러그인은 SFC `<i18n>`
    // 커스텀 블록 컴파일(이번 mount 테스트에 필요)만을 위해 추가한다.
    VueI18nPlugin({ strictMessage: false, escapeHtml: false }),
  ],
  resolve: {
    alias: {
      src: join(__dirname, 'src'),
      core: join(__dirname, 'src/core'),
      types: join(__dirname, 'src/types'),
      constants: join(__dirname, 'src/constants'),
      stores: join(__dirname, 'src/stores'),
      components: join(__dirname, 'src/components'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/core/**/*.ts', 'src/utils/**/*.ts', 'src/stores/**/*.ts'],
      thresholds: {
        statements: 60,
        branches: 42,
        functions: 65,
        lines: 60,
      },
    },
  },
});
