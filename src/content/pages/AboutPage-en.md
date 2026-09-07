# App info

This app was created using vue+quasar+tauri.

Contact: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. MIT License.

## Changelog

All notable changes to this project are recorded in this file.

The format is based on [Keep a Changelog] and this project follows [Semantic Versioning].

## [0.13.1] 2026-08-18

### Changed

- Package naming unified on QCalc (on Windows, remove the old "Q Calc" entry first)

### Added

- Released APK for Android with each release

### Fixed

- Snap package startup fixed ([#117](https://github.com/from104/qcalc/issues/117))
- Update notifications from 0.12.x builds now visible (Windows, AppImage)
- Windows installer removes Electron build remnants
- AppImage on Wayland no longer exits immediately (Linux)
- Fixed result field incorrectly highlighting when content fits
- Desktop text scaling applied to window size (Linux)
- Keypad labels no longer overflow buttons
- Flatpak audio permission requirement removed

### Known issues

- Screen readers cannot see the interface in the Flatpak build — upstream sandbox limitation. Use `.deb`, `.rpm` or AppImage ([#113](https://github.com/from104/qcalc/issues/113))
- Reading the clipboard can fail on Linux, so pasting into the calculator may do nothing

## [0.13.0] 2026-08-09

### Changed

- Desktop production switched from Electron to Tauri 2
- Auto-update fully activated on Tauri
- History migration and onboarding added
- Native Wayland is default ([tauri#13749](https://github.com/tauri-apps/tauri/issues/13749) / [tauri#3117](https://github.com/tauri-apps/tauri/issues/3117))
- Default window size increased (352×604 → 480×756)

### Added

- 2 new languages (Portuguese, Russian) for 10 total
- Screen reader announcement of results on Linux
- Formula error announcements
- Undo for record deletion
- Keyboard accessibility for tabs, formula field, and memory toggle
- WCAG AA contrast theme colors

### Fixed

- Screen reader support improved
- Number formatting by language
- Formula calculator degrees, error classifier, and placeholder substitution
- Record history respects maximum count after restoration
- Desktop app hangs at startup
- Tauri/Linux window sizing, text rendering, icons, Flatpak, and Snap packaging improvements
- Portuguese and Russian help pages now open
- Korean language labels corrected

### Known issues

- Snap package does not start ([#117](https://github.com/from104/qcalc/issues/117))
- Screen readers cannot see interface in Flatpak build — upstream sandbox limitation. Use `.deb`, `.rpm` or AppImage ([#113](https://github.com/from104/qcalc/issues/113))
- Linux screen reader verification incomplete (audible, hover, clipboard, CSP)

For information about previous versions, please check [here](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
