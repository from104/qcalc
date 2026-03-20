# App info

This app was created using vue+quasar+electron.

Contact: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. MIT License.

## Changelog

All notable changes to this project are recorded in this file.

The format is based on [Keep a Changelog] and this project follows [Semantic Versioning].

## [0.12.0] 2026-03-14

### Added

- **Formula Calculator (5th Calculator)**: Type and evaluate math expressions directly — supports arithmetic, parentheses, functions (`sin`, `cos`, `sqrt`, `log`, `ln`, `abs`, `round`, `nthRoot`, etc.), and constants (`pi`, `e`, `phi`) via [mathjs](https://mathjs.org/) syntax.
  - Press Space to open the inline formula editor for direct expression editing.
  - Use `@` to reference the current value, `$` for the stored memory value.
  - Full memory support (MC, MR, MS, M+, M−, M×, M÷) available through shift-function buttons.
  - Evaluated results are saved to calculation history with the full expression displayed.
  - Built-in help menu lists all available functions, constants, and placeholders.
- **5 New Languages (8 total)**: Chinese (Simplified), Hindi, German, Spanish, and French join the existing Korean, English, and Japanese. Every screen is translated — menus, settings, unit names, currency names, help pages, about pages, tips, and error messages.
- **Flatpak Packaging**: Install QCalc from Flatpak for broader Linux desktop support.
- **Free Public Currency API Migration**: Switched from FreeCurrencyAPI (requires API key) to free public APIs (Frankfurter + fawazahmed0). Supports 340 currencies (fiat, precious metals, cryptocurrencies) with no API key required. Build-time rate snapshots enable currency conversion even on first launch without network.

### Changed

- **Smoother Language Switching**: If a translation is missing, the app now falls back to English automatically instead of showing raw key paths.
- **Expanded Currency Coverage**: From 170 to 340 currencies — added major cryptocurrencies (ETH, SOL, XRP, etc.), precious metals (Palladium, Platinum), and historical currencies. Full i18n support for all 8 languages.

For information about previous versions, please check [here](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
