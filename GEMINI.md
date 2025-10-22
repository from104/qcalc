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

## Development Conventions

*   **Code Style:** The project uses Prettier for code formatting and ESLint for linting.
*   **Testing:** The project uses Jest for unit testing.
*   **Commits:** The project follows the Conventional Commits specification.
*   **Internationalization:** The project uses `vue-i18n` for internationalization. All user-facing strings should be added to the `src/i18n/messages.ts` file.
*   **State Management:** The project uses Pinia for state management. All stores are located in the `src/stores` directory.
*   **Components:** All Vue components are located in the `src/components` directory.
*   **Pages:** All pages are located in the `src/pages` directory.
*   **Layouts:** All layouts are located in the `src/layouts` directory.
*   **Types:** All TypeScript types are located in the `src/types` directory.
*   **Classes:** All classes are located in the `src/classes` directory.
*   **Composables:** All composables are located in the `src/composables` directory.
*   **Constants:** All constants are located in the `src/constants` directory.
*   **Utils:** All utility functions are located in the `src/utils` directory.
