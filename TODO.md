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

## Killer-App Roadmap (draft)

> Three pillars: **extreme speed · smooth motion · retro feel**. Track numeric targets and block regressions in CI.

### 1. Extreme speed

- [ ] Measure first: benchmark script for cold start (process start → first input) and key-to-display latency, with CI budget gates
  - Targets: desktop cold start < 300ms, input → screen < 16ms (one frame), Android first screen < 500ms
- [ ] First-paint optimization: render only the calculator immediately; lazy-load settings, help, unit/currency data and inactive i18n locales (dynamic import)
- [ ] Bundle diet: verify Quasar tree-shaking, split large deps (expression engine, currency data), publish bundle report in CI
- [ ] Show the Tauri window only when ready (visible:false → show after first render) to kill the white flash
- [ ] Hot-path tuning of the calc engine (Decimal caching, drop needless reactivity — `shallowRef`/`markRaw`)
- [ ] Debounce store persistence writes, no synchronous I/O at startup

### 2. Smooth motion

- [ ] All animations 120–180ms, `transform`/`opacity` only (no layout-triggering properties); respond instantly while typing
- [ ] Button feedback on pointerdown (never wait for click), pressed depth + optional haptics (Android) / click sound
- [ ] Result transitions: digit roll/flip as an option, default is zero delay — speed beats smoothness
- [ ] Swipe gestures between tabs/calculators (mobile), inertial scroll and rubber-band in the history panel
- [ ] Respect `prefers-reduced-motion`; auto-reduce motion on low-end devices
- [ ] Frame-drop watch: dev-mode FPS / Long Task overlay

### 3. Retro feel (via a skin system — expands the "Skin / custom theme" item)

- [ ] Skin engine: theme file format defining buttons, display panel, font, colors and sounds as tokens
- [ ] Built-in retro skin candidates
  - [ ] **LCD** — grey-green liquid crystal, 7-segment font, ghost segments
  - [ ] **VFD** — cyan fluorescent glow on black
  - [ ] **LED** — red dot/segment display (70s HP/TI style)
  - [ ] **Solar pocket calculator** — plastic-textured keys, solar panel accent
  - [ ] **CRT terminal** — phosphor green, optional scanlines
- [ ] Physical-feeling buttons: bevels, shadows, press offset, color-coded by role (digits/operators/clear)
- [ ] Sound packs (click, mechanical), off by default
- [ ] Keep WCAG AA contrast/size in retro skins and verify no screen-reader regressions

### Phases

1. **0.14** — perf instrumentation and budget gates, first paint / lazy loading, instant button feedback
2. **0.15** — skin engine + LCD and VFD skins, sounds and haptics
3. **0.16** — remaining skins, gesture/transition polish, low-end mode
4. **1.0** — release after confirming perf targets on all platforms; refresh store screenshots/marketing

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
