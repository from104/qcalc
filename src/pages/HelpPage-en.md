# Functions and usage

## Features

- Simple arithmetic operations, bitwise operations (AND, OR, XOR, NOT, etc.), memory function (MS, MR, MC, M+ ...etc)
- Unit conversion function, currency conversion function, numeral system (binary, octal, decimal, hexadecimal) conversion function
- Copy and paste calculation results, etc.
- Record calculation results (up to 100) and edit, import into calculator, add notes, etc.
- Dark mode
- English, Korean language support
- Desktop, mobile compatible (electron, capacitor, etc...)
- Support swipe function on mobile. (Switch calculator, open and close settings and history)

## Shortcut keys (S: Shift, C: Control, A: Alt)

### Calculator (\*: binomial operator)

- [0-9\.]: numbers and dots
- +, -, \*, / (\*): Add, subtract, multiply, divide, respectively
- Enter, =: Output the result of the last calculation
- Backspace: Clear each character
- C-e, Escape, Delete: Reset calculator
- C-a: Replace sign
- C-s: Calculate percent (enter a number, followed by a / (or \*), followed by a number, followed by the corresponding key)
- C-{q,w,d}: Calculate squares, square roots, and reciprocals (1/x)
- CS-{q,w,a,s,d}: Computes N squares (\*), N square roots (\*), N squares to the 10th power, remainders (\*), and factorials
- S-[789]: Compute sine, cosine, and tangent
- S-[123456]: Enter Pi, phi (golden mean), e (base of log), Pi/2, log 10, log 2 constants
- S-[0\.]: Integer, extract decimal part
- S-=, S-Enter: save to memory
- CS-r: call memory
- CS-e, S-Delete, S-Escape: clear memory
- S-{+,-,*,/}: Add, subtract, multiply, divide in memory
- A-w: Reverse unit or currency symbols.
- A-y: Toggle display of units or currency symbols
- A-h: Open the history of calculation results (up to 100)
- d: Clear calculation result history

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
- CA-y: Toggle radix display format (prefix or suffix)

### Other functions

- C-1: Go to Basic calculator
- C-2: Go to Unit converter
- C-3: Go to Currency converter
- C-4: Go to Radix converter
- C-Tab,  ->: Go to the right calculator tab.
- CS-Tab, <-: Go to the left calculator tab.
- A-t: Always toggle the above functions
- A-i: toggle panel initialization on startup
- A-d: Toggle dark mode
- ;: Show additional functions of the button
- ,: Display number grouping (,)
- C-,: Change number grouping unit (3 or 4)
- [, ]: Adjust decimal point fixation (no limit to 6 digits)
- "'": Activate additional functions of the button

### Clipboard

- C-c, C-Insert: Copy calculation result or selection to clipboard
- C-v, S-Insert: Paste from the clipboard into the app
