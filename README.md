# Simple calculator using Quasar

MIT License

This is a simple calculator made using the source code of an Android calculator that I created as a graduation project. It is designed to be usable on both desktop and mobile environments using the latest web technologies such as Vue3 (Quasar v2), TypeScript, and Electron.

## Screenshot

![Screenshot](https://github.com/from104/qcalc/raw/main/assets/screenshot_v0.9.0.png)

## Features

- Simple arithmetic operations, bitwise operations (AND, OR, XOR, NOT, etc.), memory function (MS, MR, MC, M+ ...etc)
- Unit conversion function, currency conversion function, numeral system (binary, octal, decimal, hexadecimal) conversion function
- Copy and paste calculation results, etc.
- Record calculation results (up to 100) and edit, import into calculator, add notes, etc.
- Dark mode
- English, Korean language support
- Desktop, mobile compatible (electron, capacitor, etc...)
- Support swipe function on mobile. (Switch calculator, open and close settings and history)
- Adaptive layout applied. (When the window width increases, sub-panels such as calculation history are displayed on the right)

## Shortcut keys (S: Shift, C: Control, A: Alt)

### Calculator (\*: binomial operator)

#### Basic Mode and Common

- [0-9\.]: numbers and dots
- +, -, \*, / (\*): Add, subtract, multiply, divide, respectively
- Enter, =: Output the result of the last calculation
- Backspace, C-r: Clear each character
- C-e, Escape, Delete: Reset calculator
- C-a: Replace sign
- C-s: Calculate percent (enter a number, followed by a / (or \*), followed by a number, followed by the corresponding key)
- C-{q,w,d}: Calculate squares, square roots, and reciprocals (1/x)
- CS-{q,w,a,s,d}: Computes N squares (\*), N square roots (\*), N squares to the 10th power, remainders (\*), and factorials
- S-[789]: Compute sine, cosine, and tangent
- S-[123456]: Enter Pi, phi (golden mean), e (base of log), Pi/2, log 10, log 2 constants
- S-[0\.]: Integer, extract decimal part
- S-=, S-Enter: save to memory
- SC-r: call memory
- SC-e, S-Delete, S-Escape: clear memory
- S-{+,-,\*,/}: Add, subtract, multiply, divide in memory
- A-w: Reverse unit or currency symbols, radix
- A-y: Toggle display of units or currency symbols, radix

#### Calculation Result Record

- d: Clear calculation result records
- s: Toggle the search window

#### Common for Unit and Currency Mode

- SC-a: ×2 or +5
- SC-s: ×3 or +10
- SC-d: ×5 or +100
- S-7, S-Numpad7: ÷2 or -5
- S-8, S-Numpad8: ÷3 or -10
- S-9, S-Numpad9: ÷5 or -100
- S-4, S-Numpad4: ×10
- S-5, S-Numpad5: ×100
- S-6, S-Numpad6: ×1000
- S-1, S-Numpad1: ÷10
- S-2, S-Numpad2: ÷100
- S-3, S-Numpad3: ÷1000

#### Radix Mode

- C-a: x&y (AND)
- C-s: x|y (OR)
- C-d: x^y (XOR)
- SC-d: !x (NOT)
- S-7, S-Numpad7: !(x&y) (NAND)
- S-8, S-Numpad8: !(x|y) (NOR)
- S-9, S-Numpad9: !(x^y) (XNOR)
- C-q: x<<y (right shift by y)
- C-w: x>>y (left shift by y)
- SC-q: x<<1 (right shift by 1)
- SC-w: x>>1 (left shift by 1)
- SC-a: x<<4 (right shift by 4)
- SC-s: x>>4 (left shift by 4)
- A-u: Toggle radix display format (prefix or suffix)

### Other functions

- F1: Go to Help
- F2: Go to About
- F3: Go to Settings
- F4: Go to History
- C-1: Go to Basic calculator
- C-2: Go to Unit converter
- C-3: Go to Currency converter
- C-4: Go to Radix converter
- C-Tab, ->: Go to the right calculator tab.
- CS-Tab, <-: Go to the left calculator tab.
- A-t: Always toggle the above functions
- A-i: Toggle panel initialization on startup
- A-d: Toggle dark mode
- A-p: Toggle Haptic mode
- ;: Show additional functions of the button
- ,: Display number grouping (,)
- A-,: Change number grouping unit (3 or 4)
- [, ]: Adjust decimal point fixation (no limit to 6 digits)
- "'": Activate additional functions of the button

### Clipboard

- C-c, C-Insert: Copy calculation result or selection to clipboard
- C-v, S-Insert: Paste from the clipboard into the app

### History Navigation

- ArrowUp: Scroll up 50px
- ArrowDown: Scroll down 50px
- PageUp: Scroll up 400px
- PageDown: Scroll down 400px
- Home: Scroll to top
- End: Scroll to bottom

## Techniques and information

### Technologies, frameworks, and programs used

- typescript
- nodeJS
- electron
- vue 3
- quasar 2
- markdown-it
- tinykeys
- MathJS
- freecurrencyapi-js

### How to install the package

- Grab the appropriate files for your platform from the release page and install them.
- For Linux, use the appimage file by itself or install the snap file with the --dangerous option.
- For Android, get the apk and install it, it should be on the Play Store soon.
- MacOS, IOS don't have a package because there's no way to test it without using it.

### How to test and build your app

Basically, install yarn like below in nodeJS, vscode environment.

```bash
npm install -g yarn
```

#### Install the required modules

```bash
yarn install
```

#### Run in development mode (live reloading, error checking, etc.)

```bash
quasar dev -m electron
```

or

```bash
quasar dev -m capacitor -T android
```

#### build installation package {Linux,Windows,Android}

```bash
quasar build -m electron -T {linux|win32}
```

or

```bash
quasar build -m capacitor -T android
```

Note when building ####

The currency conversion feature should work fine when using the installer from the release page, but if you build it yourself, it may not work. This is because the currency conversion data is fetched from [external site (https://freecurrencyapi.com/)](https://freecurrencyapi.com/). Get a free API key from this site and put it in the '.env' file of your project folder and build it as follows. You can renew the data 5000 times per month for free.

```plaintext
FREECURRENCY_API_KEY=<your_key>
```

### Further development in Android Studio, build procedure

#### Install and set up Android Studio

1. install the latest version of [Android Studio](https://developer.android.com/studio).
2. open Android Studio, and complete the basic settings (SDK settings, etc.).

#### Importing the Quasar project into Android Studio

1. Create an Android build by executing `quasar build -m capacitor -T android` command in the Quasar project directory.
2. Inside the `src-capacitor` directory, a `capacitor.config.json` file will be created.
3. In Android Studio, select `Open an existing Android Studio project` and open the `src-capacitor` directory.

#### Setting up an Android project

1. Once the project is open in Android Studio, click `Sync Project with Gradle Files` to synchronize the project.
2. Open the `MainActivity.java` or `MainActivity.kt` file, and verify the required packages and settings.

#### Setting up Android Keystore

For release builds, you'll need to set up a keystore. Create a `.env` file in your project root with the following variables:

```plaintext
MY_JKS_KEY_FILE=/path/to/your/keystore.jks
MY_JKS_STORE_PASSWORD=your_store_password
MY_JKS_KEY_ALIAS=your_key_alias
MY_JKS_KEY_PASSWORD=your_key_password
```

These environment variables will be used by the build process to sign your release APK. Make sure to:

- Never commit the `.env` file to version control
- Keep your keystore file secure
- Remember your keystore passwords

#### Build and run

1. Connect your Android device in USB debugging mode or run an Android emulator.
2. In Android Studio, click the `Run` button to build and run the app.

This will allow you to perform further development and builds in Android Studio.

#### Using Build Scripts

The project root includes scripts for build automation:

##### Linux/macOS Users (build.sh)

```bash
# Grant execution permission to the script
chmod +x build.sh

# Run the script
./build.sh
```

##### Windows Users (build.bat, Incomplete)

```batch
# Run in command prompt
build.bat
```

The build script automatically performs the following tasks:

- Checks project version
- Installs required dependencies
- Verifies Android development environment (for Android builds)
- Creates and cleans build directory
- Performs platform-specific builds

Important notes:

- For Android builds, the ANDROID_HOME environment variable must be properly set
- If keystore setup is required, the .env file must be properly configured
- The build script automatically checks compatibility with the installed Node.js version

### Development Environment Requirements

- Node.js 20.0 or higher
- Yarn package manager
- VSCode (with Copilot) or Cursor AI (recommended)
- Android Studio (for Android builds)
