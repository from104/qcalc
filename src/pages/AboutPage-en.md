# App info

This app was created using vue+quasar+electron.

Contact: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. MIT License.

## Changelog

All notable changes to this project are recorded in this file.

The format is based on [Keep a Changelog] and this project follows [Semantic Versioning].

## [0.11.6] 2025-12-27

### Added

- **Number Format Per Calculator Feature**: Added ability to use independent number format settings (number grouping, grouping unit, decimal places) for each calculator (basic, unit, currency, radix). Toggle with Alt+n shortcut key.

### Changed

### Fixed

- **Calculator Button Dynamic Height Calculation Improved**: Optimized the button height calculation logic by using `requestAnimationFrame` and `nextTick` instead of `setTimeout` for better accuracy and performance.
- **Result Field Initialization Optimized**: Removed redundant state swapping logic during component mount and improved text overflow detection to run immediately after rendering.
- **Calculator Type-Specific Initial Layout Optimization**: Refined initial button height settings for different calculator types (Basic, Unit, Currency, Radix) to reduce layout shifts.
- **Wide Layout Sub-page Transition Bug Fixed**: Fixed an issue where the transition effect for sub-pages (right section) in wide layout did not work properly.
- **Result Field Text Overflow Detection Improved**: Completely reviewed and rewritten the text overflow detection logic in result fields. Implemented a precise and continuous tracking system using ResizeObserver and watch, ensuring accurate color highlighting and tooltip display when text overflows.
- **Keyboard Shortcut Duplicate Registration Issue Fixed**: Fixed an issue where tab navigation shortcuts (Ctrl+Tab, ArrowRight, etc.) were executed twice. Resolved by ensuring useMainLayout is only called from MainLayout, preventing duplicate key binding registrations from multiple layout components.
- **Memory Value Radix Conversion Error Fixed**: Added safe error handling for radix conversion errors that occurred during initialization or when invalid values were passed.

For information about previous versions, please check [here](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
