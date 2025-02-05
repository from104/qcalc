# QCalc Development Guide

This document provides a detailed guide to the development and build process of QCalc.

## Technology Stack

### Core Framework

- Vue 3 + TypeScript
- Quasar 2 (UI framework)
- Electron (desktop app)
- Capacitor (mobile app)

### Key libraries

- MathJS (high precision math operations)
- freecurrencyapi-js (real-time currency exchange rate data)
- tinykeys (keyboard shortcuts)
- markdown-it (Markdown rendering)
- electron-updater (automatic updates)

### Development Tools

- Node.js 20.0 or later
- Yarn package manager
- VSCode + Copilot or Cursor AI
- Android Studio (for Android builds)

## Getting started with development

### 1. Basic setup

Install node.js according to your platform (Linux, Windows, etc.).

#### yarn global install

```bash
npm install -g yarn
```bash npm install -g yarn

#### Install project dependencies

```bash
yarn install
```

### 2. Set up environment variables

Create an `.env` file in the root of your project:

```plaintext
# Currency exchange API key (required)
FREECURRENCY_API_KEY=<your_api_key>
# Android keystore settings (required when building Android)
MY_JKS_KEY_FILE=/path/to/keystore.jks
MY_JKS_STORE_PASSWORD=store_password
MY_JKS_KEY_ALIAS=key_alias
MY_JKS_KEY_PASSWORD=key_password
```

## Run development mode

### Develop a desktop app

```bash
quasar dev -m electron
```

### Develop an Android app

```bash
quasar dev -m capacitor -T android
```

## Build process

### Build a desktop app

#### Windows

```bash
quasar build -m electron -T win32
```bash quasar build -m electron -T win32

#### Linux

```bash
quasar build -m electron -T win32
```

### Build an Android app

```bash
quasar build -m capacitor -T android
```

## Notes on building

The currency conversion feature should work fine when using the installer from the release page, but if you build it yourself, it may not work. This is because the currency conversion data is fetched from [external site (https://freecurrencyapi.com/)](https://freecurrencyapi.com/). Get a free API key from this site and put it in the '.env' file of your project folder and build it like this. You can renew the data 5000 times per month for free.

```plaintext
FREECURRENCY_API_KEY=<your_key>
```

## Development in Android Studio

### Install and set up Android Studio

1. Install the latest version of [Android Studio](https://developer.android.com/studio).
2. open Android Studio, and complete basic settings (SDK settings, etc.).

### Import Quasar project into Android Studio

1. Create an Android build by running the command `quasar build -m capacitor -T android` in the Quasar project directory.
2. Inside the `src-capacitor` directory, a `capacitor.config.json` file is created.
3. In Android Studio, select `Open an existing Android Studio project` and open the `src-capacitor` directory.

### Setting up an Android project

1. Once the project is open in Android Studio, click `Sync Project with Gradle Files` to synchronize the project.
2. Open the `MainActivity.java` or `MainActivity.kt` file, and check the required packages and settings.

### Setting up the Android keystore

To build a release, you need to set up the keystore. Create an `.env` file in the root of your project and add the following variables:

```plaintext
MY_JKS_KEY_FILE=/path/to/your/keystore.jks
MY_JKS_STORE_PASSWORD=your_store_password
MY_JKS_KEY_ALIAS=your_key_alias
MY_JKS_KEY_PASSWORD=your_key_password
```

These environment variables are used during the build process to sign the release APK. Make sure to keep the following in mind

- Never commit your `.env` files to version control.
- Keep your keystore files safe
- Memorize your keystore password

### Build and run

1. Connect your Android device to USB debugging mode or run an Android emulator.
2. Click the `Run` button in Android Studio to build and run the app.

## Automated Build Script

The project root contains scripts for automating builds:

### Linux users (build.sh)

```bash
# Grant the script execute permissions
chmod +x build.sh

# Run the script
./build.sh
```

### Windows user (build.bat, incomplete)

```batch
# Run from a command prompt
build.bat
```

The build script automatically performs the following tasks

- Check the project version
- Install necessary dependencies
- Check the Android development environment (when building Android)
- Create and organize the build directory
- Perform platform-specific builds

## Precautions

1. **Secure your API key
   - Never commit `.env` files to Git
   - Verify your API key settings before production builds

2. **Android Development
   - ANDROID_HOME environment variable must be set
   - Set up keystore (release builds)
   - Enable USB debugging mode (for real device testing)

3. **Automatic Updates
   - Disable automatic updates for Linux Snap packages
   - Only simulate updates in development mode

## Accessibility Guidelines

Currently implemented accessibility features:

- ARIA labels
- Haptic feedback (mobile)

Feature under development:

- Voice output of results
- Voice commands
- High contrast mode

## Support and inquiries

For development questions: Kihyun Seo <from104@gmail.com>

Translated with DeepL.com (free version)
