# QCalc Project PRD (Product Requirements Document)

## 1. Product Overview

### 1.1 Product Description

QCalc is a cross-platform calculator application utilizing modern web technologies. This project reimplements a previous Android calculator's source code using contemporary web technologies.

### 1.2 Technology Stack

- Frontend: Vue 3, Quasar 2
- Language: TypeScript
- Desktop: Electron
- Mobile: Capacitor
- State Management: Pinia
- Internationalization: vue-i18n
- Math Operations: MathJS
- Currency API: freecurrencyapi-js
- Keyboard Events: tinykeys
- Markdown Rendering: qmarkdown

### 1.3 Supported Platforms

- Desktop
  - Windows
  - Linux (AppImage, Snap package support)
- Mobile
- Android (version 9/API 28 or higher, planned for Play Store distribution)
  - macOS
  - iOS

### 1.4 Key Features

- Basic Calculator Functions
- Unit Converter
- Currency Exchanger
- Base Number Converter
- Calculation History Management
- Multi-language Support (Korean, English)
- Dark Mode
- Haptic Feedback (Mobile)
- Swipe Gestures (Mobile)

## 2. Detailed Feature Requirements

### 2.1 Basic Calculator Functions

#### 2.1.1 Basic Operations

- Arithmetic Operations
  - Addition (+)
  - Subtraction (-)
  - Multiplication (×)
  - Division (÷)
- Precision
  - Accurate calculations up to 64 digits
  - Exception handling for division by zero
  - Prevention of negative square root calculations

#### 2.1.2 Advanced Operations

- Mathematical Functions
  - Square
  - Square Root
  - N-th Power
  - N-th Root
  - Factorial
  - Trigonometric Functions (sin, cos, tan)
  - Logarithmic Functions
  - Powers of 10
  - Integer Part Extraction
  - Decimal Part Extraction
- Constants Input
  - π (Pi)
  - e (Euler's number)
  - φ (Golden Ratio)
  - π/2
  - log 10
  - log 2

#### 2.1.3 Memory Functions

- Store (MS)
- Recall (MR)
- Clear (MC)
- Memory Operations
  - Add (M+)
  - Subtract (M-)
  - Multiply (M×)
  - Divide (M÷)
- Memory Operation Notifications

### 2.2 Base Number Conversion and Bit Operations

#### 2.2.1 Supported Number Systems

- Binary (Base-2)
- Octal (Base-8)
- Decimal (Base-10)
- Hexadecimal (Base-16)
- Number System Display Format Toggle (Prefix/Suffix)

#### 2.2.2 Bit Operations

- Basic Operations
  - AND
  - OR
  - XOR
  - NOT
- Extended Operations
  - NAND
  - NOR
  - XNOR
- Shift Operations
  - Left Shift (<<)
  - Right Shift (>>)
  - 4-bit Shift
  - 1-bit Shift

### 2.3 Unit Converter

#### 2.3.1 Supported Unit Categories

- Length/Distance (length)
- Area (area)
- Volume (volume)
- Weight (weight)
- Angle (angle)
- Temperature (temp)
- Energy (energy)
- Force (force)
- Time (time)
- Speed (speed)
- Pressure (pressure)
- Data Size (data)
- Frequency (frequency)
- Luminance (luminance)
- Illuminance (illuminance)
- Electric Charge (electricCharge)

#### 2.3.2 Conversion Features

- Real-time Unit Conversion
- Unit Symbol Display/Hide
- Unit Description Tooltips
- Quick Calculation Features
  - Multiplication: ×2, ×3, ×5, ×10, ×100, ×1000
  - Division: ÷2, ÷3, ÷5, ÷10, ÷100, ÷1000
  - Addition: +5, +10, +100
  - Subtraction: -5, -10, -100

### 2.4 Calculation History Management

#### 2.4.1 History Features

- Store up to 100 calculation records
- Add/Edit memos for each record
- Swipe to delete/edit individual records
- Copy calculation results
- Reuse previous calculation results
- Future Plans
  - Calculation history search function

### 2.5 User Interface

#### 2.5.1 UI/UX Features

- Dark Mode Support
- Responsive Layout
- Haptic Feedback (Mobile)
- Keyboard Shortcut Support
- Button Press Effects
- Screen Transition Effects
- Calculator Mode Tab Switching
- Mobile Swipe Gestures
  - Calculator Switching
  - Settings Open/Close
  - History Panel Open/Close

#### 2.5.2 Display Settings

- Number Grouping
  - 3 or 4 digit grouping options
  - Separator Display/Hide
- Decimal Place Limit Settings
  - No limit ~ 6 digits
- Unit/Currency Symbol Display
- Button Additional Function Display
- Button Shortcut Tooltips

#### 2.5.3 Accessibility

- ✅ ARIA Labels Implementation (Completed)
- Result Voice Output
- Calculator Voice Control
- High Contrast Mode

### 2.6 Settings and State Management

- Remember Last Used Calculator Mode
- Remember Window Size and Position
- Maintain Decimal Place Settings
- Maintain Thousand Separator Status
- Panel Reset Option on Startup

## 3. Development Environment

### 3.1 Requirements

- Node.js 20.0 or higher
- Yarn Package Manager
- VSCode(Feat. Copilot) or Cursor AI
- Android Studio (for Android builds)

### 3.2 Build Environment

- Desktop Build
  - Electron Builder
  - Linux: AppImage, Snap Package
  - Windows: Installer
- Mobile Build
  - Capacitor
  - Android Studio
  - Keystore Configuration
  - Environment Variable Setup

## 4. Security Requirements

- Content Security Policy Implementation
- API Key Security Management
  - Currency Exchange Rate API Key
  - Environment Variable Usage
- Keystore File Security
  - Android App Signing
  - Keystore Password Management

## 5. Future Development Plans

- Advertising Features (Monetization)
- Theme Functionality
- Large Tablet Layout Scale Adjustment
- Automatic Updates (electron)
- iOS App Development
- Calculation History Search Function
- Enhanced Accessibility Features

## 6. License

Distributed under the MIT License and maintained as open source.
