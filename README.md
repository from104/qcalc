# QCalc - A Multi-purpose Calculator for Productivity and Accessibility

QCalc is more than just a simple calculator - it's evolving into a modern productivity tool. Built with the latest web technologies like Vue3 (Quasar v2), TypeScript, and Electron, this multi-purpose calculator is being developed into an app that's useful for real work, tasks, and learning. We're also focusing on accessibility so that users with disabilities can use it intuitively, and we're working hard to provide a helpful user experience on both desktop and mobile with a simple and clean UI.

[![Get it from the Snap Store](https://snapcraft.io/en/dark/install.svg)](https://snapcraft.io/qcalc)

## Screenshot

The calculator alone appears when the window width is reduced.

![Screenshot](https://github.com/from104/qcalc/raw/main/assets/screenshot_v0.11.4.png)

## Key Features

- **4 Professional Calculators**: Standard calculator, unit converter, currency converter, and programmer calculator meet all your calculation needs
- **High-precision Calculation Engine**: Supports accurate calculations up to 64 digits with advanced math functions like trigonometry, factorial, and powers
- **Number Base & Bit Operations**: Converts between binary/octal/decimal/hexadecimal and supports professional bit operations (AND, OR, XOR, NOT) for programmers
- **Smart User Experience**: Provides personalized environment with unit/currency favorites, various color themes, and calculation history notes
- **Cross-platform Support**: Delivers consistent experience on Windows, Linux desktop and Android mobile with automatic update support
- **Accessibility-focused Design**: Continuously improved for easy access by all users with keyboard shortcuts, haptic feedback, and adaptive layouts

## Guide to Main Features

### How to Use the 4 Calculators

#### Standard Calculator

- **How to Access**: Ctrl+1 or select the top tab
- **Basic Operations**: Enter numbers 0-9, +, -, \*, / keys
- **Advanced Functions**: Trigonometric functions (q, w, e), square (u), square root (i), constants (z: π, x: φ, c: e)
- **Memory Functions**: Ctrl+Enter (MS), Ctrl+Backspace (MR), Ctrl+Delete (MC)
- **Percentage Calculation**: 'number, /, number, %(k)' calculates percentage
- **Apply Percentage**: 'number, \*, number, %(k)' applies percentage

#### Unit Converter

- **How to Access**: Ctrl+2 or select the top tab
- **Conversion Categories**: Over 15 categories including length, area, volume, weight, angle, etc.
- **Favorites**: Set frequently used units as favorites for quick access
- **Swap Units**: Use '\\' key to swap original/converted units
- **Quick Conversion**: ×10/×100/×1000 (a/s/d), ÷10/÷100/÷1000 (z/x/c)
- **Unit Symbol**: Toggle unit symbol display/hide with Alt+\\ key

#### Currency Converter

- **How to Access**: Ctrl+3 or select the top tab
- **Latest Exchange Rates**: Reflects real-time exchange rate information
- **Favorites**: Set frequently used currencies as favorites for quick access
- **Quick Calculation**: +5/+10/+100 (f/g/h), -5/-10/-100 (q/w/e)
- **Swap Currencies**: Use '\\' key to swap original/converted currencies
- **Currency Symbol**: Toggle currency symbol display/hide with Alt+\\ key

#### Programmer Calculator

- **How to Access**: Ctrl+4 or select the top tab
- **Supported Radix**: Convert between binary, octal, decimal, and hexadecimal
- **Hexadecimal Input**: Enter A-F using z, x, c, a, s, d keys
- **Swap Radix**: Use '\\' key to swap original/converted radix
- **Radix Symbol**: Toggle unit symbol display/hide with Alt+\\ key
- **Symbol Position**: Toggle unit symbol position (front/back) with Alt+Ctrl+\\ key

### How to Use Productivity Features

#### Calculation History Management

- **How to Access**: F4 key or side menu
- **Scroll**: Move 50px with ↑/↓ keys, 400px with Page Up/Down
- **Search/Delete**: Search with Ctrl+F, delete history with Ctrl+D
- **Add Notes**: Add notes to individual records
- **Left Swipe (Mobile)**: Add/edit notes
- **Right Swipe (Mobile)**: Delete records

#### Number Display Settings

- **Show/Hide Separator**: Toggle with , key
- **Set Grouping Unit**: Change between 3/4 digits with Alt+, key
- **Decimal Places**: Adjust with [, ] keys (unlimited~16 digits)

#### Using Shortcuts

- **Shift Mode**: Activate with ' key to access advanced functions
- **Tab Navigation**: Move between tabs with Ctrl+Tab (→), Ctrl+Shift+Tab (←)
- **Screen Switch**: F1 (Help), F2 (Info), F3 (Settings), F4 (History), F5 (Tips)

#### Copy & Paste

- **Copy Main Panel**: Ctrl+C, Ctrl+Insert
- **Copy Sub Panel**: Shift+Ctrl+C, Alt+Ctrl+Insert
- **Paste to Main Panel**: Ctrl+V, Shift+Insert
- **Paste to Sub Panel**: Shift+Ctrl+V, Alt+Shift+Insert
- **Open Menu**: Click the panel and use the menu to copy/paste

### **Tips for Expert Tools**

#### Math Functions

- **N-th Power/N-th Root**: Calculate with r/t keys
- **Trigonometric Functions**: q/w/e keys in shift mode
- **Extract Integer/Decimal**: Calculate with v/b keys
- **Factorial**: Calculate with h key

#### Using Memory

- **Store & Recall Memory**: Store (MS) and recall (MR) after calculation
- **Memory Calculation**: Accumulate values with M+, M-, M×, M÷ functions
- **Clear Memory**: Clear memory with MC
- **Memory Status**: Click the memory icon on the main panel

#### Using Bit Operations

- **Bit Operations**: AND (j), OR (k), XOR (l), NOT (h), shift operations (r/t/u/i)
- **Logic Extension**: Use NAND/NOR/XNOR operations with q/w/e keys
- **Shift Operations**: Move bit positions by 1 bit/4 bits
- **Set Bit Size**: Bit operations according to the set size

### **Optimizing User Experience**

#### Screen Layout

- **Theme System**: Choose from various color themes beyond dark/light mode (change in F3 Settings)
- **Always on Top**: Toggle always-on-top with Alt+t key
- **Resize Window**: Side panel auto-adjusts based on window size
- **Reset Panel**: Toggle panel reset at startup with Alt+i key
- **(De)activate Dark Mode**: Switch dark mode with Alt+d key

#### Mobile Support

- **Swipe**: Switch calculator modes by swiping left or right
- **(De)activate Haptic Mode**: Toggle haptic mode with Alt+p key
- **Tablet Landscape Mode**: Side panel auto-adjusts in tablet landscape mode

## Shortcut Keys (S: Shift, C: Control, A: Alt)

### Basic Calculator and Common Functions

| Shortcut    | Function                  |
| ----------- | ------------------------- |
| 0-9\.       | Enter numbers and decimal |
| +, -, \*, / | Basic arithmetic          |
| Enter, =    | Calculate result          |
| Backspace   | Delete one character      |
| Delete      | Reset calculator          |
| u           | Square (x²)               |
| i           | Square root (√x)          |
| j           | Change sign (±)           |
| k, %        | Percentage (%)            |
| l           | Reciprocal (1/x)          |
| '           | Activate shift mode       |

### Advanced Math Functions (Shift Mode)

| Shortcut | Function                    |
| -------- | --------------------------- |
| r        | Power (xⁿ)                  |
| t        | Root (ⁿ√x)                  |
| f        | Power of 10 (10ⁿ)           |
| g        | Modulo (x%y)                |
| h        | Factorial (x!)              |
| q,w,e    | Trig (sin, cos, tan)        |
| a,s,d    | Constants (Pi/2, ln10, ln2) |
| z,x,c    | Constants (Pi, phi, e)      |
| v        | Integer part                |
| b        | Fractional part             |

### Memory Operations

| Shortcut          | Function             |
| ----------------- | -------------------- |
| C-Delete          | Memory clear (MC)    |
| C-Backspace       | Memory recall (MR)   |
| C-Enter, C-=      | Memory store (MS)    |
| C-+, C-Numpad +   | Memory add (M+)      |
| C--, C-Numpad -   | Memory subtract (M-) |
| C-\*, C-Numpad \* | Memory multiply (M×) |
| C-/, C-Numpad /   | Memory divide (M÷)   |

### Unit/Currency Conversion Mode (Shift Mode)

| Shortcut | Function                     |
| -------- | ---------------------------- |
| f,g,h    | ×2/×3/×5 or +5/+10/+100      |
| q,w,e    | ÷2/÷3/÷5 or -5/-10/-100      |
| a,s,d    | ×10/×100/×1000               |
| z,x,c    | ÷10/÷100/÷1000               |
| \        | Swap source and target       |
| A-\      | Toggle unit/currency display |

### Radix Converter Mode

| Shortcut | Function                         |
| -------- | -------------------------------- |
| r,t      | 1-bit shift (x<<1, x>>1)         |
| u,i      | Left/right shift (x<<y, x>>y)    |
| f,g      | 4-bit shift (x<<4, x>>4)         |
| h        | NOT operation                    |
| j,k,l    | Bit operations (AND, OR, XOR)    |
| q,w,e    | NAND, NOR, XNOR                  |
| z,x,c    | Hex input (A, B, C)              |
| a,s,d    | Hex input (D, E, F)              |
| \        | Swap source and target           |
| A-\      | Toggle radix display             |
| AC-\     | Toggle radix position (pre/post) |

### Screen Navigation and UI Control

| Shortcut  | Function               |
| --------- | ---------------------- |
| F1        | Help                   |
| F2        | About                  |
| F3        | Settings               |
| F4        | History                |
| F5        | Tips                   |
| C-[1234]  | Switch calculator tabs |
| C-Tab, →  | Move to right tab      |
| CS-Tab, ← | Move to left tab       |
| Escape    | Close current screen   |

### UI Settings

| Shortcut | Function                     |
| -------- | ---------------------------- |
| A-t      | Toggle always on top         |
| A-i      | Toggle init panel on startup |
| A-d      | Toggle dark mode             |
| A-p      | Toggle haptic mode           |
| ,        | Toggle number grouping       |
| A-,      | Change grouping unit (3/4)   |
| [, ]     | Adjust decimal places (∞~16) |
| q        | Quit application             |

### Clipboard Operations

| Shortcut        | Function               |
| --------------- | ---------------------- |
| C-c, C-Insert   | Copy main panel result |
| SC-c, AC-Insert | Copy sub panel result  |
| C-v, S-Insert   | Paste to main panel    |
| SC-v, AS-Insert | Paste to sub panel     |

### History Navigation

| Shortcut        | Function             |
| --------------- | -------------------- |
| ↑/↓             | Scroll 50px up/down  |
| PageUp/PageDown | Scroll 400px up/down |
| Home/End        | Scroll to top/bottom |

## Installation Guide

- Download and install the appropriate file for your platform from the release page.
- Windows installer and Linux AppImage files support automatic updates.
- For Linux, use the AppImage file standalone or install with `sudo snap install --beta qcalc`.
- For Android, install the provided APK. Coming soon to Play Store.
- MacOS and iOS packages are not available due to lack of testing capabilities.

## Developer Information

For detailed development and build instructions, please refer to [DEVELOP.md](DEVELOP.md).
