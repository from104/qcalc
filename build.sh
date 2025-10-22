#!/bin/bash

# 스크립트 오류 발생 시 즉시 종료
set -e
# 정의되지 않은 변수 사용 시 오류 발생
set -u
# 파이프라인의 명령 중 하나라도 실패하면 전체 파이프라인 실패
set -o pipefail

# 버전 체크 함수
check_versions() {
    echo "Checking Node.js and Yarn versions..."

    # Node.js 설치 확인
    if ! command -v node &> /dev/null; then
        echo "Error: Node.js is not installed."
        echo "Please install Node.js from https://nodejs.org."
        exit 1
    fi

    # Yarn 설치 확인
    if ! command -v yarn &> /dev/null; then
        echo "Error: Yarn is not installed."
        echo "Please install Yarn using 'npm install -g yarn'."
        exit 1
    fi

    # Node.js 버전 체크 (package.json의 engines.node 참조)
    REQUIRED_NODE_VERSION=$(grep -oP '(?<="node": ")[^"]+' package.json | sed 's/[^0-9.]//g')
    CURRENT_NODE_VERSION=$(node -v | cut -d'v' -f2)

    if [ -z "$REQUIRED_NODE_VERSION" ]; then
        echo "Warning: Node.js required version not found in package.json. Skipping Node.js version check."
    elif ! printf '%s\n' "$REQUIRED_NODE_VERSION" "$CURRENT_NODE_VERSION" | sort -V -C; then
        echo "Error: Node.js version $REQUIRED_NODE_VERSION or higher is required."
        echo "Current version: $CURRENT_NODE_VERSION"
        exit 1
    fi

    # Yarn 버전 체크 (package.json의 engines.yarn 참조)
    REQUIRED_YARN_VERSION=$(grep -oP '(?<="yarn": ")[^"]+' package.json | sed 's/[^0-9.]//g')
    CURRENT_YARN_VERSION=$(yarn -v)

    if [ -z "$REQUIRED_YARN_VERSION" ]; then
        echo "Warning: Yarn required version not found in package.json. Skipping Yarn version check."
    elif ! printf '%s\n' "$REQUIRED_YARN_VERSION" "$CURRENT_YARN_VERSION" | sort -V -C; then
        echo "Error: Yarn version $REQUIRED_YARN_VERSION or higher is required."
        echo "Current version: $CURRENT_YARN_VERSION"
        exit 1
    fi

    echo "Node.js and Yarn versions are sufficient."
}

# Wine 설치 확인 및 설치 안내 함수
check_wine() {
    if ! command -v wine &> /dev/null; then
        echo "Error: Wine is not installed."
        echo "To build for Windows, Wine is required. Please install it using your distribution's package manager."
        echo "For Debian/Ubuntu-based systems, you can use:"
        echo "  sudo dpkg --add-architecture i386"
        echo "  sudo apt update"
        echo "  sudo apt install -y wine64 wine32"
        exit 1
    fi
}

# Android Studio 환경 체크 함수
check_android_env() {
    echo "Checking Android environment variables..."
    if [ -z "${ANDROID_HOME:-}" ]; then
        echo "Error: ANDROID_HOME environment variable is not set."
        echo "Please install Android Studio and set ANDROID_HOME in your environment."
        echo "Example: export ANDROID_HOME=\$HOME/Android/Sdk"
        exit 1
    fi

    if [ ! -d "$ANDROID_HOME/platform-tools" ]; then
        echo "Error: Android SDK platform-tools not found at $ANDROID_HOME/platform-tools."
        echo "Please install platform-tools using Android Studio SDK Manager."
        exit 1
    fi

    if [ ! -d "$ANDROID_HOME/build-tools" ]; then
        echo "Error: Android SDK build-tools not found at $ANDROID_HOME/build-tools."
        echo "Please install build-tools using Android Studio SDK Manager."
        exit 1
    fi
    echo "Android environment is set up correctly."
}

