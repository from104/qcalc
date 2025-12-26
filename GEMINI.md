# QCalc - A Multi-purpose Calculator for Productivity and Accessibility

## Project Overview

QCalc is a multi-purpose calculator application built with Vue 3, Quasar 2, and Electron. It is designed to be a modern productivity tool with a focus on accessibility. The application includes a standard calculator, unit converter, currency converter, and a programmer calculator. It supports high-precision calculations, number base conversions, and bitwise operations. The application is cross-platform and can be run on Windows, Linux, and Android.

**Main Technologies:**

*   **Frontend:** Vue 3, Quasar 2, TypeScript
*   **Desktop:** Electron
*   **Mobile:** Capacitor
*   **State Management:** Pinia
*   **Math Engine:** Math.js
*   **Internationalization:** Vue i18n
*   **Build Tool:** Vite

## Agent Guidelines (Antigravity Rules)

*   **Document Language:** All artifacts (`implementation_plan.md`, `walkthrough.md`, `task.md`, etc.), task summaries, and status updates must be written in **Korean**.
*   **Communication:** Use Korean as the primary language when notifying the user (`notify_user`).

## Building and Running

### Prerequisites

*   Node.js 20.0 or later
*   Yarn package manager

### Installation

1.  Install dependencies:
    ```bash
    yarn install
    ```
2.  Create a `.env` file in the root of the project and add the following environment variables:
    ```
    # Currency exchange API key (required)
    FREECURRENCY_API_KEY=<your_api_key>
    # Android keystore settings (required when building Android)
    MY_JKS_KEY_FILE=/path/to/keystore.jks
    MY_JKS_STORE_PASSWORD=store_password
    MY_JKS_KEY_ALIAS=key_alias
    MY_JKS_KEY_PASSWORD=key_password
    ```

### Development

*   **Electron:**
    ```bash
    quasar dev -m electron
    ```
*   **Android:**
    ```bash
    quasar dev -m capacitor -T android
    ```

### Building

*   **Electron (Windows):**
    ```bash
    quasar build -m electron -T win32
    ```
*   **Electron (Linux):**
    ```bash
    quasar build -m electron
    ```
*   **Android:**
    ```bash
    quasar build -m capacitor -T android
    ```

### Testing

```bash
yarn test
```

## Release Preparation

When preparing a new release (e.g., v0.11.6), follow these steps to ensure all metadata and documents are consistent:

1.  **Update Version**: Update the `version` field in `package.json`.
2.  **Update Changelogs**:
    *   Update the release date for the new version in `CHANGELOG.md` and `CHANGELOG-ko.md`.
    *   Ensure all new features and fixes are listed under the correct version header.
3.  **Sync About Pages**:
    *   Update `src/pages/AboutPage-en.md` and `src/pages/AboutPage-ko.md`.
    *   Copy the latest version's changelog entries from the main changelog files to these pages.
4.  **Sync Help Pages**:
    *   Update `src/pages/HelpPage-en.md` based on `README.md`.
    *   Update `src/pages/HelpPage-ko.md` based on `README-ko.md`.
    *   Ensure all shortcuts and feature descriptions are synchronized.
5.  **Verify Integrity**:
    *   Run `yarn lint` to check for code style issues.
    *   Run `yarn test` to ensure all tests pass.
6.  **Update Documentation**: Update `walkthrough.md` to summarize the release preparation steps taken.

## Development Conventions

*   **Code Style:** The project uses Prettier for code formatting and ESLint for linting.
*   **Testing:** The project uses Jest for unit testing.
*   **Commits:** The project follows the Conventional Commits specification.
*   **Internationalization:** The project uses `vue-i18n` for internationalization. All user-facing strings should be added to the `src/i18n/messages.ts` file.
*   **State Management:** Pinia... (생략 없음, 전체 내용 유지)
*   **Components:** All Vue components are located in the `src/components` directory.
*   **Pages:** All pages are located in the `src/pages` directory.
*   **Layouts:** All layouts are located in the `src/layouts` directory.
*   **Types:** All TypeScript types are located in the `src/types` directory.
*   **Classes:** All classes are located in the `src/classes` directory.
*   **Composables:** All composables are located in the `src/composables` directory.
*   **Constants:** All constants are located in the `src/constants` directory.
*   **Utils:** All utility functions are located in the `src/utils` directory.
