# QCalc Development Guide

## Technology Stack

### Core

- **Vue 3** + **TypeScript** (strict mode)
- **Quasar 2** — UI framework
- **Electron 40** — desktop app
- **Capacitor** — mobile app (Android)
- **Vite 7** — build tool

### Key Libraries

- **mathjs** — high-precision BigNumber math operations
- **freecurrencyapi-js** — real-time currency exchange rates
- **tinykeys** — keyboard shortcut handling
- **markdown-it** — Markdown rendering
- **electron-updater** — automatic desktop updates

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
# Currency exchange API key (required for currency converter)
FREECURRENCY_API_KEY=<your_api_key>

# Android keystore (required for Android release builds)
MY_JKS_KEY_FILE=/path/to/keystore.jks
MY_JKS_STORE_PASSWORD=store_password
MY_JKS_KEY_ALIAS=key_alias
MY_JKS_KEY_PASSWORD=key_password
```

> Get a free API key from [freecurrencyapi.com](https://freecurrencyapi.com/) (5,000 requests/month free).

---

## Development

### Desktop (Electron)

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

### Desktop

#### Linux

```bash
quasar build -m electron
```

#### Windows

```bash
quasar build -m electron -T win32
```

> Building Windows targets on Linux requires Wine.

### Android

```bash
quasar build -m capacitor -T android
```

### Flatpak

See the Flatpak build configuration in the project for details.

### Automated Build Scripts

The project includes build scripts that handle dependency checks, version detection, and platform-specific builds:

```bash
# Build all platforms
./build.sh all        # Linux
build.bat all         # Windows

# Build specific platform
./build.sh linux
./build.sh win
./build.sh android
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

- **GitHub Actions** runs lint and tests on every push (`.github/workflows/ci.yml`)
- **husky + lint-staged** runs ESLint and formatting checks before each commit

---

## Project Structure

```text
src/
├── classes/          # Core calculator classes (Calculator, CalculatorMath, etc.)
├── components/       # Vue components
├── composables/      # Vue composables (useCalcButtonActions, useRecordManager, etc.)
├── constants/        # Button definitions, unit/currency data
├── i18n/             # Internationalization (ko, en, ja)
├── pages/            # Page components
├── stores/           # Pinia stores
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
src-electron/         # Electron main/preload
src-capacitor/        # Capacitor Android project
```

---

## Important Notes

1. **API Key Security** — Never commit `.env` files. Verify API key before production builds.
2. **Android** — `ANDROID_HOME` must be set. Keystore required for release builds.
3. **Auto Updates** — Supported for Windows installer and Linux AppImage. Snap/Flatpak use their own update mechanisms.

---

## Contact

For development questions: Kihyun Seo <from104@gmail.com>
