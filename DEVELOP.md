# QCalc Development Guide

## Technology Stack

### Core

- **Vue 3** + **TypeScript** (strict mode)
- **Quasar 2** — UI framework
- **Tauri 2** — desktop app (production since 0.13.0)
- **Electron** — legacy desktop target, kept during the Tauri transition
- **Capacitor** — mobile app (Android)
- **Vite** — build tool

### Key Libraries

- **mathjs** — high-precision BigNumber math operations
- **Frankfurter API + fawazahmed0 currency-api** — real-time currency exchange rates (no API key required)
- **tinykeys** — keyboard shortcut handling
- **markdown-it** — Markdown rendering
- **@tauri-apps/plugin-updater** — automatic desktop updates (bridged through `src/boot/tauri-shim.ts`; electron-updater remains for the legacy target)

### Development Tools

- **Node.js** 20+
- **Yarn** 4.x (package manager)
- **Vitest** — unit testing
- **ESLint 9** — flat config linting
- **husky + lint-staged** — pre-commit hooks
- **GitHub Actions** — CI/CD pipeline
- **VSCode** or **Cursor** (recommended IDE)
- **Android Studio** (for Android builds)

---

## Getting Started

### 1. Prerequisites

Install Node.js 20+ for your platform, then install Yarn globally:

```bash
npm install -g yarn
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Variables

Create a `.env` file in the project root:

```plaintext
# Android keystore (required for Android release builds)
MY_JKS_KEY_FILE=/path/to/keystore.jks
MY_JKS_STORE_PASSWORD=store_password
MY_JKS_KEY_ALIAS=key_alias
MY_JKS_KEY_PASSWORD=key_password
```

> Currency exchange rates are fetched from free public APIs (Frankfurter + fawazahmed0) — no API key required.

---

## Development

### Desktop (Tauri, production)

Prerequisites: Rust stable (`rust-version = 1.77.2` minimum per `src-tauri/Cargo.toml`; current stable recommended — `rustup update stable`), Linux build dependencies (`webkit2gtk-4.1`, `rsvg2`).

```bash
yarn dev:tauri     # dev mode (devtools auto-open)
yarn build:tauri   # production bundles (.deb/.rpm/AppImage on Linux, NSIS .exe on Windows)
```

**Wayland users note**: GNOME/KDE Wayland sessions suffer from upstream bugs where `setTitle` does not repaint the CSD header bar and `setAlwaysOnTop` is a no-op ([tauri#13749](https://github.com/tauri-apps/tauri/issues/13749), [tauri#3117](https://github.com/tauri-apps/tauri/issues/3117)). `force_xwayland_if_needed()` in `src-tauri/src/lib.rs` can force `GDK_BACKEND=x11` to work around both, but this was found to cause an intermittent WebKitGTK crash on real Wayland hardware, so it defaults to off (native Wayland). If you need the two features and accept the crash risk, opt in with `QCALC_FORCE_XWAYLAND=1 yarn dev:tauri`.

### Desktop (Electron, legacy)

```bash
quasar dev -m electron
```

### Android (Capacitor)

```bash
quasar dev -m capacitor -T android
```

### Run Tests

```bash
yarn test
```

### Lint

```bash
yarn lint
```

---

## Build

### Desktop (Tauri, production)

```bash
yarn build:tauri
```

Produces `.deb` / `.rpm` / AppImage on Linux and an NSIS installer on Windows (`src-tauri/target/release/bundle/`). Official release artifacts for all six desktop packages — including Flatpak and Snap — are built by `.github/workflows/release.yml` on a `v*` tag: the Flatpak job feeds the CI-built `.deb` into `flatpak/io.github.from104.qcalc.yml`, and the Snap job into `snap/snapcraft.yaml`.

### Desktop (Electron, legacy)

```bash
quasar build -m electron           # Linux
quasar build -m electron -T win32  # Windows (building on Linux requires Wine)
```

### Android

```bash
quasar build -m capacitor -T android
```

### Automated Build Scripts (legacy / Android)

`build.sh` / `build.bat` drive the **Electron** desktop builds and the Android build — they do not produce the Tauri packages that ship since 0.13.0:

```bash
./build.sh linux      # Electron Linux (legacy)
./build.sh win        # Electron Windows (legacy)
./build.sh android    # Android APK
```

> On Linux, run `chmod +x build.sh` first.

---

## Android Studio Setup

1. Build the Android target: `quasar build -m capacitor -T android`
2. Open the `src-capacitor` directory in Android Studio
3. Click **Sync Project with Gradle Files**
4. Connect a device (USB debugging) or start an emulator
5. Click **Run**

### Keystore Configuration

Release builds require a signed keystore. Set the `MY_JKS_*` variables in your `.env` file (see above).

> Never commit `.env` or keystore files to version control.

---

## CI/CD

- **`ci.yml`** — on every push: lint → type-check (`vue-tsc`) → tests with coverage thresholds, plus an Electron build job
- **`release.yml`** — on `v*` tags: builds and signs all six desktop packages (deb/rpm/AppImage/Flatpak/Snap on Linux, NSIS on Windows) plus the Android APK, and uploads them to a draft GitHub release. The Android job needs the `MY_JKS_BASE64`, `MY_JKS_STORE_PASSWORD`, `MY_JKS_KEY_ALIAS` and `MY_JKS_KEY_PASSWORD` secrets; if any is missing it prints which ones and fails rather than shipping an unsigned APK
- **`tauri-updater-promote.yml`** — run manually after publishing a release: promotes `latest.json` to the fixed `tauri-updater` rolling release. **Auto-update clients only see the new version after this step.**
- **husky + lint-staged** runs ESLint and formatting checks before each commit

---

## Project Structure

```text
src/
├── boot/             # Quasar boot files (android, capacitor, etc.)
├── components/       # Vue components
├── composables/      # Vue composables (useCalcButtonActions, useRecordManager, etc.)
├── constants/        # Button definitions, unit/currency data, fallback exchange rates
├── content/          # Markdown content (help, about, tips)
├── core/             # Core calculator classes (Calculator, CalculatorMath, etc.)
├── css/              # Shared SCSS styles
├── i18n/             # Internationalization (10 languages: ko, en, ja, zh, hi, de, es, fr, pt, ru)
├── layouts/          # Layout components (Narrow/Wide)
├── pages/            # Page components
├── router/           # Vue Router configuration
├── stores/           # Pinia stores
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
src-tauri/            # Tauri desktop (production) — src/lib.rs, tauri.conf.json,
                      #   capabilities/, icons/, UPDATER.md
