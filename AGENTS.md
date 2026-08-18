# QCalc

Multi-purpose calculator — Vue 3 + Quasar 2 + TypeScript + Tauri 2 (desktop production) + Capacitor (Android). Electron remains in-tree as a legacy desktop target during the Tauri transition.
5 modes: Standard, Unit, Currency, Programmer (Radix), Formula (mathjs).

## Language

Always respond in **Korean**. Technical terms and code identifiers stay in English.

## Commands

```bash
yarn install              # Install dependencies
yarn dev:tauri            # Dev (desktop, production target)
yarn build:tauri          # Build desktop (deb/rpm/AppImage; NSIS on Windows)
yarn lint                 # ESLint (flat config)
yarn test                 # Vitest
yarn test:coverage        # Vitest with v8 coverage
quasar dev -m electron    # Dev (legacy Electron target)
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
├── core/              # Calculator, CalculatorMath, CalculatorState, Memory, etc.
├── components/        # Vue SFCs — ResultField, CalcButton, FormulaField, etc.
├── composables/       # useCalcButtonActions, useRecordManager, useMainLayout, etc.
├── constants/         # CalcButtonSet (button definitions), unit/currency data
├── content/           # In-app markdown — pages/{About,Help}Page-{lang}.md, tips/{lang}/
├── i18n/              # vue-i18n — 10 languages (YAML locale files)
├── pages/             # HelpPage, AboutPage, SettingPage, etc. (.vue)
├── stores/            # Pinia stores — calcStore, formulaStore, radixStore, etc.
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
src-tauri/             # Desktop production — src/lib.rs (announce_a11y, quit_app,
                       #   get_package_env), tauri.conf.json, capabilities/, UPDATER.md
src-electron/          # Legacy Electron target — electron-main.ts, electron-preload.ts
src-capacitor/         # Capacitor Android project
```

## Architecture Patterns

- **Pinia Options API** stores wrapping class instances (e.g., `Calculator` in reactive state)
- **Composables** for button actions, record management, layout logic
- **CalcButtonSet** defines all button configs per mode (label, action, disabled condition, extended/shift functions)
- **Extended functions**: `standardExtendedFunctions` as base, mode-specific overrides merged on top
- **Formula mode**: mathjs `evaluate()` with BigNumber, `@` = current value, `$` = memory value

## i18n

- Central registry: `src/i18n/languages.ts` (`SUPPORTED_LANGUAGES`) — **10 languages: ko, en, ja, zh, hi, de, es, fr, pt, ru**
- Locales: `src/i18n/messages/{lang}Messages.yml`, `src/i18n/errors/{lang}Errors.yml`, `src/i18n/components/*.yml` (per-component files hold all languages in one file)
- Fallback: `en`
- **Escape `@` as `{'@'}`** in YAML values (vue-i18n link syntax). Same for `{`, `}`, `|`.
- If the YAML value contains special characters, always wrap it in double quotes: `key: "value with {'@'}"`
- When adding a new language, you must register it in `SUPPORTED_LANGUAGES` in `src/i18n/languages.ts`
- When adding or modifying i18n keys, always update **all 10 languages** at the same time. Watch out for dynamically built keys (e.g. `t(\`ariaLabel.${button.icon}\`)` in the layouts) — a key missing from the YAML is spoken/shown as the raw key name.
- If the translation is unclear, you may keep the `en` value as-is (since the fallback is `en`, it is better than missing values)

## Git Conventions

- **Branch strategy**: `main` (production) ← `develop` (default work branch) ← `feature/*`
- **Commits**: Conventional Commits — `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- **Never commit** `.env`, keystore files, or credentials

## Changelog

- Two files, kept in sync: `CHANGELOG.md` (English) and `CHANGELOG-ko.md` (Korean)
- **Keep entries short** — a bold title plus one or two sentences. The 0.12.0 and earlier sections are the reference for length; read one before writing a new entry
- Say what changed and what the user sees. Leave out root-cause narration, internal implementation detail (file, command and workflow names), measured numbers, and audit item ids — those belong in commit messages and code comments
- Keep issue links, and let a link stand in for the explanation of a known issue

## GitHub Release Notes

`release.yml` only creates the draft; the body is written by hand.

- Body is that version's section from `CHANGELOG.md`, used as-is — do not rewrite, summarise or expand it
- Put **Known issues** at the top, above the other sections
- Do not inline installation instructions — link to the README
- English throughout — do not append or link `CHANGELOG-ko.md`

## Release Checklist

1. Update `version` in `package.json`
2. Update `CHANGELOG.md` and `CHANGELOG-ko.md`
3. Sync all `src/content/pages/AboutPage-*.md` files with the changelog (all 10 languages)
4. Sync all `src/content/pages/HelpPage-*.md` files with the README (all 10 languages)
5. Update the `<releases>` list in `flatpak/io.github.from104.qcalc.metainfo.xml`
6. Run `yarn lint` and `yarn test`, then `scripts/verify-release.sh` — it builds each package, installs it in a clean container, and checks the app actually starts. CI only proves the build succeeded; 0.13.0 shipped a Snap that built fine and could not launch ([#117](https://github.com/from104/qcalc/issues/117))
7. Tag `v<version>` on `main` — `.github/workflows/release.yml` builds all six desktop packages (deb/rpm/AppImage/Flatpak/Snap/NSIS) and the Android APK, then creates a draft release; write its body (see **GitHub Release Notes**), publish it, then run the `tauri-updater-promote` workflow so auto-update clients see the new version

## Testing

- **Framework**: Vitest (not Jest)
- **Config**: `vitest.config.ts` — environment: node, globals: true
- **Location**: `src/**/*.{test,spec}.ts` (e.g., `src/classes/__tests__/CalculatorMath.test.ts`)
- **CI**: `ci.yml` runs lint → type-check → test (+ Electron build job) on push to develop/main; `release.yml` builds the six desktop packages and the Android APK on `v*` tags; `tauri-updater-promote.yml` promotes `latest.json` to the fixed `tauri-updater` rolling release
- **Android versions**: never hand-edit `versionCode`/`versionName` — `src-capacitor/android/app/build.gradle` derives both from the root `package.json` (`major*10000 + minor*100 + patch`). Capacitor does not sync them, which is how the APK once sat at 0.11.3 for four releases
