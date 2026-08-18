# Changelog

All notable changes to this project are recorded in this file.

The format is based on [Keep a Changelog] and this project follows [Semantic Versioning].

## [Unreleased]

## [0.13.1] 2026-08-18

### Changed

- **Package naming unified on QCalc.** The space is gone from the product name (`Q Calc` → `QCalc`). The executable installs as `/usr/bin/qcalc` rather than `/usr/bin/app`, the desktop entry is `QCalc.desktop`, and downloads are named like `QCalc_0.13.1_amd64.deb`. The workarounds Snap and Flatpak carried to correct the executable name are gone with it.
  - If you installed 0.13.0 on Windows, the new version will not recognise that install and will sit alongside it. Uninstall the old `Q Calc` entry first.

### Added

- **The Android APK is built and signed by CI and attached to each release.** Every APK used to be a local build someone had to remember to attach, and 0.13.0 shipped without one while the README pointed Android users at the release page.

### Fixed

- **The Snap package starts ([#117](https://github.com/from104/qcalc/issues/117)).** The 0.13.0 Snap launched bubblewrap instead of QCalc, because packaging renamed the first file it found in `usr/bin` and that was not the app. With the right binary in place the bundled Mesa/EGL stack then aborted startup, so it is no longer bundled — the platform's own is used. The package is also 47 MB smaller.
- **Fixed 0.12.x never seeing this update (Windows, AppImage).** Releases stopped carrying the update manifest the Electron builds read, so those installs got a 404 on every update check and were never told a newer version existed. Releases now publish it again alongside the Tauri one.
- **The Windows installer now removes the files the Electron build left behind.** Upgrading from 0.12.x kept the old application data in place — around 150 MB — along with a stale entry in Apps & features.
- **Fixed the AppImage exiting immediately on Wayland (Linux).** The AppImage bundle's GTK hook forced `GDK_BACKEND=x11`, which crashes WebKitGTK; the app now resets the backend to native Wayland at startup. The `.deb` and `.rpm` installs were unaffected.
- **Fixed the result field showing its warning colour when nothing was cut off.** Overflow is now measured from unrounded widths instead of comparing the integer-rounded `offsetWidth` and `scrollWidth`. The formula field's clipping indicator and the settings search tooltips, which used the same check, now share one implementation.
- **The desktop text scaling is now applied to the window size (Linux).** WebKitGTK's page zoom, which made text, icons, the result field and the settings dialog larger than in other apps, is cancelled out; the minimum and maximum window sizes are multiplied by the scaling factor instead. Raising the scaling now widens the window rather than magnifying everything on screen.
- **Fixed keypad labels growing out of their buttons.** Label sizes are now derived from the button's own height and width instead of the window height, with a floor and a ceiling, so labels no longer overflow the button or collide with each other in large or side-by-side windows.
- **Flatpak no longer asks for audio access.** The sandbox requested the audio server for button sounds the app does not have, and the desktop entry advertised URL handling it does not implement.

### Known issues

- Screen readers cannot see the interface in the Flatpak build — an upstream sandbox limitation. Use the `.deb`, `.rpm` or AppImage build ([#113](https://github.com/from104/qcalc/issues/113)).
- Reading the clipboard can fail on Linux, so pasting into the calculator may do nothing.

## [0.13.0] 2026-08-09

### Changed

- **Desktop production switched from Electron to Tauri 2**: Linux and Windows desktop builds now ship as Tauri 2 apps (WebKitGTK on Linux, WebView2 on Windows). The existing `src/` codebase runs unmodified behind a shim, and CI builds all six packages: `.deb`, `.rpm`, AppImage, Flatpak, Snap and an NSIS installer. Android (Capacitor) is unchanged.
- **Auto-update fully activated on Tauri**: the in-app update UI works as it did on Electron, with real download percentages and quit-and-install. Snap and Flatpak keep their store update mechanisms and are excluded.
- **History migration + onboarding**: calculation history can be exported from the Electron build and imported during Tauri first-run onboarding.
- **Native Wayland by default**: forcing `GDK_BACKEND=x11` was found to crash WebKitGTK on real hardware and is now opt-in via `QCALC_FORCE_XWAYLAND=1` ([tauri#13749](https://github.com/tauri-apps/tauri/issues/13749) / [tauri#3117](https://github.com/tauri-apps/tauri/issues/3117)).
- **Bigger default window**: default and minimum desktop window size grew from 352×604 to 480×756.

### Added

- **2 new languages (10 total)**: Portuguese (pt) and Russian (ru). Every screen is translated — menus, settings, unit names, currency names, help, about, tips, and error messages.
- **Screen reader announcement of results on Linux**: Orca cannot present web `aria-live` regions inside a Tauri app, so the app now emits an AT-SPI `announcement` event from the Rust side when a calculation completes. The DOM live region is kept for other platforms.
- **Formula error announcements**: formula errors are classified into i18n categories and announced via `aria-live`.
- **Undo for record deletion**: swipe/menu deletion of a history record shows an undo snackbar.
- **Keyboard accessibility**: the overflow tab menu, formula field and memory toggle are now fully keyboard-operable.
- **WCAG AA contrast**: theme colors raised to WCAG AA, guarded by a contrast regression test.
- **Coverage gate**: vitest coverage thresholds are enforced in CI.

### Fixed

- **Accessibility**: restored screen-reader announcement of the calculation result; removed misapplied `role` attributes and a nested interactive control; `<html lang>` is now synced with the active locale; added missing `ariaLabel` translations in all 10 languages.
- **Locale-aware numbers**: number display and paste parsing use `Intl.NumberFormat`; live input shows the locale's decimal separator.
- **Formula calculator**: trig functions use degrees to match the basic calculator; keypad `=` errors go through the same error classifier; the `{detail}` placeholder in error messages is substituted.
- **History**: restoring a record re-enforces the MAX_RECORDS bound.
- **Stores**: cross-store dependencies in `calcStore` are lazily instantiated, fixing a "no active Pinia" crash at Tauri startup.
- **Tauri/Linux**: guard against an invalid monitor `scale_factor` collapsing the window at startup; WebKitGTK font-weight rendering workaround ([tauri#14286](https://github.com/tauri-apps/tauri/issues/14286)); packaged app icons fixed; Flatpak manifest rewritten; Snap packaging fixed.
- **pt/ru markdown wiring**: the Help, About and Tips pages fell back to English because the pt/ru markdown modules were not imported and mapped.
- **i18n**: `unitDesc` namespace unified with runtime category ids; two Korean label typos fixed.

### Known issues

- **The Snap package in this release does not start.** Use the `.deb`, `.rpm`, AppImage or Flatpak build instead ([#117](https://github.com/from104/qcalc/issues/117)).
- Screen readers cannot see the interface in the Flatpak build — an upstream sandbox limitation. Use the `.deb`, `.rpm` or AppImage build ([#113](https://github.com/from104/qcalc/issues/113)).
- Linux screen reader output is verified only to the AT-SPI event level; audible verification, hover reading, the WebKitGTK clipboard `readText` failure, and CSP hardening are tracked as follow-ups.

## [0.12.0] 2026-03-22

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

### Fixed

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

## [0.11.5] 2025-10-07

### Added

- **Calculation History Font Size Control**: Added a feature to adjust the font size of the calculation history in 3 steps.
- **Settings Management**: Added the ability to reset, export, and import all settings.
- **Calculation History Management**: Added the ability to export and import calculation history as a CSV file.
- **User Theme Customization**: Added the ability for users to create, edit, and delete their own themes.

### Changed

### Fixed

- **Calculation History Scroll Bug Fixed**: Fixed a bug where calculation history could not be scrolled using the floating icon or keyboard (Up/Down/PageUp/PageDown/Home/End).

## [0.11.4] 2025-06-10

### Added

- **User Theme Customization**: Added the ability for users to create, edit, and delete their own themes.
- **Unit and Currency Calculator Favorites Feature**: Added the ability to set frequently used units or currencies as favorites for quick access.
- **Extended Color Theme System**: Added the ability to choose from various color themes beyond dark/light mode, providing a personalized UI experience.

### Changed

- **Help and Tips Document Update**: Updated help and tips documents including detailed usage and shortcut information for each calculator mode (Standard, Unit Conversion, Currency, Radix) and key functions.
- **Changed the way to copy or paste panel content**: Instead of copying by clicking (touching) the panel or pasting by long-pressing, you now open a menu by clicking (touching) (or right-clicking) the panel and select the desired action from the menu.
- **Percentage calculation shortcut expansion**: Added the `%` key as a shortcut for the percentage calculation function, in addition to the existing `k` key.

### Fixed

- **Code structure and performance improvements**: Improved code maintainability and performance by separating theme-related logic into a separate store.

## [0.11.3] 2025-04-03

### Added

- **Mobile optimization tooltip**: Added guidance about adding memo / deleting record by swiping on the history panel
- **Snap package**: The app can now be launched from the desktop menu (GNOME, KDE, etc.).
- **Quick Tips added**: Added a dialog to guide users on the changed copy and paste methods, number format changes, and how to use additional button functions.

### Changed

- **History management UI improvements**: Provides quick menu on desktop mouseover and intuitive icon button placement for mobile
- **Menu style change**: Changed menu style from pull-down menu to more mobile app-like drawer style.
- **Result copy and paste method changed**: Now you can copy by clicking on the calculation result instead of clicking the icon, and long-press to paste the clipboard content into the app.
- **Accessibility-focused shortcut key rearrangement**: Completely reorganized UI and keyboard shortcuts considering button positions and functions.
- **App icon update**: Emphasized characters representing each of the four calculators and the signature green color

### Fixed

- **Portrait screen orientation issues resolved**: Fixed portrait screen orientation issues (rotation, font size, etc.) in mobile app.

## [0.11.2] 2025-02-05

### Added

- Added temperature units: Delisle (°De), Newton (°N), Romer (°Rø), Réaumur (°Ré).
- Added support for adaptive layout: displays calculation history and sub-panel when the window width increases.
- Added search to calculation history
- Added automatic updates in electron package format

### Changed

- Increased currency conversion precision from Number to BigNumber.
- Extended decimal point display limit up to 16 digits with rounding applied

### Fixed

- Fixed display error in percentage functionality.
- Fixed abnormal behavior when loading into sub-panel from calculation history

## [0.10.0] 2024-12-11

### Added

- Introduced a new "Radix" mode, supporting numeral conversions (Binary, Octal, Decimal, Hexadecimal) and bitwise operations such as AND, OR, XOR, and NOT.
- Added shortcut key tooltips to buttons

### Changed

- Updated each calculator mode (e.g., Basic, Unit Conversion, Currency, Radix) to offer unique features, providing clearer and more intuitive button layouts and functionality.
- Modified number grouping to allow for either 3 or 4 digits per group.

### Fixed

- Resolved accuracy issues in trigonometric and factorial calculations.
- Fixed an edge case causing errors during decimal point inputs in specific scenarios.

## [0.9.1] 2024-06-29

### Added

- Added notifications for memory actions, such as memory cleared, recalled, and saved.
- Added haptics feedback when using the app on mobile, can be enabled or disabled in settings.

### Changed

- Changed memory display method from tooltip to panel.

### Fixed

- Fixed calculator starting in memory on first launch.
- Fixed screen flickering when starting in dark mode on mobile.

## [0.9.0] 2024-06-24

### Added

- Added the ability to swipe through the calculation result history to clear or edit individual records.
- Added ability to add and edit notes in the calculation result history
- Added a variety of new math functions: N-squared, N-square root, remainder, sine, cosine, tangent, factorial, N-squared to the 10th power, integer, and decimal calculations.
- Added functionality to buttons to enter key constants: Pi, phi (golden mean), e (base of log), Pi/2, log 10, log 2, etc.
- Expanded memory functionality to add the ability to store, recall, clear, add, subtract, multiply, and divide memory.

### Changed

- Changed calculator switching method to tabs
- Changed menu method from side (web) to mobile method
- Changed settings to dialog method
- Switch calculator, open and close settings and calculation result history with swipe on mobile

## [0.8.0] 2024-05-26

### Added

- Added capacitor (android) platform
- Added angle to unit converter
- Added multiple subdivisions
- Added remember last used calculator function

### Changed

- Replace icon image

## [0.7.2fix1] 2023-10-17

- Fixed custom fonts not being applied on the first screen

## [0.7.2] - 2023-10-10

- Replace fonts for calculation results
- Fixed button and theme colors

## [0.7.1] - 2023-09-23

- Calculator key buttons and other design changes
- Cycled button press effect when pressing calculator keys and shortcut keys
- Improved calculator precision up to 64 digits (using MathJS)
- Handled division by zero, square root of negative numbers calculation errors
- Minor bug fixes

## [0.7.0] - 2023-08-03

- Added currency converter
- added ability to display units and currency symbols ('b' key)

## [0.6.2] - 2023-02-20

- Extend % button functionality (get percent if previous operator is division, multiply by percent if previous operator is multiplication,)
- Added option to initialize panel on startup

## [0.6.1] - 2022-12-31

- Change the unit conversion panel from dialog to screen switching
- Changed the design of the unit conversion panel
- Added unit descriptions

## [0.6.0] - 2022-12-25

- Add unit conversion panel (shortcut v-key)
- Disable Paste, Unit Conversion panel icon unless on calculator screen

## [0.5.4fix1] - 2022-10-05

- Fixed bug with remembering window size and position in windows

## [0.5.4] - 2022-10-02

- Fix window size changeable
- Remember window size and position

## [0.5.3] - 2022-09-22

- Select language as English, Korean

## [0.5.2] - 2022-08-20

- Display calculation results at the top Bug fixes and enhancements
- Added icon to app info page

## [0.5.1] - 2022-08-16

- Added settings panel
- Added MIT license

## [0.5.0] - 2022-08-13

- Added dark mode
- Move Open calculation result history button to bottom

## [0.4.4] - 2022-08-11

- Fix enter not working in certain situations

## [0.4.3] - 2022-08-08

- Show last calculation result on screen
- Added main screen transition effect
- Divide calculator page internally

## [0.4.2] - 2022-07-31

- Added calculation result history screen effect
- Make calculation result history copyable

## [0.4.0] - 2022-07-25

- Added ability to view calculation result history
- Use icons for buttons
- Display icon when activating arithmetic operators

## [0.3.1] - 2022-07-19

- Fix bug with not displaying decimal point exactly as typed when not in decimal limit

## [0.3.0] - 2022-07-18

- Added inverse, square and square root buttons

## [0.2.0] - 2022-07-11

- Display comma and decimal point control elements in Korean
- Apply text non-selectability to some screen elements

## [0.1.3] - 2022-07-09

- Added shortcut key for left menu (see README.md)

## [0.1.2] - 2022-07-07

- Change result form to input->field
- Fix to remember decimal places, thousands separation state even when window is closed

## [0.1.1] - 2022-07-05

- Initial version
- Fixed decimal point, improved appearance

<!-- Links -->

[keep a changelog]: https://keepachangelog.com/en/1.1.0/
[semantic versioning]: https://semver.org/
