# App info

This app was created using vue+quasar+electron.

Contact: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. MIT License.

## Changelog

All notable changes to this project are recorded in this file.

The format is based on [Keep a Changelog] and this project follows [Semantic Versioning].

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

For information about previous versions, please check [here](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
