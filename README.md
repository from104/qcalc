A simple calculator made using quasars

This is a simple calculator made using the source of the calculator for Android that I made as a graduation assignment in the past. It was made using vue3 (quasar v2), typescript, electron, etc.

## screenshot

![Screenshot](https://github.com/from104/qcalc/raw/main/assets/screenshot%20v0.6.1.png)

## function

- Four arithmetic operations and percent calculation
- Reciprocal, square, square root calculation
- Unit conversion function
- All functions operated with mouse and keyboard.
- Copy and paste calculation results, etc.
- Toggle window always on top
- Thousand comma display
- Fixed digits below the decimal point (no limit to 6 digits)
- Records calculation results (up to 20)
- dark mode
- Supports English and Korean

## Shortcut Keys

### A calculator

- [0-9\.]: numbers and dots
- +, -, \*, /: addition, subtraction, multiplication, division respectively
- Enter, =: output the last calculation result
- s, \_: change sign
- p, %: Calculate percentage (enter in the order of number, /, number, p (or %))
- u: square calculation
- r: square root calculation
- i: Calculate the reciprocal (1/x)
- Backspace: Erase each Korean character
- Escape, Delete, c: Reset calculator
- v: open units conversion panel
- Shift-v: Reverse unit target.
- h: open calculation result record (up to 20)
- d: clear calculation result record

### Other features

- m: open and close the left menu
- e: open and close right settings
- F1: Open Help
- F2: open calculator
- F3: Open app info
- t: toggle always on top function
-k: dark mode toggle
- ,: Thousands, display
- [, ]: Decimal point fixed adjustment (no limit to 6 digits)

### Clipboard

- Control-c, Control-Insert: Copy calculation result or selection to clipboard
- Control-v, Shift-Insert: Paste from clipboard into app

# Skills and information

## Technologies, frameworks, programs used

- typescript
- nodeJS
- electron
- vue 3
- quasar 2
- q-markdown
- tinykeys

## How to install packages

- Just download the appropriate file for the platform from the release page and install it.
- For Linux, use the appimage file alone or install the snap file using the --dangerous option.
- MacOS does not have a package because there is no way to test it without using it.

## How to test and build your app

Basically, in nodeJS and vscode environment, install yarn as follows.

```bash
npm install -g yarn
```

### Install required modules

```bash
yarn install
```

### Running in development mode (real-time reloading, error checking, etc.)

```bash
quasar dev -m electron
```

### Build the installation package [Windows]

```bash
quasar build -m electron [-T win32]
```