src-electron/         # Electron main/preload (legacy desktop target)
src-capacitor/        # Capacitor Android project
flatpak/              # Flatpak manifest + metainfo (consumes the CI-built Tauri .deb)
snap/                 # Snapcraft config (consumes the CI-built Tauri .deb)
scripts/              # Build-time scripts (fetch-fallback-rates.ts, etc.)
```

The Electron→Tauri runtime bridge lives in `src/boot/tauri-shim.ts` — it maps `window.electron` / `window.electronUpdater` to Tauri APIs so `src/` runs unmodified on both targets.

---

## Important Notes

1. **Environment Security** — Never commit `.env` files containing credentials.
2. **Currency Rates** — Run `yarn fetch-rates` to update the build-time fallback exchange rate snapshot. The build scripts (`build.sh` / `build.bat`) run this automatically before each build.
3. **Android** — `ANDROID_HOME` must be set. Keystore required for release builds.
4. **Auto Updates** — Supported for the Windows installer and Linux AppImage. `.deb`/`.rpm` installs update manually; Snap/Flatpak use their own store mechanisms (the updater plugin is skipped there at runtime). After publishing a release, the `tauri-updater-promote` workflow must be run — until then, clients keep reporting "no update available".

---

## Contact

For development questions: Kihyun Seo <from104@gmail.com>
