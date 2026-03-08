# QCalc

Multi-purpose calculator — Vue 3 + Quasar 2 + TypeScript + Electron 40 + Capacitor.
5 modes: Standard, Unit, Currency, Programmer (Radix), Formula (mathjs).

## Language

Always respond in **Korean**. Technical terms and code identifiers stay in English.

## Commands

```bash
yarn install              # Install dependencies
quasar dev -m electron    # Dev (desktop)
yarn lint                 # ESLint (flat config)
yarn test                 # Vitest
yarn test:coverage        # Vitest with v8 coverage
quasar build -m electron  # Build Linux
```

## Code Style

- **TypeScript strict mode** — `strict: true`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`
- **ESLint 9 flat config** — Vue 3 + TypeScript ESLint + Quasar + Prettier skip-formatting
- **Prettier** defaults (no `.prettierrc`)
- **Pre-commit**: husky + lint-staged runs ESLint fix + Prettier on staged files
- Prefix unused variables with `_` (e.g., `_unused`)
- Use `type` imports: `import type { Foo } from './bar'`
- Avoid `any` — use `toValue()` for `ComputedRef` unwrapping, proper generics otherwise
- Vue 3.5+: use `useTemplateRef<T>()` instead of `ref<T | null>(null)` for template refs
- CSS: use `:style` + `var()` custom properties instead of `v-bind()` in `<style>`

## Project Structure

```text
src/
├── classes/           # Calculator, CalculatorMath, CalculatorState, Memory, etc.
├── components/        # Vue SFCs — ResultField, CalcButton, FormulaField, etc.
├── composables/       # useCalcButtonActions, useRecordManager, useMainLayout, etc.
├── constants/         # CalcButtonSet (button definitions), unit/currency data
├── i18n/              # vue-i18n — ko, en, ja (YAML locale files)
├── pages/             # HelpPage, AboutPage, SettingPage, etc.
├── stores/            # Pinia stores — calcStore, formulaStore, radixStore, etc.
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
src-electron/          # electron-main.ts, electron-preload.ts
src-capacitor/         # Capacitor Android project
```

## Architecture Patterns

- **Pinia Options API** stores wrapping class instances (e.g., `Calculator` in reactive state)
- **Composables** for button actions, record management, layout logic
- **CalcButtonSet** defines all button configs per mode (label, action, disabled condition, extended/shift functions)
- **Extended functions**: `standardExtendedFunctions` as base, mode-specific overrides merged on top
- **Formula mode**: mathjs `evaluate()` with BigNumber, `@` = current value, `$` = memory value

## i18n

- Central registry: `src/i18n/languages.ts` (`SUPPORTED_LANGUAGES`)
- Locales: `src/i18n/ko/*.yaml`, `src/i18n/en/*.yaml`, `src/i18n/ja/*.yaml`
- Fallback: `en`
- **Escape `@` as `{'@'}`** in YAML values (vue-i18n link syntax). Same for `{`, `}`, `|`.
- YAML 값에 특수문자가 포함되면 반드시 쌍따옴표로 감쌀 것: `key: "value with {'@'}"`
- 새 언어 추가 시 `src/i18n/languages.ts`의 `SUPPORTED_LANGUAGES`에 등록 필수
- i18n 키를 추가/수정할 때 **ko, en, ja 3개 언어 파일 모두** 동시에 업데이트할 것
- 번역이 불확실하면 `en` 값을 그대로 두어도 됨 (fallback이 `en`이므로 누락보다 나음)

## Git Conventions

- **Branch strategy**: `main` (production) ← `develop` (default work branch) ← `feature/*`
- **Commits**: Conventional Commits — `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- **Never commit** `.env`, keystore files, or credentials

## Release Checklist

1. Update `version` in `package.json`
2. Update `CHANGELOG.md` and `CHANGELOG-ko.md`
3. Sync `src/pages/AboutPage-en.md` / `AboutPage-ko.md` with changelog
4. Sync `src/pages/HelpPage-en.md` / `HelpPage-ko.md` with README
5. Run `yarn lint` and `yarn test`
6. All documents have en/ko pairs — update both

## Testing

- **Framework**: Vitest (not Jest)
- **Config**: `vitest.config.ts` — environment: node, globals: true
- **Location**: `src/**/*.{test,spec}.ts` (e.g., `src/classes/__tests__/CalculatorMath.test.ts`)
- **CI**: GitHub Actions runs lint → type-check → test on push to develop/main
