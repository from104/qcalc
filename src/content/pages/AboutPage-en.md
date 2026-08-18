# App info

This app was created using vue+quasar+tauri.

Contact: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. MIT License.

## Changelog

All notable changes to this project are recorded in this file.

The format is based on [Keep a Changelog] and this project follows [Semantic Versioning].

## [0.13.1] 2026-08-18

### Changed

- **Package name unified as QCalc**: if you installed 0.13.0 on Windows, uninstall the old "Q Calc" entry first — the new version does not recognise that installation.

### Added

- **Android APK on every release**: it is now built, signed and attached automatically.

### Fixed

- **The Snap package starts**: the 0.13.0 Snap launched the wrong program and the app never opened.
- **Updates reach 0.12.x again (Windows, AppImage)**: those installations failed every update check and were never told a newer version existed.
- **Installing on Windows clears the old app away**: installing over 0.12.x used to leave its files and its entry in Apps & features behind.
- **The AppImage no longer quits right after starting on Wayland (Linux)**.
- **Sizing on Linux**: the window now follows the desktop text scaling instead of magnifying everything, and keypad labels stay inside their buttons.

## [0.13.0] 2026-08-09

### Changed

- **Desktop app switched from Electron to Tauri 2**: a lighter, faster desktop app. Ships as deb, rpm, AppImage, Flatpak and Snap on Linux and an NSIS installer on Windows, with auto-update fully working on the new foundation.
- **History migration**: export your calculation history from the previous (Electron) version and import it on the new version's first-run screen.
- **Bigger default window**: default and minimum window size grew to 480×756.

### Added

- **Screen reader announcement of results (Linux)**: when a calculation completes, the result is read aloud by the screen reader (Orca).
- **Formula error announcements**: formula errors are classified and announced via the screen reader.
- **Undo for record deletion**: deleting a history record can be undone from a snackbar.
- **Improved keyboard accessibility**: the overflow tab menu, formula field and memory toggle are fully keyboard-operable.
- **Higher-contrast themes**: theme colors raised to WCAG AA contrast.
- **New languages (10 total)**: Portuguese and Russian added.

### Fixed

- Locale-aware number display and paste, formula trig functions unified to degrees, and many more accessibility and translation fixes.

For information about previous versions, please check [here](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