# .env 파일 로드
load_env() {
    if [ -f .env ]; then
        echo "Loading environment variables from .env file..."
        # shellcheck disable=SC2046
        export $(grep -v '^#' .env | xargs)
    else
        echo "No .env file found. Skipping environment variable loading."
    fi
}

# 빌드 디렉토리 설정
BUILD_DIR="./package"

# 버전 정보 추출
VERSION=$(grep -oP '(?<="version": ")[^"]+' package.json)
if [ -z "$VERSION" ]; then
    echo "Error: Could not extract version from package.json."
    exit 1
fi
echo "Building version $VERSION..."

# 빌드 전 환경 체크
check_versions
load_env

# 필요한 모듈 설치
echo "Installing dependencies..."
yarn install --immutable --check-cache

# 빌드 디렉토리 생성
echo "Creating build directory: $BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Linux 빌드 함수
build_linux() {
    echo "Building Linux version..."
    quasar build -m electron -T linux

    echo "Linux build completed. Moving artifacts..."
    # AppImage 파일 이동
    find dist/electron/Packaged -name "*.AppImage" -exec mv {} "$BUILD_DIR/QCalc-$VERSION-linux.AppImage" \; || true
    # snap 파일 이동
    find dist/electron/Packaged -name "*.snap" -exec mv {} "$BUILD_DIR/QCalc-$VERSION-linux.snap" \; || true
    # latest-linux.yml 파일 복사
    if [ -f dist/electron/Packaged/latest-linux.yml ]; then
        cp dist/electron/Packaged/latest-linux.yml "$BUILD_DIR/latest-linux.yml"
    fi
}

# Windows 빌드 함수
build_windows() {
    echo "Building Windows version..."
    check_wine
    export WINEARCH=win64
    export WINEPREFIX=~/.wine64

    quasar build -m electron -T win32

    echo "Windows build completed. Moving artifacts..."
    mv dist/electron/Packaged/*.exe "$BUILD_DIR/QCalc-$VERSION-win.exe"
    # latest.yml 파일 복사
    cp dist/electron/Packaged/latest.yml "$BUILD_DIR/latest.yml"
}

# Android 빌드 함수
build_android() {
    echo "Building Android version..."
    check_android_env

    quasar build -m capacitor -T android

    echo "Android build completed. Signing and moving APK..."

    # .env 파일에서 MY_JKS_KEY_FILE 가져오기 (기본값 설정)
    MY_JKS_KEY_FILE="${MY_JKS_KEY_FILE:-src-capacitor/android/app/my-release-key.jks}"

    if [ ! -f "$MY_JKS_KEY_FILE" ]; then
        echo "Warning: Keystore file not found at $MY_JKS_KEY_FILE."
        echo "Android app will be unsigned. To sign, provide MY_JKS_KEY_FILE in .env or ensure the default path is correct."
        # 서명되지 않은 APK 이동 (있는 경우)
        find src-capacitor/android/app/build/outputs/apk/debug -name "app-debug.apk" -exec cp {} "$BUILD_DIR/QCalc-$VERSION-android-debug.apk" \; || true
    else
        echo "Building signed APK..."
        (cd src-capacitor/android && ./gradlew assembleRelease)
        cp src-capacitor/android/app/build/outputs/apk/release/app-release.apk "$BUILD_DIR/QCalc-$VERSION-android.apk"
    fi
}

# 인수 처리
BUILD_TYPE=${1:-all} # 인수가 없으면 'all'을 기본값으로 사용

case "$BUILD_TYPE" in
    "all")
        build_linux
        build_windows
        build_android
        ;;
    "linux")
        build_linux
        ;;
    "win")
        build_windows
        ;;
    "android")
        build_android
        ;;
    *)
        echo "Invalid build type. Available options: all, linux, win, android"
        exit 1
        ;;
esac

echo "Build process finished successfully!"
echo "You can find the build files in the $BUILD_DIR directory."
