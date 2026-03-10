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
- If the YAML value contains special characters, always wrap it in double quotes: `key: "value with {'@'}"`
- When adding a new language, you must register it in `SUPPORTED_LANGUAGES` in `src/i18n/languages.ts`
- When adding or modifying i18n keys, always update all three language files (**ko, en, ja**) at the same time
- If the translation is unclear, you may keep the `en` value as-is (since the fallback is `en`, it is better than missing values)

## Git Conventions

- **Branch strategy**: `main` (production) ← `develop` (default work branch) ← `feature/*`
- **Commits**: Conventional Commits — `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- **Never commit** `.env`, keystore files, or credentials

## Release Checklist

1. Update `version` in `package.json`
2. Update `CHANGELOG.md` and `CHANGELOG-ko.md`
3. Sync all `src/pages/AboutPage-*.md` files with the changelog (include all supported language extensions)
4. Sync all `src/pages/HelpPage-*.md` files with the README (include all supported language extensions)
5. Run `yarn lint` and `yarn test`
6. Ensure every document exists for each supported language pair (e.g., en/ko/ja) — always update all when adding or modifying

## Testing

- **Framework**: Vitest (not Jest)
- **Config**: `vitest.config.ts` — environment: node, globals: true
- **Location**: `src/**/*.{test,spec}.ts` (e.g., `src/classes/__tests__/CalculatorMath.test.ts`)
- **CI**: GitHub Actions runs lint → type-check → test on push to develop/main
