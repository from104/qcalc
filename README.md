# A simple calculator made using quasars

This is a simple calculator made using the source of the calculator for Android that I made as a graduation assignment in the past. It was made using vue3 (quasar v2), typescript, electron, etc.

## screenshot

![Screenshot](https://github.com/from104/qcalc/raw/main/assets/screenshot_v0.8.0.png)

## Features

- Simple arithmetic operations
- Unit conversion function
- Currency conversion function
- Copy and paste calculation results, etc.
- Records calculation results (up to 20)
- Dark mode
- Supports English and Korean
- Desktop, mobile supports (electron, capacitor, etc...)

## Shortcut Keys

### A calculator

- [0-9\.]: numbers and dots
- +, -, \*, /: addition, subtraction, multiplication, division respectively
- Enter, =: output the last calculation result
- s, \_: change sign
- p, %: calculate percentage (enter in the order of number, /(or \*), number, p (or %))
- u: square calculation
- r: square root calculation
- i: calculate the reciprocal (1/x)
- Backspace: erase each number.
- Escape, Delete, c: reset calculator
- v: reverse unit or currency target.
- b: toggle display of units or currency symbols
- h: open calculation result record (up to 20)
- d: clear calculation result record

### Other features

- Control-1: Go to calculator
- Control-2: Go to unit converter
- Control-3: Go to currency converter
- Control-Tab, ->: Go to the right calculator tab.
- Control-Shift-Tab, <-: Go to the left calculator tab.
- t: toggle always on top function
- n: toggle panel initialization on startup
- k: dark mode toggle
- ,: thousands, display
- [, ]: decimal point fixed adjustment (no limit to 6 digits)

### Clipboard

- Control-c, Control-Insert: Copy calculation result or selection to clipboard
- Control-v, Shift-Insert: Paste from clipboard into app

## Skills and information

### Technologies, frameworks, programs used

- typescript
- nodeJS
- electron
- vue 3
- quasar 2
- q-markdown
- tinykeys
- MathJS

### How to install packages

- Just download the appropriate file for the platform from the release page and install it.
- For Linux, use the appimage file alone or install the snap file using the --dangerous option.
- For Android, get the APK and install it, it should be on the Play Store soon.
- MacOS, IOS don't have a package because I don't use it and have no way to test it.

### How to test and build your app

Basically, in nodeJS and vscode environment, install yarn as follows.

```bash
npm install -g yarn
```

#### Install required modules

```bash
yarn install
```

#### Running in development mode (real-time reloading, error checking, etc.)

```bash
quasar dev -m electron
or
quasar dev -m capacitor -T android
```

#### Build the installation package [Windows]

```bash
quasar build -m electron -T {linux|win32}
or
quasar build -m capacitor -T android
```
