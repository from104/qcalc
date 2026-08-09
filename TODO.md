# QCalc TODO

## Planned

- [ ] Accessibility improvements
  - [ ] Voice control of calculator
  - [ ] Hover (mouse review) reading of the result field ([#108](https://github.com/from104/qcalc/issues/108))
- [ ] Clipboard `readText` fix on WebKitGTK ([#109](https://github.com/from104/qcalc/issues/109))
- [ ] CSP hardening ([#110](https://github.com/from104/qcalc/issues/110))
- [ ] Formula auto-completion
- [ ] Engineering calculator
- [ ] Settings sync to cloud
- [ ] iOS app (Capacitor)
- [ ] Skin / custom theme function
- [ ] Monetization (ads)

## Done (v0.13.0)

- [x] Desktop production switched from Electron to Tauri 2 (deb/rpm/AppImage/Flatpak/Snap/NSIS via CI)
- [x] Tauri auto-update pipeline (signed artifacts + promote workflow)
- [x] Screen reader announcement of results (AT-SPI announcement on Linux)
- [x] WCAG AA theme contrast + regression test
- [x] Keyboard accessibility (overflow menu, formula field, memory toggle)
- [x] Undo for record deletion
- [x] History migration + first-run onboarding
- [x] 2 new languages (Português, Русский) — 10 total
- [x] Coverage gate in CI

## Done (v0.12.0)

- [x] Formula calculator mode (mathjs expression evaluation)
- [x] Multilingual support (한국어, English, 日本語, 中文, हिन्दी, Deutsch, Español, Français)
- [x] Flatpak build support

## Done (v0.11.6 and earlier)

- [x] Number format per calculator feature
- [x] Export and import calculation history
- [x] User theme settings
- [x] Unit and currency item favorites
- [x] Theme function
- [x] Automatic updates (electron)
- [x] Adjust layout scaling for large tablets
- [x] Search calculation result history
- [x] Active layout for calculation history panel
- [x] Programmer's calculator
- [x] Ability to edit and note calculation history
- [x] Additional functions per button
- [x] Settings (reset, export, import)
- [x] Unit converter / Currency converter
- [x] Mobile app (Capacitor Android)
- [x] Dark mode / i18n / Resizable window
- [x] ARIA labels / High contrast mode / Haptic mode
