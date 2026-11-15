# App info

This app was created using vue+quasar+tauri.

Contact: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. MIT License.

## Changelog

All notable changes to this project are recorded in this file.

The format is based on [Keep a Changelog] and this project follows [Semantic Versioning].

## [0.13.7] 2026-11-16

### Changed

- The q, w, e row of shift-mode functions (sin/cos/tan, ÷2/÷3/÷5, -5/-10/-100, NAND/NOR/XNOR) now uses Shift+q/w/e; q alone quits
- On Windows, paste now reads the system clipboard directly instead of going through the webview's clipboard permission check

### Fixed

- Paste from the clipboard did nothing on Linux
- Quitting with q left the keypad stuck in shift mode on the next launch
- A Korean label was missing in the currency converter
- Screen readers announced the font-size button on the history screen with no name
- Screen readers announced the ⋮ menu button of each history entry with no name
- A fresh install showed “some saved settings were reset due to an app update” on first launch
- In the radix converter, pasting into the main field read the number in the target base (255 became 597)
- If the formula engine failed to load once, the formula calculator stayed broken until the app was restarted
- When the formula engine could not be loaded, the error message ended with untranslated English text
- On Linux, Ctrl+C showed “copied” but left the clipboard empty

## [0.13.6] 2026-10-03

### Added

- Startup screen shown while the app opens

### Changed

- Faster app startup
- Faster, smoother button, tab and screen transitions
- Calculator, [Record] and other screens grow and shrink smoothly with their header when switching between narrow and wide layouts
- Faster response to [=] with a long calculation history
- Better display performance on Linux with NVIDIA graphics
- Animations reduced automatically on low-end devices

### Fixed

- Fixed a white flash when the app starts
- Fixed the app occasionally staying on the startup screen
- Fixed the missing right margin in [Record]
- Fixed the app closing when pressing [=] in the Linux AppImage and Snap

## [0.13.5] 2026-09-17

### Fixed

- Fixed the AppImage not starting inside sandboxes such as Firejail

## [0.13.4] 2026-09-17

### Fixed

- Fixed the AppImage icon not being picked up by desktop integration tools

## [0.13.3] 2026-09-10

### Fixed

- Fixed the title bar buttons not responding on Linux since 0.13.2
- Fixed the window growing slightly on every start on Linux until it reached the maximum size
- Fixed the minimum and maximum window size not applying to the content area on Linux (and not at all since 0.13.2)

## [0.13.2] 2026-09-08

### Changed

- All five calculators shown as tabs on narrow screens (no more `▾` menu)

### Fixed

- Fixed the Android 15 status bar and navigation bar overlapping the keypad and [Record] screen
- Fixed the minimum window size differing when the monitor could not be read (desktop)
- Fixed the window briefly appearing at a random spot before moving to its saved position on Windows

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
