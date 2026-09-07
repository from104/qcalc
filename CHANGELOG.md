# Changelog

All notable changes to this project are recorded in this file.

The format is based on [Keep a Changelog] and this project follows [Semantic Versioning].

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

## [0.12.0] 2026-03-22

### Added

- Formula Calculator (5th calculator with math expressions and constants)
- 5 new languages (Chinese, Hindi, German, Spanish, French) for 8 total
- Flatpak packaging for Linux desktop
- Free public currency APIs (340 currencies without key required)

### Changed

- Language switching fallback to English for missing translations
- Currency coverage expanded from 170 to 340 currencies

## [0.11.6] 2025-12-27

### Added

- Number format settings per calculator (grouping, units, decimal places) with Alt+n toggle

### Fixed

- Screen rendering performance improved
- Wide layout sub-page transition fixed
- Result field overflow detection improved
- Keyboard shortcut duplication fixed
- Memory radix conversion error handling improved

## [0.11.5] 2025-10-07

### Added

- Calculation history font size adjustment (3 steps)
- Settings reset, export, and import
- Calculation history export and import as CSV
- User theme creation, editing, and deletion

### Fixed

- Calculation history scrolling via floating icon and keyboard

## [0.11.4] 2025-06-10

### Added

- User theme creation, editing, and deletion
- Unit and currency calculator favorites
- Extended color theme system

### Changed

- Help and tips document updates with usage and shortcut information
- Panel copy and paste method changed to menu-based
- Percentage calculation shortcut expanded with `%` key

### Fixed

- Theme switching performance improved

## [0.11.3] 2025-04-03

### Added

- Mobile optimization tooltip for swiping memo and record deletion
- Snap package with desktop menu launch
- Quick tips dialog for changed methods and button functions

### Changed

- History management UI with quick menu and mobile icon placement
- Menu style changed from pull-down to drawer
- Result copy and paste via clicking and long-press
- Shortcut keys reorganized for accessibility
- App icon emphasizing calculators and signature green color

### Fixed

- Portrait screen orientation issues (rotation, font size)

## [0.11.2] 2025-02-05

### Added

- Temperature units (Delisle, Newton, Romer, Réaumur)
- Adaptive layout for calculation history and sub-panel
- Search added to calculation history
- Automatic updates for Electron package format

### Changed

- Currency conversion precision increased from Number to BigNumber
- Decimal point display limit extended to 16 digits with rounding

### Fixed

- Percentage functionality display error
- Sub-panel loading behavior from calculation history

## [0.10.0] 2024-12-11

### Added

- Radix mode with numeral conversions and bitwise operations
- Shortcut key tooltips on buttons

### Changed

- Calculator modes (Basic, Unit, Currency, Radix) with unique features
- Number grouping flexibility (3 or 4 digits per group)

### Fixed

- Trigonometric and factorial calculation accuracy
- Decimal point input edge cases

## [0.9.1] 2024-06-29

### Added

- Memory action notifications (cleared, recalled, saved)
- Haptic feedback for mobile with settings toggle

### Changed

- Memory display method from tooltip to panel

### Fixed

- Calculator memory mode on first launch
- Screen flickering in dark mode on mobile

## [0.9.0] 2024-06-24

### Added

- Swipe to clear or edit calculation history records
- Notes in calculation history
- Math functions (N-squared, N-square root, remainder, sine, cosine, tangent, factorial, etc.)
- Button shortcuts for constants (Pi, phi, e, Pi/2, log 10, log 2)
- Memory operations (store, recall, clear, add, subtract, multiply, divide)

### Changed

- Calculator switching via tabs
- Menu from side to mobile style
- Settings as dialog
- Swipe control for calculator, settings, and history on mobile

## [0.8.0] 2024-05-26

### Added

- Capacitor (Android) platform support
- Angle to unit converter
- Multiple subdivisions
- Remember last used calculator

### Changed

- Icon image replaced

## [0.7.2fix1] 2023-10-17

- Custom fonts now applied on first screen

## [0.7.2] - 2023-10-10

- Result display fonts replaced
- Button and theme colors fixed

## [0.7.1] - 2023-09-23

- Calculator key button design updated
- Button press effect on calculator and shortcut keys
- Calculator precision improved to 64 digits
- Division by zero and square root of negative number errors handled
- Minor bug fixes

## [0.7.0] - 2023-08-03

- Currency converter added
- Unit and currency symbols display (`b` key) added

## [0.6.2] - 2023-02-20

- Percent button functionality extended
- Panel initialization on startup option added

## [0.6.1] - 2022-12-31

- Unit conversion panel changed from dialog to screen switching
- Unit conversion panel design updated
- Unit descriptions added

## [0.6.0] - 2022-12-25

- Unit conversion panel added (shortcut `v` key)
- [Paste] and [Unit Conversion] icons disabled outside calculator screen

## [0.5.4fix1] - 2022-10-05

- Window size and position remembered in Windows

## [0.5.4] - 2022-10-02

- Window size resizing enabled
- Window size and position remembered

## [0.5.3] - 2022-09-22

- Language selection (English, Korean)

## [0.5.2] - 2022-08-20

- Calculation result display at top
- Icon added to app info page

## [0.5.1] - 2022-08-16

- Settings panel added
- MIT license added

## [0.5.0] - 2022-08-13

- Dark mode added
- Calculation history button moved to bottom

## [0.4.4] - 2022-08-11

- Enter key fixed in certain situations

## [0.4.3] - 2022-08-08

- Last calculation result displayed on screen
- Main screen transition effect added
- Calculator page divided internally

## [0.4.2] - 2022-07-31

- Calculation history screen effect added
- Calculation history made copyable

## [0.4.0] - 2022-07-25

- Calculation history view added
- Button icons added
- Arithmetic operator activation icon display added

## [0.3.1] - 2022-07-19

- Decimal point display decimal limit issue fixed

## [0.3.0] - 2022-07-18

- Inverse, square, and square root buttons added

## [0.2.0] - 2022-07-11

- Korean comma and decimal point control elements
- Text non-selectability applied to screen elements

## [0.1.3] - 2022-07-09

- Left menu shortcut key added

## [0.1.2] - 2022-07-07

- Result form changed from input to field
- Decimal places and thousand separation state preserved across window close

## [0.1.1] - 2022-07-05

- Initial version with decimal point fix and appearance improvements

<!-- Links -->

[keep a changelog]: https://keepachangelog.com/en/1.1.0/
[semantic versioning]: https://semver.org/
