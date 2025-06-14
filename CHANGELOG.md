# Changelog

All notable changes to this project are recorded in this file.

The format is based on [Keep a Changelog] and this project follows [Semantic Versioning].

## [0.11.4] 2025-06-10

### Added

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
